import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class BabController {

    public static class BabDTO {
        public int idBab;
        public int idKomik;
        public int nomorBab;
        public String tanggalRilis;
        public String namaKomik;

        public BabDTO(int idBab, int idKomik, int nomorBab, String tanggalRilis, String namaKomik) {
            this.idBab = idBab;
            this.idKomik = idKomik;
            this.nomorBab = nomorBab;
            this.tanggalRilis = tanggalRilis;
            this.namaKomik = namaKomik;
        }
    }

    // =========================================================
    // 1. Method Bisnis & Query Database
    // =========================================================
    public List<BabDTO> getBabByKomik(int idKomik) throws SQLException {
        List<BabDTO> list = new ArrayList<>();
        String sql = "SELECT b.id_bab, b.id_komik, b.nomor_bab, b.tanggal_rilis, k.nama_komik "
                   + "FROM bab b JOIN komik k ON b.id_komik = k.id_komik "
                   + "WHERE b.id_komik = ? ORDER BY b.nomor_bab ASC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, idKomik);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Bab babModel = new Bab(rs.getInt("id_bab"), rs.getInt("nomor_bab"));
                    list.add(new BabDTO(
                        babModel.getIdBab(),
                        rs.getInt("id_komik"),
                        babModel.getNomorBab(),
                        rs.getString("tanggal_rilis"),
                        rs.getString("nama_komik")
                    ));
                }
            }
        }
        return list;
    }

    public BabDTO getBabDetail(int idBab) throws SQLException {
        String sql = "SELECT b.id_bab, b.id_komik, b.nomor_bab, b.tanggal_rilis, k.nama_komik "
                   + "FROM bab b JOIN komik k ON b.id_komik = k.id_komik "
                   + "WHERE b.id_bab = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, idBab);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Bab bab = new Bab(rs.getInt("id_bab"), rs.getInt("nomor_bab"));
                    bab.loadKonten(); // Panggil fungsi domain model

                    return new BabDTO(
                        bab.getIdBab(),
                        rs.getInt("id_komik"),
                        bab.getNomorBab(),
                        rs.getString("tanggal_rilis"),
                        rs.getString("nama_komik")
                    );
                }
            }
        }
        return null;
    }

    public boolean createBab(int idKomik, int nomorBab, String tanggalRilis) throws SQLException {
        if (idKomik <= 0 || nomorBab <= 0) {
            throw new IllegalArgumentException("ID Komik dan nomor bab harus lebih dari 0.");
        }

        // Cek duplikasi nomor bab pada komik yang sama
        String checkSql = "SELECT id_bab FROM bab WHERE id_komik = ? AND nomor_bab = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
            checkStmt.setInt(1, idKomik);
            checkStmt.setInt(2, nomorBab);
            try (ResultSet rs = checkStmt.executeQuery()) {
                if (rs.next()) {
                    throw new IllegalArgumentException("Nomor bab " + nomorBab + " sudah ada pada komik ini.");
                }
            }
        }

        String finalDate = (tanggalRilis != null && !tanggalRilis.trim().isEmpty())
                ? tanggalRilis.trim()
                : java.time.LocalDate.now().toString();

        String insertSql = "INSERT INTO bab (id_komik, nomor_bab, tanggal_rilis) VALUES (?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {
            insertStmt.setInt(1, idKomik);
            insertStmt.setInt(2, nomorBab);
            insertStmt.setString(3, finalDate);
            return insertStmt.executeUpdate() > 0;
        }
    }

    public boolean updateBab(int idBab, int nomorBab, String tanggalRilis) throws SQLException {
        if (idBab <= 0 || nomorBab <= 0) {
            throw new IllegalArgumentException("ID Bab dan nomor bab tidak valid.");
        }

        String updateSql = "UPDATE bab SET nomor_bab = ?, tanggal_rilis = ? WHERE id_bab = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(updateSql)) {
            stmt.setInt(1, nomorBab);
            stmt.setString(2, tanggalRilis);
            stmt.setInt(3, idBab);
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean deleteBab(int idBab) throws SQLException {
        String deleteSql = "DELETE FROM bab WHERE id_bab = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(deleteSql)) {
            stmt.setInt(1, idBab);
            return stmt.executeUpdate() > 0;
        }
    }

    // =========================================================
    // 2. HTTP Handler untuk List & Create Bab (/api/chapters)
    // =========================================================
    public static class BabListHttpHandler implements HttpHandler {
        private final BabController controller = new BabController();

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
                String comicIdStr = params.get("comic_id");
                if (comicIdStr == null) comicIdStr = params.get("id_komik");

                if (comicIdStr == null || comicIdStr.isEmpty()) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"Parameter comic_id wajib disertakan.\"}");
                    return;
                }

                try {
                    int comicId = Integer.parseInt(comicIdStr);
                    List<BabDTO> chapters = controller.getBabByKomik(comicId);

                    StringBuilder sb = new StringBuilder();
                    sb.append("{\"success\":true,\"total\":").append(chapters.size()).append(",\"data\":[");
                    for (int i = 0; i < chapters.size(); i++) {
                        BabDTO b = chapters.get(i);
                        sb.append(String.format("{\"id\":%d,\"comic_id\":%d,\"chapter_number\":%d,\"release_date\":\"%s\",\"comic_name\":\"%s\"}",
                                b.idBab, b.idKomik, b.nomorBab,
                                ControllerHelper.escapeJson(b.tanggalRilis),
                                ControllerHelper.escapeJson(b.namaKomik)));
                        if (i < chapters.size() - 1) sb.append(",");
                    }
                    sb.append("]}");

                    ControllerHelper.sendJson(exchange, 200, sb.toString());
                } catch (NumberFormatException e) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"Format comic_id tidak valid.\"}");
                } catch (SQLException e) {
                    e.printStackTrace();
                    ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Kesalahan database: " + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
                }
            } else if ("POST".equals(method)) {
                String body = ControllerHelper.readRequestBody(exchange);
                int comicId = ControllerHelper.extractJsonInt(body, "comic_id", -1);
                if (comicId == -1) comicId = ControllerHelper.extractJsonInt(body, "id_komik", -1);

                int chapterNumber = ControllerHelper.extractJsonInt(body, "chapter_number", -1);
                if (chapterNumber == -1) chapterNumber = ControllerHelper.extractJsonInt(body, "nomor_bab", -1);

                String releaseDate = ControllerHelper.extractJsonValue(body, "release_date");
                if (releaseDate.isEmpty()) releaseDate = ControllerHelper.extractJsonValue(body, "tanggal_rilis");

                if (comicId <= 0 || chapterNumber <= 0) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"comic_id dan chapter_number wajib diisi (>0).\"}");
                    return;
                }

                try {
                    boolean created = controller.createBab(comicId, chapterNumber, releaseDate);
                    if (created) {
                        ControllerHelper.sendJson(exchange, 201, "{\"success\":true,\"message\":\"Bab berhasil ditambahkan.\"}");
                    } else {
                        ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Gagal menambahkan bab.\"}");
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
    // 3. HTTP Handler untuk Detail Bab (/api/chapters/detail)
    // =========================================================
    public static class BabDetailHttpHandler implements HttpHandler {
        private final BabController controller = new BabController();

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
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"Parameter id bab wajib disertakan.\"}");
                    return;
                }

                try {
                    int id = Integer.parseInt(idStr);
                    BabDTO bab = controller.getBabDetail(id);
                    if (bab == null) {
                        ControllerHelper.sendJson(exchange, 404, "{\"success\":false,\"message\":\"Bab tidak ditemukan.\"}");
                        return;
                    }

                    String response = String.format(
                        "{\"success\":true,\"data\":{\"id\":%d,\"comic_id\":%d,\"chapter_number\":%d,\"release_date\":\"%s\",\"comic_name\":\"%s\"}}",
                        bab.idBab, bab.idKomik, bab.nomorBab,
                        ControllerHelper.escapeJson(bab.tanggalRilis),
                        ControllerHelper.escapeJson(bab.namaKomik)
                    );
                    ControllerHelper.sendJson(exchange, 200, response);
                } catch (NumberFormatException e) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"Format ID tidak valid.\"}");
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
                int chapterNum = ControllerHelper.extractJsonInt(body, "chapter_number", -1);
                String releaseDate = ControllerHelper.extractJsonValue(body, "release_date");

                if (id <= 0 || chapterNum <= 0) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"ID dan nomor bab wajib diisi (>0).\"}");
                    return;
                }

                try {
                    boolean updated = controller.updateBab(id, chapterNum, releaseDate);
                    if (updated) {
                        ControllerHelper.sendJson(exchange, 200, "{\"success\":true,\"message\":\"Data bab berhasil diperbarui.\"}");
                    } else {
                        ControllerHelper.sendJson(exchange, 404, "{\"success\":false,\"message\":\"Bab tidak ditemukan.\"}");
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
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"ID bab wajib disertakan.\"}");
                    return;
                }

                try {
                    int id = Integer.parseInt(idStr);
                    boolean deleted = controller.deleteBab(id);
                    if (deleted) {
                        ControllerHelper.sendJson(exchange, 200, "{\"success\":true,\"message\":\"Bab berhasil dihapus.\"}");
                    } else {
                        ControllerHelper.sendJson(exchange, 404, "{\"success\":false,\"message\":\"Bab tidak ditemukan.\"}");
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

