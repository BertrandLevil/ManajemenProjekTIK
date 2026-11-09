public class Pembayaran {
    private int idTransaksi;
    private String metodePembayaran;
    private String statusPembayaran;
    private double nominal;

    public Pembayaran(int idTransaksi, String metodePembayaran, double nominal) {
        this.idTransaksi = idTransaksi;
        this.metodePembayaran = metodePembayaran;
        this.nominal = nominal;
        this.statusPembayaran = "Pending";
    }

    public int getIdTransaksi() { return idTransaksi; }
    public void setIdTransaksi(int idTransaksi) { this.idTransaksi = idTransaksi; }
    public String getMetodePembayaran() { return metodePembayaran; }
    public void setMetodePembayaran(String metodePembayaran) { this.metodePembayaran = metodePembayaran; }
    public String getStatusPembayaran() { return statusPembayaran; }
    public void setStatusPembayaran(String statusPembayaran) { this.statusPembayaran = statusPembayaran; }
    public double getNominal() { return nominal; }
    public void setNominal(double nominal) { this.nominal = nominal; }

    public void submitPayment() {
        System.out.println("Mengirim data pembayaran sebesar Rp" + nominal + " via " + metodePembayaran);
        this.statusPembayaran = "Processing";
    }

    public boolean processPaymentResult() {
        if (nominal > 0) {
            this.statusPembayaran = "Success";
            System.out.println("Transaksi " + idTransaksi + " berhasil.");
            return true;
        }
        this.statusPembayaran = "Failed";
        System.out.println("Transaksi gagal. Nominal tidak valid.");
        return false;
    }
}