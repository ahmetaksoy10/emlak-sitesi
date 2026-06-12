/* =========================================================
   ALTIN EMLAK — Uygulama Mantığı
   Hash tabanlı SPA yönlendirici + sayfa çizimleri
   ========================================================= */

/* ---------- Kısayollar & Yardımcılar ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const EMLAK_TIPLERI = { daire: "Daire", villa: "Villa", arsa: "Arsa", isyeri: "İş Yeri", mustakil: "Müstakil Ev" };
const TIP_IKON = { daire: "fa-building", villa: "fa-house-chimney", arsa: "fa-map-location-dot", isyeri: "fa-briefcase", mustakil: "fa-house" };

// Türk Lirası formatı: 1.250.000 ₺ (kiralıkta /ay eki)
const fmtSayi = (n) => new Intl.NumberFormat("tr-TR").format(n);
const fmtFiyat = (i) => `${fmtSayi(i.fiyat)} ₺${i.ilanTipi === "kiralik" ? "/ay" : ""}`;
const fmtTarih = (t) => new Date(t).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
const konumStr = (i) => `${i.mahalle}, ${i.ilce} / ${i.sehir}`;
const ilanTipiAd = (t) => (t === "satilik" ? "Satılık" : "Kiralık");

/* ---------- LocalStorage ---------- */
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
};
let favoriler = store.get("ae_favoriler", []);
let sonGorulen = store.get("ae_songorulen", []);

/* ---------- Toast Bildirimi ---------- */
function toast(msg, tip = "basari") {
  const t = document.createElement("div");
  t.className = `toast ${tip}`;
  t.innerHTML = `<i class="fa-solid ${tip === "basari" ? "fa-circle-check" : "fa-circle-exclamation"}"></i><span>${msg}</span>`;
  $("#toastAlan").appendChild(t);
  requestAnimationFrame(() => t.classList.add("goster"));
  setTimeout(() => { t.classList.remove("goster"); setTimeout(() => t.remove(), 350); }, 3200);
}

/* ---------- Scroll Animasyonları (Intersection Observer) ---------- */
const fadeIO = new IntersectionObserver((girisler) => {
  girisler.forEach((g) => {
    if (g.isIntersecting) { g.target.classList.add("visible"); fadeIO.unobserve(g.target); }
  });
}, { threshold: 0.08 });

function fadeBagla() { $$(".fade-in:not(.visible)").forEach((el) => fadeIO.observe(el)); }

/* ---------- Tema (gece / gündüz) ---------- */
function temaUygula(t) {
  document.documentElement.dataset.theme = t;
  $("#temaBtn i").className = t === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
}
let tema = store.get("ae_tema", "light");

/* ---------- Favoriler ---------- */
const favMi = (id) => favoriler.includes(id);

function favDegistir(id) {
  const eklendi = !favMi(id);
  favoriler = eklendi ? [...favoriler, id] : favoriler.filter((x) => x !== id);
  store.set("ae_favoriler", favoriler);

  // Sayfadaki tüm eş kalp butonlarını güncelle
  $$(`[data-fav="${id}"]`).forEach((btn) => {
    btn.classList.toggle("aktif", eklendi);
    btn.classList.remove("pop");
    void btn.offsetWidth; // animasyonu yeniden tetikle
    btn.classList.add("pop");
    const ic = $("i", btn);
    if (ic) ic.className = `${eklendi ? "fa-solid" : "fa-regular"} fa-heart`;
  });
  toast(eklendi ? "İlan favorilere eklendi ❤" : "İlan favorilerden çıkarıldı");
}

/* ---------- İlan Kartı Bileşeni ---------- */
function kartHTML(i) {
  const fav = favMi(i.id);
  return `
  <a href="#/ilan/${i.id}" class="ilan-card fade-in" aria-label="${i.baslik} — ${fmtFiyat(i)}">
    <div class="card-media">
      <img src="${i.fotograflar[0]}" alt="${i.baslik}" loading="lazy">
      <div class="card-badges">
        <span class="badge ${i.ilanTipi}">${ilanTipiAd(i.ilanTipi)}</span>
        ${i.oneCikan ? '<span class="badge one"><i class="fa-solid fa-star"></i> Öne Çıkan</span>' : ""}
      </div>
      <button type="button" class="fav-btn ${fav ? "aktif" : ""}" data-fav="${i.id}"
        aria-label="${fav ? "Favorilerden çıkar" : "Favorilere ekle"}">
        <i class="${fav ? "fa-solid" : "fa-regular"} fa-heart"></i>
      </button>
      <span class="card-fiyat">${fmtFiyat(i)}</span>
    </div>
    <div class="card-body">
      <h3 class="card-baslik">${i.baslik}</h3>
      <p class="card-konum"><i class="fa-solid fa-location-dot"></i>${konumStr(i)}</p>
      <div class="card-specs">
        ${i.odaSayisi ? `<span><i class="fa-solid fa-bed"></i>${i.odaSayisi}</span>` : ""}
        ${i.banyoSayisi ? `<span><i class="fa-solid fa-bath"></i>${i.banyoSayisi} Banyo</span>` : ""}
        <span><i class="fa-solid fa-ruler-combined"></i>${fmtSayi(i.metrekare)} m²</span>
      </div>
      <div class="card-foot">
        <span><i class="fa-regular fa-calendar"></i> ${fmtTarih(i.tarih)}</span>
        <span class="incele">İncele <i class="fa-solid fa-arrow-right"></i></span>
      </div>
    </div>
  </a>`;
}

const skeletonHTML = () => `
  <div class="skeleton-card" aria-hidden="true">
    <div class="skeleton sk-media"></div>
    <div class="skeleton sk-satir"></div>
    <div class="skeleton sk-satir kisa"></div>
  </div>`;

/* =========================================================
   YÖNLENDİRİCİ (Router)
   ========================================================= */
let anaSayfadaMi = false;

function rotayiCoz() {
  const h = location.hash.slice(1) || "/";
  const [yol, sorgu] = h.split("?");
  return { yol, params: new URLSearchParams(sorgu || "") };
}

function router() {
  const { yol, params } = rotayiCoz();
  const app = $("#app");
  menuKapat();

  let rota = "home";
  if (yol === "/" || yol === "") { renderAnaSayfa(app); }
  else if (yol === "/ilanlar") { renderIlanlar(app, params); rota = "ilanlar"; }
  else if (yol.startsWith("/ilan/")) {
    const ilan = ILANLAR.find((x) => x.id === Number(yol.split("/")[2]));
    if (ilan) { renderDetay(app, ilan); rota = "ilanlar"; }
    else { render404(app); rota = "404"; }
  }
  else if (yol === "/ilan-ver") { renderIlanVer(app); rota = "ilan-ver"; }
  else if (yol === "/hakkimizda") { renderHakkimizda(app); rota = "hakkimizda"; }
  else if (yol === "/iletisim") { renderIletisim(app); rota = "iletisim"; }
  else { render404(app); rota = "404"; }

  window.scrollTo(0, 0);
  anaSayfadaMi = rota === "home";
  $$(".nav a").forEach((a) => a.classList.toggle("active", a.dataset.route === rota));
  headerDurumGuncelle();
  fadeBagla();
}

function headerDurumGuncelle() {
  $("#header").classList.toggle("on-hero", anaSayfadaMi && window.scrollY < 60);
  $("#topBtn").classList.toggle("goster", window.scrollY > 600);
}

function menuKapat() {
  $("#nav").classList.remove("acik");
  $("#menuBtn").setAttribute("aria-expanded", "false");
}

/* =========================================================
   ANA SAYFA
   ========================================================= */
