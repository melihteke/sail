import type { AlmanacText } from './text'
import { uiTr } from './ui.tr'

export const almanacTr: AlmanacText = {
  title: 'Almanakla uçtan uca seyir planlama',
  intro:
    'Almanakla RYA Day Skipper usulü eksiksiz bir seyir planı: HW ve LW değerleri, derinlik kapıları, gelgit akıntıları ve akıntılar, kalkış saati, waypointler ve Course to Steer.',
  chapters: {
    start: {
      title: 'Başlarken: almanak nedir, bu derste ne yapacağız?',
      short: 'Başlarken',
      sections: [
        {
          h: 'Almanak = denizcinin el kitabı',
          blocks: [
            {
              p: 'Almanak, bir kıyı bölgesinde seyir için gereken bilgileri tek kitapta toplar: limanların **gelgit tabloları**, **gelgit akıntıları** (akıntı atlası ve gelgit elmasları), liman ve yanaşma notları, fenerler, VHF kanalları ve hava tahmini yayınları. RYA Day Skipper teori kursunda bu bilgiler **kurgusal bir bölge** üzerinden çalışılır; sınav soruları da o eğitim haritası ve almanağıyla çözülür.',
            },
            {
              p: 'Biz de aynı mantıkla kendi kurgusal bölgemizi oluşturduk: **Saltmere Sound**. İçinde iki liman var: **Port Halyard** (standart liman) ve **Gannet Cove** (ikincil liman, girişinde kuruyan bir bar var). Bütün tablolar, akıntılar ve konumlar bu ders için uyduruldu.',
            },
            { warn: 'Bu bölge ve bütün veriler hayalidir. Gerçek seyirde mutlaka resmî ve güncel harita ile almanak kullan.' },
          ],
        },
        {
          h: 'Senaryo',
          blocks: [
            {
              ex: {
                title: 'Görevimiz',
                lines: [
                  'Tarih: **13 Haziran Cumartesi** (yaz saati: yerel = UT + 1).',
                  'Tekne: **Aurora**, 9,8 m, su çekimi (draft) **1,8 m**, seyir hızı **5 knot**.',
                  'Kalkış: Port Halyard marinası. Varış: Gannet Cove demir yeri.',
                  'Engel 1: Gannet Cove girişindeki bar **0,6 m kuruyor** → ancak yeterli gelgitte geçilir.',
                  'Engel 2: Kestrel Head açığında akıntı **2 knot’u** geçiyor → yanlış saatte çıkarsak akıntıyı karşımıza alırız.',
                ],
              },
            },
            {
              p: 'Soru basit: **Saat kaçta yola çıkmalıyız, hangi rotaları izlemeliyiz ve pusulada hangi rotayı (course to steer) tutmalıyız?** Dersin sonunda bunu adım adım, tek sayfalık bir seyir planına dönüştüreceğiz.',
            },
          ],
        },
        {
          h: 'Yol haritası',
          blocks: [
            {
              steps: [
                '**Bölge ve harita** – nereye gidiyoruz, tehlikeler neler?',
                '**Gelgit terimleri** – CD, LAT, HAT, MHWS, MHWN, MLWN, MLWS, harita derinliği, kuruma yüksekliği…',
                '**Port Halyard** – standart liman sayfasını ve gelgit tablosunu okumak.',
                '**Gannet Cove** – ikincil liman farklarıyla saat ve yükseklik hesaplamak.',
                '**Gelgit akıntıları** – akıntı atlası, gelgit elmasları, springs/neaps ara değeri.',
                '**Seyir planı 1** – HW/LW, derinlik kapısı, akıntılar, kalkış saati ve planın özeti.',
                '**Seyir planı 2** – waypointler, rotalar (°T → °M) ve mesafeler.',
                '**Course to Steer** – akıntıyı hesaba katan dümen rotası (vektör üçgeni).',
                '**Plan kartı** – hepsini tek sayfada topla.',
                '**Alıştırmalar** – başka günler için kendin çöz.',
              ],
            },
            { tip: 'Hesap kutuları canlıdır: kaydırıcıları oynatıp sonucun nasıl değiştiğini gör. Metindeki sayılar da aynı hesaplayıcıdan gelir.' },
          ],
        },
      ],
    },

    area: {
      title: 'Saltmere Sound: bölge ve harita',
      short: 'Bölge ve harita',
      sections: [
        {
          h: 'Haritaya ilk bakış',
          blocks: [
            { aw: 'chart' },
            {
              p: 'Kuzeyde ana kara, güneyde açık deniz var. Batıda bir koyun içinde **Port Halyard**, doğuda küçük **Gannet Cove**. Aradaki burun **Kestrel Head**: üzerinde bir fener (Fl(3)15s42m16M), hemen açığında da akıntının çalkantı yaptığı bir **race** var.',
            },
          ],
        },
        {
          h: 'Haritadaki işaretler',
          blocks: [
            {
              list: [
                '**Halyard Fairway** şamandırası (kırmızı-beyaz, LFl.10s): limana yaklaşım için emniyetli su işareti.',
                '**The Anvil**: Gannet Cove’un batısında **1,2 m kuruyan** kaya. Leg 2’nin yaklaşık 1 mil kuzeyinde.',
                '**Gannet barı**: koy girişinde **0,6 m kuruyan** kum seti. Giriş, **016°** hizasındaki iki yeşil fenerle (Oc.G.4s) yapılır.',
                '**◇A ve ◇B**: gelgit elmasları – bu noktalardaki akıntı almanakta saat saat verilir.',
                '**WPT1–WPT3**: planlayacağımız waypointler (seyir noktaları).',
              ],
            },
          ],
        },
        {
          h: 'Haritada konum ve mesafe',
          blocks: [
            {
              p: 'Enlem çizgileri yataydır; haritanın **sol kenarındaki enlem ölçeğinde 1 dakika = 1 deniz mili (M)**. Boylam ölçeği alttadır ama mesafe ölçmek için **asla kullanılmaz**: 47° kuzeyde 1′ boylam yalnızca ≈ 0,68 M’dir.',
            },
            {
              ex: {
                title: 'Mesafe ölçmek',
                lines: ['Pergeli iki noktaya aç.', 'Pergeli bozmadan **aynı enlem hizasında** sol kenardaki enlem ölçeğine taşı.', 'Kaç dakika tuttuğunu say: 6,6′ = **6,6 deniz mili**.'],
              },
            },
            { tip: 'Gerçek bir planlamada OpenStreetMap/OpenSeaMap fikir vermek için iyidir, ama derinlik ve tehlikeler için resmî harita esastır.' },
          ],
        },
      ],
    },

    terms: {
      title: 'Gelgit terimleri: harita sıfırından köprü altına',
      short: 'Gelgit terimleri',
      sections: [
        {
          h: 'Her şeyin başlangıcı: Chart Datum (CD)',
          blocks: [
            {
              p: 'Haritadaki bütün derinlikler ve almanaktaki bütün gelgit yükseklikleri **aynı sıfır çizgisinden** ölçülür: **Chart Datum (CD)**, yani harita sıfırı. Modern haritalarda CD ≈ **LAT** (Lowest Astronomical Tide – astronomik olarak beklenen en alçak su). Normal hava koşullarında su seviyesi neredeyse hiç CD’nin altına inmez; bu yüzden harita derinliği "en kötü durumdaki" derinliktir.',
            },
            { aw: 'levels' },
            { tip: 'Kaydırıcıyla gelgit yüksekliğini değiştir: derin noktada su artar, kuruyan sette su kaybolur, köprü altı boşluk azalır.' },
          ],
        },
        {
          h: 'Seviye isimleri (Port Halyard değerleriyle)',
          blocks: [
            {
              table: {
                head: ['Kısaltma', 'Açılım', 'Anlamı', 'Port Halyard'],
                rows: [
                  ['**HAT**', 'Highest Astronomical Tide', 'Astronomik olarak beklenen en yüksek su. Köprü altı boşlukları buradan ölçülür.', '5,6 m'],
                  ['**MHWS**', 'Mean High Water Springs', 'Springs (büyük gelgit) dönemindeki ortalama yüksek su. Fener yükseklikleri genelde buradan ölçülür.', '5,1 m'],
                  ['**MHWN**', 'Mean High Water Neaps', 'Neaps (küçük gelgit) dönemindeki ortalama yüksek su.', '4,0 m'],
                  ['**MSL**', 'Mean Sea Level', 'Ortalama deniz seviyesi.', '2,8 m'],
                  ['**MLWN**', 'Mean Low Water Neaps', 'Neaps dönemindeki ortalama alçak su.', '1,8 m'],
                  ['**MLWS**', 'Mean Low Water Springs', 'Springs dönemindeki ortalama alçak su – en sığ "normal" an.', '0,5 m'],
                  ['**LAT / CD**', 'Lowest Astronomical Tide / Chart Datum', 'Harita sıfırı. Derinlikler bunun altına, kuruma yükseklikleri bunun üstüne ölçülür.', '0,0 m'],
                ],
              },
            },
            {
              p: 'Buradan iki önemli sayı çıkar: **ortalama spring aralığı** = MHWS − MLWS = 5,1 − 0,5 = **4,6 m**, **ortalama neap aralığı** = MHWN − MLWN = 4,0 − 1,8 = **2,2 m**. Akıntı hesaplarında bu iki sayıyı kullanacağız.',
            },
          ],
        },
        {
          h: 'Derinlik terimleri',
          blocks: [
            {
              table: {
                head: ['Terim', 'Haritada', 'Anlamı'],
                rows: [
                  ['**Charted depth** (harita derinliği)', 'italik rakam, ör. 8', 'CD’nin **altındaki** derinlik. Normal koşullarda su bundan sığ olmaz.'],
                  ['**Drying height** (kuruma yüksekliği)', 'altı çizili rakam, ör. 0̲6', 'Zeminin CD’nin **üstündeki** yüksekliği. Alçak suda kurur, gelgit yükselince örtülür.'],
                  ['**Height of tide** (gelgit yüksekliği)', 'almanaktan hesaplanır', 'Belirli bir anda suyun CD’nin ne kadar üstünde olduğu.'],
                  ['**Depth of water** (su derinliği)', 'hesaplanır', 'O anda gerçekte olan derinlik.'],
                  ['**Elevation** (fener yüksekliği)', 'ör. 42m', 'Fenerin MHWS (yeni haritalarda HAT) üstündeki yüksekliği.'],
                  ['**Vertical clearance** (köprü/kablo boşluğu)', 'ör. 18m', 'Köprünün HAT üstündeki yüksekliği. Su alçaldıkça boşluk artar.'],
                ],
              },
            },
            {
              ex: {
                title: 'Üç hızlı hesap (gelgit yüksekliği 3,0 m)',
                lines: [
                  'Fairway yakınında harita derinliği 8 m → su derinliği = 8 + 3,0 = **11,0 m**.',
                  'Gannet barı 0,6 m kuruyor → bar üstünde su = 3,0 − 0,6 = **2,4 m**. Draft 1,8 m → omurga altı **0,6 m**.',
                  'Halyard köprüsü boşluğu 18 m (HAT’tan) → boşluk = 18 + (5,6 − 3,0) = **20,6 m**.',
                ],
              },
            },
            { warn: 'Kuruma yüksekliğini **çıkarırsın**, harita derinliğini **eklersin**. İşareti karıştırmak karaya oturmanın en klasik yoludur.' },
          ],
        },
        {
          h: 'Springs, neaps ve Ay',
          blocks: [
            {
              p: 'Gelgiti Ay ve Güneş yaratır. Dolunay ve yeniaydan **yaklaşık 2 gün sonra** ikisi aynı hizada çektiği için aralık en büyüktür: **springs** (büyük gelgit) – yüksek sular daha yüksek, alçak sular daha alçak, akıntılar daha hızlı. İlk ve son dördünde ise **neaps** (küçük gelgit) olur.',
            },
            {
              list: [
                '**Range (aralık)**: ardışık HW ile LW arasındaki yükseklik farkı.',
                '**Duration (süre)**: LW’den HW’ye geçen zaman (yaklaşık 6 saat).',
                '**Gelgit saati**: süre ÷ 6. Süre 6 saat 27 dakikaysa bir gelgit saati 64,5 dakikadır.',
                '**On ikiler kuralı**: gelgit 1.–6. saatlerde aralığın sırasıyla 1, 2, 3, 3, 2, 1 on ikisi kadar yükselir ya da alçalır.',
              ],
            },
          ],
        },
        {
          h: 'Standart liman ve ikincil liman',
          blocks: [
            {
              p: '**Standart liman** (standard port) için almanakta her günün HW/LW saatleri ve yükseklikleri tek tek yazılıdır (bizde Port Halyard). Küçük limanlar için ayrı tablo basılmaz; bunlar **ikincil limandır** (secondary port) ve almanakta yalnızca standart limana göre **saat ve yükseklik farkları** verilir (bizde Gannet Cove).',
            },
          ],
        },
      ],
    },

    halyard: {
      title: 'Port Halyard: standart liman sayfası',
      short: 'Port Halyard',
      sections: [
        {
          h: 'Liman sayfası nasıl okunur?',
          blocks: [
            { p: 'Almanakta her liman sayfası aynı sırayla yazılır. Port Halyard sayfamız:' },
            {
              table: {
                head: ['Başlık', 'Port Halyard (kurgusal)'],
                rows: [
                  ['**Konum / harita**', '47°17′.4N 012°23′.5W · Saltmere Sound eğitim haritası'],
                  ['**Standart liman**', 'Port Halyard (bu sayfa)'],
                  ['**Tanım**', 'Kuzeye uzanan, her gelgitte girilebilen korunaklı doğal liman. Marina koyun doğu kıyısında; balıkçı ve feribot trafiği var.'],
                  ['**Yaklaşım waypointi**', 'Halyard Fairway SWM şamandırası, 47°15′.9N 012°23′.0W.'],
                  ['**Pilotaj notları**', 'Fairway’den 347° ile koyu ortalayarak gir. Batı kıyısındaki 4–5 m’lik sığlıktan uzak dur. Güney rüzgârlarında girişte kısa dalga olur.'],
                  ['**Gelgit akıntıları**', 'Koy içinde 0,5 kn’u geçmez. Açıkta ◇A’ya bak.'],
                  ['**Fenerler ve işaretler**', 'Fairway LFl.10s · Kestrel Head Fl(3)15s42m16M (güneydoğuda ≈ 10 M).'],
                  ['**VHF**', 'Port Halyard Port Control kanal 12; marina kanal 80.'],
                  ['**Olanaklar**', 'Marina, yakıt, su, elektrik, market, tamirhane.'],
                ],
              },
            },
          ],
        },
        {
          h: 'Gelgit tablosu',
          blocks: [
            { aw: 'tideTable' },
            {
              steps: [
                '**Saat dilimini kontrol et.** Tablo **UT** ile basılmıştır. Yaz saatinde **1 saat ekle**: 1018 UT → **1118 yerel**.',
                '**Günü bul.** Her gün genelde iki HW, iki LW vardır (bazen biri ertesi güne kayar – 15 Haziran’a bak).',
                '**HW ile LW’yi ayır.** Büyük değerler HW, küçük değerler LW’dir.',
                '**Aralığı hesapla.** 13 Haziran sabahı: LW 0412 **0,8 m**, HW 1018 **4,8 m** → aralık **4,0 m**.',
                '**Springs mi neaps mi?** 4,0 m, neap (2,2) ile spring (4,6) arasında ama springs’e yakın. Dolunay 14’ünde, springs 16’sında.',
              ],
            },
            {
              ex: {
                title: '13 Haziran Cumartesi, Port Halyard',
                lines: [
                  'LW **0412 UT** (0512 yerel) **0,8 m**',
                  'HW **1018 UT** (1118 yerel) **4,8 m**',
                  'LW **1636 UT** (1736 yerel) **0,9 m**',
                  'HW **2242 UT** (2342 yerel) **4,7 m**',
                  'Sabah aralığı: 4,8 − 0,8 = **4,0 m** → springs’e yakın.',
                ],
              },
            },
          ],
        },
        {
          h: 'Gelgit eğrisi: herhangi bir saatte yükseklik',
          blocks: [
            {
              p: 'Gerçek almanakta her standart liman için bir **spring/neap eğrisi** bulunur: HW’ye göre saati yatay eksende bulur, eğriden bir **faktör** okur ve yüksekliği LW + faktör × aralık olarak hesaplarsın. Biz aynı işi **on ikiler kuralı + gelgit saati** ile yapıyoruz; aşağıdaki eğri bu yöntemle çizildi.',
            },
            { aw: 'curveStd' },
            {
              ex: {
                title: '0715 UT’de Port Halyard’da yükseklik?',
                lines: [
                  'LW 0412 → HW 1018: süre 6 sa 06 dk → gelgit saati = 366 ÷ 6 = **61 dk**.',
                  '0715, LW’den 183 dk sonra = 183 ÷ 61 = **3 gelgit saati**.',
                  'On ikiler: 1 + 2 + 3 = **6/12** → aralığın yarısı.',
                  'Yükseklik = 0,8 + 4,0 × 6 ÷ 12 = 0,8 + 2,0 = **2,8 m** (tam MSL kadar).',
                ],
              },
            },
            { tip: 'Tablodaki saatlerin arasında kalan her hesapta aynı mantık: önce **kaç gelgit saati** geçtiğini bul, sonra **on ikileri** topla.' },
          ],
        },
      ],
    },

    gannet: {
      title: 'Gannet Cove: ikincil liman hesabı',
      short: 'Gannet Cove',
      sections: [
        {
          h: 'Liman sayfası',
          blocks: [
            {
              table: {
                head: ['Başlık', 'Gannet Cove (kurgusal)'],
                rows: [
                  ['**Konum / harita**', '47°06′.9N 012°07′.4W · Saltmere Sound eğitim haritası'],
                  ['**Standart liman**', 'Port Halyard (farklar aşağıda)'],
                  ['**Tanım**', 'Kestrel Head’in doğusunda küçük, sakin bir koy. Kuzey ve batı rüzgârlarına karşı iyi korunur; güney rüzgârlarına açıktır.'],
                  ['**Yaklaşım waypointi**', 'WPT3 47°05′.0N 012°08′.0W'],
                  ['**Pilotaj notları**', 'Giriş barı **0,6 m kurur**. İki yeşil fener (Oc.G.4s) **016°** hizasında barı geçer. Güneyli ölü dalgada bar üstünde dalga kırılabilir. Koy içinde demir yeri 2–3 m, kum.'],
                  ['**Gelgit akıntıları**', 'Koy önünde ◇B’ye bak (Kestrel Head açığında 2 kn’u geçer). Koy içinde akıntı yok denecek kadar az.'],
                  ['**Fenerler ve işaretler**', 'Gannet Ldg Lts 016° Oc.G.4s · The Anvil (1̲2) koyun ≈ 2,7 M batısında, işaretsiz!'],
                  ['**VHF**', 'Yok.'],
                  ['**Olanaklar**', 'Yok. Sahilde mesire alanı.'],
                ],
              },
            },
          ],
        },
        {
          h: 'Fark kutusu',
          blocks: [
            { aw: 'diffBox' },
            { p: 'Kutunun üst satırları **Port Halyard’ın saatlerini ve seviyelerini**, alt satırı **Gannet Cove’a uygulanacak farkları** verir:' },
            {
              list: [
                'Port Halyard HW **0000 veya 1200**’de ise Gannet HW **40 dk sonra** (+0040).',
                'Port Halyard HW **0600 veya 1800**’de ise **20 dk sonra** (+0020).',
                'Arada bir saatteyse farkı **orantılı (doğrusal) ara değerle** bulursun.',
                'LW için aynısı: 0500/1700 → +0010, 1100/2300 → +0030.',
                'Yükseklikler: Port Halyard HW, MHWS’ye (5,1) yakınsa −0,4 m; MHWN’ye (4,0) yakınsa −0,3 m; arada ara değer. LW için MLWN −0,1, MLWS 0,0.',
              ],
            },
          ],
        },
        {
          h: 'Adım adım: 13 Haziran sabah HW',
          blocks: [
            {
              ex: {
                title: 'Saat',
                lines: [
                  'Port Halyard HW **1018 UT**. Tablo: 0600 → +0020, 1200 → +0040.',
                  '1018, 0600’dan 4 sa 18 dk sonra → 258 ÷ 360 = **0,72** yol alınmış.',
                  'Fark = 20 + 0,72 × (40 − 20) = 20 + 14,3 ≈ **+34 dk**.',
                  'Gannet HW = 1018 + 0034 = **1052 UT** (1152 yerel).',
                ],
              },
            },
            {
              ex: {
                title: 'Yükseklik',
                lines: [
                  'Port Halyard HW **4,8 m**. MHWN 4,0 → −0,3; MHWS 5,1 → −0,4.',
                  '4,8; 4,0’dan 5,1’e giden yolun (4,8 − 4,0) ÷ 1,1 = **0,73**’ünde.',
                  'Fark = −0,3 + 0,73 × (−0,1) = −0,37 ≈ **−0,4 m**.',
                  'Gannet HW = 4,8 − 0,4 = **4,4 m**.',
                ],
              },
            },
            {
              ex: {
                title: 'Önceki LW',
                lines: [
                  'Port Halyard LW **0412 UT, 0,8 m**. Tablo: 2300 → +0030, 0500 → +0010.',
                  '0412, 2300’den 5 sa 12 dk sonra → 312 ÷ 360 = 0,87 → fark = 30 − 0,87 × 20 ≈ **+13 dk** → **0425 UT**.',
                  'Yükseklik: MLWS 0,5 (0,0) ile MLWN 1,8 (−0,1) arasında 0,23 → fark ≈ −0,02 ≈ 0,0 → **0,8 m**.',
                ],
              },
            },
            { aw: 'secondary' },
            { tip: 'Gerçek almanakta saat farkını küçük bir grafikle ya da kafadan ara değerlersin. Birkaç dakika seyir için önemli değildir ama **işareti** (+/−) asla karıştırma.' },
          ],
        },
        {
          h: 'Gannet Cove’un gelgit eğrisi',
          blocks: [
            { p: 'Gannet Cove’un saat ve yüksekliklerini bulunca onun eğrisini de çizebiliriz. Yeşil bant, **barı güvenle geçebildiğimiz** zamandır (hesabını seyir planında yapacağız).' },
            { aw: 'curveGate' },
          ],
        },
      ],
    },

    streams: {
      title: 'Gelgit akıntıları: atlas ve elmaslar',
      short: 'Gelgit akıntıları',
      sections: [
        {
          h: 'Terimler',
          blocks: [
            {
              list: [
                '**Set (yön)**: akıntının **gittiği** yön (rüzgârın tersine!). 090° = doğuya akıyor.',
                '**Rate (hız)**: knot cinsinden hız. Bir saatte götürdüğü mesafeye **drift** denir.',
                '**Flood / ebb**: yükselen / alçalan suyla gelen akıntı. **Slack**: dönüm anındaki durgunluk.',
                'Saatler **standart limanın HW’sine göre** verilir: "HW−3 Port Halyard" gibi.',
              ],
            },
          ],
        },
        {
          h: 'Akıntı atlası',
          blocks: [
            {
              p: 'Atlas her saat için ayrı bir harita sayfasıdır. Oklar yönü, rakamlar hızı gösterir. Gerçek atlasta "09,18" gibi iki rakam olur (neap 0,9 / spring 1,8 kn); bizim atlasımız o günün aralığına göre hesaplanmış hızı tek rakamla gösteriyor: **16 = 1,6 kn**.',
            },
            { aw: 'atlas' },
            { tip: 'Kaydırıcıyı HW−6’dan HW+6’ya oynat: HW’ye kadar akıntı **doğuya ve güneye (lehimize)**, HW’den sonra **batıya ve kuzeye (aleyhimize)** dönüyor. En hızlı yer Kestrel Head açığı.' },
          ],
        },
        {
          h: 'Gelgit elmasları ve springs/neaps ara değeri',
          blocks: [
            { p: 'Haritadaki her ◇ için almanakta (ya da harita kenarında) bir tablo vardır: her saat için **yön**, **spring hızı** ve **neap hızı**. O günün hızını aralığa göre ara değerle bulursun:' },
            { p: '**Faktör = (günün aralığı − neap aralığı) ÷ (spring aralığı − neap aralığı)** → **hız = Np + (Sp − Np) × faktör**' },
            { aw: 'diamonds' },
            {
              ex: {
                title: '13 Haziran 0700 UT, ◇A',
                lines: [
                  'Port Halyard HW 1018 UT → 0700 UT = HW − 3 sa 18 dk → **HW−3** satırı.',
                  '◇A HW−3: **180°**, Sp **1,8**, Np **1,0**.',
                  'Aralık 4,0 m → faktör = (4,0 − 2,2) ÷ (4,6 − 2,2) = 1,8 ÷ 2,4 = **0,75**.',
                  'Hız = 1,0 + (1,8 − 1,0) × 0,75 = **1,6 kn**, yön 180°.',
                ],
              },
            },
            { tip: 'Gerçek almanaktaki "Computation of rates" grafiği aynı doğrusal ara değeri çizgiyle yapar: spring ve neap hızını işaretle, birleştir, günün aralığından yatay çizgi çek.' },
            { p: 'Kullandığın aralık, o saatlerde etkili olan **gelgitin** aralığıdır. Biz sabah gelgitinde seyredeceğiz: **4,0 m**.' },
          ],
        },
      ],
    },

    plan: {
      title: 'Seyir planı 1: gelgit, akıntı ve kalkış saati',
      short: 'Plan: gelgit ve saat',
      sections: [
        {
          h: 'Adım 1 – Nereye, kimle, hangi tekneyle?',
          blocks: [
            {
              p: 'Planlamaya hep aynı sorularla başla: **Nereden nereye? Ne kadar yol? Teknenin hızı ve su çekimi? Mürettebat ne kadar deneyimli? Hava ne diyor?** Day Skipper’da kontrol sırası: hava, gelgit, tehlikeler, kaçış limanları (bolt holes), mürettebat.',
            },
            {
              ex: {
                title: 'Bizim cevaplarımız',
                lines: [
                  'Port Halyard marinası → Gannet Cove demir yeri: açık denizde **14,5 M**, liman içleriyle birlikte ≈ **19 M**.',
                  'Aurora: 5 kn, draft 1,8 m. Omurga altında en az **0,5 m** istiyoruz.',
                  'Hava (kurgusal): batıdan 3–4 kuvvet, iyi görüş. Kestrel Head’de rüzgâr ile akıntı **aynı yöne** giderse race sakin kalır.',
                  'Kaçış limanı: Port Halyard’a geri dönmek (her gelgitte girilebilir).',
                ],
              },
            },
          ],
        },
        {
          h: 'Adım 2 – HW ve LW değerlerini yaz',
          blocks: [
            { p: 'İki limanın o günkü gelgitlerini **UT ve yerel saatle** bir tabloya yaz. Port Halyard’ı doğrudan okuduk, Gannet Cove’u farklarla hesapladık:' },
            {
              table: {
                head: ['', 'LW', 'HW', 'LW', 'HW'],
                rows: [
                  ['**Port Halyard** (UT)', '0412 · 0,8', '1018 · 4,8', '1636 · 0,9', '2242 · 4,7'],
                  ['**Port Halyard** (yerel)', '0512', '1118', '1736', '2342'],
                  ['**Gannet Cove** (UT)', '0425 · 0,8', '1052 · 4,4', '1647 · 0,9', '2318 · 4,3'],
                  ['**Gannet Cove** (yerel)', '0525', '1152', '1747', '0018 (ertesi gün)'],
                ],
              },
            },
            { p: 'Port Halyard sabah aralığı **4,0 m** → akıntı faktörü **0,75**. Gannet Cove’da aralık 4,4 − 0,8 = **3,6 m**.' },
          ],
        },
        {
          h: 'Adım 3 – Derinlik kapısı: bar ne zaman açık?',
          blocks: [
            { ex: { title: 'Gereken gelgit yüksekliği', lines: ['Kuruma yüksekliği **0,6** + draft **1,8** + omurga altı pay **0,5** = **2,9 m**.'] } },
            {
              ex: {
                title: 'Bar ne zaman açılır? (yükselen su)',
                lines: [
                  'Gannet LW 0425 **0,8 m** → HW 1052 **4,4 m**: aralık 3,6 m, süre 6 sa 27 dk → gelgit saati **64,5 dk**.',
                  'Gereken artış: 2,9 − 0,8 = 2,1 m = 2,1 ÷ 3,6 × 12 = **7 on iki**.',
                  'On ikiler: 1 + 2 + 3 = 6 (3 saat) → 7. on iki, 4. saatin üçte biri → **3⅓ gelgit saati**.',
                  '3,33 × 64,5 = 215 dk = 3 sa 35 dk → 0425 + 0335 = **0800 UT** (0900 yerel).',
                ],
              },
            },
            {
              ex: {
                title: 'Bar ne zaman kapanır? (alçalan su)',
                lines: [
                  'HW 1052 **4,4 m** → LW 1647 **0,9 m**: aralık 3,5 m, süre 5 sa 55 dk → gelgit saati **59,2 dk**.',
                  'İzin verilen düşüş: 4,4 − 2,9 = 1,5 m = 1,5 ÷ 3,5 × 12 = **5,14 on iki**.',
                  '1 + 2 = 3 (2 saat); kalan 2,14, 3. saatin 3 on ikisinden → **2,71 gelgit saati**.',
                  '2,71 × 59,2 ≈ 161 dk = 2 sa 41 dk → 1052 + 0241 = **1333 UT** (1433 yerel).',
                ],
              },
            },
            { p: '**Bar penceresi: 0800 – 1333 UT (0900 – 1433 yerel).** Eğride yeşil bantla görünüyor:' },
            { aw: 'curveGate' },
            { tip: 'Mümkünse bara **yükselen suda** var: dokunursan su seni kaldırır. Alçalan suda oturursan bir sonraki gelgiti beklersin.' },
          ],
        },
        {
          h: 'Adım 4 – Akıntıları değerlendir',
          blocks: [
            { p: 'Şimdi rota boyunca akıntıya saat saat bakıyoruz. HW Port Halyard 1018 UT olduğundan her "HW±n" satırı belli bir saat dilimine denk gelir (ör. HW−3 = 0648–0748 UT). Faktör 0,75 ile hızlar:' },
            { aw: 'streamDay' },
            {
              list: [
                '**HW−6 → HW**: akıntı güneye/doğuya – **lehimize**. En güçlü HW−4…HW−2 arası; Kestrel Head’de 2,1 kn’a kadar.',
                '**HW civarı**: durgun (slack).',
                '**HW+1’den sonra**: batıya döner – **aleyhimize**; HW+3’te Kestrel Head açığında 2,0 kn.',
              ],
            },
            { p: 'Sonuç: Kestrel Head’i **en geç HW civarında (≈ 1000–1030 UT)** geçmiş olmalıyız; ideali **HW−4…HW−2** arası.' },
          ],
        },
        {
          h: 'Adım 5 – Kalkış saatini seç',
          blocks: [
            { p: 'İki kuralı üst üste koyuyoruz: (1) Bara **0800 UT’den sonra** varmalıyız, (2) akıntı **lehimizdeyken** gitmeliyiz. Aşağıdaki planlayıcı WPT1’den çıkış saatine göre bütün yolu hesaplıyor. Kaydırıcıyla dene:' },
            { aw: 'departure' },
            {
              list: [
                '**0500 UT ve öncesi**: hızlı gideriz ama bara 0800’den önce varırız, kapıda **beklemek** zorunda kalırız (⏳).',
                '**0530–0700 UT**: en kısa yolculuk (136 dk), akıntı tamamen lehimize, bar açık ✅.',
                '**0800 UT civarı**: hâlâ olur ama akıntı zayıflar, yol uzar.',
                '**0900 UT ve sonrası**: Kestrel Head’de akıntı **aleyhimize** (⚠️); 1000’den sonra bar da kapanıyor (⛔).',
              ],
            },
            {
              ex: {
                title: 'Kararımız',
                lines: [
                  'WPT1’den çıkış **0630 UT = 0730 yerel**. Marinadan 30 dk önce ayrılıyoruz: **0700 yerel**.',
                  'Bara varış **0902 UT (1002 yerel)**, gelgit **3,7 m** (gereken 2,9 → 0,8 m fazladan pay) ve su hâlâ yükseliyor.',
                  'Bir saat gecikirsek bile (0730 UT) plan çalışır: akıntı lehte, bar açık. Bu bizim **emniyet payımız**.',
                ],
              },
            },
          ],
        },
        {
          h: 'Adım 6 – Planın özeti (overview)',
          blocks: [
            { p: 'Planın özeti, mürettebata brifing verirken okuyacağın kısa metindir. Ayrıntıları değil **kararları ve nedenlerini** anlatır:' },
            { aw: 'overview' },
          ],
        },
      ],
    },

    route: {
      title: 'Seyir planı 2: rota ve waypointler',
      short: 'Plan: rota ve WPT',
      sections: [
        {
          h: 'Waypoint nasıl seçilir?',
          blocks: [
            {
              list: [
                '**Emniyetli suda** olsun: tehlikelerden ve race’lerden en az 1 M uzak.',
                '**Kolay tanınır** olsun: bir şamandıranın, burnun ya da fenerin yakınında.',
                'Rota **gereksiz dönüş** yapmasın, ama karaya kestirme de yapma.',
                'Waypoint **şamandıranın tam üstü olmasın** – gece ya da siste ona çarparsın; 0,1–0,2 M yanına koy.',
              ],
            },
            { aw: 'chart' },
          ],
        },
        { h: 'Waypoint listesi ve leg tablosu', blocks: [{ aw: 'legs' }] },
        {
          h: 'Haritada rota ve mesafe ölçmek',
          blocks: [
            {
              steps: [
                'Paralel cetveli (ya da Portland/Breton plotter’ı) WPT1 ile WPT2’yi birleştirecek şekilde koy.',
                'Plotter’ın ızgarasını haritanın enlem-boylam çizgileriyle hizala; okun **gidiş yönünü** gösterdiğinden emin ol.',
                'Gerçek yönü (**°T**) oku: WPT1 → WPT2 = **156°T**.',
                'Pergelle mesafeyi al ve **enlem ölçeğinde** oku: **6,6 M**.',
                'Aynısını WPT2 → WPT3 için yap: **120°T, 7,9 M**.',
              ],
            },
          ],
        },
        {
          h: 'Hesapla kontrol (plane sailing)',
          blocks: [
            { p: 'Ölçümünü kontrol etmek için basit bir dik üçgen yeter. Enlem farkı (d.lat) doğrudan mildir; boylam farkını (d.long) **cos(enlem)** ile çarpıp mile çevirirsin (departure):' },
            {
              ex: {
                title: 'WPT1 → WPT2',
                lines: [
                  'd.lat = 47°15′.0 → 47°09′.0 = **6,0′ güneye** = 6,0 M.',
                  'd.long = 012°22′.0W → 012°18′.0W = **4,0′ doğuya** → × cos 47° (0,68) = **2,7 M**.',
                  'Açı = tan⁻¹(2,7 ÷ 6,0) = 24° → güneyden 24° doğuya → 180 − 24 = **156°T**.',
                  'Mesafe = √(6,0² + 2,7²) = **6,6 M**.',
                ],
              },
            },
            {
              ex: {
                title: 'WPT2 → WPT3',
                lines: ['d.lat = **4,0′ güneye** = 4,0 M · d.long = **10,0′ doğuya** × 0,68 = **6,8 M**.', 'Açı = tan⁻¹(6,8 ÷ 4,0) = 60° → 180 − 60 = **120°T**.', 'Mesafe = √(4,0² + 6,8²) = **7,9 M**.'],
              },
            },
          ],
        },
        {
          h: 'Gerçek (T) → Manyetik (M) → Pusula (C)',
          blocks: [
            { p: 'Harita **gerçek kuzeye** göre çizilir, pusula ise **manyetik kuzeyi** gösterir. Aradaki fark **varyasyondur** (haritadaki pusula gülünde yazar): Saltmere Sound’da **3°W**.' },
            {
              list: [
                '**Batı (W) varyasyonu ekle**: 156°T + 3° = **159°M**; 120°T + 3° = **123°M**.',
                '**Doğu (E) varyasyonu çıkar**.',
                'Hafıza: "**West is best**" (batı varyasyonda manyetik sayı daha büyük), "**East is least**".',
                'Teknenin kendi pusula hatası **deviasyondur** (deviation card). Aurora’nın bu rotalarda deviasyonu ihmal edilebilir; bu yüzden °M = pusula rotası.',
              ],
            },
            { warn: 'Bu adımda bulduğumuz 159°M ve 123°M **dümen rotası değildir**; yalnızca **yerdeki iz** (ground track). Akıntı bizi kaydıracağı için dümende başka bir rota tutacağız → sıradaki bölüm.' },
          ],
        },
        {
          h: 'Tehlikeler ve kontrol noktaları',
          blocks: [
            {
              list: [
                '**Kestrel Head race**: WPT2 burnun ≈ 2,7 M batı-güneybatısında; leg 2 burnu ≈ 2 M güneyden geçer.',
                '**The Anvil** (1,2 m kuruyor): leg 2’nin ≈ 0,9 M kuzeyinde. Akıntı bizi **kuzeye** iter → CTS düzeltmesini yapmazsak kayaya doğru kayarız!',
                '**Gannet barı**: yalnızca pencere içinde ve 016° hattında geç.',
                'Kontrol: WPT2’de Kestrel Head feneri ≈ 075°T’de görünmeli; WPT3’te giriş fenerleri tek çizgide (016°).',
              ],
            },
          ],
        },
      ],
    },

    cts: {
      title: 'Course to Steer: akıntıya rağmen izde kalmak',
      short: 'Course to Steer',
      sections: [
        {
          h: 'Üç farklı yön',
          blocks: [
            {
              list: [
                '**Ground track** (yerdeki iz, iki ok): haritada gitmek istediğimiz çizgi. Leg 1: 156°T.',
                '**Water track / heading** (su izi, tek ok): teknenin burnunun baktığı ve suyun içinde ilerlediği yön. Dümende tuttuğumuz budur.',
                '**Tidal stream** (akıntı, üç ok): suyun kendisinin bizi taşıdığı yön ve hız.',
              ],
            },
            { p: 'Akıntı tekneyi yana iter. Burnu doğrudan WPT2’ye çevirirsek oraya varmadan rotadan çıkarız. Çözüm: burnu biraz **akıntının geldiği tarafa** çevirmek. Bu düzeltilmiş rotaya **Course to Steer (CTS)** denir.' },
          ],
        },
        { h: 'Adım adım: 1 saatlik vektör üçgeni', blocks: [{ aw: 'cts' }] },
        {
          h: 'Leg 1: WPT1 → WPT2',
          blocks: [
            {
              ex: {
                title: 'Leg 1',
                lines: [
                  'Track **156°T**, 6,6 M. Legin ortası ≈ 0701 UT → **HW−3** → ◇A **180°, 1,6 kn**.',
                  'WPT1’den 1 saatlik akıntıyı çiz: 180° yönünde 1,6 M.',
                  'Akıntı okunun ucundan pergeli **5 M** açıp track’i kes.',
                  'Kesişime giden çizginin yönü: **149°T** → + 3° W → **152°M** = dümen rotası.',
                  'WPT1 → kesişim = **6,4 M** → SOG 6,4 kn → 6,6 ÷ 6,4 × 60 ≈ **62 dk** → WPT2 **0732 UT** (0832 yerel).',
                ],
              },
            },
            { p: 'Akıntı (180°) track’in (156°) **sağına** doğru akıyor → bizi sağa iter → burnu **sola** (daha küçük sayıya) 7° çeviriyoruz.' },
          ],
        },
        {
          h: 'Leg 2: WPT2 → WPT3',
          blocks: [
            {
              ex: {
                title: 'Leg 2',
                lines: [
                  'Track **120°T**, 7,9 M. Legin ortası ≈ 0809 UT → **HW−2** → ◇B **092°, 1,7 kn**.',
                  'Akıntı track’in **soluna** (kuzeye) akıyor → bizi The Anvil tarafına iter.',
                  'Üçgen: CTS **129°T** → **132°M**, SOG **6,4 kn**.',
                  '7,9 ÷ 6,4 × 60 ≈ **74 dk** → WPT3 **0846 UT** (0946 yerel).',
                  'WPT3 → bar 1,2 M (4,5 kn ile 16 dk) → bar **0902 UT**, gelgit **3,7 m** ✅.',
                ],
              },
            },
          ],
        },
        {
          h: 'Leeway, uzun legler ve kontrol',
          blocks: [
            {
              list: [
                '**Leeway (rüzgâr kayması)**: yelkenle seyrederken rüzgâr tekneyi rüzgâraltına iter. CTS’i bulduktan sonra burnu **rüzgâra doğru** leeway kadar daha çevir (ör. rüzgâr güneybatıdan, 5° leeway → 132°M yerine **137°M**).',
                '**Bir saatten uzun legler**: her saatin akıntı vektörünü uç uca ekle, sonra toplam süre kadar tekne hızıyla kes. Bizim leglerimiz ≈ 1 saat olduğundan **legin ortasının düştüğü saatin** akıntısını kullandık.',
                '**Kontrol**: GPS’teki COG track’e (156° / 120°T) eşitse CTS doğrudur. Yana kayma (XTE) büyüyorsa akıntı tahminin hatalıdır – düzelt.',
              ],
            },
            { warn: 'CTS’i hesapladın diye rahatlama: 15–30 dakikada bir konumunu işaretle (fix) ve plana göre nerede olduğunu kontrol et.' },
          ],
        },
      ],
    },

    sheet: {
      title: 'Uçtan uca plan kartı',
      short: 'Plan kartı',
      sections: [
        {
          h: 'Hepsi tek sayfada',
          blocks: [{ p: 'Son adım, bütün hesapları kokpitte bakılacak **tek sayfaya** dökmek. Bu kart dümende ya da seyir masasında elinin altında durur.' }, { aw: 'sheet' }],
        },
        {
          h: 'Kontrol listesi',
          blocks: [
            {
              steps: [
                'Hava tahmini (ayrılmadan önce ve yolda tekrar).',
                'Gelgit: iki limanın HW/LW’si, aralık, springs/neaps.',
                'Derinlik kapıları (bar, sığlıklar) ve güvenli pencere.',
                'Akıntılar: lehte/aleyhte saatler, race’ler.',
                'Kalkış saati ve emniyet payı.',
                'Waypointler, track’ler (°T/°M) ve mesafeler.',
                'Her leg için CTS, SOG ve ETA.',
                'Tehlikeler, emniyet kerterizleri, kaçış limanları.',
                'VHF kanalları, fenerler, mürettebat brifingi.',
              ],
            },
            { tip: 'RYA Day Skipper sınavında beklenen sıra da budur: önce gelgit ve zaman, sonra rota, en son CTS ve ETA.' },
          ],
        },
      ],
    },

    practice: {
      title: 'Alıştırmalar: sıra sende',
      short: 'Alıştırmalar',
      sections: [
        {
          h: 'Kendi planını hesapla',
          blocks: [
            {
              steps: [
                'Bir gün seç (12, 14 ya da 15 Haziran). WPT1’den çıkış saati verilmiş.',
                'Port Halyard tablosundan sabah HW/LW’yi oku, aralığı bul.',
                'Fark kutusuyla Gannet Cove HW’sini hesapla.',
                'Bar penceresinin açılış saatini on ikiler kuralıyla bul.',
                'Legin ortasının düştüğü saate göre ◇A ve ◇B hızlarını hesapla.',
                'CTS’i vektör üçgeniyle bul; SOG’den süreleri ve bara varışı hesapla.',
                'Cevaplarını gir ve **Kontrol et**’e bas. Takılırsan önceki bölümlere dön.',
              ],
            },
            { aw: 'practice' },
            { tip: 'Küçük farklar normal: saatlerde ±3–10 dk, CTS’de ±2° tolerans var. Önemli olan yöntemin doğru olması.' },
          ],
        },
        {
          h: 'Düşün ve tartış',
          blocks: [
            {
              list: [
                '15 Haziran’da neden daha geç çıkmak gerekiyor? (İpucu: HW her gün ≈ 50 dk ileri kayar.)',
                'Draft 2,2 m olsaydı bar penceresi nasıl değişirdi? (Gereken yükseklik 3,3 m olur.)',
                'Rüzgâr doğudan 5 kuvvet esseydi Kestrel Head race’i hangi saatlerde tehlikeli olurdu?',
              ],
            },
          ],
        },
      ],
    },
  },

  check: [
    {
      q: 'Haritada altı çizili **0̲6** ne anlama gelir?',
      options: ['CD’nin 0,6 m üstünde, kuruyan zemin', '0,6 m harita derinliği', '0,6 m köprü boşluğu', 'MHWS’nin 0,6 m altı'],
      answer: 0,
      why: 'Altı çizili rakamlar kuruma yüksekliğidir: zemin CD’nin üstündedir, su derinliği = gelgit yüksekliği − 0,6.',
    },
    {
      q: 'Harita derinliği 3,0 m, gelgit yüksekliği 2,4 m. Su derinliği kaç metre?',
      options: ['5,4 m', '0,6 m', '3,0 m', '2,4 m'],
      answer: 0,
      why: 'Harita derinliği CD’nin altındadır; gelgit yüksekliği eklenir: 3,0 + 2,4 = 5,4 m.',
    },
    {
      q: 'Neap aralığı 2,2 m, spring aralığı 4,6 m, günün aralığı 3,4 m. Akıntı faktörü kaç?',
      options: ['0,50', '0,74', '0,25', '1,00'],
      answer: 0,
      why: '(3,4 − 2,2) ÷ (4,6 − 2,2) = 1,2 ÷ 2,4 = 0,5 → springs ile neaps’in tam ortası.',
    },
    {
      q: 'Port Halyard HW 0600 UT. Gannet Cove HW kaçta?',
      options: ['0620 UT', '0640 UT', '0600 UT', '0610 UT'],
      answer: 0,
      why: 'Fark kutusunda 0600 için doğrudan +0020 yazar; ara değere gerek yok.',
    },
    {
      q: 'Varyasyon 3°W. Track 120°T ise manyetik kaç?',
      options: ['123°M', '117°M', '120°M', '126°M'],
      answer: 0,
      why: 'Batı varyasyonu eklenir: West is best.',
    },
    {
      q: 'Akıntı track’inin soluna doğru akıyor. Burnu hangi yöne düzeltirsin?',
      options: ['Sağa (akıntının geldiği tarafa)', 'Sola', 'Düzeltme gerekmez', 'Sadece hızı artırırım'],
      answer: 0,
      why: 'Akıntı seni sola iter; dengelemek için burnu sağa, akıntının geldiği tarafa çevirirsin.',
    },
    {
      q: 'Yaz saatinde tablo HW 1018 UT diyor. Saatindeki yerel saat kaç?',
      options: ['1118', '0918', '1018', '1218'],
      answer: 0,
      why: 'Yaz saatinde UT + 1: 1118.',
    },
    {
      q: 'Bar 0,6 m kuruyor, draft 1,8 m, 0,5 m omurga altı pay istiyorsun. Gereken gelgit yüksekliği?',
      options: ['2,9 m', '2,3 m', '1,7 m', '3,5 m'],
      answer: 0,
      why: '0,6 + 1,8 + 0,5 = 2,9 m.',
    },
  ],

  ui: uiTr,
}
