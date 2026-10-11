/* ==========================================================================
   COMICS APP - INTERACTIONS, DYNAMIC ROUTING & SMART IMAGE RESOLVER
   Supports: .webp, .jpg, .png, .jpeg automatically with fallbacks
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initSmartImages();
  initRegistrationBanner();
  initSearch();
  initGenres();
  initDynamicDetailsPage();
  initDynamicReaderPage();
  initAutoCarousel();
  initSideDrawer();
  initCommentSection();
});

/* --------------------------------------------------------------------------
   Smart Image Resolver: Supports .webp, .jpg, .png, .jpeg seamlessly
   -------------------------------------------------------------------------- */
function smartLoadImage(img, baseName, fallbackUrl) {
  if (!img || !baseName) return;

  const extensions = [".webp", ".jpg", ".png", ".jpeg"];
  // Strip any existing extension from baseName to be agnostic
  const cleanBase = baseName.replace(/\.(webp|jpg|jpeg|png)$/i, "");
  let extIndex = 0;

  function tryNextExtension() {
    if (extIndex < extensions.length) {
      const ext = extensions[extIndex++];
      img.src = `../assets/${cleanBase}${ext}`;
    } else {
      img.onerror = null;
      if (fallbackUrl) {
        img.src = fallbackUrl;
      } else {
        img.style.display = "none";
        if (img.nextElementSibling && img.nextElementSibling.classList.contains("panel-placeholder-content")) {
          img.nextElementSibling.style.display = "block";
        }
      }
    }
  }

  img.onerror = tryNextExtension;
  tryNextExtension();
}

function initSmartImages() {
  document.querySelectorAll("img[data-smart-img]").forEach((img) => {
    const baseName = img.getAttribute("data-smart-img");
    const fallback = img.getAttribute("data-fallback") || "";
    smartLoadImage(img, baseName, fallback);
  });
}

/* --------------------------------------------------------------------------
   Theme Switcher (Dark & Light theme)
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const storedTheme = localStorage.getItem("comic_theme") || "dark";
  
  applyTheme(storedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      localStorage.setItem("comic_theme", nextTheme);
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (themeToggleBtn) {
    themeToggleBtn.innerHTML = theme === "dark" ? "☀️" : "🌙";
    themeToggleBtn.setAttribute("title", theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode");
  }
}

/* --------------------------------------------------------------------------
   Registration Success Banner (from index.html redirect)
   -------------------------------------------------------------------------- */
function initRegistrationBanner() {
  const params = new URLSearchParams(window.location.search);
  const toast = document.getElementById("regToast");
  const closeBtn = document.getElementById("closeToast");

  if (toast && (params.has("registered") || params.get("status") === "success")) {
    toast.style.display = "flex";
  }

  if (closeBtn && toast) {
    closeBtn.addEventListener("click", () => {
      toast.style.display = "none";
    });
  }
}

/* --------------------------------------------------------------------------
   Search Filtering
   -------------------------------------------------------------------------- */
