package main

import "fmt"

func main() {
	var status bool = true
	var input, nomor, opsi int
	for status {
		fmt.Println("Transfer pulsa lebih mudah mulai dari 2000an")
		fmt.Println("1. Transfer Pulsa")
		fmt.Println("2. Masa Aktif")
		fmt.Println("3. Minta Pulsa")
		fmt.Println("4. Auto TP")
		fmt.Println("5. Delete Auto TP")
		fmt.Println("6. List Auto TP")
		fmt.Println("7. Cek Kupon Undian TP")
		fmt.Println("8. Keluar")
		fmt.Scan(&input)
		switch input {
		case 1:
			fmt.Println("Silahkan masukan nomor tujuan transfer pulsa: (Contoh: 08xxxx atau 628xxxx)")
			fmt.Scan(&nomor)
			fmt.Println("Terima kasih layanan Anda kami proses")
		case 2:
			fmt.Println("Beli masa aktif (dari tgl terakhir)")
			fmt.Println("1. 5hr/Rp2500")
			fmt.Println("2. 10hr/Rp4rb")
			fmt.Println("3. 15hr/Rp6rb")
			fmt.Println("4. 30hr/Rp14rb")
			fmt.Println("5. 90hr/Rp33rb")
			fmt.Println("6. 180hr/Rp60rb")
			fmt.Println("7. 300hr/Rp97rb")
			fmt.Println("8. 330hr/Rp106rb")
			fmt.Println("9. 360hr/Rp115rb")
			fmt.Println("0. Home")
			fmt.Println("10. Gift")
			fmt.Scan(&opsi)
			if opsi == 0 {
				continue
			}
		case 3:
			fmt.Println("Silahkan masukan nomor tujuan minta pulsa: (Contoh: 08xxxx atau 628xxxx)")
			fmt.Scan(&nomor)
			fmt.Println("Terima kasih layanan Anda kami proses")
		case 4:
			fmt.Println("Silahkan memasukkan nomor tujuan yg anda Auto Transfer Pulsa")
			fmt.Scan(&nomor)
			fmt.Println("Terima kasih layanan Anda kami proses")
		case 5:
			fmt.Println("Silahkan memasukkan nomor tujuan yang akan dihapus dari list Auto Transfer Pulsa:")
			fmt.Scan(&nomor)
			fmt.Println("Terima kasih layanan Anda kami proses")
			
		case 6:
			fmt.Println("Terima kasih, permintaan Anda sedang di proses. Nonton Film & Series Original Maxstream di Bioskop MAXstream Hanya 110/hr slm 360hr. Mau? CS:188")
			fmt.Println("1. Ya")
			fmt.Println("2. Tidak")
			fmt.Scan(&opsi)
			if opsi == 1 {
				fmt.Println("Terima kasih layanan Anda kami proses")
			} else {
				fmt.Println("Terima kasih")
			}
		case 7:
			fmt.Println("Terima kasih, permintaan Anda sedang di proses. Nonton Film & Series Original Maxstream di Bioskop MAXstream Hanya 110/hr slm 360hr. Mau? CS:188")
			fmt.Println("1. Ya")
			fmt.Println("2. Tidak")
			fmt.Scan(&opsi)
			if opsi == 1{
				fmt.Println("Terima kasih layanan Anda kami proses")
			} else {
				fmt.Println("Maaf, permintaan Anda tidak dapat kami proses")
			}

		case 8:
			break
		}
	}
}