function renderAnaSayfa(app) {
  const vitrin = ILANLAR.filter((i) => i.oneCikan).slice(0, 6);
  const sehirler = [...new Set(ILANLAR.map((i) => i.sehir))];
  const gorulenler = sonGorulen.map((id) => ILANLAR.find((i) => i.id === id)).filter(Boolean).slice(0, 3);

  app.innerHTML = `
  <!-- HERO -->
  <section class="hero">
    <div class="container hero-icerik">
      <span class="hero-ust-etiket"><i class="fa-solid fa-award"></i> 15 yıldır güvenilir gayrimenkul danışmanlığı</span>
      <h1>Hayalinizdeki Eve <em>Kavuşun</em></h1>
      <p class="hero-alt-yazi">Satılık ve kiralık konutlardan yatırımlık arsalara; İstanbul ve çevresindeki en seçkin portföy, doğru fiyat analizi ve dürüst danışmanlıkla bir tık uzağınızda.</p>
      <div class="hero-btnler">
        <a href="#/ilanlar" class="btn btn-altin"><i class="fa-solid fa-magnifying-glass"></i> İlanları Keşfet</a>
        <a href="#/iletisim" class="btn btn-beyaz-cizgili"><i class="fa-solid fa-phone"></i> Bize Ulaşın</a>
      </div>

      <form id="heroSearch" class="hero-search" aria-label="Hızlı ilan arama">
        <div class="hs-alan">
          <label for="hsIlanTipi">İlan Tipi</label>
          <select id="hsIlanTipi" name="ilanTipi">
            <option value="">Tümü</option>
            <option value="satilik">Satılık</option>
            <option value="kiralik">Kiralık</option>
          </select>
        </div>
        <div class="hs-alan">
          <label for="hsEmlakTipi">Emlak Tipi</label>
          <select id="hsEmlakTipi" name="emlakTipi">
            <option value="">Tümü</option>
            ${Object.entries(EMLAK_TIPLERI).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}
          </select>
        </div>
        <div class="hs-alan">
          <label for="hsSehir">Şehir</label>
          <select id="hsSehir" name="sehir">
            <option value="">Tüm Şehirler</option>
            ${sehirler.map((s) => `<option value="${s}">${s}</option>`).join("")}
          </select>
        </div>
        <div class="hs-alan">
          <label for="hsButce">Maks. Bütçe</label>
          <select id="hsButce" name="maxFiyat">
            <option value="">Farketmez</option>
            <option value="50000">50.000 ₺ (kira)</option>
            <option value="100000">100.000 ₺ (kira)</option>
            <option value="5000000">5.000.000 ₺</option>
            <option value="10000000">10.000.000 ₺</option>
            <option value="25000000">25.000.000 ₺</option>
            <option value="100000000">100.000.000 ₺</option>
          </select>
        </div>
        <button type="submit" class="btn btn-altin hs-btn"><i class="fa-solid fa-magnifying-glass"></i> Ara</button>
      </form>
    </div>
  </section>

  <!-- VİTRİN -->
  <section class="bolum">
    <div class="container">
      <div class="bolum-ust-satir fade-in">
        <div>
          <span class="ust-etiket">Vitrin</span>
          <h2>Öne Çıkan İlanlar</h2>
        </div>
        <a href="#/ilanlar" class="btn btn-cizgili">Tüm İlanlar <i class="fa-solid fa-arrow-right"></i></a>
      </div>
      <div class="ilan-grid">${vitrin.map(kartHTML).join("")}</div>
    </div>
  </section>

  ${gorulenler.length ? `
  <!-- SON GÖRÜNTÜLENENLER -->
  <section class="bolum" style="padding-top:0">
    <div class="container">
      <div class="bolum-ust-satir fade-in">
        <div>
          <span class="ust-etiket">Kaldığınız Yerden</span>
          <h2>Son Görüntülediğiniz İlanlar</h2>
        </div>
      </div>
      <div class="ilan-grid">${gorulenler.map(kartHTML).join("")}</div>
    </div>
  </section>` : ""}

  <!-- İSTATİSTİKLER -->
  <section class="stats">
    <div class="container stats-grid">
      <div class="stat fade-in"><i class="fa-solid fa-face-smile"></i><span class="stat-sayi" data-hedef="500" data-ek="+">0</span><p>Mutlu Müşteri</p></div>
      <div class="stat fade-in"><i class="fa-solid fa-building"></i><span class="stat-sayi" data-hedef="1200" data-ek="+">0</span><p>Yayınlanan İlan</p></div>
      <div class="stat fade-in"><i class="fa-solid fa-medal"></i><span class="stat-sayi" data-hedef="15" data-ek="">0</span><p>Yıllık Deneyim</p></div>
      <div class="stat fade-in"><i class="fa-solid fa-handshake"></i><span class="stat-sayi" data-hedef="98" data-ek="%" data-on="1">0</span><p>Müşteri Memnuniyeti</p></div>
    </div>
  </section>

  <!-- NEDEN BİZ -->
  <section class="bolum">
    <div class="container">
      <div class="bolum-baslik fade-in">
        <span class="ust-etiket">Neden Aksoy Emlak?</span>
        <h2>Doğru Adres, Doğru Danışmanlık</h2>
        <p>Gayrimenkul kararları hayatınızın en önemli kararlarındandır. Her adımda yanınızdayız.</p>
      </div>
      <div class="ozellik-kartlar">
        <div class="ozellik-kart fade-in">
          <div class="ikon"><i class="fa-solid fa-shield-halved"></i></div>
          <h3>Güvenilir Danışmanlık</h3>
          <p>Tapudan ekspertize tüm süreçlerde şeffaf bilgilendirme ve hukuki güvence.</p>
        </div>
        <div class="ozellik-kart fade-in">
          <div class="ikon"><i class="fa-solid fa-chart-line"></i></div>
          <h3>Doğru Fiyat Analizi</h3>
          <p>Bölge verilerine dayalı gerçekçi değerleme ile ne eksik ne fazla; tam değerinde.</p>
        </div>
        <div class="ozellik-kart fade-in">
          <div class="ikon"><i class="fa-solid fa-city"></i></div>
          <h3>Geniş Portföy</h3>
          <p>Daireden villaya, arsadan iş yerine her bütçeye uygun seçkin ilanlar.</p>
        </div>
        <div class="ozellik-kart fade-in">
          <div class="ikon"><i class="fa-solid fa-headset"></i></div>
          <h3>7/24 İletişim</h3>
          <p>Aklınıza takılan her soruda telefon ve WhatsApp üzerinden anında destek.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="bolum" style="padding-top:0">
    <div class="container">
      <div class="cta fade-in">
        <div>
          <h2>Mülkünüzü mü satmak istiyorsunuz?</h2>
          <p>İlanınızı ücretsiz yayınlayalım, doğru alıcıyla en kısa sürede buluşturalım.</p>
        </div>
        <a href="#/ilan-ver" class="btn btn-altin"><i class="fa-solid fa-circle-plus"></i> Hemen İlan Ver</a>
      </div>
    </div>
  </section>`;

  // Hızlı arama → ilanlar sayfasına filtreli yönlendirme
  $("#heroSearch").addEventListener("submit", (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    new FormData(e.target).forEach((v, k) => { if (v) p.set(k, v); });
    location.hash = "/ilanlar" + (p.toString() ? "?" + p.toString() : "");
  });

  sayaclariBaslat();
}

/* Sayaç animasyonu (istatistikler görünür olunca) */
function sayaclariBaslat() {
  const io = new IntersectionObserver((girisler) => {
    girisler.forEach((g) => {
      if (!g.isIntersecting) return;
      io.unobserve(g.target);
      const el = g.target;
      const hedef = Number(el.dataset.hedef);
      const ek = el.dataset.ek || "";
      const onek = el.dataset.on ? "%" : "";
      const sure = 1600, t0 = performance.now();
      const adim = (t) => {
        const oran = Math.min((t - t0) / sure, 1);
        const deger = Math.round(hedef * (1 - Math.pow(1 - oran, 3))); // ease-out
        el.textContent = onek ? `${onek}${deger}` : `${fmtSayi(deger)}${ek}`;
        if (oran < 1) requestAnimationFrame(adim);
      };
      requestAnimationFrame(adim);
    });
  }, { threshold: 0.4 });
  $$(".stat-sayi").forEach((el) => io.observe(el));
}

/* =========================================================
   İLANLAR SAYFASI
   ========================================================= */
