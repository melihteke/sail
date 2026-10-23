# Yeni seyir logu ekleme

## 1. GPX'i indir

Strava → aktivite → `⋯` → **Export GPX**. Diğer uygulamalar (Navionics, Garmin vb.) da olur, yeter
ki GPX'te zaman damgalı track noktaları bulunsun.

## 2. Seyir klasörünü oluştur

Workspace klasöründe:

```powershell
npm run new-sail -- "C:\Users\melihteke\Downloads\Afternoon_Sail.gpx" "Windy afternoon on the Poel"
```

Başlık verilmezse GPX'teki aktivite adı kullanılır. Tarih GPX'ten alınır (Amsterdam saati).
Komut şunu oluşturur:

```text
src/content/sails/2026-10-25-windy-afternoon-on-the-poel/
  index.md     ← notlar ve bilgiler
  track.gpx    ← GPX'in kopyası
```

## 3. Fotoğraf, video ve YouTube ekle (isteğe bağlı)

Üçü de **opsiyonel**: istersen hiçbirini, istersen birini ya da hepsini ekle. Hiç medya yoksa seyir
sayfasında galeri bölümü görünmez.

### 3a. Fotoğraf ve video

Telefondan geldiği gibi bırak; dönüştürmeyi script yapar.

| Kaynak | Fotoğraf | Video |
| --- | --- | --- |
| iCloud (iPhone) | `.HEIC`, `.JPG` | `.MOV` (HEVC, HDR olabilir) |
| WhatsApp | `.jpg` | `.mp4` |
| Diğer | `.png`, `.webp`, `.avif` | `.m4v`, `.3gp`, `.webm`, `.mkv`, `.avi` |

**a) Inbox ile (önerilen):** dosyaları workspace'teki `inbox/` klasörüne at (yoksa oluştur), sonra:

```powershell
npm run add-media -- 2026-10-25
```

Seyir adının bir parçası yeterli (`2026-10-25`, `windy-afternoon` gibi). İşlenen orijinaller
`inbox/processed/<seyir>/` klasörüne taşınır. `inbox/` git'e girmez.

**b) Dosyaları doğrudan vererek:**

```powershell
npm run add-media -- 2026-10-25 "C:\Users\melihteke\Downloads\IMG_4821.MOV" "C:\Users\melihteke\Downloads\IMG-20261025-WA0003.jpg"
```

Script ne yapar:

- **Fotoğraf:** HEIC dahil hepsini JPG'ye çevirir, uzun kenarı en fazla 2400 px yapar, yönünü düzeltir
  ve **EXIF/GPS bilgilerini siler** → `photos/`
- **Video:** her tarayıcıda oynayan **H.264 MP4**'e çevirir. Uzun kenar en fazla 1280 px (720p),
  kare hızı en fazla 30 fps olur; iPhone **HDR** videoların renkleri düzeltilir (SDR), dikey
  videolar dik kalır, konum metadatası silinir ve bir kapak görseli (poster) üretilir → `videos/`
- Dosyaları **çekim zamanına göre** sıralar ve numaralar (`01-…`, `02-…`). Sırasıyla EXIF tarihine,
  video oluşturma tarihine, WhatsApp dosya adındaki tarihe ve en son dosya tarihine bakar. Böylece
  iCloud ve WhatsApp dosyaları doğru sırada karışık durur.

Seçenekler:

- `--mute`: videoların sesini kaldırır (rüzgar uğultusu için)
- `--max-seconds 30`: videoları ilk 30 saniyeyle sınırlar

Video ipuçları:

- Kısa tut (≈ 1 dakikaya kadar). 720p'de 1 dakika ≈ 5–10 MB. Sonuç 50 MB'ı geçerse uyarı verir;
  GitHub'ın 100 MB sınırına yaklaşırsa dosyayı oluşturmaz.
- iCloud'dan indirirken **"Unmodified Original"** (değiştirilmemiş orijinal) de, **"Most
  Compatible"** de olur. WhatsApp'ın kendi sıkıştırması kaliteyi düşürür; mümkünse iCloud'dan al.

