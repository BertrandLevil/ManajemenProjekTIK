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
import java.util.Locale;

public class PembayaranController {

    public static class TransaksiDTO {
        public int idTransaksi;
        public int idPengguna;
        public String username;
        public String email;
        public String metodePembayaran;
        public String statusPembayaran;
        public double jumlahBayar;
        public String tanggalTransaksi;

        public TransaksiDTO(int idTransaksi, int idPengguna, String username, String email,
                            String metodePembayaran, String statusPembayaran,
                            double jumlahBayar, String tanggalTransaksi) {
            this.idTransaksi = idTransaksi;
            this.idPengguna = idPengguna;
            this.username = username;
            this.email = email;
            this.metodePembayaran = metodePembayaran;
            this.statusPembayaran = statusPembayaran;
            this.jumlahBayar = jumlahBayar;
            this.tanggalTransaksi = tanggalTransaksi;
        }
    }

    // =========================================================
    // 1. Method Bisnis & Query Database
    // =========================================================
    public int getUserIdByEmail(String email) throws SQLException {
        String sql = "SELECT id_pengguna FROM pengguna WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email.trim());
            stmt.setString(2, email.trim());
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("id_pengguna");
                }
            }
        }
        return -1;
    }

    public int createTransaksi(int idPengguna, String metodePembayaran, double jumlahBayar) throws SQLException {
        if (idPengguna <= 0) {
            throw new IllegalArgumentException("ID Pengguna tidak valid.");
        }
        if (metodePembayaran == null || metodePembayaran.trim().isEmpty()) {
            throw new IllegalArgumentException("Metode pembayaran wajib dipilih.");
        }
        if (jumlahBayar <= 0) {
            throw new IllegalArgumentException("Jumlah bayar harus lebih dari 0.");
        }

        // Simpan transaksi awal dengan status 'Menunggu'
        String insertSql = "INSERT INTO transaksi (id_pengguna, metode_pembayaran, status_pembayaran, jumlah_bayar, tanggal_transaksi) " +
                           "VALUES (?, ?, 'Menunggu', ?, NOW())";

        int generatedId = -1;
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, idPengguna);
            stmt.setString(2, metodePembayaran.trim());
            stmt.setDouble(3, jumlahBayar);

            int affected = stmt.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        generatedId = rs.getInt(1);
                    }
                }
            }
        }

        if (generatedId > 0) {
            Pembayaran pembayaranDomain = new Pembayaran(generatedId, metodePembayaran, jumlahBayar);
            pembayaranDomain.submitPayment();
        }

        return generatedId;
    }

    public boolean processPaymentResult(int idTransaksi, String status) throws SQLException {
        if (idTransaksi <= 0) {
            throw new IllegalArgumentException("ID Transaksi tidak valid.");
        }

        String validStatus = "Berhasil".equalsIgnoreCase(status) ? "Berhasil" : "Gagal";

        // Ambil data transaksi
        String selectSql = "SELECT id_pengguna, jumlah_bayar, metode_pembayaran FROM transaksi WHERE id_transaksi = ?";
        int idPengguna = -1;
        double jumlahBayar = 0;
        String metode = "";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(selectSql)) {
            stmt.setInt(1, idTransaksi);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    throw new IllegalArgumentException("Transaksi tidak ditemukan.");
                }
                idPengguna = rs.getInt("id_pengguna");
                jumlahBayar = rs.getDouble("jumlah_bayar");
                metode = rs.getString("metode_pembayaran");
            }
        }

        Pembayaran pembayaran = new Pembayaran(idTransaksi, metode, jumlahBayar);
        boolean domainResult = pembayaran.processPaymentResult();

        // Update status transaksi
        String updateTxSql = "UPDATE transaksi SET status_pembayaran = ? WHERE id_transaksi = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(updateTxSql)) {
            stmt.setString(1, validStatus);
            stmt.setInt(2, idTransaksi);
            stmt.executeUpdate();
        }

        // Jika berhasil, upgrade pengguna menjadi is_premium = 1
        if ("Berhasil".equals(validStatus)) {
            String updateUserSql = "UPDATE pengguna SET is_premium = 1 WHERE id_pengguna = ?";
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(updateUserSql)) {
                stmt.setInt(1, idPengguna);
                stmt.executeUpdate();
            }

            String userSql = "SELECT username, email, password FROM pengguna WHERE id_pengguna = ?";
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(userSql)) {
                stmt.setInt(1, idPengguna);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        Pembaca pembaca = new Pembaca(rs.getString("username"), rs.getString("email"), rs.getString("password"));
                        pembaca.login(rs.getString("username"), rs.getString("password"));
                        pembaca.pembayaran(jumlahBayar);
                    }
                }
            }
        }

        return true;
    }

    public List<TransaksiDTO> getTransaksiByUser(int idPengguna) throws SQLException {
        List<TransaksiDTO> list = new ArrayList<>();
        String sql = "SELECT t.id_transaksi, t.id_pengguna, u.username, u.email, " +
                     "t.metode_pembayaran, t.status_pembayaran, t.jumlah_bayar, t.tanggal_transaksi " +
                     "FROM transaksi t " +
                     "JOIN pengguna u ON t.id_pengguna = u.id_pengguna " +
                     "WHERE t.id_pengguna = ? " +
                     "ORDER BY t.tanggal_transaksi DESC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, idPengguna);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(new TransaksiDTO(
                        rs.getInt("id_transaksi"),
                        rs.getInt("id_pengguna"),
                        rs.getString("username"),
                        rs.getString("email"),
                        rs.getString("metode_pembayaran"),
                        rs.getString("status_pembayaran"),
                        rs.getDouble("jumlah_bayar"),
                        rs.getString("tanggal_transaksi")
                    ));
                }
            }
        }
        return list;
    }

    public List<TransaksiDTO> getAllTransaksi() throws SQLException {
        List<TransaksiDTO> list = new ArrayList<>();
        String sql = "SELECT t.id_transaksi, t.id_pengguna, u.username, u.email, " +
                     "t.metode_pembayaran, t.status_pembayaran, t.jumlah_bayar, t.tanggal_transaksi " +
                     "FROM transaksi t " +
                     "JOIN pengguna u ON t.id_pengguna = u.id_pengguna " +
                     "ORDER BY t.tanggal_transaksi DESC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                list.add(new TransaksiDTO(
                    rs.getInt("id_transaksi"),
                    rs.getInt("id_pengguna"),
                    rs.getString("username"),
                    rs.getString("email"),
                    rs.getString("metode_pembayaran"),
                    rs.getString("status_pembayaran"),
                    rs.getDouble("jumlah_bayar"),
                    rs.getString("tanggal_transaksi")
                ));
            }
        }
        return list;
    }

    // =========================================================
    // 2. HTTP Handler untuk Checkout Pembayaran (/api/payment/checkout)
    // =========================================================
    public static class PaymentCheckoutHttpHandler implements HttpHandler {
        private final PembayaranController controller = new PembayaranController();

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
            int userId = ControllerHelper.extractJsonInt(body, "user_id", -1);
            if (userId == -1) userId = ControllerHelper.extractJsonInt(body, "id_pengguna", -1);
            if (userId <= 0) {
                String email = ControllerHelper.extractJsonValue(body, "email");
                if (!email.isEmpty()) {
                    try {
                        userId = controller.getUserIdByEmail(email);
                    } catch (SQLException ignored) {}
                }
            }

            String method = ControllerHelper.extractJsonValue(body, "payment_method");
            if (method.isEmpty()) method = ControllerHelper.extractJsonValue(body, "metode_pembayaran");

            double amount = ControllerHelper.extractJsonDouble(body, "amount", 30000.00);
            if (amount <= 0) amount = ControllerHelper.extractJsonDouble(body, "jumlah_bayar", 30000.00);

            // Cek apakah langsung diselesaikan otomatis (misal simulasi demo mode)
            boolean autoConfirm = ControllerHelper.extractJsonBoolean(body, "auto_confirm", false);

            if (userId <= 0 || method.isEmpty()) {
                ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"user_id dan payment_method wajib diisi.\"}");
                return;
            }

            try {
                int txId = controller.createTransaksi(userId, method, amount);
                if (txId > 0) {
                    if (autoConfirm) {
                        controller.processPaymentResult(txId, "Berhasil");
                    }
                    String response = String.format(
                        Locale.US,
                        "{\"success\":true,\"message\":\"Checkout berhasil dibuat.\",\"transaction_id\":%d,\"amount\":%.2f,\"status\":\"%s\"}",
                        txId, amount, autoConfirm ? "Berhasil" : "Menunggu"
                    );
                    ControllerHelper.sendJson(exchange, 201, response);
                } else {
                    ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Gagal membuat transaksi.\"}");
                }
            } catch (IllegalArgumentException e) {
                ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"" + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
            } catch (SQLException e) {
                e.printStackTrace();
                ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Kesalahan database: " + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    // =========================================================
    // 3. HTTP Handler untuk Konfirmasi/Proses Pembayaran (/api/payment/process)
    // =========================================================
    public static class PaymentProcessHttpHandler implements HttpHandler {
        private final PembayaranController controller = new PembayaranController();

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
            int txId = ControllerHelper.extractJsonInt(body, "transaction_id", -1);
            if (txId == -1) txId = ControllerHelper.extractJsonInt(body, "id_transaksi", -1);

            String status = ControllerHelper.extractJsonValue(body, "status");
            if (status.isEmpty()) status = "Berhasil";

            if (txId <= 0) {
                ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"transaction_id wajib disertakan.\"}");
                return;
            }

            try {
                boolean success = controller.processPaymentResult(txId, status);
                if (success) {
                    ControllerHelper.sendJson(exchange, 200, String.format(
                        "{\"success\":true,\"message\":\"Status pembayaran ID %d berhasil diperbarui menjadi '%s'!\",\"is_premium\":%s}",
                        txId, ControllerHelper.escapeJson(status), "Berhasil".equalsIgnoreCase(status) ? "true" : "false"
                    ));
                } else {
                    ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Gagal memproses transaksi.\"}");
                }
            } catch (IllegalArgumentException e) {
                ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"" + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
            } catch (SQLException e) {
                e.printStackTrace();
                ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Kesalahan database: " + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    // =========================================================
    // 4. HTTP Handler untuk Riwayat Transaksi Pengguna (/api/payment/history)
    // =========================================================
    public static class UserTransactionsHttpHandler implements HttpHandler {
        private final PembayaranController controller = new PembayaranController();

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
            String userIdStr = params.get("user_id");
            if (userIdStr == null) userIdStr = params.get("id_pengguna");

            if (userIdStr == null || userIdStr.isEmpty()) {
                ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"Parameter user_id wajib disertakan.\"}");
                return;
            }

            try {
                int userId = Integer.parseInt(userIdStr);
                List<TransaksiDTO> list = controller.getTransaksiByUser(userId);

                StringBuilder sb = new StringBuilder();
                sb.append("{\"success\":true,\"total\":").append(list.size()).append(",\"data\":[");
                for (int i = 0; i < list.size(); i++) {
                    TransaksiDTO t = list.get(i);
                    sb.append(String.format(java.util.Locale.US,
                        "{\"id\":%d,\"user_id\":%d,\"username\":\"%s\",\"method\":\"%s\",\"status\":\"%s\",\"amount\":%.2f,\"date\":\"%s\"}",
                        t.idTransaksi, t.idPengguna,
                        ControllerHelper.escapeJson(t.username),
                        ControllerHelper.escapeJson(t.metodePembayaran),
                        ControllerHelper.escapeJson(t.statusPembayaran),
                        t.jumlahBayar,
                        ControllerHelper.escapeJson(t.tanggalTransaksi)
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

    // =========================================================
    // 5. HTTP Handler untuk Admin Kelola Pembayaran (/api/admin/transactions)
    // =========================================================
    public static class AdminTransactionsHttpHandler implements HttpHandler {
        private final PembayaranController controller = new PembayaranController();

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
                    List<TransaksiDTO> list = controller.getAllTransaksi();

                    StringBuilder sb = new StringBuilder();
                    sb.append("{\"success\":true,\"total\":").append(list.size()).append(",\"data\":[");
                    for (int i = 0; i < list.size(); i++) {
                        TransaksiDTO t = list.get(i);
                        sb.append(String.format(java.util.Locale.US,
                            "{\"id\":%d,\"user_id\":%d,\"username\":\"%s\",\"email\":\"%s\",\"method\":\"%s\",\"status\":\"%s\",\"amount\":%.2f,\"date\":\"%s\"}",
                            t.idTransaksi, t.idPengguna,
                            ControllerHelper.escapeJson(t.username),
                            ControllerHelper.escapeJson(t.email),
                            ControllerHelper.escapeJson(t.metodePembayaran),
                            ControllerHelper.escapeJson(t.statusPembayaran),
                            t.jumlahBayar,
                            ControllerHelper.escapeJson(t.tanggalTransaksi)
                        ));
                        if (i < list.size() - 1) sb.append(",");
                    }
                    sb.append("]}");

                    ControllerHelper.sendJson(exchange, 200, sb.toString());
                } catch (SQLException e) {
                    e.printStackTrace();
                    ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Kesalahan database: " + ControllerHelper.escapeJson(e.getMessage()) + "\"}");
                }
            } else if ("PUT".equals(method)) {
                String body = ControllerHelper.readRequestBody(exchange);
                int txId = ControllerHelper.extractJsonInt(body, "transaction_id", -1);
                if (txId == -1) txId = ControllerHelper.extractJsonInt(body, "id_transaksi", -1);
                String status = ControllerHelper.extractJsonValue(body, "status");

                if (txId <= 0 || status.isEmpty()) {
                    ControllerHelper.sendJson(exchange, 400, "{\"success\":false,\"message\":\"transaction_id dan status wajib disertakan.\"}");
                    return;
                }

                try {
                    boolean success = controller.processPaymentResult(txId, status);
                    if (success) {
                        ControllerHelper.sendJson(exchange, 200, "{\"success\":true,\"message\":\"Status transaksi berhasil diubah oleh Admin.\"}");
                    } else {
                        ControllerHelper.sendJson(exchange, 500, "{\"success\":false,\"message\":\"Gagal mengubah status transaksi.\"}");
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

