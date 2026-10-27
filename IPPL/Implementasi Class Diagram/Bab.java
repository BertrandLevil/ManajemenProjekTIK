public class Bab {
    private int idBab;
    private int nomorBab;

    public Bab(int idBab, int nomorBab) {
        this.idBab = idBab;
        this.nomorBab = nomorBab;
    }

    public void loadKonten() {
        System.out.println("Memuat konten gambar untuk Bab " + nomorBab + "...");
    }
}