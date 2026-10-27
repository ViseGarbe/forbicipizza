"use strict";
// Mobile navigation: works independently from the order dialog.
const navToggle = document.querySelector(".nav-toggle");
const navigation = document.getElementById("navigation");
function closeNavigation() {
  navigation.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Apri menu");
}
navToggle.addEventListener("click", () => {
  const opened = navToggle.getAttribute("aria-expanded") !== "true";
  navigation.classList.toggle("open", opened);
  navToggle.setAttribute("aria-expanded", String(opened));
  navToggle.setAttribute("aria-label", opened ? "Chiudi menu" : "Apri menu");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("open")) {
    closeNavigation();
    navToggle.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) closeNavigation();
});
// A short scissor-cut wipe connects pages selected from the mobile dropdown.
const reducedPageMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const pageCutKey = "forbici-page-cut";
let pageCutActive = false;
function createPageCut(phase) {
  document.querySelector(".page-cut")?.remove();
  const cover = document.createElement("div");
  cover.className = `page-cut ${phase}`;
  cover.setAttribute("aria-hidden", "true");
  cover.innerHTML = '<svg viewBox="0 0 48 48" fill="none"><circle cx="11" cy="13" r="7"/><circle cx="11" cy="35" r="7"/><path class="cut-blade-top" d="m17 18 25 22"/><path class="cut-blade-bottom" d="m17 30 25-22"/><circle cx="24" cy="24" r="2"/></svg>';
  document.body.append(cover);
  return cover;
}
try {
  const arrival = JSON.parse(sessionStorage.getItem(pageCutKey) || "null");
  sessionStorage.removeItem(pageCutKey);
  if (arrival && arrival.path === location.pathname && Date.now() - arrival.time < 10000 && !reducedPageMotion.matches) {
    const cover = createPageCut("is-revealing");
    cover.addEventListener("animationend", (event) => {
      if (event.target === cover) cover.remove();
    });
    setTimeout(() => cover.remove(), 700);
  }
} catch { /* Navigation also works when session storage is unavailable. */ }
navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", (event) => {
    const wasOpen = navigation.classList.contains("open");
    closeNavigation();
    const destination = new URL(link.href, location.href);
    if (!wasOpen || reducedPageMotion.matches || event.defaultPrevented || event.button !== 0 ||
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
        (link.target && link.target !== "_self") || destination.origin !== location.origin ||
        destination.pathname === location.pathname || !destination.pathname.endsWith(".html")) return;
    event.preventDefault();
    if (pageCutActive) return;
    pageCutActive = true;
    createPageCut("is-covering");
    setTimeout(() => {
      try {
        sessionStorage.setItem(pageCutKey, JSON.stringify({ path: destination.pathname, time: Date.now() }));
      } catch { /* The exit animation does not depend on storage. */ }
      window.location.assign(destination.href);
    }, 300);
    // Restore the current page if navigation fails or is cancelled.
    setTimeout(() => {
      document.querySelector(".page-cut")?.remove();
      pageCutActive = false;
    }, 1800);
  });
});
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    document.querySelector(".page-cut")?.remove();
    pageCutActive = false;
    closeNavigation();
  }
});
window
  .matchMedia("(min-width: 781px)")
  .addEventListener("change", closeNavigation);
