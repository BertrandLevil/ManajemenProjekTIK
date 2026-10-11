const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const submitButton = document.getElementById("submitButton");
const identityInput = document.getElementById("identity");
const passwordInput = document.getElementById("password");
const authForm = document.getElementById("authForm");
const message = document.getElementById("message");

let mode = "signup";

function setMode(nextMode) {
  mode = nextMode;
  const isSignup = mode === "signup";

  signupTab.classList.toggle("active", isSignup);
  loginTab.classList.toggle("active", !isSignup);
  signupTab.setAttribute("aria-selected", String(isSignup));
  loginTab.setAttribute("aria-selected", String(!isSignup));

  submitButton.textContent = isSignup ? "Sign Up" : "Log In";
  identityInput.placeholder = "Enter email or username";
  passwordInput.autocomplete = isSignup ? "new-password" : "current-password";
  message.textContent = "";
}

loginTab.addEventListener("click", () => setMode("login"));
signupTab.addEventListener("click", () => setMode("signup"));

authForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // Demo UI only: connect this handler to your backend/auth provider.
  const identity = identityInput.value.trim();
  if (!identity || !passwordInput.value) {
    message.textContent = "Please complete both fields.";
    return;
  }

  message.textContent = mode === "signup"
    ? "Account registered! Redirecting to home..."
    : "Logged in! Redirecting to home...";

  setTimeout(() => {
    window.location.href = mode === "signup" ? "pages/home.html?registered=true" : "pages/home.html";
  }, 600);
});

document.querySelectorAll(".social").forEach((button) => {
  button.addEventListener("click", () => {
    // OAuth needs provider configuration and a backend.
    message.textContent = `${button.getAttribute("aria-label")} requires OAuth setup.`;
  });
});
