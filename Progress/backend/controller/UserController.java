import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class UserController {

    public static class UserDTO {
        public int idPengguna;
        public String username;
        public String email;
        public String role;
        public boolean isPremium;

        public UserDTO(int idPengguna, String username, String email, String role, boolean isPremium) {
            this.idPengguna = idPengguna;
            this.username = username;
            this.email = email;
            this.role = role;
            this.isPremium = isPremium;
        }
    }

    // =========================================================
    // 1. Method Bisnis & Query: Profil Pengguna
    // =========================================================
    public UserDTO getUserProfile(String emailOrUsername) throws SQLException {
        String sql = "SELECT id_pengguna, username, email, role, is_premium FROM pengguna " +
                     "WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, emailOrUsername);
            stmt.setString(2, emailOrUsername);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return new UserDTO(
                        rs.getInt("id_pengguna"),
                        rs.getString("username"),
                        rs.getString("email"),
                        rs.getString("role"),
                        rs.getInt("is_premium") == 1
                    );
                }
            }
        }
        return null;
    }

    public UserDTO getUserById(int idPengguna) throws SQLException {
        String sql = "SELECT id_pengguna, username, email, role, is_premium FROM pengguna WHERE id_pengguna = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, idPengguna);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return new UserDTO(
                        rs.getInt("id_pengguna"),
                        rs.getString("username"),
                        rs.getString("email"),
                        rs.getString("role"),
                        rs.getInt("is_premium") == 1
                    );
                }
            }
        }
        return null;
    }

    public boolean updateProfile(int idPengguna, String newUsername, String newEmail, String newPassword) throws SQLException {
        if (idPengguna <= 0) {
            throw new IllegalArgumentException("ID Pengguna tidak valid.");
        }

        // Cek username bentrok
        if (newUsername != null && !newUsername.trim().isEmpty()) {
            String checkSql = "SELECT id_pengguna FROM pengguna WHERE LOWER(username) = LOWER(?) AND id_pengguna != ?";
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(checkSql)) {
                stmt.setString(1, newUsername.trim());
                stmt.setInt(2, idPengguna);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) throw new IllegalArgumentException("Username sudah digunakan pengguna lain.");
                }
            }
        }

        // Cek email bentrok
        if (newEmail != null && !newEmail.trim().isEmpty()) {
            String checkSql = "SELECT id_pengguna FROM pengguna WHERE LOWER(email) = LOWER(?) AND id_pengguna != ?";
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(checkSql)) {
                stmt.setString(1, newEmail.trim());
                stmt.setInt(2, idPengguna);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) throw new IllegalArgumentException("Email sudah digunakan pengguna lain.");
                }
            }
        }

        StringBuilder sql = new StringBuilder("UPDATE pengguna SET ");
        List<Object> params = new ArrayList<>();

        if (newUsername != null && !newUsername.trim().isEmpty()) {
            sql.append("username = ?, ");
            params.add(newUsername.trim());
        }
        if (newEmail != null && !newEmail.trim().isEmpty()) {
            sql.append("email = ?, ");
            params.add(newEmail.trim());
        }
        if (newPassword != null && !newPassword.trim().isEmpty()) {
            sql.append("password = ?, ");
            params.add(newPassword.trim());
        }

        if (params.isEmpty()) {
            return true; // Tidak ada data yang diubah
        }

        // Hapus trailing comma
        sql.setLength(sql.length() - 2);
        sql.append(" WHERE id_pengguna = ?");
        params.add(idPengguna);

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {

            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }

            return stmt.executeUpdate() > 0;
        }
    }

    // =========================================================
    // 2. Method Bisnis & Query: Admin User Management
    // =========================================================
    public List<UserDTO> getAllUsers() throws SQLException {
        List<UserDTO> list = new ArrayList<>();
        String sql = "SELECT id_pengguna, username, email, role, is_premium FROM pengguna ORDER BY id_pengguna ASC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                list.add(new UserDTO(
                    rs.getInt("id_pengguna"),
                    rs.getString("username"),
                    rs.getString("email"),
                    rs.getString("role"),
                    rs.getInt("is_premium") == 1
                ));
            }
        }
        return list;
    }

    public boolean createUserByAdmin(String username, String email, String password, String role, boolean isPremium) throws SQLException {
        if (username == null || username.trim().isEmpty() || email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Username, email, dan password wajib diisi.");
        }

        String checkSql = "SELECT id_pengguna FROM pengguna WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(checkSql)) {
            stmt.setString(1, username.trim());
            stmt.setString(2, email.trim());
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) throw new IllegalArgumentException("Username atau email sudah digunakan.");
            }
        }

        String validRole = ("Admin".equalsIgnoreCase(role) || "Kreator".equalsIgnoreCase(role)) ? role : "Pembaca";
        int premiumVal = isPremium ? 1 : 0;
        if ("Admin".equalsIgnoreCase(validRole)) premiumVal = 0; // Admin cannot be premium per trigger

        String insertSql = "INSERT INTO pengguna (username, email, password, role, is_premium) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(insertSql)) {
            stmt.setString(1, username.trim());
            stmt.setString(2, email.trim());
            stmt.setString(3, password.trim());
            stmt.setString(4, validRole);
            stmt.setInt(5, premiumVal);
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean updateUserByAdmin(int idPengguna, String username, String email, String role, Boolean isPremium, String newPassword) throws SQLException {
        if (idPengguna <= 0) {
            throw new IllegalArgumentException("ID Pengguna tidak valid.");
        }

        StringBuilder sql = new StringBuilder("UPDATE pengguna SET ");
        List<Object> params = new ArrayList<>();

        if (username != null && !username.trim().isEmpty()) {
            sql.append("username = ?, ");
            params.add(username.trim());
        }
        if (email != null && !email.trim().isEmpty()) {
            sql.append("email = ?, ");
            params.add(email.trim());
        }
        if (role != null && !role.trim().isEmpty()) {
            sql.append("role = ?, ");
            params.add(role.trim());
        }
        if (isPremium != null) {
            sql.append("is_premium = ?, ");
            params.add(isPremium ? 1 : 0);
        }
        if (newPassword != null && !newPassword.trim().isEmpty()) {
            sql.append("password = ?, ");
            params.add(newPassword.trim());
        }

        if (params.isEmpty()) return true;

        sql.setLength(sql.length() - 2);
        sql.append(" WHERE id_pengguna = ?");
        params.add(idPengguna);

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {

            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }

            return stmt.executeUpdate() > 0;
        }
    }

    public boolean deleteUserByAdmin(int idPengguna) throws SQLException {
        String deleteSql = "DELETE FROM pengguna WHERE id_pengguna = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(deleteSql)) {
            stmt.setInt(1, idPengguna);
            return stmt.executeUpdate() > 0;
        }
    }

    // =========================================================
    // 3. HTTP Handler untuk Profil Pengguna (/api/user/profile)
    // =========================================================
    public static class UserProfileHttpHandler implements HttpHandler {
        private final UserController controller = new UserController();

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            ControllerHelper.setCORSHeaders(exchange);

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String method = exchange.getRequestMethod().toUpperCase();
            Map<String, String> params = ControllerHelper.parseQueryParams(exchange.getRequestURI());

            if ("GET".equals(method)) {
                String emailOrUsername = params.get("email");
                if (emailOrUsername == null || emailOrUsername.isEmpty()) {
                    emailOrUsername = params.get("username");
                }
                String idStr = params.get("id");

                try {
                    UserDTO user = null;
                    if (idStr != null && !idStr.isEmpty()) {
                        user = controller.getUserById(Integer.parseInt(idStr));
                    } else if (emailOrUsername != null && !emailOrUsername.isEmpty()) {
                        user = controller.getUserProfile(emailOrUsername);
                    } else {
                        ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"Parameter email atau id wajib disertakan.\"}");
                        return;
                    }

                    if (user == null) {
                        ControllerHelper.sendJson(exchange, 404, "{\"success\":false,\"message\":\"Pengguna tidak ditemukan.\"}");
                        return;
                    }

                    String response = String.format(
                        "{\"success\":true,\"data\":{\"id\":%d,\"username\":\"%s\",\"email\":\"%s\",\"role\":\"%s\",\"is_premium\":%s}}",
                        user.idPengguna,
                        ControllerHelper.escapeJson(user.username),
                        ControllerHelper.escapeJson(user.email),
                        ControllerHelper.escapeJson(user.role),
                        user.isPremium ? "true" : "false"
                    );
                    ControllerHelper.sendJson(exchange, 200, response);
                } catch (Exception e) {
                    ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"" + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
                }
            } else if ("PUT".equals(method)) {
                String body = ControllerHelper.readRequestBody(exchange);
                int id = ControllerHelper.extractJsonInt(body, "id", -1);
                if (id == -1 && params.containsKey("id")) {
                    try { id = Integer.parseInt(params.get("id")); } catch (Exception ignored) {}
                }

                String username = ControllerHelper.extractJsonValue(body, "username");
                String email = ControllerHelper.extractJsonValue(body, "email");
                String password = ControllerHelper.extractJsonValue(body, "password");

                if (id <= 0) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"ID pengguna wajib disertakan.\"}");
                    return;
                }

                try {
                    boolean updated = controller.updateProfile(id, username, email, password);
                    if (updated) {
                        ControllerHelper.sendJson(exchange, 200, "{\"success\":true,\"message\":\"Profil berhasil diperbarui.\"}");
                    } else {
                        ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Gagal memperbarui profil.\"}");
                    }
                } catch (IllegalArgumentException e) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"" + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
                } catch (SQLException e) {
                    e.printStackTrace();
                    ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Kesalahan database: " + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
                }
            } else {
                ControllerHelper.sendJson(exchange, 405, "{\"success\":false,\"message\":\"Method tidak diizinkan.\"}");
            }
        }
    }

    // =========================================================
    // 4. HTTP Handler untuk Admin User Management (/api/admin/users)
    // =========================================================
    public static class AdminUsersHttpHandler implements HttpHandler {
        private final UserController controller = new UserController();

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            ControllerHelper.setCORSHeaders(exchange);

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String method = exchange.getRequestMethod().toUpperCase();
            Map<String, String> params = ControllerHelper.parseQueryParams(exchange.getRequestURI());

            if ("GET".equals(method)) {
                try {
                    List<UserDTO> users = controller.getAllUsers();
                    StringBuilder sb = new StringBuilder();
                    sb.append("{\"success\":true,\"total\":").append(users.size()).append(",\"data\":[");
                    for (int i = 0; i < users.size(); i++) {
                        UserDTO u = users.get(i);
                        sb.append(String.format(
                            "{\"id\":%d,\"username\":\"%s\",\"email\":\"%s\",\"role\":\"%s\",\"is_premium\":%s}",
                            u.idPengguna,
                            ControllerHelper.escapeJson(u.username),
                            ControllerHelper.escapeJson(u.email),
                            ControllerHelper.escapeJson(u.role),
                            u.isPremium ? "true" : "false"
                        ));
                        if (i < users.size() - 1) sb.append(",");
                    }
                    sb.append("]}");

                    ControllerHelper.sendJson(exchange, 200, sb.toString());
                } catch (SQLException e) {
                    e.printStackTrace();
                    ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Kesalahan database: " + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
                }
            } else if ("POST".equals(method)) {
                String body = ControllerHelper.readRequestBody(exchange);
                String username = ControllerHelper.extractJsonValue(body, "username");
                String email = ControllerHelper.extractJsonValue(body, "email");
                String password = ControllerHelper.extractJsonValue(body, "password");
                String role = ControllerHelper.extractJsonValue(body, "role");
                boolean isPremium = ControllerHelper.extractJsonBoolean(body, "is_premium", false);

                try {
                    boolean created = controller.createUserByAdmin(username, email, password, role, isPremium);
                    if (created) {
                        ControllerHelper.sendJson(exchange, 201, "{\"success\":true,\"message\":\"Pengguna berhasil ditambahkan oleh Admin.\"}");
                    } else {
                        ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Gagal menambahkan pengguna.\"}");
                    }
                } catch (IllegalArgumentException e) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"" + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
                } catch (SQLException e) {
                    e.printStackTrace();
                    ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Kesalahan database: " + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
                }
            } else if ("PUT".equals(method)) {
                String body = ControllerHelper.readRequestBody(exchange);
                int id = ControllerHelper.extractJsonInt(body, "id", -1);
                if (id == -1 && params.containsKey("id")) {
                    try { id = Integer.parseInt(params.get("id")); } catch (Exception ignored) {}
                }
                String username = ControllerHelper.extractJsonValue(body, "username");
                String email = ControllerHelper.extractJsonValue(body, "email");
                String role = ControllerHelper.extractJsonValue(body, "role");
                Boolean isPremium = body.contains("\"is_premium\"") ? ControllerHelper.extractJsonBoolean(body, "is_premium", false) : null;
                String newPassword = ControllerHelper.extractJsonValue(body, "password");

                if (id <= 0) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"ID pengguna wajib disertakan.\"}");
                    return;
                }

                try {
                    boolean updated = controller.updateUserByAdmin(id, username, email, role, isPremium, newPassword);
                    if (updated) {
                        ControllerHelper.sendJson(exchange, 200, "{\"success\":true,\"message\":\"Data pengguna berhasil diperbarui.\"}");
                    } else {
                        ControllerHelper.sendJson(exchange, 404, "{\"success\":false,\"message\":\"Pengguna tidak ditemukan.\"}");
                    }
                } catch (Exception e) {
                    ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"" + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
                }
            } else if ("DELETE".equals(method)) {
                String idStr = params.get("id");
                if (idStr == null || idStr.isEmpty()) {
                    String body = ControllerHelper.readRequestBody(exchange);
                    int id = ControllerHelper.extractJsonInt(body, "id", -1);
                    if (id > 0) idStr = String.valueOf(id);
                }

                if (idStr == null || idStr.isEmpty()) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"ID pengguna wajib disertakan.\"}");
                    return;
                }

                try {
                    int id = Integer.parseInt(idStr);
                    boolean deleted = controller.deleteUserByAdmin(id);
                    if (deleted) {
                        ControllerHelper.sendJson(exchange, 200, "{\"success\":true,\"message\":\"Pengguna berhasil dihapus.\"}");
                    } else {
                        ControllerHelper.sendJson(exchange, 404, "{\"success\":false,\"message\":\"Pengguna tidak ditemukan.\"}");
                    }
                } catch (Exception e) {
                    ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"" + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
                }
            } else {
                ControllerHelper.sendJson(exchange, 405, "{\"success\":false,\"message\":\"Method tidak diizinkan.\"}");
            }
        }
    }
}

