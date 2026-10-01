/* 鑑 -KAGAMI-｜トップページのスクロール演出
   目的は「視線を次へ誘導すること」だけ。計測・開閉・動画などは s.js が担当。
   動きを減らす設定の端末では、何も動かさない。 */
(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var $ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var vh = innerHeight;
  var bar = document.getElementById("bar"), hero = document.getElementById("heroPhoto");
  var pxl = $(".pxl"), xs = $("[data-x]"), rpt = document.getElementById("reportImages"), rule = $(".rule");

  function update() {
    var y = scrollY, H = document.documentElement.scrollHeight - vh;
    if (bar) bar.style.setProperty("--sp", H > 0 ? clamp(y / H).toFixed(4) : 1);

    /* HERO：写真がゆっくり遅れて動く（最大約140px） */
    if (hero && y < vh * 1.3) hero.style.setProperty("--hy", (y * 0.16).toFixed(1) + "px");

    /* 写真の視差：画面の中心からのずれに応じて、わずかに動く */
    pxl.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;
      var d = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.setProperty("--py", (-d * r.height * 0.1).toFixed(1) + "px");
    });

    /* 横方向のわずかな動き：数字と「占い／知る」の対比 */
    xs.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;
      var d = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.transform = "translate3d(" + (d * parseFloat(el.getAttribute("data-x"))).toFixed(2) + "vw,0,0)";
    });

    /* 鑑定書：近づくようにゆっくり拡大 */
    if (rpt) {
      var rr = rpt.getBoundingClientRect();
      if (rr.bottom > 0 && rr.top < vh) rpt.style.setProperty("--z", (1 + clamp((vh - rr.top) / (vh + rr.height)) * 0.06).toFixed(4));
    }
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    rule.forEach(function (r) { io.observe(r); });
  } else { rule.forEach(function (r) { r.classList.add("in"); }); }

  var tick = false;
  function on() { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; update(); }); } }
  addEventListener("scroll", on, { passive: true });
  addEventListener("resize", function () { vh = innerHeight; on(); });
  update();
})();
