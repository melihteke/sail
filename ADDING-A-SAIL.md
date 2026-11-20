# Yeni seyir logu ekleme

Seyirler **admin panelinden** ekleniyor: <https://sail.mteke.com/admin/>
(İlk kurulum için [docs/SETUP.md](docs/SETUP.md).) **Her alan isteğe bağlıdır** ve otomatik kaydedilir; istediğin
zaman geri dönüp ekleyebilir ya da değiştirebilirsin.

## 1. Giriş yap ve "New sail"

1. <https://sail.mteke.com/admin/> → **Sign in with Google** (melihteke@gmail.com).
2. **Logbook** sekmesinde **New sail** → bugünün tarihi ve ana teknenle bir taslak hemen açılır. GPX, fotoğraf ya da
   başka bir şey girmen gerekmez.

## 2. GPX (isteğe bağlı)

Upwind, Strava, Garmin, Navionics gibi bir uygulamada kaydın varsa **GPX** olarak export et (Strava: aktivite → `⋯`
→ **Export GPX**) ve editördeki **Track** kartına bırak: harita, mesafe, süre, hız, o saatlerin rüzgarı ve tack/jibe
sayısı hesaplanır. İlk GPX tarihi düzeltir ve başlık boşsa bir başlık önerir.

GPX yoksa aynı kartta **mesafeyi (nm)** ve **süreyi (saat)** elle girebilirsin. Seyir sitede haritasız görünür; bu
değerler toplamlara ve logbook dökümüne girer.

## 3. Bilgileri ve hikâyeyi doldur

Sağ üstteki **Quick / Detailed** anahtarı formu sadeleştirir ya da tüm alanları açar (tercih tarayıcıda hatırlanır).
Sağdaki **Log entry** listesi neyin eksik olduğunu gösterir; sadece yol gösterir, yayınlamayı engellemez.

- **Basics:** başlık, tarih, konum, **tekne** (listeden seç), rolün, tek cümlelik özet, crew, yelkenler, rif.
  Detailed modda ayrıca etiketler ve puan (yıldız).
- **Logbook:** seyir türü (day sail, passage, training…), kalkış → varış, **gözlenen** rüzgar (Beaufort) ve deniz
  durumu, gelgitli su. Detailed modda: skipper, görüş, **gece saatleri** (track ve gün batımı/doğumundan önerilir,
  "Use … h" ile kabul et) ve **motor süresi** (boş bırakırsan olay günlüğünden hesaplanır). Bu alanlar seyir
  sayfasında "Log" kutusunda görünür.
- **Story:** **How it went**, **What I practised**, **Learnings** (Detailed modda **Notes** da). Markdown destekli
  (`**kalın**`, `- liste`, `[link](https://…)`); **Preview** ile nasıl görüneceğine bak. Boş bıraktığın alan sitede
  görünmez.
- **Private notes 🔒:** sadece senin görebildiğin notlar ve tekne/ekipman sorunları. **Asla yayınlanmaz**, sitenin
  build'ine de girmez.
- **Event log:** motor, yelken, rif, not, hava gibi olayları ekle, düzelt ya da sil. Sail Tracker'dan gelen bir logu
  düzenledikten sonra app tekrar upload etse bile senin düzeltmelerin korunur.
- **History:** her düzenleme oturumunun öncesi saklanır (son 50). **Restore** ile eski sürüme dön; o anki sürüm de
  geçmişe kaydedilir, yani geri alınabilir.
- Her şey **otomatik kaydedilir** (sağ üstte "All changes saved").

## 4. Medya (hepsi isteğe bağlı)

- **Foto / video:** kutuya sürükle. iPhone **HEIC**, JPG, PNG fotoğraflar otomatik JPG'ye çevrilir, küçültülür ve
  **konum (GPS) bilgisi silinir**. Videolar **50 MB**'a kadar; **MP4** her tarayıcıda oynar (iPhone `.mov` bazı
  tarayıcılarda oynamayabilir, panel uyarır). Uzun videolar için YouTube'u kullan.
- **YouTube:** linki yapıştır (`youtu.be/…`, `watch?v=…`, Shorts; `?t=90` başlangıç saniyesi). Video YouTube'da
  **Public** ya da **Unlisted** olmalı.
- **Link:** örneğin Google Photos albümü.
- Her öğeye altyazı yazabilir, oklarla sıralayabilir, ★ ile **kapak** seçebilirsin. Kapak seçmezsen kartlarda rota
  haritası görünür.

## 5. Yayınla

- **Publish** → seyir yayınlanır ve site otomatik yeniden build edilir; **~2 dakika** sonra
  <https://sail.mteke.com> adresinde görünür. Eksik alan varsa önce hangileri olduğu sorulur; istersen yine yayınla.
- Üstteki çubuk build'i takip eder: başarılıysa "The site is live", başarısızsa GitHub linki ve **Retry** çıkar.
  Build başarısız olsa bile kaydın kaybolmaz.
- Yayındaki bir seyri sonradan düzenlersen üstteki çubukta "N changes not live yet" yazar; **Deploy site** ile
  canlıya al.
- **Unpublish** seyri siteden kaldırır (taslak olarak kalır). **Delete sail** her şeyi (track ve medya dahil) siler.

## Logbook listesi ve dökümü

Admin → **Logbook** hem seyir listesi hem seyir defteridir: arama kutusu, toplamlar (seyir, gün, mil, saat, gece
saati, gelgit / skipper) ve seyirler. Bir satıra tıklayınca editör açılır. **Filters & export** altında tarih, tekne,
tür ve duruma göre filtrele; **Print / PDF** tüm logbook sütunlarıyla yazdırır (A4 yatay), **CSV** Excel'e aktarır.
"Include private notes" işaretlersen özel notlar da eklenir; bu dosyayı paylaşırken dikkat et.

## Tekne eklemek

Admin → **Boats** → **New boat**: "New boat" adında bir tekne hemen açılır. Ad, model, açıklama, fotoğraf (başkasının
fotoğrafıysa kredi/lisans alanlarını doldur) ve özellik tablosu **isteğe bağlıdır**, otomatik kaydedilir. İlk gerçek
ad girildiğinde sayfa adresi de (`/boats/<slug>`) ona göre ayarlanır. "Main boat" işaretli tekne yeni seyirlerde
otomatik seçilir; teknenin sayfasında o teknede yaptığın toplam mil ve seyirler listelenir.

## Notlar

- **Rüzgar** seyir anında Open-Meteo'dan çekilir. Seyirden hemen sonra (aynı gün) eklersen veri henüz kesinleşmemiş
  olabilir; birkaç gün sonra editördeki **Refresh wind** ile güncelle.
- **Tack/jibe ve seyir yönleri** GPS rotası ile saatlik model rüzgarından hesaplanan **tahminlerdir**.
- Supabase ücretsiz planı 7 gün hiç kullanılmazsa uyur: site çalışmaya devam eder, sadece admin paneli için
  Supabase dashboard'dan **Restore** demen gerekir.
- Track'i değiştirmek için editördeki **Track** bölümüne yeni GPX bırak (istatistikler, rüzgar ve analiz yeniden
  hesaplanır).

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.2 | 2026-11-20 | Melih Teke | New sail/New boat tek tıkla açılıyor, her alan isteğe bağlı; GPX'siz seyir (elle mesafe/süre); Sails ve Logbook tek sekmede. |
| 1.1 | 2026-11-20 | Melih Teke | Logbook alanları, özel notlar, olay günlüğü düzenleme, geçmiş, Quick/Detailed mod, Logbook dökümü ve deploy takibi eklendi. |
