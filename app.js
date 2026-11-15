import { DEFAULT_MENU, cloneDefaultMenu } from "./menu-data.js";
import { CONFIG } from "./config.js";

const STORAGE_KEY = "teaspoon.menu.v1";
const menuContent = document.getElementById("menu-content");
const categoryNav = document.getElementById("category-nav");
const searchInput = document.getElementById("menu-search");
let currentMenu = cloneDefaultMenu();
let searchTerm = "";
let remoteAvailable = false;

function apiUrl(path) {
  const base = (CONFIG.API_BASE_URL || "").trim().replace(/\/$/, "");
  return base ? `${base}${path}` : "";
}

function readLocalMenu() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (parsed && Array.isArray(parsed.categories)) return parsed;
  } catch (error) {
    console.warn("Yerel menü okunamadı:", error);
  }
  return cloneDefaultMenu();
}

async function fetchRemoteMenu() {
  const url = apiUrl("/menu");
  if (!url) return null;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const payload = await response.json();
    if (payload.menu && Array.isArray(payload.menu.categories)) {
      remoteAvailable = true;
      return payload.menu;
    }
  } catch (error) {
    console.warn("Ortak menüye erişilemedi:", error);
  }
  return null;
}

function formatPrice(price) {
  return `${new Intl.NumberFormat("tr-TR").format(Number(price) || 0)} ₺`;
}

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function renderCategoryNav(categories) {
  categoryNav.innerHTML = categories.map((category) => `
    <a class="category-pill" href="#category-${safeText(category.id)}"><span>${safeText(category.icon || "•")}</span>${safeText(category.name)}</a>
  `).join("");
}

function renderMenu(menu) {
  const categories = (menu.categories || []).map((category) => ({
    ...category,
    items: (category.items || []).filter((item) => item.visible !== false)
  }));
  renderCategoryNav(categories);

  const filtered = categories.map((category) => ({
    ...category,
    items: category.items.filter((item) => {
      const haystack = `${item.name} ${category.name}`.toLocaleLowerCase("tr-TR");
      return haystack.includes(searchTerm.toLocaleLowerCase("tr-TR"));
    })
  })).filter((category) => category.items.length > 0 || (!searchTerm && category.notes?.length));

  if (!filtered.length) {
    menuContent.innerHTML = `<div class="empty-state"><span>⌕</span><strong>Aradığını bulamadık.</strong><p>Farklı bir kelimeyle tekrar dene.</p></div>`;
    return;
  }

  menuContent.innerHTML = filtered.map((category, index) => `
    <section class="menu-category" id="category-${safeText(category.id)}">
      <div class="category-heading">
        <div class="category-icon">${safeText(category.icon || "•")}</div>
        <div><p class="category-kicker">${String(index + 1).padStart(2, "0")} / MENU</p><h3>${safeText(category.name)}</h3><p>${safeText(category.description || "")}</p></div>
      </div>
      <div class="menu-items">
        ${category.items.map((item) => `
          <article class="menu-item">
            <div class="item-copy"><h4>${safeText(item.name)}</h4>${item.description ? `<p>${safeText(item.description)}</p>` : ""}</div>
            <span class="item-dots" aria-hidden="true"></span>
            <strong class="item-price">${formatPrice(item.price)}</strong>
          </article>
        `).join("")}
      </div>
      ${!searchTerm && category.notes?.length ? `
        <div class="extras-box"><span class="extras-title">Ekstralar</span>
          ${category.notes.map((note) => `<div class="extra-row"><span>${safeText(note.name)}</span><strong>${formatPrice(note.price)}</strong></div>`).join("")}
        </div>` : ""}
    </section>
  `).join("");
}

function setUpdatedLabel(menu) {
  const old = document.querySelector(".last-update");
  if (old) old.remove();
  if (!menu.updatedAt) return;
  const date = new Date(menu.updatedAt);
  if (Number.isNaN(date.getTime())) return;
  const label = document.createElement("p");
  label.className = "last-update";
  label.textContent = `Son fiyat güncellemesi: ${new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(date)}`;
  document.querySelector(".menu-intro > div").appendChild(label);
}

function applyMenu(menu) {
  currentMenu = menu;
  renderMenu(currentMenu);
  setUpdatedLabel(currentMenu);
}

async function init() {
  document.getElementById("year").textContent = new Date().getFullYear();
  currentMenu = readLocalMenu();
  applyMenu(currentMenu);
  const remote = await fetchRemoteMenu();
  if (remote) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
    applyMenu(remote);
  }
}

searchInput?.addEventListener("input", (event) => {
  searchTerm = event.target.value.trim();
  renderMenu(currentMenu);
});

window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY || !event.newValue) return;
  try { applyMenu(JSON.parse(event.newValue)); } catch (_) { /* ignore invalid storage data */ }
});

// Paylaşılan API ayarlıysa sayfa açıkken fiyatları periyodik olarak kontrol eder.
if (CONFIG.API_BASE_URL) {
  window.setInterval(async () => {
    if (document.visibilityState !== "visible") return;
    const remote = await fetchRemoteMenu();
    if (remote && remote.updatedAt !== currentMenu.updatedAt) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
      applyMenu(remote);
    }
  }, 15000);
}

// Klavyeden / tuşuyla menü aramasına geçiş.
window.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
    event.preventDefault();
    searchInput?.focus();
  }
});

init();
