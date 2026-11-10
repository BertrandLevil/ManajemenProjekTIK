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

public class BookmarkHistoriController {

    public static class BookmarkDTO {
        public int idBookmark;
        public int idPengguna;
        public int idKomik;
        public String namaKomik;
        public String namaStudio;
        public double ratingRataRata;
        public String tanggalDitambahkan;

        public BookmarkDTO(int idBookmark, int idPengguna, int idKomik, String namaKomik,
                           String namaStudio, double ratingRataRata, String tanggalDitambahkan) {
            this.idBookmark = idBookmark;
            this.idPengguna = idPengguna;
            this.idKomik = idKomik;
            this.namaKomik = namaKomik;
            this.namaStudio = namaStudio;
            this.ratingRataRata = ratingRataRata;
            this.tanggalDitambahkan = tanggalDitambahkan;
        }
    }

    public static class HistoriDTO {
        public int idHistori;
        public int idPengguna;
        public int idBab;
        public int nomorBab;
        public int idKomik;
        public String namaKomik;
        public String tanggalBaca;

        public HistoriDTO(int idHistori, int idPengguna, int idBab, int nomorBab,
                          int idKomik, String namaKomik, String tanggalBaca) {
            this.idHistori = idHistori;
            this.idPengguna = idPengguna;
            this.idBab = idBab;
            this.nomorBab = nomorBab;
            this.idKomik = idKomik;
            this.namaKomik = namaKomik;
            this.tanggalBaca = tanggalBaca;
        }
    }

