# Teaspoon Bakery — NFC Dijital Menü

Mobil öncelikli dijital menü ve ayrı yönetim ekranı. Müşteri sayfasında yönetim paneline giden bir bağlantı bulunmaz.

## İçerik

- `index.html`: Müşterinin NFC etiketiyle açacağı dijital menü.
- `admin/index.html`: Yönetim paneli. Site adresinin sonuna `/admin` eklenerek açılır.
- `assets/menu-data.js`: Basılı menüden aktarılmış başlangıç ürünleri ve fiyatları.
- `assets/config.js`: İsteğe bağlı ortak API adresi.
- `cloudflare-worker/`: Farklı telefonlardan ortak fiyat güncellemesi için sunucu tarafı.

## 1. GitHub Pages üzerinde yayınlama

1. ZIP arşivini çıkarın.
2. İçindeki `teaspoon-bakery` klasörünün dosyalarını GitHub deposunun ana dizinine yükleyin. `index.html` dosyası depo ana dizininde olmalı.
3. GitHub deposunda **Settings → Pages** bölümüne girin.
4. **Deploy from a branch** seçin; `main` ve `/(root)` seçip kaydedin.
5. Yayınlandıktan sonra ana bağlantı müşteri menüsüdür. Yönetim ekranı aynı adresin sonuna `/admin` eklenerek açılır.

Örnek:
- Müşteri: `https://kullanici.github.io/depo-adi/`
- Yönetim: `https://kullanici.github.io/depo-adi/admin`

## 2. Yönetim paneli giriş bilgileri

İlk önizleme için:
- Kullanıcı adı: `test`
- Şifre: `123`

Panelde ürün adını, fiyatını ve menüde gösterilip gösterilmeyeceğini değiştirebilirsiniz. Kahve bölümündeki ekstraların adları ve fiyatları da düzenlenebilir.

**Önemli güvenlik ve senkronizasyon notu:** GitHub Pages statik barındırmadır; tek başına güvenli kullanıcı doğrulaması veya ortak veritabanı sunmaz. API kurulmadan yapılan fiyat değişiklikleri yalnızca yönetim panelinin açıldığı tarayıcıda saklanır. Bu demo girişi de gerçek bir güvenlik katmanı değildir. Her müşterinin telefonunda aynı fiyatı görmek için aşağıdaki ortak API kurulumunu tamamlayın ve `test/123` bilgilerini değiştirin.

## 3. Farklı cihazlarda ortak ve otomatik fiyat güncellemesi (Cloudflare Worker)

Bu paket, Cloudflare Worker + KV ile kullanılmaya hazır sunucu kodunu içerir. Kurulumdan sonra fiyat değişikliği ortak veri alanına kaydedilir. Müşteri sayfası açık durumdayken fiyatları 15 saniyede bir kontrol eder.

### A. Cloudflare KV oluşturma

Bilgisayarınızda Node.js kurulu olmalı. Terminal / PowerShell açıp şu komutları çalıştırın:

```bash
npm install -g wrangler
wrangler login
cd cloudflare-worker
wrangler kv namespace create MENU_KV
```

Komutun verdiği KV namespace ID değerini `cloudflare-worker/wrangler.toml` içindeki `BURAYA_KV_NAMESPACE_ID_YAZIN` yazısının yerine yapıştırın.

### B. Yönetici bilgilerini tanımlama

Aşağıdaki komutları `cloudflare-worker` klasöründeyken çalıştırın:

```bash
wrangler secret put ADMIN_USER
wrangler secret put ADMIN_PASSWORD
wrangler secret put SESSION_SECRET
```

Her komut sizden bir değer ister:
- `ADMIN_USER`: İlk deneme için `test` yazabilirsiniz.
- `ADMIN_PASSWORD`: İlk deneme için `123` yazabilirsiniz. Gerçek kullanımda güçlü ve benzersiz bir şifre seçin.
- `SESSION_SECRET`: Uzun ve rastgele bir gizli değer girin (en az 32 karakter önerilir). Bu değer yönetici oturumlarını imzalar.

### C. Worker'ı yayınlama

```bash
wrangler deploy
```

Komut sonunda `https://teaspoon-menu-api....workers.dev` benzeri bir adres verilir.

### D. Web sitesini API'ye bağlama

`assets/config.js` dosyasını açıp `API_BASE_URL` alanına Worker adresini yazın:

```js
export const CONFIG = {
  API_BASE_URL: "https://teaspoon-menu-api.<hesap>.workers.dev"
};
```

Bu değişikliği GitHub deposuna da yükleyin. Artık admin panelinde giriş Worker üzerinden doğrulanır; kaydedilen fiyatlar ortak KV alanına yazılır ve menü tüm ziyaretçilere sunulur.

## 4. Google, Instagram ve harita bağlantıları

- Instagram: `https://www.instagram.com/teaspoon.ist/`
- Google işletme kaydı: `https://maps.app.goo.gl/RPnUsDxUrPvs7CwZA`
- Harita: Teaspoon Bakery'nin Google Maps konumu.

Verdiğiniz Google kısa bağlantısı doğrudan yorum yazma formuna değil, Teaspoon Bakery işletme kaydına yönleniyor. Bu yüzden buton Google işletme kaydını açar; müşteri buradan yorumlar bölümüne geçerek değerlendirme bırakabilir. Doğrudan yorum formu bağlantısı için işletmenin Google tarafından üretilen ayrı `g.page/.../review` bağlantısı veya Places ID tabanlı doğrulanmış bağlantısı gerekir.

## 5. Menü aktarımı hakkında

Başlangıç menüsü, gönderdiğiniz masa menüsü fotoğrafında net okunabilen kalem ve fiyatlardan aktarılmıştır. Işık yansıması nedeniyle okunamayan iki çay satırı tahmin edilerek eklenmemiştir. İşletmenin güncel basılı menüsünde değişiklik varsa yönetim panelinden düzeltin.

## 6. Notlar

- Müşteri sayfasında admin paneline yönlendiren bir buton yoktur.
- Tasarım mobil ekrana öncelik verir; arama ve kategori kısayolları bulunur.
- Fiyatlar menü verisinden gelir. Kod içinde sayfa sayfa fiyat değiştirmeniz gerekmez.
- Müşteri menüsü ve admin paneli ayrı URL yollarındadır.
