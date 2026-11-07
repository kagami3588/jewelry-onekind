/* 鑑 -KAGAMI-｜トップページの演出（最小限）
   上部の進捗バー・HEROの写真のわずかな遅れ・最後の線だけ。
   スクロール量が増える演出（固定・横スクロール・視差）は使わない。 */
(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var vh = innerHeight, bar = document.getElementById("bar"), hero = document.getElementById("heroPhoto");
  var rule = Array.prototype.slice.call(document.querySelectorAll(".rule"));
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  function update() {
    var y = scrollY, H = document.documentElement.scrollHeight - vh;
    if (bar) bar.style.setProperty("--sp", H > 0 ? clamp(y / H).toFixed(4) : 1);
    if (hero && y < vh * 1.2) hero.style.setProperty("--hy", (y * 0.12).toFixed(1) + "px");
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    rule.forEach(function (r) { io.observe(r); });
  } else { rule.forEach(function (r) { r.classList.add("in"); }); }
  var tick = false;
  addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; update(); }); } }, { passive: true });
  addEventListener("resize", function () { vh = innerHeight; });
  update();
})();