function renderIlanlar(app, params) {
  const sehirler = [...new Set(ILANLAR.map((i) => i.sehir))];

  app.innerHTML = `
  <section class="sayfa-baslik">
    <div class="container">
      <h1>Tüm İlanlar</h1>
      <p>Filtreleri kullanarak size en uygun gayrimenkulü bulun.</p>
    </div>
  </section>

  <section class="ilanlar-bolum">
    <div class="container">
      <button type="button" id="filtreAc" class="btn btn-cizgili filtre-ac"><i class="fa-solid fa-sliders"></i> Filtreleri Göster</button>
      <div class="ilanlar-yerlesim">

        <aside id="filtrePanel" class="filtre-panel" aria-label="İlan filtreleri">
          <div class="filtre-grup">
            <h4>İlan Tipi</h4>
            <div class="secenek-grup">
              <label><input type="radio" name="fIlanTipi" value="" checked> Tümü</label>
              <label><input type="radio" name="fIlanTipi" value="satilik"> Satılık</label>
              <label><input type="radio" name="fIlanTipi" value="kiralik"> Kiralık</label>
            </div>
          </div>

          <div class="filtre-grup">
            <h4>Emlak Tipi</h4>
            <div class="secenek-grup">
              ${Object.entries(EMLAK_TIPLERI).map(([k, v]) =>
                `<label><input type="checkbox" name="fEmlakTipi" value="${k}"> ${v}</label>`).join("")}
            </div>
          </div>

          <div class="filtre-grup">
            <h4>Şehir</h4>
            <select id="fSehir" aria-label="Şehir seçin">
              <option value="">Tüm Şehirler</option>
              ${sehirler.map((s) => `<option value="${s}">${s}</option>`).join("")}
            </select>
          </div>

          <div class="filtre-grup">
            <h4>Fiyat Aralığı</h4>
            <div class="range-slider">
              <div class="range-track"><div class="range-fill" id="rangeFill"></div></div>
              <input type="range" id="fMin" min="0" max="100000000" step="250000" value="0" aria-label="En düşük fiyat">
              <input type="range" id="fMax" min="0" max="100000000" step="250000" value="100000000" aria-label="En yüksek fiyat">
            </div>
            <div class="range-vals"><span id="fMinVal"></span><span id="fMaxVal"></span></div>
          </div>

          <div class="filtre-grup">
            <h4>Oda Sayısı</h4>
            <div class="secenek-grup">
              ${["1+0", "1+1", "2+1", "3+1", "4+1", "5+"].map((o) =>
                `<label><input type="checkbox" name="fOda" value="${o}"> ${o}</label>`).join("")}
            </div>
          </div>

          <div class="filtre-grup">
            <h4>Metrekare</h4>
            <div class="mk-girdi">
              <input type="number" id="fMkMin" placeholder="Min" min="0" aria-label="En düşük metrekare">
              <span>—</span>
              <input type="number" id="fMkMax" placeholder="Max" min="0" aria-label="En yüksek metrekare">
            </div>
          </div>

          <label class="fav-filtre"><input type="checkbox" id="fFav"> <i class="fa-solid fa-heart"></i> Sadece Favorilerim</label>
          <button type="button" id="filtreSifirla" class="btn btn-cizgili tam"><i class="fa-solid fa-rotate-left"></i> Filtreleri Temizle</button>
        </aside>

        <div class="ilanlar-sag">
          <div class="ilanlar-arac">
            <p id="sonucSayisi" role="status"></p>
            <select id="sirala" aria-label="Sıralama ölçütü">
              <option value="tarih-yeni">En Yeni İlanlar</option>
              <option value="tarih-eski">En Eski İlanlar</option>
              <option value="fiyat-artan">Fiyat (Önce En Düşük)</option>
              <option value="fiyat-azalan">Fiyat (Önce En Yüksek)</option>
            </select>
          </div>
          <div id="ilanGrid" class="ilan-grid">${skeletonHTML().repeat(6)}</div>
        </div>

      </div>
    </div>
  </section>`;

  /* --- Filtre durumu: URL parametrelerinden ön ayar --- */
  const tipParam = params.get("ilanTipi") || "";
  const emlakParam = params.get("emlakTipi") || "";
  const sehirParam = params.get("sehir") || "";
  const maxParam = Number(params.get("maxFiyat")) || null;

  if (tipParam) { const r = $(`input[name="fIlanTipi"][value="${tipParam}"]`); if (r) r.checked = true; }
  if (emlakParam) { const c = $(`input[name="fEmlakTipi"][value="${emlakParam}"]`); if (c) c.checked = true; }
  if (sehirParam) $("#fSehir").value = sehirParam;

  const fMin = $("#fMin"), fMax = $("#fMax"), fill = $("#rangeFill");

  // İlan tipine göre slider sınırlarını ayarla (kiralıkta aylık tutarlar küçük)
  function sliderSiniriAyarla() {
    const tip = $('input[name="fIlanTipi"]:checked').value;
    const ust = tip === "kiralik" ? 200000 : 100000000;
    const adimDeger = tip === "kiralik" ? 5000 : 250000;
    fMin.max = fMax.max = ust;
    fMin.step = fMax.step = adimDeger;
    fMin.value = 0;
    fMax.value = ust;
    sliderGorselGuncelle();
  }

  function sliderGorselGuncelle() {
    let min = Number(fMin.value), max = Number(fMax.value);
    if (min > max) { [min, max] = [max, min]; }
    const ust = Number(fMax.max);
    fill.style.left = `${(min / ust) * 100}%`;
    fill.style.right = `${100 - (max / ust) * 100}%`;
    $("#fMinVal").textContent = `${fmtSayi(min)} ₺`;
    $("#fMaxVal").textContent = `${fmtSayi(max)} ₺`;
  }

  // Kolların birbirini geçmesini engelle
  fMin.addEventListener("input", () => {
    if (Number(fMin.value) > Number(fMax.value)) fMin.value = fMax.value;
    sliderGorselGuncelle(); uygula();
  });
  fMax.addEventListener("input", () => {
    if (Number(fMax.value) < Number(fMin.value)) fMax.value = fMin.value;
    sliderGorselGuncelle(); uygula();
  });

  sliderSiniriAyarla();
  if (maxParam) { fMax.value = Math.min(maxParam, Number(fMax.max)); sliderGorselGuncelle(); }

  /* --- Filtreleme & sıralama --- */
  function uygula() {
    const tip = $('input[name="fIlanTipi"]:checked').value;
    const emlakler = $$('input[name="fEmlakTipi"]:checked').map((c) => c.value);
    const sehir = $("#fSehir").value;
    const odalar = $$('input[name="fOda"]:checked').map((c) => c.value);
    const min = Number(fMin.value), max = Number(fMax.value);
    const mkMin = Number($("#fMkMin").value) || 0;
    const mkMax = Number($("#fMkMax").value) || Infinity;
    const sadeceFav = $("#fFav").checked;
    const siralama = $("#sirala").value;

    let sonuc = ILANLAR.filter((i) => {
      if (tip && i.ilanTipi !== tip) return false;
      if (emlakler.length && !emlakler.includes(i.emlakTipi)) return false;
      if (sehir && i.sehir !== sehir) return false;
      if (i.fiyat < min || i.fiyat > max) return false;
      if (i.metrekare < mkMin || i.metrekare > mkMax) return false;
      if (sadeceFav && !favMi(i.id)) return false;
      if (odalar.length) {
        if (!i.odaSayisi) return false;
        const oda = i.odaSayisi;
        const besArti = odalar.includes("5+") && parseInt(oda) >= 5;
        if (!odalar.includes(oda) && !besArti) return false;
      }
      return true;
    });

    sonuc.sort((a, b) => {
      switch (siralama) {
        case "fiyat-artan": return a.fiyat - b.fiyat;
        case "fiyat-azalan": return b.fiyat - a.fiyat;
        case "tarih-eski": return new Date(a.tarih) - new Date(b.tarih);
        default: return new Date(b.tarih) - new Date(a.tarih);
      }
    });

    $("#sonucSayisi").innerHTML = `<b>${sonuc.length}</b> ilan bulundu`;
    const grid = $("#ilanGrid");
    grid.innerHTML = sonuc.length
      ? sonuc.map(kartHTML).join("")
      : `<div class="bos-durum">
           <div class="ikon"><i class="fa-solid fa-house-circle-xmark"></i></div>
           <h3>İlan Bulunamadı</h3>
           <p>Aradığınız kriterlere uygun ilan bulunamadı. Filtreleri genişleterek tekrar deneyebilirsiniz.</p>
           <button type="button" class="btn btn-altin" id="bosTemizle"><i class="fa-solid fa-rotate-left"></i> Filtreleri Temizle</button>
         </div>`;
    const bosBtn = $("#bosTemizle");
    if (bosBtn) bosBtn.addEventListener("click", sifirla);
    fadeBagla();
  }

  function sifirla() {
    $$('input[name="fEmlakTipi"], input[name="fOda"]').forEach((c) => (c.checked = false));
    $('input[name="fIlanTipi"][value=""]').checked = true;
    $("#fSehir").value = "";
    $("#fMkMin").value = ""; $("#fMkMax").value = "";
    $("#fFav").checked = false;
    $("#sirala").value = "tarih-yeni";
    sliderSiniriAyarla();
    uygula();
  }

  // Olay bağlama
  $$('input[name="fIlanTipi"]').forEach((r) => r.addEventListener("change", () => { sliderSiniriAyarla(); uygula(); }));
  $$('input[name="fEmlakTipi"], input[name="fOda"]').forEach((c) => c.addEventListener("change", uygula));
  $("#fSehir").addEventListener("change", uygula);
  $("#fMkMin").addEventListener("input", uygula);
  $("#fMkMax").addEventListener("input", uygula);
  $("#fFav").addEventListener("change", uygula);
  $("#sirala").addEventListener("change", uygula);
  $("#filtreSifirla").addEventListener("click", sifirla);
  $("#filtreAc").addEventListener("click", () => {
    const p = $("#filtrePanel");
    p.classList.toggle("acik");
    $("#filtreAc").innerHTML = p.classList.contains("acik")
      ? '<i class="fa-solid fa-xmark"></i> Filtreleri Gizle'
      : '<i class="fa-solid fa-sliders"></i> Filtreleri Göster';
  });

  // Skeleton kısa süre gösterilip gerçek liste çizilir
  setTimeout(uygula, 450);
}

