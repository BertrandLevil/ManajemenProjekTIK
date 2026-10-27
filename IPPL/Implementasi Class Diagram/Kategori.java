public class Kategori {
    private int idKategori;
    private String namaKategori;

    public Kategori(int idKategori, String namaKategori) {
        this.idKategori = idKategori;
        this.namaKategori = namaKategori;
    }

    public String getNamaKategori() { return namaKategori; }
}