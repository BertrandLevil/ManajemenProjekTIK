public abstract class User {
    private String username;
    private String email;
    private String password;
    private boolean isLoggedIn;

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.isLoggedIn = false;
    }

    public abstract boolean register();

    public boolean login(String inputUsernameOrEmail, String inputPassword) {
        if ((inputUsernameOrEmail.equals(this.username) || inputUsernameOrEmail.equals(this.email)) 
                && inputPassword.equals(this.password)) {
            this.isLoggedIn = true;
            System.out.println("Login berhasil!");
            return true;
        }
        System.out.println("Login gagal!");
        return false;
    }

    public void logout() {
        this.isLoggedIn = false;
        System.out.println("Berhasil logout.");
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public boolean isLoggedIn() { return isLoggedIn; }
}