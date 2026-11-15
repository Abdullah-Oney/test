import { DEFAULT_MENU, cloneDefaultMenu } from "./menu-data.js";
import { CONFIG } from "./config.js";

const STORAGE_KEY = "teaspoon.menu.v1";
const TOKEN_KEY = "teaspoon.admin.token";
const loginPanel = document.getElementById("login-panel");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const editorRoot = document.getElementById("editor-root");
const saveMessage = document.getElementById("save-message");
const adminStatus = document.getElementById("admin-status");
let menu = cloneDefaultMenu();
let sessionToken = sessionStorage.getItem(TOKEN_KEY) || "";

const apiBase = (CONFIG.API_BASE_URL || "").trim().replace(/\/$/, "");
const apiUrl = (path) => apiBase ? `${apiBase}${path}` : "";

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function localMenu() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (value && Array.isArray(value.categories)) return value;
  } catch (_) { /* use defaults */ }
  return cloneDefaultMenu();
}
function setStatus(text, state = "neutral") {
  adminStatus.className = `admin-status ${state}`;
  adminStatus.innerHTML = `<span class="status-dot"></span><span>${text}</span>`;
}
function showDashboard() {
  loginPanel.classList.add("hidden");
  dashboard.classList.remove("hidden");
  renderEditor();
}
function showLogin() {
  dashboard.classList.add("hidden");
  loginPanel.classList.remove("hidden");
}

async function loadMenu() {
  if (apiBase) {
    try {
      const response = await fetch(apiUrl("/menu"), { cache: "no-store" });
      if (response.ok) {
        const result = await response.json();
        if (result.menu?.categories) {
          menu = result.menu;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(menu));
          setStatus("Ortak menü verisi yüklendi · Cloudflare bağlantısı aktif", "success");
          return;
        }
      }
    } catch (error) {
      console.warn(error);
      setStatus("Ortak menüye ulaşılamadı; yerel kopya kullanılıyor", "warning");
    }
  }
  menu = localMenu();
  setStatus(apiBase ? "Yerel menü yüklendi · API bağlantısını kontrol edin" : "Yerel demo modu · Bu tarayıcıdaki değişiklikler diğer cihazlara aktarılmaz", apiBase ? "warning" : "neutral");
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.textContent = "Kontrol ediliyor…";
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (apiBase) {
    try {
      const response = await fetch(apiUrl("/admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const result = await response.json();
      if (!response.ok || !result.token) throw new Error(result.error || "Giriş bilgileri hatalı.");
      sessionToken = result.token;
      sessionStorage.setItem(TOKEN_KEY, sessionToken);
    } catch (error) {
      loginMessage.textContent = error.message || "Sunucuya bağlanılamadı.";
      return;
    }
  } else {
    // Yalnızca önizleme içindir. Gerçek yayında ortak API bağlantısı kullanın.
    if (username !== "test" || password !== "123") {
      loginMessage.textContent = "Kullanıcı adı veya şifre hatalı.";
      return;
    }
    sessionToken = "local-demo";
    sessionStorage.setItem(TOKEN_KEY, sessionToken);
  }

  loginMessage.textContent = "";
  await loadMenu();
  showDashboard();
});

function renderEditor() {
  editorRoot.innerHTML = menu.categories.map((category) => `
    <section class="editor-category" data-category-id="${escapeHtml(category.id)}">
      <div class="editor-category-heading"><span class="editor-icon">${escapeHtml(category.icon || "•")}</span><div><h2>${escapeHtml(category.name)}</h2><small>${(category.items || []).length} ürün</small></div></div>
      <div class="editor-table">
        ${(category.items || []).map((item) => `
          <div class="editor-row" data-item-id="${escapeHtml(item.id)}">
            <label class="editor-name">Ürün adı<input type="text" data-field="name" value="${escapeAttr(item.name)}"></label>
            <label class="editor-price">Fiyat (₺)<input type="number" min="0" step="1" inputmode="numeric" data-field="price" value="${Number(item.price) || 0}"></label>
            <label class="editor-visible"><input type="checkbox" data-field="visible" ${item.visible !== false ? "checked" : ""}><span>Menüde göster</span></label>
          </div>
        `).join("")}
      </div>
      ${category.notes?.length ? `<div class="editor-extras"><h3>Ekstralar</h3>${category.notes.map((note) => `
        <div class="editor-row extra-editor-row" data-extra-id="${escapeHtml(note.id)}">
          <label class="editor-name">Ek ürün<input type="text" data-field="name" value="${escapeAttr(note.name)}"></label>
          <label class="editor-price">Fiyat (₺)<input type="number" min="0" step="1" inputmode="numeric" data-field="price" value="${Number(note.price) || 0}"></label>
        </div>`).join("")}</div>` : ""}
    </section>
  `).join("");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
function escapeAttr(value) { return escapeHtml(value); }

function collectEditorValues() {
  const updated = clone(menu);
  editorRoot.querySelectorAll(".editor-category").forEach((categoryEl) => {
    const category = updated.categories.find((entry) => entry.id === categoryEl.dataset.categoryId);
    if (!category) return;
    categoryEl.querySelectorAll(".editor-row[data-item-id]").forEach((row) => {
      const item = category.items.find((entry) => entry.id === row.dataset.itemId);
      if (!item) return;
      item.name = row.querySelector('[data-field="name"]').value.trim() || item.name;
      item.price = Math.max(0, Math.round(Number(row.querySelector('[data-field="price"]').value) || 0));
      item.visible = row.querySelector('[data-field="visible"]').checked;
    });
    categoryEl.querySelectorAll(".extra-editor-row").forEach((row) => {
      const note = category.notes?.find((entry) => entry.id === row.dataset.extraId);
      if (!note) return;
      note.name = row.querySelector('[data-field="name"]').value.trim() || note.name;
      note.price = Math.max(0, Math.round(Number(row.querySelector('[data-field="price"]').value) || 0));
    });
  });
  updated.updatedAt = new Date().toISOString();
  return updated;
}

async function saveMenu() {
  saveMessage.textContent = "Kaydediliyor…";
  const updated = collectEditorValues();
  if (apiBase) {
    try {
      const response = await fetch(apiUrl("/admin/menu"), {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionToken}` },
        body: JSON.stringify({ menu: updated })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Menü kaydedilemedi.");
      menu = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(menu));
      saveMessage.textContent = "Menü ortak sunucuya kaydedildi. Açık müşteri sayfaları en geç 15 saniye içinde yenilenir.";
      setStatus("Ortak menüye başarıyla kaydedildi", "success");
    } catch (error) {
      saveMessage.textContent = error.message || "Kayıt sırasında bir hata oluştu.";
      setStatus("Kayıt başarısız · API ayarını kontrol edin", "warning");
    }
  } else {
    menu = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menu));
    saveMessage.textContent = "Kaydedildi. Bu tarayıcıdaki müşteri sayfası güncellendi; diğer cihazlarda görünmesi için ortak API kurulmalıdır.";
    setStatus("Yerel demo verisi kaydedildi", "neutral");
  }
}

document.getElementById("save-menu").addEventListener("click", saveMenu);
document.getElementById("logout-button").addEventListener("click", () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionToken = "";
  showLogin();
});

async function restoreSession() {
  if (!sessionToken) return;
  if (apiBase && sessionToken !== "local-demo") {
    // Sunucu token doğrulaması her kayıt işleminde yapılır; paneli açmak için menüyü getir.
    await loadMenu();
    showDashboard();
  } else if (!apiBase && sessionToken === "local-demo") {
    await loadMenu();
    showDashboard();
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}
restoreSession();
