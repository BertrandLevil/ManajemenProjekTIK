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

public class KomikController {

    public static class KomikDTO {
        public int idKomik;
        public int idKreator;
        public String namaKreator;
        public String namaKomik;
        public String deskripsi;
        public String namaStudio;
        public double ratingRataRata;
        public List<String> categories = new ArrayList<>();
        public int totalChapters;

        public KomikDTO(int idKomik, int idKreator, String namaKreator, String namaKomik,
                        String deskripsi, String namaStudio, double ratingRataRata) {
            this.idKomik = idKomik;
            this.idKreator = idKreator;
            this.namaKreator = namaKreator;
            this.namaKomik = namaKomik;
            this.deskripsi = deskripsi;
            this.namaStudio = namaStudio;
            this.ratingRataRata = ratingRataRata;
        }
    }

    // =========================================================
    // 1. Method Bisnis & Query Database
    // =========================================================
    public List<KomikDTO> getAllKomik(String search, String kategori, String sortBy) throws SQLException {
        List<KomikDTO> list = new ArrayList<>();

        StringBuilder sql = new StringBuilder(
            "SELECT k.id_komik, k.id_kreator, u.username AS nama_kreator, " +
            "k.nama_komik, k.deskripsi, k.nama_studio, k.rating_rata_rata, " +
            "(SELECT COUNT(*) FROM bab b WHERE b.id_komik = k.id_komik) AS total_bab " +
            "FROM komik k " +
            "LEFT JOIN pengguna u ON k.id_kreator = u.id_pengguna " +
            "WHERE 1=1 "
        );

        List<Object> queryParams = new ArrayList<>();

        if (search != null && !search.trim().isEmpty()) {
            sql.append("AND (LOWER(k.nama_komik) LIKE LOWER(?) OR LOWER(k.deskripsi) LIKE LOWER(?) OR LOWER(k.nama_studio) LIKE LOWER(?)) ");
            String searchPattern = "%" + search.trim() + "%";
            queryParams.add(searchPattern);
            queryParams.add(searchPattern);
            queryParams.add(searchPattern);
        }

        if (kategori != null && !kategori.trim().isEmpty()) {
            sql.append("AND k.id_komik IN ( " +
                       "  SELECT kk.id_komik FROM komik_kategori kk " +
                       "  JOIN kategori kat ON kk.id_kategori = kat.id_kategori " +
                       "  WHERE LOWER(kat.nama_kategori) = LOWER(?) OR kk.id_kategori = ? " +
                       ") ");
            queryParams.add(kategori.trim());
            int katId = -1;
            try { katId = Integer.parseInt(kategori.trim()); } catch (Exception ignored) {}
            queryParams.add(katId);
        }

        if ("rating".equalsIgnoreCase(sortBy) || "popular".equalsIgnoreCase(sortBy)) {
            sql.append("ORDER BY k.rating_rata_rata DESC, k.id_komik DESC");
        } else if ("title".equalsIgnoreCase(sortBy) || "az".equalsIgnoreCase(sortBy)) {
            sql.append("ORDER BY k.nama_komik ASC");
        } else {
            // Default: newest
            sql.append("ORDER BY k.id_komik DESC");
        }

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {

            for (int i = 0; i < queryParams.size(); i++) {
                stmt.setObject(i + 1, queryParams.get(i));
            }

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    KomikDTO dto = new KomikDTO(
                        rs.getInt("id_komik"),
                        rs.getInt("id_kreator"),
                        rs.getString("nama_kreator"),
                        rs.getString("nama_komik"),
                        rs.getString("deskripsi"),
                        rs.getString("nama_studio"),
                        rs.getDouble("rating_rata_rata")
                    );
                    dto.totalChapters = rs.getInt("total_bab");
                    list.add(dto);
                }
            }
        }

        // Ambil kategori untuk setiap komik
        for (KomikDTO dto : list) {
            dto.categories = getCategoriesForComic(dto.idKomik);
        }

        return list;
    }

    public KomikDTO getKomikById(int idKomik) throws SQLException {
        String sql = "SELECT k.id_komik, k.id_kreator, u.username AS nama_kreator, " +
                     "k.nama_komik, k.deskripsi, k.nama_studio, k.rating_rata_rata, " +
                     "(SELECT COUNT(*) FROM bab b WHERE b.id_komik = k.id_komik) AS total_bab " +
                     "FROM komik k " +
                     "LEFT JOIN pengguna u ON k.id_kreator = u.id_pengguna " +
                     "WHERE k.id_komik = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, idKomik);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    KomikDTO dto = new KomikDTO(
                        rs.getInt("id_komik"),
                        rs.getInt("id_kreator"),
                        rs.getString("nama_kreator"),
                        rs.getString("nama_komik"),
                        rs.getString("deskripsi"),
                        rs.getString("nama_studio"),
                        rs.getDouble("rating_rata_rata")
                    );
                    dto.totalChapters = rs.getInt("total_bab");
                    dto.categories = getCategoriesForComic(idKomik);
                    return dto;
                }
            }
        }
        return null;
    }

    public List<String> getCategoriesForComic(int idKomik) throws SQLException {
        List<String> categories = new ArrayList<>();
        String sql = "SELECT kat.nama_kategori FROM komik_kategori kk " +
                     "JOIN kategori kat ON kk.id_kategori = kat.id_kategori " +
                     "WHERE kk.id_komik = ? ORDER BY kat.nama_kategori ASC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, idKomik);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    categories.add(rs.getString("nama_kategori"));
                }
            }
        }
        return categories;
    }

    public int createKomik(int idKreator, String namaKomik, String deskripsi,
                           String namaStudio, List<Integer> kategoriIds) throws SQLException {
        if (namaKomik == null || namaKomik.trim().isEmpty()) {
            throw new IllegalArgumentException("Judul komik tidak boleh kosong.");
        }
        if (idKreator <= 0) {
            throw new IllegalArgumentException("ID Kreator tidak valid.");
        }

        // Verifikasi pengguna pembuat
        String userSql = "SELECT username, email, password, role FROM pengguna WHERE id_pengguna = ?";
        String authorName = "";
        String authorEmail = "";
        String authorPass = "";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement userStmt = conn.prepareStatement(userSql)) {
            userStmt.setInt(1, idKreator);
            try (ResultSet rs = userStmt.executeQuery()) {
                if (!rs.next()) {
                    throw new IllegalArgumentException("Kreator tidak ditemukan.");
                }
                authorName = rs.getString("username");
                authorEmail = rs.getString("email");
                authorPass = rs.getString("password");
            }
        }

        // Simpan komik ke database
        String insertSql = "INSERT INTO komik (id_kreator, nama_komik, deskripsi, nama_studio, rating_rata_rata) VALUES (?, ?, ?, ?, 0.00)";
        int newKomikId = -1;

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, idKreator);
            stmt.setString(2, namaKomik.trim());
            stmt.setString(3, deskripsi != null ? deskripsi.trim() : "");
            stmt.setString(4, namaStudio != null ? namaStudio.trim() : "-");

            int affected = stmt.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        newKomikId = rs.getInt(1);
                    }
                }
            }
        }

        if (newKomikId > 0 && kategoriIds != null && !kategoriIds.isEmpty()) {
            linkCategories(newKomikId, kategoriIds);
        }

        // Integrasi OOP Domain Class
        if (newKomikId > 0) {
            Author author = new Author(authorName, authorEmail, authorPass, namaStudio);
            author.login(authorName, authorPass);
            Komik komikDomain = new Komik(newKomikId, namaKomik, "General");
            author.postKomik(komikDomain);
        }

        return newKomikId;
    }

    public boolean updateKomik(int idKomik, int idKreator, String namaKomik,
                               String deskripsi, String namaStudio, List<Integer> kategoriIds) throws SQLException {
        if (idKomik <= 0 || namaKomik == null || namaKomik.trim().isEmpty()) {
            throw new IllegalArgumentException("ID Komik dan Judul wajib diisi.");
        }

        String updateSql = "UPDATE komik SET nama_komik = ?, deskripsi = ?, nama_studio = ? WHERE id_komik = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(updateSql)) {
            stmt.setString(1, namaKomik.trim());
            stmt.setString(2, deskripsi != null ? deskripsi.trim() : "");
            stmt.setString(3, namaStudio != null ? namaStudio.trim() : "-");
            stmt.setInt(4, idKomik);

            int affected = stmt.executeUpdate();
            if (affected > 0) {
                if (kategoriIds != null) {
                    unlinkCategories(idKomik);
                    linkCategories(idKomik, kategoriIds);
                }
                return true;
            }
        }
        return false;
    }

    public boolean deleteKomik(int idKomik) throws SQLException {
        String sql = "DELETE FROM komik WHERE id_komik = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, idKomik);
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean verifyKomik(int idKomik, int idAdmin) throws SQLException {
        // Admin memverifikasi komik sesuai class Admin.verifyKomik(idKomik)
        String sql = "SELECT username, email, password FROM pengguna WHERE id_pengguna = ? AND role = 'Admin'";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, idAdmin);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    throw new IllegalArgumentException("Akses ditolak: Hanya Admin yang dapat memverifikasi komik.");
                }
                Admin admin = new Admin(rs.getString("username"), rs.getString("email"), rs.getString("password"), idAdmin);
                admin.login(rs.getString("username"), rs.getString("password"));
                return admin.verifyKomik(idKomik);
            }
        }
    }

    private void linkCategories(int idKomik, List<Integer> kategoriIds) throws SQLException {
        String insertKategoriSql = "INSERT IGNORE INTO komik_kategori (id_komik, id_kategori) VALUES (?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(insertKategoriSql)) {
            for (Integer katId : kategoriIds) {
                if (katId != null && katId > 0) {
                    stmt.setInt(1, idKomik);
                    stmt.setInt(2, katId);
                    stmt.addBatch();
                }
            }
            stmt.executeBatch();
        }
    }

    private void unlinkCategories(int idKomik) throws SQLException {
        String deleteSql = "DELETE FROM komik_kategori WHERE id_komik = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(deleteSql)) {
            stmt.setInt(1, idKomik);
            stmt.executeUpdate();
        }
    }

    // =========================================================
    // 2. HTTP Handler untuk Daftar Komik (/api/comics)
    // =========================================================
    public static class KomikListHttpHandler implements HttpHandler {
        private final KomikController controller = new KomikController();

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
                String search = params.get("search");
                if (search == null) search = params.get("q");
                String category = params.get("category");
                if (category == null) category = params.get("kategori");
                String sort = params.get("sort");

                try {
                    List<KomikDTO> comics = controller.getAllKomik(search, category, sort);

                    StringBuilder sb = new StringBuilder();
                    sb.append("{\"success\":true,\"total\":").append(comics.size()).append(",\"data\":[");
                    for (int i = 0; i < comics.size(); i++) {
                        KomikDTO k = comics.get(i);
                        sb.append("{");
                        sb.append("\"id\":").append(k.idKomik).append(",");
                        sb.append("\"creator_id\":").append(k.idKreator).append(",");
                        sb.append("\"creator_name\":\"").append(ControllerHelper.escapeJson(k.namaKreator)).append("\",");
                        sb.append("\"title\":\"").append(ControllerHelper.escapeJson(k.namaKomik)).append("\",");
                        sb.append("\"description\":\"").append(ControllerHelper.escapeJson(k.deskripsi)).append("\",");
                        sb.append("\"studio\":\"").append(ControllerHelper.escapeJson(k.namaStudio)).append("\",");
                        sb.append("\"rating\":").append(String.format(java.util.Locale.US, "%.2f", k.ratingRataRata)).append(",");
                        sb.append("\"total_chapters\":").append(k.totalChapters).append(",");
                        sb.append("\"categories\":[");
                        for (int c = 0; c < k.categories.size(); c++) {
                            sb.append("\"").append(ControllerHelper.escapeJson(k.categories.get(c))).append("\"");
                            if (c < k.categories.size() - 1) sb.append(",");
                        }
                        sb.append("]}");
                        if (i < comics.size() - 1) sb.append(",");
                    }
                    sb.append("]}");

                    ControllerHelper.sendJson(exchange, 200, sb.toString());
                } catch (SQLException e) {
                    e.printStackTrace();
                    ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Kesalahan database: " + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
                }
            } else if ("POST".equals(method)) {
                String body = ControllerHelper.readRequestBody(exchange);
                int creatorId = ControllerHelper.extractJsonInt(body, "creator_id", -1);
                if (creatorId == -1) creatorId = ControllerHelper.extractJsonInt(body, "id_kreator", -1);

                String title = ControllerHelper.extractJsonValue(body, "title");
                if (title.isEmpty()) title = ControllerHelper.extractJsonValue(body, "nama_komik");

                String description = ControllerHelper.extractJsonValue(body, "description");
                if (description.isEmpty()) description = ControllerHelper.extractJsonValue(body, "deskripsi");

                String studio = ControllerHelper.extractJsonValue(body, "studio");
                if (studio.isEmpty()) studio = ControllerHelper.extractJsonValue(body, "nama_studio");

                // Parse category ids jika ada
                List<Integer> catIds = new ArrayList<>();
                java.util.regex.Matcher m = java.util.regex.Pattern.compile("\"category_ids\"\\s*:\\s*\\[([^\\]]*)\\]").matcher(body);
                if (m.find()) {
                    String[] tokens = m.group(1).split(",");
                    for (String t : tokens) {
                        try { catIds.add(Integer.parseInt(t.trim())); } catch (Exception ignored) {}
                    }
                }

                try {
                    int newId = controller.createKomik(creatorId, title, description, studio, catIds);
                    if (newId > 0) {
                        ControllerHelper.sendJson(exchange, 201, String.format("{\"success\":true,\"message\":\"Komik berhasil dibuat.\",\"id\":%d}", newId));
                    } else {
                        ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Gagal menambahkan komik.\"}");
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
    // 3. HTTP Handler untuk Detail Komik (/api/comics/detail)
    // =========================================================
    public static class KomikDetailHttpHandler implements HttpHandler {
        private final KomikController controller = new KomikController();

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
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"Parameter id komik wajib disertakan.\"}");
                    return;
                }

                try {
                    int id = Integer.parseInt(idStr);
                    KomikDTO k = controller.getKomikById(id);
                    if (k == null) {
                        ControllerHelper.sendJson(exchange, 404, "{\"success\":false,\"message\":\"Komik tidak ditemukan.\"}");
                        return;
                    }

                    StringBuilder sb = new StringBuilder();
                    sb.append("{\"success\":true,\"data\":{");
                    sb.append("\"id\":").append(k.idKomik).append(",");
                    sb.append("\"creator_id\":").append(k.idKreator).append(",");
                    sb.append("\"creator_name\":\"").append(ControllerHelper.escapeJson(k.namaKreator)).append("\",");
                    sb.append("\"title\":\"").append(ControllerHelper.escapeJson(k.namaKomik)).append("\",");
                    sb.append("\"description\":\"").append(ControllerHelper.escapeJson(k.deskripsi)).append("\",");
                    sb.append("\"studio\":\"").append(ControllerHelper.escapeJson(k.namaStudio)).append("\",");
                    sb.append("\"rating\":").append(String.format(java.util.Locale.US, "%.2f", k.ratingRataRata)).append(",");
                    sb.append("\"total_chapters\":").append(k.totalChapters).append(",");
                    sb.append("\"categories\":[");
                    for (int c = 0; c < k.categories.size(); c++) {
                        sb.append("\"").append(ControllerHelper.escapeJson(k.categories.get(c))).append("\"");
                        if (c < k.categories.size() - 1) sb.append(",");
                    }
                    sb.append("]}}");

                    ControllerHelper.sendJson(exchange, 200, sb.toString());
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
                int creatorId = ControllerHelper.extractJsonInt(body, "creator_id", -1);
                String title = ControllerHelper.extractJsonValue(body, "title");
                if (title.isEmpty()) title = ControllerHelper.extractJsonValue(body, "nama_komik");
                String description = ControllerHelper.extractJsonValue(body, "description");
                String studio = ControllerHelper.extractJsonValue(body, "studio");

                if (id <= 0 || title.isEmpty()) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"ID dan judul komik wajib diisi.\"}");
                    return;
                }

                try {
                    boolean updated = controller.updateKomik(id, creatorId, title, description, studio, null);
                    if (updated) {
                        ControllerHelper.sendJson(exchange, 200, "{\"success\":true,\"message\":\"Komik berhasil diperbarui.\"}");
                    } else {
                        ControllerHelper.sendJson(exchange, 404, "{\"success\":false,\"message\":\"Komik tidak ditemukan.\"}");
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
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"ID komik wajib disertakan.\"}");
                    return;
                }

                try {
                    int id = Integer.parseInt(idStr);
                    boolean deleted = controller.deleteKomik(id);
                    if (deleted) {
                        ControllerHelper.sendJson(exchange, 200, "{\"success\":true,\"message\":\"Komik berhasil dihapus.\"}");
                    } else {
                        ControllerHelper.sendJson(exchange, 404, "{\"success\":false,\"message\":\"Komik tidak ditemukan.\"}");
                    }
                } catch (Exception e) {
                    ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"" + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
                }
            } else {
                ControllerHelper.sendJson(exchange, 405, "{\"success\":false,\"message\":\"Method tidak diizinkan.\"}");
            }
        }
    }

    // =========================================================
    // 4. HTTP Handler untuk Admin Verifikasi Komik (/api/comics/verify)
    // =========================================================
    public static class KomikVerifyHttpHandler implements HttpHandler {
        private final KomikController controller = new KomikController();

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            ControllerHelper.setCORSHeaders(exchange);

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                ControllerHelper.sendJson(exchange, 405, "{\"success\":false,\"message\":\"Method tidak diizinkan.\"}");
                return;
            }

            String body = ControllerHelper.readRequestBody(exchange);
            int comicId = ControllerHelper.extractJsonInt(body, "comic_id", -1);
            int adminId = ControllerHelper.extractJsonInt(body, "admin_id", -1);

            if (comicId <= 0 || adminId <= 0) {
                ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"comic_id dan admin_id wajib disertakan.\"}");
                return;
            }

            try {
                boolean verified = controller.verifyKomik(comicId, adminId);
                if (verified) {
                    ControllerHelper.sendJson(exchange, 200, String.format("{\"success\":true,\"message\":\"Komik ID %d berhasil diverifikasi oleh Admin.\",\"comic_id\":%d}", comicId, comicId));
                } else {
                    ControllerHelper.sendJson(exchange, 403, "{\"success\":false,\"message\":\"Verifikasi gagal.\"}");
                }
            } catch (IllegalArgumentException e) {
                ControllerHelper.sendJson(exchange, 403, "{\"success\":false,\"message\":\"" + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
            } catch (SQLException e) {
                e.printStackTrace();
                ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Kesalahan database: " + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    // =========================================================
    // 5. HTTP Handler untuk Statistik Komik/Author (/api/comics/stats)
    // =========================================================
    public static class KomikStatsHttpHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            ControllerHelper.setCORSHeaders(exchange);

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            Map<String, String> params = ControllerHelper.parseQueryParams(exchange.getRequestURI());
            String comicIdStr = params.get("id");
            String creatorIdStr = params.get("creator_id");

            try (Connection conn = DatabaseConnection.getConnection()) {
                if (comicIdStr != null && !comicIdStr.isEmpty()) {
                    int comicId = Integer.parseInt(comicIdStr);
                    String sql = "SELECT k.nama_komik, k.rating_rata_rata, " +
                                 "(SELECT COUNT(*) FROM bab WHERE id_komik = k.id_komik) AS total_bab, " +
                                 "(SELECT COUNT(*) FROM komentar_rating WHERE id_komik = k.id_komik) AS total_komentar, " +
                                 "(SELECT COUNT(*) FROM bookmark WHERE id_komik = k.id_komik) AS total_bookmark " +
                                 "FROM komik k WHERE k.id_komik = ?";
                    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                        stmt.setInt(1, comicId);
                        try (ResultSet rs = stmt.executeQuery()) {
                            if (rs.next()) {
                                String response = String.format(
                                    "{\"success\":true,\"data\":{\"comic_id\":%d,\"title\":\"%s\",\"rating\":%.2f,\"total_chapters\":%d,\"total_comments\":%d,\"total_bookmarks\":%d}}",
                                    comicId,
                                    ControllerHelper.escapeJson(rs.getString("nama_komik")),
                                    rs.getDouble("rating_rata_rata"),
                                    rs.getInt("total_bab"),
                                    rs.getInt("total_komentar"),
                                    rs.getInt("total_bookmark")
                                );
                                ControllerHelper.sendJson(exchange, 200, response);
                                return;
                            }
                        }
                    }
                    ControllerHelper.sendJson(exchange, 404, "{\"success\":false,\"message\":\"Komik tidak ditemukan.\"}");
                } else if (creatorIdStr != null && !creatorIdStr.isEmpty()) {
                    int creatorId = Integer.parseInt(creatorIdStr);
                    String sql = "SELECT COUNT(*) AS total_komik, COALESCE(AVG(rating_rata_rata), 0) AS avg_rating " +
                                 "FROM komik WHERE id_kreator = ?";
                    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                        stmt.setInt(1, creatorId);
                        try (ResultSet rs = stmt.executeQuery()) {
                            if (rs.next()) {
                                String response = String.format(
                                    "{\"success\":true,\"data\":{\"creator_id\":%d,\"total_comics\":%d,\"average_rating\":%.2f}}",
                                    creatorId,
                                    rs.getInt("total_komik"),
                                    rs.getDouble("avg_rating")
                                );
                                ControllerHelper.sendJson(exchange, 200, response);
                                return;
                            }
                        }
                    }
                    ControllerHelper.sendJson(exchange, 404, "{\"success\":false,\"message\":\"Kreator tidak ditemukan.\"}");
                } else {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"Parameter id komik atau creator_id wajib disertakan.\"}");
                }
            } catch (Exception e) {
                ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"" + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
            }
        }
    }
}

