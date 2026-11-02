# Yeni seyir logu ekleme

Seyirler artık **admin panelinden** ekleniyor: <https://sail.mteke.com/admin/>
(İlk kurulum için [docs/SETUP.md](docs/SETUP.md).)

## 1. GPX'i al

Upwind, Strava, Garmin, Navionics gibi uygulamalardan seyri **GPX** olarak export et (Strava: aktivite → `⋯` →
**Export GPX**). Zaman damgalı track noktaları olan her GPX olur.

## 2. Giriş yap ve "New sail"

1. <https://sail.mteke.com/admin/> → **Sign in with Google** (melihteke@gmail.com).
2. **New sail** → GPX dosyasını kutuya sürükle (ya da tıklayıp seç).
3. Birkaç saniye içinde önizleme gelir: harita, mesafe, süre, hız, o saatlerin rüzgarı, tack/jibe sayısı ve
   en çok hangi seyir yönünde gittiğin. Başlık, tarih, konum ve tekne otomatik önerilir; istersen değiştir.
4. **Create draft & continue** → seyir taslak olarak kaydedilir ve editör açılır.

## 3. Bilgileri ve hikâyeyi doldur

- **Basics:** başlık, tarih, konum, **tekne** (listeden seç), rolün, tek cümlelik özet, crew, yelkenler, etiketler,
  puan (yıldız), rif.
- **Story:** dört ayrı alan: **How it went**, **What I practised**, **Learnings**, **Notes**. Markdown destekli
  (`**kalın**`, `- liste`, `[link](https://…)`); **Preview** ile nasıl görüneceğine bak. Boş bıraktığın alan sitede
  görünmez.
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
  <https://sail.mteke.com> adresinde görünür.
- Yayındaki bir seyri sonradan düzenlersen üstteki çubukta "N changes not live yet" yazar; **Deploy site** ile
  canlıya al.
- **Unpublish** seyri siteden kaldırır (taslak olarak kalır). **Delete sail** her şeyi (track ve medya dahil) siler.

## Tekne eklemek

Admin → **Boats** → **New boat**: ad, model, açıklama, fotoğraf (başkasının fotoğrafıysa kredi/lisans alanlarını
doldur), özellik tablosu. "Main boat" işaretli tekne yeni seyirlerde otomatik seçilir. Teknenin sitedeki sayfası:
`/boats/<slug>`; orada o teknede yaptığın toplam mil ve seyirler listelenir.

## Notlar

- **Rüzgar** seyir anında Open-Meteo'dan çekilir. Seyirden hemen sonra (aynı gün) eklersen veri henüz kesinleşmemiş
  olabilir; birkaç gün sonra editördeki **Refresh wind** ile güncelle.
- **Tack/jibe ve seyir yönleri** GPS rotası ile saatlik model rüzgarından hesaplanan **tahminlerdir**.
- Supabase ücretsiz planı 7 gün hiç kullanılmazsa uyur: site çalışmaya devam eder, sadece admin paneli için
  Supabase dashboard'dan **Restore** demen gerekir.
- Track'i değiştirmek için editördeki **Track** bölümüne yeni GPX bırak (istatistikler, rüzgar ve analiz yeniden
  hesaplanır).
