import type { LessonSet } from './lessons'

export const lessonsTr: LessonSet = {
  sails: {
    title: 'Yelkenler: basma, camadan, tack ve kavança',
    summary: 'Hangi halat ne işe yarar; yelken basma, camadan ve indirmede doğru sıra; seyir açıları; tack ve kavançada mürettebat zamanlaması ve yelkenle şamandıra alma.',
    sections: [
      {
        h: 'Yelkenleri çalıştıran halatlar',
        blocks: [
          {
            list: [
              '**Mandar**: yelkeni basar. Bir **stoper** tutar, **vinç** ile gerilir.',
              '**Iskota**: yelkeni içeri alır ya da laçka eder. Ana yelken için ana ıskota, flok için iki flok ıskotası.',
              '**Bumba kontrası (vang)**: bumbayı aşağı çeker, kalkmasını önler.',
              '**Balançina**: ana yelken bumbayı taşımazken (basma, camadan, indirme) bumbayı yukarıda tutar.',
              '**Sarma halatı**: floku baş ıstralyanın etrafına sarar.',
              '**Camadan halatı**: camadanlı ana yelkenin yeni ıskota köşesini bumbaya indirir; **orsa yakası halkası** bumba mafsalındaki **kancaya** takılır.',
            ],
          },
          { tip: 'Pratik kural: yelkenin serbest hareketini engelleyen her şey (ıskota, kontra) yelken basılmadan ya da indirilmeden önce **laçka edilir**, sonra yeniden **gerilir**.' },
          { widget: 'rig3d' },
          { game: 'rig3d' },
        ],
      },
      {
        h: 'Ana yelkeni basmak – sıra',
        blocks: [
          {
            steps: [
              'Yelken kılıfını çıkar.',
              'Yelken bağlarını çöz **ve** tekneyi rüzgâra yakın çevir (tam rüzgâra değil).',
              'Ana ıskotayı **ve** bumba kontrasını laçka et – yelken çırpabilmeli.',
              'Mandarla bas, takılmaları izle. Son kısmı orsa yakasındaki kırışıklar gidene kadar vinçle.',
              'Mandar stoperini kapat.',
              'Ana ıskotayı al **ve** balançinayı laçka et.',
              'Kontrayı ger **ve** mandarı roda yap.',
              'Ancak şimdi düş ve seyret.',
            ],
          },
          { tip: '**Ve** ile birleşen adımlar istediğin sırayla yapılabilir. Diğer her şey listeye uymalı.' },
          { game: 'rig' },
        ],
      },
      {
        h: 'Flok: açmak ve sarmak',
        blocks: [
          {
            list: [
              '**Açmak**: sarma halatını kontrollü laçka et → **rüzgâraltı** flok ıskotasını (rüzgârın uzak tarafı) çek → halatları topla. Rüzgâr sancaktan geliyorsa **iskele** ıskotasını çek.',
              '**Sarmak**: flok ıskotasını laçka et ama hafif gergin tut → sarma halatını çek → topla. Iskotayı asla boşa bırakma: flok çırpar ve gevşek sarılır.',
            ],
          },
        ],
      },
      {
        h: 'Camadan vurmak ve ana yelkeni indirmek',
        blocks: [
          {
            steps: [
              'Emniyet kemerini bağla (direğe gideceksin).',
              'Rüzgâra yakın dön.',
              'Kontrayı ve ana ıskotayı laçka et.',
              'Bumba düşmesin diye balançinayı al.',
              'Mandarı camadana kadar indir.',
              'Orsa yakası halkasını kancaya tak.',
              'Mandarı yeniden ger.',
              'Camadan halatını vinçle (yelken hâlâ çırpıyor olmalı).',
              'Balançinayı laçka et, ıskotayı al, kontrayı ger.',
              'Boştaki yelkeni camadan bağıyla bağla ve halatları topla.',
              'Düş ve seyret.',
            ],
          },
          { ex: { title: 'Ana yelkeni indirmek', lines: ['Rüzgâra yakın dön.', 'Balançinayı al ve kontrayı laçka et.', 'Mandarı indir.', 'Yelkeni bumbanın üstüne katla.', 'Yelken bağlarını bağla ve ana ıskotayı al.', 'Halatları topla ve kılıfı tak.'] } },
        ],
      },
      {
        h: 'Seyir açıları',
        blocks: [
          { p: 'Bir yat rüzgâra yaklaşık **45°**’den daha yakın seyredemez (ölü açı). Baş ile rüzgâr arasındaki açı (TWA) seyir açısını verir:' },
          {
            table: {
              head: ['TWA', 'Seyir açısı', 'Yelkenler'],
              rows: [
                ['0–45°', 'Ölü açı', 'çırpıyor'],
                ['45–60°', 'Orsa', 'tam alınmış'],
                ['60–80°', 'Dar apaz', 'hafif laçka'],
                ['80–105°', 'Apaz', 'yarı açık'],
                ['105–155°', 'Geniş apaz', 'iyice açık'],
                ['155–180°', 'Pupa', 'sonuna kadar açık'],
              ],
            },
          },
          { p: 'Rüzgâr **sancak** taraftan geliyorsa **sancak kontra**dasın, bumba iskele tarafta.' },
          { widget: 'points' },
          { p: 'Floktaki **telltale**’ler: rüzgârüstü olan çırpıyorsa ıskotayı al ya da düş; rüzgâraltı olan çırpıyorsa ıskotayı laçka et. İkisi de akıyorsa trim doğru.' },
        ],
      },
      {
        h: 'Tack: mürettebatın zamanlaması',
        blocks: [
          {
            steps: [
              'Kaptan: "Tacke hazır ol!" → **yeni** ıskotayı vincine sar (saat yönünde 2–3 tur).',
              '**Çalışan** ıskotayı self-tailer’dan çıkar, bırakmaya hazır tut.',
              'Ancak şimdi "Hazır!" de.',
              'Kaptan: "Tack!" – baş rüzgâra doğru döner.',
              'Baş **tam rüzgâra** geldiğinde (TWA yaklaşık +12° ile −12° arası) eski ıskotayı bırak.',
              'Flok dolmadan yeni ıskotayı **hızla** çek.',
              'Trim için vinçle: iki telltale de akınca dur. Fazlası yelkeni boğar.',
            ],
          },
          { warn: 'Çok erken: flok çırpar ve tekne durur. Çok geç: flok ters dolar ve başı fazla çevirir.' },
        ],
      },
      {
        h: 'Kontrollü kavança',
        blocks: [
          {
            steps: [
              'Kaptan: "Kavançaya hazır ol!" → preventer’i çöz.',
              'Ana yelkeni ortaya al (bumba merkez hattına yaklaşık 15° yakın).',
              '"Hazır!" de – kıç rüzgârdan geçer ve bumba yumuşakça karşıya geçer.',
              'Ana yelkeni yeni tarafta hızla laçka et (yoksa tekne rüzgâra orsa eder).',
              'Floku yeni tarafta al – bumba geçtikten sonra.',
            ],
          },
          { warn: 'Açıkta duran bumbanın savrulması **kontrolsüz kavança**dır: mürettebatı yaralayabilir, donanımı kırabilir.' },
          { game: 'tack' },
        ],
      },
      {
        h: 'Yelkenle şamandıra almak',
        blocks: [
          { p: 'Motor olmadan **rüzgârı boşaltarak** fren yaparsın. Ana yelken ancak rüzgâr **yaklaşık kemerenin önündeyken** (TWA ~95°’nin altında) boşaltabilir. Rüzgâr arkadan gelince ana yelken çarmıhlara dayanır ve itmeye devam eder.' },
          {
            steps: [
              'Son pruvana karar ver: **akıntıya karşı**; akıntı yoksa rüzgâra karşı.',
              'O pruvada rüzgârın nereden geldiğine bak.',
              'Rüzgâr kemerenin önünde (rüzgâr akıntıyla aynı yönde ya da akıntı yok) → **yalnızca ana yelkenle**, dar apazda (~60° TWA) gel, yavaşlamak için laçka et.',
              'Rüzgâr kemerenin arkasında (**rüzgâr akıntıya karşı**) → ana yelkeni indir, **yalnızca flokla** gel, yavaşlamak için sar.',
              'Baş şamandıraya yürüme hızında varsın (yerde 0,8 knot’tan az). Rüzgârüstü baştan al.',
            ],
          },
          { tip: 'Oyunda üç yıldız = doğru yelken planı ve hiç "çok hızlı" geçiş yok. Fazla hızlıysan bir tur at ve daha yavaş gel.' },
          { game: 'buoy' },
        ],
      },
    ],
    check: [
      { q: 'Rüzgâr sancaktan. Floku hangi ıskota açar?', options: ['İskele (rüzgâraltı) ıskota', 'Sancak ıskota', 'Sarma halatı', 'Ana ıskota'], answer: 0, why: 'Flok rüzgârın uzak tarafında dolar: rüzgâr sancaktansa iskele.' },
      { q: 'Tack’te eski flok ıskotasını ne zaman bırakırsın?', options: ['Baş rüzgârdan geçerken', 'Kaptan "Tacke hazır ol" dediğinde', 'Flok yeni tarafta dolduktan sonra', 'Bumba geçtiğinde'], answer: 0, why: 'Tam rüzgârda (TWA ±12°): erken tekneyi durdurur, geç floku ters doldurur.' },
      { q: 'Rüzgâr akıntıya karşıyken şamandıra. Hangi yelken?', options: ['Yalnızca flok', 'Yalnızca ana yelken', 'İki yelken', 'Hiçbiri, sürüklen'], answer: 0, why: 'Akıntıya karşı giderken rüzgâr arkada; gücü yalnızca sarılan flokla azaltabilirsin.' },
      { q: 'Ana yelkeni basmadan önce ne laçka edilir?', options: ['Ana ıskota ve kontra', 'Balançina', 'Flok ıskotaları', 'Kıç ıstralya'], answer: 0, why: 'Yoksa yelken basılırken dolar ve sıkışır.' },
    ],
  },

  ropes: {
    title: 'Düğümler, koçlar ve bağlama halatları',
    summary: 'Gereken sekiz düğüm, koça bağlama, vinç ve stoperler, her havada tekneyi hangi halat ve usturmaçaların tuttuğu.',
    sections: [
      {
        h: 'Her işe bir düğüm',
        blocks: [
          {
            table: {
              head: ['Düğüm', 'İş'],
              rows: [
                ['Gaza bağı', 'Sabit ilmik: flok ıskotalarını ıskota köşesine, bağlama ilmiği'],
                ['Kazık bağı', 'Usturmaçayı vardavelaya, hızlı geçici bağ'],
                ['Sekiz bağı', 'Iskota ucunda stoper, makaradan kaçmasın'],
                ['Volta ve iki yarım bağ', 'Halatı halkaya ya da babaya; yük altında çözülebilir'],
                ['İskota bağı', 'İki halatı, farklı kalınlıkta olsalar da birleştirir'],
                ['Camadan bağı', 'Camadan ve yelken bağları – asla yük için değil'],
                ['Kayar bağ (rolling hitch)', 'Yüklü halatı kavrayıp yükünü alır (vinçte binen halat)'],
                ['Koç bağı', 'Halatı koça sabitlemek'],
              ],
            },
          },
          { tip: 'Hafıza ipuçları: **ilmik = gaza bağı**, **usturmaça = kazık bağı**, **ıskota ucu = sekiz bağı**, **halka = volta**, **iki halat = iskota bağı**.' },
          { game: 'knots' },
        ],
      },
      {
        h: 'Koça bağlamak: O – X – O',
        blocks: [
          {
            steps: [
              '**O**: halatı uzak boynuza götür ve tabanın etrafında tam bir **volta** al. Yükü bu alır; halatı kontrollü bırakabilir ya da tutabilirsin.',
              '**X**: üstten çaprazlayarak bir **sekiz** yap – bir tane, güvenlik için ikinci bir tane.',
              '**O**: bir **kilit** ile bitir (altına çevrilmiş bir sekiz).',
            ],
          },
          { warn: 'Asla kilitle başlama (yük altında sıkışır) ve çok sayıda tur sarma – acil durumda çözemezsin.' },
        ],
      },
      {
        h: 'Vinçler ve stoperler',
        blocks: [
          {
            list: [
              'Vince **saat yönünde** 2–3 tur sar, gergin tut, parmakların tamburdan uzak olsun.',
              'Halatı asla eline dolama.',
              'Yük altındaki stoperi açmak için: önce biraz vinçle ki yükü vinç tutsun, sonra aç.',
            ],
          },
        ],
      },
      {
        h: 'Bağlama halatları ve görevleri',
        blocks: [
          {
            table: {
              head: ['Halat', 'Nereden → nereye', 'Tekneyi şundan tutar…'],
              rows: [
                ['Baş halatı', 'baş koçu → başın **önündeki** iskele koçu', 'geri kaymaktan, başın düşmesinden'],
                ['Kıç halatı', 'kıç koçu → kıçın **arkasındaki** iskele koçu', 'ileri kaymaktan, kıçın düşmesinden'],
                ['Baş spring', 'baş koçu → **geride**, yaklaşık orta hizadaki koç', 'ileri oynamaktan'],
                ['Kıç spring', 'kıç koçu → **ileride**, yaklaşık orta hizadaki koç', 'geri oynamaktan'],
                ['Borda halatı', 'orta → tam karşıya', 'yana açılmaktan (kısa süreli)'],
              ],
            },
          },
          { p: '**Springler** teknenin ileri-geri oynamasını durdurur. **Baş ve kıç halatları** uçları içeride tutar. Halat ancak açısı kadar iyidir: ne kadar uzun ve yatıksa o kadar iyi.' },
        ],
      },
      {
        h: 'Usturmaçalar',
        blocks: [
          {
            list: [
              'Her zaman **bordaya** (en geniş yere) usturmaça as.',
              'Pontona doğru rüzgâr bütün gövdeyi pontona iter: **baş, borda ve kıç omuzluğa** usturmaça.',
              'Pontonun ya da yandaki teknenin yüksekliğine as.',
            ],
          },
        ],
      },
      {
        h: 'Halat ve Usturmaça oyununda',
        blocks: [
          {
            table: {
              head: ['Hava', 'Halatlar (en az)', 'Usturmaça'],
              rows: [
                ['Hafif esinti', 'baş halatı + kıç halatı', 'borda'],
                ['Oynayan akıntı', 'baş halatı, kıç halatı, baş spring, kıç spring', 'borda'],
                ['Pontona doğru sert rüzgâr', 'baş halatı + kıç halatı', 'baş, borda, kıç omuzluk'],
                ['Pontondan dışarı sert rüzgâr', 'baş halatı, kıç halatı, baş spring, kıç spring', 'borda'],
              ],
            },
          },
          { p: 'Teknenin koçları baş, orta ve kıçtadır. Pontondaki koçu, halatın gitmesini istediğin yöne göre seç: baş halatı başın önündeki koça, baş spring daha gerideki koça.' },
          { tip: 'Geçmek = tekne 1,2 m’den az kayar, 16°’den az döner ve hiçbir yer sürtmez. Üç yıldız = ayrıca önerilen tüm halat ve usturmaçalar.' },
          { game: 'lines' },
        ],
      },
    ],
    check: [
      { q: 'Usturmaçayı vardavelaya hangi düğümle asarsın?', options: ['Kazık bağı', 'Camadan bağı', 'İskota bağı', 'Sekiz bağı'], answer: 0, why: 'Hızlı atılır ve yüksekliği kolayca ayarlanır.' },
      { q: 'Bağlı teknenin ileri-geri oynamasını hangi halatlar durdurur?', options: ['Springler', 'Borda halatları', 'Usturmaçalar', 'Yalnızca baş halatı'], answer: 0, why: 'Springler gövde boyunca ileri-geri uzanır ve oynamayı durdurur.' },
      { q: 'Koçta O-X-O ne demek?', options: ['Volta, sekizler, kilit', 'Kilit, volta, kilit', 'Üç volta', 'Boynuza gaza bağı'], answer: 0, why: 'Volta yükü tutar, sekizler sabitler, kilit kilitler.' },
    ],
  },

  power: {
    title: 'Motorla tekne kullanımı',
    summary: 'Yatın neden öyle dümen dinlediği: pervane suyu, dönme noktası, pervane etkisi, rüzgâr ve akıntı – ve yanaşma, springle ayrılma ve kıçtan kara bağlanma.',
    sections: [
      {
        h: 'Su akışı yoksa dümen yok',
        blocks: [
          {
            list: [
              'Dümen ancak yanından su akarken çalışır.',
              '**İleri**: pervane suyu doğrudan dümene üfler (pervane suyu). Dururken bile kısa bir ileri gaz tekneyi döndürür. **Önce dümen, sonra gaz.**',
              '**Tornistan**: dümene pervane suyu gelmez. Tekne gerçekten geri gitmeye başlayınca dümen tutar.',
              'Yat yolunu uzun süre korur: erken boşa al.',
            ],
          },
        ],
      },
      {
        h: 'Dönme noktası',
        blocks: [
          {
            list: [
              'İleri giderken tekne baştan yaklaşık üçte bir geride (direk civarında) döner: **kıç dışarı savrulur** – diğer teknelerin yanında dikkat et.',
              'Tornistanda dönme noktası kıça kayar: artık en çok **baş savrulur**.',
            ],
          },
        ],
      },
      {
        h: 'Pervane etkisi',
        blocks: [
          { p: 'Pervane kıçı yana da iter; en güçlüsü **dururken tornistana** verdiğinde. Çoğu yatta sağ pervane vardır: tornistanda **kıç iskeleye kaçar** (baş sancağa döner).' },
          {
            list: [
              '**Kullan**: iskele tarafla yanaşırken, durmak için verdiğin tornistan kıçı da içeri çeker.',
              '**Bekle**: düz geri giderken kıç önce iskeleye gider. Geri yol aldıktan sonra biraz sancak dümenle düzelt.',
              '**Kendi boyunda dönmek** (sancağa): dümeni tam sancağa kır ve bırak. Kısa ileri gaz – baş döner. Kısa tornistan – tekne durur ve pervane etkisi kıçı iskeleye iterek dönmeye devam ettirir. Tekrarla.',
            ],
          },
          { tip: 'Oyunda yardım katmanı açıkken kıçtaki kırmızı ok pervane etkisini gösterir.' },
        ],
      },
      {
        h: 'Rüzgâr ve akıntı',
        blocks: [
          {
            list: [
              'Duran tekne rüzgâraltına sürüklenir ve **önce baş düşer** (rüzgâr alanı fazla, tutuşu az).',
              'Akıntı seni yürüyen bant gibi taşır. **Akıntıya karşı** yanaş: yerde yavaşsın ama dümenden su akar.',
              'İpuçlarını oku: bayraklar, dalgacıklar, kazıkların etrafında yığılan su, akıntıya göre yatan bağlı tekneler.',
            ],
          },
        ],
      },
      {
        h: 'Yanaşma',
        blocks: [
          {
            steps: [
              'Usturmaça ve halatlar hazır, mürettebata brifing verildi.',
              'Yavaşça, dar bir açıyla (20–30°) yanaşma yerinin önüne yönelerek yaklaş.',
              'Erken boşa al – tekne kaysın.',
              'Yaklaşınca paralel dön; kısa bir tornistan tekneyi durdurur.',
            ],
          },
          {
            table: {
              head: ['Durum', 'Teknik'],
              rows: [
                ['Rüzgâr yok', 'Standart yaklaşma; tornistan kıçı içeri çeker (iskele tarafla).'],
                ['Pontona doğru rüzgâr', 'Boşluğun rüzgârüstünde, 1–2 m açıkta paralel dur ve rüzgârın itmesine izin ver.'],
                ['Pontondan dışarı rüzgâr', 'Daha kararlı gel, yanaşma yerinin ön üçte birine; halatları hızla ver.'],
                ['Akıntı', 'Akıntıya karşı dön; yerde sabit kal ve akıntının seni yana kaydırmasına izin ver (ferry glide).'],
              ],
            },
          },
        ],
      },
      {
        h: 'Ayrılma: springle açılmak',
        blocks: [
          { p: 'Pontona doğru rüzgâr seni yapıştırdı, önde ve arkada tekneler mi var? Bir ucu springle aç.' },
          {
            steps: [
              'Baş ve kıç halatlarını bırak, **baş springi** tut. Başa bir usturmaça.',
              'Dümeni ponton **tarafına** kır ve kararlıca ileri ver: spring başı tutar, kıç açılır.',
              'Kıç iyice açılınca (30–40°): boş, sonra tornistan.',
              'Springi bırak, geri çık, sonra ileri giderek uzaklaş.',
            ],
          },
          { tip: '**Kıç spring** tersini yapar: ona karşı tornistan verirsen baş açılır.' },
        ],
      },
      {
        h: 'Akdeniz usulü kıçtan kara',
        blocks: [
          {
            steps: [
              'Erkenden hizalan, kıçın boşluğa dönük olsun.',
              'Geri yol al, sonra küçük dümen açılarıyla yönet.',
              'Geçerken demiri rıhtımdan yaklaşık **3–4 tekne boyu (30–40 m)** açıkta bırak.',
              'Geri gitmeye devam et, hafif ileriyle dur, halatları ver, zinciri ger.',
            ],
          },
        ],
      },
      {
        h: 'Liman Manevrası oyununda',
        blocks: [
          {
            list: [
              'Tuşlar: ↑/↓ gaz %10’luk adımlarla, ←/→ dümen, Boşluk = boş, C = orta, P = duraklat.',
              'Kesikli çizgi, mevcut kontrollerle 8 saniye sonra nerede olacağını gösterir – planlamak için kullan.',
              'Usturmaçalı pontona 0,3 m/s altında dokunmak serbest, 0,6 m/s’ye kadar çarpma sayılır, daha hızlısı kaza. Diğer tekneler ve duvarlar: yalnızca hafif temas.',
              'Bitiş: yeşil alanda, yeşil ok yönüne bakarak dur ve 1,5 saniye hareketsiz kal.',
              'Üç yıldız: hiç çarpma yok ve hedef sürenin içinde.',
            ],
          },
          { game: 'harbour' },
        ],
      },
    ],
    check: [
      { q: 'Sağ pervane, dururken tornistan. Kıç nereye gider?', options: ['iskeleye', 'sancağa', 'hiçbir yere', 'ileri'], answer: 0, why: 'Pervane etkisi tornistanda kıçı iskeleye iter.' },
      { q: 'Dururken dönmek istiyorsun. Önce ne yaparsın?', options: ['Dümeni kır, sonra kısa ileri gaz', 'Tam ileri, sonra dümen', 'Dümen ortada tornistan', 'Rüzgârı bekle'], answer: 0, why: 'Pervane suyu kırılmış dümene çarpar ve tekneyi dar alanda döndürür.' },
      { q: 'Hangi halata karşı ileri gaz vermek kıçı açar?', options: ['Baş spring', 'Kıç spring', 'Borda halatı', 'Kıç halatı'], answer: 0, why: 'Baş spring başı tutar; ileri itiş kıçı pontondan uzaklaştırır.' },
    ],
  },

  tides: {
    title: 'Gelgit, basitçe',
    summary: 'Yüksek ve alçak su, gelgit farkı, derinlik, on ikiler kuralı, gelgit akıntıları ve gelgit kapıları – çözümlü örneklerle adım adım.',
    sections: [
      {
        h: 'Gelgit nedir?',
        blocks: [
          { p: 'Deniz günde iki kez yükselir ve alçalır. En yüksek nokta **yüksek su (HW)**, en alçak nokta **alçak su (LW)**. LW’den HW’ye yaklaşık **6 saat**, HW’den LW’ye de 6 saat sürer.' },
          {
            list: [
              '**Gelgit yüksekliği**: denizin şu an harita datumunun ne kadar üstünde olduğu (gelgit tablosundan).',
              '**Gelgit farkı (range)** = HW yüksekliği − LW yüksekliği.',
              '**Harita derinliği**: haritada yazan derinlik, harita datumunda (yaklaşık mümkün olan en alçak su) ölçülür.',
              '**Su derinliği** = harita derinliği + gelgit yüksekliği.',
              '**Kuruyan yükseklik**: haritada altı çizili sayı. O nokta harita datumunda su yüzeyinin o kadar metre **üstündedir**.',
            ],
          },
          { ex: { title: 'Şu anki derinlik', lines: ['Harita derinliği 2,0 m, gelgit yüksekliği 3,0 m.', 'Derinlik = 2,0 + 3,0 = **5,0 m**.', '1,5 m kuruyan bir sığlık, gelgit yüksekliği 3,8 m: derinlik = 3,8 − 1,5 = **2,3 m**.'] } },
        ],
      },
      {
        h: 'On ikiler kuralı',
        blocks: [
          { p: 'Gelgit sabit hızla yükselmez: başta yavaş, ortada hızlı, sonda yine yavaş. On ikiler kuralı farkı 12 eşit parçaya böler:' },
          {
            table: {
              head: ['LW’den sonraki saat', 'Bu saatte yükselir', 'Toplam yükselen'],
              rows: [
                ['1.', '1/12', '1/12'],
                ['2.', '2/12', '3/12'],
                ['3.', '3/12', '6/12'],
                ['4.', '3/12', '9/12'],
                ['5.', '2/12', '11/12'],
                ['6.', '1/12', '12/12 = HW'],
              ],
            },
          },
          { tip: '**1 – 2 – 3 – 3 – 2 – 1** diye ezberle. Alçalan gelgit de HW’den aşağı aynı şekilde işler.' },
          {
            steps: [
              'LW ve HW saatlerini ve yüksekliklerini bul.',
              'Fark = HW − LW. Bir on ikide bir = fark ÷ 12.',
              'LW’den istediğin saate kadar tam saatleri say.',
              'O saatlere karşılık gelen toplam on ikide biri oku (1, 3, 6, 9, 11, 12).',
              'Yükseklik = LW yüksekliği + on ikide birler × bir on ikide bir.',
            ],
          },
          { ex: { title: 'Saat 11:00’deki yükseklik', lines: ['LW 07:00 0,8 m, HW 13:00 5,0 m.', 'Fark = 5,0 − 0,8 = 4,2 m → bir on ikide bir = **0,35 m**.', '11:00, LW’den 4 saat sonra → **9/12**.', 'Yükselme = 9 × 0,35 = 3,15 m.', 'Yükseklik = 0,8 + 3,15 = **3,95 m**.'] } },
          { widget: 'twelfths' },
        ],
      },
      {
        h: 'Ne zaman yeterli su var?',
        blocks: [
          { p: 'Bir sığlığı geçmek ya da limana girmek için en az bir derinlik gerekir. Gereken gelgit yüksekliğini hesapla, sonra gelgitin ona ne zaman ulaştığını bul.' },
          {
            steps: [
              'Gereken yükseklik = kuruyan yükseklik + su çekimi + emniyet payı (harita derinliği olan bir noktada: su çekimi + pay − harita derinliği).',
              'LW yüksekliğini çıkar: gelgitin ne kadar yükselmesi gerektiği.',
              'Bir on ikide bire böl: kaç on ikide bir ettiği.',
              'Tabloda kaçıncı saatten sonra bu kadarına ulaştığını bul.',
            ],
          },
          {
            ex: {
              title: 'Kingsport sığlığını geçmek',
              lines: [
                'Sığlık 1,5 m kuruyor, su çekimi 1,8 m, pay 0,5 m → gereken 1,5 + 1,8 + 0,5 = **3,8 m**.',
                'LW’nin üstünde gereken yükselme: 3,8 − 0,8 = 3,0 m → 3,0 ÷ 0,35 ≈ **8,6 on ikide bir**.',
                '3 saat sonra: 6/12 = 2,9 m – yetmez. 4 saat sonra: 9/12 = 3,95 m – yeter.',
                'Yani sığlık **LW + 4 sa ≈ 10:50**’ten biraz önce açılır.',
                'Alçalan gelgitte bir sonraki LW’den aynı süre önce kapanır: yaklaşık **HW + 2 sa ≈ 15:10**.',
              ],
            },
          },
          { warn: 'Her zaman pay bırak. Dalgalar, yüksek hava basıncı ve karadan esen rüzgâr suyu tahminden alçak yapabilir.' },
        ],
      },
      {
        h: 'Gelgit akıntıları',
        blocks: [
          { p: 'Gelgit yükselip alçalırken su da akar: **gelgit akıntısı**. Yönü, suyun **gittiği** yöndür (set), hızı knot cinsindendir (rate).' },
          {
            list: [
              '**Gelgit atlası** ya da haritadaki **gelgit elmasları**, HW’den önceki ve sonraki her saat için yön ve hızı verir.',
              'Yere göre hız = tekne hızı ± akıntı: 5 kn ile 2 kn **lehte** = 7 kn; 2 kn **aleyhte** = yalnızca 3 kn.',
              '**Sizigi (springs)** (yeni ay ve dolunay civarı): büyük fark, kuvvetli akıntı. **Kuadratür (neaps)** (yarım ay): küçük fark, zayıf akıntı.',
            ],
          },
          { ex: { title: 'Lehte mi aleyhte mi?', lines: ['Durgun suda 5 kn ile 18 NM = 3 sa 36 dk.', 'Ortalama 2 kn lehte akıntıyla: 7 kn → yaklaşık **2 sa 35 dk**.', '2 kn aleyhte akıntıyla: 3 kn → **6 saat**!'] } },
        ],
      },
      {
        h: 'Gelgit kapıları: çıkış saatini seçmek',
        blocks: [
          { p: 'Gelgit kapısı, ancak belirli saatlerde geçebildiğin bir yerdir: bir sığlık, bir kilit, kuvvetli akıntılı bir burun. Kapıdan **geriye doğru** planla.' },
          {
            steps: [
              'Geçebileceğin zaman aralığını bul (yeterli su ya da lehte akıntı).',
              'Beklenen akıntıyla seyrin ne kadar süreceğini tahmin et.',
              'ETD (çıkış) = varış saati − seyir süresi.',
              'Yol boyunca akıntıya bak; lehte akıntıyı olabildiğince uzun kullanmak için biraz erkene ya da geçe kaydır.',
            ],
          },
          {
            ex: {
              title: 'Kingsport seyrini planlamak (18 NM, 5 kn, HW 13:00)',
              lines: [
                'Sığlıktaki pencere: yaklaşık 10:50 – 15:10.',
                'Akıntı HW−5’ten HW’ye kadar (08:00–13:00) lehte, en kuvvetlisi HW−3 ile HW−2 arası (10:00–11:00). HW’den sonra aleyhe döner.',
                '**09:00**’da çık → ortalama ≈ 6,9 kn → varış ≈ 11:37, gelgit 4,4 m: **giriyorsun**, üstelik tüm yol lehte akıntıyla.',
                '06:00’da çık → aleyhte akıntıyla başlarsın ve 09:27’de yalnızca 2,3 m ile varırsın: sığlık hâlâ çok sığ.',
                '12:00’de çık → akıntı aleyhe döner, 16:12’de 2,7 m ile varırsın: çok geç.',
              ],
            },
          },
          { tip: 'Oyunda üç yıldız = sığlıkta yeterli su **ve** en az 6,6 kn ortalama hız (yolun çoğunda lehte akıntı). 08:30 ile 10:00 arasındaki çıkışları dene.' },
          { game: 'passage' },
        ],
      },
      {
        h: 'Gelgit ve demirleme',
        blocks: [
          { p: 'Demirdeyken derinlik bütün gece değişir. Zincir boyu için **yüksek sudaki** derinliği kullan ve salınım dairenin her yerinde **en alçak** suda bile yeterli su olduğunu kontrol et. Demirleme dersine bak.' },
          { game: 'anchor' },
        ],
      },
    ],
    check: [
      { q: 'LW 06:00 1,0 m, HW 12:00 4,6 m. Saat 09:00’da gelgit yüksekliği?', options: ['2,8 m', '2,2 m', '3,7 m', '1,9 m'], answer: 0, why: 'Fark 3,6 m, bir on ikide bir 0,3 m. LW’den 3 saat sonra = 6/12 = 1,8 m. 1,0 + 1,8 = 2,8 m.' },
      { q: 'Harita derinliği 1,2 m, gelgit yüksekliği 2,5 m. Su derinliği?', options: ['3,7 m', '1,3 m', '2,5 m', '1,2 m'], answer: 0, why: 'Derinlik = harita derinliği + gelgit yüksekliği.' },
      { q: 'Gelgit en hızlı hangi saatlerde yükselir?', options: ['3. ve 4.', '1. ve 6.', '2. ve 5.', 'Hepsi aynı'], answer: 0, why: '1-2-3-3-2-1: ortadaki saatlerin her biri üç on ikide bir.' },
      { q: 'Teknen 5 kn gidiyor, akıntı 1,5 kn aleyhte. Yere göre hız?', options: ['3,5 kn', '6,5 kn', '5 kn', '1,5 kn'], answer: 0, why: 'Aleyhte akıntı çıkarılır: 5 − 1,5 = 3,5 kn.' },
    ],
  },

  anchoring: {
    title: 'Demirleme: kalibre ve salınım alanı',
    summary: 'Ne kadar zincir vereceğin, salınım dairenin ne kadar büyük olduğu ve alçak suda hâlâ yüzdüğünden nasıl emin olacağın – çözümlü örnekle.',
    sections: [
      {
        h: 'Demir nasıl tutar?',
        blocks: [
          { p: 'Demire gelen çekiş yataya yakın olduğunda demir gömülür. Zincir ne kadar uzunsa çekiş o kadar yatıktır. Bu yüzden **kalibre** önemlidir.' },
          {
            list: [
              '**Kalibre** = zincir boyu ÷ su derinliği.',
              'Tam zincir: en az **4 : 1**. Halat ve biraz zincir: en az **6 : 1**.',
              '**Yüksek sudaki** (en derin) derinliği kullan, yoksa su yükselince kalibre küçülür.',
              'Şüphedeysen daha fazla ver – başkalarına salınmadığın sürece.',
            ],
          },
        ],
      },
      {
        h: 'Salınım dairesi',
        blocks: [
          { p: 'Tekne her rüzgâr dönüşünde ve gelgit dönüşünde demirin etrafında salınır. Yarıçap yaklaşık zincirin yatay uzunluğu artı yarım tekne boyudur – 10 m’lik bir yat için kabaca **zincir + 5 m**.' },
          {
            list: [
              'Daha fazla zincir = daha büyük daire.',
              'Alçak suda zincir daha yatık durur, daire biraz büyür.',
              'Dairenin her noktasında **alçak suda** yeterli su olmalı; kayalardan ve diğer teknelerin dairelerinden uzak olmalı.',
            ],
          },
          {
            ex: {
              title: 'Burası iyi bir yer mi?',
              lines: [
                'Harita derinliği 4,0 m. Şu anki gelgit 4,2 m, bu gece en düşük 0,6 m. Su çekimi 1,8 m.',
                'Şu anki derinlik: 4,0 + 4,2 = 8,2 m → zincir en az 4 × 8,2 = **33 m** → 35 m ver.',
                'Salınım yarıçapı ≈ 35 + 5 = **40 m**.',
                'Burada alçak su: 4,0 + 0,6 = 4,6 m → omurga altında **2,8 m** ✔.',
                'Şimdi bütün daire: 40 m içinde harita derinliği 1,8 + 0,5 − 0,6 = **1,7 m**’den az olan her nokta seni karaya oturtur ya da çok yaklaştırır.',
              ],
            },
          },
          { widget: 'scope' },
        ],
      },
      {
        h: 'Demiri bırakmak ve kontrol etmek',
        blocks: [
          {
            steps: [
              'Mürettebata brifing ver; derinliği ve alanı kontrol etmek için yerin yanından yavaşça geç.',
              'Rüzgâra (ya da daha kuvvetliyse akıntıya) karşı yaklaş ve dur.',
              'Demiri ve zincirin yaklaşık üçte birini bırak, sonra geri sürüklenerek ya da tornistanla kalanını ver.',
              'Kısa bir tornistanla demiri oturt.',
              'Bir transit ya da iki kerterizle taramadığını kontrol et. Gündüz demir topu, gece demir feneri göster.',
            ],
          },
        ],
      },
      {
        h: 'Demir Koyu oyununda',
        blocks: [
          {
            list: [
              'Harita derinliğini okumak için fareyi haritanın üstünde gezdir; altı çizili iskandiller kurur.',
              'Kutu şu anki gelgiti, bu geceki en düşük gelgiti ve gece boyunca rüzgâr yönlerini gösterir. Teknen her zaman demirin **rüzgâraltında** durur.',
              'Kalibre **4 : 1**’in altındaysa yaklaşık 3 saat sonra rüzgâr artınca demir tarar.',
              'Mavi daire senin salınım alanın; turuncu kesikli daireler diğer teknelerin – çakışmamalılar.',
              'Üç yıldız: kalibre 4 ile 7 : 1 arasında **ve** bütün gece omurga altında en az 0,5 m.',
            ],
          },
          { game: 'anchor' },
        ],
      },
    ],
    check: [
      { q: 'Yüksek suda derinlik 6 m, tam zincir. En az zincir?', options: ['24 m', '12 m', '18 m', '6 m'], answer: 0, why: '4 × 6 m = 24 m.' },
      { q: 'Kalibre için neden yüksek sudaki derinlik kullanılır?', options: ['En derindir – alçak suda kalibre yalnızca iyileşir', 'Harita yüksek suda çizilir', 'Alçak suyla aynıdır', 'Önemli değil'], answer: 0, why: 'En derin anda yeterliyse her zaman yeterlidir.' },
      { q: '30 m zincir, 10 m tekne. Yaklaşık salınım yarıçapı?', options: ['35 m', '15 m', '30 m', '60 m'], answer: 0, why: 'Zincir + yarım tekne boyu ≈ 30 + 5 m.' },
    ],
  },

  colregs: {
    title: 'Çatışma kuralları: kim yol verir ve nasıl',
    summary: 'Pusula kerterizleriyle çatışma tehlikesini fark et, kimin yol verdiğini bil; yol veren ve yol hakkı olan tekne nasıl davranır – siste de.',
    sections: [
      {
        h: 'Çatışma tehlikesi var mı?',
        blocks: [
          { p: 'Diğer teknenin pusula kerterizini al, bir dakika bekle, bir daha al, bir daha.' },
          {
            list: [
              'Kerteriz **sabit** ve mesafe azalıyor → **çatışma tehlikesi**.',
              'Kerteriz belirgin şekilde **değişiyor** → pruvandan ya da kıçından geçecek.',
              'Yakındaki büyük gemilerde yavaş değişen bir kerteriz bile tehlikeli olabilir.',
            ],
          },
          { ex: { title: 'Üç kerteriz', lines: ['10:00 – 090°, 4,0 NM', '10:01 – 090°, 3,7 NM', '10:02 – 089°, 3,4 NM', 'Kerteriz sabit, mesafe azalıyor → hemen harekete geç.'] } },
        ],
      },
      {
        h: 'Kim yol verir?',
        blocks: [
          {
            table: {
              head: ['Durum', 'Kim çekilir', 'Olağan manevra'],
              rows: [
                ['Kesişen motorlular', 'Diğerini **sancak** tarafında gören', 'Sancağa dön, kıçından geç'],
                ['Kafa kafaya motorlular', 'İkisi de', 'İkisi de sancağa, iskele iskeleye geçiş'],
                ['Geçme (overtaking)', 'Geçen tekne (motorlu **ya da** yelkenli)', 'İyice uzak dur'],
                ['Motorlu ve yelkenli', 'Motorlu', 'Yelkenlinin kıçından geç'],
                ['Yelkenli: iskele / sancak kontra', 'İskele kontra', 'Düş, kıçından geç'],
                ['Yelkenli: aynı kontra', 'Rüzgârüstündeki', 'Uzak dur'],
                ['Dar kanal', 'Küçük tekneler', 'Yalnızca kanalı kullanabilen gemileri engelleme'],
              ],
            },
          },
          { p: 'Öncelik sırası (manevra kabiliyeti en az olan önce): kumanda altında değil → manevra kabiliyeti kısıtlı → su çekimi nedeniyle kısıtlı → balıkçı → yelkenli → motorlu.' },
        ],
      },
      {
        h: 'Nasıl yol verilir?',
        blocks: [
          {
            list: [
              '**Erken**: diğer tekne hâlâ uzaktayken davran (oyunda: 2 NM’den uzakta).',
              '**Belirgin**: diğer gemiden açıkça görülsün diye en az 30°, ya da iyice yavaşla / dur.',
              'Normalde **sancağa**, onun kıçından geçerek. Asla pruvasından kesme.',
              'Kerteriz almaya devam et: kerteriz değişmeye başlamalı.',
            ],
          },
        ],
      },
      {
        h: 'Yol hakkı olan tekne',
        blocks: [
          {
            list: [
              '**Rotanı ve hızını** koru ki diğeri seni öngörebilsin.',
              'Kerteriz al ve izle. Açıkça davranmıyorsa sen de davranabilirsin – çatışma artık yalnızca onun manevrasıyla önlenemiyorsa davranmak zorundasın.',
              'İskele tarafındaki bir tekne için **iskeleye dönme**.',
              'Oyunda: mesafe 1 NM’nin altına inene kadar bekle.',
            ],
          },
        ],
      },
      {
        h: 'Kısıtlı görüş (sis)',
        blocks: [
          { p: 'Siste **yol hakkı olan tekne yoktur**. Herkes erken davranır ve yavaşlar.' },
          {
            table: {
              head: ['Tekne', 'Ses işareti'],
              rows: [
                ['Motorlu, yol alıyor', '▬ her 2 dakikada bir uzun'],
                ['Motorlu, durmuş', '▬ ▬ her 2 dakikada iki uzun'],
                ['Yelkenli, balıkçı, NUC, RAM, CBD', '▬ • • bir uzun + iki kısa'],
                ['Demirli', 'her dakika 5 saniye hızlı çan'],
              ],
            },
          },
          {
            list: [
              '**Kemerenin önünde** bir radar ekosu: iskeleye dönme (onu geçmiyorsan).',
              'Kemerede ya da kemerenin arkasında bir eko: ona doğru dönme.',
              'Yavaşlamak her zaman iyi bir seçimdir.',
            ],
          },
        ],
      },
      {
        h: 'Çatışma Rotası oyununda',
        blocks: [
          {
            steps: [
              'Başla’ya bas, sonra birkaç saniye arayla en az iki kez **Kerteriz al**. "sabit!" tehlike demek.',
              'Rolüne karar ver (yol veren, yol hakkı olan, kafa kafaya, sis).',
              'Yol veren: mesafe 2 NM’nin üstündeyken bir iki kez **+30°** (sancak) dön ya da yavaşla.',
              'Yol hakkı olan: mesafe 1 NM’nin altına inene kadar hiçbir şey yapma.',
              'Açıkça geçtiğinden emin olana kadar kerteriz almaya devam et.',
            ],
          },
          { p: 'Puanlama: güvenli mesafe, harekete geçmeden önce kerteriz, zamanlama, manevranın büyüklüğü ve yönü. Siste doğru ses işaretini de seçersin (yol alan motorlu = bir uzun).' },
          { game: 'collision' },
        ],
      },
    ],
    check: [
      { q: 'Kerteriz sabit, mesafe azalıyor. Bu ne demek?', options: ['Çatışma tehlikesi', 'Pruvadan geçecek', 'Kıçtan geçecek', 'Demirli'], answer: 0, why: 'Yaklaşan bir teknede sabit kerteriz çatışma rotasının klasik işaretidir.' },
      { q: 'Kesişen motorlular. Kim yol verir?', options: ['Diğerini sancak tarafında gören', 'Diğerini iskele tarafında gören', 'Büyük olan', 'Hızlı olan'], answer: 0, why: 'Kural 15: diğerini sancak tarafında gören tekne yoldan çekilir.' },
      { q: 'İyi bir yol verme manevrası…', options: ['Erken ve en az 30°, genellikle sancağa', 'Birkaç derece iskeleye', 'Son anda tam yol ileri', 'Rotayı korumak'], answer: 0, why: 'Erken ve diğer teknenin fark edeceği kadar büyük olmalı.' },
      { q: 'Yol alan motorlunun sis işareti?', options: ['Her 2 dakikada bir uzun', 'İki uzun', 'Bir uzun + iki kısa', 'Beş kısa'], answer: 0, why: 'Her 2 dakikada ▬. Durmuşsa: ▬ ▬.' },
    ],
  },

  lights: {
    title: 'Seyir fenerleri: geceyi okumak',
    summary: 'Silyon, borda ve pupa fenerleri; hangi kombinasyonun teknenin türü ve yönü hakkında ne söylediği ve özel tekneler için akılda tutma cümleleri.',
    sections: [
      {
        h: 'Temel fenerler',
        blocks: [
          {
            list: [
              '**Silyon feneri**: beyaz, ileriye doğru 225° yanar (yalnızca motorlular).',
              '**Borda fenerleri**: **iskelede kırmızı**, **sancakta yeşil**; her biri pruvadan kemerenin biraz arkasına kadar 112,5° yanar.',
              '**Pupa feneri**: beyaz, geriye doğru 135° yanar.',
              '**Her yönden görünen fenerler**: her yönden görünür – özel tekneler ve demirliler için.',
            ],
          },
          { tip: '**Kırmızı = iskele (port)**. İngilizce hafıza cümlesi: "port wine is red" – porto şarabı kırmızıdır.' },
        ],
      },
      {
        h: 'Hangi tarafına bakıyorum?',
        blocks: [
          {
            table: {
              head: ['Görüyorsun', 'Baktığın taraf…', 'Anlamı'],
              rows: [
                ['Kırmızı **ve** yeşil', 'baş, tam karşıdan', 'Doğrudan sana geliyor'],
                ['Yalnızca kırmızı', 'iskele tarafı', 'Sağından soluna geçiyor'],
                ['Yalnızca yeşil', 'sancak tarafı', 'Solundan sağına geçiyor'],
                ['Yalnızca beyaz (alçak)', 'kıçı', 'Onu geçiyorsun'],
              ],
            },
          },
          { tip: 'Onun **kırmızı** feneri senin **sancak** baş omuzluğunda: sancak tarafından kesişiyor – ikiniz de motorluysanız yol veren sensin.' },
        ],
      },
      {
        h: 'Ne tür bir tekne?',
        blocks: [
          {
            table: {
              head: ['Fenerler', 'Tekne'],
              rows: [
                ['1 beyaz silyon + borda + pupa', '50 m’den kısa motorlu'],
                ['2 beyaz silyon (arkadaki yüksek) + borda + pupa', '50 m’den uzun motorlu'],
                ['Borda + pupa, silyon feneri **yok**', 'Yelkenli'],
                ['Her yönden yeşil üstünde beyaz', 'Trol teknesi'],
                ['Her yönden kırmızı üstünde beyaz', 'Balıkçı (trol değil)'],
                ['Her yönden kırmızı üstünde kırmızı', 'Kumanda altında değil'],
                ['Her yönden kırmızı – beyaz – kırmızı', 'Manevra kabiliyeti kısıtlı'],
                ['Her yönden üç kırmızı', 'Su çekimi nedeniyle kısıtlı'],
                ['Her yönden bir beyaz', 'Demirli (50 m altı)'],
              ],
            },
          },
          { list: ['"**Yeşil üstte beyaz – trol çeker gece.**"', '"**Kırmızı üstte beyaz – balık avlar gece.**"', '"**Kırmızı üstte kırmızı – kaptan yok, kumanda yok.**" (kumanda altında değil)'] },
          { widget: 'lights' },
        ],
      },
      {
        h: 'Gece Gözcülüğü oyununda',
        blocks: [
          {
            steps: [
              'Vardiyayı başlat ve ufuktaki bir fenere dokun.',
              'En az bir dakika arayla (oyun zamanı) iki kerteriz al. "sabit!" = tehlike.',
              'Fenerlerden tekne türünü söyle.',
              'Hangi tarafını gördüğünü söyle: kırmızı+yeşil = tam karşıdan, kırmızı = iskele tarafı, yeşil = sancak tarafı, yalnızca beyaz = kıçı, tek her yönden fener = her yönden görünen fener.',
              'Tehlike ya da açık diye bildir.',
            ],
          },
          { p: 'Her doğru cevap bir puan. Tekne başına üç doğru mükemmel demek.' },
          { game: 'lookout' },
        ],
      },
    ],
    check: [
      { q: 'Yalnızca yeşil bir fener görüyorsun. Baktığın taraf…', options: ['sancak tarafı', 'iskele tarafı', 'kıçı', 'başı'], answer: 0, why: 'Yeşil sancak borda feneridir.' },
      { q: 'Üst üste iki kırmızı her yönden fener?', options: ['Kumanda altında değil', 'Balıkçı', 'Su çekimi nedeniyle kısıtlı', 'Demirli'], answer: 0, why: '"Kırmızı üstte kırmızı, kaptan yok, kumanda yok."' },
      { q: 'Borda ve pupa fenerleri var ama beyaz silyon yok?', options: ['Yelkenli', 'Küçük motorlu', 'Trol teknesi', 'Demirli gemi'], answer: 0, why: 'Motorlular silyon feneri gösterir, yelkenliler göstermez.' },
    ],
  },

  pilotage: {
    title: 'Seyir planı ve pilotaj',
    summary: 'Bir seyir planında neler olur, transit ve kerterizlerle nasıl pilotaj yapılır ve bir tehlikeden uzak durmak için emniyet kerterizi nasıl kullanılır.',
    sections: [
      {
        h: 'Seyir planı',
        blocks: [
          {
            list: [
              '**Ne kadar uzak, ne kadar sürer**: mesafe ÷ tekne hızı, akıntıyla düzeltilmiş.',
              '**Gelgit**: liman ve sığlıklar için yükseklikler, yol boyunca akıntılar (gelgit dersine bak).',
              '**Kısıtlar**: gelgit kapıları, kilit ya da marina kapısı saatleri, gün ışığı.',
              '**Hava**: son tahmin; B planı ve sığınma limanları.',
              'Çıkış ve varış için **pilotaj planı**; waypoint’ler girilmiş ve iki kez kontrol edilmiş.',
              'Seyirdeyken: mevkiini her saat deftere yaz.',
            ],
          },
        ],
      },
      {
        h: 'Pilotaj araçları',
        blocks: [
          {
            list: [
              '**Transit**: haritada olan iki nesne bir hizada. Hizada kaldıkları sürece o hattın üstündesin.',
              '**Giriş hattı (leading line)**: güvenli kanalı gösteren haritalı bir transit.',
              'Haritadaki bir nesnenin **pusula kerterizi**: o hattın bir yerindesin.',
              '**Derinlik eğrisi**: iskandille bir derinliği izle.',
            ],
          },
        ],
      },
      {
        h: 'Emniyet kerterizleri',
        blocks: [
          { p: 'Emniyet kerterizi, kolay görülen haritalı bir nesneden çizilen ve **bir tehlikeyi tam temizleyen** bir hattır. O nesnenin kerterizi güvenli tarafta kaldığı sürece güvendesin.' },
          {
            steps: [
              'Tehlikenin ötesinde göze çarpan haritalı bir nesne seç (kilise, fener).',
              'Ondan tehlikenin deniz tarafındaki kenarına tam değen bir hat çiz.',
              'Tehlikeden uzağa birkaç derece pay ekle.',
              'Kerterizi ölç ve **NLT** (not less than – ’den az değil) ya da **NMT** (not more than – ’den fazla değil) diye yaz – hangisi güvenli taraftaysa.',
              'Düzenli el pusulası kerterizi al. Yanlış taraftaysan **hemen tehlikeden uzağa dön.**',
            ],
          },
          { tip: 'Hangi etiket? Tehlikeye doğru gittiğini düşün: kerteriz **küçülüyorsa** güvenli taraf **NLT**’dir; büyüyorsa **NMT**.' },
          {
            ex: {
              title: 'Kingsport’un kuzeyindeki kayalık sığlık',
              lines: [
                'Kuzeye seyrediyorsun; doğudaki kıyıdan kayalık bir sığlık uzanıyor. Kuzeyde, kıyıda bir kilise var.',
                'Kiliseden sığlığın batı kenarına tam değen hat yaklaşık 15°.',
                'Pay ekle → emniyet kerterizi **NLT 20°**: doğuya (sığlığa doğru) gittikçe kerteriz küçülür.',
                'Okuma **25°** → 20°’den büyük → güvenli, rotanı koru.',
                'Okuma **18°** → 20°’den küçük → hattın içindesin: **iskeleye dön** (batıya, sığlıktan uzağa).',
              ],
            },
          },
        ],
      },
      {
        h: 'Seyri Planla ve Yürüt oyununda',
        blocks: [
          {
            list: [
              '**1. Bölüm – Gelgit kapısı**: çıkış kaydırıcısını oynat; varış saatini, ortalama hızı ve sığlıktaki yüksekliği izle. Gelgit dersini kullan.',
              '**2. Bölüm – Emniyet kerterizi**: kırmızı hattı kiliseden kayaları tam temizleyecek şekilde (birkaç derece pay ile) döndür. Sonra her okumada karar ver: rotayı koru ya da iskeleye dön.',
              'Taşkın akıntısı seni her bacakta doğuya iter; bir iki düzeltme gerekeceğini bekle.',
            ],
          },
          { game: 'passage' },
        ],
      },
    ],
    check: [
      { q: 'Emniyet kerterizi NLT 040°. 035° okuyorsun. Ne yaparsın?', options: ['Tehlike tarafındasın – uzağa dön', 'Güvendesin', 'Tehlikeye doğru dön', 'Bir şey yapma'], answer: 0, why: '035°, 040°’den küçük; hattın yanlış tarafındasın.' },
      { q: 'Haritadaki iki nesnenin bir hizada olmasına ne denir?', options: ['Transit', 'Emniyet kerterizi', 'Waypoint', 'Derinlik eğrisi'], answer: 0, why: 'Hizada kaldıkları sürece o hattın üstündesin.' },
      { q: 'Seyirde mevkiini ne sıklıkla deftere yazarsın?', options: ['her saat', 'yalnızca varışta', 'günde bir', 'GPS varsa hiç'], answer: 0, why: 'Elektronik arızalanırsa son kayıtlı mevkiden devam edebilirsin.' },
    ],
  },

  safety: {
    title: 'Tehlike çağrıları ve acil durumlar',
    summary: 'Mayday, Pan-Pan ya da Sécurité ne zaman; DSC alarmı ve sesli Mayday nasıl gönderilir; sık görülen acil durumlarda kaptanın temel kararları.',
    sections: [
      {
        h: 'Mayday, Pan-Pan mı, Sécurité mi?',
        blocks: [
          {
            table: {
              head: ['Çağrı', 'Ne zaman', 'Örnekler'],
              rows: [
                ['MAYDAY', 'Tekne ya da kişi için ciddi ve yakın tehlike', 'Denize adam düştü, batma, kontrolsüz yangın, nefes almayan biri'],
                ['PAN-PAN', 'Acil, ama hemen hayati değil', 'Trafik şeridinde motor arızası, direği kırık ve sürükleniyor, tıbbi tavsiye'],
                ['SÉCURITÉ', 'Başkaları için güvenlik bilgisi', 'Yüzen konteyner, feneri yanmayan şamandıra'],
              ],
            },
          },
        ],
      },
      {
        h: 'DSC tehlike alarmı',
        blocks: [
          {
            steps: [
              'Telsizi aç.',
              'Zaman varsa tehlikenin türünü seç (yangın, su alma, denize adam düştü…).',
              'Yaylı kırmızı kapağı kaldır.',
              'Tehlike düğmesine bas ve **5 saniye** **basılı tut**. Telsiz MMSI numaranı ve mevkiini gönderir.',
              'Kanal 16’da sesli Mayday ile devam et.',
            ],
          },
        ],
      },
      {
        h: 'Sesli Mayday',
        blocks: [
          { p: 'Kanal **16**, **yüksek güç**. Konuşma düğmesini (PTT) bütün mesaj boyunca basılı tut ve yavaş konuş.' },
          {
            steps: [
              '"MAYDAY, MAYDAY, MAYDAY"',
              '"This is yacht Puffin, Puffin, Puffin, MMSI …"',
              '"MAYDAY yacht Puffin, MMSI …"',
              '"My position …" (enlem/boylam ya da bilinen bir noktadan kerteriz ve mesafe)',
              'Tehlikenin türü – ne oldu',
              'Teknedeki kişi sayısı **ve** "acil yardım gerekiyor"',
              'Diğer hayati bilgi (ör. can salına geçiyoruz)',
              '"Over" – sonra düğmeyi bırak ve dinle.',
            ],
          },
          { warn: 'Asla "over and out" deme. Sohbet etme – yalnızca hayati bilgi.' },
          { game: 'vhf' },
        ],
      },
      {
        h: 'Kaptanın kararları',
        blocks: [
          {
            table: {
              head: ['Durum', 'Temel kararlar'],
              rows: [
                ['Kötüleşen tahmin', 'Zaman çizelgesine göre planla: erken çık, rüzgâr artmadan dön. Backing rüzgâr + kalınlaşan bulut = cephe geliyor. Erken camadan vur.'],
                ['Kanalda motor arızası', 'Önce yelkenle kanaldan çık, gerekirse Pan-Pan. Yedekleme: uzun halat, iki baş koçuna köstek; yüklü halatı asla elle tutma.'],
                ['Karaya oturma (alçalan gelgit)', 'Hemen tam tornistan, geldiğin yoldan. Omurgayı kaldırmak için tekneyi yatır. Sonra derin suya doğru kedge demiri götür.'],
                ['Makinede yangın', 'Motoru durdur, yakıtı kes, mürettebat can yelekli güvertede. Söndürücüyü yangın deliğinden alevin dibine. Kontrolsüzse → Mayday.'],
                ['Helikopter kurtarma', 'İstenen rota ve hızı tam tut. Kılavuz halat önce suya değsin, asla bağlama. Gevşek eşyaları topla ve sabitle.'],
                ['Can salına geçmek', 'Olabildiğince teknede kal. Bağlama halatı bağlı, salı rüzgâraltına at, önce en ağır yetişkin, kuru adımla bin, acil durum çantası ve EPIRB’i al, deniz demirini at.'],
              ],
            },
          },
          { list: ['Tahmin terimleri: **imminent** < 6 sa, **soon** 6–12 sa, **later** > 12 sa.', '**Backing** = saat yönünün tersine dönüş (NW → SW), **veering** = saat yönünde.'] },
          { game: 'decisions' },
        ],
      },
    ],
    check: [
      { q: 'Direk kırıldı, yaralı yok, yavaşça açığa sürükleniyorsun. Hangi çağrı?', options: ['Pan-Pan', 'Mayday', 'Sécurité', 'Çağrı yok'], answer: 0, why: 'Yardıma ihtiyacın var ama yakın tehlike yok.' },
      { q: 'DSC tehlike düğmesini ne kadar basılı tutarsın?', options: ['5 saniye', 'Kısa bir basış', 'Biri cevap verene kadar', '1 dakika'], answer: 0, why: 'Beş saniye alarmı gönderir.' },
      { q: 'Mayday mesajı nasıl biter?', options: ['"Over"', '"Over and out"', '"Out"', '"Teşekkürler"'], answer: 0, why: '"Over" cevap beklediğin anlamına gelir; "over and out" asla kullanılmaz.' },
      { q: 'Helikopter kılavuz halat indiriyor. Ne yaparsın?', options: ['Suya değsin, sonra tut – asla bağlama', 'Havada yakala', 'Bir koça bağla', 'Kes'], answer: 0, why: 'Suda statik elektriğini boşaltır; bağlanırsa helikopteri aşağı çekebilir.' },
    ],
  },
}
