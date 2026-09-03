(() => {
  "use strict";

  const sections = Array.from(document.querySelectorAll(".snap-section"));
  const dotNav = document.getElementById("dotNav");
  const siteHeader = document.getElementById("siteHeader");
  const menuToggle = document.getElementById("menuToggle");
  const menuOverlay = document.getElementById("menuOverlay");
  const menuOverlayClose = document.getElementById("menuOverlayClose");
  const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

  /* ---------- Build left dot navigation from sections ---------- */
  sections.forEach((section, i) => {
    const label = section.dataset.label || section.id.toUpperCase();
    const item = document.createElement("a");
    item.href = `#${section.id}`;
    item.className = "dot-nav__item";
    item.dataset.target = section.id;
    item.innerHTML = `<span class="dot-nav__dot"></span><span class="dot-nav__label">${label}</span>`;
    dotNav.appendChild(item);
    if (i === 0) item.classList.add("is-active");
  });
  const dotItems = Array.from(dotNav.querySelectorAll(".dot-nav__item"));

  /* ---------- Section-enter observer: fade-in, ken-burns, active dot, light/dark header ---------- */
  const LIGHT_BG_SECTION_IDS = new Set(["cards"]);

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("in-view", entry.isIntersecting);
      });
    },
    { threshold: 0.25 }
  );
  sections.forEach((s) => sectionObserver.observe(s));

  // Separate, stricter observer just to decide "which section are we mainly looking at"
  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;

        dotItems.forEach((item) => item.classList.toggle("is-active", item.dataset.target === id));

        const onLight = LIGHT_BG_SECTION_IDS.has(id);
        siteHeader.classList.toggle("is-on-light", onLight);
        dotNav.classList.toggle("is-on-light", onLight);
      });
    },
    { threshold: 0.5 }
  );
  sections.forEach((s) => activeObserver.observe(s));

  /* ---------- Hamburger / fullscreen GNB overlay ---------- */
  function openMenu() {
    menuOverlay.classList.add("is-open");
    menuOverlay.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    menuOverlay.classList.remove("is-open");
    menuOverlay.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  menuToggle.addEventListener("click", () => {
    const isOpen = menuOverlay.classList.contains("is-open");
    isOpen ? closeMenu() : openMenu();
  });
  menuOverlayClose.addEventListener("click", closeMenu);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuOverlay.classList.contains("is-open")) closeMenu();
  });
  // Close overlay when a link that scrolls to a main-page section is used.
  // On mobile, a title tap is an accordion toggle (see below), not real
  // navigation, so it must NOT close the overlay.
  menuOverlay.querySelectorAll(".js-gnb-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (isMobile()) return;
      window.setTimeout(closeMenu, 250);
    });
  });

  /* ---------- Mobile GNB accordion ---------- */
  // On mobile the top-level item only expands/collapses its submenu (spec 6),
  // it does not navigate — same title text works as a real section link on desktop.
  document.querySelectorAll(".gnb__item").forEach((item) => {
    const title = item.querySelector(".gnb__title");
    title.addEventListener("click", (e) => {
      if (!isMobile()) return;
      e.preventDefault();
      const willExpand = !item.classList.contains("is-expanded");
      document.querySelectorAll(".gnb__item.is-expanded").forEach((open) => {
        if (open !== item) open.classList.remove("is-expanded");
      });
      item.classList.toggle("is-expanded", willExpand);
    });
  });

  /* ---------- Language selector (dummy — swap for real i18n routing later) ---------- */
  document.querySelectorAll(".lang-select").forEach((group) => {
    group.addEventListener("click", (e) => {
      const link = e.target.closest(".lang-item");
      if (!link) return;
      e.preventDefault();
      const lang = link.dataset.lang;
      document.querySelectorAll(".lang-item").forEach((item) => {
        item.classList.toggle("is-active", item.dataset.lang === lang);
      });
    });
  });

  /* ---------- LOTTE Family select — demo only, no real target URLs supplied ---------- */
  const familySelect = document.getElementById("lotteFamilySelect");
  const familyGoBtn = document.getElementById("familyGoBtn");
  const familyGoMsg = document.getElementById("familyGoMsg");
  let familyMsgTimer = null;
  familyGoBtn.addEventListener("click", () => {
    const value = familySelect.value;
    familyGoMsg.textContent = value
      ? `데모: "${value}" 사이트로 이동합니다. (실제 링크는 연결 전입니다)`
      : "이동할 계열사를 먼저 선택해 주세요.";
    clearTimeout(familyMsgTimer);
    familyMsgTimer = window.setTimeout(() => {
      familyGoMsg.textContent = "";
    }, 3500);
  });

  /* ---------- Footer copyright year ---------- */
  const yearEl = document.getElementById("copyrightYears");
  if (yearEl) {
    const now = new Date().getFullYear();
    yearEl.textContent = `${now - 1}-${now}`;
  }
})();