/* =========================================================
   İLAN DETAY SAYFASI
   ========================================================= */
function renderDetay(app, i) {
  // Son görüntülenenlere ekle (başa, tekrarsız, en fazla 6)
  sonGorulen = [i.id, ...sonGorulen.filter((x) => x !== i.id)].slice(0, 6);
  store.set("ae_songorulen", sonGorulen);

  const fav = favMi(i.id);
  const vy = (b) => (b ? "Var" : "Yok");
  const satirlar = [
    ["İlan No", `#${String(i.id).padStart(5, "0")}`],
    ["İlan Tipi", ilanTipiAd(i.ilanTipi)],
    ["Emlak Tipi", EMLAK_TIPLERI[i.emlakTipi]],
    ["Brüt Metrekare", `${fmtSayi(i.metrekare)} m²`],
    ["Oda Sayısı", i.odaSayisi],
    ["Banyo Sayısı", i.banyoSayisi],
    ["Bulunduğu Kat", i.kat],
    ["Bina Yaşı", i.binaYasi === null ? null : (i.binaYasi === 0 ? "Sıfır" : i.binaYasi)],
    ["Isıtma", i.isitma],
    ["Balkon", i.balkon === null ? null : vy(i.balkon)],
    ["Otopark", i.otopark === null ? null : vy(i.otopark)],
    ["Asansör", i.asansor === null ? null : vy(i.asansor)],
    ["Site İçinde", i.siteIci === null ? null : (i.siteIci ? "Evet" : "Hayır")],
    ["Eşyalı", i.esyali === null ? null : (i.esyali ? "Evet" : "Hayır")],
    ["Kullanım Durumu", i.kullanimDurumu],
    ["İlan Tarihi", fmtTarih(i.tarih)]
  ].filter(([, v]) => v !== null && v !== undefined && v !== "");

  const benzerler = ILANLAR
    .filter((x) => x.id !== i.id && (x.emlakTipi === i.emlakTipi || x.sehir === i.sehir))
    .slice(0, 3);

  const payMetin = encodeURIComponent(`${i.baslik} — ${fmtFiyat(i)}`);
  const payUrl = encodeURIComponent(location.href);

  app.innerHTML = `
  <section class="detay">
    <div class="container">
      <nav class="kirinti" aria-label="Sayfa konumu">
        <a href="#/">Ana Sayfa</a> &nbsp;/&nbsp; <a href="#/ilanlar">İlanlar</a> &nbsp;/&nbsp; <span>${i.baslik}</span>
      </nav>

      <div class="detay-ust">
        <div>
          <div class="detay-etiketler">
            <span class="badge ${i.ilanTipi}">${ilanTipiAd(i.ilanTipi)}</span>
            <span class="badge one">${EMLAK_TIPLERI[i.emlakTipi]}</span>
          </div>
          <h1>${i.baslik}</h1>
          <p class="detay-konum"><i class="fa-solid fa-location-dot"></i>${konumStr(i)} — ${i.adres}</p>
        </div>
        <div class="detay-fiyat-kutu">
          <span class="detay-fiyat">${fmtFiyat(i)}</span>
          <div class="paylas">
            <a class="ikon-btn" target="_blank" rel="noopener" aria-label="WhatsApp ile paylaş"
               href="https://wa.me/?text=${payMetin}%20${payUrl}"><i class="fa-brands fa-whatsapp"></i></a>
            <a class="ikon-btn" target="_blank" rel="noopener" aria-label="X (Twitter) ile paylaş"
               href="https://twitter.com/intent/tweet?text=${payMetin}&url=${payUrl}"><i class="fa-brands fa-x-twitter"></i></a>
            <button type="button" id="linkKopyala" class="ikon-btn" aria-label="İlan bağlantısını kopyala"><i class="fa-solid fa-link"></i></button>
            <button type="button" id="yazdirBtn" class="ikon-btn" aria-label="İlanı yazdır"><i class="fa-solid fa-print"></i></button>
            <button type="button" class="ikon-btn fav-btn-buyuk ${fav ? "aktif" : ""}" data-fav="${i.id}" aria-label="Favorilere ekle/çıkar">
              <i class="${fav ? "fa-solid" : "fa-regular"} fa-heart"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="detay-yerlesim">
        <div class="detay-ana">
          <!-- Galeri -->
          <div class="galeri">
            <div class="galeri-main">
              <img id="galeriImg" src="${i.fotograflar[0]}" alt="${i.baslik} — fotoğraf 1">
              <button type="button" class="g-btn g-prev" aria-label="Önceki fotoğraf"><i class="fa-solid fa-chevron-left"></i></button>
              <button type="button" class="g-btn g-next" aria-label="Sonraki fotoğraf"><i class="fa-solid fa-chevron-right"></i></button>
              <span class="g-sayac" id="gSayac">1 / ${i.fotograflar.length}</span>
            </div>
            <div class="galeri-thumbs" id="gThumbs">
              ${i.fotograflar.map((f, x) =>
                `<img src="${f}" alt="Küçük fotoğraf ${x + 1}" data-idx="${x}" class="${x === 0 ? "aktif" : ""}" loading="lazy">`).join("")}
            </div>
          </div>

          <!-- Özellikler -->
          <div class="detay-kart fade-in">
            <h2><i class="fa-solid fa-list-check"></i> İlan Özellikleri</h2>
            <div class="ozellik-tablo">
              ${satirlar.map(([k, v]) => `<div class="ozellik-satir"><span>${k}</span><b>${v}</b></div>`).join("")}
            </div>
          </div>

          ${i.ozellikler.length ? `
          <div class="detay-kart fade-in">
            <h2><i class="fa-solid fa-circle-check"></i> Öne Çıkan Özellikler</h2>
            <div class="cipler">
              ${i.ozellikler.map((o) => `<span class="cip"><i class="fa-solid fa-check"></i>${o}</span>`).join("")}
            </div>
          </div>` : ""}

          <!-- Açıklama -->
          <div class="detay-kart fade-in">
            <h2><i class="fa-solid fa-align-left"></i> Açıklama</h2>
            <p class="aciklama-metin">${i.aciklama}</p>
          </div>

          <!-- Konum -->
          <div class="detay-kart fade-in">
            <h2><i class="fa-solid fa-map-location-dot"></i> Konum</h2>
            <div class="harita">
              <iframe title="${konumStr(i)} harita görünümü" loading="lazy"
                src="https://maps.google.com/maps?q=${encodeURIComponent(i.mahalle + " " + i.ilce + " " + i.sehir)}&z=14&output=embed"></iframe>
            </div>
          </div>
        </div>

        <!-- Yan panel -->
        <aside class="detay-yan">
          <div class="danisman-kart">
            <img src="${SITE.foto}" alt="${SITE.emlakci} portre fotoğrafı">
            <h3>${SITE.emlakci}</h3>
            <p class="unvan">${SITE.unvan} — ${SITE.firma}</p>
            <a href="${SITE.telefonHref}" class="btn btn-altin"><i class="fa-solid fa-phone"></i> ${SITE.telefon}</a>
            <a class="btn btn-yesil" target="_blank" rel="noopener"
               href="https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`Merhaba, "${i.baslik}" ilanıyla ilgileniyorum (İlan No: #${String(i.id).padStart(5, "0")}).`)}">
              <i class="fa-brands fa-whatsapp"></i> WhatsApp'tan Yaz
            </a>
          </div>

          <div class="detay-kart ilgi-form">
            <h3><i class="fa-solid fa-envelope-open-text"></i> Bu İlanla İlgileniyorum</h3>
            <form id="ilgiForm" novalidate>
              <div class="form-alan">
                <label for="igAd">Adınız Soyadınız <span class="zorunlu">*</span></label>
                <input type="text" id="igAd" name="ad" autocomplete="name">
                <span class="hata-msg">Lütfen adınızı girin.</span>
              </div>
              <div class="form-alan">
                <label for="igTel">Telefon <span class="zorunlu">*</span></label>
                <input type="tel" id="igTel" name="telefon" placeholder="05xx xxx xx xx" autocomplete="tel">
                <span class="hata-msg">Geçerli bir telefon numarası girin.</span>
              </div>
              <div class="form-alan">
                <label for="igMesaj">Mesajınız</label>
                <textarea id="igMesaj" name="mesaj">Merhaba, "${i.baslik}" ilanı hakkında bilgi almak istiyorum.</textarea>
              </div>
              <button type="submit" class="btn btn-lacivert tam"><i class="fa-solid fa-paper-plane"></i> Mesaj Gönder</button>
            </form>
          </div>
        </aside>
      </div>

      ${benzerler.length ? `
      <section class="bolum benzer-bolum" style="padding-bottom:0">
        <div class="bolum-ust-satir fade-in">
          <div>
            <span class="ust-etiket">Bunlar da İlginizi Çekebilir</span>
            <h2>Benzer İlanlar</h2>
          </div>
        </div>
        <div class="ilan-grid">${benzerler.map(kartHTML).join("")}</div>
      </section>` : ""}
    </div>
  </section>`;

  /* --- Galeri davranışı --- */
  let idx = 0;
  const img = $("#galeriImg");
  function galeriGit(yeni) {
    idx = (yeni + i.fotograflar.length) % i.fotograflar.length;
    img.src = i.fotograflar[idx];
    img.alt = `${i.baslik} — fotoğraf ${idx + 1}`;
    $("#gSayac").textContent = `${idx + 1} / ${i.fotograflar.length}`;
    $$("#gThumbs img").forEach((t, x) => t.classList.toggle("aktif", x === idx));
  }
  $(".g-prev").addEventListener("click", () => galeriGit(idx - 1));
  $(".g-next").addEventListener("click", () => galeriGit(idx + 1));
  $("#gThumbs").addEventListener("click", (e) => {
    const t = e.target.closest("[data-idx]");
    if (t) galeriGit(Number(t.dataset.idx));
  });

  /* --- Paylaşım & yazdırma --- */
  $("#linkKopyala").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      toast("İlan bağlantısı panoya kopyalandı");
    } catch {
      toast("Bağlantı kopyalanamadı", "hata");
    }
  });
  $("#yazdirBtn").addEventListener("click", () => window.print());

  /* --- İlgi formu --- */
  $("#ilgiForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    let gecerli = true;
    gecerli = alanKontrol(f.ad, f.ad.value.trim().length >= 3) && gecerli;
    gecerli = alanKontrol(f.telefon, /^[0-9+()\s-]{10,}$/.test(f.telefon.value.trim())) && gecerli;
    if (!gecerli) { toast("Lütfen zorunlu alanları kontrol edin", "hata"); return; }
    f.reset();
    toast("Talebiniz alındı! En kısa sürede size dönüş yapacağız.");
  });
}

/* Form alanı doğrulama yardımcısı */
function alanKontrol(input, kosul) {
  input.closest(".form-alan").classList.toggle("hata", !kosul);
  return kosul;
}

/* =========================================================
   İLAN VER — Çok Adımlı Form
   ========================================================= */
const ADIM_BASLIKLARI = ["Tip", "Konum", "Detaylar", "Fiyat", "Fotoğraflar", "İletişim"];
let ilanFormu = null;

function renderIlanVer(app) {
  ilanFormu = { adim: 1, veri: { ozellikler: [], fotolar: [] } };

  app.innerHTML = `
  <section class="sayfa-baslik">
    <div class="container">
      <h1>Ücretsiz İlan Ver</h1>
      <p>6 kolay adımda ilanınızı bize iletin; kontrol edip aynı gün yayına alalım.</p>
    </div>
  </section>

  <section class="ilanver-bolum">
    <div class="container ilanver-kutu">
      <div class="adimlar" id="adimlar">
        ${ADIM_BASLIKLARI.map((b, x) => `
          <div class="adim" data-adim="${x + 1}">
            <span class="nokta">${x + 1}</span>
            <span class="etiket">${b}</span>
          </div>`).join("")}
      </div>
      <div class="progress"><div class="progress-bar" id="progressBar"></div></div>

      <form id="ilanVerForm" class="ilanver-form" novalidate>
        <div id="adimIcerik" class="adim-icerik"></div>
        <div class="form-nav">
          <button type="button" id="geriBtn" class="btn btn-cizgili"><i class="fa-solid fa-arrow-left"></i> Geri</button>
          <button type="button" id="ileriBtn" class="btn btn-altin">Devam Et <i class="fa-solid fa-arrow-right"></i></button>
        </div>
      </form>
    </div>
  </section>`;

  $("#geriBtn").addEventListener("click", () => adimDegistir(-1));
  $("#ileriBtn").addEventListener("click", () => adimDegistir(1));
  $("#ilanVerForm").addEventListener("submit", (e) => e.preventDefault());

  adimCiz();
}

/* Adım içeriklerini üreten şablonlar */
function adimSablonu(n) {
  const d = ilanFormu.veri;
  const sec = (alan, deger) => (d[alan] === deger ? "checked" : "");
  const val = (alan) => d[alan] ?? "";

  switch (n) {
    case 1: return `
      <h2>İlanınızın Tipini Seçin</h2>
      <p class="adim-alt">Mülkünüzü satmak mı yoksa kiraya vermek mi istiyorsunuz?</p>
      <div class="sec-kartlar iki" id="skIlanTipi">
        <label class="sec-kart"><input type="radio" name="ilanTipi" value="satilik" ${sec("ilanTipi", "satilik")}><i class="fa-solid fa-tag"></i>Satılık</label>
        <label class="sec-kart"><input type="radio" name="ilanTipi" value="kiralik" ${sec("ilanTipi", "kiralik")}><i class="fa-solid fa-key"></i>Kiralık</label>
      </div>
      <h3>Emlak Tipi</h3>
      <div class="sec-kartlar bes" id="skEmlakTipi">
        ${Object.entries(EMLAK_TIPLERI).map(([k, v]) => `
          <label class="sec-kart"><input type="radio" name="emlakTipi" value="${k}" ${sec("emlakTipi", k)}><i class="fa-solid ${TIP_IKON[k]}"></i>${v}</label>`).join("")}
      </div>`;

    case 2: return `
      <h2>Konum Bilgileri</h2>
      <p class="adim-alt">Mülkünüzün bulunduğu adresi belirtin.</p>
      <div class="form-satir">
        <div class="form-alan">
          <label for="ivIl">İl <span class="zorunlu">*</span></label>
          <input type="text" id="ivIl" name="il" value="${val("il")}" placeholder="örn. İstanbul">
          <span class="hata-msg">İl bilgisi zorunludur.</span>
        </div>
        <div class="form-alan">
          <label for="ivIlce">İlçe <span class="zorunlu">*</span></label>
          <input type="text" id="ivIlce" name="ilce" value="${val("ilce")}" placeholder="örn. Kadıköy">
          <span class="hata-msg">İlçe bilgisi zorunludur.</span>
        </div>
      </div>
      <div class="form-alan">
        <label for="ivMahalle">Mahalle <span class="zorunlu">*</span></label>
        <input type="text" id="ivMahalle" name="mahalle" value="${val("mahalle")}" placeholder="örn. Caferağa">
        <span class="hata-msg">Mahalle bilgisi zorunludur.</span>
      </div>
      <div class="form-alan">
        <label for="ivAdres">Açık Adres</label>
        <textarea id="ivAdres" name="adres" placeholder="Cadde, sokak, bina no... (ilanda gösterilmez)">${val("adres")}</textarea>
      </div>`;

    case 3: {
      const arsa = d.emlakTipi === "arsa";
      const OZELLIK_SECENEKLERI = ["Balkon", "Otopark", "Asansör", "Site İçinde", "Eşyalı", "Güvenlik", "Bahçe", "Deniz Manzarası", "Akıllı Ev"];
      return `
      <h2>Emlak Detayları</h2>
      <p class="adim-alt">Mülkünüzün temel özelliklerini girin.</p>
      <div class="form-satir">
        ${arsa ? "" : `
        <div class="form-alan">
          <label for="ivOda">Oda Sayısı <span class="zorunlu">*</span></label>
          <select id="ivOda" name="oda">
            <option value="">Seçin</option>
            ${["1+0", "1+1", "2+1", "3+1", "4+1", "5+1", "5+2 ve üzeri"].map((o) => `<option ${d.oda === o ? "selected" : ""}>${o}</option>`).join("")}
          </select>
          <span class="hata-msg">Oda sayısı seçin.</span>
        </div>`}
        <div class="form-alan">
          <label for="ivMetrekare">Metrekare (m²) <span class="zorunlu">*</span></label>
          <input type="number" id="ivMetrekare" name="metrekare" min="1" value="${val("metrekare")}" placeholder="örn. 120">
          <span class="hata-msg">Geçerli bir metrekare girin.</span>
        </div>
      </div>
      ${arsa ? "" : `
      <div class="form-satir">
        <div class="form-alan">
          <label for="ivKat">Bulunduğu Kat</label>
          <input type="text" id="ivKat" name="kat" value="${val("kat")}" placeholder="örn. 3. Kat / Dubleks">
        </div>
        <div class="form-alan">
          <label for="ivBinaYasi">Bina Yaşı</label>
          <input type="number" id="ivBinaYasi" name="binaYasi" min="0" value="${val("binaYasi")}" placeholder="örn. 5">
        </div>
      </div>`}
      <h3>Ek Özellikler</h3>
      <div class="onay-kutulari">
        ${OZELLIK_SECENEKLERI.map((o) => `
          <label><input type="checkbox" name="ozellik" value="${o}" ${d.ozellikler.includes(o) ? "checked" : ""}>${o}</label>`).join("")}
      </div>`;
    }

    case 4: return `
      <h2>Fiyat & Açıklama</h2>
      <p class="adim-alt">Doğru fiyat, ilanınızın hızla sonuçlanmasını sağlar.</p>
      <div class="form-alan">
        <label for="ivBaslik">İlan Başlığı <span class="zorunlu">*</span></label>
        <input type="text" id="ivBaslik" name="baslik" value="${val("baslik")}" placeholder="örn. Caferağa'da Yenilenmiş 3+1 Daire" maxlength="80">
        <span class="hata-msg">En az 10 karakterlik bir başlık girin.</span>
      </div>
      <div class="form-alan">
        <label for="ivFiyat">Fiyat (₺) ${ilanFormu.veri.ilanTipi === "kiralik" ? "— aylık" : ""} <span class="zorunlu">*</span></label>
        <input type="number" id="ivFiyat" name="fiyat" min="1" value="${val("fiyat")}" placeholder="örn. 5500000">
        <span class="hata-msg">Geçerli bir fiyat girin.</span>
      </div>
      <div class="form-alan">
        <label for="ivAciklama">Açıklama <span class="zorunlu">*</span></label>
        <textarea id="ivAciklama" name="aciklama" placeholder="Mülkünüzü en az 30 karakterle tanıtın...">${val("aciklama")}</textarea>
        <span class="hata-msg">En az 30 karakterlik bir açıklama yazın.</span>
      </div>`;

    case 5: return `
      <h2>Fotoğraflar</h2>
      <p class="adim-alt">En az 1 fotoğraf ekleyin. İlk fotoğraf kapak görseli olur.</p>
      <div class="dropzone" id="dropzone" role="button" tabindex="0" aria-label="Fotoğraf yüklemek için tıklayın veya sürükleyin">
        <i class="fa-solid fa-cloud-arrow-up"></i>
        <p>Fotoğrafları buraya sürükleyip bırakın<br>veya <span>bilgisayarınızdan seçin</span></p>
      </div>
      <input type="file" id="fotoInput" accept="image/*" multiple hidden>
      <div class="foto-onizleme" id="fotoOnizleme"></div>`;

    case 6: {
      const v = ilanFormu.veri;
      return `
      <h2>İletişim & Önizleme</h2>
      <p class="adim-alt">Son bir kontrol edin, iletişim bilgilerinizi bırakın.</p>
      <div class="onizleme-kutu">
        <h3 style="margin-top:0">İlan Önizlemesi</h3>
        <div class="onizleme-ozet">
          <div class="o-foto">${v.fotolar.length ? `<img src="${v.fotolar[0]}" alt="Kapak fotoğrafı">` : '<i class="fa-regular fa-image fa-2x"></i>'}</div>
          <div>
            <span class="badge ${v.ilanTipi}">${ilanTipiAd(v.ilanTipi)}</span>
            <span class="badge one">${EMLAK_TIPLERI[v.emlakTipi]}</span>
            <h3 style="margin:8px 0 4px">${v.baslik || "—"}</h3>
            <p class="o-detay"><i class="fa-solid fa-location-dot"></i> ${[v.mahalle, v.ilce, v.il].filter(Boolean).join(", ")} ${v.oda ? "• " + v.oda : ""} • ${fmtSayi(Number(v.metrekare) || 0)} m²</p>
            <p class="o-fiyat">${fmtSayi(Number(v.fiyat) || 0)} ₺${v.ilanTipi === "kiralik" ? "/ay" : ""}</p>
          </div>
        </div>
      </div>
      <div class="form-satir">
        <div class="form-alan">
          <label for="ivAd">Adınız Soyadınız <span class="zorunlu">*</span></label>
          <input type="text" id="ivAd" name="ad" value="${val("ad")}" autocomplete="name">
          <span class="hata-msg">Adınızı girin.</span>
        </div>
        <div class="form-alan">
          <label for="ivTel">Telefon <span class="zorunlu">*</span></label>
          <input type="tel" id="ivTel" name="telefon" value="${val("telefon")}" placeholder="05xx xxx xx xx" autocomplete="tel">
          <span class="hata-msg">Geçerli bir telefon numarası girin.</span>
        </div>
      </div>
      <div class="form-alan">
        <label for="ivEposta">E-posta <span class="zorunlu">*</span></label>
        <input type="email" id="ivEposta" name="eposta" value="${val("eposta")}" autocomplete="email">
        <span class="hata-msg">Geçerli bir e-posta adresi girin.</span>
      </div>`;
    }
  }
}

/* Adım arayüzünü çiz */
function adimCiz() {
  const n = ilanFormu.adim;
  $("#adimIcerik").innerHTML = adimSablonu(n);
  $("#progressBar").style.width = `${(n / 6) * 100}%`;

  $$("#adimlar .adim").forEach((a) => {
    const x = Number(a.dataset.adim);
    a.classList.toggle("aktif", x === n);
    a.classList.toggle("tamam", x < n);
    if (x < n) $(".nokta", a).innerHTML = '<i class="fa-solid fa-check"></i>';
    else $(".nokta", a).textContent = x;
  });

  $("#geriBtn").style.visibility = n === 1 ? "hidden" : "visible";
  $("#ileriBtn").innerHTML = n === 6
    ? '<i class="fa-solid fa-bullhorn"></i> İlanı Yayınla'
    : 'Devam Et <i class="fa-solid fa-arrow-right"></i>';

  if (n === 5) fotoAdimiBagla();
}

/* Mevcut adımın girdilerini topla */
function adimVerileriniTopla() {
  const d = ilanFormu.veri;
  $$("#adimIcerik [name]").forEach((el) => {
    if (el.type === "radio") { if (el.checked) d[el.name] = el.value; }
    else if (el.type === "checkbox") { /* aşağıda toplu işlenir */ }
    else if (el.type !== "file") { d[el.name] = el.value.trim(); }
  });
  if ($('#adimIcerik input[name="ozellik"]')) {
    d.ozellikler = $$('#adimIcerik input[name="ozellik"]:checked').map((c) => c.value);
  }
}

/* Adım doğrulama — hatalıysa false döner */
function adimDogrula(n) {
  const d = ilanFormu.veri;
  let ok = true;
  const isaretle = (sel, kosul) => {
    const el = $(sel);
    if (el) { el.closest(".form-alan").classList.toggle("hata", !kosul); }
    if (!kosul) ok = false;
  };

  if (n === 1) {
    const t1 = !!d.ilanTipi, t2 = !!d.emlakTipi;
    $("#skIlanTipi").classList.toggle("hata", !t1);
    $("#skEmlakTipi").classList.toggle("hata", !t2);
    ok = t1 && t2;
  }
  if (n === 2) {
    isaretle("#ivIl", d.il && d.il.length >= 2);
    isaretle("#ivIlce", d.ilce && d.ilce.length >= 2);
    isaretle("#ivMahalle", d.mahalle && d.mahalle.length >= 2);
  }
  if (n === 3) {
    if (d.emlakTipi !== "arsa") isaretle("#ivOda", !!d.oda);
    isaretle("#ivMetrekare", Number(d.metrekare) > 0);
  }
  if (n === 4) {
    isaretle("#ivBaslik", d.baslik && d.baslik.length >= 10);
    isaretle("#ivFiyat", Number(d.fiyat) > 0);
    isaretle("#ivAciklama", d.aciklama && d.aciklama.length >= 30);
  }
  if (n === 5) {
    const var_ = d.fotolar.length > 0;
    $("#dropzone").classList.toggle("hata", !var_);
    if (!var_) ok = false;
  }
  if (n === 6) {
    isaretle("#ivAd", d.ad && d.ad.length >= 3);
    isaretle("#ivTel", /^[0-9+()\s-]{10,}$/.test(d.telefon || ""));
    isaretle("#ivEposta", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.eposta || ""));
  }
  return ok;
}

/* İleri / geri geçiş */
function adimDegistir(yon) {
  adimVerileriniTopla();

  if (yon === 1) {
    if (!adimDogrula(ilanFormu.adim)) { toast("Lütfen işaretli alanları doldurun", "hata"); return; }
    if (ilanFormu.adim === 6) { ilanYayinla(); return; }
  }
  ilanFormu.adim = Math.min(6, Math.max(1, ilanFormu.adim + yon));
  adimCiz();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* Fotoğraf adımı: sürükle-bırak + dosya seçici */
function fotoAdimiBagla() {
  const dz = $("#dropzone"), input = $("#fotoInput");

  function fotolariCiz() {
    $("#fotoOnizleme").innerHTML = ilanFormu.veri.fotolar.map((f, x) => `
      <div class="foto-kutu">
        <img src="${f}" alt="Yüklenen fotoğraf ${x + 1}">
        <button type="button" class="foto-sil" data-sil="${x}" aria-label="Fotoğrafı kaldır"><i class="fa-solid fa-xmark"></i></button>
      </div>`).join("");
  }

  function dosyalariIsle(dosyalar) {
    [...dosyalar].filter((f) => f.type.startsWith("image/")).forEach((f) => {
      const okuyucu = new FileReader();
      okuyucu.onload = () => { ilanFormu.veri.fotolar.push(okuyucu.result); fotolariCiz(); };
      okuyucu.readAsDataURL(f);
    });
    dz.classList.remove("hata");
  }

  dz.addEventListener("click", () => input.click());
  dz.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
  input.addEventListener("change", () => { dosyalariIsle(input.files); input.value = ""; });

  ["dragover", "dragenter"].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add("surukle"); }));
  ["dragleave", "drop"].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove("surukle"); }));
  dz.addEventListener("drop", (e) => dosyalariIsle(e.dataTransfer.files));

  $("#fotoOnizleme").addEventListener("click", (e) => {
    const b = e.target.closest("[data-sil]");
    if (b) { ilanFormu.veri.fotolar.splice(Number(b.dataset.sil), 1); fotolariCiz(); }
  });

  fotolariCiz();
}

/* Başarılı gönderim ekranı */
function ilanYayinla() {
  $(".ilanver-kutu").innerHTML = `
    <div class="ilanver-form basari-ekrani">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle class="cember" cx="50" cy="50" r="46"></circle>
        <path class="tik" d="M30 52 L44 66 L72 38"></path>
      </svg>
      <h2>İlanınız Bize Ulaştı!</h2>
      <p>Teşekkürler! İlanınız ekibimiz tarafından incelenecek ve onaylandıktan sonra aynı gün içinde yayına alınacak. Gelişmeleri telefon ve e-posta ile bildireceğiz.</p>
      <div class="btnler">
        <a href="#/ilanlar" class="btn btn-altin"><i class="fa-solid fa-building"></i> İlanlara Göz At</a>
        <a href="#/ilan-ver" onclick="setTimeout(router)" class="btn btn-cizgili"><i class="fa-solid fa-plus"></i> Yeni İlan Ver</a>
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================================================
   HAKKIMIZDA
   ========================================================= */
function renderHakkimizda(app) {
  app.innerHTML = `
  <section class="sayfa-baslik">
    <div class="container">
      <h1>Hakkımızda</h1>
      <p>15 yıldır aynı heyecanla: doğru mülkü, doğru insanla buluşturuyoruz.</p>
    </div>
  </section>

  <section class="bolum">
    <div class="container hakkimizda-grid">
      <div class="hakkimizda-foto fade-in">
        <img src="${SITE.foto}" alt="${SITE.emlakci} — ${SITE.unvan}">
        <div class="deneyim-rozet"><b>15+</b>Yıl Deneyim</div>
      </div>
      <div class="hakkimizda-metin fade-in">
        <span class="ust-etiket">${SITE.firma}</span>
        <h2>Güvenin İnşa Edildiği Yer</h2>
        <p>2011 yılında Kadıköy'de küçük bir ofiste başlayan yolculuğumuz, bugün İstanbul ve çevre illerde binin üzerinde başarılı satış ve kiralama işlemine ulaştı. ${SITE.firma} olarak işimizin özünde tek bir şey var: <b>güven</b>.</p>
        <p>Her müşterimizin hikayesinin farklı olduğunu biliyoruz. Kimi ilk evini alıyor, kimi birikimini doğru yatırıma dönüştürmek istiyor. Bu yüzden önce dinliyor, sonra bölge verileriyle desteklenmiş dürüst bir yol haritası çiziyoruz.</p>
        <p>Tapu işlemlerinden kredi süreçlerine, ekspertizden teslim gününe kadar her adımda yanınızdayız. Çünkü bizim için bir satış, anahtar tesliminde değil; siz yeni evinizde ilk kahvenizi içtiğinizde tamamlanır.</p>
        <div class="imza">
          <b>${SITE.emlakci}</b>
          <span>${SITE.unvan} — Kurucu</span>
        </div>
      </div>
    </div>
  </section>

  <section class="bolum" style="padding-top:0">
    <div class="container">
      <div class="bolum-baslik fade-in">
        <span class="ust-etiket">Değerlerimiz</span>
        <h2>Bizi Biz Yapan İlkeler</h2>
      </div>
      <div class="degerler">
        <div class="ozellik-kart fade-in">
          <div class="ikon"><i class="fa-solid fa-handshake-angle"></i></div>
          <h3>Dürüstlük</h3>
          <p>Mülkün eksisini de artısını da açıkça söyleriz. Kısa vadeli kazanç için uzun vadeli güveni asla riske atmayız.</p>
        </div>
        <div class="ozellik-kart fade-in">
          <div class="ikon"><i class="fa-solid fa-magnifying-glass-chart"></i></div>
          <h3>Şeffaflık</h3>
          <p>Fiyat analizlerimizi gerçek bölge verileriyle yapar, her aşamada sizi belgeleriyle bilgilendiririz.</p>
        </div>
        <div class="ozellik-kart fade-in">
          <div class="ikon"><i class="fa-solid fa-heart"></i></div>
          <h3>Müşteri Odaklılık</h3>
          <p>Satış sonrası da telefonun ucundayız. Müşterilerimizin %70'i bize tavsiyeyle ulaşıyor; en büyük gururumuz bu.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="stats">
    <div class="container stats-grid">
      <div class="stat fade-in"><i class="fa-solid fa-face-smile"></i><span class="stat-sayi" data-hedef="500" data-ek="+">0</span><p>Mutlu Müşteri</p></div>
      <div class="stat fade-in"><i class="fa-solid fa-building"></i><span class="stat-sayi" data-hedef="1200" data-ek="+">0</span><p>Yayınlanan İlan</p></div>
      <div class="stat fade-in"><i class="fa-solid fa-medal"></i><span class="stat-sayi" data-hedef="15" data-ek="">0</span><p>Yıllık Deneyim</p></div>
      <div class="stat fade-in"><i class="fa-solid fa-handshake"></i><span class="stat-sayi" data-hedef="98" data-ek="%" data-on="1">0</span><p>Müşteri Memnuniyeti</p></div>
    </div>
  </section>`;

  sayaclariBaslat();
}

/* =========================================================
   İLETİŞİM
   ========================================================= */
function renderIletisim(app) {
  app.innerHTML = `
  <section class="sayfa-baslik">
    <div class="container">
      <h1>İletişim</h1>
      <p>Sorularınız için bize yazın ya da çekinmeden arayın — kahvemiz her zaman hazır.</p>
    </div>
  </section>

  <section class="iletisim-bolum">
    <div class="container">
      <div class="iletisim-grid">

        <div class="detay-kart fade-in">
          <h2 style="font-size:1.25rem;margin-bottom:18px"><i class="fa-solid fa-envelope" style="color:var(--altin)"></i> Bize Mesaj Gönderin</h2>
          <form id="iletisimForm" novalidate>
            <div class="form-satir">
              <div class="form-alan">
                <label for="ilAd">Adınız Soyadınız <span class="zorunlu">*</span></label>
                <input type="text" id="ilAd" name="ad" autocomplete="name">
                <span class="hata-msg">Lütfen adınızı girin.</span>
              </div>
              <div class="form-alan">
                <label for="ilTel">Telefon <span class="zorunlu">*</span></label>
                <input type="tel" id="ilTel" name="telefon" placeholder="05xx xxx xx xx" autocomplete="tel">
                <span class="hata-msg">Geçerli bir telefon girin.</span>
              </div>
            </div>
            <div class="form-alan">
              <label for="ilEposta">E-posta <span class="zorunlu">*</span></label>
              <input type="email" id="ilEposta" name="eposta" autocomplete="email">
              <span class="hata-msg">Geçerli bir e-posta adresi girin.</span>
            </div>
            <div class="form-alan">
              <label for="ilKonu">Konu</label>
              <select id="ilKonu" name="konu">
                <option>Satılık ilanlar hakkında</option>
                <option>Kiralık ilanlar hakkında</option>
                <option>Mülkümü satmak istiyorum</option>
                <option>Değerleme talebi</option>
                <option>Diğer</option>
              </select>
            </div>
            <div class="form-alan">
              <label for="ilMesaj">Mesajınız <span class="zorunlu">*</span></label>
              <textarea id="ilMesaj" name="mesaj" placeholder="Size nasıl yardımcı olabiliriz?"></textarea>
              <span class="hata-msg">En az 10 karakterlik bir mesaj yazın.</span>
            </div>
            <button type="submit" class="btn btn-altin tam"><i class="fa-solid fa-paper-plane"></i> Gönder</button>
          </form>
        </div>

        <div class="iletisim-bilgi">
          <div class="bilgi-satir fade-in">
            <div class="ikon"><i class="fa-solid fa-location-dot"></i></div>
            <div><h4>Ofis Adresi</h4><p>${SITE.adres}</p></div>
          </div>
          <div class="bilgi-satir fade-in">
            <div class="ikon"><i class="fa-solid fa-phone"></i></div>
            <div><h4>Telefon</h4><p><a href="${SITE.telefonHref}">${SITE.telefon}</a></p></div>
          </div>
          <div class="bilgi-satir fade-in">
            <div class="ikon"><i class="fa-brands fa-whatsapp"></i></div>
            <div><h4>WhatsApp</h4><p><a href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener">Hızlı mesaj için tıklayın</a></p></div>
          </div>
          <div class="bilgi-satir fade-in">
            <div class="ikon"><i class="fa-solid fa-envelope"></i></div>
            <div><h4>E-posta</h4><p><a href="mailto:${SITE.eposta}">${SITE.eposta}</a></p></div>
          </div>
          <div class="bilgi-satir fade-in">
            <div class="ikon"><i class="fa-regular fa-clock"></i></div>
            <div><h4>Çalışma Saatleri</h4><p>${SITE.saatler}</p></div>
          </div>
          <div class="bilgi-satir fade-in">
            <div class="ikon"><i class="fa-solid fa-share-nodes"></i></div>
            <div>
              <h4>Sosyal Medya</h4>
              <div class="sosyal" style="margin-top:9px">
                <a href="${SITE.sosyal.instagram}" target="_blank" rel="noopener" aria-label="Instagram" style="background:rgba(212,168,83,.13);color:var(--altin)"><i class="fa-brands fa-instagram"></i></a>
                <a href="${SITE.sosyal.facebook}" target="_blank" rel="noopener" aria-label="Facebook" style="background:rgba(212,168,83,.13);color:var(--altin)"><i class="fa-brands fa-facebook-f"></i></a>
                <a href="${SITE.sosyal.youtube}" target="_blank" rel="noopener" aria-label="YouTube" style="background:rgba(212,168,83,.13);color:var(--altin)"><i class="fa-brands fa-youtube"></i></a>
                <a href="${SITE.sosyal.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn" style="background:rgba(212,168,83,.13);color:var(--altin)"><i class="fa-brands fa-linkedin-in"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="detay-kart iletisim-harita fade-in">
        <h2 style="font-size:1.25rem;margin-bottom:18px"><i class="fa-solid fa-map-location-dot" style="color:var(--altin)"></i> Ofisimize Bekleriz</h2>
        <div class="harita">
          <iframe title="Aksoy Emlak ofis konumu" loading="lazy"
            src="https://maps.google.com/maps?q=${encodeURIComponent(SITE.adres)}&z=15&output=embed"></iframe>
        </div>
      </div>
    </div>
  </section>`;

  $("#iletisimForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    let ok = true;
    ok = alanKontrol(f.ad, f.ad.value.trim().length >= 3) && ok;
    ok = alanKontrol(f.telefon, /^[0-9+()\s-]{10,}$/.test(f.telefon.value.trim())) && ok;
    ok = alanKontrol(f.eposta, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.eposta.value.trim())) && ok;
    ok = alanKontrol(f.mesaj, f.mesaj.value.trim().length >= 10) && ok;
    if (!ok) { toast("Lütfen işaretli alanları kontrol edin", "hata"); return; }
    f.reset();
    toast("Mesajınız alındı! En geç 24 saat içinde dönüş yapacağız.");
  });
}

