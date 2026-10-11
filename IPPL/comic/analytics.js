/* ==========================================================================
   ANALYTICS DASHBOARD – analytics.js
   Pure Canvas chart renderer (no external libraries needed)
   ========================================================================== */

/* ── Default state ─────────────────────────────────────────────────────── */
const DEFAULT_STATE = {
  readers:  1243,
  rating:   4.72,
  reads:    82453,
  trend:    "rising",
  dist:     { 5: 68, 4: 18, 3: 8, 2: 4, 1: 2 },
};

let state = JSON.parse(JSON.stringify(DEFAULT_STATE));

/* ── Chart data per trend & period ─────────────────────────────────────── */
const TREND_DATA = {
  rising:   (n) => Array.from({length: n}, (_, i) => Math.round(80 + (i / (n-1)) * 1820 + Math.random() * 60)),
  stable:   (n) => Array.from({length: n}, (_, i) => Math.round(900 + Math.random() * 200 - 100)),
  declining:(n) => Array.from({length: n}, (_, i) => Math.round(1900 - (i / (n-1)) * 1820 + Math.random() * 60)),
  volatile: (n) => Array.from({length: n}, (_, i) => Math.round(400 + Math.random() * 1500)),
};

const PERIOD_LABELS = {
  week:    ["Aug 30", "Sep 1", "Sep 3", "Sep 5", "Sep 7", "Sep 9", "Sep 11"],
  month:   ["Sep 1", "Sep 4", "Sep 8", "Sep 12", "Sep 16", "Sep 20", "Sep 24", "Sep 28", "Oct 2", "Oct 6"],
  quarter: ["Aug 1", "Aug 15", "Sep 1", "Sep 15", "Oct 1", "Oct 11"],
};

let currentPeriod = "week";
let chartData     = TREND_DATA[state.trend](PERIOD_LABELS[currentPeriod].length);

/* ── Canvas chart renderer ─────────────────────────────────────────────── */
function drawChart(canvas, labels, values) {
  if (!canvas) return;
  const ctx    = canvas.getContext("2d");
  const wrap   = canvas.parentElement;
  const W      = wrap.clientWidth  || 600;
  const H      = wrap.clientHeight || 280;
  canvas.width  = W;
  canvas.height = H;

  const isDark  = document.documentElement.getAttribute("data-theme") !== "light";
  const PAD     = { top: 28, right: 24, bottom: 48, left: 52 };
  const chartW  = W - PAD.left - PAD.right;
  const chartH  = H - PAD.top - PAD.bottom;

  const maxV = Math.max(...values) * 1.15;
  const minV = 0;

  ctx.clearRect(0, 0, W, H);

  // ── Grid lines ──
  const gridLines = 5;
  ctx.strokeStyle  = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  ctx.lineWidth    = 1;
  for (let i = 0; i <= gridLines; i++) {
    const y = PAD.top + (chartH / gridLines) * i;
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + chartW, y);
    ctx.stroke();

    // Y labels
    const val = Math.round(maxV - (maxV / gridLines) * i);
    ctx.fillStyle = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
    ctx.font      = "11px Plus Jakarta Sans, system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(val >= 1000 ? (val/1000).toFixed(1) + "K" : val, PAD.left - 8, y + 4);
  }

  // ── X Axis ──
  ctx.strokeStyle = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)";
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.moveTo(PAD.left, PAD.top + chartH);
  ctx.lineTo(PAD.left + chartW, PAD.top + chartH);
  ctx.stroke();

  // ── X Labels ──
  ctx.fillStyle = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  ctx.font      = "11px Plus Jakarta Sans, system-ui, sans-serif";
  ctx.textAlign = "center";
  labels.forEach((lbl, i) => {
    const x = PAD.left + (i / (labels.length - 1)) * chartW;
    ctx.fillText(lbl, x, PAD.top + chartH + 20);
  });

  // ── Compute points ──
  const pts = values.map((v, i) => ({
    x: PAD.left + (i / (values.length - 1)) * chartW,
    y: PAD.top  + chartH - ((v - minV) / (maxV - minV)) * chartH,
  }));

  // ── Area fill ──
  const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + chartH);
  grad.addColorStop(0, "rgba(124, 58, 237, 0.3)");
  grad.addColorStop(1, "rgba(124, 58, 237, 0.0)");
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  pts.slice(1).forEach((p, i) => {
    const cp = pts[i];
    ctx.bezierCurveTo(
      cp.x + (p.x - cp.x) * 0.4, cp.y,
      p.x  - (p.x - cp.x) * 0.4, p.y,
      p.x, p.y
    );
  });
  ctx.lineTo(pts[pts.length - 1].x, PAD.top + chartH);
  ctx.lineTo(pts[0].x, PAD.top + chartH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // ── Line ──
  ctx.strokeStyle = "#7c3aed";
  ctx.lineWidth   = 2.5;
  ctx.lineJoin    = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  pts.slice(1).forEach((p, i) => {
    const cp = pts[i];
    ctx.bezierCurveTo(
      cp.x + (p.x - cp.x) * 0.4, cp.y,
      p.x  - (p.x - cp.x) * 0.4, p.y,
      p.x, p.y
    );
  });
  ctx.stroke();

  // ── Data points + labels ──
  pts.forEach((p, i) => {
    const val = values[i];
    const label = val >= 1000 ? (val/1000).toFixed(1) + "K" : String(val);

    // Outer glow circle
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(124,58,237,0.2)";
    ctx.fill();

    // Solid dot
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#7c3aed";
    ctx.fill();
    ctx.strokeStyle = isDark ? "#1e2127" : "#f6f5fb";
    ctx.lineWidth   = 2;
    ctx.stroke();

    // Value label above
    ctx.fillStyle = isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)";
    ctx.font      = "bold 11px Plus Jakarta Sans, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, p.x, p.y - 12);
  });
}

