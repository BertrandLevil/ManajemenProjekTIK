export function comicCard(comic) {
    return `
        <article class="comic-card">
            ${
                comic.cover
                    ? `<img class="comic-card-backdrop"
                            src="${comic.cover}"
                            alt=""
                            aria-hidden="true"
                            loading="lazy">`
                    : `<span class="comic-card-backdrop cover-${comic.color}"
                            aria-hidden="true"></span>`
            }
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
                <div class="comic-heading">
                    <a class="comic-title"
                        href="comic.html?id=${comic.id}">
                        ${comic.title}
                    </a>
                    <span class="comic-rating">
                        <svg class="comic-meta-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"></path>
                        </svg>
                        ${comic.rating}
                    </span>
                </div>

                <div class="comic-meta">
                    <div class="comic-meta-primary">
                        <span class="comic-category">
                            <svg class="comic-meta-icon" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M20.6 13.4 12 22l-10-10V2h10l8.6 8.6a2 2 0 0 1 0 2.8Z"></path>
                                <circle cx="7" cy="7" r="1"></circle>
                            </svg>
                            ${comic.category}
                        </span>
                    </div>
                    <span class="comic-genres">
                        <svg class="comic-meta-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"></path>
                            <path d="m19 14 .9 2.6L22 17.5l-2.1.9L19 21l-.9-2.6-2.1-.9 2.1-.9L19 14Z"></path>
                        </svg>
                        <span>${
                        Array.isArray(comic.genre)
                            ? comic.genre.join(", ")
                            : comic.genre
                        }</span>
                    </span>
                </div>

                <a href="reader.html?id=${comic.id}&ep=${comic.chapter}"
                    class="comic-chapter">
                    <svg class="comic-meta-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5v-12Z"></path>
                        <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8M8 10h6"></path>
                    </svg>
                    <span>Chapter ${comic.chapter}</span>
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
                    Lihat Semua <span>→</span>
                </a>
            </div>

            <div class="comic-grid">
                ${list.map(comicCard).join("")}
            </div>
        </section>
    `;
}