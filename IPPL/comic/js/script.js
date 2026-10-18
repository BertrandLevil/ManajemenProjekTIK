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

/* ==========================================================================
   Space Canvas: Starfield & Rapid Shooting Stars (Bintang Jatuh Cepat)
   ========================================================================== */
function initSpaceBackground() {
  const canvas = document.getElementById("spaceCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // Twinkling background stars
  const STAR_COUNT = 180;
  const stars = [];
  const starColors = ["#ffffff", "#e0e7ff", "#fae8ff", "#c7d2fe", "#fef08a"];

  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.4,
      color: starColors[Math.floor(Math.random() * starColors.length)],
      alpha: Math.random() * 0.75 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.006,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
    });
  }

  // Rapid Shooting Stars (Bintang Jatuh Cepat)
  const shootingStars = [];
  const MAX_SHOOTING_STARS = 7;
  let lastSpawn = 0;

  function createShootingStar() {
    // Start above or across the top-left area
    const startX = Math.random() * (width * 1.3) - (width * 0.3);
    const startY = Math.random() * (height * 0.45) - 60;
    const angle = (Math.PI / 180) * (Math.random() * 20 + 35); // 35° - 55°
    const speed = Math.random() * 14 + 18; // 18 - 32 px per frame (sangat cepat)
    const length = Math.random() * 140 + 110; // Ekor cahaya panjang

    return {
      x: startX,
      y: startY,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      length: length,
      size: Math.random() * 1.6 + 1.2,
      opacity: 1,
      fadeRate: Math.random() * 0.016 + 0.012,
      color: Math.random() > 0.35 ? "#ffffff" : "#c084fc",
    };
  }

  function render(time) {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw & twinkle stars
    for (const star of stars) {
      star.alpha += star.twinkleSpeed * star.twinkleDir;
      if (star.alpha > 0.95) {
        star.alpha = 0.95;
        star.twinkleDir = -1;
      } else if (star.alpha < 0.15) {
        star.alpha = 0.15;
        star.twinkleDir = 1;
      }

      ctx.save();
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = star.color;
      ctx.shadowBlur = star.radius * 2;
      ctx.shadowColor = star.color;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Spawn rapid shooting stars frequently
    if (time - lastSpawn > Math.random() * 280 + 160 && shootingStars.length < MAX_SHOOTING_STARS) {
      shootingStars.push(createShootingStar());
      if (Math.random() > 0.5) {
        shootingStars.push(createShootingStar());
      }
      lastSpawn = time;
    }

    // 3. Draw shooting stars with luminous gradient trails
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];

      const tailAngle = Math.atan2(s.dy, s.dx);
      const tailX = s.x - Math.cos(tailAngle) * s.length;
      const tailY = s.y - Math.sin(tailAngle) * s.length;

      const gradient = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${s.opacity})`);
      gradient.addColorStop(0.25, `rgba(192, 132, 252, ${s.opacity * 0.85})`);
      gradient.addColorStop(0.65, `rgba(139, 92, 246, ${s.opacity * 0.4})`);
      gradient.addColorStop(1, "rgba(99, 102, 241, 0)");

      ctx.save();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = s.size;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      // Glowing star head
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#e9d5ff";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Update position
      s.x += s.dx;
      s.y += s.dy;
      s.opacity -= s.fadeRate;

      // Clean up faded or offscreen meteors
      if (s.opacity <= 0 || s.x > width + 250 || s.y > height + 250) {
        shootingStars.splice(i, 1);
      }
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

// Start space cosmos animation
initSpaceBackground();