/* ── Rating bars renderer ──────────────────────────────────────────────── */
function renderRatingBars(dist) {
  const container = document.getElementById("ratingBarsContainer");
  if (!container) return;
  const labels = [5, 4, 3, 2, 1];
  container.innerHTML = labels.map(star => {
    const pct = dist[star] || 0;
    return `
      <div class="an-rating-bar-row">
        <span class="an-bar-label">${star} Star${star > 1 ? "s" : ""}</span>
        <div class="an-bar-track">
          <div class="an-bar-fill" style="width: ${pct}%"></div>
        </div>
        <span class="an-bar-pct">${pct}%</span>
      </div>`;
  }).join("");
}

/* ── Update stats UI ───────────────────────────────────────────────────── */
function updateStatCards() {
  const fmtNum = (n) => n >= 1000 ? n.toLocaleString() : String(n);
  document.getElementById("statReaders").textContent = fmtNum(state.readers);
  document.getElementById("statRating").textContent  = state.rating.toFixed(2);
  document.getElementById("statReads").textContent   = fmtNum(state.reads);

  const ratingEl = document.getElementById("sidePanelRating");
  if (ratingEl) ratingEl.textContent = state.rating.toFixed(2);
  const starsEl  = document.getElementById("sidePanelStars");
  if (starsEl) {
    const full = Math.round(state.rating);
    starsEl.textContent = "★".repeat(full) + "☆".repeat(5 - full);
  }
  renderRatingBars(state.dist);
}

/* ── Period buttons ────────────────────────────────────────────────────── */
function initPeriodBtns() {
  document.querySelectorAll(".an-period-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".an-period-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentPeriod = btn.dataset.period;
      chartData     = TREND_DATA[state.trend](PERIOD_LABELS[currentPeriod].length);
      const canvas  = document.getElementById("readersChart");
      drawChart(canvas, PERIOD_LABELS[currentPeriod], chartData);
    });
  });
}

