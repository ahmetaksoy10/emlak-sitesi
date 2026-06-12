# 🏠 Aksoy Emlak — Emlak Web Sitesi

Vanilla HTML + CSS + JavaScript ile geliştirilmiş, framework'süz, tek sayfa (SPA tarzı, hash yönlendirmeli) profesyonel emlak sitesi. Tüm veriler mock'tur, backend yoktur.

## Çalıştırma

Herhangi bir statik sunucu yeterlidir:

```bash
cd emlak-sitesi
python3 -m http.server 5173
# → http://localhost:5173
```

(`index.html` dosyasını doğrudan tarayıcıda açmak da çalışır.)

## Dosya Yapısı

| Dosya | Görev |
|---|---|
| `index.html` | Uygulama iskeleti: header, footer, yüzen öğeler, SEO/OG meta |
| `css/style.css` | Tüm stiller: tema değişkenleri, koyu mod, responsive, print |
| `js/data.js` | Mock veriler: firma bilgileri (`SITE`) + 14 ilan (`ILANLAR`) |
| `js/app.js` | Hash router + tüm sayfa çizimleri ve etkileşimler |

## Sayfalar

- **Ana Sayfa** `#/` — hero + glass arama, vitrin, son görüntülenenler, animasyonlu istatistikler, neden biz, CTA
- **İlanlar** `#/ilanlar` — filtre paneli (tip, emlak türü, şehir, çift kollu fiyat slider'ı, oda, m², sadece favoriler), sıralama, boş durum
- **İlan Detay** `#/ilan/:id` — galeri, özellik tablosu, harita, danışman kartı, ilgi formu, paylaşım, yazdırma, benzer ilanlar
- **İlan Ver** `#/ilan-ver` — 6 adımlı form (doğrulama, sürükle-bırak fotoğraf, önizleme, başarı ekranı)
- **Hakkımızda** `#/hakkimizda` · **İletişim** `#/iletisim` · **404** (bilinmeyen rotalar)

## Kişiselleştirme

Firma adı, telefon, WhatsApp, adres ve sosyal medya linkleri **tek yerden** `js/data.js` içindeki `SITE` nesnesinden değiştirilir. (`index.html` içindeki header/footer iletişim bilgilerini de aynı değerlerle güncellemeyi unutmayın.) İlanlar `ILANLAR` dizisine eklenir.

## Özellikler

Koyu/açık tema (kalıcı), favoriler ve son görüntülenenler (LocalStorage), TL para formatı (1.250.000 ₺), lazy-load görseller, Intersection Observer ile scroll animasyonları, skeleton yükleme, yüzen WhatsApp butonu, başa dön butonu, yazdırma dostu detay sayfası, erişilebilirlik (aria-label, focus stilleri).
