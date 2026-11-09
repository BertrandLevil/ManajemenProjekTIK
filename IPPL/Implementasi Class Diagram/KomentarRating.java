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

    public int getIdKomentar() { return idKomentar; }
    public void setIdKomentar(int idKomentar) { this.idKomentar = idKomentar; }
    public double getNilaiRating() { return nilaiRating; }
    public void setNilaiRating(double nilaiRating) { this.nilaiRating = nilaiRating; }
    public String getIsiKomentar() { return isiKomentar; }
    public void setIsiKomentar(String isiKomentar) { this.isiKomentar = isiKomentar; }
    public Date getTanggal() { return tanggal; }
    public void setTanggal(Date tanggal) { this.tanggal = tanggal; }
}