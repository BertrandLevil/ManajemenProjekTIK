import java.util.List;
import java.util.ArrayList;

public class Komik {
    private int idKomik;
    private String namaKomik;
    private String genre;
    private double peringkat;
    
    // Asumsi class Bab dan KomentarRating sudah ada dari kode sebelumnya
    private List<Bab> daftarBab;
    private List<KomentarRating> daftarKomentar;

    public Komik(int idKomik, String namaKomik, String genre) {
        this.idKomik = idKomik;
        this.namaKomik = namaKomik;
        this.genre = genre;
        this.peringkat = 0.0;
        this.daftarBab = new ArrayList<>();
        this.daftarKomentar = new ArrayList<>();
    }

    public void tambahBab(Bab bab) {
        daftarBab.add(bab);
    }

    public void tambahKomentar(KomentarRating komentar) {
        daftarKomentar.add(komentar);
        hitungUlangPeringkat();
    }

    private void hitungUlangPeringkat() {
        if (daftarKomentar.isEmpty()) return;
        double total = 0;
        for (KomentarRating kr : daftarKomentar) {
            total += kr.getNilaiRating();
        }
        this.peringkat = total / daftarKomentar.size();
    }

    public void getStatistik() {
        System.out.println("=== Data Komik ===");
        System.out.println("Judul: " + namaKomik + " | Genre: " + genre);
        System.out.println("Peringkat: " + String.format("%.1f", peringkat));
        System.out.println("Total Bab: " + daftarBab.size());
    }

    public String getNamaKomik() { return namaKomik; }
    public int getIdKomik() { return idKomik; }
}
