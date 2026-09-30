/* 鑑 -KAGAMI-｜LP スクリプト
   ・外部ライブラリなし
   ・JSが動かなくても、すべての文章・価格・ボタンは表示されます */
(function () {
  "use strict";

  var CFG = window.KAGAMI_CONFIG || {};
  var ID = (CFG.GA4_ID || "").trim();
  var DEBUG = !!CFG.DEBUG;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia("(max-width:700px)").matches;
  var hasIO = "IntersectionObserver" in window;
  var sent = {};

  /* ---------- 計測 ----------
     GA4 の測定IDが空なら、何も読み込まず何も送りません。
     個人情報は一切送りません（申込フォームは外部サービス）。 */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  if (ID) {
    var gs = document.createElement("script");
    gs.async = true;
    gs.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ID);
    document.head.appendChild(gs);
    gtag("js", new Date());
    gtag("config", ID, { anonymize_ip: true });
  }
  function track(name, params, onceKey) {
    if (onceKey) { if (sent[onceKey]) return; sent[onceKey] = 1; }
    var data = { page_path: location.pathname.replace(/index\.html$/, "") || "/", device: isMobile ? "mobile" : "desktop" };
    for (var k in params) data[k] = params[k];
    if (DEBUG) console.log("[計測]", name, data);
    if (!ID) return;
    try { gtag("event", name, data); } catch (e) {}
  }
  window.kagamiTrack = track;

  /* CTAクリック（data-cta を持つ要素）。申込フォームへの遷移は application_start */
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("[data-cta]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var dest = href.indexOf("form.run") > -1 ? "form" : href.indexOf("lin.ee") > -1 ? "line" : /^https?:/.test(href) ? "external" : "internal";
    var loc = a.getAttribute("data-cta-loc") || "";
    track("cta_click", { cta_label: a.getAttribute("data-cta"), cta_location: loc, destination: dest });
    if (dest === "form") track("application_start", { source: "website", location: loc });
    if (dest === "line") track("line_click", { location: loc });
  }, true);

  /* 申込完了：フォーム側で完了後に ?applied=1 付きで戻せる場合のみ */
  if (/[?&]applied=1/.test(location.search)) {
    track("application_complete", { source: "website", menu_name: CFG.MENU_NAME || "", price: CFG.PRICE || 0 }, "complete");
  }

  /* スクロール深度 25/50/75/90% */
  var marks = [25, 50, 75, 90], timer = null;
  function pct() {
    var h = document.documentElement, s = h.scrollHeight - window.innerHeight;
    return s <= 0 ? 100 : Math.min(100, Math.round(window.scrollY / s * 100));
  }
  function depth() {
    var p = pct();
    marks.forEach(function (m) { if (p >= m) track("scroll_depth", { percent: m }, "d" + m); });
  }
  window.addEventListener("scroll", function () {
    if (timer) return;
    timer = setTimeout(function () { timer = null; depth(); }, 250);
  }, { passive: true });

  /* セクション到達：hero / stat_17_4 / price / story / flow_90min / report / voices / faq / final_cta など */
  var secs = document.querySelectorAll("[data-section]");
  if (hasIO) {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var n = en.target.getAttribute("data-section");
        track("section_view", { section_name: n }, "s:" + n);
        sio.unobserve(en.target);
      });
    }, { threshold: 0.3 });
    secs.forEach(function (el) { sio.observe(el); });
  } else if (secs[0]) {
    track("section_view", { section_name: "hero" }, "s:hero");
  }

  /* お客様の声の閲覧 */
  var tst = document.querySelectorAll("[data-testimonial-id]");
  if (hasIO && tst.length) {
    var tio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.getAttribute("data-testimonial-id");
        track("testimonial_view", { testimonial_id: id }, "t:" + id);
        tio.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    tst.forEach(function (el) { tio.observe(el); });
  }

  /* FAQを開いた */
  document.querySelectorAll("details").forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) track("faq_interaction", { question: d.querySelector("summary").textContent.trim().slice(0, 60) });
    });
  });

  /* ---------- 表示アニメーション（フェードのみ） ---------- */
  var rv = document.querySelectorAll(".rv");
  if (hasIO && !reduce) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); rio.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    rv.forEach(function (el) { rio.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 17.4% の数字 ---------- */
  var numEl = document.querySelector("[data-count]");
  if (numEl && hasIO && !reduce) {
    var target = parseFloat(numEl.getAttribute("data-count"));
    var nio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      nio.disconnect();
      var t0 = performance.now(), dur = 1100;
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur), v = target * (1 - Math.pow(1 - p, 3));
        numEl.textContent = v.toFixed(1);
        if (p < 1) requestAnimationFrame(step); else numEl.textContent = target.toFixed(1);
      })(t0);
    }, { threshold: 0.6 });
    nio.observe(numEl);
  }

  /* ---------- 鑑定書の画像（設定があるときだけ表示） ---------- */
  var box = document.getElementById("reportImages");
  var imgs = CFG.REPORT_IMAGES || [];
  if (box && imgs.length) {
    imgs.forEach(function (it) {
      var im = document.createElement("img");
      im.src = it.src; im.alt = it.alt || "鑑定書"; im.loading = "lazy"; im.decoding = "async";
      if (it.w) im.width = it.w;
      if (it.h) im.height = it.h;
      box.appendChild(im);
    });
    box.hidden = false;
  }

  /* ---------- ファーストビューの動画（設定があるときだけ） ----------
     表示が終わってから読み込むので、ファーストビューの速度には影響しません。
     省データ通信・視覚効果を減らす設定の端末では、写真のままにします。 */
  var vsrc = CFG.HERO_VIDEO ? (isMobile ? (CFG.HERO_VIDEO.mobile || CFG.HERO_VIDEO.desktop) : CFG.HERO_VIDEO.desktop) : "";
  var conn = navigator.connection || {};
  if (vsrc && !reduce && !conn.saveData) {
    var startVideo = function () {
      var media = document.querySelector(".hero-media");
      var poster = media.querySelector("img");
      var v = document.createElement("video");
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = "metadata";
      v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
      v.setAttribute("aria-label", "林竜輔の動画"); v.poster = poster.getAttribute("src");
      v.src = vsrc;
      var played = false;
      v.addEventListener("playing", function () {
        v.classList.add("on");
        if (!played) { played = true; track("video_play", { video: "hero" }, "vp"); }
      });
      v.addEventListener("timeupdate", function () {
        if (!v.duration) return;
        var p = v.currentTime / v.duration * 100;
        [25, 50, 75].forEach(function (m) { if (p >= m) track("video_progress", { video: "hero", percent: m }, "v" + m); });
      });
      v.addEventListener("ended", function () { track("video_progress", { video: "hero", percent: 100 }, "v100"); });
      v.addEventListener("error", function () { v.remove(); });
      media.appendChild(v);
      var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});

      var b = document.createElement("button");
      b.type = "button"; b.className = "snd"; b.textContent = "音を出す";
      b.addEventListener("click", function () {
        v.muted = !v.muted;
        b.textContent = v.muted ? "音を出す" : "音を止める";
        if (!v.muted) { v.currentTime = 0; v.play(); }
      });
      document.getElementById("hero").appendChild(b);
    };
    window.addEventListener("load", function () {
      (window.requestIdleCallback || function (f) { setTimeout(f, 600); })(startVideo);
    });
  }
})();
