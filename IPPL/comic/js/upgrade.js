/* ==========================================================================
   UPGRADE PREMIUM – Payment Flow Logic
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const upgNowBtn       = document.getElementById("upgNowBtn");
  const paymentModal    = document.getElementById("paymentModal");
  const closePaymentBtn = document.getElementById("closePaymentModal");
  const selectPayBtn    = document.getElementById("selectPaymentBtn");
  const paymentError    = document.getElementById("paymentError");
  const resultOverlay   = document.getElementById("resultOverlay");
  const resultBackBtn   = document.getElementById("resultBackBtn");
  const resultOkBtn     = document.getElementById("resultOkBtn");
  const resultIconArea  = document.getElementById("resultIconArea");
  const resultMessage   = document.getElementById("resultMessage");
  const resultHeaderTitle = document.getElementById("resultHeaderTitle");

  let selectedMethod = null;

  // ── Open payment modal ──────────────────────────────────────────
  if (upgNowBtn) {
    upgNowBtn.addEventListener("click", () => {
      paymentModal.style.display = "flex";
      selectedMethod = null;
      resetMethodSelection();
      paymentError.style.display = "none";
    });
  }

  // ── Close payment modal ──────────────────────────────────────────
  if (closePaymentBtn) {
    closePaymentBtn.addEventListener("click", () => {
      paymentModal.style.display = "none";
    });
  }

  // Close modal on overlay click
  if (paymentModal) {
    paymentModal.addEventListener("click", (e) => {
      if (e.target === paymentModal) paymentModal.style.display = "none";
    });
  }

  // ── Method selection ─────────────────────────────────────────────
  document.querySelectorAll(".upg-method-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      // Deselect all
      resetMethodSelection();
      // Select clicked
      btn.classList.add("selected");
      btn.querySelector(".upg-method-check").textContent = "●";
      selectedMethod = btn.dataset.method;
      paymentError.style.display = "none";
    });
  });

  function resetMethodSelection() {
    document.querySelectorAll(".upg-method-item").forEach((b) => {
      b.classList.remove("selected");
      b.querySelector(".upg-method-check").textContent = "○";
    });
    selectedMethod = null;
  }

  // ── Confirm selection & simulate payment ─────────────────────────
  if (selectPayBtn) {
    selectPayBtn.addEventListener("click", () => {
      if (!selectedMethod) {
        // Show error tooltip
        paymentError.style.display = "flex";
        // Re-trigger shake
        paymentError.style.animation = "none";
        void paymentError.offsetWidth;
        paymentError.style.animation = "";
        return;
      }

      paymentModal.style.display = "none";

      // 50/50 random success/failure for demo
      const isSuccess = Math.random() > 0.5;
      showResult(isSuccess);
    });
  }

  // ── Show result overlay ──────────────────────────────────────────
  function showResult(isSuccess) {
    resultOverlay.style.display = "flex";

    if (isSuccess) {
      resultHeaderTitle.textContent = "Payment Successful";
      resultMessage.textContent = "Payment Successful !";
      resultIconArea.innerHTML = `
        <svg class="upg-result-svg" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M70 10 C37.5 10 11 37.5 11 70 C11 102.5 37.5 129 70 129 C102.5 129 129 102.5 129 70 C129 37.5 102.5 10 70 10Z" fill="rgba(39,174,96,0.12)" stroke="#27ae60" stroke-width="4"/>
          <path d="M45 70 L63 88 L96 52" stroke="#27ae60" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- Scalloped edge -->
          ${scallop(70, 70, 56, 16)}
        </svg>`;
    } else {
      resultHeaderTitle.textContent = "Payment Failed";
      resultMessage.textContent = "Payment process Failed !";
      resultIconArea.innerHTML = `
        <svg class="upg-result-svg" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="70" cy="70" r="54" fill="rgba(231,76,60,0.1)" stroke="#e74c3c" stroke-width="4"/>
          <path d="M48 48 L92 92 M92 48 L48 92" stroke="#e74c3c" stroke-width="5.5" stroke-linecap="round"/>
        </svg>`;
    }
  }

  // Helper: generate scalloped SVG path for success badge
  function scallop(cx, cy, r, bumps) {
    const pts = [];
    for (let i = 0; i < bumps * 2; i++) {
      const angle = (Math.PI * 2 / (bumps * 2)) * i - Math.PI / 2;
      const rr = i % 2 === 0 ? r : r - 8;
      pts.push(`${cx + Math.cos(angle) * rr},${cy + Math.sin(angle) * rr}`);
    }
    return `<polygon points="${pts.join(' ')}" fill="none" stroke="#27ae60" stroke-width="4"/>`;
  }

  // ── Result back / OK ─────────────────────────────────────────────
  if (resultBackBtn) {
    resultBackBtn.addEventListener("click", () => {
      resultOverlay.style.display = "none";
    });
  }

  if (resultOkBtn) {
    resultOkBtn.addEventListener("click", () => {
      resultOverlay.style.display = "none";
    });
  }
});
