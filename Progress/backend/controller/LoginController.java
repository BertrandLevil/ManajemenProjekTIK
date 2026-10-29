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
import java.sql.Statement;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class LoginController {

    // =========================================================
    // 1. Method Utama Controller: Login (Verifikasi Akun Pengguna)
    // =========================================================
    public User loginWithQuery(String emailOrUsername, String passwordInput) throws SQLException {
        // Mendukung login menggunakan Email ataupun Username
        String sql = "SELECT id_pengguna, username, email, password, role, is_premium "
                + "FROM pengguna WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)";

        try (Connection conn = DatabaseConnection.getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, emailOrUsername);
            stmt.setString(2, emailOrUsername);

            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    return null; // Akun belum terdaftar
                }

                String dbPassword = rs.getString("password");
                if (!dbPassword.equals(passwordInput)) {
                    throw new IllegalArgumentException("Password salah.");
                }

                int idPengguna = rs.getInt("id_pengguna");
                String username = rs.getString("username");
                String dbEmail = rs.getString("email");
                String role = rs.getString("role"); // 'Pembaca', 'Kreator', 'Admin'
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
                        loggedInUser = pembaca;
                        break;
                }

                loggedInUser.login(dbEmail, dbPassword);
                return loggedInUser;
            }
        }
    }

    // =========================================================
    // 2. Method Utama Controller: Register (Registrasi Akun Baru)
    // =========================================================
    public boolean registerWithQuery(String username, String email, String password, String role) throws SQLException {
        // Cek apakah username sudah dipakai
        String checkUserSql = "SELECT id_pengguna FROM pengguna WHERE LOWER(username) = LOWER(?)";
        try (Connection conn = DatabaseConnection.getConnection();
            PreparedStatement checkStmt = conn.prepareStatement(checkUserSql)) {
            checkStmt.setString(1, username);
            try (ResultSet rs = checkStmt.executeQuery()) {
                if (rs.next()) {
                    throw new IllegalArgumentException("Nama pengguna sudah digunakan.");
                }
            }
        }

        // Cek apakah email sudah terdaftar
        String checkEmailSql = "SELECT id_pengguna FROM pengguna WHERE LOWER(email) = LOWER(?)";
        try (Connection conn = DatabaseConnection.getConnection();
            PreparedStatement checkStmt = conn.prepareStatement(checkEmailSql)) {
            checkStmt.setString(1, email);
            try (ResultSet rs = checkStmt.executeQuery()) {
                if (rs.next()) {
                    throw new IllegalArgumentException("Email sudah terdaftar.");
                }
            }
        }

        // Default role: Pembaca jika tidak ditentukan
        String finalRole = (role != null && !role.trim().isEmpty()) ? role : "Pembaca";
        int isPremium = 0;

        // Instansiasi model sesuai class diagram untuk mencatat logika bisnis
        Pembaca pembacaBaru = new Pembaca(username, email, password);
        pembacaBaru.register();

        // Simpan ke database `pengguna`
        String insertSql = "INSERT INTO pengguna (username, email, password, role, is_premium) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement insertStmt = conn.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
            insertStmt.setString(1, username);
            insertStmt.setString(2, email);
            insertStmt.setString(3, password);
            insertStmt.setString(4, finalRole);
            insertStmt.setInt(5, isPremium);

            int affectedRows = insertStmt.executeUpdate();
            return affectedRows > 0;
        }
    }

    // =========================================================
    // 3. HTTP Handler untuk Login (/api/login)
    // =========================================================
    public static class LoginHttpHandler implements HttpHandler {
        private final LoginController controller = new LoginController();

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCORSHeaders(exchange);

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, "{\"success\":false,\"message\":\"Method tidak diizinkan.\"}");
                return;
            }

            String body = readRequestBody(exchange);
            String email = extractJsonValue(body, "email").trim();
            String password = extractJsonValue(body, "password");

            if (email.isEmpty() && password.isEmpty()) {
                sendJson(exchange, 400, "{\"success\":false,\"message\":\"Form login wajib diisi.\"}");
                return;
            }
            if (email.isEmpty()) {
                sendJson(exchange, 400, "{\"success\":false,\"message\":\"Email/Username wajib diisi.\"}");
                return;
            }
            if (password.isEmpty()) {
                sendJson(exchange, 400, "{\"success\":false,\"message\":\"Password wajib diisi.\"}");
                return;
            }

            try {
                User user = controller.loginWithQuery(email, password);

                if (user == null) {
                    sendJson(exchange, 404, "{\"success\":false,\"message\":\"Email atau username tidak terdaftar.\"}");
                    return;
                }

                String role = (user instanceof Admin) ? "Admin" : (user instanceof Author) ? "Kreator" : "Pembaca";

                String jsonResponse = String.format(
                    "{\"success\":true,\"message\":\"Login berhasil!\",\"email\":\"%s\",\"username\":\"%s\",\"role\":\"%s\"}",
                    escapeJson(user.getEmail()),
                    escapeJson(user.getUsername()),
                    role
                );
                sendJson(exchange, 200, jsonResponse);

            } catch (IllegalArgumentException e) {
                sendJson(exchange, 401, "{\"success\":false,\"message\":\"" + escapeJson(e.getMessage()) + "\"}");
            } catch (SQLException e) {
                e.printStackTrace();
                sendJson(exchange, 500, "{\"success\":false,\"message\":\"Terjadi kesalahan koneksi database: " + escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    // =========================================================
    // 4. HTTP Handler untuk Register (/api/register)
    // =========================================================
    public static class RegisterHttpHandler implements HttpHandler {
        private final LoginController controller = new LoginController();

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCORSHeaders(exchange);

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, "{\"success\":false,\"message\":\"Method tidak diizinkan.\"}");
                return;
            }

            String body = readRequestBody(exchange);
            String username = extractJsonValue(body, "username").trim();
            String email = extractJsonValue(body, "email").trim();
            String password = extractJsonValue(body, "password");
            String role = extractJsonValue(body, "role").trim();

            if (username.isEmpty() || email.isEmpty() || password.isEmpty()) {
                sendJson(exchange, 400, "{\"success\":false,\"message\":\"Semua field wajib diisi.\"}");
                return;
            }
            if (username.length() < 3) {
                sendJson(exchange, 400, "{\"success\":false,\"message\":\"Nama pengguna minimal 3 karakter.\"}");
                return;
            }
            if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                sendJson(exchange, 400, "{\"success\":false,\"message\":\"Format email tidak valid.\"}");
                return;
            }
            if (password.length() < 8) {
                sendJson(exchange, 400, "{\"success\":false,\"message\":\"Password minimal 8 karakter.\"}");
                return;
            }

            try {
                boolean registered = controller.registerWithQuery(username, email, password, role.isEmpty() ? "Pembaca" : role);
                if (registered) {
                    sendJson(exchange, 201, "{\"success\":true,\"message\":\"Registrasi berhasil! Silakan login.\"}");
                } else {
                    sendJson(exchange, 500, "{\"success\":false,\"message\":\"Gagal menyimpan data pengguna.\"}");
                }
            } catch (IllegalArgumentException e) {
                sendJson(exchange, 400, "{\"success\":false,\"message\":\"" + escapeJson(e.getMessage()) + "\"}");
            } catch (SQLException e) {
                e.printStackTrace();
                sendJson(exchange, 500, "{\"success\":false,\"message\":\"Kesalahan database: " + escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    // =========================================================
    // 5. HTTP Handler untuk Health Check & DB Status (/api/health)
    // =========================================================
    public static class HealthHttpHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCORSHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            boolean dbConnected = DatabaseConnection.testConnection();
            String response = String.format(
                "{\"status\":\"running\",\"database\":\"%s\"}",
                dbConnected ? "connected" : "disconnected (pastikan Laragon MySQL aktif)"
            );
            sendJson(exchange, dbConnected ? 200 : 503, response);
        }
    }

    // =========================================================
    // 6. HTTP Handler untuk Static Web Files (HTML, CSS, JS)
    // =========================================================
    public static class StaticFileHandler implements HttpHandler {
        private final java.io.File baseDir;

        public StaticFileHandler() {
            // Mencari folder Progress/frontend
            this.baseDir = new java.io.File("../../../Progress/frontend")
                .getAbsoluteFile()
                .toPath()
                .normalize()
                .toFile();

            System.out.println(
                "[StaticFileHandler] Folder frontend: "
            + this.baseDir.getAbsolutePath()
            );
        
            // Memeriksa apakah halaman home benar-benar tersedia.
            java.io.File homeFile =
                    new java.io.File(this.baseDir, "pages/home.html");
        
            if (!homeFile.exists()) {
                System.err.println(
                    "[PERINGATAN] File login tidak ditemukan: "
                    + homeFile.getAbsolutePath()
                );
            }
        }


        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
        
            // API ditangani oleh handler masing-masing.
            if (path.startsWith("/api/")) {
                sendJson(exchange, 404, "{\"error\":\"Not found\"}");
                return;
            }
                        // Homepage menjadi halaman awal.
            if (path.equals("/") || path.isEmpty()) {
                path = "/pages/home.html";
            }
                        // Ubah URL menjadi path relatif terhadap folder frontend.
            String relativePath = path.replaceFirst("^/+", "")
                    .replace("/", java.io.File.separator);
                        java.io.File target = new java.io.File(baseDir, relativePath)
                    .getCanonicalFile();
                        // Jika URL HTML tidak ditemukan, coba cari berdasarkan
            // nama file di dalam folder pages.
            if (!target.exists()
                    && path.toLowerCase().endsWith(".html")) {
                    
                String fileName = path.substring(
                        path.lastIndexOf("/") + 1
                );
            
                target = new java.io.File(
                        baseDir,
                        "pages" + java.io.File.separator + fileName
                ).getCanonicalFile();
            }
        
            // Pastikan file tetap berada di dalam folder frontend.
            String basePath = baseDir.getCanonicalPath()
                    + java.io.File.separator;

            if (!target.getCanonicalPath().startsWith(basePath)
                    || !target.exists()
                    || target.isDirectory()) {
                    
                sendJson(
                    exchange,
                    404,
                    "{\"error\":\"File tidak ditemukan: "
                        + escapeJson(path) + "\"}"
                );
                return;
            }

            // Tentukan tipe konten berdasarkan ekstensi file.
            String lower = target.getName().toLowerCase();
            String contentType = "application/octet-stream";

            if (lower.endsWith(".html")) {
                contentType = "text/html; charset=UTF-8";
            } else if (lower.endsWith(".css")) {
                contentType = "text/css; charset=UTF-8";
            } else if (lower.endsWith(".js")) {
                contentType = "application/javascript; charset=UTF-8";
            } else if (lower.endsWith(".json")) {
                contentType = "application/json; charset=UTF-8";
            } else if (lower.endsWith(".png")) {
                contentType = "image/png";
            } else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
                contentType = "image/jpeg";
            } else if (lower.endsWith(".webp")) {
                contentType = "image/webp";
            } else if (lower.endsWith(".gif")) {
                contentType = "image/gif";
            } else if (lower.endsWith(".svg")) {
                contentType = "image/svg+xml";
            } else if (lower.endsWith(".ico")) {
                contentType = "image/x-icon";
            }
        
            exchange.getResponseHeaders().set("Content-Type", contentType);
            exchange.getResponseHeaders().set("X-Content-Type-Options", "nosniff");
        
            byte[] bytes = java.nio.file.Files.readAllBytes(target.toPath());
        
            exchange.sendResponseHeaders(200, bytes.length);
        
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }

    // =========================================================
    // 7. Utility Helper Methods
    // =========================================================
    private static void setCORSHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
    }

    private static String readRequestBody(HttpExchange exchange) throws IOException {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8))) {
            return reader.lines().collect(Collectors.joining("\n"));
        }
    }

    private static void sendJson(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static String extractJsonValue(String json, String key) {
        Pattern pattern = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*\"([^\"]*)\"");
        Matcher matcher = pattern.matcher(json);
        return matcher.find() ? matcher.group(1) : "";
    }

    private static String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\b", "\\b")
                   .replace("\f", "\\f")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }

    // =========================================================
    // 8. Main Runner
    // =========================================================
    public static void main(String[] args) throws IOException {
        int port = 8080;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        server.createContext("/api/login", new LoginHttpHandler());
        server.createContext("/api/register", new RegisterHttpHandler());
        server.createContext("/api/health", new HealthHttpHandler());
        server.createContext("/", new StaticFileHandler());
        server.setExecutor(null);

        System.out.println("==================================================");
        System.out.println(" Backend & Web Server ComicID Berhasil Dimulai! ");
        System.out.println("==================================================");
        System.out.println(" - Buka di Browser : http://localhost:" + port + "/");
        System.out.println(" - Halaman Login   : http://localhost:" + port + "/pages/home.html");
        System.out.println(" - Halaman Daftar  : http://localhost:" + port + "/pages/register.html");
        System.out.println(" - Endpoint API    : http://localhost:" + port + "/api/login");
        System.out.println("--------------------------------------------------");

        if (DatabaseConnection.testConnection()) {
            System.out.println(" [OK] Terhubung ke database MySQL/MariaDB `comicid` di Laragon.");
        } else {
            System.out.println(" [PERINGATAN] Belum terhubung ke MySQL.");
            System.out.println("              Pastikan Laragon sudah 'Start All' & database `comicid` sudah di-import.");
        }
        System.out.println("==================================================");

        server.start();
    }
}