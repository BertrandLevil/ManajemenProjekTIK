import { header } from "./header.js";

const paymentMethods = [
  { id: "qris", name: "QRIS", detail: "Pembayaran melalui QRIS" },
  { id: "ewallet", name: "E-Wallet", detail: "Pembayaran melalui e-wallet" },
  {
    id: "bank",
    name: "Transfer Bank",
    detail: "Pembayaran melalui transfer bank",
  },
];

const paymentChannels = {
  ewallet: ["GoPay", "OVO", "DANA", "ShopeePay"],
  bank: ["BCA", "BNI", "BRI", "Mandiri"],
};

const paymentChannelLogos = {
  GoPay: "gopay.jpg",
  OVO: "ovo.jpg",
  DANA: "dana.jpg",
  ShopeePay: "shopee.jpg",
  BCA: "bca.jpg",
  BNI: "bni.jpg",
  BRI: "bri.jpg",
  Mandiri: "mandiri.jpg",
};

function renderMethods() {
  return paymentMethods
    .map(
      (method) => `
                <label class="premium-method">
                    <input
                        type="radio"
                        name="payment-method"
                        value="${method.id}"
                        required
                    >
                    <span class="premium-method-copy">
                        <strong>${method.name}</strong>
                        <span>${method.detail}</span>
                    </span>
                    <span class="premium-radio" aria-hidden="true"></span>
                </label>
            `,
    )
    .join("");
}

function renderCheckout(content) {
  content.innerHTML = `
      <form id="premium-form" class="premium-checkout">
            <section class="premium-plan" aria-label="Paket Premium">
                <div class="premium-plan-top">
                    <div>
                        <p class="premium-plan-label">LANGGANAN BULANAN</p>
                        <h2>Premium</h2>
                    </div>
                </div>

                <div class="premium-plan-art" aria-hidden="true">
                    <lottie-player
                        src="../assets/animationWeb/animation01.json"
                        background="transparent"
                        speed="0.7"
                        loop
                        autoplay>
                    </lottie-player>
                </div>

                <div class="premium-price-card">
                    <span class="premium-price-label">Harga langganan</span>
                    <div class="premium-price">
                        <strong>Rp30.000</strong>
                        <span>/ bulan</span>
                    </div>
                </div>

                <div class="premium-plan-footer">
                    <span>Periode langganan</span>
                    <strong>30 hari</strong>
                </div>
            </section>

            <section class="premium-payment">
                <div class="premium-section-heading">
                    <h2>Metode pembayaran</h2>
                    <p>Pilih salah satu metode yang tersedia.</p>
                </div>

                <div class="premium-method-list">
                    ${renderMethods()}
                </div>

                <div class="premium-total">
                    <span>Total pembayaran</span>
                    <strong>Rp30.000</strong>
                </div>

                <button class="premium-submit" type="submit">
                    Lanjutkan
                </button>

                <p
                    id="premium-feedback"
                    class="premium-feedback"
                    role="status"
                    aria-live="polite"
                    hidden
                ></p>
            </section>
        </form>
    `;
}

function renderChannelOptions(methodId, channels) {
  return `
        <fieldset class="premium-channel-list">
            <legend>Pilih ${methodId === "ewallet" ? "E-Wallet" : "bank"}</legend>
            ${channels
              .map(
                (channel) => `
                    <label class="premium-channel">
                        <input
                            type="radio"
                            name="payment-channel"
                            value="${channel}"
                            required
                        >
                        ${
                          paymentChannelLogos[channel]
                            ? `
                                <span class="premium-channel-logo">
                                    <img
                                        src="../assets/methodpaymentlogo/${paymentChannelLogos[channel]}"
                                        alt=""
                                        width="44"
                                        height="44"
                                    >
                                </span>
                            `
                            : `
                                <span class="premium-channel-mark" aria-hidden="true">
                                    ${channel.slice(0, 2).toUpperCase()}
                                </span>
                            `
                        }
                        <span class="premium-channel-name">${channel}</span>
                        <span class="premium-channel-check" aria-hidden="true"></span>
                    </label>
                `,
              )
              .join("")}
        </fieldset>
        <p class="premium-payment-instructions" aria-live="polite">
            Pilih kanal untuk melihat informasi pembayaran.
        </p>
    `;
}