### 3b. YouTube linki

Dosya gerekmez; `index.md`'ye linki yazman yeterli (adım 4'teki `youtube:` alanı). Desteklenen
biçimler:

```text
https://www.youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
https://youtu.be/VIDEO_ID?t=1m30s       ← belirtilen saniyeden başlar
https://www.youtube.com/shorts/VIDEO_ID ← dikey gösterilir
```

- YouTube videoları galerinin başında büyük kare olarak görünür.
- Sayfa açılınca sadece küçük resim yüklenir; oynatıcı tıklanınca açılır. Bu, sayfayı hızlı tutar ve
  gizlilik için `youtube-nocookie.com` kullanır.
- Video YouTube'da **Public** ya da **Unlisted** (liste dışı) olmalı; **Private** videolar oynamaz.
  Kişisel seyir videoları için Unlisted iyi bir seçenek.
- Link hatalıysa `npm run build` hangi satırda sorun olduğunu söyler.

## 4. `index.md`'yi doldur

```yaml
---
title: "Windy afternoon on the Poel"
date: 2026-10-25
gpx: track.gpx
location: De Poel, Amstelveen
summary: Tek cümlelik özet (kartlarda görünür).
boat: Polyvalk
crew: [Ayşe, Can]
role: helm          # skipper | helm | crew | trimmer | student
rating: 4           # 1-5 yıldız
sails: Main + jib
reef: true
tags: [gusty, reefing]
# cover: ./photos/03-img_4822.jpg   # boşsa ilk fotoğraf kapak olur
captions:            # isteğe bağlı; dosya adları photos/ ve videos/ içindeki gibi
  01-img-20261025-wa0001.jpg: Rifli çıkış
  04-img_4821.mp4: Rüzgarda kavança
youtube:             # isteğe bağlı; sadece link ya da link + altyazı
  - https://youtu.be/VIDEO_ID
  - url: https://www.youtube.com/watch?v=VIDEO_ID&t=1m30s
    caption: Düzenlenmiş seyir videosu
draft: false        # yayınlamak için false yap
---

## How it went

## What I practised

## Learnings
```

- `photos/` ve `videos/` klasörlerindeki her şey **otomatik** galeriye eklenir; listelemen gerekmez.
  Bir medyayı kaldırmak için dosyasını sil (videoda `.mp4` ile aynı adlı `.jpg` posteri de).
- `draft: true` kaldığı sürece seyir yalnızca lokalde (`npm run dev`) görünür, canlı sitede çıkmaz.
- Mesafe, süre, hız, harita ve rüzgar **otomatik** hesaplanır; elle girilmez.

## 5. Lokalde kontrol et

```powershell
npm run dev
```

<http://localhost:4321/logbook> adresinde yeni seyri kontrol et. Kapatmak için terminalde `Ctrl + C`.

İstersen yayından önce tam build ile hata kontrolü yap:

```powershell
npm run build
```

## 6. Yayınla

```powershell
git add -A
git commit -m "Log: windy afternoon on the Poel"
git push
```

GitHub Actions siteyi build edip birkaç dakika içinde <https://sail.mteke.com> adresine yayınlar.
Durumu repo → **Actions** sekmesinden izleyebilirsin. Ana sayfadaki istatistikler ve heatmap de
otomatik güncellenir.

## Notlar

- **Rüzgar verisi:** seyirden 3 gün sonra Open-Meteo verisi kesinleşir. O tarihten sonra lokalde
  `npm run build` çalıştırırsan veri `src/data/wind-cache.json` dosyasına kaydedilir; bu dosyayı da
  commit et. Yapmazsan sorun olmaz, GitHub her build'de veriyi yeniden çeker.
- **Seyri gizlemek:** `draft: true` yapıp push et.
- **Seyri silmek:** seyir klasörünü sil, ardından commit ve push et.
- **Başka bir göl veya teknede:** `location` ve `boat` alanlarını değiştirmen yeterli.
