import java.util.Date;

public class KomentarRating {
    private int idKomentar;
    private String isiKomentar;
    private double nilaiRating;
    private Date tanggal;

    public KomentarRating(int idKomentar, String isiKomentar, double nilaiRating) {
        this.idKomentar = idKomentar;
        this.isiKomentar = isiKomentar;
        this.nilaiRating = nilaiRating;
        this.tanggal = new Date();
    }

    public double getNilaiRating() { return nilaiRating; }
    public String getIsiKomentar() { return isiKomentar; }
}