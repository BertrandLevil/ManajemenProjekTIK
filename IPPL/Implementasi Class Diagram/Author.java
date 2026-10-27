import java.util.List;
import java.util.ArrayList;

public class Author extends User {
    private String namaStudio;
    private List<Komik> daftarKomik;
    private double pendapatan;

    public Author(String username, String email, String password, String namaStudio) {
        super(username, email, password);
        this.namaStudio = namaStudio;
        this.daftarKomik = new ArrayList<>();
        this.pendapatan = 0.0;
    }

    // Wajib di-override karena abstract method di class User
    @Override
    public boolean register() {
        System.out.println("Registrasi Author baru: " + super.getUsername() + " (Studio: " + namaStudio + ") berhasil.");
        return true;
    }

    public boolean postKomik(Komik data) {
        if (!isLoggedIn()) {
            System.out.println("Gagal posting. Silakan login terlebih dahulu.");
            return false;
        }
        daftarKomik.add(data);
        System.out.println("Author " + getUsername() + " berhasil memposting komik: " + data.getNamaKomik());
        return true;
    }

    public boolean updateKomik(int idKomik) {
        if (isLoggedIn()) {
            System.out.println("Memperbarui data untuk komik ID: " + idKomik);
            return true;
        }
        return false;
    }

    public void statistik() {
        System.out.println("=== Statistik Studio " + namaStudio + " ===");
        System.out.println("Total komik yang dipublish: " + daftarKomik.size());
    }

    public List<KomentarRating> bacaKomentar() {
        System.out.println("Memuat semua komentar dari pembaca untuk Author " + getUsername() + "...");
        return new ArrayList<>(); 
    }

    public double cekPendapatan() {
        System.out.println("Total pendapatan " + getUsername() + " saat ini: Rp" + pendapatan);
        return pendapatan;
    }
}