// Native dialog provides focus trapping, Escape handling and keyboard support.
const orderDialog = document.getElementById("order-dialog");
let orderTrigger;
if (orderDialog && typeof orderDialog.showModal === "function") {
  document.querySelectorAll("[data-open-order]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      orderTrigger = link;
      orderDialog.showModal();
      document.body.classList.add("dialog-open");
    });
  });
  orderDialog
    .querySelector(".close-dialog")
    .addEventListener("click", () => orderDialog.close());
  orderDialog.addEventListener("click", (event) => {
    const box = orderDialog.getBoundingClientRect();
    if (
      event.target === orderDialog &&
      (event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom)
    )
      orderDialog.close();
  });
  orderDialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    orderTrigger?.focus();
  });
}
// All dishes remain visible if JavaScript is disabled.
const filters = document.querySelectorAll("[data-filter]");
const categories = document.querySelectorAll("[data-category]");
function filterMenu(selected) {
  if (
    selected !== "all" &&
    !Array.from(categories).some(
      (section) => section.dataset.category === selected,
    )
  )
    return;
  filters.forEach((button) => {
    const active = button.dataset.filter === selected;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  categories.forEach((section) => {
    section.hidden =
      selected !== "all" && section.dataset.category !== selected;
  });
  const status = document.getElementById("filter-status");
  if (status)
    status.textContent =
      selected === "all"
        ? "Tutte le categorie visibili"
        : `Categoria ${document.querySelector(`[data-filter="${selected}"]`).textContent} visibile`;
}
filters.forEach((button) =>
  button.addEventListener("click", () => {
    filterMenu(button.dataset.filter);
    history.replaceState(
      null,
      "",
      button.dataset.filter === "all"
        ? location.pathname + location.search
        : "#" + button.dataset.filter,
    );
  }),
);
function applyHash() {
  const selected = location.hash.slice(1);
  if (
    Array.from(categories).some(
      (section) => section.dataset.category === selected,
    )
  )
    filterMenu(selected);
  else filterMenu("all");
}
if (categories.length) {
  applyHash();
  window.addEventListener("hashchange", applyHash);
}

// The visual menu: explicit controls, keyboard navigation and touch swipes all select a category.
const slider = document.querySelector("[data-menu-slider]");
if (slider) {
  const slides = Array.from(slider.querySelectorAll("[data-slide]"));
  const previous = slider.querySelector("[data-slider-prev]");
  const next = slider.querySelector("[data-slider-next]");
  const sliderStatus = slider.querySelector("[data-slider-status]");
  const slideSelectors = slider.querySelectorAll("[data-slider-go]");
  let activeSlide = 0;
  let pointerStart = null;
  const setSlide = (index) => {
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, current) => {
      const active = current === activeSlide;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
      slide.inert = !active;
    });
    slideSelectors.forEach((button, current) => {
      button.setAttribute("aria-pressed", String(current === activeSlide));
    });
    sliderStatus.textContent = `Categoria ${activeSlide + 1} di ${slides.length}: ${slides[activeSlide].dataset.name}`;
  };
  slideSelectors.forEach((button) => {
    button.addEventListener("click", () => setSlide(Number(button.dataset.sliderGo)));
  });
  previous.addEventListener("click", () => setSlide(activeSlide - 1));
  next.addEventListener("click", () => setSlide(activeSlide + 1));
  slider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setSlide(activeSlide - 1);
      previous.focus();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setSlide(activeSlide + 1);
      next.focus();
    }
  });
  slider.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.target.closest("a, button")) return;
    pointerStart = { x: event.clientX, y: event.clientY };
  });
  slider.addEventListener("pointerup", (event) => {
    if (pointerStart === null) return;
    const movement = event.clientX - pointerStart.x;
    const verticalMovement = event.clientY - pointerStart.y;
    if (Math.abs(movement) > 45 && Math.abs(movement) > Math.abs(verticalMovement))
      setSlide(activeSlide + (movement < 0 ? 1 : -1));
    pointerStart = null;
  });
  slider.addEventListener("pointercancel", () => {
    pointerStart = null;
  });
  slider.querySelectorAll(".slider-link").forEach((link) => {
    link.addEventListener("click", () => {
      const category = link.hash.slice(1);
      filterMenu(category === "tutto-menu" ? "all" : category);
    });
  });
  setSlide(0);
}
// Load Google only after the visitor requests the interactive map.
const loadMap = document.getElementById("load-map");
loadMap?.addEventListener("click", () => {
  const frame = document.createElement("iframe");
  frame.title = "Forbici Pizza, Via San Francesco 28, Padova";
  frame.src =
    "https://maps.google.com/maps?q=Forbici%20Pizza%20Via%20San%20Francesco%2028%20Padova&t=&z=16&ie=UTF8&iwloc=&output=embed";
  frame.loading = "lazy";
  frame.referrerPolicy = "no-referrer-when-downgrade";
  frame.setAttribute("allowfullscreen", "");
  document.getElementById("map-container").replaceWith(frame);
});

// The entire ticker toggles scrolling, using native button keyboard support.
const ribbon = document.querySelector(".ribbon");
ribbon?.addEventListener("click", () => {
  const paused = ribbon.classList.toggle("is-paused");
  ribbon.setAttribute("aria-pressed", String(paused));
  ribbon.setAttribute("aria-label", `Pizza in teglia, Doppio Crunch, fatta per condividere, Via San Francesco 28. ${paused ? "Riprendi" : "Metti in pausa"} lo scorrimento`);
});

// Hide on downward scroll; restore on upward scroll or after one idle second.
const mobileActions = document.querySelector(".mobile-actions");
if (mobileActions) {
  const mobileViewport = window.matchMedia("(max-width: 780px)");
  const scrollPosition = () => Math.max(0, Math.min(window.scrollY,
    document.documentElement.scrollHeight - window.innerHeight));
  let lastActionScroll = scrollPosition();
  let scrollFramePending = false;
  let actionIdleTimer;
  const updateMobileActions = () => {
    const currentScroll = scrollPosition();
    const movement = currentScroll - lastActionScroll;
    if (!mobileViewport.matches || currentScroll <= 48 ||
        (mobileActions.contains(document.activeElement) && document.activeElement.matches(":focus-visible"))) {
      mobileActions.classList.remove("is-scroll-hidden");
      lastActionScroll = currentScroll;
    } else if (Math.abs(movement) >= 8) {
      mobileActions.classList.toggle("is-scroll-hidden", movement > 0);
      lastActionScroll = currentScroll;
    }
    scrollFramePending = false;
  };
  window.addEventListener("scroll", () => {
    clearTimeout(actionIdleTimer);
    if (mobileViewport.matches) {
      actionIdleTimer = setTimeout(() => {
        mobileActions.classList.remove("is-scroll-hidden");
        lastActionScroll = scrollPosition();
      }, 1000);
    }
    if (!scrollFramePending) {
      scrollFramePending = true;
      window.requestAnimationFrame(updateMobileActions);
    }
  }, { passive: true });
  mobileViewport.addEventListener("change", () => {
    clearTimeout(actionIdleTimer);
    mobileActions.classList.remove("is-scroll-hidden");
    lastActionScroll = scrollPosition();
  });
  mobileActions.addEventListener("focusin", () => {
    mobileActions.classList.remove("is-scroll-hidden");
  });
}
