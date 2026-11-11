-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.1.0.6537
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
  UNIQUE KEY `uq_episode_komik_nomor` (`id_komik`,`nomor_bab`),
  CONSTRAINT `fk_episode_komik` FOREIGN KEY (`id_komik`) REFERENCES `komik` (`id_komik`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table comicid.bab: ~9 rows (approximately)
INSERT INTO `bab` (`id_bab`, `id_komik`, `nomor_bab`, `tanggal_rilis`) VALUES
	(1, 1, 1, '2026-11-10'),
	(2, 2, 1, '2026-11-10'),
	(3, 3, 1, '2026-11-10'),
	(4, 4, 1, '2026-11-10'),
	(5, 5, 1, '2026-11-10'),
	(6, 6, 1, '2026-11-10'),
	(7, 7, 1, '2026-11-10'),
	(8, 8, 1, '2026-11-10'),
	(9, 9, 1, '2026-11-10');

-- Dumping structure for table comicid.bookmark
CREATE TABLE IF NOT EXISTS `bookmark` (
  `id_bookmark` int NOT NULL AUTO_INCREMENT,
  `id_pengguna` int NOT NULL,
  `id_komik` int NOT NULL,
  `tanggal_ditambahkan` datetime NOT NULL,
  PRIMARY KEY (`id_bookmark`),
  UNIQUE KEY `uq_bookmark_pengguna_komik` (`id_pengguna`,`id_komik`),
  KEY `fk_bookmark_komik` (`id_komik`),
  CONSTRAINT `fk_bookmark_komik` FOREIGN KEY (`id_komik`) REFERENCES `komik` (`id_komik`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bookmark_pengguna` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table comicid.bookmark: ~0 rows (approximately)

-- Dumping structure for table comicid.halaman_bab
CREATE TABLE IF NOT EXISTS `halaman_bab` (
  `id_halaman` int NOT NULL AUTO_INCREMENT,
  `id_bab` int NOT NULL,
  `nomor_halaman` int NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_halaman`),
  UNIQUE KEY `id_bab` (`id_bab`,`nomor_halaman`),
  CONSTRAINT `halaman_bab_ibfk_1` FOREIGN KEY (`id_bab`) REFERENCES `bab` (`id_bab`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table comicid.halaman_bab: ~33 rows (approximately)
INSERT INTO `halaman_bab` (`id_halaman`, `id_bab`, `nomor_halaman`, `file_path`) VALUES
	(1, 3, 1, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-000.webp'),
	(2, 3, 2, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-001.webp'),
	(3, 3, 3, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-002.webp'),
	(4, 3, 4, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-003.webp'),
	(5, 3, 5, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-004.webp'),
	(6, 3, 6, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-005.webp'),
	(7, 3, 7, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-006.webp'),
	(8, 3, 8, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-007.webp'),
	(9, 3, 9, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-008.webp'),
	(10, 3, 10, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-009.webp'),
	(11, 3, 11, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-010.webp'),
	(12, 3, 12, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-011.webp'),
	(13, 3, 13, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-012.webp'),
	(14, 3, 14, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-013.webp'),
	(15, 3, 15, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-014.webp'),
	(16, 3, 16, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-015.webp'),
	(17, 3, 17, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-016.webp'),
	(18, 3, 18, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-017.webp'),
	(19, 3, 19, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-018.webp'),
	(20, 3, 20, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-019.webp'),
	(21, 3, 21, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-020.webp'),
	(22, 3, 22, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-021.webp'),
	(23, 3, 23, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-022.webp'),
	(24, 3, 24, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-023.webp'),
	(25, 3, 25, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-024.webp'),
	(26, 3, 26, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-025.webp'),
	(27, 3, 27, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-026.webp'),
	(28, 3, 28, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-027.webp'),
	(29, 3, 29, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-028.webp'),
	(30, 3, 30, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-029.webp'),
	(31, 3, 31, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-030.webp'),
	(32, 3, 32, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-031.webp'),
	(33, 3, 33, 'comics/AuthorofMyOwnDestiny/ch-001/AuthorofMyOwnDestiny-ch001-032.jpeg');

-- Dumping structure for table comicid.histori_baca
CREATE TABLE IF NOT EXISTS `histori_baca` (
  `id_histori` int NOT NULL AUTO_INCREMENT,
  `id_pengguna` int NOT NULL,
  `id_komik` int DEFAULT NULL,
  `id_bab` int NOT NULL,
  `tanggal_baca` datetime NOT NULL,
  PRIMARY KEY (`id_histori`),
  KEY `fk_histori_pengguna` (`id_pengguna`),
  KEY `fk_histori_episode` (`id_bab`),
  CONSTRAINT `fk_histori_episode` FOREIGN KEY (`id_bab`) REFERENCES `bab` (`id_bab`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_histori_pengguna` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table comicid.histori_baca: ~0 rows (approximately)

-- Dumping structure for table comicid.kategori
CREATE TABLE IF NOT EXISTS `kategori` (
  `id_kategori` int NOT NULL AUTO_INCREMENT,
  `nama_kategori` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_kategori`),
  UNIQUE KEY `nama_kategori` (`nama_kategori`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table comicid.kategori: ~10 rows (approximately)
INSERT INTO `kategori` (`id_kategori`, `nama_kategori`) VALUES
	(1, 'Aksi'),
	(5, 'Drama'),
	(3, 'Fantasi'),
	(7, 'Fiksi Ilmiah'),
	(9, 'Horor'),
	(10, 'Kehidupan'),
	(4, 'Komedi'),
	(8, 'Misteri'),
	(2, 'Petualangan'),
	(6, 'Romansa');

-- Dumping structure for table comicid.komentar_rating
CREATE TABLE IF NOT EXISTS `komentar_rating` (
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
  CONSTRAINT `fk_ulasan_pengguna` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_nilai_rating` CHECK ((`nilai_rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table comicid.komentar_rating: ~10 rows (approximately)

-- Dumping structure for table comicid.komik
CREATE TABLE IF NOT EXISTS `komik` (
  `id_komik` int NOT NULL AUTO_INCREMENT,
  `id_kreator` int NOT NULL,
  `nama_komik` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `nama_studio` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating_rata_rata` decimal(3,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_komik`),
  KEY `fk_komik_kreator` (`id_kreator`),
  CONSTRAINT `fk_komik_kreator` FOREIGN KEY (`id_kreator`) REFERENCES `pengguna` (`id_pengguna`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table comicid.komik: ~9 rows (approximately)
INSERT INTO `komik` (`id_komik`, `id_kreator`, `nama_komik`, `deskripsi`, `nama_studio`, `rating_rata_rata`) VALUES
	(1, 11, 'Solo Leveling', 'Manhwa Solo Leveling yang dibuat oleh komikus bernama Chugong ini bercerita tentang 10 tahun yang lalu setelah Gerbang yang menghubungkan dunia nyata dengan dunia monster terbuka...', 'Redice Studio', 9.10),
	(2, 12, 'The Siren: Becoming the Villain\'s Family', 'Setelah ibunya yang seorang siren meninggal, Aria menjadi burung yang terkurung dan harus bernyanyi untuk kaisar sampai mati...', 'ODR', 9.60),
	(3, 13, 'Author of My Destiny', 'Dalam novel “Kaisar dan Saintess,” pemeran utama pria dan pemeran utama wanita mampu mengalahkan naga dan iblis terkutuk...', 'Yeondam, Daon', 9.40),
	(4, 14, 'Soul Land II', 'Setelah kejadian di Soul Land pertama, kehidupan di dunia ini memasuki era baru yang penuh dengan tantangan dan kesempatan...', 'Changsha Angel Culture Co., Ltd, Magic Comic', 7.60),
	(5, 15, 'Shadow Slave', 'Tumbuh dalam kemiskinan, Sunny tidak pernah mengharapkan hal baik dari kehidupan. Namun, bahkan dia pun tidak menduga akan terpilih oleh Nightmare Spell...', 'Aethon Studio', 9.30),
	(6, 16, 'Dedes', 'Isekai yang diangkat dari kisah sejarah Indonesia! Seorang mahasiswi tiba-tiba terbangun di tubuh Dedes, seorang gadis yang kelak akan menjadi ibu bagi para raja...', 'Esti Siwi / Egestigi', 8.50),
	(7, 17, 'Chainsaw Man', 'Chainsaw Man mengisahkan Denji, seorang pemuda yang hidupnya penuh dengan hutang warisan ayahnya dan berjuang untuk bertahan hidup...', 'Fujimoto-gumi', 9.80),
	(8, 18, 'Magic Emperor', 'Karena dia memiliki warisan Ancient Demonic emperor, Demonic Emperor Zhuo Yifan menemui nasib sial karena dikhianati dan dibunuh...', 'Night Comic Studio', 8.60),
	(9, 19, 'Genshin Impact', 'Kamu telah tiba di Teyvat, sebuah dunia fantasi di mana tujuh elemen mengalir, berpadu, menari dan beradu...', 'Hoyoverse', 9.80);

-- Dumping structure for table comicid.komik_kategori
CREATE TABLE IF NOT EXISTS `komik_kategori` (
  `id_komik_kategori` int NOT NULL AUTO_INCREMENT,
  `id_komik` int NOT NULL,
  `id_kategori` int NOT NULL,
  PRIMARY KEY (`id_komik_kategori`),
  UNIQUE KEY `uq_komik_kategori` (`id_komik`,`id_kategori`),
  KEY `fk_kk_kategori` (`id_kategori`),
  CONSTRAINT `fk_kk_kategori` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_kk_komik` FOREIGN KEY (`id_komik`) REFERENCES `komik` (`id_komik`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table comicid.komik_kategori: ~0 rows (approximately)

-- Dumping structure for table comicid.pengguna
CREATE TABLE IF NOT EXISTS `pengguna` (
  `id_pengguna` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('Pembaca','Kreator','Admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pembaca',
  `is_premium` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_pengguna`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table comicid.pengguna: ~19 rows (approximately)
INSERT INTO `pengguna` (`id_pengguna`, `username`, `email`, `password`, `role`, `is_premium`) VALUES
	(1, 'andi_reader', 'andi@example.com', 'hash_demo_andi', 'Pembaca', 0),
	(2, 'bima_creator', 'bima@example.com', 'hash_demo_bima', 'Kreator', 1),
	(3, 'citra_creator', 'citra@example.com', 'hash_demo_citra', 'Kreator', 0),
	(4, 'doni_reader', 'doni@example.com', 'hash_demo_doni', 'Pembaca', 1),
	(5, 'eka_creator', 'eka@example.com', 'hash_demo_eka', 'Kreator', 0),
	(6, 'fajar_admin', 'fajar@example.com', 'hash_demo_fajar', 'Admin', 1),
	(7, 'gina_reader', 'gina@example.com', 'hash_demo_gina', 'Pembaca', 0),
	(8, 'hadi_reader', 'hadi@example.com', 'hash_demo_hadi', 'Pembaca', 1),
	(9, 'intan_reader', 'intan@example.com', 'hash_demo_intan', 'Pembaca', 0),
	(10, 'joko_reader', 'joko@example.com', 'hash_demo_joko', 'Pembaca', 0),
	(11, 'Chugong', 'Chugong@kreator.com', 'Kreatorchu123!', 'Kreator', 0),
	(12, 'Sol Leesu (설이수 / Seol Yi-soo)', 'SolLeesu@kreator.com', 'Kreatorsol123!', 'Kreator', 1),
	(13, 'Gyeoulip (겨울잎)', 'Gyeoulip (겨울잎)@kreator.com', 'Kreatorgye123!', 'Kreator', 0),
	(14, 'Tang Jia San Shao', 'TangJiaSanShao@kreator.com', 'Kreatortang123!', 'Kreator', 1),
	(15, 'Guiltythree', 'Guiltythree@kreator.com', 'Kreatorgui123!', 'Kreator', 1),
	(16, 'Esti Siwi / Egestigi', 'EstiSiwi@kreator.com', 'Kreatoresti123!', 'Kreator', 0),
	(17, 'Tatsuki Fujimoto', 'TatsukiFujimoto@kreator.com', 'Kreatortatsu123!', 'Kreator', 0),
	(18, 'Nightingale', 'Nightingale@kreator.com', 'Kreatornight123', 'Kreator', 1),
	(19, 'Hoyoverse', 'Hoyoverse@kreator.com', 'Kreatorhoyo123!', 'Kreator', 1);

-- Dumping structure for table comicid.transaksi
CREATE TABLE IF NOT EXISTS `transaksi` (
  `id_transaksi` int NOT NULL AUTO_INCREMENT,
  `id_pengguna` int NOT NULL,
  `metode_pembayaran` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_pembayaran` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jumlah_bayar` decimal(12,2) NOT NULL,
  `tanggal_transaksi` datetime NOT NULL,
  PRIMARY KEY (`id_transaksi`),
  KEY `fk_transaksi_pengguna` (`id_pengguna`),
  CONSTRAINT `fk_transaksi_pengguna` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id_pengguna`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table comicid.transaksi: ~10 rows (approximately)
INSERT INTO `transaksi` (`id_transaksi`, `id_pengguna`, `metode_pembayaran`, `status_pembayaran`, `jumlah_bayar`, `tanggal_transaksi`) VALUES
	(1, 1, 'QRIS', 'Berhasil', 25000.00, '2026-01-05 10:15:00'),
	(2, 4, 'Transfer Bank', 'Berhasil', 50000.00, '2026-01-06 11:20:00'),
	(3, 7, 'E-Wallet', 'Berhasil', 25000.00, '2026-01-07 12:25:00'),
	(4, 8, 'Kartu Debit', 'Berhasil', 75000.00, '2026-01-08 13:30:00'),
	(5, 9, 'QRIS', 'Menunggu', 25000.00, '2026-01-09 14:35:00'),
	(6, 10, 'E-Wallet', 'Berhasil', 50000.00, '2026-01-10 15:40:00'),
	(7, 2, 'Transfer Bank', 'Berhasil', 100000.00, '2026-01-11 16:45:00'),
	(8, 3, 'QRIS', 'Gagal', 25000.00, '2026-01-12 17:50:00'),
	(9, 4, 'E-Wallet', 'Berhasil', 50000.00, '2026-01-13 18:55:00'),
	(10, 7, 'Kartu Debit', 'Berhasil', 75000.00, '2026-01-14 19:10:00'),
	(11, 1, 'QRIS', 'Menunggu', 30000.00, '2026-11-11 07:37:37');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
