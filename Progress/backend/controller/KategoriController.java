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

public class KategoriController {

    // =========================================================
    // 1. Method Bisnis & Query Database
    // =========================================================
    public List<Kategori> getAllKategori() throws SQLException {
        List<Kategori> list = new ArrayList<>();
        String sql = "SELECT id_kategori, nama_kategori FROM kategori ORDER BY id_kategori ASC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                int id = rs.getInt("id_kategori");
                String nama = rs.getString("nama_kategori");
                list.add(new Kategori(id, nama));
            }
        }
        return list;
    }

    public Kategori getKategoriById(int idKategori) throws SQLException {
        String sql = "SELECT id_kategori, nama_kategori FROM kategori WHERE id_kategori = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, idKategori);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return new Kategori(rs.getInt("id_kategori"), rs.getString("nama_kategori"));
                }
            }
        }
        return null;
    }

    public boolean createKategori(String namaKategori) throws SQLException {
        if (namaKategori == null || namaKategori.trim().isEmpty()) {
            throw new IllegalArgumentException("Nama kategori tidak boleh kosong.");
        }

        String checkSql = "SELECT id_kategori FROM kategori WHERE LOWER(nama_kategori) = LOWER(?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
            checkStmt.setString(1, namaKategori.trim());
            try (ResultSet rs = checkStmt.executeQuery()) {
                if (rs.next()) {
                    throw new IllegalArgumentException("Nama kategori sudah ada.");
                }
            }
        }

        String insertSql = "INSERT INTO kategori (nama_kategori) VALUES (?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {
            insertStmt.setString(1, namaKategori.trim());
            return insertStmt.executeUpdate() > 0;
        }
    }

    public boolean updateKategori(int idKategori, String namaKategori) throws SQLException {
        if (namaKategori == null || namaKategori.trim().isEmpty()) {
            throw new IllegalArgumentException("Nama kategori tidak boleh kosong.");
        }

        String updateSql = "UPDATE kategori SET nama_kategori = ? WHERE id_kategori = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(updateSql)) {
            stmt.setString(1, namaKategori.trim());
            stmt.setInt(2, idKategori);
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean deleteKategori(int idKategori) throws SQLException {
        String deleteSql = "DELETE FROM kategori WHERE id_kategori = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(deleteSql)) {
            stmt.setInt(1, idKategori);
            return stmt.executeUpdate() > 0;
        }
    }

    // =========================================================
    // 2. HTTP Handler untuk List & Create Kategori (/api/categories)
    // =========================================================
    public static class KategoriListHttpHandler implements HttpHandler {
        private final KategoriController controller = new KategoriController();

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            ControllerHelper.setCORSHeaders(exchange);

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String method = exchange.getRequestMethod().toUpperCase();
            if ("GET".equals(method)) {
                try {
                    List<Kategori> categories = controller.getAllKategori();
                    StringBuilder sb = new StringBuilder();
                    sb.append("{\"success\":true,\"data\":[");
                    for (int i = 0; i < categories.size(); i++) {
                        Kategori kat = categories.get(i);
                        sb.append(String.format("{\"id\":%d,\"name\":\"%s\"}",
                                kat.getIdKategori(),
                                ControllerHelper.escapeJson(kat.getNamaKategori())));
                        if (i < categories.size() - 1) sb.append(",");
                    }
                    sb.append("]}");
                    ControllerHelper.sendJson(exchange, 200, sb.toString());
                } catch (SQLException e) {
                    e.printStackTrace();
                    ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Gagal mengambil kategori: " + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
                }
            } else if ("POST".equals(method)) {
                String body = ControllerHelper.readRequestBody(exchange);
                String name = ControllerHelper.extractJsonValue(body, "name");
                if (name.isEmpty()) {
                    name = ControllerHelper.extractJsonValue(body, "nama_kategori");
                }

                try {
                    boolean created = controller.createKategori(name);
                    if (created) {
                        ControllerHelper.sendJson(exchange, 201, "{\"success\":true,\"message\":\"Kategori berhasil ditambahkan.\"}");
                    } else {
                        ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Gagal menambahkan kategori.\"}");
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
    // 3. HTTP Handler untuk Detail/Update/Delete Kategori (/api/categories/detail)
    // =========================================================
    public static class KategoriDetailHttpHandler implements HttpHandler {
        private final KategoriController controller = new KategoriController();

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
                String idStr = params.get("id");
                if (idStr == null || idStr.isEmpty()) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"Parameter id wajib disertakan.\"}");
                    return;
                }
                try {
                    int id = Integer.parseInt(idStr);
                    Kategori kat = controller.getKategoriById(id);
                    if (kat == null) {
                        ControllerHelper.sendJson(exchange, 404, "{\"success\":false,\"message\":\"Kategori tidak ditemukan.\"}");
                        return;
                    }
                    String response = String.format("{\"success\":true,\"data\":{\"id\":%d,\"name\":\"%s\"}}",
                            kat.getIdKategori(),
                            ControllerHelper.escapeJson(kat.getNamaKategori()));
                    ControllerHelper.sendJson(exchange, 200, response);
                } catch (NumberFormatException e) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"ID tidak valid.\"}");
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
                String name = ControllerHelper.extractJsonValue(body, "name");
                if (name.isEmpty()) name = ControllerHelper.extractJsonValue(body, "nama_kategori");

                if (id <= 0 || name.isEmpty()) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"ID dan nama kategori wajib diisi.\"}");
                    return;
                }

                try {
                    boolean updated = controller.updateKategori(id, name);
                    if (updated) {
                        ControllerHelper.sendJson(exchange, 200, "{\"success\":true,\"message\":\"Kategori berhasil diperbarui.\"}");
                    } else {
                        ControllerHelper.sendJson(exchange, 404, "{\"success\":false,\"message\":\"Kategori tidak ditemukan atau tidak ada perubahan.\"}");
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
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"ID kategori wajib disertakan.\"}");
                    return;
                }

                try {
                    int id = Integer.parseInt(idStr);
                    boolean deleted = controller.deleteKategori(id);
                    if (deleted) {
                        ControllerHelper.sendJson(exchange, 200, "{\"success\":true,\"message\":\"Kategori berhasil dihapus.\"}");
                    } else {
                        ControllerHelper.sendJson(exchange, 404, "{\"success\":false,\"message\":\"Kategori tidak ditemukan.\"}");
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

