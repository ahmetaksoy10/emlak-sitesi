/* =========================================================
   MOCK VERİLER
   Not: Tasarım/test aşaması için hazırlanmıştır. Canlıya
   geçişte bu veriler bir API / servis katmanından gelmelidir.
   ========================================================= */

// Firma & danışman bilgileri (tek noktadan yönetim)
const SITE = {
  firma: "Aksoy Emlak",
  emlakci: "Ahmet Aksoy",
  unvan: "Gayrimenkul Danışmanı",
  telefon: "0532 123 45 67",
  telefonHref: "tel:+905321234567",
  whatsapp: "905321234567",
  eposta: "ornek@eposta.com",
  adres: "Bağdat Cad. No:142/3, Kadıköy / İstanbul",
  saatler: "Pazartesi – Cumartesi 09:00 – 19:00",
  slogan: "Hayalinizdeki Eve Kavuşun",
  foto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80",
  sosyal: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    youtube: "https://youtube.com/",
    linkedin: "https://linkedin.com/"
  }
};

// Görsel yardımcı — Unsplash parametreleri
const u = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

/*
  İlan alanları:
  id, baslik, ilanTipi (satilik|kiralik), emlakTipi (daire|villa|arsa|isyeri|mustakil),
  fiyat, sehir, ilce, mahalle, adres, odaSayisi, banyoSayisi, metrekare, kat, binaYasi,
  isitma, balkon, otopark, asansor, siteIci, esyali, kullanimDurumu,
  ozellikler[], aciklama, fotograflar[], tarih, oneCikan
  (Arsa gibi tiplerde anlamsız alanlar null bırakılır, arayüzde gizlenir.)
*/
const ILANLAR = [
  {
    id: 1,
    baslik: "Caferağa'da Yenilenmiş, Adaya Manzaralı 3+1 Daire",
    ilanTipi: "satilik", emlakTipi: "daire", fiyat: 14500000,
    sehir: "İstanbul", ilce: "Kadıköy", mahalle: "Caferağa",
    adres: "Moda Cad. üzeri, denize 5 dk yürüme mesafesi",
    odaSayisi: "3+1", banyoSayisi: 2, metrekare: 145, kat: "4. Kat", binaYasi: 12,
    isitma: "Kombi (Doğalgaz)", balkon: true, otopark: false, asansor: true,
    siteIci: false, esyali: false, kullanimDurumu: "Boş",
    ozellikler: ["Balkon", "Asansör", "Ankastre Mutfak", "Ebeveyn Banyosu", "Deniz Manzarası", "Yerden Isıtma"],
    aciklama: "Moda sahiline yürüme mesafesinde, 2023 yılında komple yenilenmiş, ferah ve aydınlık bir daire. Geniş salonundan ada manzarası izleyebilir, Caferağa'nın kafe ve sanat dokusunun tam ortasında yaşayabilirsiniz. Tapu işlemleri için her şey hazır, krediye uygundur.",
    fotograflar: [u("1522708323590-d24dbb6b0267"), u("1586023492125-27b2c045efd7"), u("1556912173-3bb406ef7e77"), u("1540518614846-7eded433c457"), u("1600607687939-ce8a6c25118c")],
    tarih: "2026-06-02", oneCikan: true
  },
  {
    id: 2,
    baslik: "Ataşehir'de Site İçinde Geniş 2+1, Metroya Yakın",
    ilanTipi: "satilik", emlakTipi: "daire", fiyat: 7250000,
    sehir: "İstanbul", ilce: "Ataşehir", mahalle: "Barbaros",
    adres: "Finans Merkezi'ne 10 dk, metro istasyonuna 400 m",
    odaSayisi: "2+1", banyoSayisi: 1, metrekare: 105, kat: "7. Kat", binaYasi: 8,
    isitma: "Merkezi (Pay Ölçer)", balkon: true, otopark: true, asansor: true,
    siteIci: true, esyali: false, kullanimDurumu: "Kiracılı",
    ozellikler: ["Balkon", "Kapalı Otopark", "Asansör", "Site İçinde", "Güvenlik", "Yüzme Havuzu", "Spor Salonu"],
    aciklama: "Prestijli bir site içerisinde, güvenlikli ve sosyal olanakları zengin bir yaşam sunan 2+1 daire. İstanbul Finans Merkezi'ne ve metroya yakınlığı ile hem oturum hem yatırım için ideal. Mevcut kiracısı düzenli ödemeli olup yatırımcısına hazır gelir sunar.",
    fotograflar: [u("1560448204-e02f11c3d0e2"), u("1598928506311-c55ded91a20c"), u("1484154218962-a197022b5858"), u("1505693416388-ac5ce068fe85"), u("1560185007-cde436f6a4d0")],
    tarih: "2026-05-28", oneCikan: true
  },
  {
    id: 3,
    baslik: "Beşiktaş Merkezde Eşyalı 1+1, Boğaz'a 5 Dakika",
    ilanTipi: "kiralik", emlakTipi: "daire", fiyat: 45000,
    sehir: "İstanbul", ilce: "Beşiktaş", mahalle: "Sinanpaşa",
    adres: "Çarşıya ve sahile yürüme mesafesinde",
    odaSayisi: "1+1", banyoSayisi: 1, metrekare: 65, kat: "2. Kat", binaYasi: 18,
    isitma: "Kombi (Doğalgaz)", balkon: false, otopark: false, asansor: false,
    siteIci: false, esyali: true, kullanimDurumu: "Boş",
    ozellikler: ["Eşyalı", "Ankastre Mutfak", "Beyaz Eşya Dahil", "Klima"],
    aciklama: "Beşiktaş'ın kalbinde, tamamen eşyalı ve hemen taşınmaya hazır şık bir 1+1. Tüm beyaz eşyalar ve mobilyalar yenidir. Ulaşım ağının merkezinde olması sebebiyle özellikle çalışanlar ve öğrenciler için biçilmiş kaftan.",
    fotograflar: [u("1502672260266-1c1ef2d93688"), u("1493809842364-78817add7ffb"), u("1560184897-ae75f418493e"), u("1600210492486-724fe5c67fb0"), u("1560185127-6ed189bf02f4")],
    tarih: "2026-06-08", oneCikan: true
  },
  {
    id: 4,
    baslik: "Yalıkavak'ta Deniz Manzaralı, Havuzlu Ultra Lüks Villa",
    ilanTipi: "satilik", emlakTipi: "villa", fiyat: 65000000,
    sehir: "Muğla", ilce: "Bodrum", mahalle: "Yalıkavak",
    adres: "Marina'ya 5 dk, özel plaj erişimli site",
    odaSayisi: "5+2", banyoSayisi: 4, metrekare: 420, kat: "Tripleks", binaYasi: 3,
    isitma: "Yerden Isıtma + VRF Klima", balkon: true, otopark: true, asansor: false,
    siteIci: true, esyali: true, kullanimDurumu: "Boş",
    ozellikler: ["Özel Havuz", "Deniz Manzarası", "Akıllı Ev", "Bahçe", "Teras", "Kapalı Otopark", "Güvenlik", "Sauna", "Şömine"],
    aciklama: "Yalıkavak Marina'ya hakim konumda, kesintisiz deniz manzaralı, sonsuzluk havuzlu tripleks villa. Akıllı ev sistemleri, ithal mutfak ve özel peyzajlı bahçesiyle Bodrum'da lüksün yeni adresi. Mobilyaları ile birlikte satılıktır.",
    fotograflar: [u("1613490493576-7fde63acd811"), u("1600585154526-990dced4db0d"), u("1512917774080-9991f1c4c750"), u("1600607687939-ce8a6c25118c"), u("1576941089067-2de3c901e126")],
    tarih: "2026-05-15", oneCikan: true
  },
  {
    id: 5,
    baslik: "Döşemealtı'nda Yatırımlık 1.000 m² İmarlı Arsa",
    ilanTipi: "satilik", emlakTipi: "arsa", fiyat: 8500000,
    sehir: "Antalya", ilce: "Döşemealtı", mahalle: "Yeşilbayır",
    adres: "Ana yola 200 m cepheli, köşe parsel",
    odaSayisi: null, banyoSayisi: null, metrekare: 1000, kat: null, binaYasi: null,
    isitma: null, balkon: null, otopark: null, asansor: null,
    siteIci: null, esyali: null, kullanimDurumu: "Boş",
    ozellikler: ["Konut İmarlı", "Köşe Parsel", "Elektrik & Su Mevcut", "Tapulu", "%30 Taban Oturumu"],
    aciklama: "Antalya'nın en hızlı değerlenen bölgesi Döşemealtı'nda, villa imarlı köşe parsel. Elektrik ve su altyapısı parsel başındadır. Bölgedeki yeni projeler sayesinde kısa vadede ciddi değer artışı beklenmektedir.",
    fotograflar: [u("1500382017468-9049fed747ef"), u("1472214103451-9374bd1c798e"), u("1500076656116-558758c991c1"), u("1501785888041-af3ef285b470")],
    tarih: "2026-05-20", oneCikan: false
  },
  {
    id: 6,
    baslik: "Levent'te Plaza Katında Kiralık A+ Ofis (300 m²)",
    ilanTipi: "kiralik", emlakTipi: "isyeri", fiyat: 180000,
    sehir: "İstanbul", ilce: "Şişli", mahalle: "Levent",
    adres: "Büyükdere Cad. üzeri, metroya sıfır plaza",
    odaSayisi: null, banyoSayisi: 2, metrekare: 300, kat: "12. Kat", binaYasi: 10,
    isitma: "VRF Klima", balkon: null, otopark: true, asansor: true,
    siteIci: false, esyali: false, kullanimDurumu: "Boş",
    ozellikler: ["Boğaz Manzarası", "Jeneratör", "Kapalı Otopark", "7/24 Güvenlik", "Toplantı Odaları", "Resepsiyon Hizmeti"],
    aciklama: "Levent'in en prestijli plazalarından birinde, Boğaz manzaralı, bölme ofisleri hazır 300 m² kat ofisi. Metro çıkışına sıfır konumu ile çalışan ulaşımı sorunsuzdur. Kurumsal firmalar için temsil gücü yüksek bir adres.",
    fotograflar: [u("1497366754035-f200968a6e72"), u("1497366811353-6870744d04b2"), u("1524758631624-e2822e304c36"), u("1497215728101-856f4ea42174")],
    tarih: "2026-06-05", oneCikan: true
  },
  {
    id: 7,
    baslik: "Nilüfer'de Bahçeli Müstakil Ev, 4+1 Dubleks",
    ilanTipi: "satilik", emlakTipi: "mustakil", fiyat: 13750000,
    sehir: "Bursa", ilce: "Nilüfer", mahalle: "Görükle",
    adres: "Üniversiteye 10 dk, sakin villa bölgesi",
    odaSayisi: "4+1", banyoSayisi: 3, metrekare: 240, kat: "Dubleks", binaYasi: 6,
    isitma: "Kombi (Doğalgaz)", balkon: true, otopark: true, asansor: false,
    siteIci: false, esyali: false, kullanimDurumu: "Mülk Sahibi Oturuyor",
    ozellikler: ["Bahçe", "Barbekü Alanı", "Otopark", "Teras", "Şömine", "Giyinme Odası"],
    aciklama: "Bursa Nilüfer'in huzurlu dokusunda, 350 m² bahçe içerisinde özenle kullanılmış dubleks müstakil ev. Meyve ağaçlarıyla çevrili bahçesi ve geniş terası ile şehirden kopmadan doğayla iç içe bir yaşam sunar.",
    fotograflar: [u("1564013799919-ab600027ffc6"), u("1570129477492-45c003edd2be"), u("1583608205776-bfd35f0d9f83"), u("1598928506311-c55ded91a20c"), u("1556912173-3bb406ef7e77")],
    tarih: "2026-04-30", oneCikan: false
  },
  {
    id: 8,
    baslik: "Çankaya'da Bakanlıklara Yakın Kiralık 2+1",
    ilanTipi: "kiralik", emlakTipi: "daire", fiyat: 32000,
    sehir: "Ankara", ilce: "Çankaya", mahalle: "Kavaklıdere",
    adres: "Tunalı Hilmi Cad. yakını, elçilikler bölgesi",
    odaSayisi: "2+1", banyoSayisi: 1, metrekare: 110, kat: "3. Kat", binaYasi: 15,
    isitma: "Merkezi (Pay Ölçer)", balkon: true, otopark: false, asansor: true,
    siteIci: false, esyali: false, kullanimDurumu: "Boş",
    ozellikler: ["Balkon", "Asansör", "Güney Cephe", "Ankastre Mutfak"],
    aciklama: "Ankara'nın en merkezi noktalarından Kavaklıdere'de, güney cepheli ve gün boyu ışık alan geniş bir 2+1. Tunalı Hilmi'nin kafelerine ve alışveriş noktalarına yürüme mesafesindedir. Kurumsal kiracı tercih edilir.",
    fotograflar: [u("1598928506311-c55ded91a20c"), u("1502672260266-1c1ef2d93688"), u("1560184897-ae75f418493e"), u("1540518614846-7eded433c457")],
    tarih: "2026-06-01", oneCikan: false
  },
  {
    id: 9,
    baslik: "Karşıyaka Sahilde Körfez Manzaralı 4+1 Daire",
    ilanTipi: "satilik", emlakTipi: "daire", fiyat: 16900000,
    sehir: "İzmir", ilce: "Karşıyaka", mahalle: "Bostanlı",
    adres: "Sahil şeridine sıfır, vapur iskelesine 5 dk",
    odaSayisi: "4+1", banyoSayisi: 2, metrekare: 180, kat: "9. Kat", binaYasi: 5,
    isitma: "Yerden Isıtma", balkon: true, otopark: true, asansor: true,
    siteIci: true, esyali: false, kullanimDurumu: "Boş",
    ozellikler: ["Deniz Manzarası", "Geniş Balkon", "Kapalı Otopark", "Asansör", "Site İçinde", "Güvenlik", "Ebeveyn Banyosu"],
    aciklama: "Bostanlı sahilinde, salonundan kesintisiz körfez manzarası sunan yüksek katta 4+1 lüks daire. Gün batımını balkonunuzdan izleyebilir, sahil yürüyüş parkuruna asansörle inebilirsiniz. Sitede kapalı otopark ve 7/24 güvenlik mevcuttur.",
    fotograflar: [u("1600607687939-ce8a6c25118c"), u("1586023492125-27b2c045efd7"), u("1600210492486-724fe5c67fb0"), u("1505693416388-ac5ce068fe85"), u("1484154218962-a197022b5858")],
    tarih: "2026-05-25", oneCikan: true
  },
  {
    id: 10,
    baslik: "Sapanca'da Göl Manzaralı 4+1 Dağ Villası",
    ilanTipi: "satilik", emlakTipi: "villa", fiyat: 24500000,
    sehir: "Sakarya", ilce: "Sapanca", mahalle: "Kırkpınar",
    adres: "Göle 800 m, doğa içinde müstakil parsel",
    odaSayisi: "4+1", banyoSayisi: 3, metrekare: 260, kat: "Dubleks", binaYasi: 2,
    isitma: "Yerden Isıtma (Isı Pompası)", balkon: true, otopark: true, asansor: false,
    siteIci: false, esyali: true, kullanimDurumu: "Boş",
    ozellikler: ["Göl Manzarası", "Özel Havuz", "Bahçe", "Şömine", "Akıllı Ev", "Eşyalı", "Kamelya"],
    aciklama: "Sapanca Kırkpınar'da, çam ormanlarına komşu, göl manzaralı yepyeni bir dağ villası. Isı pompalı yerden ısıtması ile dört mevsim konforlu; hafta sonu kaçamakları için olduğu kadar sürekli yaşam için de idealdir. Eşyalı teslim edilecektir.",
    fotograflar: [u("1576941089067-2de3c901e126"), u("1598228723793-52759bba239c"), u("1600585154526-990dced4db0d"), u("1583608205776-bfd35f0d9f83"), u("1540518614846-7eded433c457")],
    tarih: "2026-05-10", oneCikan: false
  },
  {
    id: 11,
    baslik: "Bornova'da Üniversiteye Yakın Kiralık 3+1",
    ilanTipi: "kiralik", emlakTipi: "daire", fiyat: 35000,
    sehir: "İzmir", ilce: "Bornova", mahalle: "Kazımdirik",
    adres: "Ege Üniversitesi'ne 5 dk, metroya 300 m",
    odaSayisi: "3+1", banyoSayisi: 2, metrekare: 130, kat: "5. Kat", binaYasi: 9,
    isitma: "Kombi (Doğalgaz)", balkon: true, otopark: true, asansor: true,
    siteIci: true, esyali: false, kullanimDurumu: "Boş",
    ozellikler: ["Balkon", "Otopark", "Asansör", "Site İçinde", "Oyun Parkı", "Güvenlik"],
    aciklama: "Bornova'nın gelişen bölgesinde, site içerisinde ferah bir 3+1. Üniversiteye ve metroya yakınlığıyla aileler ve akademisyenler için çok uygun. Site içinde çocuk oyun alanı ve misafir otoparkı bulunur.",
    fotograflar: [u("1493809842364-78817add7ffb"), u("1560448204-e02f11c3d0e2"), u("1556912173-3bb406ef7e77"), u("1560185007-cde436f6a4d0")],
    tarih: "2026-06-07", oneCikan: false
  },
  {
    id: 12,
    baslik: "Kağıthane'de Yeni Binada Satılık 1+0 Stüdyo",
    ilanTipi: "satilik", emlakTipi: "daire", fiyat: 4150000,
    sehir: "İstanbul", ilce: "Kağıthane", mahalle: "Merkez",
    adres: "Metro istasyonuna 5 dk yürüme mesafesi",
    odaSayisi: "1+0", banyoSayisi: 1, metrekare: 48, kat: "6. Kat", binaYasi: 1,
    isitma: "Kombi (Doğalgaz)", balkon: false, otopark: true, asansor: true,
    siteIci: true, esyali: false, kullanimDurumu: "Boş",
    ozellikler: ["Sıfır Bina", "Kapalı Otopark", "Asansör", "Site İçinde", "Güvenlik", "Yüksek Kira Getirisi"],
    aciklama: "Kağıthane'nin dönüşen siluetinde, sıfır binada akıllıca tasarlanmış bir stüdyo daire. Metro bağlantısı sayesinde Levent ve Maslak'a dakikalar içinde ulaşılır. Yüksek kira getirisi ile yatırımcının ilk tercihi.",
    fotograflar: [u("1560185007-cde436f6a4d0"), u("1502672260266-1c1ef2d93688"), u("1560184897-ae75f418493e"), u("1560185127-6ed189bf02f4")],
    tarih: "2026-06-10", oneCikan: false
  },
  {
    id: 13,
    baslik: "Süleymanpaşa'da Denize Yakın İmarlı Arsa (650 m²)",
    ilanTipi: "satilik", emlakTipi: "arsa", fiyat: 3600000,
    sehir: "Tekirdağ", ilce: "Süleymanpaşa", mahalle: "Barbaros",
    adres: "Sahil yoluna 600 m, villa bölgesi",
    odaSayisi: null, banyoSayisi: null, metrekare: 650, kat: null, binaYasi: null,
    isitma: null, balkon: null, otopark: null, asansor: null,
    siteIci: null, esyali: null, kullanimDurumu: "Boş",
    ozellikler: ["Villa İmarlı", "Deniz Tarafı", "Yolu Açık", "Tapulu", "Takas Değerlendirilebilir"],
    aciklama: "Tekirdağ Barbaros'ta, denize yürüme mesafesinde villa imarlı arsa. Çevresi yapılaşmış olup elektrik, su ve yol altyapısı tamamdır. İstanbul'a yakınlığı ile hem yazlık hem yatırım amaçlı değerlendirilebilir.",
    fotograflar: [u("1466692476868-aef1dfb1e735"), u("1500076656116-558758c991c1"), u("1472214103451-9374bd1c798e"), u("1500382017468-9049fed747ef")],
    tarih: "2026-04-18", oneCikan: false
  },
  {
    id: 14,
    baslik: "Konyaaltı'nda Bahçeli Kiralık Müstakil Ev 3+1",
    ilanTipi: "kiralik", emlakTipi: "mustakil", fiyat: 55000,
    sehir: "Antalya", ilce: "Konyaaltı", mahalle: "Hurma",
    adres: "Plaja 10 dk, sakin müstakil bölge",
    odaSayisi: "3+1", banyoSayisi: 2, metrekare: 160, kat: "Tek Kat", binaYasi: 7,
    isitma: "Klima (Multi Split)", balkon: true, otopark: true, asansor: false,
    siteIci: false, esyali: true, kullanimDurumu: "Boş",
    ozellikler: ["Bahçe", "Eşyalı", "Otopark", "Barbekü Alanı", "Klima", "Evcil Hayvan Dostu"],
    aciklama: "Konyaaltı Hurma'da, portakal ağaçlı bahçesiyle tek katlı eşyalı müstakil ev. Plaja bisikletle 10 dakika mesafede, evcil hayvan dostu nadir kiralıklardan. Uzun dönem kiracı tercih edilmektedir.",
    fotograflar: [u("1449844908441-8829872d2607"), u("1494526585095-c41746248156"), u("1598928506311-c55ded91a20c"), u("1484154218962-a197022b5858")],
    tarih: "2026-06-04", oneCikan: true
  }
];