function renderPaymentModal(content, method, demoMode) {
  const channelOptions = paymentChannels[method.id];
  const details = channelOptions
    ? renderChannelOptions(method.id, channelOptions)
    : `
        <div class="premium-qr-placeholder" aria-hidden="true">
            <img
                class="premium-qr-logo"
                src="../assets/methodpaymentlogo/qris.jpg"
                alt=""
                width="90"
                height="60"
            >
            <strong>QRIS</strong>
            <small>QR tersedia setelah gateway terhubung</small>
        </div>
    `;

  content.innerHTML = `
        <div class="premium-modal-backdrop" data-payment-backdrop>
            <section
                class="premium-payment-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="premium-modal-title"
                aria-describedby="premium-modal-description"
                tabindex="-1"
            >
                <header class="premium-modal-header">
                    <div>
                        <p class="premium-status-label">METODE PEMBAYARAN</p>
                        <h2 id="premium-modal-title">
                            ${
                              method.id === "qris"
                                ? "Bayar dengan QRIS"
                                : `Pilih ${method.name}`
                            }
                        </h2>
                    </div>
                    <button
                        class="premium-modal-close"
                        type="button"
                        data-payment-action="close"
                        aria-label="Tutup popup"
                    >
                        <span class="premium-modal-close-icon">&times;</span>
                    </button>
                </header>

                <div id="premium-modal-description" class="premium-order-summary">
                    <div>
                        <span>ComicID Premium</span>
                        <small>Langganan 30 hari</small>
                    </div>
                    <strong>Rp30.000</strong>
                </div>

                <form id="premium-channel-form">
                    ${details}
                    <div class="premium-modal-note" role="note">
                        <span aria-hidden="true">i</span>
                        ${
                          demoMode
                            ? "Pratinjau checkout. Tidak ada pembayaran yang dikirim."
                            : "Pembayaran belum dapat diproses karena integrasi gateway belum tersedia."
                        }
                    </div>
                    <div class="premium-modal-actions">
                        <button
                            class="premium-demo-button premium-demo-button--secondary"
                            type="button"
                            data-payment-action="close"
                        >
                            Kembali
                        </button>
                        <button class="premium-submit" type="submit">
                            Lanjutkan
                        </button>
                    </div>
                    <p
                        id="premium-modal-feedback"
                        class="premium-feedback"
                        role="status"
                        aria-live="polite"
                        hidden
                    ></p>
                </form>
            </section>
        </div>
    `;

  content.querySelector(".premium-modal-close")?.focus();
}

function renderChannelInstructions(content, channel) {
  const instructions = content.querySelector(".premium-payment-instructions");
  if (!instructions) return;

  instructions.textContent = `Pembayaran ${channel} belum dapat diproses saat ini.`;
}

function renderDemoActions(activeStatus) {
  const buttons = [
    { status: "pending", label: "Uji tampilan menunggu" },
    { status: "success", label: "Uji tampilan berhasil" },
    { status: "failed", label: "Uji tampilan gagal" },
  ]
    .filter((button) => button.status !== activeStatus)
    .map(
      (button) => `
                <button
                    class="premium-demo-button"
                    type="button"
                    data-demo-status="${button.status}"
                >
                    ${button.label}
                </button>
            `,
    )
    .join("");

  return `
        <div class="premium-demo-actions" aria-label="Kontrol simulasi pembayaran">
            ${buttons}
            <button
                class="premium-demo-button premium-demo-button--secondary"
                type="button"
                data-demo-status="checkout"
            >
                Kembali ke checkout
            </button>
        </div>
    `;
}

function renderPending(content, selectedMethod) {
  content.innerHTML = `
        <section class="premium-status premium-status--pending" role="status" aria-live="polite">
            <lottie-player
                class="premium-loading-animation"
                src="../assets/animationWeb/Animation02.json"
                background="transparent"
                speed="1"
                loop
                autoplay
                aria-hidden="true">
            </lottie-player>
            <p class="premium-status-label">STATUS</p>
            <h2>Pembayaran sedang diproses</h2>
            <p>
                Pembayaran ${selectedMethod} sedang menunggu konfirmasi dari
                penyedia pembayaran.
            </p>
        </section>
        ${renderDemoActions("pending")}
    `;
}

function renderSuccess(content, selectedMethod) {
  content.innerHTML = `
        <section class="premium-status premium-status--success" role="status" aria-live="polite">
            <lottie-player
                class="premium-loading-animation"
                src="../assets/animationWeb/Animation03.json"
                background="transparent"
                speed="1"
                autoplay
                loop
                aria-hidden="true">
            </lottie-player>
            <p class="premium-status-label">STATUS</p>
            <h2>Pembayaran berhasil</h2>
            <p>
                Pembayaran melalui ${selectedMethod} berhasil. Akun Premium
                akan aktif setelah pembayaran diverifikasi.
            </p>
        </section>
        ${renderDemoActions("success")}
    `;
}

