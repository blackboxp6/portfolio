(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // LaTeX
  if (typeof renderMathInElement === "function") {
    renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\(", right: "\\)", display: false }
      ],
      throwOnError: false
    });
  }

  document.getElementById("year").textContent = new Date().getFullYear();

  // Ribbon: lines are slices through a twisting band, with a small ripple along each line,
  // like two waves beating against each other.
  var c = document.getElementById("ribbon"), ctx = c.getContext("2d");
  var W = 0, H = 0, grad = null, running = true, raf = 0;
  var LINES = 52, STEP = 5;

  function isLight() { return root.getAttribute("data-theme") === "light"; }

  function makeGradient() {
    var g = ctx.createLinearGradient(0, 0, W, 0);
    if (isLight()) { g.addColorStop(0, "#a21caf"); g.addColorStop(.55, "#6d28d9"); g.addColorStop(1, "#2563eb"); }
    else { g.addColorStop(0, "#d946ef"); g.addColorStop(.55, "#8b5cf6"); g.addColorStop(1, "#3b82f6"); }
    grad = g;
  }

  function resize() {
    var r = c.parentElement.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    W = r.width; H = r.height;
    c.width = Math.round(W * d); c.height = Math.round(H * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
    makeGradient();
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1;
    ctx.globalAlpha = isLight() ? .65 : .85;

    var n = Math.ceil((W + 20) / STEP) + 1, cy = new Float32Array(n), wd = new Float32Array(n), xs = new Float32Array(n), i, j, u;
    for (i = 0; i < n; i++) {
      xs[i] = -10 + i * STEP; u = xs[i] / W;
      cy[i] = H * (0.68 - 0.30 * u + 0.17 * Math.sin(u * 5.0 - t * 0.35 + 0.4) + 0.04 * Math.sin(u * 13 + t * 0.5));
      wd[i] = H * 0.17 * Math.sin(u * 3.4 - t * 0.25 + 2.3);
    }
    for (j = 0; j < LINES; j++) {
      var s = j / (LINES - 1) * 2 - 1;
      ctx.beginPath();
      for (i = 0; i < n; i++) {
        var y = cy[i] + wd[i] * s + H * 0.007 * Math.sin(xs[i] * 0.03 + j * 0.3 + t * 1.3);
        if (i === 0) ctx.moveTo(xs[i], y); else ctx.lineTo(xs[i], y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function loop(ms) {
    if (!running) return;
    draw(ms / 1000 * 0.8);
    raf = requestAnimationFrame(loop);
  }

  function start() {
    cancelAnimationFrame(raf);
    if (reduce) { draw(2.2); return; }
    running = true; raf = requestAnimationFrame(loop);
  }

  resize(); start();
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { resize(); if (reduce) draw(2.2); }, 120); });

  if ("IntersectionObserver" in window && !reduce) {
    new IntersectionObserver(function (e) {
      var vis = e[0].isIntersecting;
      if (vis && !running) { running = true; raf = requestAnimationFrame(loop); }
      if (!vis) { running = false; cancelAnimationFrame(raf); }
    }).observe(document.getElementById("home"));
  }

  // Theme toggle (dark by default)
  document.getElementById("theme").addEventListener("click", function () {
    var next = isLight() ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    makeGradient();
    if (reduce) draw(2.2);
  });
})();
