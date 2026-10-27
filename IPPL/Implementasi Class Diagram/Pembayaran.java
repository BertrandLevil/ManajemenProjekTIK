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