function renderFailed(content, selectedMethod) {
  content.innerHTML = `
        <section class="premium-status premium-status--failed" role="status" aria-live="polite">
            <lottie-player
                class="premium-loading-animation"
                src="../assets/animationWeb/Animation04.json"
                background="transparent"
                speed="1"
                autoplay
                loop
                aria-hidden="true">
            </lottie-player>
            <p class="premium-status-label">STATUS</p>
            <h2>Pembayaran gagal diproses</h2>
            <p>
                Payment gateway tidak dapat diakses. Silakan coba lagi nanti.
            </p>
        </section>
        ${renderDemoActions("failed")}
    `;
}

function renderPageHeading() {
  return `
        <header class="premium-heading">
            <p class="premium-kicker">
                <span class="premium-kicker-mark">C</span>
                ComicID Membership
            </p>

            <h1>
                Upgrade ke <span>Premium</span>
            </h1>

            <p>
                Pilih metode pembayaran untuk mengaktifkan langganan bulananmu.
            </p>
        </header>
    `;
}

export function frontPremium() {
  const app = document.getElementById("app");
  if (!app) return;

  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(
    window.location.hostname,
  );
  const demoMode =
    isLocalhost &&
    new URLSearchParams(window.location.search).get("demo") === "1";

  app.innerHTML = `
        ${header()}

        <main class="premium-page">
            <div class="premium-container">
                ${renderPageHeading()}
                <div id="premium-content"></div>
            </div>
        </main>
    `;

  const content = document.getElementById("premium-content");
  if (!content) return;

  let selectedMethod = "";
  let selectedMethodId = "";
  renderCheckout(content);

  content.addEventListener("change", (event) => {
    const channelInput = event.target.closest(
      'input[name="payment-channel"]',
    );
    if (channelInput) {
      renderChannelInstructions(content, channelInput.value);
      return;
    }

    const input = event.target.closest('input[name="payment-method"]');
    if (!input) return;

    content.querySelectorAll(".premium-method").forEach((method) => {
      const methodInput = method.querySelector("input");
      method.classList.toggle("is-selected", methodInput.checked);
    });

    const feedback = document.getElementById("premium-feedback");
    if (feedback) feedback.hidden = true;
  });

  content.addEventListener("submit", (event) => {
    if (event.target.id === "premium-channel-form") {
      event.preventDefault();

      const channelInput = content.querySelector(
        'input[name="payment-channel"]:checked',
      );
      if (paymentChannels[selectedMethodId] && !channelInput) {
        const feedback = document.getElementById("premium-modal-feedback");
        feedback.textContent = "Pilih kanal pembayaran terlebih dahulu.";
        feedback.hidden = false;
        return;
      }

      if (channelInput) {
        selectedMethod = `${selectedMethod} - ${channelInput.value}`;
      }

      if (demoMode) {
        renderPending(content, selectedMethod);
        return;
      }

      const feedback = document.getElementById("premium-modal-feedback");
      feedback.textContent =
        "Integrasi pembayaran belum tersedia. Belum ada pembayaran yang diproses.";
      feedback.hidden = false;
      return;
    }

    if (event.target.id !== "premium-form") return;
    event.preventDefault();

    const selectedInput = content.querySelector(
      'input[name="payment-method"]:checked',
    );

    if (!selectedInput) {
      const feedback = document.getElementById("premium-feedback");
      feedback.textContent = "Pilih metode pembayaran terlebih dahulu.";
      feedback.hidden = false;
      return;
    }

    const method = paymentMethods.find(
      (item) => item.id === selectedInput.value,
    );
    selectedMethod = method.name;
    selectedMethodId = method.id;
    renderPaymentModal(content, method, demoMode);
  });

  content.addEventListener("click", (event) => {
    const paymentAction = event.target.closest("[data-payment-action]");
    const clickedBackdrop = event.target.matches("[data-payment-backdrop]");
    if (
      paymentAction?.dataset.paymentAction === "close" ||
      clickedBackdrop
    ) {
      renderCheckout(content);
      return;
    }

    const button = event.target.closest("[data-demo-status]");
    if (!button || !demoMode) return;

    switch (button.dataset.demoStatus) {
      case "pending":
        renderPending(content, selectedMethod);
        break;
      case "success":
        renderSuccess(content, selectedMethod);
        break;
      case "failed":
        renderFailed(content, selectedMethod);
        break;
      case "checkout":
        renderCheckout(content);
        break;
      default:
        break;
    }
  });

  content.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && content.querySelector(".premium-payment-modal")) {
      renderCheckout(content);
    }
  });
}
