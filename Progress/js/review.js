const escapeHTML = value =>
    String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);

export function renderReview(comic, chapter = null) {
    const ratingKey = `comicid_ratings_${comic.id}`;
    const commentKey = `comicid_comments_${comic.id}`;

    const commentsContainerId = chapter === null
        ? "detail-comments"
        : "reader-comments";

    let currentCommentSort = "newest";

    let ratings = JSON.parse(
        localStorage.getItem(ratingKey) || "[]"
    );

    let comments = JSON.parse(
        localStorage.getItem(commentKey) || "[]"
    );

    comments = comments.map((comment, index) => ({
        ...comment,
        id: comment.id || `comment-${Date.now()}-${index}`,
        createdAt: comment.createdAt || (Date.now() + index),
        chapter: Number.isInteger(comment.chapter)
            ? comment.chapter
            : null
    }));

    localStorage.setItem(commentKey, JSON.stringify(comments));

    function renderRatings() {
        const average = ratings.length
            ? ratings.reduce((sum, item) => sum + item.score, 0) / ratings.length
            : Number(comic.rating) || 0;

        return `
            <div class="rating-summary">
                <strong>${average.toFixed(1)}</strong>
                <span class="rating-stars">★</span>
                <span>${ratings.length
                    ? `${ratings.length} rating pembaca`
                    : "Rating awal komik"}</span>
            </div>

            <form id="comic-rating-form" class="rating-form">
                <label for="comic-rating">Beri rating komik ini</label>
                <select id="comic-rating" required>
                    <option value="">Pilih rating</option>
                    ${[5, 4, 3, 2, 1].map(score => `
                        <option value="${score}">${score} bintang</option>
                    `).join("")}
                </select>
                <button type="submit">Kirim Rating</button>
            </form>
        `;
    }

    function renderComments() {
        const sortedComments = comments
            .filter(comment =>
                chapter === null || comment.chapter === chapter
            )
            .slice()
            .sort((a, b) => {
                if (currentCommentSort === "oldest") {
                    return a.createdAt - b.createdAt;
                }

                return b.createdAt - a.createdAt;
            });

        return `
            <form id="comic-comment-form" class="comment-form">
                <label for="comic-comment">Tulis komentar</label>

                <textarea
                    id="comic-comment"
                    rows="4"
                    maxlength="1000"
                    placeholder="Bagaimana pendapatmu tentang komik ini?"
                    required
                ></textarea>

                <button type="submit">Kirim Komentar</button>
            </form>

            <div class="comment-toolbar">
                <label for="comment-sort">Urutkan komentar:</label>

                <select id="comment-sort">
                    <option value="newest"
                        ${currentCommentSort === "newest" ? "selected" : ""}>
                        Terbaru
                    </option>

                    <option value="oldest"
                        ${currentCommentSort === "oldest" ? "selected" : ""}>
                        Terlama
                    </option>
                </select>
            </div>

            <div class="comment-list">
                ${sortedComments.length
                    ? sortedComments.map(comment => `
                        <article class="comment-item"
                            data-comment-id="${escapeHTML(comment.id)}">

                            <strong>${escapeHTML(comment.username)}</strong>

                            <p>${escapeHTML(comment.text)}</p>

                            <small>
                                ${escapeHTML(comment.date)}
                                ${comment.chapter !== null
                                    ? ` • Chapter ${comment.chapter}`
                                    : " • Detail komik"}
                            </small>
                        </article>
                    `).join("")
                    : "<p class='empty-comments'>Belum ada komentar.</p>"
                }
            </div>
        `;
    }

    function refreshReviews() {
        const commentsContainer =
            document.getElementById(commentsContainerId);

        if (!commentsContainer) return;

        commentsContainer.innerHTML = renderComments();

        if (chapter === null) {
            const ratingsContainer =
                document.getElementById("detail-ratings");

            if (ratingsContainer) {
                ratingsContainer.innerHTML = renderRatings();
            }

            bindRatingEvents();
        }

        bindCommentForm();
        bindCommentEvents();
    }

    function bindRatingEvents() {
        const ratingForm =
            document.getElementById("comic-rating-form");

        if (!ratingForm) return;

        ratingForm.addEventListener("submit", event => {
            event.preventDefault();

            const email = localStorage.getItem(
                "comicid_logged_in_email"
            );

            if (!email) {
                alert("Silakan login terlebih dahulu untuk memberi rating.");
                return;
            }

            const score = Number(
                document.getElementById("comic-rating").value
            );

            if (score < 1 || score > 5) return;

            ratings = ratings.filter(
                rating => rating.email !== email
            );

            ratings.push({ email, score });

            localStorage.setItem(
                ratingKey,
                JSON.stringify(ratings)
            );

            alert("Rating berhasil diperbarui!");
            refreshReviews();
        });
    }

    function bindCommentForm() {
        const commentForm =
            document.getElementById("comic-comment-form");

        if (!commentForm) return;

        commentForm.addEventListener("submit", event => {
            event.preventDefault();

            const commentInput =
                document.getElementById("comic-comment");

            const commentText = commentInput.value.trim();

            if (!commentText) return;

            const email = localStorage.getItem(
                "comicid_logged_in_email"
            );

            const username = email
                ? localStorage.getItem(`comicid_username_${email}`) || "Pembaca"
                : "Pembaca";

            comments.push({
                id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                username,
                text: commentText,
                chapter: chapter === null ? null : chapter,
                date: new Date().toLocaleString("id-ID"),
                createdAt: Date.now()
            });

            localStorage.setItem(
                commentKey,
                JSON.stringify(comments)
            );

            refreshReviews();
        });
    }

    function bindCommentEvents() {
        const commentContainer =
            document.getElementById(commentsContainerId);

        if (!commentContainer) return;

        const sortSelect =
            document.getElementById("comment-sort");

        if (!sortSelect) return;

        sortSelect.addEventListener("change", () => {
            currentCommentSort = sortSelect.value;

            commentContainer.innerHTML = renderComments();
            bindCommentForm();
            bindCommentEvents();
        });
    }

    refreshReviews();
}