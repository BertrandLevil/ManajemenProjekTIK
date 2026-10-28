-- phpMyAdmin SQL Dump
-- Database: comicid
-- Host: localhost:3306

CREATE DATABASE IF NOT EXISTS `comicid` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `comicid`;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- Table structure for table `pengguna`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `transaksi`;
DROP TABLE IF EXISTS `komentar_rating`;
DROP TABLE IF EXISTS `histori_baca`;
DROP TABLE IF EXISTS `bookmark`;
DROP TABLE IF EXISTS `bab`;
DROP TABLE IF EXISTS `komik_kategori`;
DROP TABLE IF EXISTS `komik`;
DROP TABLE IF EXISTS `kategori`;
DROP TABLE IF EXISTS `pengguna`;

CREATE TABLE `pengguna` (
  `id_pengguna` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('Pembaca','Kreator','Admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pembaca',
  `is_premium` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_pengguna`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `pengguna` (`id_pengguna`, `username`, `email`, `password`, `role`, `is_premium`) VALUES
(1, 'fajri_admin', 'andi@example.com', 'hash_demo_andi', 'Admin', 0),
(2, 'bima_admin', 'bima@example.com', 'hash_demo_bima', 'Admin', 0),
(3, 'bertrand_admin', 'citra@example.com', 'hash_demo_citra', 'Admin', 0),
(4, 'daniel_admin', 'doni@example.com', 'hash_demo_doni', 'Admin', 0),
(5, 'jeremy_admin', 'eka@example.com', 'hash_demo_eka', 'Admin', 0),
(6, 'fajar_reader', 'fajar@example.com', 'hash_demo_fajar', 'Pembaca', 1),
(7, 'gina_author', 'gina@example.com', 'hash_demo_gina', 'Kreator', 0),
(8, 'hadi_reader', 'hadi@example.com', 'hash_demo_hadi', 'Pembaca', 1),
(9, 'intan_author', 'intan@example.com', 'hash_demo_intan', 'Kreator', 1),
(10, 'joko_reader', 'joko@example.com', 'hash_demo_joko', 'Pembaca', 0);

DELIMITER $$
CREATE TRIGGER `admin_not_premium_insert` BEFORE INSERT ON `pengguna` FOR EACH ROW SET NEW.is_premium =
    IF(NEW.role = 'Admin', 0, NEW.is_premium)
$$
DELIMITER ;

-- --------------------------------------------------------
-- Table structure for table `kategori`
-- --------------------------------------------------------

CREATE TABLE `kategori` (
  `id_kategori` int NOT NULL AUTO_INCREMENT,
  `nama_kategori` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_kategori`),
  UNIQUE KEY `nama_kategori` (`nama_kategori`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `kategori` (`id_kategori`, `nama_kategori`) VALUES
(5, 'Comic'),
(1, 'Komik'),
(2, 'Manga'),
(4, 'Manhua'),
(3, 'Manhwa'),
(6, 'Webtoon');

-- --------------------------------------------------------
-- Table structure for table `komik`
-- --------------------------------------------------------

CREATE TABLE `komik` (
  `id_komik` int NOT NULL AUTO_INCREMENT,
  `id_kreator` int NOT NULL,
  `nama_komik` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `nama_studio` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating_rata_rata` decimal(3,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_komik`),
  KEY `fk_komik_kreator` (`id_kreator`),
  CONSTRAINT `fk_komik_kreator` FOREIGN KEY (`id_kreator`) REFERENCES `pengguna` (`id_pengguna`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `komik` (`id_komik`, `id_kreator`, `nama_komik`, `deskripsi`, `nama_studio`, `rating_rata_rata`) VALUES
(1, 7, 'Petualang Langit', 'Petualangan seorang pemuda menjelajahi dunia langit.', 'Bintang Studio', '4.50'),
(2, 7, 'Pedang Senja', 'Pendekar muda mencari asal-usul kekuatannya.', 'Citra Comics', '4.20'),
(3, 9, 'Kota Masa Depan', 'Kisah kehidupan di kota berteknologi tinggi.', 'Eka Creative', '4.00'),
(4, 7, 'Penjaga Hutan', 'Penjaga hutan melindungi alam dari ancaman.', 'Bintang Studio', '4.60'),
(5, 9, 'Akademi Sihir', 'Murid baru belajar mengendalikan sihir.', 'Citra Comics', '4.30'),
(6, 7, 'Balapan Galaksi', 'Pembalap berlomba di berbagai planet.', 'Eka Creative', '3.90'),
(7, 7, 'Legenda Naga', 'Legenda naga kuno kembali hidup.', 'Bintang Studio', '4.80'),
(8, 7, 'Detektif Malam', 'Detektif memecahkan misteri kota.', 'Citra Comics', '4.10'),
(9, 9, 'Ruang Waktu', 'Ilmuwan menemukan pintu menuju masa lalu.', 'Eka Creative', '4.40'),
(10, 9, 'Pahlawan Kecil', 'Anak biasa belajar menjadi pahlawan.', 'Bintang Studio', '4.00');

-- --------------------------------------------------------
-- Table structure for table `komik_kategori`
-- --------------------------------------------------------

CREATE TABLE `komik_kategori` (
  `id_komik_kategori` int NOT NULL AUTO_INCREMENT,
  `id_komik` int NOT NULL,
  `id_kategori` int NOT NULL,
  PRIMARY KEY (`id_komik_kategori`),
  UNIQUE KEY `uq_komik_kategori` (`id_komik`,`id_kategori`),
  KEY `fk_kk_kategori` (`id_kategori`),
  KEY `fk_kk_komik` (`id_komik`),
  CONSTRAINT `fk_kk_kategori` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_kk_komik` FOREIGN KEY (`id_komik`) REFERENCES `komik` (`id_komik`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `komik_kategori` (`id_komik_kategori`, `id_komik`, `id_kategori`) VALUES
(1, 1, 2),
(2, 2, 1),
(3, 3, 3),
(4, 4, 2),
(5, 5, 3),
(6, 6, 5),
(7, 7, 3),
(8, 8, 1),
(9, 9, 3),
(10, 10, 4);

-- --------------------------------------------------------
-- Table structure for table `bab`
-- --------------------------------------------------------

CREATE TABLE `bab` (
  `id_bab` int NOT NULL AUTO_INCREMENT,
  `id_komik` int NOT NULL,
  `nomor_bab` int NOT NULL,
  `tanggal_rilis` date NOT NULL,
  PRIMARY KEY (`id_bab`),
  UNIQUE KEY `uq_bab_komik_nomor` (`id_komik`,`nomor_bab`),
  CONSTRAINT `fk_bab_komik` FOREIGN KEY (`id_komik`) REFERENCES `komik` (`id_komik`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `bab` (`id_bab`, `id_komik`, `nomor_bab`, `tanggal_rilis`) VALUES
(1, 1, 1, '2026-01-01'),
(2, 2, 1, '2026-01-02'),
(3, 3, 1, '2026-01-03'),
(4, 4, 1, '2026-01-04'),
(5, 5, 1, '2026-01-05'),
(6, 6, 1, '2026-01-06'),
(7, 7, 1, '2026-01-07'),
(8, 8, 1, '2026-01-08'),
(9, 9, 1, '2026-01-09'),
(10, 10, 1, '2026-01-10');

-- --------------------------------------------------------
-- Table structure for table `bookmark`
-- --------------------------------------------------------

CREATE TABLE `bookmark` (
  `id_bookmark` int NOT NULL AUTO_INCREMENT,
  `id_pengguna` int NOT NULL,
  `id_komik` int NOT NULL,
  `tanggal_ditambahkan` datetime NOT NULL,
  PRIMARY KEY (`id_bookmark`),
  UNIQUE KEY `uq_bookmark_pengguna_komik` (`id_pengguna`,`id_komik`),
  KEY `fk_bookmark_komik` (`id_komik`),
  KEY `fk_bookmark_pengguna` (`id_pengguna`),
  CONSTRAINT `fk_bookmark_komik` FOREIGN KEY (`id_komik`) REFERENCES `komik` (`id_komik`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bookmark_pengguna` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `bookmark` (`id_bookmark`, `id_pengguna`, `id_komik`, `tanggal_ditambahkan`) VALUES
(1, 1, 1, '2026-02-01 08:00:00'),
(2, 4, 2, '2026-02-01 09:00:00'),
(3, 7, 3, '2026-02-02 10:00:00'),
(4, 8, 4, '2026-02-02 11:00:00'),
(5, 9, 5, '2026-02-03 12:00:00'),
(6, 10, 6, '2026-02-03 13:00:00'),
(7, 1, 7, '2026-02-04 14:00:00'),
(8, 4, 8, '2026-02-04 15:00:00'),
(9, 7, 9, '2026-02-05 16:00:00'),
(10, 8, 10, '2026-02-05 17:00:00');

-- --------------------------------------------------------
-- Table structure for table `histori_baca`
-- --------------------------------------------------------

CREATE TABLE `histori_baca` (
  `id_histori` int NOT NULL AUTO_INCREMENT,
  `id_pengguna` int NOT NULL,
  `id_bab` int NOT NULL,
  `tanggal_baca` datetime NOT NULL,
  PRIMARY KEY (`id_histori`),
  KEY `fk_histori_pengguna` (`id_pengguna`),
  KEY `fk_histori_episode` (`id_bab`),
  CONSTRAINT `fk_histori_episode` FOREIGN KEY (`id_bab`) REFERENCES `bab` (`id_bab`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_histori_pengguna` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `histori_baca` (`id_histori`, `id_pengguna`, `id_bab`, `tanggal_baca`) VALUES
(1, 1, 1, '2026-02-15 08:00:00'),
(2, 4, 2, '2026-02-15 08:30:00'),
(3, 7, 3, '2026-02-15 09:00:00'),
(4, 8, 4, '2026-02-15 09:30:00'),
(5, 9, 5, '2026-02-15 10:00:00'),
(6, 10, 6, '2026-02-15 10:30:00'),
(7, 1, 7, '2026-02-15 11:00:00'),
(8, 4, 8, '2026-02-15 11:30:00'),
(9, 7, 9, '2026-02-15 12:00:00'),
(10, 8, 10, '2026-02-15 12:30:00');

-- --------------------------------------------------------
-- Table structure for table `komentar_rating`
-- --------------------------------------------------------

CREATE TABLE `komentar_rating` (
  `id_ulasan` int NOT NULL AUTO_INCREMENT,
  `id_pengguna` int NOT NULL,
  `id_komik` int NOT NULL,
  `isi_komentar` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `nilai_rating` int NOT NULL,
  `tanggal_komentar` datetime NOT NULL,
  PRIMARY KEY (`id_ulasan`),
  KEY `fk_ulasan_pengguna` (`id_pengguna`),
  KEY `fk_ulasan_komik` (`id_komik`),
  CONSTRAINT `fk_ulasan_komik` FOREIGN KEY (`id_komik`) REFERENCES `komik` (`id_komik`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ulasan_pengguna` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `komentar_rating` (`id_ulasan`, `id_pengguna`, `id_komik`, `isi_komentar`, `nilai_rating`, `tanggal_komentar`) VALUES
(1, 1, 1, 'Ceritanya menarik dan mudah diikuti.', 5, '2026-02-10 08:10:00'),
(2, 4, 2, 'Adegan aksinya seru.', 4, '2026-02-10 09:20:00'),
(3, 7, 3, 'Ide masa depannya unik.', 4, '2026-02-11 10:30:00'),
(4, 8, 4, 'Ilustrasi hutannya bagus.', 5, '2026-02-11 11:40:00'),
(5, 9, 5, 'Dunia sihirnya menyenangkan.', 4, '2026-02-12 12:50:00'),
(6, 10, 6, 'Balapannya cukup menegangkan.', 4, '2026-02-12 13:00:00'),
(7, 1, 7, 'Legenda naganya keren.', 5, '2026-02-13 14:10:00'),
(8, 4, 8, 'Misterinya bikin penasaran.', 4, '2026-02-13 15:20:00'),
(9, 7, 9, 'Konsep perjalanan waktu bagus.', 5, '2026-02-14 16:30:00'),
(10, 8, 10, 'Pesan ceritanya positif.', 4, '2026-02-14 17:40:00');

-- --------------------------------------------------------
-- Table structure for table `transaksi`
-- --------------------------------------------------------

CREATE TABLE `transaksi` (
  `id_transaksi` int NOT NULL AUTO_INCREMENT,
  `id_pengguna` int NOT NULL,
  `metode_pembayaran` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_pembayaran` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jumlah_bayar` decimal(12,2) NOT NULL,
  `tanggal_transaksi` datetime NOT NULL,
  PRIMARY KEY (`id_transaksi`),
  KEY `fk_transaksi_pengguna` (`id_pengguna`),
  CONSTRAINT `fk_transaksi_pengguna` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id_pengguna`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `transaksi` (`id_transaksi`, `id_pengguna`, `metode_pembayaran`, `status_pembayaran`, `jumlah_bayar`, `tanggal_transaksi`) VALUES
(1, 1, 'QRIS', 'Berhasil', '25000.00', '2026-01-05 10:15:00'),
(2, 4, 'Transfer Bank', 'Berhasil', '50000.00', '2026-01-06 11:20:00'),
(3, 7, 'E-Wallet', 'Berhasil', '25000.00', '2026-01-07 12:25:00'),
(4, 8, 'Kartu Debit', 'Berhasil', '75000.00', '2026-01-08 13:30:00'),
(5, 9, 'QRIS', 'Menunggu', '25000.00', '2026-01-09 14:35:00'),
(6, 10, 'E-Wallet', 'Berhasil', '50000.00', '2026-01-10 15:40:00'),
(7, 2, 'Transfer Bank', 'Berhasil', '100000.00', '2026-01-11 16:45:00'),
(8, 3, 'QRIS', 'Gagal', '25000.00', '2026-01-12 17:50:00'),
(9, 4, 'E-Wallet', 'Berhasil', '50000.00', '2026-01-13 18:55:00'),
(10, 7, 'Kartu Debit', 'Berhasil', '75000.00', '2026-01-14 19:10:00');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
