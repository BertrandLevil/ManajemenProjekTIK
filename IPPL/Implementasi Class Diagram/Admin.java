public class Admin extends User {
    private int idAdmin;

    public Admin(String username, String email, String password, int idAdmin) {
        super(username, email, password);
        this.idAdmin = idAdmin;
    }

    // Wajib di-override karena abstract method di class User
    @Override
    public boolean register() {
        System.out.println("Registrasi Admin (ID: " + idAdmin + ") atas nama " + getUsername() + " berhasil disimpan ke sistem pusat.");
        return true;
    }

    public boolean verifyKomik(int idKomik) {
        if (isLoggedIn()) {
            System.out.println("Admin " + getUsername() + " telah memverifikasi kelayakan komik ID: " + idKomik);
            return true;
        }
        System.out.println("Akses ditolak. Admin belum login.");
        return false;
    }

    public void userManagement() {
        if (isLoggedIn()) {
            System.out.println("Admin " + getUsername() + " sedang mengakses panel manajemen pengguna.");
        }
    }

    public void kelolaPembayaran() {
        if (isLoggedIn()) {
            System.out.println("Admin " + getUsername() + " mengelola sistem dan riwayat pembayaran.");
        }
    }
}