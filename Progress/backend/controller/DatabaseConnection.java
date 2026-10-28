import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {
    // URL koneksi JDBC untuk MySQL / MariaDB (Laragon)
    // Database name: comicid, Port default: 3306
    private static final String URL = "jdbc:mysql://localhost:3306/comicid?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8";
    private static final String USER = "root";
    private static final String PASSWORD = ""; // Default password MySQL di Laragon adalah kosong ("")

    static {
        try {
            // Memastikan driver MySQL JDBC terdaftar
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("[DatabaseConnection] MySQL JDBC Driver tidak ditemukan. Pastikan mysql-connector-j ada di classpath.");
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    public static boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (SQLException e) {
            System.err.println("[DatabaseConnection] Gagal menghubungkan ke database 'comicid': " + e.getMessage());
            return false;
        }
    }
}