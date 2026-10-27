import java.util.List;
import java.util.ArrayList;

public class Pembaca extends User {
    private boolean isPremium;
    private List<Integer> bookmarkKomikIds;

    public Pembaca(String username, String email, String password) {
        super(username, email, password);
        this.isPremium = false;
        this.bookmarkKomikIds = new ArrayList<>();
    }

    // Wajib di-override karena abstract method di class User
    @Override
    public boolean register() {
        System.out.println("Registrasi Pembaca baru: " + getUsername() + " berhasil. Selamat membaca!");
        return true;
    }

    public void bacaKomik(int idKomik) {
        if (isLoggedIn()) {
            System.out.println(getUsername() + " sedang membaca komik ID: " + idKomik);
        } else {
            System.out.println("Silakan login untuk membaca komik.");
        }
    }

    public List<Komik> searchKomik(String keyword) {
        System.out.println("Mencari komik dengan kata kunci: " + keyword);
        return new ArrayList<>(); 
    }

    public void beriRating(int idKomik, double rating) {
        if (isLoggedIn()) {
            System.out.println(getUsername() + " memberikan rating " + rating + " untuk komik ID: " + idKomik);
        }
    }

    public void bookmark(int idKomik) {
        if (isLoggedIn()) {
            bookmarkKomikIds.add(idKomik);
            System.out.println("Komik ID: " + idKomik + " berhasil ditambahkan ke bookmark milik " + getUsername());
        }
    }

    public void komentar(int idKomik, String isi) {
        if (isLoggedIn()) {
            System.out.println(getUsername() + " berkomentar di komik ID " + idKomik + ": " + isi);
        }
    }

    public boolean pembayaran(double jumlah) {
        if (isLoggedIn()) {
            System.out.println("Memproses pembayaran upgrade akun sebesar: Rp" + jumlah);
            this.isPremium = true;
            return true;
        }
        return false;
    }

    public void translate() {
        if (isPremium) {
            System.out.println("Fitur terjemahan otomatis diaktifkan untuk pembaca " + getUsername());
        } else {
            System.out.println("Fitur translate hanya untuk akun premium.");
        }
    }

    public boolean isPremium() { return isPremium; }
}