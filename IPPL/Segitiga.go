package main
import (
	"fmt"
)

func main(){
	var a, b, c float64
	fmt.Println("Masukkan sisi segitiga")
	fmt.Scan(&a, &b, &c)
	
	
	switch  {
	case a <= 0 || b <= 0 || c <= 0:
		fmt.Println("Tidak ada segitiga yang dapat dibangun")
	case a >= b + c :
		fmt.Println("Tidak ada segitiga yang dapat dibangun")
	case b >= a + c :
		fmt.Println("Tidak ada segitiga yang dapat dibangun")
	case c >= a + b:
		fmt.Println("Tidak ada segitiga yang dapat dibangun")
	case a == b && b == c :
		fmt.Println("Segitiga sama sisi")
	case a == b || b == c || a == c:
		fmt.Println("Segitiga sama kaki")
	case a*a + b*b == c*c || a*a + c*c == b*b || b*b + c*c == a*a:
		fmt.Println("Segitiga siku-siku")
	default:
		fmt.Println("Segitiga sembarang")
	}
}