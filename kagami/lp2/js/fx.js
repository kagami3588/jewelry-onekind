/* 鑑 -KAGAMI-｜第2版 スクロール演出
   計測・フェード表示・動画・鑑定書画像は ../js/lp.js が担当。
   ここは「スクロールに合わせた動き」だけ。外部ライブラリなし。 */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var vh = window.innerHeight;
  var $ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };

  var bar = document.getElementById("bar");
  var hero = document.getElementById("hero");
  var scene = document.querySelector("[data-scene]");
  var stat = scene && scene.querySelector(".stat");
  var num = document.getElementById("n174");
  var tl = document.querySelector("[data-tl]");
  var reads = $("[data-read]");
  var tlItems = tl ? $("[data-tl] li") : [];
  var rules = $(".rule");

  /* 見出し下の線・固定ではない「読み上げ」は、動きを減らす設定では何もしない */
  if (reduce) {
    rules.forEach(function (r) { r.classList.add("in"); });
    tlItems.forEach(function (li) { li.classList.add("on"); });
    return;
  }

  function update() {
    var y = window.scrollY, H = document.documentElement.scrollHeight - vh;

    /* 上の進捗バー */
    if (bar) bar.style.setProperty("--sp", H > 0 ? clamp(y / H).toFixed(4) : 1);

    /* HERO：写真をわずかにずらす（最大60px） */
    if (hero && y < vh * 1.2) hero.style.setProperty("--hp", clamp(y / vh).toFixed(3));

    /* 17.4%：固定した画面の中で、数字と輪が育つ */
    if (scene) {
      var r = scene.getBoundingClientRect();
      var total = r.height - vh;
      if (r.top < vh && r.bottom > 0 && total > 0) {
        var p = clamp(-r.top / total);
        var k = ease(clamp((p - .14) / .5));
        stat.style.setProperty("--p", p.toFixed(4));
        stat.style.setProperty("--k", k.toFixed(4));
        num.textContent = (17.4 * k).toFixed(1);
      }
    }

    /* KAGAMIとは：読み進めた行が濃くなる */
    reads.forEach(function (el) {
      var t = el.getBoundingClientRect().top;
      var o = clamp((vh * .88 - t) / (vh * .22));
      el.style.opacity = (.2 + .8 * o).toFixed(3);
    });

    /* 90分：金色の線が伸びて、通過したステップが点灯 */
    if (tl) {
      var tr = tl.getBoundingClientRect();
      tl.style.setProperty("--p", clamp((vh * .62 - tr.top) / tr.height).toFixed(4));
      tlItems.forEach(function (li) {
        li.classList.toggle("on", li.getBoundingClientRect().top < vh * .62);
      });
    }
  }

  /* 最終CTAの線 */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    rules.forEach(function (r) { io.observe(r); });
  } else {
    rules.forEach(function (r) { r.classList.add("in"); });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { vh = window.innerHeight; onScroll(); });
  update();
})();
