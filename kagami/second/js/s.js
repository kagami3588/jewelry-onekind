/* 鑑 -KAGAMI-｜第2LP スクリプト（外部ライブラリなし）
   JSが動かなくても、文章・価格・ボタンはすべて表示されます。 */
(function () {
  "use strict";
  var CFG = window.KAGAMI_CONFIG || {};
  var ID = (CFG.GA4_ID || "").trim();
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobile = window.matchMedia("(max-width:960px)").matches;
  var hasIO = "IntersectionObserver" in window;
  var $ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };

  /* ================= 計測 =================
     GA4 の測定IDが空なら、何も読み込まず何も送りません。個人情報は送りません。 */
  var sent = {};
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  if (ID) {
    var g = document.createElement("script");
    g.async = true; g.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ID);
    document.head.appendChild(g);
    gtag("js", new Date()); gtag("config", ID, { anonymize_ip: true });
  }
  function track(name, params, once) {
    if (once) { if (sent[once]) return; sent[once] = 1; }
    var d = { page_path: location.pathname, device: mobile ? "mobile" : "desktop" };
    for (var k in params) d[k] = params[k];
    if (CFG.DEBUG) console.log("[計測]", name, d);
    if (ID) { try { gtag("event", name, d); } catch (e) {} }
  }
  window.kagamiTrack = track;

  /* CTA：hero / price / flow / final の各クリック、申込開始（フォームへ移動）、LINE */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-cta]");
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
    track("application_complete", { menu_name: CFG.MENU_NAME || "", price: CFG.PRICE || 0 }, "complete");
  }

  /* スクロール深度 */
  var timer = null;
  function depth() {
    var h = document.documentElement, s = h.scrollHeight - innerHeight;
    var p = s <= 0 ? 100 : Math.round(scrollY / s * 100);
    [25, 50, 75, 90].forEach(function (m) { if (p >= m) track("scroll_depth", { percent: m }, "d" + m); });
  }
  addEventListener("scroll", function () {
    if (timer) return;
    timer = setTimeout(function () { timer = null; depth(); }, 250);
  }, { passive: true });

  /* セクション到達：hero / stat_17_4 / kagami / price / sanmeigaku / story / flow_90min / report / voices / faq / final_cta */
  if (hasIO) {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var n = en.target.getAttribute("data-section");
        track("section_view", { section_name: n }, "s:" + n);
        sio.unobserve(en.target);
      });
    }, { threshold: 0.25 });
    $("[data-section]").forEach(function (el) { sio.observe(el); });

    var tio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.getAttribute("data-testimonial-id");
        track("testimonial_view", { testimonial_id: id }, "t:" + id);
        tio.unobserve(en.target);
      });
    }, { threshold: 0.5 });
    $("[data-testimonial-id]").forEach(function (el) { tio.observe(el); });
  }

  /* FAQを開いた */
  $("details").forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) track("faq_interaction", { question: d.querySelector("summary").textContent.trim().slice(0, 60) });
    });
  });

  /* ================= 表示 ================= */
  var rs = $(".r");
  if (hasIO && !reduce) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); rio.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    rs.forEach(function (el) { rio.observe(el); });
  } else {
    rs.forEach(function (el) { el.classList.add("in"); });
  }

  /* 17.4%：画面に入ったら、0から17.4まで伸びる（バーと数字が同じ値で動く） */
  var meter = document.getElementById("meter"), n174 = document.getElementById("n174");
  if (meter && hasIO && !reduce) {
    meter.style.setProperty("--w", 0); n174.textContent = "0.0";
    var mio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      mio.disconnect();
      var t0 = performance.now(), D = 1300;
      (function step(now) {
        var p = clamp((now - t0) / D), v = 17.4 * (1 - Math.pow(1 - p, 3));
        meter.style.setProperty("--w", v.toFixed(2)); n174.textContent = v.toFixed(1);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }, { threshold: 0.7 });
    mio.observe(meter);
  }

  /* 明細：画面に入ったら、項目が上から順に出る */
  var rc = document.getElementById("receipt");
  if (rc) {
    if (hasIO && !reduce) {
      var cio = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { rc.classList.add("in"); cio.disconnect(); }
      }, { threshold: 0.3 });
      cio.observe(rc);
    } else { rc.classList.add("in"); }
  }

  /* 90分：通過したステップが点灯し、線が伸びる */
  var steps = document.getElementById("steps");
  if (steps && !reduce) {
    var items = $("#steps li"), tick = false;
    var upd = function () {
      tick = false;
      var vh = innerHeight, r = steps.getBoundingClientRect();
      steps.style.setProperty("--p", clamp((vh * .62 - r.top) / r.height).toFixed(3));
      items.forEach(function (li) { li.classList.toggle("on", li.getBoundingClientRect().top < vh * .62); });
    };
    addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    addEventListener("resize", upd);
    upd();
  } else if (steps) {
    $("#steps li").forEach(function (li) { li.classList.add("on"); });
  }

  /* ================= 鑑定書の画像（設定があるときだけ） ================= */
  var box = document.getElementById("reportImages"), imgs = CFG.REPORT_IMAGES || [];
  if (box && imgs.length) {
    box.innerHTML = "";
    imgs.forEach(function (it, i) {
      var f = document.createElement("figure");
      if (i === 0) f.className = "f";
      var im = document.createElement("img");
      im.src = it.src; im.alt = it.alt || "鑑定書"; im.loading = "lazy"; im.decoding = "async";
      if (it.w) im.width = it.w;
      if (it.h) im.height = it.h;
      f.appendChild(im);
      if (it.caption) { var c = document.createElement("figcaption"); c.textContent = it.caption; f.appendChild(c); }
      box.appendChild(f);
    });
  }

  /* ================= アコーディオン：HTMLに本文を残したまま、表示だけ切り替える ================= */
  $(".acc-btn").forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;
    var label = btn.querySelector(".t"), oL = btn.getAttribute("data-open"), cL = btn.getAttribute("data-close");
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.classList.toggle("open", open);
      if (label && oL) label.textContent = open ? cL : oL;
      if (open) track("accordion_open", { label: ((oL || (label && label.textContent) || btn.textContent) + "").trim().slice(0, 40), section: (btn.closest("[data-section]") || document.body).getAttribute("data-section") || "" });
    });
  });

  /* ================= スマホのメニュー：リンクを押す／Escで閉じる ================= */
  var menu = document.querySelector(".menu");
  if (menu) {
    menu.addEventListener("click", function (e) { if (e.target.closest && e.target.closest(".panel a")) menu.removeAttribute("open"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") menu.removeAttribute("open"); });
  }

  /* ================= YouTube：クリックしたときだけ読み込む ================= */
  $(".yt").forEach(function (box) {
    var btn = box.querySelector(".frame"), id = box.getAttribute("data-yt");
    btn.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
      f.title = box.getAttribute("data-yt-title") || "動画";
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      btn.innerHTML = ""; btn.appendChild(f); btn.style.cursor = "default";
      track("video_play", { video: "youtube_" + id }, "yt" + id);
    }, { once: true });
  });

  /* ================= HERO動画（設定があるときだけ） =================
     表示が終わってから読み込むので、最初の表示は遅くなりません。
     省データ通信・動きを減らす設定の端末では、写真のままにします。 */
  var vs = CFG.HERO_VIDEO ? (mobile ? (CFG.HERO_VIDEO.mobile || CFG.HERO_VIDEO.desktop) : CFG.HERO_VIDEO.desktop) : "";
  var conn = navigator.connection || {};
  if (vs && !reduce && !conn.saveData) {
    var start = function () {
      var photo = document.querySelector(".photo"), slot = document.getElementById("videoSlot");
      if (slot) slot.remove();
      var v = document.createElement("video");
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = "metadata";
      v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
      v.setAttribute("aria-label", "林竜輔の動画");
      v.poster = photo.querySelector("img").currentSrc || photo.querySelector("img").src;
      v.src = vs;
      var played = false;
      v.addEventListener("playing", function () { v.classList.add("on"); if (!played) { played = true; track("video_play", { video: "hero" }, "vp"); } });
      v.addEventListener("timeupdate", function () {
        if (!v.duration) return;
        var p = v.currentTime / v.duration * 100;
        [25, 50, 75].forEach(function (m) { if (p >= m) track("video_progress", { video: "hero", percent: m }, "v" + m); });
      });
      v.addEventListener("ended", function () { track("video_progress", { video: "hero", percent: 100 }, "v100"); });
      v.addEventListener("error", function () { v.remove(); });
      photo.appendChild(v);
      var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
      var b = document.createElement("button");
      b.type = "button"; b.className = "snd"; b.textContent = "音を出す";
      b.addEventListener("click", function () {
        v.muted = !v.muted; b.textContent = v.muted ? "音を出す" : "音を止める";
        if (!v.muted) { v.currentTime = 0; v.play(); }
      });
      photo.appendChild(b);
    };
    addEventListener("load", function () { (window.requestIdleCallback || function (f) { setTimeout(f, 600); })(start); });
  }
})();
