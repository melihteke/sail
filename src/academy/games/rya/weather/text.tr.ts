import type { WeatherText } from './text'

export const weatherTr: WeatherText = {
  title: 'Kaptan için meteoroloji',
  intro:
    'Küresel rüzgâr kuşaklarından plajdaki deniz meltemine kadar: yüksek ve alçak basınçlar, izobarlar, cepheler, bulutlar, Beaufort ölçeği, sis, sağanaklar, tropik fırtınalar ve hava tahminleri – oynayabileceğin animasyonlar ve hava haritasını bir kaptan gibi okumayı öğreten alıştırmalarla.',
  chapters: {
    start: {
      title: 'Hava neden kaptanın işi?',
      short: 'Başlarken',
      sections: [
        {
          h: 'En önemli emniyet kararı',
          blocks: [
            {
              p: 'Denizdeki kötü günlerin çoğu karada, bir hava kararıyla başlar. Day Skipper’dan beklenen şudur: **tahmini al, anla, gökyüzü ve barometreyle karşılaştır ve karar ver** – çık, bekle, daha kısa bir rota seç ya da erken camadan vur. Meteorolog olman gerekmiyor; küçük bir tekne için önemli olan örüntüleri tanıman yeterli.',
            },
            {
              list: [
                '**Rüzgâr** – şiddeti, yönü, hamleleri ve nasıl değişeceği.',
                '**Deniz durumu** – dalgalar rüzgâr, açıklık (fetch) ve süreyle büyür; akıntıya karşı dikleşir.',
                '**Görüş** – sis, yağmur ve karanlık.',
                '**Zamanlama** – cephe, fırtına ya da rüzgâr dönüşü ne zaman gelecek.',
              ],
            },
          ],
        },
        {
          h: 'Havanın üç ölçeği',
          blocks: [
            {
              table: {
                head: ['Ölçek', 'Boyut', 'Sana verdiği', 'Nereden bulunur'],
                rows: [
                  ['**Sinoptik**', 'Binlerce mil, günler', 'Yüksek/alçak basınçlar, cepheler – önümüzdeki günlerin genel rüzgârı', 'Sinoptik haritalar, shipping forecast, GRIB'],
                  ['**Mezo ölçek**', '10–200 mil, saatler', 'Deniz meltemleri, sağanak hatları, oraj, sis kümeleri', 'Kıyı tahmini, radar, uydu, gökyüzü'],
                  ['**Yerel**', 'Bir koy ya da burun, dakikalar', 'Huni etkisi, yalıyardan hamleler, rüzgâr gölgesi, burun çevresinde hızlanma', 'Kılavuz kitaplar, yerel bilgi, gözlerin'],
                ],
              },
            },
            { tip: 'İyi kaptan büyükten küçüğe düşünür: önce sinoptik tablo, sonra kıyının ve günün saatinin bunu nasıl değiştireceği.' },
          ],
        },
        {
          h: 'Bu ders nasıl kullanılır?',
          blocks: [
            {
              steps: [
                'Bölümleri sırayla oku – her biri bir öncekinin üstüne kurulu.',
                'Her animasyonla oyna: kaydırıcıları oynat, yarımküre değiştir, sembollere tıkla.',
                'Sonunda **zihin egzersizlerini** yap: harita soruları, planlanacak bir okyanus geçişi, sıraya dizilecek olaylar ve hızlı tanıma oyunları.',
                'Neyin akılda kaldığını görmek için en sondaki testi çöz.',
              ],
            },
          ],
        },
      ],
    },

    global: {
      title: 'Küresel motor: rüzgâr kuşakları ve ticaret rüzgârları',
      short: 'Küresel rüzgârlar',
      sections: [
        {
          h: 'Sıcak ekvator, soğuk kutuplar',
          blocks: [
            {
              p: 'Güneş tropikleri kutuplardan çok daha fazla ısıtır. Sıcak hava ekvatorda yükselir, yukarıdan kutuplara doğru akar, soğur ve yaklaşık 30° kuzey ve güneyde yeniden çöker. Bu döngü **Hadley hücresidir**. 30° ile 60° arasında bir döngü daha (**Ferrel hücresi**), kutupların üstünde de bir tane (**kutup hücresi**) vardır. Havanın çöktüğü yerde yüzey basıncı **yüksek**, yükseldiği yerde **alçaktır**.',
            },
            { ww: 'globe' },
          ],
        },
        {
          h: 'Rüzgâr kuşakları',
          blocks: [
            {
              table: {
                head: ['Kuşak', 'Enlem', 'Rüzgâr', 'Denizci için'],
                rows: [
                  ['**Doldrums (ITCZ)**', '0–10°', 'Hafif ve değişken, şiddetli sağanaklar', 'Günlerce limonlu, sonra sert sağanaklar. Hızlı ve kuşağın dar olduğu yerden geç.'],
                  ['**Ticaret rüzgârları (alize)**', '10–30°', 'Kuzeyde NE, güneyde SE, 15–25 kn', 'Dünyadaki en güvenilir rüzgârlar – klasik rüzgâraltı okyanus geçişleri.'],
                  ['**At enlemleri**', '≈ 30°', 'Subtropik yüksek basınçların (Azorlar, Pasifik, St Helena…) altında hafif rüzgâr', 'Yüksek basıncın merkezinden uzak dur: rüzgâr yok.'],
                  ['**Batı rüzgârları**', '35–60°', 'Çoğunlukla W, ardı ardına alçak basınçlarla', 'Kuzeybatı Avrupa’nın değişken havası; güneyde **Kükreyen Kırklar**.'],
                  ['**Kutup cephesi / kutupaltı alçaklar**', '≈ 60°', 'Soğuk ve sıcak havanın buluştuğu yer', 'Orta enlem alçak basınçlarının çoğu burada doğar.'],
                  ['**Kutup doğu rüzgârları**', '60–90°', 'Soğuk E rüzgârları', 'Sadece yüksek enlem seyirleri.'],
                ],
              },
            },
          ],
        },
        {
          h: 'Coriolis: rüzgârlar neden kıvrılır?',
          blocks: [
            {
              p: 'Dünya döndüğü için üstünde hareket eden her şey sapıyormuş gibi görünür: **kuzey yarımkürede sağa, güney yarımkürede sola**. Ekvatora geri akan hava batıya sapar; bu yüzden ticaret rüzgârları kuzeyde **kuzeydoğudan**, güneyde **güneydoğudan** eser. Etki ekvatorda sıfırdır, kutuplarda en güçlüdür – tropik fırtınaların tam ekvatorda hiç oluşmamasının bir nedeni budur.',
            },
          ],
        },
        {
          h: 'Kuzey ve güney: ne değişiyor?',
          blocks: [
            {
              table: {
                head: ['', 'Kuzey yarımküre', 'Güney yarımküre'],
                rows: [
                  ['Hareket eden havanın sapması', 'sağa', 'sola'],
                  ['**Alçak** basınç çevresinde rüzgâr', 'saat yönünün tersine', 'saat yönünde'],
                  ['**Yüksek** basınç çevresinde rüzgâr', 'saat yönünde', 'saat yönünün tersine'],
                  ['Ticaret rüzgârları', 'kuzeydoğu', 'güneydoğu'],
                  ['Buys Ballot: sırtın rüzgâra dönükken alçak basınç…', 'solunda', 'sağında'],
                  ['Soğuk cephe geçince rüzgâr…', 'sağa döner – veer (ör. SW → NW)', 'sola döner – back (ör. NW → SW)'],
                  ['Yaz ayları', 'Haziran–Ağustos', 'Aralık–Şubat'],
                  ['Tropik fırtına mevsimi', 'Haziran–Kasım', 'Kasım–Nisan'],
                ],
              },
            },
            { tip: 'Kuşaklar Güneş’le birlikte kayar: kuzey yazında yaklaşık 5–10° kuzeye, kuzey kışında güneye. Bu yüzden Karayipler’e alize geçişleri Kasım–Ocak’ta yapılır.' },
          ],
        },
      ],
    },

    pressure: {
      title: 'Basınç: yüksekler, alçaklar ve Buys Ballot',
      short: 'Yüksek ve alçak',
      sections: [
        {
          h: 'Hava basıncı ve barometre',
          blocks: [
            {
              p: 'Hava basıncı, üstündeki havanın ağırlığıdır ve **hektopaskal (hPa)** ile ölçülür – milibarla aynıdır. Ortalama deniz seviyesi basıncı yaklaşık **1013 hPa**’dır; derin alçaklar 960’ın altına iner, güçlü yüksekler 1040’ı geçer. "Yüksek" ve "alçak" her zaman çevreye göredir.',
            },
            {
              list: [
                'Barometreyi **her saat ya da her vardiyada** deftere yaz. Sayıdan çok eğilim önemlidir.',
                '**3 saatte 3 hPa veya daha fazla** düşüş rüzgârın geldiğini gösterir; 6 hPa veya daha fazlası – fırtına bekle.',
                'Cepheden sonra hızlı bir yükseliş de kuvvetli ve hamleli rüzgâr getirir.',
              ],
            },
          ],
        },
        {
          h: 'Yüksek ve alçak basınçlar',
          blocks: [
            {
              table: {
                head: ['', 'Yüksek (antisiklon)', 'Alçak (depresyon)'],
                rows: [
                  ['Hava', 'çöker, ısınır, kurur', 'yükselir, soğur, bulut oluşturur'],
                  ['Hava durumu', 'sakin, az bulut; sis veya pus olabilir', 'bulut, yağmur, cepheler, daha kuvvetli rüzgâr'],
                  ['İzobarlar', 'genelde seyrek → hafif rüzgâr', 'çoğu zaman sık → kuvvetli rüzgâr'],
                  ['Hareket', 'yavaş, günlerce durabilir ("blokaj")', 'genelde 15–40 kn ile doğuya ilerler'],
                  ['Rüzgâr (KY / GY)', 'saat yönünde / tersine, dışarı doğru sarmal', 'saat yönünün tersine / saat yönünde, içeri doğru sarmal'],
                ],
              },
            },
            { ww: 'pressure' },
            {
              p: 'Yukarıda (yaklaşık 1 km) rüzgâr izobarlar **boyunca** eser – basınç itmesi ile Coriolis’in dengesi **jeostrofik rüzgârı** verir. Yüzeyde sürtünme rüzgârı yavaşlatır; Coriolis onu daha az saptırır ve rüzgâr **izobarları kesip alçağa doğru** eser: **denizde yaklaşık 10–20°**, **karada 30–40°**; denizde yaklaşık üçte bir daha yavaş.',
            },
          ],
        },
        {
          h: 'Buys Ballot kuralı',
          blocks: [
            { p: '**Sırtını gerçek rüzgâra dön: kuzey yarımkürede alçak basınç solundadır (biraz da önünde); güney yarımkürede sağındadır.** Harita gerekmez – kötü havanın nerede olduğunu söyler.' },
            { ww: 'buys' },
            { warn: 'Yüzeydeki gerçek rüzgârı kullan, bulutların hareketini değil. Yukarıdaki bulutlar oradaki rüzgârla gider; bu çok farklı olabilir.' },
          ],
        },
      ],
    },

    isobars: {
      title: 'İzobar okumak: haritadan rüzgâr',
      short: 'İzobarlar',
      sections: [
        {
          h: 'İzobar nedir?',
          blocks: [
            {
              list: [
                '**İzobar**, deniz seviyesi basıncı aynı olan yerleri birleştiren çizgidir. Haritalarda genelde **4 hPa**’da bir çizilir (1000, 1004, 1008…).',
                '**Sık izobar = kuvvetli rüzgâr; seyrek izobar = hafif rüzgâr.** Tıpkı bir tepenin eş yükselti çizgileri gibi: dik yamaç, hızlı akış.',
                'Rüzgâr neredeyse izobarlar boyunca eser; alçak solda kalır (KY), denizde 10–20° içeri döner.',
                'Aynı aralıkta rüzgâr **alçak enlemlerde daha kuvvetlidir** (Coriolis zayıftır); 4 hPa’lık aralık 40°’de 60°’dekinden daha çok rüzgâr demektir.',
              ],
            },
            { ww: 'isobars' },
          ],
        },
        {
          h: 'Haritadan rüzgâr ölçmek',
          blocks: [
            {
              steps: [
                'Haritada konumunu bul.',
                'İki yanındaki izobarlar arasındaki mesafeyi, izobarlara dik olarak ölç (enlem ölçeği: 1′ = 1 mil).',
                'Haritadaki ölçekten (ya da yukarıdaki hesaplayıcıdan) **jeostrofik rüzgârı** oku.',
                'Denizde yüzey rüzgârı için yaklaşık üçte bir azalt (karada yarıya), alçağa doğru 15° çevir.',
                'Hamleleri ekle: kararlı havada yaklaşık +%30, sağanaklı kararsız havada +%50 veya fazlası.',
              ],
            },
            {
              ex: {
                title: '50° N’de örnek',
                lines: ['İzobarlar 4 hPa arayla, 120 mil uzaklıkta.', 'Jeostrofik rüzgâr ≈ **25 kn**.', 'Yüzey rüzgârı ≈ 25 × ⅔ ≈ **17 kn** (kuvvet 5), sağanaklarda hamleler ≈ 25 kn.', 'Yön: izobarlar boyunca, alçak solda, 15° içeri dönük.'],
              },
            },
          ],
        },
        {
          h: 'Rüzgârın sağa ve sola dönmesi (veer / back)',
          blocks: [
            {
              list: [
                '**Veering**: rüzgâr **saat yönünde** döner (ör. S → SW → W). KY’de genelde bir cephe veya oluk geçmiş demektir.',
                '**Backing**: rüzgâr **saat yönünün tersine** döner (ör. W → SW → S). KY’de düşen barometreyle backing çoğu zaman bir alçağın yaklaştığını gösterir.',
                'Bu terimler iki yarımkürede de aynı anlamdadır – ama onları yaratan hava ayna görüntüsüdür.',
              ],
            },
          ],
        },
        {
          h: 'Sırt, oluk ve col',
          blocks: [
            {
              table: {
                head: ['Şekil', 'Haritada', 'Hava'],
                rows: [
                  ['**Sırt (ridge)**', 'İzobarlar yüksek basınçtan dışarı doğru şişer', 'İki alçak arasında kısa bir güzel hava'],
                  ['**Oluk (trough)**', 'İzobarlar alçaktan V şeklinde bükülür (çoğu zaman bir çizgi)', 'Geçerken sağanak, hamle ve rüzgâr dönüşü (KY’de veer)'],
                  ['**Col**', 'İki yüksek ve iki alçak arasındaki eyer', 'Hafif, değişken rüzgâr; sis ya da oraj olabilir'],
                  ['**İkincil alçak**', 'Büyük bir alçağın kenarında küçük bir alçak', 'Hızla derinleşip beklenmedik fırtınalar verebilir'],
                ],
              },
            },
          ],
        },
      ],
    },

    airmass: {
      title: 'Hava kütleleri ve kararlılık',
      short: 'Hava kütleleri',
      sections: [
        {
          h: 'Hava nereden geliyor?',
          blocks: [
            {
              p: '**Hava kütlesi**, geldiği yerin sıcaklık ve nemini almış devasa bir hava kütlesidir. Hangisinin içinde olduğunu bilmek görüş, bulut ve hamleler hakkında çok şey söyler.',
            },
            {
              table: {
                head: ['Hava kütlesi', 'Kaynak', 'Özelliği', 'Denizde tipik hava'],
                rows: [
                  ['**Arktik (A)**', 'Arktik buzları', 'çok soğuk, kuru', 'kar sağanakları, aralarda çok iyi görüş'],
                  ['**Kutup denizel (Pm)**', 'Kuzey Atlantik', 'serin, nemli, kararsız', 'kümülüs, sağanaklar, hamleli, iyi görüş'],
                  ['**Tropik denizel (Tm)**', 'Azorlar bölgesi', 'ılık, nemli, kararlı', 'alçak bulut, çisenti, kötü görüş, ilkbaharda deniz sisi'],
                  ['**Kutup karasal (Pc)**', 'Sibirya, kış', 'çok soğuk, kuru', 'dondurucu E rüzgârları, açık ya da denizde alçak gri bulut'],
                  ['**Tropik karasal (Tc)**', 'Sahra, yaz', 'sıcak, kuru', 'pus, sıcak dalgaları, kenarlarında oraj'],
                ],
              },
            },
          ],
        },
        {
          h: 'Kararlı ve kararsız hava',
          blocks: [
            {
              table: {
                head: ['', 'Kararlı', 'Kararsız'],
                rows: [
                  ['Ne oluyor?', 'Ilık hava daha soğuk yüzeyin üstünde – yükselemez', 'Soğuk hava daha ılık yüzeyin üstünde – yükselen kabarcıklar büyür'],
                  ['Bulut', 'düz katmanlar (stratus, stratokümülüs)', 'kabarık bulutlar (kümülüs, kümülonimbüs)'],
                  ['Yağış', 'çisenti, hafif yağmur', 'sağanak, dolu, gök gürültüsü'],
                  ['Görüş', 'kötü, pus ve sis', 'iyi, sağanaklar hariç'],
                  ['Rüzgâr', 'düzenli, az hamle', 'hamleli; büyük bulutların altında sağanaklar'],
                ],
              },
            },
            { tip: 'Pratik kural: berrak hava ve pamuk gibi bulutlar = hamleli, camadan hazır seyret. Gri bulanık hava = düzenli rüzgâr ama sise dikkat.' },
          ],
        },
      ],
    },

    clouds: {
      title: 'Bulutlar: gökyüzünü okumak',
      short: 'Bulutlar',
      sections: [
        {
          h: 'Dört ailede on bulut tipi',
          blocks: [
            {
              p: 'Bulutlar **yüksekliğe** (cirro- yüksek, alto- orta) ve **şekle** (cumulus kabarık, stratus katman, nimbus yağışlı) göre adlandırılır. On temel tipi ve her birinin ne haber verdiğini öğren – çizimdeki bulutlara tıkla.',
            },
            { ww: 'clouds' },
          ],
        },
        {
          h: 'Gökyüzü sana ne söylüyor?',
          blocks: [
            {
              table: {
                head: ['Görürsen', 'Genelde anlamı'],
                rows: [
                  ['Batıdan yayılan, kalınlaşan sirrüs', '12–24 saat içinde sıcak cephe ve alçak basınç'],
                  ['Güneş ya da ay çevresinde hale (sirrostratus)', 'yaklaşık 12 saat içinde yağmur olası'],
                  ['Gök alçalıyor, güneş soluklaşıyor (altostratus)', 'birkaç saat içinde yağmur'],
                  ['Kümülüsler öğleye doğru yükseliyor', 'öğleden sonra sağanak ya da oraj'],
                  ['Örs tepeli kümülonimbüs', 'yakında sağanak, şiddetli yağmur, dolu, şimşek'],
                  ['Çisentili alçak gri örtü', 'sıcak sektör ya da nemli kararlı hava; kötü görüş'],
                  ['Akşam yassılaşan güzel hava kümülüsü', 'yerleşik güzel hava'],
                ],
              },
            },
          ],
        },
        {
          h: 'İşe yarayan eski sözler',
          blocks: [
            {
              list: [
                '**"Uskumru gökyüzü ve kısrak kuyrukları, büyük gemileri yelken indirtir"** – cepheden önceki sirrokümülüs ve sirrüs.',
                '**"Akşam kızıllığı, denizcinin sevinci"** – batı rüzgârları kuşağında, gün batımında batının açık olması.',
                '**"Uzun haberli uzun sürer; kısa haberli çabuk geçer"** – yavaş düşen barometre uzun bir rüzgâr, ani düşüş kısa ve sert bir rüzgâr getirir.',
                '**"Alçaktan sonra ilk yükseliş, daha sert bir rüzgârın habercisi"** – rüzgâr çoğu zaman soğuk cephenin hemen arkasında en kuvvetlidir.',
              ],
            },
            { warn: 'Bir kümülonimbüs, limondan 40 kn ve üstü hamleler üretebilir. Erken camadan vur, karanlık tabanından ve yağmur perdesinden uzak dur.' },
          ],
        },
      ],
    },

    fronts: {
      title: 'Cepheler ve alçak basınçlar',
      short: 'Cepheler',
      sections: [
        {
          h: 'Sinoptik harita sembolleri',
          blocks: [{ p: 'Cepheler, hareket ettikleri tarafa çizilen sembollerle gösterilir. Ne anlama geldiğini görmek için her sembole tıkla.' }, { ww: 'symbols' }],
        },
        {
          h: 'Özetle cepheler',
          blocks: [
            {
              table: {
                head: ['Cephe', 'Ne oluyor?', 'Hava', 'Rüzgâr (KY)'],
                rows: [
                  ['**Sıcak cephe**', 'ılık hava soğuk havanın üstüne yumuşak bir eğimle (≈ 1:150) tırmanır', '12–24 saat bulut alçalır, sonra sürekli yağmur', 'önünde back eder ve kuvvetlenir, geçerken veer eder'],
                  ['**Soğuk cephe**', 'soğuk hava ılık havanın altına girer, dik eğim (≈ 1:50)', 'dar bir şiddetli yağmur ve sağanak bandı, sonra açılma', 'keskin veer, hamleler, barometre fırlar'],
                  ['**Okluzyon cephesi**', 'soğuk cephe sıcak cepheye yetişmiştir', 'karışık: yağmur kuşağı, alçak genelde en güçlü dönemini geçmiştir', 'veer eder'],
                ],
              },
            },
          ],
        },
        {
          h: 'Bir alçak basıncın hayatı',
          blocks: [
            {
              steps: [
                'Soğuk kutup havası ile ılık tropik hava arasındaki **kutup cephesinde** bir kıvrım oluşur.',
                'Kıvrım bir dalgaya dönüşür: önde **sıcak cephe**, arkada **soğuk cephe**, aralarında **sıcak sektör**.',
                'Merkezde basınç düşer ve alçak ilerler, çoğu zaman 20–30 kn ile doğuya ya da kuzeydoğuya.',
                'Daha hızlı soğuk cephe sıcak cepheye yetişir: **okluzyon** oluşur ve alçak yavaşça dolar.',
                'Geride kalan soğuk cephe üzerinde çoğu zaman yeni alçaklar doğar – yaklaşık birer gün arayla bir alçak basınç **ailesi**.',
              ],
            },
          ],
        },
        {
          h: 'Bir alçak basınç üzerinden geçerken',
          blocks: [
            { p: '**Oynat**’a bas ve tipik bir kuzey yarımküre alçağının, merkezinin güneyinden bir teknenin üzerinden geçişini izle. Panel mürettebatın ne gördüğünü ve barometrenin ne yaptığını gösterir.' },
            { ww: 'passage' },
            {
              table: {
                head: ['Aşama', 'Gökyüzü', 'Barometre', 'Rüzgâr (KY)', 'Görüş'],
                rows: [
                  ['Sıcak cepheden önce', 'Ci → Cs (hale) → As → Ns', 'düşüyor', 'S/SE’ye back eder, kuvvetlenir', 'iyi, sonra yağmurda kötü'],
                  ['Sıcak cephe geçer', 'Ns, alçak St', 'düşüş yavaşlar', 'SW’ye veer eder', 'kötü'],
                  ['Sıcak sektör', 'St, Sc, çisenti', 'sabit ya da yavaş düşüş', 'düzenli SW', 'orta-kötü, sis'],
                  ['Soğuk cephe geçer', 'Cb, şiddetli yağmur, sağanaklar', 'hızla yükselir', 'W/NW’ye veer eder, hamleler', 'yağmurda çok kötü'],
                  ['Soğuk cepheden sonra', 'Cu, sağanaklar, mavi gök', 'yükseliyor', 'NW, hamleli', 'çok iyi'],
                ],
              },
            },
            { tip: 'Merkezin kuzeyinde sıra farklıdır: rüzgâr sıcak sektör olmadan sürekli back eder (E → N → NW) – çoğu zaman uzun bir yağmur dönemi.' },
          ],
        },
        {
          h: 'Güney yarımkürede',
          blocks: [
            {
              p: 'Her şey ayna görüntüsüdür. Alçaklar **saat yönünde** döner, sıcak sektör alçağın **ekvator tarafında (kuzeyinde)** kalır ve soğuk cephe geçerken rüzgâr **NW’den SW’ye – yani back eder**. Hikâyenin geri kalanı – alçalan bulut, düşen barometre, soğuk cephede sağanaklar, arkasında berrak ve sağanaklı hava – aynıdır.',
            },
          ],
        },
      ],
    },

    local: {
      title: 'Yerel rüzgârlar, kıyılar ve sis',
      short: 'Yerel etkiler',
      sections: [
        {
          h: 'Deniz meltemi ve kara meltemi',
          blocks: [
            {
              p: 'Güneşli bir günde kara, denizden çok daha hızlı ısınır. Karanın üstünde ılık hava yükselir, yerine denizden serin hava akar: **deniz meltemi** (imbat). Öğleye doğru başlar, öğleden sonra en güçlü olur (çoğu zaman 10–15 kn, bazen daha fazla) ve gün batımında söner. Gece kara deniz sıcaklığının altına soğur ve daha zayıf bir **kara meltemi** denize doğru eser.',
            },
            { ww: 'seabreeze' },
            {
              list: [
                'Güneş ve kara–deniz arasında en az yaklaşık **5 °C** fark gerekir.',
                'Yaklaşık **15 kn** üstü karadan esen gradyan rüzgârı onu durdurur; hafif karadan rüzgâr onu geciktirir ve açıkta limonlu bir bölge oluşturur.',
                'KY’de öğleden sonra boyunca **veer eder** (tam karaya doğru yönün sağına döner).',
                'Kıyıda biten, kara üstündeki kümülüsler meltemin estiğinin işaretidir.',
              ],
            },
          ],
        },
        {
          h: 'Kıyı rüzgârı değiştirir',
          blocks: [
            {
              table: {
                head: ['Etki', 'Ne oluyor?'],
                rows: [
                  ['**Burunlar**', 'rüzgâr çevrelerinde hızlanır, çoğu zaman 5–10 kn daha kuvvetli; akıntı çatışmalarında deniz kabarır'],
                  ['**Huni etkisi**', 'rüzgâr boğazlarda ve vadilerde sıkışır ve hızlanır'],
                  ['**Yakınsama / ıraksama**', 'rüzgâraltına bakarken kıyı sağdaysa (KY) sürtünme akışı sıkıştırır → daha çok rüzgâr; soldaysa → daha az'],
                  ['**Rüzgâr gölgesi**', 'yalıyar ve adaların arkasında limonlu bölge, rüzgârın tekrar indiği yerde hamleler'],
                  ['**Katabatik rüzgâr**', 'gece vadilerden aşağı akan soğuk hava – fiyortlarda ve dağ koylarında sert hamleler'],
                ],
              },
            },
          ],
        },
        {
          h: 'Sis',
          blocks: [
            {
              table: {
                head: ['Tip', 'Nasıl oluşur?', 'Ne zaman kalkar?'],
                rows: [
                  ['**Adveksiyon (deniz) sisi**', 'ılık nemli hava soğuk denizin üstünde – ilkbahar ve yaz başı', 'sadece hava kütlesi değişince; rüzgâr onu dağıtMAZ'],
                  ['**Radyasyon sisi**', 'açık ve rüzgârsız gecelerde kara soğur; nehirlerden ve limanlardan denize süzülür', 'genelde öğleden önce güneşle dağılır'],
                  ['**Cephe sisi**', 'sıcak cepheden önce soğuk havaya düşen yağmur', 'cephe geçince'],
                  ['**Deniz dumanı**', 'daha ılık suyun üstünde çok soğuk hava', 'hava ısınınca'],
                ],
              },
            },
          ],
        },
        {
          h: 'Akdeniz ve Türkiye rüzgârları',
          blocks: [
            {
              table: {
                head: ['Rüzgâr', 'Nerede', 'Özelliği'],
                rows: [
                  ['**Meltem (Meltemi, Etesian)**', 'Ege, yaz', 'N–NW, 20–30 kn, öğleden sonra en kuvvetli; Temmuz–Ağustos’ta günlerce'],
                  ['**Poyraz**', 'Türkiye, Karadeniz, Marmara', 'NE, soğuk ve kuvvetli, Boğaz’da kısa dik bir deniz yapabilir'],
                  ['**Lodos**', 'Marmara, Ege', 'SW, ılık, fırtına şiddetine çıkabilir ve açık limanlara büyük deniz basar'],
                  ['**Karayel**', 'Türkiye', 'NW, soğuk, çoğu zaman cepheden sonra'],
                  ['**İmbat**', 'İzmir, Ege kıyısı', 'yazın öğleden sonra esen batılı deniz meltemi'],
                  ['**Mistral**', 'Lion Körfezi', 'N–NW, Rhône vadisinden hunileşir, güneşli havada 40 kn’u geçebilir'],
                  ['**Bora**', 'Adriyatik', 'NE, dağlardan şiddetli hamleler, neredeyse habersiz gelebilir'],
                  ['**Kıble / Sirocco**', 'Kuzey Afrika’dan', 'S–SE, sıcak, tozlu ya da nemli, kötü görüş'],
                ],
              },
            },
          ],
        },
        {
          h: 'Sağanaklar ve oraj',
          blocks: [
            {
              list: [
                'Sağanak (squall), rüzgârın ani artışıdır (en az 16 kn fazla, bir dakika veya daha uzun) – genelde bir kümülonimbüsün altında ya da soğuk cephe boyunca.',
                'Rüzgârüstünden yaklaşan karanlık bir bulut yayına ve suyun üstünde beyaz bir çizgiye dikkat et.',
                'Gelmeden **önce** camadan vur ya da cenovayı sar; rüzgâraltına dön ya da tekneyi durdur (heave to); gözcüleri tut – yağmurda görüş sıfıra inebilir.',
                'Şimşekte: aşağıda kal, direk ve armadan uzak dur, mümkünse elektronikleri sök.',
              ],
            },
          ],
        },
      ],
    },

    beaufort: {
      title: 'Beaufort ölçeği, hamleler ve dalgalar',
      short: 'Beaufort',
      sections: [
        {
          h: 'Limondan kasırgaya',
          blocks: [
            {
              p: 'Amiral Beaufort’un ölçeği, rüzgârın şiddetini denize yaptığı etkiyle tarif eder – böylece cihaz olmadan tahmin edebilirsin. Tahminler bunu sürekli kullanır: "southwest 5 to 7" Beaufort’tur. Kaydırıcıyı oynat, denizin büyüdüğünü izle.',
            },
            { ww: 'beaufort' },
          ],
        },
        {
          h: 'Hamleler',
          blocks: [
            {
              list: [
                'Tahmindeki rüzgâr **ortalama** hızdır. Hamleler tipik olarak **%30–50 daha yüksektir** – kararsız havada, sağanakların yanında ve tepelerin rüzgâraltında daha fazla.',
                'Ortalama rüzgâra değil, **hamlelere** göre camadan vur. İyi bir alışkanlık: hamleler rahatlık sınırına gelince camadan.',
                'Orsada görünür rüzgâr daha kuvvetlidir: 15 kn gerçek rüzgâr orsada 20 kn, pupada 10 kn gibi hissedilir.',
              ],
            },
          ],
        },
        {
          h: 'Dalgaları ne yapar?',
          blocks: [
            {
              list: [
                '**Rüzgâr hızı, fetch** (rüzgârüstündeki açık su) ve **süre** – rüzgâr ne kadar uzun ve uzaktan eserse deniz o kadar büyür.',
                '**Akıntıya karşı rüzgâr** dalgaları kısa ve dik yapar; 2 kn akıntıya karşı kuvvet 5, kuvvet 7 gibi hissettirebilir.',
                '**Sığ su** ve burunlardaki **akıntı çatışmaları** dik, kırılan dalgalar yapar.',
                '**Soluğan** uzak fırtınalardan çok uzağa gider; rüzgârdan önce gelebilir.',
              ],
            },
            { tip: 'Day Skipper tekne ve mürettebatı için: kuvvet 6 üstünde limanda olmayı planla, akıntıya karşı kuvvet 5’i de iyi düşün.' },
          ],
        },
      ],
    },

    tropical: {
      title: 'Tropik fırtınalar ve okyanus geçişleri',
      short: 'Tropikler ve okyanus',
      sections: [
        {
          h: 'Tropik dönen fırtınalar',
          blocks: [
            {
              p: 'Ekvatordan kabaca 5° ile 25° arasında, yaklaşık **27 °C**’den sıcak denizlerin üstünde, bir oraj kümesi **tropik dönen fırtınaya** dönüşebilir – sakin bir gözün çevresinde 64 kn ve üstü rüzgârlar. Alizelerle batıya giderler, sonra çoğu zaman kutba ve doğuya doğru kıvrılırlar.',
            },
            {
              table: {
                head: ['Adı', 'Nerede', 'Mevsim'],
                rows: [
                  ['Hurricane (kasırga)', 'Kuzey Atlantik, Karayipler, KD Pasifik', 'Haziran – Kasım (zirve Ağu–Eki)'],
                  ['Tayfun', 'KB Pasifik', 'tüm yıl, zirve Tem–Kas'],
                  ['Siklon', 'Hint Okyanusu, Güney Pasifik, Avustralya', 'Kas – Nis (G), Mayıs ve Eki–Kas (K Hint Okyanusu)'],
                ],
              },
            },
            { ww: 'trs' },
          ],
        },
        {
          h: 'Kaçış kuralları',
          blocks: [
            {
              table: {
                head: ['Neredesin?', 'Kuzey yarımküre', 'Güney yarımküre'],
                rows: [
                  ['**Tehlikeli yarım daire**', 'izin sağında; rüzgâr **veer eder** – rüzgârı **sancak baştan** al ve olabildiğince yol yap', 'izin solunda; rüzgâr **back eder** – rüzgârı **iskele baştan** al'],
                  ['**Seyredilebilir yarım daire**', 'izin solunda; rüzgâr **back eder** – rüzgârı **sancak kıçtan** al', 'izin sağında; rüzgâr **veer eder** – rüzgârı **iskele kıçtan** al'],
                  ['**Tam yolunun önünde**', 'rüzgârın yönü sabit, kuvvetleniyor, barometre düşüyor – rüzgâr **sancak kıçta**, seyredilebilir yarım daireye kaç', 'aynısı, rüzgâr **iskele kıçta**'],
                ],
              },
            },
            { warn: 'En iyi taktik orada olmamaktır: okyanus geçişlerini fırtına mevsimi dışında planla ve National Hurricane Center ya da yerel uyarı merkezinin tahminlerini izle.' },
          ],
        },
        {
          h: 'Alize geçişini planlamak',
          blocks: [
            {
              steps: [
                '**Önce mevsim**: Kanarya Adaları → Karayipler geçişi kasırga mevsiminden sonra, genelde Kasım sonu – Ocak arası başlar.',
                '**"Tereyağı eriyene kadar güneye git, sonra sağa dön"**: Cabo Verde’nin yanından güneybatıya, yaklaşık 15–20° N’ye in, sonra batıya dön – düzenli alizelere gir ve Azor yüksek basıncının hafif rüzgârlarından uzak kal.',
                '**Yüksek basınçtan kaçın**: doğrudan (büyük daire) rota onun rüzgârsız merkezine girer.',
                '**Doldrums’tan kaçın**: çok güneye inersen ITCZ ile karşılaşırsın – limon ve sağanaklar.',
                'Alizelerde **geceleri sağanak** ve haftalarca kıçtan soluğan bekle: yelken planını ve sürtünme korumasını hazırla.',
              ],
            },
            { tip: 'Alıştırmalarda kendin dene: bir geçiş planla, teknenin rüzgâr alanında nasıl ilerlediğini izle.' },
          ],
        },
      ],
    },

    forecasts: {
      title: 'Tahminler ve çık/çıkma kararı',
      short: 'Tahminler',
      sections: [
        {
          h: 'Hava durumu nereden alınır?',
          blocks: [
            {
              table: {
                head: ['Kaynak', 'Ne verir?', 'İpucu'],
                rows: [
                  ['**Shipping forecast (deniz bölgeleri)**', 'deniz bölgeleri, 24 saat, fırtına uyarıları', 'standart dil – aşağıdaki terimleri öğren'],
                  ['**Kıyı suları tahmini**', 'kıyıdan 12 mile kadar, daha ayrıntılı', 'günlük kıyı seyirleri için en iyisi'],
                  ['**Sahil Güvenlik / VHF MSI**', 'Kanal 16’da anonstan sonra bir çalışma kanalında yayın', 'saatleri seyir planına yaz'],
                  ['**Navtex**', 'yazılı ya da ekranda tahminler ve uyarılar', 'açık denizde internetsiz çalışır'],
                  ['**Sinoptik haritalar**', '5 güne kadar analiz ve tahmin haritaları', 'örüntünün nasıl geliştiğini gösterir'],
                  ['**GRIB dosyaları / uygulamalar**', 'bilgisayar modeli rüzgâr ve basınç ızgaraları', 'düzenli ve ayrıntılı – ama aşağıdaki uyarılara bak'],
                ],
              },
            },
            { ww: 'forecast' },
          ],
        },
        {
          h: 'GRIB verisi: faydalı ama…',
          blocks: [
            {
              list: [
                'Modeller birkaç kilometrelik ızgarada **ortalama** rüzgâr verir – hamleleri, sağanakları, burunları ve huni etkisini kaçırırlar.',
                'Cepheler modelden saatlerce önce ya da sonra gelebilir.',
                'İki modeli ve resmî tahmini karşılaştır; uyuşmuyorlarsa belirsizlik yüksektir.',
                'Her zaman **gerçekle** karşılaştır: barometre, gökyüzü ve şu an aldığın rüzgâr.',
              ],
            },
          ],
        },
        {
          h: 'Kararı vermek',
          blocks: [
            {
              steps: [
                'Tüm seyir için, birkaç saatlik emniyet payıyla tahmin al.',
                '**En kötü** beklenen koşullara bak: hamleler, akıntıya karşı rüzgâr, en kuvvetli dönem.',
                'Bunları ekibin **en zayıf** halkasıyla karşılaştır: mürettebat, tekne, kaptanın deneyimi.',
                'Kaçış limanlarını ve camadan noktalarını planla; neyin seni geri döndüreceğine önceden karar ver.',
                'Emin değilsen çıkma – ya da daha kısa, daha korunaklı bir plan seç.',
              ],
            },
            {
              ex: {
                title: 'Örnek',
                lines: [
                  'Tahmin: SW 4 to 5, increasing 6 later. Showers. Good.',
                  '"Later" = 12 saatten fazla sonra. Şimdi çıkan 6 saatlik bir seyir 4–5 içinde kalır.',
                  'Showers = kararsız hava: 25 kn’a kadar hamle bekle. Bir camadanla çık.',
                  'Akşamdan çok önce limanda olmayı planla; SW 6’da güvenli bir liman seç.',
                ],
              },
            },
          ],
        },
      ],
    },

    drills: {
      title: 'Zihin egzersizleri',
      short: 'Egzersizler',
      sections: [
        { h: 'Sinoptik haritayı oku', blocks: [{ p: 'Üç harita – ikisi kuzey, biri güney yarımküreden. Soruları izobarlar, cepheler ve Buys Ballot ile cevapla.' }, { wd: 'synoptic' }] },
        { h: 'Bir okyanus geçişi planla', blocks: [{ p: 'Gran Canaria’dan St Lucia’ya, yaklaşık 2.700 mil. Ayı seç, haritaya tıklayarak waypoint ekle ve yelken aç: tekne Azor yüksek basıncı ve alizelerin rüzgâr alanında seyreder. Klasik rotayı geçebilir misin?' }, { wd: 'route' }] },
        { h: 'Alçak basıncı doğru sıraya diz', blocks: [{ wd: 'order' }] },
        { h: 'Kuvvet kaç?', blocks: [{ wd: 'beaufortGuess' }] },
        { h: 'Bu bulut ne?', blocks: [{ wd: 'cloudGuess' }] },
        { h: 'Alçak basınç nerede?', blocks: [{ wd: 'buysDrill' }] },
        { h: 'Fırtınadan kaç', blocks: [{ wd: 'trsDrill' }] },
        { h: 'Çık mı, çıkma mı?', blocks: [{ wd: 'gonogo' }] },
      ],
    },
  },

  check: [
    {
      q: 'Kuzey yarımkürede sırtını rüzgâra döndün. Alçak basınç nerede?',
      options: ['Solunda, biraz önde', 'Sağında', 'Tam önünde', 'Arkanda'],
      answer: 0,
      why: 'Buys Ballot: KY – alçak solda; GY – alçak sağda.',
    },
    {
      q: 'Tahmin haritasında izobarlar sıklaşıyor. Rüzgâra ne olur?',
      options: ['Kuvvetlenir', 'Hafifler', 'Limona döner', 'Hiçbir şey – sadece yön değişir'],
      answer: 0,
      why: 'Sık izobar, dik basınç gradyanı ve kuvvetli rüzgâr demektir.',
    },
    {
      q: 'Hangi bulut sırası yaklaşan bir sıcak cepheyi haber verir?',
      options: ['Sirrüs → sirrostratus → altostratus → nimbostratus', 'Kümülüs → kümülonimbüs → kümülüs', 'Stratus → sis → stratus', 'Kümülonimbüs → sirrüs → açık gök'],
      answer: 0,
      why: 'Sıcak cephe yüzeyi yumuşak eğimlidir; yüksek bulut bir gün öncesine kadar önce gelir.',
    },
    {
      q: 'Kuzey yarımkürede bir soğuk cephe geçiyor. Rüzgâr genelde ne yapar?',
      options: ['Hamlelerle keskin veer eder, ör. SW’den NW’ye', 'W’den S’ye back eder', 'Limona döner', 'Aynı kalır'],
      answer: 0,
      why: 'Keskin veer, sağanaklar ve yükselen barometre soğuk cephenin işaretleridir (GY’de back eder).',
    },
    {
      q: 'Güney yarımkürede ticaret rüzgârları hangi yönden eser?',
      options: ['Güneydoğu', 'Kuzeydoğu', 'Batı', 'Güneybatı'],
      answer: 0,
      why: 'Ekvatora akan hava GY’de sola sapar; alizeler SE’den gelir.',
    },
    {
      q: 'Beaufort ölçeğinde kuvvet 6 nedir?',
      options: ['Kuvvetli rüzgâr (strong breeze), 22–27 kn', 'Fırtına (gale), 34–40 kn', 'Orta rüzgâr, 11–16 kn', 'Serin rüzgâr, 17–21 kn'],
      answer: 0,
      why: 'K4 orta, K5 serin, K6 kuvvetli rüzgâr, K7 fırtınaya yakın, K8 fırtına.',
    },
    {
      q: 'Denizde adveksiyon sisi: ne dağıtır?',
      options: ['Hava kütlesinin değişmesi, ör. bir cephenin geçmesi', 'Daha fazla rüzgâr', 'Sabah güneşi', 'Cezir'],
      answer: 0,
      why: 'Deniz sisi soğuk denizin üstünde ılık nemli havada oluşur ve epey kuvvetli rüzgârda bile sürebilir.',
    },
    {
      q: 'Tahmin "gale imminent" diyor. Fırtına ne zaman bekleniyor?',
      options: ['6 saat içinde', '6–12 saat içinde', '12 saatten sonra', 'Şu anda esiyor'],
      answer: 0,
      why: 'Imminent < 6 sa, soon 6–12 sa, later > 12 sa.',
    },
    {
      q: 'Kanarya Adaları’ndan Karayipler’e doğrudan rota neden çoğu zaman daha uzun sürer?',
      options: ['Azor yüksek basıncının hafif rüzgârlarına yakın geçer', 'Çok daha uzundur', 'Doldrums’a girer', 'Alizelere karşıdır'],
      answer: 0,
      why: 'Önce güneye inmek seni yüksek basıncın rüzgârsız merkezinden uzak, düzenli alizelere sokar.',
    },
    {
      q: 'Kuzey yarımkürede bir kasırganın tehlikeli yarım dairesindesin. Nasıl seyredersin?',
      options: ['Rüzgâr sancak başta, olabildiğince yol yaparak', 'Rüzgâr iskele kıçta', 'Tam pupa kaçarak', 'Tekneyi durdurup bekleyerek'],
      answer: 0,
      why: 'Bu seni izden uzaklaştırır; seyredilebilir yarım dairede rüzgârı sancak kıçtan alırsın.',
    },
  ],

  ui: {
    chapters: 'Bölümler',
    disclaimer: 'Buradaki haritalar, alanlar ve sayılar eğitim için basitleştirilmiştir. Gerçek seyirde resmî tahminleri kullan.',
    play: 'Oynat',
    pause: 'Durdur',
    hemi: 'Yarımküre',
    nh: 'Kuzey',
    sh: 'Güney',
    correct: 'Doğru!',
    wrong: 'Tam değil.',
    next: 'Sonraki',
    again: 'Tekrar oyna',
    score: '{score}/{max} doğru',
    check: 'Kontrol et',
    round: 'Soru {n} / {m}',
    final: { title: 'Final testi', intro: 'Tüm dersi kapsayan on soru. Seçeneklerin sırası her seferinde karışır.' },
    compass: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
    months: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
    globe: {
      title: 'Küresel dolaşım ve rüzgâr kuşakları',
      month: 'Ay',
      hint: 'Bir kuşağa tıkla. Ayı değiştir, kuşakların Güneş’i izlediğini gör.',
      cells: 'Hadley · Ferrel · Kutup hücreleri',
      bands: {
        polarE: { name: 'Kutup doğu rüzgârları', text: 'Kutuplarda çöken soğuk hava yayılır ve Coriolis ile batıya sapar: kuzeyde E–NE, güneyde E–SE rüzgârları.' },
        subpolar: { name: 'Kutupaltı alçaklar / kutup cephesi', text: 'Soğuk kutup havası güneyden gelen ılık havayla buluşur. Bu cephedeki dalgalar Avrupa’yı geçen alçak basınçlara dönüşür.' },
        westerlies: { name: 'Batı rüzgârları', text: 'Yüksekler ile kutup cephesi arasında rüzgâr çoğunlukla batıdan eser, ardı ardına gelen alçaklarla. Karanın az olduğu güneyde bunlar Kükreyen Kırklar ve Öfkeli Ellilerdir.' },
        horse: { name: 'Subtropik yüksekler (at enlemleri)', text: 'Hava yaklaşık 30°’de çöker: Azor yüksek basıncı gibi büyük, yavaş yüksekler. Hafif rüzgâr, açık gök – karada çöller bunların altındadır.' },
        trades: { name: 'Ticaret rüzgârları (alizeler)', text: 'Ekvatora dönen hava batıya sapar: kuzeyde düzenli NE, güneyde SE alizeleri, 15–25 kn, küçük kümülüslerle.' },
        itcz: { name: 'Doldrums (ITCZ)', text: 'İki alize Güneş’in en çok ısıttığı yerde buluşur. Hava dev kümülonimbüslerle yükselir: limon, şiddetli yağmur ve sağanaklar. Kuzey yazında kuzeye kayar.' },
      },
    },
    pressure: {
      title: 'Yüksek ve alçak basınç çevresinde rüzgâr',
      friction: 'Yüzey',
      frictionOpts: ['yukarıda (sürtünmesiz)', 'denizde', 'karada'],
      high: 'Yüksek',
      low: 'Alçak',
      note: 'Yukarıda rüzgâr izobarları izler. Sürtünme onu yavaşlatır ve alçağa doğru içeri çevirir – karada denizden daha fazla.',
    },
    buys: {
      title: 'Buys Ballot kuralı',
      windFrom: 'Rüzgâr nereden',
      rule: 'Sırtın rüzgâra → alçak SOLUNDA ve biraz önde.',
      ruleS: 'Sırtın rüzgâra → alçak SAĞINDA ve biraz önde.',
      low: 'Alçak yaklaşık {b} yönünde',
      high: 'Yüksek',
    },
    isobars: {
      title: 'İzobar aralığı → rüzgâr hızı',
      spacing: '4 hPa’lık izobarlar arası mesafe',
      lat: 'Enlem',
      geo: 'Jeostrofik rüzgâr',
      surface: 'Denizde yüzey rüzgârı',
      force: 'Beaufort',
      note: 'Aralığı yarıya indir, rüzgâr iki katına çıkar. Aynı aralık ekvatora yaklaştıkça daha çok rüzgâr verir.',
    },
    clouds: {
      title: 'Bulut atlası',
      hint: 'Bir buluta tıkla.',
      bands: { high: 'Yüksek bulut > 6 km', mid: 'Orta bulut 2–6 km', low: 'Alçak bulut < 2 km', vertical: 'Dikey gelişen' },
      info: {
        ci: { name: 'Sirrüs (Ci)', text: 'İnce, beyaz, saç gibi buz telleri ("kısrak kuyrukları"). Batıdan artıyor ve kalınlaşıyorsa bir gün içinde cephe gelebilir.' },
        cc: { name: 'Sirrokümülüs (Cc)', text: 'Yükseklerde küçük dalgacıklar – "uskumru gökyüzü". Çoğu zaman sıcak cepheden önce.' },
        cs: { name: 'Sirrostratus (Cs)', text: 'Güneş ya da ay çevresinde hale yapan ince süt beyazı bir tül. Yaklaşık 12 saat içinde yağmur olası.' },
        ac: { name: 'Altokümülüs (Ac)', text: 'Orta seviyede gri-beyaz rulolar ya da yamalar. Yaz sabahı kuleler (castellanus) sonra oraj olacağını haber verir.' },
        as: { name: 'Altostratus (As)', text: 'Gri bir örtü; güneş buzlu camın arkasından gibi görünür. Sıcak cephe birkaç saat uzakta.' },
        ns: { name: 'Nimbostratus (Ns)', text: 'Kalın, karanlık, alçak katman; sürekli yağmur ya da kar. Görüş kötü – sıcak cephe burada.' },
        sc: { name: 'Stratokümülüs (Sc)', text: 'Aralıklı, topaklı gri katman. Genelde kuru; yükseklerde ve sıcak sektörde sık görülür.' },
        st: { name: 'Stratus (St)', text: 'Biçimsiz alçak gri örtü, çisenti, tepeler kaybolur. Kararlı nemli hava – görüşe dikkat.' },
        cu: { name: 'Kümülüs (Cu)', text: 'Düz tabanlı kabarık bulutlar. Küçükleri = güzel hava; yükselen olanlar = sonra sağanak ve hamle.' },
        cb: { name: 'Kümülonimbüs (Cb)', text: 'Örs tepeli dev kuleler: şiddetli sağanak, dolu, gök gürültüsü ve 40 kn üstü hamleli sağanaklar.' },
      },
    },
    symbols: {
      title: 'Sinoptik harita sembolleri',
      hint: 'Bir sembole tıkla.',
      items: {
        cold: { name: 'Soğuk cephe', text: 'Gittiği yöne bakan üçgenli mavi çizgi. Soğuk hava ılık havanın altına girer: sağanaklar, şiddetli yağmur, sonra veer (KY) ve açılma.' },
        warm: { name: 'Sıcak cephe', text: 'Yarım daireli kırmızı çizgi. Ilık hava soğuk havanın üstüne tırmanır: önünde uzun süre alçalan bulut ve yağmur.' },
        occluded: { name: 'Okluzyon cephesi', text: 'Üçgen ve yarım daireleri bir arada olan mor çizgi: soğuk cephe sıcak cepheye yetişmiş. Yağmur kuşağı; alçak genelde olgun.' },
        stationary: { name: 'Durağan cephe', text: 'Karşılıklı taraflarda kırmızı yarım daireler ve mavi üçgenler: cephe neredeyse hareketsiz – uzun bir bulut ve yağmur kuşağı üstünde kalabilir.' },
        trough: { name: 'Oluk', text: 'İzobarların bir alçak çevresinde keskin büküldüğü çizgi. Geçerken sağanaklar, hamleler ve rüzgâr dönüşü.' },
        isobar: { name: 'İzobar', text: 'Eşit basınç çizgisi, hPa ile etiketli, genelde 4 hPa’da bir. Sık = kuvvetli rüzgâr.' },
        high: { name: 'Yüksek (H / antisiklon)', text: 'Değeriyle yüksek basınç merkezi. Yerleşik hava, merkeze yakın hafif rüzgârlar.' },
        low: { name: 'Alçak (L / depresyon)', text: 'Değeriyle alçak basınç merkezi. Bulut, yağmur, cepheler, daha kuvvetli rüzgârlar.' },
      },
      barbs: 'Rüzgâr okları (GRIB ve istasyon gösterimleri)',
      barbsText: 'Gövde rüzgârın geldiği yönü gösterir. Yarım tüy = 5 kn, tam tüy = 10 kn, bayrak = 50 kn.',
    },
    passage: {
      title: 'Bir alçak basınç teknenin üzerinden geçiyor',
      time: 'Zaman',
      hours: '{h} sa',
      labels: { pressure: 'Barometre', tendency: '3 saatlik eğilim', wind: 'Rüzgâr', sky: 'Gökyüzü', weather: 'Hava', vis: 'Görüş', temp: 'Sıcaklık', zone: 'Tekne nerede' },
      tendency: ['sabit', 'yavaşça', '', 'hızla', 'çok hızlı'],
      rising: 'yükseliyor',
      falling: 'düşüyor',
      section: 'Teknenin enlemi boyunca kesit (batı ← → doğu)',
      barograph: 'Teknedeki barograf',
      zones: {
        far: { name: 'Sıcak cepheden çok önde', sky: 'sirrüs, sonra sirrostratus halesi', weather: 'kuru', vis: 'iyi', temp: 'serin' },
        ahead: { name: 'Sıcak cepheden önce', sky: 'altostratus kalınlaşıp nimbostratusa dönüyor', weather: 'yağmur başlıyor, sürekli hale geliyor', vis: 'orta, kötüleşiyor', temp: 'serin' },
        warmFront: { name: 'Sıcak cephe geçiyor', sky: 'alçak nimbostratus ve stratus', weather: 'sürekli yağmur çisentiye dönüyor', vis: 'kötü', temp: 'yükseliyor' },
        warmSector: { name: 'Sıcak sektör', sky: 'stratus ve stratokümülüs', weather: 'çisenti, pus', vis: 'orta-kötü, sis olabilir', temp: 'ılık' },
        coldFront: { name: 'Soğuk cephe geçiyor', sky: 'kümülonimbüs, karanlık sağanak hattı', weather: 'şiddetli yağmur, sağanaklar, belki dolu', vis: 'yağmurda çok kötü', temp: 'hızla düşüyor' },
        behind: { name: 'Soğuk cepheden sonra', sky: 'kümülüs, sağanaklar arasında mavi gök', weather: 'sağanaklar, hamleli', vis: 'çok iyi', temp: 'soğuk' },
      },
    },
    seabreeze: {
      title: 'Gün boyunca deniz meltemi',
      time: 'Günün saati',
      gradient: 'Gradyan rüzgârı (− karadan / + denizden)',
      land: 'Kara',
      sea: 'Deniz',
      result: 'Plajdaki rüzgâr',
      onshore: 'denizden karaya',
      offshore: 'karadan denize',
      calm: 'limon',
      sb: 'Deniz meltemi esiyor',
      lb: 'Kara meltemi esiyor',
      none: 'Yerel meltem yok',
      note: 'Kuvvetli karadan esen gradyan rüzgârı deniz meltemini öldürür; sakin güneşli bir günde 15 kn’a çıkabilir.',
    },
    beaufort: {
      title: 'Beaufort ölçeği',
      force: 'Kuvvet',
      kn: 'Rüzgâr',
      wave: 'Olası dalga yüksekliği',
      names: ['Limon', 'Esinti', 'Hafif rüzgâr', 'Tatlı rüzgâr', 'Orta rüzgâr', 'Serin rüzgâr', 'Kuvvetli rüzgâr', 'Fırtınaya yakın', 'Fırtına', 'Kuvvetli fırtına', 'Tam fırtına', 'Şiddetli fırtına', 'Kasırga'],
      sea: [
        'Deniz ayna gibi.',
        'Pullanma, köpük yok.',
        'Küçük dalgacıklar, tepeler cam gibi, kırılmıyor.',
        'Büyük dalgacıklar, tepeler kırılmaya başlıyor, birkaç beyaz köpük.',
        'Küçük dalgalar, oldukça sık beyaz köpükler.',
        'Orta, daha uzun dalgalar, çok sayıda beyaz köpük, biraz serpinti.',
        'Büyük dalgalar, her yerde beyaz köpüklü tepeler, serpinti olası.',
        'Deniz kabarır, beyaz köpük çizgiler halinde uçar.',
        'Orta yüksek dalgalar, tepeler serpintiye dönüşür, belirgin köpük çizgileri.',
        'Yüksek dalgalar, yoğun köpük çizgileri, tepeler devrilir, serpinti görüşü etkiler.',
        'Uzun sarkan tepeli çok yüksek dalgalar, deniz beyaz görünür, görüş etkilenir.',
        'Olağanüstü yüksek dalgalar, küçük gemiler arkalarında görünmez olur.',
        'Hava köpük ve serpintiyle dolu, deniz tamamen beyaz, görüş çok ciddi etkilenir.',
      ],
      action: [
        'Motorla ya da sürüklen; sonraki rüzgâr için tahmine bak.',
        'Hafif yelkenlerle süzül.',
        'Yeni başlayanlar için keyifli seyir.',
        'İdeal seyir, tam yelken.',
        'İyi seyir; küçük tekneler camadanı düşünmeye başlar.',
        'Anayelkene camadan vur ya da cenovayı biraz sar; gece emniyet kemerleri.',
        'İki camadan, küçük ön yelken; birçok mürettebat için Day Skipper sınırı.',
        'Derin camadan, fırtına floku hazır; mümkünse limanda kal.',
        'Fırtına: sadece yakalandıysan – fırtına yelkenleri, heave to ya da rüzgâraltına kaç.',
        'Küçük yatlar için hayatta kalma koşulları.',
        'Hayatta kalma koşulları.',
        'Hayatta kalma koşulları.',
        'Hayatta kalma koşulları.',
      ],
    },
    trs: {
      title: 'Tropik dönen fırtına: yarım daireler',
      hint: 'Ne yapması gerektiğini görmek için bir tekneye tıkla.',
      dangerous: 'Tehlikeli yarım daire',
      navigable: 'Seyredilebilir yarım daire',
      path: 'Yolunun üstünde',
      track: 'Fırtınanın izi',
      advice: {
        dangerous: 'Fırtına geçerken rüzgâr veer eder ve fırtınanın kendi hızı rüzgâra eklenir; izinin üstüne sürüklenebilirsin. Rüzgârı sancak baştan al ve merkezden olabildiğince uzaklaş.',
        navigable: 'Rüzgâr back eder; fırtınanın hareketi rüzgârı azaltır ve seni izden uzaklaştırır. Rüzgârı sancak kıçtan al ve merkezden kaç.',
        path: 'Rüzgârın yönü sabit, kuvvetleniyor, barometre hızla düşüyor. Rüzgâr sancak kıçta, seyredilebilir yarım daireye kaç.',
      },
      adviceS: {
        dangerous: 'Güney yarımküre: tehlikeli yarım daire izin SOLUNDA ve rüzgâr back eder. Rüzgâr iskele başta, olabildiğince yol yap.',
        navigable: 'Güney yarımküre: seyredilebilir yarım daire SAĞDA; rüzgâr veer eder. Rüzgâr iskele kıçta, kaç.',
        path: 'Rüzgârın yönü sabit ve kuvvetleniyor. Rüzgâr iskele kıçta, seyredilebilir yarım daireye kaç.',
      },
    },
    forecast: {
      title: 'Tahmini çöz',
      hint: 'Vurgulu kelimelere tıkla.',
      sample:
        'Gale warning issued 0505 UTC. Ravensey: northwest [[severe|severe gale 9]] [[imminent]]. Saltmere: southwest [[gale|gale 8]] expected [[soon]].\nRavensey: Northwest 7 to severe gale 9, [[backing]] west 5 [[later]]. [[veryRough|Very rough]]. Squally showers. [[good|Good]].\nSaltmere: Southwest 5 to 7, [[veering]] west 6 to gale 8 later. [[modSea|Moderate]] [[becoming]] [[rough]]. Rain then showers. Good, [[occasionally]] [[poor]].\nGannet Bank: [[variable]] 3, becoming [[cyclonic]] 5 to 7. [[slight|Slight]]. [[fog|Fog patches]]. [[moderate|Moderate]] or [[veryPoor|very poor]].',
      terms: {
        imminent: 'Imminent (yakında): yayın saatinden itibaren 6 saat içinde.',
        soon: 'Soon (birazdan): yayın saatinden 6–12 saat sonra.',
        later: 'Later (daha sonra): yayın saatinden 12 saatten fazla sonra.',
        veering: 'Veering: rüzgâr saat yönünde döner (ör. SW → W).',
        backing: 'Backing: rüzgâr saat yönünün tersine döner (ör. W → SW).',
        occasionally: 'Occasionally (zaman zaman): sürenin sadece bir kısmında.',
        becoming: 'Becoming: tahmin süresi içinde bir değişiklik.',
        variable: 'Variable (değişken): belirli bir yönü olmayan hafif rüzgâr.',
        cyclonic: 'Cyclonic: bir alçak bölgenin üstünden ya da yakınından geçerken rüzgâr yönü çok değişecek.',
        gale: 'Gale (kuvvet 8): ortalama 34–40 kn ya da 43–51 kn hamleler.',
        severe: 'Severe gale (kuvvet 9): 41–47 kn.',
        good: 'Good (iyi görüş): 5 deniz milinden fazla.',
        moderate: 'Moderate (orta görüş): 2–5 deniz mili.',
        poor: 'Poor (kötü görüş): 1000 m – 2 deniz mili.',
        veryPoor: 'Very poor (çok kötü görüş): 1000 m’den az.',
        fog: 'Fog (sis): görüş 1000 m’den az.',
        slight: 'Slight (hafif deniz): dalgalar 0,5–1,25 m.',
        modSea: 'Moderate (orta deniz): dalgalar 1,25–2,5 m.',
        rough: 'Rough (dalgalı deniz): dalgalar 2,5–4 m.',
        veryRough: 'Very rough (çok dalgalı): dalgalar 4–6 m.',
      },
    },
    drills: {
      synoptic: {
        title: 'Harita egzersizi',
        intro: 'İzobarlar 4 hPa’da bir. Her soru işaretli noktalarla ilgili.',
        qStrong: 'Rüzgâr hangi noktada en kuvvetli?',
        qDir: '{p} noktasında rüzgâr hangi yönden esiyor?',
        qHigh: 'Hangi noktada basınç en yüksek?',
        qFront: 'Soğuk cephe birazdan {p} noktasından geçecek. Oradaki mürettebat ne beklemeli?',
        frontN: ['Rüzgâr keskin veer eder, sağanaklar, sonra barometre yükselir ve hava açar', 'Rüzgâr back eder ve yağmur yavaşça diner', 'Limon ve sis', 'Rüzgâr ve barometre aynı kalır'],
        frontS: ['Rüzgâr keskin back eder (NW → SW), sağanaklar, sonra barometre yükselir', 'Rüzgâr W’den N’ye veer eder', 'Limon ve sis', 'Rüzgâr ve barometre aynı kalır'],
        qLow: '{p} noktasındaki mürettebat sırtını rüzgâra dönüyor. Alçak basınç hangi tarafta?',
        chart: 'Harita {n} / {m}',
        whyStrong: 'İzobarlar en sık {p} noktasında: yaklaşık {kn} kn.',
        whyDir: 'İzobarlar boyunca, alçak {side} tarafta kalacak şekilde, alçağa doğru içeri dönük: yaklaşık {dir}.',
        whyHigh: '{p} yüksek basınca en yakın: yaklaşık {hpa} hPa.',
        whyFrontN: 'Kuzey yarımküre soğuk cephesi: keskin veer, sağanaklar, basınç sıçraması, sonra berrak soğuk hava.',
        whyFrontS: 'Güney yarımküre: soğuk cephe NW’den SW’ye keskin bir BACK getirir.',
        whyLow: 'Buys Ballot: {hemi} – alçak {side} tarafta.',
        left: 'sol',
        right: 'sağ',
      },
      route: {
        title: 'Okyanus geçişi: Gran Canaria → St Lucia',
        intro: 'Bir ay seç, haritaya tıklayarak en fazla 5 waypoint ekle (ya da hazır bir rota yükle), sonra Yelken aç’a bas.',
        month: 'Ay',
        monthNames: { nov: 'Kasım', feb: 'Şubat', jul: 'Temmuz (kasırga mevsimi)', sep: 'Eylül (kasırga zirvesi)' },
        presets: { rhumb: 'Doğrudan rota', butter: 'Tereyağı eriyene kadar güneye', south: 'Çok güneyden', north: 'Çok kuzeyden' },
        add: 'Waypoint eklemek için haritaya tıkla',
        undo: 'Geri al',
        clear: 'Temizle',
        sail: 'Yelken aç!',
        days: 'Süre',
        dayUnit: 'gün',
        dist: 'Mesafe',
        avg: 'Ortalama hız',
        calm: 'Limonda geçen saat',
        gale: 'Fırtınada geçen saat',
        hurricane: '⚠️ Kasırga mevsiminde kasırga kuşağında {h} saat – gerçek bir kaptan şimdi çıkmazdı.',
        land: '⛔ Bir leg karadan geçiyor. Waypointlerini taşı.',
        best: 'Bu ay klasik rota: {d} gün',
        verdict: { great: '★★★ Mükemmel rota!', ok: '★★ Fena değil – daha hızlı bir yol var.', slow: '★ Yavaş – rüzgârın nerede olduğuna bak.' },
        legend: 'Azor yüksek basıncı çevresinde izobarlar · oklar: rüzgâr · gölgeli: doldrums',
      },
      order: {
        title: 'Alçak basıncı sıraya diz',
        intro: 'Bir alçak basınç senin kuzeyinden geçiyor (kuzey yarımküre). Kartlara göreceğin sırayla dokun.',
        cards: [
          'Batıdan sirrüs telleri yayılıyor; barometre düşmeye başlıyor',
          'Güneşin çevresinde hale; rüzgâr güneyden back edip kuvvetleniyor',
          'Gri altostratus kalınlaşıp alçalıyor; yağmur başlıyor',
          'Nimbostratustan sürekli yağmur, barometre düşüyor',
          'Rüzgâr güneybatıya veer ediyor, yağmur çisentiye dönüyor',
          'Ilık havada alçak stratus, çisenti ve kötü görüş',
          'Karanlık bir kümülonimbüs hattı: şiddetli yağmur ve sağanaklar',
          'Rüzgâr kuzeybatıya veer ediyor, barometre hızla yükseliyor, sağanaklı berrak soğuk hava',
        ],
        ok: 'Kusursuz sıra!',
        bad: 'Tam değil – {n} kart doğru yerde. Aşağıdaki doğru sırayla karşılaştır.',
        reset: 'Tekrar dene',
      },
      beaufortGuess: { title: 'Kuvveti tahmin et', intro: 'Denize ve rüzgâr göstergesine bak. Beaufort kuvveti kaç?', q: 'Hangi kuvvet?' },
      cloudGuess: { title: 'Bulut gözlemcisi', intro: 'Bulutun adını söyle, sonra ne haber verdiğini.', q: 'Bu hangi bulut?', q2: 'Genelde ne anlama gelir?' },
      buysDrill: { title: 'Alçağı bul', intro: 'Ok rüzgârın nereye estiğini gösteriyor. Alçağın olduğu pusula noktasına tıkla.', q: 'Alçak nerede?' },
      trsDrill: {
        title: 'Fırtınadan kaç',
        intro: 'Bir tropik dönen fırtına ve teknen. Hangi yarım dairedesin ve ne yaparsın?',
        q: 'Tekne nerede?',
        qAction: 'Nasıl seyredersin?',
        actions: ['Rüzgâr sancak başta', 'Rüzgâr sancak kıçta', 'Rüzgâr iskele başta', 'Rüzgâr iskele kıçta'],
      },
      gonogo: {
        title: 'Çık mı, çıkma mı?',
        intro: 'Kaptan sensin. Durumu oku ve karar ver.',
        items: [
          {
            q: 'Yeni bir mürettebatla 9 m’lik yatla 25 millik günlük seyir. Tahmin: "SW 4 or 5, increasing 6 to 7 later. Rain then showers." Saat 0800, seyir 5 saat.',
            options: ['Şimdi bir camadanla çık, öğleden sonra erken var, kaçış limanı hazır', '1600’de hava açınca çık', 'Çık ve hızlı olmak için tüm camadanları aç', 'İptal – sonra herhangi bir K6 seyir yok demek'],
            answer: 0,
            why: '"Later" 12 saatten fazla sonra: 6–7 gelmeden limanda olursun. Hamlelere göre camadan vur ve kaçış limanını hazır tut.',
          },
          {
            q: 'Liman girişinde yoğun deniz sisi, rüzgâr SW 3. Rotan yoğun bir gemi trafiği şeridini kesiyor. Tahmin: "Fog patches, becoming good later."',
            options: ['Görüş düzelene kadar limanda bekle', 'Çık – rüzgâr sisi dağıtır', 'Şeritte daha az kalmak için hızlı çık', 'Çık ve sadece AIS’e güven'],
            answer: 0,
            why: 'Adveksiyon sisini rüzgâr dağıtmaz. Siste şerit geçmek büyük risk – "becoming good" olmasını bekle.',
          },
          {
            q: 'Barometre son 3 saatte 7 hPa düştü, rüzgâr SE’ye back edip kuvvetleniyor, bu sabah sirrostratus ve hale vardı. Korunaklı yere 15 mil uzaktasın.',
            options: ['Hemen korunaklı yere yönel ve erken camadan vur', 'Devam et – bu sabahki tahmin iyiydi', 'Açık koyda demirle', 'Rüzgârın ne yapacağını bekle'],
            answer: 0,
            why: '3 saatte 6 hPa’dan fazla düşüş fırtına uyarısıdır. Sıcak cephenin bütün işaretleri var – erken davran.',
          },
          {
            q: 'Yerleşik yüksek basınç, güneşli sabah, karadan hafif 5 kn rüzgâr. Öğleden sonra tahmini: "Sea breezes developing". Öğle yemeği için bir plajın önünde demirlemeyi planlıyorsun.',
            options: ['Olur – ama öğleden sonra denizden 10–15 kn meltem bekle: demir yerinin buna göre güvenli olduğunu kontrol et', 'Olur – rüzgâr bütün gün karadan eser', 'İptal – deniz meltemleri tehlikelidir', 'Plaja olabildiğince yakın demirle'],
            answer: 0,
            why: 'Deniz meltemi öğleden sonra demir yerini bir rüzgâraltı kıyısına çevirir. Salınımı ve çıkış yolunu planla.',
          },
        ],
      },
    },
  },
}
