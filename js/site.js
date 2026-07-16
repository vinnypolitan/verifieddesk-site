/* VerifiedDesk motion system — vanilla, IntersectionObserver-driven, reduced-motion aware */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var d = document;

  /* ---------- auto-tag elements for reveal ---------- */
  function tag(selector, cls, stagger) {
    var els = d.querySelectorAll(selector);
    for (var i = 0; i < els.length; i++) {
      els[i].classList.add(cls || "vd-reveal");
      if (stagger) els[i].style.setProperty("--vd-i", String(i % 12));
    }
  }

  if (!reduced) {
    // hero entrance (staggered children)
    var hero = d.querySelector(".hero .wrap");
    if (hero) {
      var kids = hero.children;
      for (var h = 0; h < kids.length; h++) {
        kids[h].classList.add("vd-hero-item");
        kids[h].style.setProperty("--vd-i", String(h));
      }
      d.documentElement.classList.add("vd-hero-armed");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          d.documentElement.classList.add("vd-hero-go");
        });
      });
    }

    // scroll reveals
    tag(".section .wrap > .eyebrow, .section .wrap > h2, .section .wrap > p", "vd-reveal");
    tag(".sheet", "vd-reveal", true);
    tag(".tier", "vd-reveal", true);
    tag(".steps li", "vd-reveal", true);
    tag(".guide-list li", "vd-reveal", true);
    tag(".faq-list details", "vd-reveal", true);
    tag(".prose h2, .prose p, .prose ul, .prose ol, .prose table", "vd-reveal");

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("vd-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    d.querySelectorAll(".vd-reveal").forEach(function (el) { io.observe(el); });

    // highlighter swipes
    d.querySelectorAll(".hl").forEach(function (el) { el.classList.add("vd-hl"); });
    var hlio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("vd-hl-in");
          hlio.unobserve(e.target);
        }
      });
    }, { threshold: 0.6 });
    d.querySelectorAll(".vd-hl").forEach(function (el) { hlio.observe(el); });

    // ledger verification sequence
    var ledger = d.querySelector(".ledger");
    if (ledger) {
      ledger.classList.add("vd-ledger-armed");
      var lio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          lio.unobserve(e.target);
          var rows = e.target.querySelectorAll("tbody tr");
          rows.forEach(function (row, i) {
            setTimeout(function () {
              row.classList.add("vd-row-in");
              var stamp = row.querySelector(".stamp");
              if (stamp) setTimeout(function () { stamp.classList.add("vd-stamp-in"); }, 260);
              if (row.classList.contains("is-dropped")) {
                setTimeout(function () { row.classList.add("vd-struck"); }, 620);
              }
            }, 320 * i + 150);
          });
          var foot = e.target.querySelector(".ledger-foot");
          if (foot) setTimeout(function () { foot.classList.add("vd-in"); }, 320 * rows.length + 500);
        });
      }, { threshold: 0.35 });
      lio.observe(ledger);
    }
  } else {
    d.documentElement.classList.add("vd-reduced");
  }

  /* ---------- sticky header shadow (cheap, rAF-throttled) ---------- */
  var header = d.querySelector(".site-header");
  if (header) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        header.classList.toggle("vd-stuck", window.scrollY > 8);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- smooth FAQ accordion ---------- */
  d.querySelectorAll(".faq-list details").forEach(function (det) {
    var summary = det.querySelector("summary");
    var answer = det.querySelector(".answer");
    if (!summary || !answer) return;
    answer.style.overflow = "hidden";
    summary.addEventListener("click", function (ev) {
      if (reduced) return; // native toggle
      ev.preventDefault();
      if (det.open) {
        var from = answer.scrollHeight;
        answer.animate([{ height: from + "px", opacity: 1 }, { height: "0px", opacity: 0 }],
          { duration: 240, easing: "ease-in" }).onfinish = function () { det.open = false; };
      } else {
        det.open = true;
        var to = answer.scrollHeight;
        answer.animate([{ height: "0px", opacity: 0 }, { height: to + "px", opacity: 1 }],
          { duration: 300, easing: "cubic-bezier(.2,.7,.2,1)" });
      }
    });
  });
})();
