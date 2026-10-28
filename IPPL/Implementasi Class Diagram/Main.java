public class Main {
    public static void main(String[] args) {
        System.out.println("1. INISIALISASI & REGISTRASI PENGGUNA");
        
        User userAuthor = new Author("OdaSensei", "oda@studio.com", "pass123", "Shueisha");
        User userPembaca = new Pembaca("BudiWibu", "budi@gmail.com", "pembaca123");
        User userAdmin = new Admin("AdminGanteng", "admin@sistem.com", "adminxyz", 99);

        userAuthor.register();
        userPembaca.register();
        userAdmin.register();

        System.out.println("\n2. PROSES LOGIN");
        userAuthor.login("OdaSensei", "pass123");
        userPembaca.login("budi@gmail.com", "pembaca123");
        userAdmin.login("AdminGanteng", "adminxyz");

        Author author = (Author) userAuthor;
        Pembaca pembaca = (Pembaca) userPembaca;
        Admin admin = (Admin) userAdmin;

        System.out.println("\n3. SKENARIO AUTHOR MEMBUAT KOMIK");
        Komik komikBaru = new Komik(101, "Petualangan Si Bajak Laut", "Action, Fantasy");
        
        Bab bab1 = new Bab(1, 1);
        Bab bab2 = new Bab(2, 2);
        komikBaru.tambahBab(bab1);
        komikBaru.tambahBab(bab2);
        
        author.postKomik(komikBaru);

        System.out.println("\n4. SKENARIO ADMIN MEMVERIFIKASI KOMIK");
        admin.verifyKomik(komikBaru.getIdKomik());

        System.out.println("\n5. SKENARIO PEMBACA BERINTERAKSI DENGAN KOMIK");
        pembaca.searchKomik("Bajak Laut");
        pembaca.bacaKomik(komikBaru.getIdKomik());
        bab1.loadKonten();
        
        pembaca.bookmark(komikBaru.getIdKomik());
        pembaca.beriRating(komikBaru.getIdKomik(), 4.8);
        pembaca.komentar(komikBaru.getIdKomik(), "Ceritanya sangat seru, ditunggu bab selanjutnya!");

        KomentarRating komentarBudi = new KomentarRating(1, "Ceritanya sangat seru, ditunggu bab selanjutnya!", 4.8);
        komikBaru.tambahKomentar(komentarBudi);

        System.out.println("\n6. SKENARIO PEMBACA UPGRADE PREMIUM");
        pembaca.pembayaran(50000); 
        pembaca.translate(); 

        System.out.println("\n7. MENAMPILKAN STATISTIK");
        komikBaru.getStatistik();
        System.out.println();
        author.statistik();

        System.out.println("\n8. LOGOUT");
        author.logout();
        pembaca.logout();
        admin.logout();
    }
}