-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 27, 2026 at 08:50 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `comicid`
--

-- --------------------------------------------------------

--
-- Table structure for table `bab`
--

CREATE TABLE `bab` (
  `id_bab` int NOT NULL,
  `id_komik` int NOT NULL,
  `nomor_bab` int NOT NULL,
  `tanggal_rilis` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bab`
--

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

-- --------------------------------------------------------

--
-- Table structure for table `bookmark`
--

CREATE TABLE `bookmark` (
  `id_bookmark` int NOT NULL,
  `id_pengguna` int NOT NULL,
  `id_komik` int NOT NULL,
  `tanggal_ditambahkan` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comic_views`
--

CREATE TABLE `comic_views` (
  `id_view` int NOT NULL,
  `id_comic` int NOT NULL,
  `id_pengguna` int DEFAULT NULL,
  `viewed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `halaman_bab`
--

CREATE TABLE `halaman_bab` (
  `id_halaman` int NOT NULL,
  `id_bab` int NOT NULL,
  `nomor_halaman` int NOT NULL,
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `halaman_bab`
--

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

-- --------------------------------------------------------

--
-- Table structure for table `histori_baca`
--

CREATE TABLE `histori_baca` (
  `id_histori` int NOT NULL,
  `id_pengguna` int NOT NULL,
  `id_komik` int DEFAULT NULL,
  `id_bab` int NOT NULL,
  `tanggal_baca` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kategori`
--

CREATE TABLE `kategori` (
  `id_kategori` int NOT NULL,
  `nama_kategori` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kategori`
--

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

-- --------------------------------------------------------

--
-- Table structure for table `komentar_rating`
--

CREATE TABLE `komentar_rating` (
  `id_ulasan` int NOT NULL,
  `id_pengguna` int NOT NULL,
  `id_komik` int NOT NULL,
  `isi_komentar` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nilai_rating` int NOT NULL,
  `tanggal_komentar` datetime NOT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `komik`
--

CREATE TABLE `komik` (
  `id` int NOT NULL,
  `creatorID` int NOT NULL,
  `title` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `author` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `studio` json DEFAULT NULL,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `genre` json DEFAULT NULL,
  `chapter` int NOT NULL DEFAULT '0',
  `rating` decimal(3,2) NOT NULL DEFAULT '0.00',
  `color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `isTrending` tinyint(1) NOT NULL DEFAULT '0',
  `isPopular` tinyint(1) NOT NULL DEFAULT '0',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cover` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `komik`
--

INSERT INTO `komik` (`id`, `creatorID`, `title`, `author`, `studio`, `category`, `genre`, `chapter`, `rating`, `color`, `status`, `is_featured`, `isTrending`, `isPopular`, `description`, `cover`) VALUES
(1, 11, 'Solo Leveling', 'Chugong', '[\"Redice Studio\"]', 'Manhwa', '[\"Fantasy\", \"Action\", \"Adventure\", \"Drama\"]', 179, 9.10, 'purple', 'End', 0, 1, 1, 'Manhwa Solo Leveling yang dibuat oleh komikus bernama Chugong ini bercerita tentang 10 tahun yang lalu setelah Gerbang yang menghubungkan dunia nyata dengan dunia monster terbuka beberapa orang biasa setiap hari menerima kekuatan untuk berburu monster di dalam Gerbang. Mereka dikenal sebagai Pemburu. Namun tidak semua Pemburu kuat, Nama saya Sung JinWoo seorang Pemburu peringkat E Saya seseorang yang harus mempertaruhkan nyawanya di ruang bawah tanah paling rendah Terlemah di Dunia. Tidak memiliki keterampilan apa pun untuk ditampilkan saya hampir tidak mendapatkan uang yang dibutuhkan dengan bertarung di ruang bawah tanah berlevel rendah. Setidaknya sampai saya menemukan ruang bawah tanah tersembunyi dengan kesulitan tersulit dalam ruang bawah tanah peringkat D. Pada akhirnya saat aku menerima kematian tibatiba aku menerima kekuatan aneh log pencarian yang hanya bisa kulihat rahasia untuk naik level yang hanya aku yang tahu. Jika saya berlatih sesuai dengan pencarian saya dan monster yang diburu level saya akan naik Berubah dari Hunter terlemah menjadi Hunter S rank terkuat.', '../assets/coverComic/Solev.jpg'),
(2, 12, 'The Siren: Becoming the Villain\'s Family', 'Sol Leesu (설이수 / Seol Yi-soo)', '[\"ODR\"]', 'Manhwa', '[\"Shoujo\", \"Drama\", \"Fantasy\", \"Historical\", \"Romance\"]', 181, 9.60, 'pink', 'End', 0, 0, 1, 'Setelah ibunya yang seorang siren meninggal, Aria menjadi burung yang terkurung dan harus bernyanyi untuk kaisar sampai mati. Di saat dia hampir mati, Lloyd, grand duke iblis datang dan membawa Aria keluar dari kandang burung. Saat itu Aria berpikir... \'Kalau ada kehidupan selanjutnya, aku akan menolongmu.\' Ketika ia membuka mata, Aria kembali pada waktu di mana dia berusia 10 tahun. Saat itu dia berencana untuk melakukan pernikahan kontrak dengan Lloyd demi melindungi dirinya dan Lloyd.', '../assets/coverComic/TheSirenVillain.jpg'),
(3, 13, 'Author of My Destiny', 'Gyeoulip (겨울잎)', '[\"Yeondam\", \"Daon\"]', 'Manhwa', '[\"Shoujo\", \"Fantasy\", \"Historical\"]', 150, 9.40, 'gold', 'End', 0, 1, 1, 'Dalam novel “Kaisar dan Saintess,” pemeran utama pria dan pemeran utama wanita mampu mengalahkan naga dan iblis terkutuk, serta bos terakhir di cerita tersebut dengan cinta mereka yang indah. “…Haha. Aku lebih baik mati sekarang, jadi aku bisa pergi dengan tenang.” Daripada memiliki masa depan yang cemerlang dan dipuji sebagai penyihir jenius, aku hanya ingin masa depan yang aman di mana aku bisa memiliki masa pensiun yang nyaman … Itulah yang kuinginkan, tapi ketika dunia ini berakhir, akulah bos terakhirnya. Tolong, biarkan aku hidup … Namun, “Tunggu, bukankah ini pemeran utama pria, Siegren?” “Kenapa dia ada di sini?” Siegren, pemeran pria heroik yang akan menyelamatkan dunia, sedang sekarat tepat di depan mataku? Pemeran pria yang pikiran dan tubuhnya compang-camping karena berguling-guling di medan perang. “Siegren, aku yakin kau akan memiliki banyak hal untuk dilakukan di masa depan.” “Aku berjanji akan membantumu mencapainya.” Ketika aku melihat luka Siegren, aku membuat janji. Orang ini, yang menderita karena kalimat yang kutulis. Aku berjanji untuk memberinya kebahagiaan, masa depan yang cemerlang, dan kehidupan yang nyaman.', '../assets/coverComic/AuthorofMyOwnDestiny.webp'),
(4, 14, 'Soul Land II', 'Tang Jia San Shao', '[\"Changsha Angel Culture Co., Ltd\", \"Magic Comic\"]', 'Manhua', '[\"Action\", \"Adventure\", \"Cultivation\", \"Xianxia\", \"Romance\"]', 498, 7.60, 'pink', 'End', 0, 0, 1, 'Setelah kejadian di Soul Land pertama, kehidupan di dunia ini memasuki era baru yang penuh dengan tantangan dan kesempatan bagi para jiwa petarung. Tokoh utama melanjutkan perjalanan untuk mengembangkan kekuatan jiwa mereka dengan menghadapi lawan-lawan yang semakin kuat dan misteri yang tersembunyi di balik dunia jiwa. Dalam perjalanannya, mereka menemukan persahabatan sejati dan belajar arti sejati dari kekuatan dan tanggung jawab. Selain itu, konflik antar kerajaan jiwa dan organisasi rahasia memicu pertarungan yang tidak hanya menguji kemampuan bertarung namun juga strategi dan kecerdasan para tokoh. Seiring waktu berlalu, para protagonis harus menjaga keseimbangan antara dunia nyata dan dunia jiwa agar tidak runtuh, sambil menghadapi ancaman besar yang mengancam kedamaian seluruh Soul Land.', '../assets/coverComic/SoulLand2.webp'),
(5, 15, 'Shadow Slave', 'Guiltythree', '[\"Aethon Studio\"]', 'Manhwa', '[\"Action\", \"Adventure\", \"Fantasy\", \"Tragedy\"]', 40, 9.30, 'teal', 'New', 0, 1, 0, 'Tumbuh dalam kemiskinan, Sunny tidak pernah mengharapkan hal baik dari kehidupan. Namun, bahkan dia pun tidak menduga akan terpilih oleh Nightmare Spell dan menjadi salah satu dari Awakened. Kelompok elit orang-orang yang diberkahi dengan kekuatan supernatural. Berpindah ke dunia sihir yang hancur, ia mendapati dirinya menghadapi monster-monster mengerikan dan para Awakened lainnya dalam pertempuran maut untuk bertahan hidup. Lebih buruk lagi, kekuatan bayangan yang ia terima ternyata memiliki efek samping kecil dan berpotensi fatal. Tapi itu tidak akan menghentikannya. Terlahir sebagai budak. Ditakdirkan untuk mati. Dia memilih untuk bertahan hidup. Tidak peduli berapa pun harganya', '../assets/coverComic/ShadowSlave.webp'),
(6, 16, 'Dedes', 'Esti Siwi / Egestigi', '[\"Esti Siwi\", \"Egestigi\"]', 'Komik', '[\"Shoujo\", \"Kingdom\", \"Drama\", \"Historical\", \"Transmigration\"]', 131, 8.50, 'red', 'End', 0, 0, 1, 'Isekai yang diangkat dari kisah sejarah Indonesia! Seorang mahasiswi tiba-tiba terbangun di tubuh Dedes, seorang gadis yang kelak akan menjadi ibu bagi para raja di tanah Jawa. Tetapi, semakin lama berada dalam tubuh Dedes, dia menyadari bahwa sejarah yang ada tak sepenuhnya benar.', '../assets/coverComic/Dedes.jpg'),
(7, 17, 'Chainsaw Man', 'Tatsuki Fujimoto', '[\"Fujimoto-gumi\"]', 'Manga', '[\"Action\", \"Comedy\", \"Drama\", \"Horror\", \"Mature\", \"Shounen\", \"Supernatural\"]', 15, 9.80, 'green', 'End', 0, 0, 1, 'Chainsaw Man mengisahkan Denji, seorang pemuda yang hidupnya penuh dengan hutang warisan ayahnya dan berjuang untuk bertahan hidup dengan bekerja sebagai pemburu iblis bersama anjing setan peliharaannya yang juga menjadi gergaji mesin. Suatu hari, setelah dikhianati dan dibunuh, Denji berhasil dihidupkan kembali dengan menyatu bersama anjing setan tersebut sehingga ia menjadi manusia setengah iblis dengan kemampuan unik. Dengan kekuatan barunya, Denji direkrut oleh organisasi pemburu iblis pemerintah yang memiliki tujuan untuk memberantas ancaman iblis lain di masyarakat. Sambil menghadapi berbagai musuh mematikan, Denji juga berusaha memahami kehidupan dan keinginannya untuk memiliki kebahagiaan sederhana di tengah dunia yang kejam dan penuh bahaya ini.', '../assets/coverComic/ChainsawMan.jpg'),
(8, 18, 'Magic Emperor', 'Nightingale', '[\"Night Comic Studio\"]', 'Manhua', '[\"Action\", \"Adventure\", \"Fantasy\", \"Xianxia\"]', 924, 8.60, 'red', 'On-going', 0, 0, 1, 'Karena dia memiliki warisan Ancient Demonic emperor Demonic Emperor Zhuo Yifan menemui nasib sial karena dikhianati dan dibunuh oleh murid kepercayaannya. Setelah terlahir kembali kultivasinya kembali ke nol dan dia terjebak oleh heart demon tidak diberi pilihan selain menjadi pengurus rumah tangga dari satusatunya nona tertua Keluarga Luo Dari menjadi Demonic Emperor menjadi pengurus rumah tangga yang tidak penting bagaimana dia bisa bergaul dengan eart demon eldest miss dan kekuatan apa yang akan dia peroleh untuk memimpin dirinya sendiri dan keluarga yang menurun untuk bangkit kembali ke puncak benua.', '../assets/coverComic/MagicEmperor.JPEG'),
(9, 19, 'Genshin Impact', 'Hoyoverse', '[\"Hoyoverse\"]', 'Comic', '[\"Action\", \"Adventure\", \"Fantasy\", \"Drama\", \"Supernatural\", \"Mystery\"]', 13, 9.80, 'pink', 'On-going', 0, 0, 1, 'Kamu telah tiba di Teyvat, sebuah dunia fantasi di mana tujuh elemen mengalir, berpadu, menari dan beradu. Malapetaka yang melanda 500 tahun lalu kini telah sirna, namun kedamaian masih belum juga terpulihkan di kota angin, Mondstadt. Organisasi Fatui kini berkuasa dan menindas seluruh negara sambil bersembunyi di balik nama perlindungan. Di waktu yang sama kegelapan dari masa lalu telah terjaga, dan menunggu kesempatan untuk membalaskan dendamnya...', '../assets/coverComic/GenshinImpact.JPG');

-- --------------------------------------------------------

--
-- Table structure for table `komik_kategori`
--

CREATE TABLE `komik_kategori` (
  `id_komik_kategori` int NOT NULL,
  `id_komik` int NOT NULL,
  `id_kategori` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pengguna`
--

CREATE TABLE `pengguna` (
  `id_pengguna` int NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('Pembaca','Kreator','Admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pembaca',
  `is_premium` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pengguna`
--

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

-- --------------------------------------------------------

--
-- Table structure for table `profil`
--

CREATE TABLE `profil` (
  `id` int NOT NULL,
  `id_user` int NOT NULL,
  `path_file` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaksi`
--

CREATE TABLE `transaksi` (
  `id_transaksi` int NOT NULL,
  `id_pengguna` int NOT NULL,
  `metode_pembayaran` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_pembayaran` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `jumlah_bayar` decimal(12,2) NOT NULL,
  `tanggal_transaksi` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transaksi`
--

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

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bab`
--
ALTER TABLE `bab`
  ADD PRIMARY KEY (`id_bab`),
  ADD UNIQUE KEY `uq_episode_komik_nomor` (`id_komik`,`nomor_bab`);

--
-- Indexes for table `bookmark`
--
ALTER TABLE `bookmark`
  ADD PRIMARY KEY (`id_bookmark`),
  ADD UNIQUE KEY `uq_bookmark_pengguna_komik` (`id_pengguna`,`id_komik`),
  ADD KEY `fk_bookmark_komik` (`id_komik`);

--
-- Indexes for table `comic_views`
--
ALTER TABLE `comic_views`
  ADD PRIMARY KEY (`id_view`);

--
-- Indexes for table `halaman_bab`
--
ALTER TABLE `halaman_bab`
  ADD PRIMARY KEY (`id_halaman`),
  ADD UNIQUE KEY `id_bab` (`id_bab`,`nomor_halaman`);

--
-- Indexes for table `histori_baca`
--
ALTER TABLE `histori_baca`
  ADD PRIMARY KEY (`id_histori`),
  ADD KEY `fk_histori_pengguna` (`id_pengguna`),
  ADD KEY `fk_histori_episode` (`id_bab`);

--
-- Indexes for table `kategori`
--
ALTER TABLE `kategori`
  ADD PRIMARY KEY (`id_kategori`),
  ADD UNIQUE KEY `nama_kategori` (`nama_kategori`);

--
-- Indexes for table `komentar_rating`
--
ALTER TABLE `komentar_rating`
  ADD PRIMARY KEY (`id_ulasan`),
  ADD KEY `fk_ulasan_pengguna` (`id_pengguna`),
  ADD KEY `fk_ulasan_komik` (`id_komik`);

--
-- Indexes for table `komik`
--
ALTER TABLE `komik`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_komik_kreator` (`creatorID`);

--
-- Indexes for table `komik_kategori`
--
ALTER TABLE `komik_kategori`
  ADD PRIMARY KEY (`id_komik_kategori`),
  ADD UNIQUE KEY `uq_komik_kategori` (`id_komik`,`id_kategori`),
  ADD KEY `fk_kk_kategori` (`id_kategori`);

--
-- Indexes for table `pengguna`
--
ALTER TABLE `pengguna`
  ADD PRIMARY KEY (`id_pengguna`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `profil`
--
ALTER TABLE `profil`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_profil_pengguna` (`id_user`);

--
-- Indexes for table `transaksi`
--
ALTER TABLE `transaksi`
  ADD PRIMARY KEY (`id_transaksi`),
  ADD KEY `fk_transaksi_pengguna` (`id_pengguna`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bab`
--
ALTER TABLE `bab`
  MODIFY `id_bab` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `bookmark`
--
ALTER TABLE `bookmark`
  MODIFY `id_bookmark` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `comic_views`
--
ALTER TABLE `comic_views`
  MODIFY `id_view` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `halaman_bab`
--
ALTER TABLE `halaman_bab`
  MODIFY `id_halaman` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `histori_baca`
--
ALTER TABLE `histori_baca`
  MODIFY `id_histori` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `kategori`
--
ALTER TABLE `kategori`
  MODIFY `id_kategori` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `komentar_rating`
--
ALTER TABLE `komentar_rating`
  MODIFY `id_ulasan` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `komik`
--
ALTER TABLE `komik`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `komik_kategori`
--
ALTER TABLE `komik_kategori`
  MODIFY `id_komik_kategori` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `pengguna`
--
ALTER TABLE `pengguna`
  MODIFY `id_pengguna` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `profil`
--
ALTER TABLE `profil`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaksi`
--
ALTER TABLE `transaksi`
  MODIFY `id_transaksi` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bab`
--
ALTER TABLE `bab`
  ADD CONSTRAINT `fk_episode_komik` FOREIGN KEY (`id_komik`) REFERENCES `komik` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `bookmark`
--
ALTER TABLE `bookmark`
  ADD CONSTRAINT `fk_bookmark_komik` FOREIGN KEY (`id_komik`) REFERENCES `komik` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_bookmark_pengguna` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `halaman_bab`
--
ALTER TABLE `halaman_bab`
  ADD CONSTRAINT `halaman_bab_ibfk_1` FOREIGN KEY (`id_bab`) REFERENCES `bab` (`id_bab`) ON DELETE CASCADE;

--
-- Constraints for table `histori_baca`
--
ALTER TABLE `histori_baca`
  ADD CONSTRAINT `fk_histori_episode` FOREIGN KEY (`id_bab`) REFERENCES `bab` (`id_bab`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_histori_pengguna` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `komentar_rating`
--
ALTER TABLE `komentar_rating`
  ADD CONSTRAINT `fk_ulasan_komik` FOREIGN KEY (`id_komik`) REFERENCES `komik` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ulasan_pengguna` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `komik`
--
ALTER TABLE `komik`
  ADD CONSTRAINT `fk_komik_kreator` FOREIGN KEY (`creatorID`) REFERENCES `pengguna` (`id_pengguna`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `komik_kategori`
--
ALTER TABLE `komik_kategori`
  ADD CONSTRAINT `fk_kk_kategori` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_kk_komik` FOREIGN KEY (`id_komik`) REFERENCES `komik` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `profil`
--
ALTER TABLE `profil`
  ADD CONSTRAINT `fk_profil_pengguna` FOREIGN KEY (`id_user`) REFERENCES `pengguna` (`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transaksi`
--
ALTER TABLE `transaksi`
  ADD CONSTRAINT `fk_transaksi_pengguna` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id_pengguna`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