/* =========================================================
   404
   ========================================================= */
function render404(app) {
  app.innerHTML = `
  <section class="sayfa-404">
    <div>
      <div class="kod">404</div>
      <h1>Aradığınız Sayfa Bulunamadı</h1>
      <p>Bu adres taşınmış ya da hiç var olmamış olabilir. Tıpkı bazı hayallerdeki evler gibi... Ama merak etmeyin, gerçek olanları listeledik.</p>
      <a href="#/" class="btn btn-altin"><i class="fa-solid fa-house"></i> Ana Sayfaya Dön</a>
    </div>
  </section>`;
}

/* =========================================================
   GENEL OLAY BAĞLAMA & BAŞLATMA
   ========================================================= */

// Favori kalplerine global delegasyon (kart linklerinin içinde de çalışır)
document.addEventListener("click", (e) => {
  const fb = e.target.closest("[data-fav]");
  if (fb) { e.preventDefault(); e.stopPropagation(); favDegistir(Number(fb.dataset.fav)); }
});

// Tema değiştirici
$("#temaBtn").addEventListener("click", () => {
  tema = tema === "dark" ? "light" : "dark";
  store.set("ae_tema", tema);
  temaUygula(tema);
});

// Mobil menü
$("#menuBtn").addEventListener("click", () => {
  const acik = $("#nav").classList.toggle("acik");
  $("#menuBtn").setAttribute("aria-expanded", String(acik));
});

// Başa dön
$("#topBtn").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// Scroll: header durumu + başa dön görünürlüğü
window.addEventListener("scroll", headerDurumGuncelle, { passive: true });

// Footer yılı
$("#yil").textContent = new Date().getFullYear();

// Başlat
temaUygula(tema);
window.addEventListener("hashchange", router);
router();
