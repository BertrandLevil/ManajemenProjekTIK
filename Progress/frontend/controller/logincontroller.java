import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.stream.Collectors;

public class LoginController {

    // 1. Method Utama Controller untuk Verifikasi Login dengan Query SQL ke tabel `pengguna`
    public User loginWithQuery(String email, String passwordInput) throws SQLException {
        // Query SQL disesuaikan dengan struktur tabel `pengguna` pada database `comicid`
        String sql = "SELECT id_pengguna, username, email, password, role, is_premium "
                   + "FROM pengguna WHERE LOWER(email) = LOWER(?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);

            try (ResultSet rs = stmt.executeQuery()) {
                // Jika baris tidak ditemukan -> Email belum terdaftar
                if (!rs.next()) {
                    return null; 
                }

                String dbPassword = rs.getString("password");

                // Jika password tidak cocok -> Kembalikan objek penanda password salah
                if (!dbPassword.equals(passwordInput)) {
                    throw new IllegalArgumentException("Password salah.");
                }

                // Jika email & password cocok -> Instansiasi objek berdasarkan role di database
                int idPengguna = rs.getInt("id_pengguna");
                String username = rs.getString("username");
                String dbEmail = rs.getString("email");
                String role = rs.getString("role"); // Enum: 'Pembaca', 'Kreator', 'Admin'
                boolean isPremium = rs.getInt("is_premium") == 1;

                User loggedInUser;
                switch (role) {
                    case "Admin":
                        loggedInUser = new Admin(username, dbEmail, dbPassword, idPengguna);
                        break;
                    case "Kreator":
                        loggedInUser = new Author(username, dbEmail, dbPassword, "-");
                        break;
                    default:
                        Pembaca pembaca = new Pembaca(username, dbEmail, dbPassword);
                        // Set status premium sesuai database jika diperlukan
                        loggedInUser = pembaca;
                        break;
                }

                // Set status login pada model User
                loggedInUser.login(dbEmail, dbPassword);
                return loggedInUser;
            }
        }
    }

    // 2. HTTP Handler untuk menjembatani Front-End JS (frontLogin) dengan Controller Java
    public static class LoginHttpHandler implements HttpHandler {
        private final LoginController controller = new LoginController();

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Mengizinkan akses dari Front-End (CORS Policy)
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
            exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, "{\"success\":false,\"message\":\"Method tidak diizinkan.\"}");
                return;
            }

            // Membaca body JSON dari request front-end: {"email":"...","password":"..."}
            String body = new BufferedReader(
                    new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8))
                    .lines().collect(Collectors.joining("\n"));

            String email = extractJsonValue(body, "email").trim();
            String password = extractJsonValue(body, "password");

            // Validasi Server-Side yang disamakan dengan validasi Front-End Anda
            if (email.isEmpty() && password.isEmpty()) {
                sendJson(exchange, 400, "{\"success\":false,\"message\":\"Form login wajib diisi.\"}");
                return;
            }
            if (email.isEmpty()) {
                sendJson(exchange, 400, "{\"success\":false,\"message\":\"Email wajib diisi.\"}");
                return;
            }
            if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                sendJson(exchange, 400, "{\"success\":false,\"message\":\"Format email tidak valid.\"}");
                return;
            }
            if (password.isEmpty()) {
                sendJson(exchange, 400, "{\"success\":false,\"message\":\"Password wajib diisi.\"}");
                return;
            }
            if (password.length() < 8) {
                sendJson(exchange, 400, "{\"success\":false,\"message\":\"Password minimal 8 karakter.\"}");
                return;
            }

            // Eksekusi Query Database melalui LoginController
            try {
                User user = controller.loginWithQuery(email, password);

                if (user == null) {
                    sendJson(exchange, 404, "{\"success\":false,\"message\":\"Email tidak terdaftar.\"}");
                    return;
                }

                // Menentukan role untuk dikirim ke Front-End
                String role = (user instanceof Admin) ? "Admin" : (user instanceof Author) ? "Kreator" : "Pembaca";

                String jsonResponse = String.format(
                    "{\"success\":true,\"message\":\"Login berhasil!\",\"email\":\"%s\",\"username\":\"%s\",\"role\":\"%s\"}",
                    user.getEmail(), user.getUsername(), role
                );
                sendJson(exchange, 200, jsonResponse);

            } catch (IllegalArgumentException e) {
                // Menangkap kondisi "Password salah."
                sendJson(exchange, 401, "{\"success\":false,\"message\":\"" + e.getMessage() + "\"}");
            } catch (SQLException e) {
                e.printStackTrace();
                sendJson(exchange, 500, "{\"success\":false,\"message\":\"Terjadi kesalahan koneksi database.\"}");
            }
        }

        private void sendJson(HttpExchange exchange, int statusCode, String response) throws IOException {
            byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(statusCode, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }

        // Helper sederhana untuk mengekstrak field dari JSON tanpa library tambahan
        private String extractJsonValue(String json, String key) {
            String pattern = "\"" + key + "\"\\s*:\\s*\"([^\"]*)\"";
            java.util.regex.Matcher matcher = java.util.regex.Pattern.compile(pattern).matcher(json);
            return matcher.find() ? matcher.group(1) : "";
        }
    }

    // 3. Main Method untuk Menjalankan Server Backend pada Port 8080
    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/api/login", new LoginHttpHandler());
        server.setExecutor(null);
        System.out.println("Server Backend ComicID berjalan di http://localhost:8080/api/login");
        server.start();
    }
}