    // =========================================================
    // 1. Method Bisnis & Query: Bookmark
    // =========================================================
    public List<BookmarkDTO> getBookmarksByUser(int idPengguna) throws SQLException {
        List<BookmarkDTO> list = new ArrayList<>();
        String sql = "SELECT b.id_bookmark, b.id_pengguna, b.id_komik, k.nama_komik, " +
                     "k.nama_studio, k.rating_rata_rata, b.tanggal_ditambahkan " +
                     "FROM bookmark b " +
                     "JOIN komik k ON b.id_komik = k.id_komik " +
                     "WHERE b.id_pengguna = ? " +
                     "ORDER BY b.tanggal_ditambahkan DESC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, idPengguna);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(new BookmarkDTO(
                        rs.getInt("id_bookmark"),
                        rs.getInt("id_pengguna"),
                        rs.getInt("id_komik"),
                        rs.getString("nama_komik"),
                        rs.getString("nama_studio"),
                        rs.getDouble("rating_rata_rata"),
                        rs.getString("tanggal_ditambahkan")
                    ));
                }
            }
        }
        return list;
    }

    public boolean addBookmark(int idPengguna, int idKomik) throws SQLException {
        if (idPengguna <= 0 || idKomik <= 0) {
            throw new IllegalArgumentException("ID Pengguna dan ID Komik wajib diisi.");
        }

        // Cek apakah sudah ada di bookmark
        String checkSql = "SELECT id_bookmark FROM bookmark WHERE id_pengguna = ? AND id_komik = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
            checkStmt.setInt(1, idPengguna);
            checkStmt.setInt(2, idKomik);
            try (ResultSet rs = checkStmt.executeQuery()) {
                if (rs.next()) {
                    return true; // Sudah di-bookmark
                }
            }
        }

        String insertSql = "INSERT INTO bookmark (id_pengguna, id_komik, tanggal_ditambahkan) VALUES (?, ?, NOW())";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(insertSql)) {
            stmt.setInt(1, idPengguna);
            stmt.setInt(2, idKomik);
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean removeBookmark(int idPengguna, int idKomik) throws SQLException {
        String deleteSql = "DELETE FROM bookmark WHERE id_pengguna = ? AND id_komik = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(deleteSql)) {
            stmt.setInt(1, idPengguna);
            stmt.setInt(2, idKomik);
            return stmt.executeUpdate() > 0;
        }
    }

    // =========================================================
    // 2. Method Bisnis & Query: Histori Baca
    // =========================================================
    public List<HistoriDTO> getHistoriByUser(int idPengguna) throws SQLException {
        List<HistoriDTO> list = new ArrayList<>();
        String sql = "SELECT h.id_histori, h.id_pengguna, h.id_bab, b.nomor_bab, " +
                     "k.id_komik, k.nama_komik, h.tanggal_baca " +
                     "FROM histori_baca h " +
                     "JOIN bab b ON h.id_bab = b.id_bab " +
                     "JOIN komik k ON b.id_komik = k.id_komik " +
                     "WHERE h.id_pengguna = ? " +
                     "ORDER BY h.tanggal_baca DESC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, idPengguna);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(new HistoriDTO(
                        rs.getInt("id_histori"),
                        rs.getInt("id_pengguna"),
                        rs.getInt("id_bab"),
                        rs.getInt("nomor_bab"),
                        rs.getInt("id_komik"),
                        rs.getString("nama_komik"),
                        rs.getString("tanggal_baca")
                    ));
                }
            }
        }
        return list;
    }

    public boolean addHistoriBaca(int idPengguna, int idBab) throws SQLException {
        if (idPengguna <= 0 || idBab <= 0) {
            throw new IllegalArgumentException("ID Pengguna dan ID Bab wajib diisi.");
        }

        String babSql = "SELECT id_komik FROM bab WHERE id_bab = ?";
        int idKomik = -1;
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(babSql)) {
            stmt.setInt(1, idBab);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    idKomik = rs.getInt("id_komik");
                }
            }
        }

        if (idKomik > 0) {
            String userSql = "SELECT username, email, password FROM pengguna WHERE id_pengguna = ?";
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement uStmt = conn.prepareStatement(userSql)) {
                uStmt.setInt(1, idPengguna);
                try (ResultSet rs = uStmt.executeQuery()) {
                    if (rs.next()) {
                        Pembaca pembaca = new Pembaca(rs.getString("username"), rs.getString("email"), rs.getString("password"));
                        pembaca.login(rs.getString("username"), rs.getString("password"));
                        pembaca.bacaKomik(idKomik);
                    }
                }
            }
        }

        String insertSql = "INSERT INTO histori_baca (id_pengguna, id_bab, tanggal_baca) VALUES (?, ?, NOW())";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(insertSql)) {
            stmt.setInt(1, idPengguna);
            stmt.setInt(2, idBab);
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean deleteHistori(int idHistori, int idPengguna) throws SQLException {
        String deleteSql = "DELETE FROM histori_baca WHERE id_histori = ? AND id_pengguna = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(deleteSql)) {
            stmt.setInt(1, idHistori);
            stmt.setInt(2, idPengguna);
            return stmt.executeUpdate() > 0;
        }
    }

    // =========================================================
    // 3. HTTP Handler untuk Bookmark (/api/bookmarks)
    // =========================================================
    public static class BookmarkHttpHandler implements HttpHandler {
        private final BookmarkHistoriController controller = new BookmarkHistoriController();

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
                String userIdStr = params.get("user_id");
                if (userIdStr == null) userIdStr = params.get("id_pengguna");

                if (userIdStr == null || userIdStr.isEmpty()) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"Parameter user_id wajib disertakan.\"}");
                    return;
                }

                try {
                    int userId = Integer.parseInt(userIdStr);
                    List<BookmarkDTO> bookmarks = controller.getBookmarksByUser(userId);

                    StringBuilder sb = new StringBuilder();
                    sb.append("{\"success\":true,\"total\":").append(bookmarks.size()).append(",\"data\":[");
                    for (int i = 0; i < bookmarks.size(); i++) {
                        BookmarkDTO b = bookmarks.get(i);
                        sb.append(String.format(java.util.Locale.US,
                            "{\"id\":%d,\"user_id\":%d,\"comic_id\":%d,\"comic_name\":\"%s\",\"studio\":\"%s\",\"rating\":%.2f,\"added_at\":\"%s\"}",
                            b.idBookmark, b.idPengguna, b.idKomik,
                            ControllerHelper.escapeJson(b.namaKomik),
                            ControllerHelper.escapeJson(b.namaStudio),
                            b.ratingRataRata,
                            ControllerHelper.escapeJson(b.tanggalDitambahkan)
                        ));
                        if (i < bookmarks.size() - 1) sb.append(",");
                    }
                    sb.append("]}");

                    ControllerHelper.sendJson(exchange, 200, sb.toString());
                } catch (NumberFormatException e) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"user_id tidak valid.\"}");
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

                if (userId <= 0 || comicId <= 0) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"user_id dan comic_id wajib disertakan.\"}");
                    return;
                }

                try {
                    boolean added = controller.addBookmark(userId, comicId);
                    if (added) {
                        ControllerHelper.sendJson(exchange, 201, "{\"success\":true,\"message\":\"Komik berhasil ditambahkan ke bookmark.\"}");
                    } else {
                        ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Gagal menambahkan bookmark.\"}");
                    }
                } catch (Exception e) {
                    ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"" + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
                }
            } else if ("DELETE".equals(method)) {
                String userIdStr = params.get("user_id");
                String comicIdStr = params.get("comic_id");

                if (userIdStr == null || comicIdStr == null) {
                    String body = ControllerHelper.readRequestBody(exchange);
                    int uId = ControllerHelper.extractJsonInt(body, "user_id", -1);
                    int cId = ControllerHelper.extractJsonInt(body, "comic_id", -1);
                    if (uId > 0) userIdStr = String.valueOf(uId);
                    if (cId > 0) comicIdStr = String.valueOf(cId);
                }

                if (userIdStr == null || comicIdStr == null) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"user_id dan comic_id wajib disertakan.\"}");
                    return;
                }

                try {
                    int userId = Integer.parseInt(userIdStr);
                    int comicId = Integer.parseInt(comicIdStr);
                    boolean removed = controller.removeBookmark(userId, comicId);
                    if (removed) {
                        ControllerHelper.sendJson(exchange, 200, "{\"success\":true,\"message\":\"Bookmark berhasil dihapus.\"}");
                    } else {
                        ControllerHelper.sendJson(exchange, 404, "{\"success\":false,\"message\":\"Bookmark tidak ditemukan.\"}");
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
    // 4. HTTP Handler untuk Histori Baca (/api/history)
    // =========================================================
    public static class HistoriBacaHttpHandler implements HttpHandler {
        private final BookmarkHistoriController controller = new BookmarkHistoriController();

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
                String userIdStr = params.get("user_id");
                if (userIdStr == null) userIdStr = params.get("id_pengguna");

                if (userIdStr == null || userIdStr.isEmpty()) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"Parameter user_id wajib disertakan.\"}");
                    return;
                }

                try {
                    int userId = Integer.parseInt(userIdStr);
                    List<HistoriDTO> history = controller.getHistoriByUser(userId);

                    StringBuilder sb = new StringBuilder();
                    sb.append("{\"success\":true,\"total\":").append(history.size()).append(",\"data\":[");
                    for (int i = 0; i < history.size(); i++) {
                        HistoriDTO h = history.get(i);
                        sb.append(String.format(
                            "{\"id\":%d,\"user_id\":%d,\"chapter_id\":%d,\"chapter_number\":%d,\"comic_id\":%d,\"comic_name\":\"%s\",\"read_at\":\"%s\"}",
                            h.idHistori, h.idPengguna, h.idBab, h.nomorBab, h.idKomik,
                            ControllerHelper.escapeJson(h.namaKomik),
                            ControllerHelper.escapeJson(h.tanggalBaca)
                        ));
                        if (i < history.size() - 1) sb.append(",");
                    }
                    sb.append("]}");

                    ControllerHelper.sendJson(exchange, 200, sb.toString());
                } catch (NumberFormatException e) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"user_id tidak valid.\"}");
                } catch (SQLException e) {
                    e.printStackTrace();
                    ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Kesalahan database: " + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
                }
            } else if ("POST".equals(method)) {
                String body = ControllerHelper.readRequestBody(exchange);
                int userId = ControllerHelper.extractJsonInt(body, "user_id", -1);
                if (userId == -1) userId = ControllerHelper.extractJsonInt(body, "id_pengguna", -1);

                int chapterId = ControllerHelper.extractJsonInt(body, "chapter_id", -1);
                if (chapterId == -1) chapterId = ControllerHelper.extractJsonInt(body, "id_bab", -1);

                if (userId <= 0 || chapterId <= 0) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"user_id dan chapter_id wajib disertakan.\"}");
                    return;
                }

                try {
                    boolean saved = controller.addHistoriBaca(userId, chapterId);
                    if (saved) {
                        ControllerHelper.sendJson(exchange, 201, "{\"success\":true,\"message\":\"Riwayat membaca berhasil dicatat.\"}");
                    } else {
                        ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Gagal mencatat riwayat membaca.\"}");
                    }
                } catch (Exception e) {
                    ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"" + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
                }
            } else if ("DELETE".equals(method)) {
                String idStr = params.get("id");
                String userIdStr = params.get("user_id");

                if (idStr == null || userIdStr == null) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"id histori dan user_id wajib disertakan.\"}");
                    return;
                }

                try {
                    int idHistori = Integer.parseInt(idStr);
                    int userId = Integer.parseInt(userIdStr);
                    boolean deleted = controller.deleteHistori(idHistori, userId);
                    if (deleted) {
                        ControllerHelper.sendJson(exchange, 200, "{\"success\":true,\"message\":\"Riwayat berhasil dihapus.\"}");
                    } else {
                        ControllerHelper.sendJson(exchange, 404, "{\"success\":false,\"message\":\"Riwayat tidak ditemukan.\"}");
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

