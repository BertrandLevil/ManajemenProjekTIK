export function heroSlide(comic, index) {
    return `
        <article class="hero-slide cover-${comic.color} ${comic.cover ? "has-cover" : ""}"
        data-slide="${index}">
            <div class="hero-overlay"></div>

            <div class="hero-content">
                <span class="hero-label">
                    <span class="hero-label-dot"></span>
                    COMICID ORIGINAL SELECTION
                </span>

                <p class="hero-category">${comic.category}</p>

                <p class="hero-genre">
                    ${comic.genre} · ★ ${comic.rating}
                </p>

                <h1>${comic.title}</h1>

                <p class="hero-description">
                    ${comic.description}
                </p>

                <div class="hero-buttons">
                    <a class="button-primary"
                    href="reader.html?id=${comic.id}&ep=1">
                        <span>▶</span> Baca sekarang
                    </a>

                    <a class="button-outline"
                    href="comic.html?id=${comic.id}">
                        Lihat detail
                    </a>
                </div>

                <p class="hero-chapter">
                    Chapter terbaru: ${comic.chapter}
                </p>
            </div>

            <div class="hero-art" aria-hidden="true">
                ${
                    comic.cover
                        ? `<img src="${comic.cover}" alt="">`
                        : `<span>${comic.title.charAt(0)}</span>`
                }
            </div>
        </article>
    `;
}

export function setupCarousel() {
    let currentSlide = 0;

    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".carousel-dot");

    if (slides.length === 0) return;

    function showSlide(index) {
        currentSlide = (index + slides.length) % slides.length;

        slides.forEach((slide, i) => {
            slide.classList.toggle("active", i === currentSlide);
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === currentSlide);
        });
    }

    document.getElementById("hero-prev").addEventListener("click", () => {
        showSlide(currentSlide - 1);
    });

    document.getElementById("hero-next").addEventListener("click", () => {
        showSlide(currentSlide + 1);
    });

    dots.forEach(dot => {
        dot.addEventListener("click", () => {
            showSlide(Number(dot.dataset.goSlide));
        });
    });

    showSlide(0);
}