function initSearch() {
  const searchInput = document.getElementById("comicSearch");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    const cards = document.querySelectorAll(".comic-card");

    cards.forEach((card) => {
      const title = (card.getAttribute("data-title") || "").toLowerCase();
      const genre = (card.getAttribute("data-genre") || "").toLowerCase();
      if (title.includes(query) || genre.includes(query)) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Genre Pill Filtering
   -------------------------------------------------------------------------- */
function initGenres() {
  const genrePills = document.querySelectorAll(".genre-pill");
  if (!genrePills.length) return;

  genrePills.forEach((pill) => {
    pill.addEventListener("click", (e) => {
      e.preventDefault();
      const genre = pill.getAttribute("data-genre");
      
      const isActive = pill.classList.contains("active");
      genrePills.forEach((p) => p.classList.remove("active"));

      const cards = document.querySelectorAll(".comic-card");
      if (!isActive && genre !== "all") {
        pill.classList.add("active");
        cards.forEach((card) => {
          const cardGenre = (card.getAttribute("data-genre") || "").toLowerCase();
          card.style.display = cardGenre.includes(genre.toLowerCase()) ? "flex" : "none";
        });
      } else {
        cards.forEach((card) => (card.style.display = "flex"));
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Dynamic Comic Details Page (comic-details.html)
   -------------------------------------------------------------------------- */
function initDynamicDetailsPage() {
  const detailsContainer = document.getElementById("comicDetailsMain");
  if (!detailsContainer || !window.COMICS_DATA) return;

  const urlParams = new URLSearchParams(window.location.search);
  const comicId = urlParams.get("id") || urlParams.get("comic") || "world-after-fall";
  const comic = window.COMICS_DATA[comicId] || window.COMICS_DATA["world-after-fall"];

  // Update Page Title
  document.title = `${comic.title} - Comic Details`;

  // Update Cover Image with Smart Image loader
  const coverImg = document.getElementById("detailCoverImg");
  if (coverImg) {
    coverImg.alt = `${comic.title} Cover`;
    smartLoadImage(
      coverImg, 
      comic.coverBase, 
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80"
    );
  }

  // Update Text Elements
  const eyebrow = document.getElementById("detailEyebrow");
  if (eyebrow) eyebrow.textContent = comic.genreEyebrow;

  const title = document.getElementById("detailTitle");
  if (title) title.textContent = comic.title;

  const author = document.getElementById("detailAuthor");
  if (author) author.textContent = `by ${comic.author}`;

  const ratingStats = document.getElementById("detailRatingStats");
  if (ratingStats) {
    const epCount = comic.episodes ? comic.episodes.length : 30;
    ratingStats.innerHTML = `<span>★</span> ${comic.rating} · ${comic.latestChapter} ${comic.chapterPrefix.toLowerCase()}s`;
  }

  const synopsis = document.getElementById("detailSynopsis");
  if (synopsis) synopsis.textContent = comic.synopsis;

  // Update Action Buttons
  const readLatestBtn = document.getElementById("detailReadLatestBtn");
  if (readLatestBtn) {
    readLatestBtn.href = `reader.html?comic=${comic.id}&ep=${comic.latestChapter}`;
  }

  const saveBtn = document.getElementById("saveLibraryBtn");
  if (saveBtn) {
    initSaveToLibrary(comic.id, saveBtn);
  }

  // Render Dynamic Episodes List
  const episodesList = document.getElementById("detailEpisodesList");
  if (episodesList && comic.episodes) {
    episodesList.innerHTML = comic.episodes.map((ep) => `
      <a href="reader.html?comic=${comic.id}&ep=${ep.number}" class="episode-card-item">
        <div class="episode-icon-box">📖</div>
        <div class="episode-info-box">
          <div class="episode-title-text">${ep.title}</div>
          <div class="episode-meta-text">${ep.pages} pages | ${ep.date}</div>
        </div>
        <span style="color: var(--text-muted); font-size: 18px;">›</span>
      </a>
    `).join("");
  }
}

/* --------------------------------------------------------------------------
   Save to Library Toggle
   -------------------------------------------------------------------------- */
function initSaveToLibrary(comicId, saveBtn) {
  const storageKey = `saved_comic_${comicId}`;
  let isSaved = localStorage.getItem(storageKey) === "true";
  
  function updateUI() {
    if (isSaved) {
      saveBtn.innerHTML = "✓ In library";
      saveBtn.classList.add("saved");
    } else {
      saveBtn.innerHTML = "Save to library";
      saveBtn.classList.remove("saved");
    }
  }

  updateUI();

  saveBtn.onclick = () => {
    isSaved = !isSaved;
    localStorage.setItem(storageKey, String(isSaved));
    updateUI();
  };
}

/* --------------------------------------------------------------------------
   Dynamic Comic Reader Page (reader.html)
   -------------------------------------------------------------------------- */
function initDynamicReaderPage() {
  const readerContainer = document.getElementById("comicReaderMain");
  if (!readerContainer || !window.COMICS_DATA) return;

  const urlParams = new URLSearchParams(window.location.search);
  const comicId = urlParams.get("comic") || urlParams.get("id") || "world-after-fall";
  const comic = window.COMICS_DATA[comicId] || window.COMICS_DATA["world-after-fall"];
  
  const currentEp = parseInt(urlParams.get("ep"), 10) || comic.latestChapter;

  // Update Header & Subtitle
  const heading = document.getElementById("readerEpisodeHeading");
  if (heading) {
    heading.textContent = `${comic.chapterPrefix} ${currentEp}`;
  }

  const subtitle = document.getElementById("readerComicSubtitle");
  if (subtitle) {
    subtitle.textContent = comic.title;
  }

  document.title = `${comic.chapterPrefix} ${currentEp} - ${comic.title}`;

  // Update all back/details links with the correct comic ID
  const backBtn = document.getElementById("readerBackBtn");
  if (backBtn) {
    backBtn.href = `comic-details.html?id=${comic.id}`;
  }

  const navDetails = document.getElementById("readerNavDetails");
  if (navDetails) {
    navDetails.href = `comic-details.html?id=${comic.id}`;
  }

  const epListBtn = document.getElementById("readerEpListBtn");
  if (epListBtn) {
    epListBtn.href = `comic-details.html?id=${comic.id}`;
  }

  // Update Previous & Next Buttons
  const prevBtn = document.getElementById("prevEpisodeBtn");
  const nextBtn = document.getElementById("nextEpisodeBtn");

  if (prevBtn) {
    if (currentEp <= 1) {
      prevBtn.style.pointerEvents = "none";
      prevBtn.style.opacity = "0.4";
    } else {
      prevBtn.href = `reader.html?comic=${comic.id}&ep=${currentEp - 1}`;
    }
  }

  if (nextBtn) {
    if (currentEp >= comic.latestChapter) {
      nextBtn.addEventListener("click", () => {
        alert(`You are on the latest ${comic.chapterPrefix.toLowerCase()} (${comic.chapterPrefix} ${currentEp})!`);
      });
    } else {
      nextBtn.addEventListener("click", () => {
        window.location.href = `reader.html?comic=${comic.id}&ep=${currentEp + 1}`;
      });
    }
  }

  // Load Comic Panels with Smart Fallback Cascade
  [1, 2, 3].forEach((panelNum) => {
    const panelImg = document.getElementById(`comicPanelImg${panelNum}`);
    if (panelImg) {
      loadPanelSmartImage(panelImg, comic.id, panelNum);
    }
  });
}

function loadPanelSmartImage(img, comicId, panelNum) {
  const extensions = [".webp", ".jpg", ".png", ".jpeg"];
  
  // Candidates in priority order:
  // 1. ../assets/{comicId}-panel-{panelNum}.*
  // 2. ../assets/comic-panel-{panelNum}.*
  const candidateBases = [
    `${comicId}-panel-${panelNum}`,
    `comic-panel-${panelNum}`
  ];

  let candidateIdx = 0;
  let extIdx = 0;

  function tryNext() {
    if (candidateIdx < candidateBases.length) {
      const base = candidateBases[candidateIdx];
      const ext = extensions[extIdx++];
      
      if (extIdx >= extensions.length) {
        extIdx = 0;
        candidateIdx++;
      }
      
      img.src = `../assets/${base}${ext}`;
    } else {
      // If none found, show stylish placeholder
      img.onerror = null;
      img.style.display = "none";
      const placeholder = img.nextElementSibling;
      if (placeholder) {
        placeholder.style.display = "block";
      }
    }
  }

  img.onerror = tryNext;
  tryNext();
}

/* --------------------------------------------------------------------------
   Auto-sliding Carousel (Trending & Latest Updates)

   -------------------------------------------------------------------------- */
function initAutoCarousel() {
  let random = Math.random()*10000 + 1000
  setupCarousel("trendingTrack", "trendingDots", random);
  setupCarousel("latestTrack",   "latestDots",   random); 
}

function setupCarousel(trackId, dotsContainerId, intervalMs) {
  const track = document.getElementById(trackId);
  const dotsContainer = document.getElementById(dotsContainerId);
  if (!track || !dotsContainer) return;

  const cards = Array.from(track.querySelectorAll(".comic-card"));
  if (cards.length === 0) return;

  let CARDS_PER_VIEW = getCardsPerView();
  let totalSlides = Math.ceil(cards.length / CARDS_PER_VIEW);
  let currentSlide = 0;
  let autoTimer = null;
  let isPaused = false;

  function rebuildDots() {
    dotsContainer.innerHTML = "";
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement("span");
      dot.className = "dot" + (i === currentSlide ? " active" : "");
      dot.setAttribute("aria-label", `Slide ${i + 1}`);
      dot.addEventListener("click", () => {
        goToSlide(i);
        restartTimer();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function getCardsPerView() {
    if (window.innerWidth >= 1200) return 4;
    if (window.innerWidth >= 600) return 3;
    return 2;
  }

  function goToSlide(index) {
    if (totalSlides <= 1) {
      track.style.transform = "translateX(0px)";
      return;
    }
    currentSlide = ((index % totalSlides) + totalSlides) % totalSlides;
    const cardWidth = cards[0].offsetWidth;
    const gap = 20; // matches CSS gap
    const offset = currentSlide * CARDS_PER_VIEW * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;
    track.style.transition = "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)";

    // Update dots
    const dots = dotsContainer.querySelectorAll(".dot");
    dots.forEach((d, i) => d.classList.toggle("active", i === currentSlide));
  }

  function nextSlide() {
    if (!isPaused) {
      goToSlide(currentSlide + 1);
    }
  }

  function startTimer() {
    autoTimer = setInterval(nextSlide, intervalMs);
  }

  function restartTimer() {
    clearInterval(autoTimer);
    startTimer();
  }

  // Pause on hover
  track.addEventListener("mouseenter", () => { isPaused = true; });
  track.addEventListener("mouseleave", () => { isPaused = false; });

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    isPaused = true;
  }, { passive: true });
  track.addEventListener("touchend", (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
      restartTimer();
    }
    isPaused = false;
  }, { passive: true });

  // Recalculate on resize
  window.addEventListener("resize", () => {
    CARDS_PER_VIEW = getCardsPerView();
    totalSlides = Math.ceil(cards.length / CARDS_PER_VIEW);
    if (currentSlide >= totalSlides) currentSlide = 0;
    rebuildDots();
    goToSlide(currentSlide);
  });

  rebuildDots();

  startTimer();
}

/* --------------------------------------------------------------------------
   Side Drawer (☰ hamburger menu)
   -------------------------------------------------------------------------- */
function initSideDrawer() {
  const menuBtn = document.getElementById("menuBtn");
  const sideDrawer = document.getElementById("sideDrawer");
  const overlay = document.getElementById("drawerOverlay");
  if (!menuBtn || !sideDrawer || !overlay) return;

  function openDrawer() {
    sideDrawer.classList.add("open");
    overlay.classList.add("open");
    menuBtn.classList.add("open");
    menuBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    sideDrawer.classList.remove("open");
    overlay.classList.remove("open");
    menuBtn.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  menuBtn.addEventListener("click", () => {
    sideDrawer.classList.contains("open") ? closeDrawer() : openDrawer();
  });

  overlay.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  // Sync drawer theme toggle with page theme
  const drawerToggle = document.getElementById("drawerThemeToggle");
  if (drawerToggle) {
    function syncDrawerToggle() {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
      drawerToggle.classList.toggle("light-active", currentTheme === "light");
    }
    syncDrawerToggle();

    drawerToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      localStorage.setItem("comic_theme", nextTheme);
      syncDrawerToggle();
    });

    // Keep drawer toggle in sync when the header toggle is used
    const headerThemeBtn = document.getElementById("themeToggleBtn");
    if (headerThemeBtn) {
      headerThemeBtn.addEventListener("click", syncDrawerToggle);
    }
  }
}

/* --------------------------------------------------------------------------
   Comment & Rating Section (reader.html)
   -------------------------------------------------------------------------- */

// Sample seed reviews per comic+episode (keyed by "comicId-ep")
const SEED_REVIEWS = {
  default: [
    {
      author: "Fajri Anak Mama",
      avatar: "🦊",
      stars: 5,
      time: "2 days ago",
      body: "Oke sih keren banget bg aku suka",
      helpful: 12,
    },
     {
      author: "Bima Kun",
      avatar: "🦊",
      stars: 2,
      time: "1 days ago",
      body: "Kurang sih ini ga kyk komik sebelah",
      helpful: 1,
    },
  ],
};

function initCommentSection() {
  const commentSection = document.getElementById("commentSection");
  if (!commentSection) return;

  const urlParams = new URLSearchParams(window.location.search);
  const comicId = urlParams.get("comic") || urlParams.get("id") || "world-after-fall";
  const ep = urlParams.get("ep") || "1";
  const storageKey = `comic_comments_${comicId}_ep${ep}`;

  // --- Star Rating ---
  const starBtns = document.querySelectorAll(".star-btn");
  const ratingLabel = document.getElementById("ratingValueLabel");
  const RATING_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
  let selectedRating = 0;

  starBtns.forEach((btn) => {
    btn.addEventListener("mouseenter", () => highlightStars(parseInt(btn.dataset.val)));
    btn.addEventListener("mouseleave", () => highlightStars(selectedRating));
    btn.addEventListener("click", () => {
      selectedRating = parseInt(btn.dataset.val);
      highlightStars(selectedRating);
      ratingLabel.textContent = `${selectedRating}.0 | ${RATING_LABELS[selectedRating]}`;
    });
  });

  function highlightStars(count) {
    starBtns.forEach((b) => {
      const val = parseInt(b.dataset.val);
      b.classList.toggle("active", val <= count);
    });
  }

  // --- Send Comment ---
  const sendBtn = document.getElementById("sendCommentBtn");
  const textarea = document.getElementById("commentTextarea");
  const errorBanner = document.getElementById("commentErrorBanner");
  const successBanner = document.getElementById("commentSuccessBanner");
  const hint = document.getElementById("commentHint");

  if (sendBtn && textarea) {
    sendBtn.addEventListener("click", () => {
      const text = textarea.value.trim();

      // Validation
      if (!text) {
        textarea.classList.add("error");
        hint.textContent = "Comment must be filled.";
        hint.classList.add("error-text");
        errorBanner.style.display = "flex";
        // Re-trigger shake animation
        errorBanner.style.animation = "none";
        void errorBanner.offsetWidth;
        errorBanner.style.animation = "";
        return;
      }

      // Clear error state
      textarea.classList.remove("error");
      hint.textContent = "Please keep your comment respectful and relevant.";
      hint.classList.remove("error-text");
      errorBanner.style.display = "none";

      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const newComment = {
        author: "You",
        avatar: "👤",
        stars: selectedRating || 5,
        time: "Just now · Your Review",
        body: text,
        helpful: 0,
        isOwn: true,
      };
      existing.unshift(newComment);
      localStorage.setItem(storageKey, JSON.stringify(existing));

      // Show success
      successBanner.style.display = "flex";
      textarea.value = "";
      selectedRating = 0;
      highlightStars(0);
      ratingLabel.textContent = "";

      // Add Your Rating box
      renderYourRatingBox(newComment.stars, commentSection);

      // Refresh reviews list
      renderReviews(comicId, ep, storageKey);

      // Scroll to success banner
      successBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  // Load community reviews
  renderReviews(comicId, ep, storageKey);
}

function renderReviews(comicId, ep, storageKey) {
  const reviewsList = document.getElementById("reviewsList");
  const communitySubTitle = document.getElementById("communitySubTitle");
  if (!reviewsList) return;

  const savedComments = JSON.parse(localStorage.getItem(storageKey) || "[]");
  const seedKey = `${comicId}-${ep}`;
  const seedReviews = SEED_REVIEWS[seedKey] || SEED_REVIEWS.default;
  const allReviews = [...savedComments, ...seedReviews];

  communitySubTitle.textContent = `${allReviews.length} Comment${allReviews.length !== 1 ? "s" : ""}`;

  reviewsList.innerHTML = allReviews.map((r, idx) => `
    <div class="review-card">
      <div class="review-card-header">
        <div class="review-avatar">${r.avatar || "👤"}</div>
        <div class="review-meta">
          <span class="review-author">${escapeHtml(r.author)}</span>
          <span class="review-timestamp">${escapeHtml(r.time)}</span>
        </div>
      </div>
      <div class="review-stars">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</div>
      <p class="review-body">${escapeHtml(r.body)}</p>
      <button class="review-helpful" data-idx="${idx}">♡ Helpful &nbsp;<span id="helpful-count-${idx}">${r.helpful}</span></button>
    </div>
  `).join("");

  // Helpful click
  reviewsList.querySelectorAll(".review-helpful").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx);
      const countEl = document.getElementById(`helpful-count-${idx}`);
      if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;
      btn.style.color = "var(--purple-light)";
      btn.style.borderColor = "var(--purple-light)";
      btn.disabled = true;
    });
  });
}

function renderYourRatingBox(stars, parent) {
  // Remove existing box if any
  const existing = parent.querySelector(".your-rating-box");
  if (existing) existing.remove();

  const box = document.createElement("div");
  box.className = "your-rating-box";
  box.innerHTML = `
    <div>
      <div class="your-rating-box-label">Your Rating</div>
      <div style="font-size:13px;color:var(--text-muted)">${stars}.0 out of 5</div>
    </div>
    <div class="your-rating-box-stars">${"★".repeat(stars)}${"☆".repeat(5 - stars)}</div>
  `;
  const successBanner = document.getElementById("commentSuccessBanner");
  if (successBanner) successBanner.after(box);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
