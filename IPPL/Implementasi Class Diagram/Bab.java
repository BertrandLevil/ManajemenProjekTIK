public class Bab {
    private int idBab;
    private int nomorBab;

    public Bab(int idBab, int nomorBab) {
        this.idBab = idBab;
        this.nomorBab = nomorBab;
    }

    public int getIdBab() { return idBab; }
    public void setIdBab(int idBab) { this.idBab = idBab; }
    public int getNomorBab() { return nomorBab; }
    public void setNomorBab(int nomorBab) { this.nomorBab = nomorBab; }

    public void loadKonten() {
        System.out.println("Memuat konten gambar untuk Bab " + nomorBab + "...");
    }
}