/* ── Export Data stub ──────────────────────────────────────────────────── */
function initExport() {
  const btn = document.getElementById("exportDataBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const rows = [
      ["Label", "Readers"],
      ...PERIOD_LABELS[currentPeriod].map((l, i) => [l, chartData[i]]),
    ];
    const csv  = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `analytics-${currentPeriod}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

/* ── Data Playground Modal ─────────────────────────────────────────────── */
function initPlayground() {
  const openBtn    = document.getElementById("openPlaygroundBtn");
  const closeBtn   = document.getElementById("closePlaygroundBtn");
  const modal      = document.getElementById("dataPlaygroundModal");
  const applyBtn   = document.getElementById("applyPlaygroundBtn");
  const resetBtn   = document.getElementById("resetPlaygroundBtn");

  if (!openBtn || !modal) return;

  // Build distribution sliders inside the modal
  const distContainer = document.getElementById("distSliders");
  if (distContainer) {
    [5, 4, 3, 2, 1].forEach(star => {
      const row = document.createElement("div");
      row.className = "an-dist-row";
      row.innerHTML = `
        <span class="an-dist-label">${star} ★</span>
        <input type="range" class="an-slider an-dist-slider" data-star="${star}"
               min="0" max="100" value="${state.dist[star]}" step="1" style="flex:1;" />
        <span class="an-dist-val" id="distVal${star}">${state.dist[star]}%</span>`;
      distContainer.appendChild(row);
    });

    // Live label update for dist sliders
    distContainer.querySelectorAll(".an-dist-slider").forEach(sl => {
      sl.addEventListener("input", () => {
        document.getElementById(`distVal${sl.dataset.star}`).textContent = sl.value + "%";
      });
    });
  }

  // Sync main sliders with live labels
  function bindSlider(id, valId, fmt) {
    const sl = document.getElementById(id);
    const lbl = document.getElementById(valId);
    if (!sl || !lbl) return;
    sl.addEventListener("input", () => {
      lbl.textContent = fmt(parseFloat(sl.value));
    });
  }

  bindSlider("sliderReaders", "valReaders", v => Math.round(v).toLocaleString());
  bindSlider("sliderRating",  "valRating",  v => v.toFixed(2));
  bindSlider("sliderReads",   "valReads",   v => Math.round(v).toLocaleString());

  // Trend buttons inside modal
  modal.querySelectorAll(".an-trend-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      modal.querySelectorAll(".an-trend-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  openBtn.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  closeBtn && closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") modal.style.display = "none";
  });

  // ── Apply ──
  applyBtn && applyBtn.addEventListener("click", () => {
    state.readers = Math.round(parseFloat(document.getElementById("sliderReaders").value));
    state.rating  = parseFloat(document.getElementById("sliderRating").value);
    state.reads   = Math.round(parseFloat(document.getElementById("sliderReads").value));

    // Trend
    const activeTrend = modal.querySelector(".an-trend-btn.active");
    if (activeTrend) state.trend = activeTrend.dataset.trend;

    // Distribution (normalize to total ~100)
    const distSliders = modal.querySelectorAll(".an-dist-slider");
    let totalPct = 0;
    distSliders.forEach(sl => totalPct += parseInt(sl.value, 10));
    distSliders.forEach(sl => {
      state.dist[parseInt(sl.dataset.star)] = totalPct > 0
        ? Math.round((parseInt(sl.value) / totalPct) * 100)
        : 20;
    });

    // Update chart
    chartData = TREND_DATA[state.trend](PERIOD_LABELS[currentPeriod].length);
    const canvas = document.getElementById("readersChart");
    drawChart(canvas, PERIOD_LABELS[currentPeriod], chartData);
    updateStatCards();

    modal.style.display = "none";
  });

  // ── Reset ──
  resetBtn && resetBtn.addEventListener("click", () => {
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));

    document.getElementById("sliderReaders").value = state.readers;
    document.getElementById("sliderRating").value  = state.rating;
    document.getElementById("sliderReads").value   = state.reads;
    document.getElementById("valReaders").textContent = state.readers.toLocaleString();
    document.getElementById("valRating").textContent  = state.rating.toFixed(2);
    document.getElementById("valReads").textContent   = state.reads.toLocaleString();

    // Reset dist sliders
    [5, 4, 3, 2, 1].forEach(star => {
      const sl = distContainer && distContainer.querySelector(`[data-star="${star}"]`);
      if (sl) {
        sl.value = state.dist[star];
        const lbl = document.getElementById(`distVal${star}`);
        if (lbl) lbl.textContent = state.dist[star] + "%";
      }
    });

    // Reset trend
    modal.querySelectorAll(".an-trend-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.trend === state.trend);
    });

    chartData = TREND_DATA[state.trend](PERIOD_LABELS[currentPeriod].length);
    const canvas = document.getElementById("readersChart");
    drawChart(canvas, PERIOD_LABELS[currentPeriod], chartData);
    updateStatCards();
  });
}

/* ── Init ─────────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("readersChart");
  drawChart(canvas, PERIOD_LABELS[currentPeriod], chartData);
  updateStatCards();
  initPeriodBtns();
  initExport();
  initPlayground();

  // Redraw chart on window resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      drawChart(canvas, PERIOD_LABELS[currentPeriod], chartData);
    }, 150);
  });

  // Redraw when theme changes
  const observer = new MutationObserver(() => {
    drawChart(canvas, PERIOD_LABELS[currentPeriod], chartData);
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
});
