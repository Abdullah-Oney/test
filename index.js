const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function signature(payload, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toBase64Url(new Uint8Array(signed));
}

async function createToken(secret) {
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
  const payload = String(expiresAt);
  return `${payload}.${await signature(payload, secret)}`;
}

async function verifyToken(request, secret) {
  const header = request.headers.get("Authorization") || "";
  const match = header.match(/^Bearer ([0-9]+)\.([A-Za-z0-9_-]+)$/);
  if (!match) return false;
  const [, expiresAt, suppliedSignature] = match;
  if (Number(expiresAt) <= Date.now()) return false;
  const expected = await signature(expiresAt, secret);
  return suppliedSignature === expected;
}

function validMenu(menu) {
  if (!menu || !Array.isArray(menu.categories) || menu.categories.length > 30) return false;
  let itemCount = 0;
  for (const category of menu.categories) {
    if (!category || typeof category.id !== "string" || typeof category.name !== "string" || !Array.isArray(category.items)) return false;
    itemCount += category.items.length;
    if (itemCount > 500) return false;
    for (const item of category.items) {
      if (!item || typeof item.id !== "string" || typeof item.name !== "string" || !Number.isFinite(Number(item.price)) || Number(item.price) < 0) return false;
    }
  }
  return true;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    const url = new URL(request.url);

    if (url.pathname === "/menu" && request.method === "GET") {
      const raw = await env.MENU_KV.get("menu");
      if (!raw) return json({ menu: null });
      try {
        return json({ menu: JSON.parse(raw) });
      } catch (_) {
        return json({ error: "Kayıtlı menü verisi okunamadı." }, 500);
      }
    }

    if (url.pathname === "/admin/login" && request.method === "POST") {
      if (!env.ADMIN_USER || !env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
        return json({ error: "Sunucu yönetici ayarları tamamlanmamış." }, 500);
      }
      let body;
      try { body = await request.json(); } catch (_) { return json({ error: "Geçersiz istek." }, 400); }
      if (body.username !== env.ADMIN_USER || body.password !== env.ADMIN_PASSWORD) {
        return json({ error: "Kullanıcı adı veya şifre hatalı." }, 401);
      }
      return json({ token: await createToken(env.SESSION_SECRET) });
    }

    if (url.pathname === "/admin/menu" && request.method === "POST") {
      if (!env.SESSION_SECRET) return json({ error: "Sunucu oturum ayarı tamamlanmamış." }, 500);
      const authorized = await verifyToken(request, env.SESSION_SECRET);
      if (!authorized) return json({ error: "Oturum geçersiz veya süresi dolmuş. Yeniden giriş yapın." }, 401);
      let body;
      try { body = await request.json(); } catch (_) { return json({ error: "Geçersiz menü verisi." }, 400); }
      if (!validMenu(body.menu)) return json({ error: "Menü formatı doğrulanamadı." }, 400);
      await env.MENU_KV.put("menu", JSON.stringify(body.menu));
      return json({ ok: true, updatedAt: body.menu.updatedAt || null });
    }

    return json({ error: "Endpoint bulunamadı." }, 404);
  }
};
