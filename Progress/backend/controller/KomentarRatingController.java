import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class KomentarRatingController {

    public static class ReviewDTO {
        public int idUlasan;
        public int idPengguna;
        public String username;
        public int idKomik;
        public String namaKomik;
        public String isiKomentar;
        public double nilaiRating;
        public String tanggalKomentar;

        public ReviewDTO(int idUlasan, int idPengguna, String username, int idKomik,
                         String namaKomik, String isiKomentar, double nilaiRating, String tanggalKomentar) {
            this.idUlasan = idUlasan;
            this.idPengguna = idPengguna;
            this.username = username;
            this.idKomik = idKomik;
            this.namaKomik = namaKomik;
            this.isiKomentar = isiKomentar;
            this.nilaiRating = nilaiRating;
            this.tanggalKomentar = tanggalKomentar;
        }
    }

    // =========================================================
    // 1. Method Bisnis & Query Database
    // =========================================================
    public List<ReviewDTO> getReviewsByComic(int idKomik, String sort) throws SQLException {
        List<ReviewDTO> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
            "SELECT kr.id_ulasan, kr.id_pengguna, u.username, kr.id_komik, k.nama_komik, " +
            "kr.isi_komentar, kr.nilai_rating, kr.tanggal_komentar " +
            "FROM komentar_rating kr " +
            "JOIN pengguna u ON kr.id_pengguna = u.id_pengguna " +
            "JOIN komik k ON kr.id_komik = k.id_komik " +
            "WHERE kr.id_komik = ? "
        );

        if ("oldest".equalsIgnoreCase(sort)) {
            sql.append("ORDER BY kr.tanggal_komentar ASC, kr.id_ulasan ASC");
        } else if ("highest".equalsIgnoreCase(sort)) {
            sql.append("ORDER BY kr.nilai_rating DESC, kr.tanggal_komentar DESC");
        } else if ("lowest".equalsIgnoreCase(sort)) {
            sql.append("ORDER BY kr.nilai_rating ASC, kr.tanggal_komentar DESC");
        } else {
            // Default: newest
            sql.append("ORDER BY kr.tanggal_komentar DESC, kr.id_ulasan DESC");
        }

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {

            stmt.setInt(1, idKomik);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(new ReviewDTO(
                        rs.getInt("id_ulasan"),
                        rs.getInt("id_pengguna"),
                        rs.getString("username"),
                        rs.getInt("id_komik"),
                        rs.getString("nama_komik"),
                        rs.getString("isi_komentar"),
                        rs.getDouble("nilai_rating"),
                        rs.getString("tanggal_komentar")
                    ));
                }
            }
        }
        return list;
    }

    public boolean addReview(int idPengguna, int idKomik, String isiKomentar, double nilaiRating) throws SQLException {
        if (idPengguna <= 0 || idKomik <= 0) {
            throw new IllegalArgumentException("ID Pengguna dan ID Komik wajib diisi.");
        }
        if (isiKomentar == null || isiKomentar.trim().isEmpty()) {
            throw new IllegalArgumentException("Isi komentar tidak boleh kosong.");
        }
        if (nilaiRating < 1.0 || nilaiRating > 5.0) {
            throw new IllegalArgumentException("Rating harus di antara 1 sampai 5.");
        }

        String userSql = "SELECT username, email, password FROM pengguna WHERE id_pengguna = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement userStmt = conn.prepareStatement(userSql)) {
            userStmt.setInt(1, idPengguna);
            try (ResultSet rs = userStmt.executeQuery()) {
                if (!rs.next()) {
                    throw new IllegalArgumentException("Pengguna tidak ditemukan.");
                }
                Pembaca pembaca = new Pembaca(rs.getString("username"), rs.getString("email"), rs.getString("password"));
                pembaca.login(rs.getString("username"), rs.getString("password"));
                pembaca.komentar(idKomik, isiKomentar);
                pembaca.beriRating(idKomik, nilaiRating);
            }
        }

        // Insert ke database
        String insertSql = "INSERT INTO komentar_rating (id_pengguna, id_komik, isi_komentar, nilai_rating, tanggal_komentar) VALUES (?, ?, ?, ?, NOW())";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(insertSql)) {

            stmt.setInt(1, idPengguna);
            stmt.setInt(2, idKomik);
            stmt.setString(3, isiKomentar.trim());
            stmt.setDouble(4, nilaiRating);

            int affected = stmt.executeUpdate();
            if (affected > 0) {
                // Hitung ulang rata-rata rating komik
                recalculateComicRating(idKomik);
                return true;
            }
        }
        return false;
    }

    public List<ReviewDTO> getReviewsForAuthor(int idKreator) throws SQLException {
        List<ReviewDTO> list = new ArrayList<>();
        String sql = "SELECT kr.id_ulasan, kr.id_pengguna, u.username, kr.id_komik, k.nama_komik, " +
                     "kr.isi_komentar, kr.nilai_rating, kr.tanggal_komentar " +
                     "FROM komentar_rating kr " +
                     "JOIN pengguna u ON kr.id_pengguna = u.id_pengguna " +
                     "JOIN komik k ON kr.id_komik = k.id_komik " +
                     "WHERE k.id_kreator = ? " +
                     "ORDER BY kr.tanggal_komentar DESC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, idKreator);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(new ReviewDTO(
                        rs.getInt("id_ulasan"),
                        rs.getInt("id_pengguna"),
                        rs.getString("username"),
                        rs.getInt("id_komik"),
                        rs.getString("nama_komik"),
                        rs.getString("isi_komentar"),
                        rs.getDouble("nilai_rating"),
                        rs.getString("tanggal_komentar")
                    ));
                }
            }
        }
        return list;
    }

    public boolean deleteReview(int idUlasan, int idPengguna, String role) throws SQLException {
        // Ambil id_komik sebelum dihapus agar bisa menghitung ulang rating
        int idKomik = -1;
        String selectSql = "SELECT id_komik, id_pengguna FROM komentar_rating WHERE id_ulasan = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(selectSql)) {
            stmt.setInt(1, idUlasan);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) return false;
                idKomik = rs.getInt("id_komik");
                int ownerId = rs.getInt("id_pengguna");

                if (!"Admin".equalsIgnoreCase(role) && ownerId != idPengguna) {
                    throw new IllegalArgumentException("Anda tidak berhak menghapus ulasan ini.");
                }
            }
        }

        String deleteSql = "DELETE FROM komentar_rating WHERE id_ulasan = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(deleteSql)) {
            stmt.setInt(1, idUlasan);
            int affected = stmt.executeUpdate();
            if (affected > 0 && idKomik > 0) {
                recalculateComicRating(idKomik);
                return true;
            }
        }
        return false;
    }

    private void recalculateComicRating(int idKomik) throws SQLException {
        String avgSql = "SELECT COALESCE(AVG(nilai_rating), 0.0) AS avg_rating FROM komentar_rating WHERE id_komik = ?";
        double avgRating = 0.0;
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(avgSql)) {
            stmt.setInt(1, idKomik);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    avgRating = rs.getDouble("avg_rating");
                }
            }
        }

        String updateSql = "UPDATE komik SET rating_rata_rata = ? WHERE id_komik = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(updateSql)) {
            stmt.setDouble(1, avgRating);
            stmt.setInt(2, idKomik);
            stmt.executeUpdate();
        }
    }

    // =========================================================
    // 2. HTTP Handler untuk Komentar & Rating (/api/reviews)
    // =========================================================
    public static class ReviewListHttpHandler implements HttpHandler {
        private final KomentarRatingController controller = new KomentarRatingController();

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

                String sort = params.get("sort");
                try {
                    int comicId = Integer.parseInt(comicIdStr);
                    List<ReviewDTO> reviews = controller.getReviewsByComic(comicId, sort);

                    StringBuilder sb = new StringBuilder();
                    sb.append("{\"success\":true,\"total\":").append(reviews.size()).append(",\"data\":[");
                    for (int i = 0; i < reviews.size(); i++) {
                        ReviewDTO r = reviews.get(i);
                        sb.append(String.format(java.util.Locale.US,
                            "{\"id\":%d,\"user_id\":%d,\"username\":\"%s\",\"comic_id\":%d,\"comic_name\":\"%s\",\"comment\":\"%s\",\"rating\":%.1f,\"created_at\":\"%s\"}",
                            r.idUlasan, r.idPengguna,
                            ControllerHelper.escapeJson(r.username),
                            r.idKomik,
                            ControllerHelper.escapeJson(r.namaKomik),
                            ControllerHelper.escapeJson(r.isiKomentar),
                            r.nilaiRating,
                            ControllerHelper.escapeJson(r.tanggalKomentar)
                        ));
                        if (i < reviews.size() - 1) sb.append(",");
                    }
                    sb.append("]}");

                    ControllerHelper.sendJson(exchange, 200, sb.toString());
                } catch (NumberFormatException e) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"ID tidak valid.\"}");
                } catch (SQLException e) {
                    e.printStackTrace();
                    ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Kesalahan database: " + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
                }
            } else if ("POST".equals(method)) {
                String body = ControllerHelper.readRequestBody(exchange);
                int userId = ControllerHelper.extractJsonInt(body, "user_id", -1);
                if (userId == -1) userId = ControllerHelper.extractJsonInt(body, "id_pengguna", -1);

                int comicId = ControllerHelper.extractJsonInt(body, "comic_id", -1);
                if (comicId == -1) comicId = ControllerHelper.extractJsonInt(body, "id_komik", -1);

                String comment = ControllerHelper.extractJsonValue(body, "comment");
                if (comment.isEmpty()) comment = ControllerHelper.extractJsonValue(body, "isi_komentar");

                double rating = ControllerHelper.extractJsonDouble(body, "rating", 5.0);
                if (rating <= 0) rating = ControllerHelper.extractJsonDouble(body, "nilai_rating", 5.0);

                if (userId <= 0 || comicId <= 0 || comment.isEmpty()) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"user_id, comic_id, dan komentar wajib diisi.\"}");
                    return;
                }

                try {
                    boolean success = controller.addReview(userId, comicId, comment, rating);
                    if (success) {
                        ControllerHelper.sendJson(exchange, 201, "{\"success\":true,\"message\":\"Ulasan dan rating berhasil dikirim!\"}");
                    } else {
                        ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Gagal mengirim ulasan.\"}");
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
    // 3. HTTP Handler untuk Hapus Review (/api/reviews/detail)
    // =========================================================
    public static class ReviewDetailHttpHandler implements HttpHandler {
        private final KomentarRatingController controller = new KomentarRatingController();

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            ControllerHelper.setCORSHeaders(exchange);

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"DELETE".equalsIgnoreCase(exchange.getRequestMethod())) {
                ControllerHelper.sendJson(exchange, 405, "{\"success\":false,\"message\":\"Method tidak diizinkan.\"}");
                return;
            }

            Map<String, String> params = ControllerHelper.parseQueryParams(exchange.getRequestURI());
            String idStr = params.get("id");
            String userIdStr = params.get("user_id");
            String role = params.get("role");

            if (idStr == null || idStr.isEmpty()) {
                String body = ControllerHelper.readRequestBody(exchange);
                int id = ControllerHelper.extractJsonInt(body, "id", -1);
                if (id > 0) idStr = String.valueOf(id);
                int uId = ControllerHelper.extractJsonInt(body, "user_id", -1);
                if (uId > 0) userIdStr = String.valueOf(uId);
                String r = ControllerHelper.extractJsonValue(body, "role");
                if (!r.isEmpty()) role = r;
            }

            if (idStr == null || idStr.isEmpty()) {
                ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"ID ulasan wajib disertakan.\"}");
                return;
            }

            int idUlasan = Integer.parseInt(idStr);
            int idPengguna = userIdStr != null ? Integer.parseInt(userIdStr) : -1;

            try {
                boolean deleted = controller.deleteReview(idUlasan, idPengguna, role != null ? role : "Pembaca");
                if (deleted) {
                    ControllerHelper.sendJson(exchange, 200, "{\"success\":true,\"message\":\"Ulasan berhasil dihapus.\"}");
                } else {
                    ControllerHelper.sendJson(exchange, 404, "{\"success\":false,\"message\":\"Ulasan tidak ditemukan.\"}");
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
    // 4. HTTP Handler untuk Review Author (/api/author/reviews)
    // =========================================================
    public static class AuthorReviewsHttpHandler implements HttpHandler {
        private final KomentarRatingController controller = new KomentarRatingController();

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            ControllerHelper.setCORSHeaders(exchange);

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                ControllerHelper.sendJson(exchange, 405, "{\"success\":false,\"message\":\"Method tidak diizinkan.\"}");
                return;
            }

            Map<String, String> params = ControllerHelper.parseQueryParams(exchange.getRequestURI());
            String creatorIdStr = params.get("creator_id");
            if (creatorIdStr == null) creatorIdStr = params.get("id_kreator");

            if (creatorIdStr == null || creatorIdStr.isEmpty()) {
                ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"Parameter creator_id wajib disertakan.\"}");
                return;
            }

            try {
                int creatorId = Integer.parseInt(creatorIdStr);
                List<ReviewDTO> list = controller.getReviewsForAuthor(creatorId);

                StringBuilder sb = new StringBuilder();
                sb.append("{\"success\":true,\"total\":").append(list.size()).append(",\"data\":[");
                for (int i = 0; i < list.size(); i++) {
                    ReviewDTO r = list.get(i);
                    sb.append(String.format(java.util.Locale.US,
                        "{\"id\":%d,\"user_id\":%d,\"username\":\"%s\",\"comic_id\":%d,\"comic_name\":\"%s\",\"comment\":\"%s\",\"rating\":%.1f,\"created_at\":\"%s\"}",
                        r.idUlasan, r.idPengguna,
                        ControllerHelper.escapeJson(r.username),
                        r.idKomik,
                        ControllerHelper.escapeJson(r.namaKomik),
                        ControllerHelper.escapeJson(r.isiKomentar),
                        r.nilaiRating,
                        ControllerHelper.escapeJson(r.tanggalKomentar)
                    ));
                    if (i < list.size() - 1) sb.append(",");
                }
                sb.append("]}");

                ControllerHelper.sendJson(exchange, 200, sb.toString());
            } catch (Exception e) {
                ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"" + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
            }
        }
    }
}

