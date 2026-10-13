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
    sliderStatus.textContent = `Categoria ${activeSlide + 1} di ${slides.length}: ${slides[activeSlide].dataset.name}`;
  };
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
    pointerStart = event.clientX;
  });
  slider.addEventListener("pointerup", (event) => {
    if (pointerStart === null) return;
    const movement = event.clientX - pointerStart;
    if (Math.abs(movement) > 45)
      setSlide(activeSlide + (movement < 0 ? 1 : -1));
    pointerStart = null;
  });
  slider.addEventListener("pointercancel", () => {
    pointerStart = null;
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
