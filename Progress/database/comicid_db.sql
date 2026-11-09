-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for comicid
CREATE DATABASE IF NOT EXISTS `comicid` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `comicid`;

-- Dumping structure for table comicid.bab
CREATE TABLE IF NOT EXISTS `bab` (
  `id_bab` int NOT NULL AUTO_INCREMENT,
  `id_komik` int NOT NULL,
  `nomor_bab` int NOT NULL,
  `tanggal_rilis` date NOT NULL,
  PRIMARY KEY (`id_bab`),
  UNIQUE KEY `uq_bab_komik_nomor` (`id_komik`,`nomor_bab`),
  CONSTRAINT `fk_bab_komik` FOREIGN KEY (`id_komik`) REFERENCES `komik` (`id_komik`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table comicid.bookmark
CREATE TABLE IF NOT EXISTS `bookmark` (
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table comicid.histori_baca
CREATE TABLE IF NOT EXISTS `histori_baca` (
  `id_histori` int NOT NULL AUTO_INCREMENT,
  `id_pengguna` int NOT NULL,
  `id_bab` int NOT NULL,
  `tanggal_baca` datetime NOT NULL,
  PRIMARY KEY (`id_histori`),
  KEY `fk_histori_pengguna` (`id_pengguna`),
  KEY `fk_histori_episode` (`id_bab`),
  CONSTRAINT `fk_histori_episode` FOREIGN KEY (`id_bab`) REFERENCES `bab` (`id_bab`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_histori_pengguna` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table comicid.kategori
CREATE TABLE IF NOT EXISTS `kategori` (
  `id_kategori` int NOT NULL AUTO_INCREMENT,
  `nama_kategori` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_kategori`),
  UNIQUE KEY `nama_kategori` (`nama_kategori`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table comicid.komentar_rating
CREATE TABLE IF NOT EXISTS `komentar_rating` (
  `id_ulasan` int NOT NULL AUTO_INCREMENT,
  `id_pengguna` int NOT NULL,
  `id_komik` int NOT NULL,
  `isi_komentar` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nilai_rating` int NOT NULL,
  `tanggal_komentar` datetime NOT NULL,
  PRIMARY KEY (`id_ulasan`),
  KEY `fk_ulasan_pengguna` (`id_pengguna`),
  KEY `fk_ulasan_komik` (`id_komik`),
  CONSTRAINT `fk_ulasan_komik` FOREIGN KEY (`id_komik`) REFERENCES `komik` (`id_komik`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ulasan_pengguna` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table comicid.komik
CREATE TABLE IF NOT EXISTS `komik` (
  `id_komik` int NOT NULL AUTO_INCREMENT,
  `id_kreator` int NOT NULL,
  `nama_komik` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `nama_studio` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating_rata_rata` decimal(3,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_komik`),
  KEY `fk_komik_kreator` (`id_kreator`),
  CONSTRAINT `fk_komik_kreator` FOREIGN KEY (`id_kreator`) REFERENCES `pengguna` (`id_pengguna`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table comicid.komik_kategori
CREATE TABLE IF NOT EXISTS `komik_kategori` (
  `id_komik_kategori` int NOT NULL AUTO_INCREMENT,
  `id_komik` int NOT NULL,
  `id_kategori` int NOT NULL,
  PRIMARY KEY (`id_komik_kategori`),
  UNIQUE KEY `uq_komik_kategori` (`id_komik`,`id_kategori`),
  KEY `fk_kk_kategori` (`id_kategori`),
  KEY `fk_kk_komik` (`id_komik`),
  CONSTRAINT `fk_kk_kategori` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_kk_komik` FOREIGN KEY (`id_komik`) REFERENCES `komik` (`id_komik`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table comicid.pengguna
CREATE TABLE IF NOT EXISTS `pengguna` (
  `id_pengguna` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('Pembaca','Kreator','Admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pembaca',
  `is_premium` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_pengguna`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table comicid.transaksi
CREATE TABLE IF NOT EXISTS `transaksi` (
  `id_transaksi` int NOT NULL AUTO_INCREMENT,
  `id_pengguna` int NOT NULL,
  `metode_pembayaran` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_pembayaran` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `jumlah_bayar` decimal(12,2) NOT NULL,
  `tanggal_transaksi` datetime NOT NULL,
  PRIMARY KEY (`id_transaksi`),
  KEY `fk_transaksi_pengguna` (`id_pengguna`),
  CONSTRAINT `fk_transaksi_pengguna` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id_pengguna`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for trigger comicid.admin_not_premium_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
DELIMITER //
CREATE TRIGGER `admin_not_premium_insert` BEFORE INSERT ON `pengguna` FOR EACH ROW SET NEW.is_premium =
    IF(NEW.role = 'Admin', 0, NEW.is_premium)//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
