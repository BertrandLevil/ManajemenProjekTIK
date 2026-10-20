export function comicCard(comic) {
    return `
        <article class="comic-card">
            <a class="comic-cover ${comic.cover ? "has-cover" : `cover-${comic.color}`}"
                href="comic.html?id=${comic.id}"
                aria-label="Lihat ${comic.title}">

                ${
                    comic.cover
                        ? `<img class="comic-cover-image"
                                src="${comic.cover}"
                                alt="Cover ${comic.title}"
                                loading="lazy">`
                        : `<span class="cover-symbol">${comic.title.charAt(0)}</span>`
                }

                <span class="cover-tag">${comic.category}</span>
                <span class="cover-status">${comic.status}</span>
            </a>

            <div class="comic-info">
                <a class="comic-title"
                    href="comic.html?id=${comic.id}">
                    ${comic.title}
                </a>

                <div class="comic-meta">
                    <span>${comic.category}</span>
                    <span>${
                        Array.isArray(comic.genre)
                            ? comic.genre.join(", ")
                            : comic.genre
                    }</span>
                    <span class="comic-rating">★ ${comic.rating}</span>
                </div>

                <a href="reader.html?id=${comic.id}&ep=${comic.chapter}"
                    class="comic-chapter">Chapter ${comic.chapter}
                </a>
            </div>
        </article>
    `;
}

export function comicSection(title, subtitle, list, sectionId) {
    return `
        <section class="content-section" id="${sectionId}">
            <div class="section-heading">
                <div>
                    <p class="section-eyebrow">${subtitle}</p>
                    <h2>${title}</h2>
                </div>

                <a class="see-all" href="${sectionId}.html">
                    Lihat semua <span>→</span>
                </a>
            </div>

            <div class="comic-grid">
                ${list.map(comicCard).join("")}
            </div>
        </section>
    `;
}