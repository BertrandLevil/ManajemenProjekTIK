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

export function frontPremium() {
    const app = document.getElementById("app");
    if (!app) return;

    app.innerHTML = `
        ${header()}

        <main class="premium-page">
            <div class="premium-container">
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

                <form id="premium-form" class="premium-checkout">
                    <section class="premium-plan" aria-label="Paket Premium">
                        <div class="premium-plan-top">
                            <div>
                                <p class="premium-plan-label">LANGGANAN BULANAN</p>
                                <h2>Premium</h2>
                            </div>
                        </div>

                        <!-- Area animasi: di antara judul paket dan harga -->
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
            </div>
        </main>
    `;

    const form = document.getElementById("premium-form");
    const feedback = document.getElementById("premium-feedback");

    form.addEventListener("change", (event) => {
    if (event.target.name !== "payment-method") return;

    form.querySelectorAll(".premium-method").forEach((method) => {
        const input = method.querySelector("input");
        method.classList.toggle("is-selected", input.checked);
    });

    feedback.hidden = true;
    });

    form.addEventListener("submit", (event) => {
    event.preventDefault();

    const selectedMethod = form.querySelector(
        'input[name="payment-method"]:checked',
    );

    if (!selectedMethod) {
        feedback.textContent = "Pilih metode pembayaran terlebih dahulu.";
        feedback.hidden = false;
        return;
    }

    const method = paymentMethods.find(
        (item) => item.id === selectedMethod.value,
    );

    feedback.textContent = `Metode ${method.name} dipilih.`;
    feedback.hidden = false;
    });
}