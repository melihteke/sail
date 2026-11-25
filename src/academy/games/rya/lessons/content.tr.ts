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
          { p: '**Neden olur?** Ay (ve daha az ölçüde Güneş) denizi kendine doğru çeker. Bu çekim okyanusta iki “su tepesi” oluşturur: biri Ay’a bakan tarafta, biri tam karşı tarafta. Dünya kendi etrafında dönerken her kıyı bu iki tepeden geçer – bu yüzden günde **iki yüksek su** ve **iki alçak su** olur. Güneş ve Ay aynı hizadaysa çekimleri toplanır (**sizigi**, büyük fark); dik açıdaysa birbirlerini zayıflatır (**kuadratür**, küçük fark).' },
          { widget: 'moon' },
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
          { p: '**Akıntı nedir?** Akıntı, suyun yatay olarak bir yerden başka bir yere **akmasıdır** – denizin içindeki bir nehir gibi. Tekne suyun içinde ilerler; su da hareket ediyorsa tekne onunla birlikte taşınır. Denizde dört tür akıntıyla karşılaşırsın:' },
          {
            table: {
              head: ['Akıntı türü', 'Neden olur?', 'Örnek'],
              rows: [
                ['Gelgit akıntısı', 'Ay ve Güneş’in çekimiyle deniz yükselip alçalırken suyun kıyıya gelip gitmesi', 'Manş Denizi, Hollanda kıyıları – yaklaşık 6 saatte bir yön değiştirir'],
                ['Okyanus akıntısı', 'Sürekli esen rüzgârlar, sıcaklık ve tuzluluk farkı, Dünya’nın dönmesi', 'Gulf Stream – hep aynı yöne akar'],
                ['Rüzgâr akıntısı', 'Günlerce aynı yönden esen rüzgârın yüzey suyunu sürüklemesi', 'Fırtınadan sonra kıyı boyunca 0,5–1 kn'],
                ['Nehir ve boğaz akıntısı', 'Nehir suyu ya da iki deniz arasındaki seviye ve tuzluluk farkı', 'İstanbul Boğazı – Karadeniz’den Marmara’ya'],
              ],
            },
          },
          { p: '**Gelgit akıntısı neden olur?** Kıyıda deniz 4 m yükselecekse, o kadar suyun açık denizden kıyıya **gelmesi** gerekir; deniz alçalırken aynı su **geri gider**. İşte bu gelip giden su gelgit akıntısıdır. Deniz yükselirken akana **yükselen akıntı (flood)**, alçalırken akana **alçalan akıntı (ebb)** denir. Yön değiştirdiği kısa sakin ana **durgun su (slack)** denir.' },
          {
            list: [
              'Akıntının yönü suyun **gittiği** yöndür (**set**; 090° = doğuya akıyor). Hızı knot cinsindendir (**rate**). Dikkat: rüzgârda tersidir – rüzgâr **geldiği** yönle söylenir.',
              '**On ikiler kuralı gibi davranır**: HW ve LW civarında zayıf, gelgitin ortasında (3. ve 4. saat) en kuvvetli.',
              '**Sizigi** (yeni ay ve dolunay civarı) = kuvvetli akıntı; **kuadratür** (yarım ay) = zayıf akıntı, kabaca yarısı. “Gelgit nedir?” bölümündeki Ay animasyonuna bak.',
              '**Yere göre hız (SOG)** = tekne hızı ± akıntı. Lehte eklenir, aleyhte çıkarılır; yandan akıntı tekneyi rotasından **sürükler**.',
            ],
          },
          { widget: 'stream' },
          { ex: { title: 'Lehte mi aleyhte mi?', lines: ['Durgun suda 5 kn ile 18 NM = **3 sa 36 dk**.', 'Ortalama 2 kn lehte akıntıyla: 5 + 2 = 7 kn → yaklaşık **2 sa 35 dk**.', '2 kn aleyhte akıntıyla: 5 − 2 = 3 kn → **6 saat**!', 'Aynı seyir, yalnızca çıkış saati farklı: **3,5 saat fark**.'] } },
          { p: '**Akıntı bilgisi nereden gelir?** İki kaynak var: geniş bir bölgeyi gösteren **gelgit akıntı atlası** ve haritada belirli noktalar için **gelgit elmasları**. İkisi de saatleri bir **referans limanın** (standard port) yüksek suyuna göre verir – örneğin “Dover’da HW’den 3 saat önce”. Yani önce gelgit tablosundan o limanın bugünkü HW saatini bulursun.' },
          { p: '**1) Gelgit akıntı atlası** ayrı, ince bir kitapçıktır (İngiltere’de Admiralty “Tidal Stream Atlas” serisi; Reeds gibi seyir almanaklarında da aynı sayfalar bulunur). İçinde **13 sayfa** vardır: HW’den 6 saat önceden 6 saat sonrasına kadar **her saat için bir harita**. Her haritada oklar vardır: **okun yönü** = suyun gittiği yön, **okun kalınlığı ve uzunluğu** = hız. Okun yanındaki **“14,26”** gibi sayılar knotun onda biridir: **kuadratürde 1,4 kn, sizigide 2,6 kn**. Aşağıdaki animasyon, gerçek bir atlas sayfasıyla aynı mantıkla çizilmiş basit bir örnektir.' },
          {
            steps: [
              'Gelgit tablosundan referans limanın bugünkü HW saatini bul (örneğin 13:00).',
              'Seyir saatin HW’den kaç saat önce ya da sonra? (10:00 → HW−3). Atlasın o sayfasını aç.',
              'Gideceğin yerdeki oku bul: yönünü ve “nn,ss” sayılarını oku.',
              'Bugün sizigi mi kuadratür mü? O sayıyı al; aradaysa ikisinin arasını kullan.',
            ],
          },
          { widget: 'atlas' },
          { ex: { title: 'Atlastan akıntı okumak', lines: ['Bugün HW 13:00, sen saat 10:00’da A noktasındasın → **HW−3** sayfası.', 'A’daki ok doğuya bakıyor, yanında **“14,26”** yazıyor.', 'Bugün sizigi → **2,6 kn doğuya**. Kuadratür olsaydı **1,4 kn**.', 'Aynı yerde HW+3 sayfasında ok **batıya** döner: akıntı ters yöne akar. HW sayfasında ise yalnızca bir daire vardır: durgun su.'] } },
          { p: '**2) Gelgit elması**, haritada **mor bir ◊ içindeki harftir** (A, B, C…). Haritanın kenarında bir tablo bulunur: her harf için bir sütun, her saat (HW−6 … HW+6) için bir satır. Her satırda **yön** ve iki hız vardır: **Sp** (sizigi) ve **Np** (kuadratür). Elmas tek bir noktayı anlatır, bu yüzden atlastan daha kesindir; atlas ise bütün bölgeyi bir bakışta gösterir. Bir elmas tablosunun bir bölümü:' },
          {
            table: {
              head: ['Saat', 'Yön (set)', 'Sizigi (kn)', 'Kuadratür (kn)'],
              rows: [
                ['HW −3', '045°', '2,4', '1,2'],
                ['HW −2', '050°', '2,0', '1,0'],
                ['HW −1', '060°', '1,0', '0,5'],
                ['HW', '140°', '0,2', '0,1'],
                ['HW +1', '220°', '1,0', '0,5'],
                ['HW +2', '230°', '2,1', '1,0'],
                ['HW +3', '225°', '2,5', '1,3'],
              ],
            },
          },
          {
            steps: [
              'Haritada rotana en yakın elması bul (örneğin ◊A).',
              'Seyir saatin HW’den kaç saat önce ya da sonra? Tabloda o satıra git.',
              'Gelgit tablosundan bugünkü farkı (HW − LW) bul: sizigiye mi kuadratüre mi yakın? Aradaysa iki hızın arasını al.',
              'Yönü ve hızı not et: su **o yöne doğru** akıyor.',
            ],
          },
          { widget: 'diamond' },
          { ex: { title: 'Saat 10:00’da akıntı ne?', lines: ['Bugün HW 13:00 → 10:00 = **HW −3**.', 'Tablo: yön 045°, sizigi 2,4 kn, kuadratür 1,2 kn.', 'Bugünkü fark 3,1 m: ortalama sizigi farkı 4,2 m ile kuadratür farkı 2,0 m’nin tam ortası → hız ≈ (2,4 + 1,2) ÷ 2 = **1,8 kn**.', 'Sonuç: su **045° yönüne 1,8 kn** ile akıyor.'] } },
          { ex: { title: 'Yandan akıntı: düzeltmezsen ne olur?', lines: ['Teknen 5 kn, akıntı tam yandan 2 kn.', 'Hiç düzeltmezsen her saat **2 NM yana** sürüklenirsin – 3 saatte 6 NM!', 'Çizgide kalmak için pruvayı akıntıya doğru ≈ **24°** çevir. Akıntı animasyonunda “Yandan”ı seç ve açı sürgüsüyle kendin dene: 0°’de aşağı sürüklenirsin, 24°’de tam çizgidesin, 40°’de fazla düzeltip yukarı çıkarsın.', 'Yere göre hızın biraz düşer: ≈ **4,6 kn**.'] } },
          { p: '**Kaç derece vermeliyim? – hesaplama.** Fikir basit: tekne, akıntının seni yana ittiği hızı **tam karşılayacak** kadar akıntıya doğru dönmeli. Yani teknenin hızının “yana giden” parçası akıntıya eşit olmalı. Üç yol var – kolaydan zora:' },
          {
            steps: [
              '**60 kuralı (kafadan):** açı ≈ akıntı ÷ tekne hızı × 60. Örnek: 2 kn akıntı, 5 kn tekne → 2 ÷ 5 = 0,4 → 0,4 × 60 = **24°**.',
              '**Tam formül (hesap makinesiyle):** sin(açı) = akıntı ÷ tekne hızı → açı = arcsin(0,4) = **23,6°**. Yere göre hız = tekne hızı × cos(açı) = 5 × 0,92 ≈ **4,6 kn**.',
              '**Haritada vektör üçgeni (Day Skipper yöntemi):** başlangıç noktasından 1 saatlik akıntıyı çiz (2 kn → 2 NM, akıntı yönünde). Bu okun ucundan pergeli tekne hızına (5 NM) aç ve gitmek istediğin çizgiyi kestiği yeri işaretle. Okun ucundan bu işarete giden çizginin yönü, **dümen tutacağın rotadır**.',
              'Akıntı her saat değiştiği için hesabı **her saat** (ya da gelgit elmasının değeri değiştiğinde) yeniden yap.',
            ],
          },
          {
            table: {
              head: ['Akıntı ÷ tekne hızı', '60 kuralı', 'Tam açı'],
              rows: [
                ['0,1 (örn. 0,5 ÷ 5)', '6°', '6°'],
                ['0,2 (1 ÷ 5)', '12°', '12°'],
                ['0,3 (1,5 ÷ 5)', '18°', '17°'],
                ['0,4 (2 ÷ 5)', '24°', '24°'],
                ['0,5 (2,5 ÷ 5)', '30°', '30°'],
                ['0,6 (3 ÷ 5)', '36°', '37°'],
              ],
            },
          },
          { tip: '60 kuralı gündelik seyir için yeterince iyi. Akıntı tekne hızının yarısını geçerse yere göre hızın çok düşer – böyle durumlarda seyri akıntının zayıf olduğu saatlere kaydırmayı düşün.' },
        ],
      },
      {
        h: 'Gelgit kapıları: çıkış saatini seçmek',
        blocks: [
          { p: '**Gelgit kapısı**, yalnızca belirli saatlerde “açık” olan bir yerdir – tıpkı belirli saatlerde kalkan bir köprü gibi. Kapı kapalıyken geçemezsin ya da geçmek çok zor ve tehlikelidir. Bu yüzden plan **kapıdan geriye doğru** yapılır.' },
          {
            list: [
              '**Sığlık ya da liman girişi (bar)**: yeterli **su yüksekliği** olduğu saatlerde açık.',
              '**Burun ya da boğaz**: akıntının **lehte** ya da zayıf olduğu saatlerde açık; aleyhte rüzgâr + akıntı tehlikeli dalga yapar.',
              '**Kilit ya da marina eşiği**: yalnızca açılış **saatlerinde** açık.',
            ],
          },
          {
            steps: [
              'Kapının açık olduğu zaman aralığını bul (yeterli su ya da lehte akıntı).',
              'Seyrin ne kadar süreceğini tahmin et – **akıntıyı da hesaba katarak**.',
              'ETD (çıkış) = varış saati − seyir süresi.',
              'Yol boyunca akıntıya bak; lehte akıntıyı olabildiğince uzun kullanmak için biraz erkene ya da geçe kaydır.',
            ],
          },
          { widget: 'gate' },
          { ex: { title: 'Basit örnek: önce durgun su, sonra akıntı', lines: ['Kapı (sığlık) **10:50**’de açılıyor, **15:10**’da kapanıyor. Seyir 18 NM, teknen 5 kn.', 'Durgun suda süre: 18 ÷ 5 = 3,6 sa = **3 sa 36 dk** → en erken çıkış 10:50 − 3:36 ≈ **07:15**?', 'Ama sabah akıntı **lehte**: 07:15’te çıkarsan 10:17’de varırsın – sığlıkta yalnızca 3,2 m var. **Çok erken!**', 'Akıntıyla yeniden hesapla: en erken uygun çıkış ≈ **08:30**, en geç ≈ **11:30** (aleyhte akıntıyla 15:04’te, kapı kapanmadan hemen önce varırsın).', 'Ders: akıntı süreyi değiştirir, süre de varış saatini. **Her zaman akıntıyla birlikte hesapla.**'] } },
          {
            ex: {
              title: 'Kingsport: üç çıkış saati karşılaştırması (HW 13:00)',
              lines: [
                'Akıntı 08:00–13:00 arası lehte, en kuvvetlisi 10:00–11:00; HW’den sonra aleyhe döner.',
                '**06:00** çıkış → önce aleyhte akıntı, 09:27’de varış, sığlıkta 2,3 m: **çok erken** ✗',
                '**09:00** çıkış → ortalama ≈ 6,9 kn, 11:37’de varış, 4,4 m: **giriyorsun**, üstelik tüm yol lehte akıntıyla ✔⭐⭐⭐',
                '**12:00** çıkış → akıntı aleyhe döner, 16:12’de varış, 2,7 m: **çok geç** ✗',
              ],
            },
          },
          { tip: 'Oyunda üç yıldız = sığlıkta yeterli su **ve** en az 6,6 kn ortalama hız (yolun çoğunda lehte akıntı). Yukarıdaki çizelgede 08:30 ile 10:00 arasındaki çıkışları dene, sonra oyunda aynısını yap.' },
          { game: 'passage' },
        ],
      },
      {
        h: 'Gelgit ve demirleme',
        blocks: [
          { p: 'Demirdeyken deniz bütün gece yükselip alçalır, yani **derinlik sürekli değişir**. Demirlemeden önce iki soruyu cevapla: **Yüksek suda** zincirim yeterli mi? **Alçak suda** omurgamın altında hâlâ su var mı?' },
          { p: '**Kalibre nedir?** Kalibre = **zincir boyu ÷ su derinliği**. 4 : 1 demek, “her 1 m derinlik için 4 m zincir” demektir. Zincir ne kadar uzunsa demire gelen çekiş o kadar yatay olur ve demir o kadar iyi tutar. Hesapta her zaman **yüksek sudaki** derinliği kullan: gecenin en derin anında yeterliyse gece boyunca hep yeterlidir.' },
          {
            table: {
              head: ['Durum', 'Kalibre', 'HW derinliği 6 m ise zincir'],
              rows: [
                ['Tam zincir, sakin hava, kısa mola', 'en az 4 : 1', '24 m'],
                ['Tam zincir, gece kalınacak ya da rüzgâr artabilir', '5 : 1', '30 m'],
                ['Tam zincir, kuvvetli rüzgâr', '7 : 1', '42 m'],
                ['Halat + birkaç metre zincir', '6 : 1 – 8 : 1', '36 – 48 m'],
              ],
            },
          },
          { tip: '7 : 1’den fazlası çoğu zaman gereksizdir: salınım dairen büyür ve komşu teknelere çarparsın. Demir Koyu oyununda üç yıldız için **4 : 1 ile 7 : 1 arası** gerekir.' },
          {
            steps: [
              'Gelgit tablosundan gece boyunca **HW** ve **LW** yüksekliklerini bul.',
              'HW derinliği = harita derinliği + HW yüksekliği → zincir en az **4 ×** bu derinlik.',
              'LW derinliği = harita derinliği + LW yüksekliği → omurga altı = LW derinliği − su çekimi; en az **0,5 m** olmalı.',
              'Aynı kontrolü salınım dairenin **en sığ** noktası için de yap (Demirleme dersine bak).',
            ],
          },
          { widget: 'tideanchor' },
          { p: '**Animasyon nasıl kullanılır?** Üç sürgü var: **harita derinliği**, **zincir** ve **zaman**. ▶ düğmesiyle 12 saati oynatabilir ya da zaman sürgüsünü elle kaydırabilirsin. Resmin altındaki **pratik görevleri** sırayla yap: her görev tamamlanınca kendiliğinden ✔ olur; takılırsan 💡 ipucunu oku.' },
          { ex: { title: 'Tuzak 1: alçak suda demirleyip yüksek suda taramak', lines: ['Harita derinliği 3,0 m. Akşam LW’de (0,6 m) demirliyorsun: derinlik 3,6 m.', '“4 kat yeter” diye 4 × 3,6 ≈ **15 m** zincir veriyorsun.', 'Gece yarısı HW (4,2 m): derinlik 7,2 m → kalibre 15 ÷ 7,2 ≈ **2 : 1** → rüzgâr artınca **demir tarar**!', 'Doğrusu: HW derinliğini kullan → 4 × 7,2 ≈ **30 m** zincir.'] } },
          { ex: { title: 'Tuzak 2: yüksek suda demirleyip alçak suda oturmak', lines: ['Harita derinliği yalnızca 0,5 m. HW’de (4,2 m) derinlik 4,7 m – “bol bol su var” gibi görünüyor.', 'Gece LW (0,6 m): derinlik 0,5 + 0,6 = **1,1 m**. Su çekimin 1,8 m.', 'Sonuç: **karaya oturursun** – üstelik gece yarısı, eğilmiş bir teknede.', 'Doğrusu: LW derinliğini kontrol et → 1,1 − 1,8 < 0,5 m → burası **uygun değil**.'] } },
          { warn: 'Demirledikten sonra bir **demir alarmı** kur (plotter ya da telefon uygulaması) ve rüzgâr ya da gelgit dönünce konumunu kontrol et.' },
          { tip: 'Ayrıntılar için **Demirleme** dersine bak; orada Demir Koyu oyunu adım adım anlatılıyor. Sonra **Demir Koyu** oyununda dene.' },
          { game: 'anchor' },
        ],
      },
    ],
    check: [
      { q: 'LW 06:00 1,0 m, HW 12:00 4,6 m. Saat 09:00’da gelgit yüksekliği?', options: ['2,8 m', '2,2 m', '3,7 m', '1,9 m'], answer: 0, why: 'Fark 3,6 m, bir on ikide bir 0,3 m. LW’den 3 saat sonra = 6/12 = 1,8 m. 1,0 + 1,8 = 2,8 m.' },
      { q: 'Harita derinliği 1,2 m, gelgit yüksekliği 2,5 m. Su derinliği?', options: ['3,7 m', '1,3 m', '2,5 m', '1,2 m'], answer: 0, why: 'Derinlik = harita derinliği + gelgit yüksekliği.' },
      { q: 'Gelgit en hızlı hangi saatlerde yükselir?', options: ['3. ve 4.', '1. ve 6.', '2. ve 5.', 'Hepsi aynı'], answer: 0, why: '1-2-3-3-2-1: ortadaki saatlerin her biri üç on ikide bir.' },
      { q: 'Teknen 5 kn gidiyor, akıntı 1,5 kn aleyhte. Yere göre hız?', options: ['3,5 kn', '6,5 kn', '5 kn', '1,5 kn'], answer: 0, why: 'Aleyhte akıntı çıkarılır: 5 − 1,5 = 3,5 kn.' },
      { q: 'Alçak suda 3,6 m derinlikte 15 m zincirle demirledin. Yüksek suda derinlik 7,2 m. Ne olur?', options: ['Kalibre ≈ 2 : 1’e düşer, demir tarayabilir', 'Hiçbir şey değişmez', 'Yalnızca omurga altında daha çok su olur', 'Karaya oturursun'], answer: 0, why: '15 ÷ 7,2 ≈ 2 : 1. Zincir boyunu her zaman yüksek sudaki derinliğe göre ver: 4 × 7,2 ≈ 30 m.' },
      { q: 'Teknen 6 kn, akıntı tam yandan 2 kn. Çizgide kalmak için yaklaşık ne kadar düzeltme?', options: ['≈ 20°', '≈ 2°', '≈ 45°', 'Gerek yok'], answer: 0, why: '60 kuralı: 2 ÷ 6 × 60 = 20°.' },
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
          { p: '**Oyunun amacı:** bir koyda gece demirlemek. Sabaha kadar 12 saat geçer; bu sırada gelgit iner çıkar ve rüzgâr döner. Demir **taramamalı**, tekne **karaya oturmamalı** ve dönerken **kayaya ya da başka bir tekneye** değmemeli.' },
          {
            steps: [
              'Üstten bir koy seç: **Akdeniz koyu** (gelgit yok, rüzgâr döner), **Gelgitli koy** (3,6 m gelgit farkı) ya da **Kalabalık demir yeri** (4 tekne, 2 kaya).',
              'Yandaki kutuyu oku: **şimdiki gelgit** (gecenin en yükseği), **en düşük gelgit** ve **rüzgâr tahmini**.',
              'Fareyi haritada gezdir: her noktanın **harita derinliği** görünür. Altı çizili sayılar kurur.',
              'Yeterince derin bir nokta seç: harita derinliği ≥ 1,8 (su çekimi) + 0,5 (pay) − en düşük gelgit. Kıyıdan biraz uzak dur – tekne dönerken bir daire çizer.',
              'Haritaya **tıkla**: demir oraya düşer. Kutuda **şu anki derinlik** yazar.',
              'Zincir sürgüsünü ayarla: en az **4 ×** şu anki derinlik, en fazla **7 ×**. Kalibre sürgünün altında yazar.',
              'Mavi **salınım dairesi** kıyıya, kayaya ya da turuncu kesikli dairelere **değmemeli**. Değiyorsa başka bir nokta seç ya da zinciri biraz kısalt.',
              '**Geceyi oynat** düğmesine bas ve izle.',
            ],
          },
          {
            table: {
              head: ['Koy', 'Gelgit (şimdi / en düşük)', 'Önerilen harita derinliği', 'Zincir'],
              rows: [
                ['Akdeniz koyu', '0,3 / 0,1 m', '5,5 – 7 m', '25 m'],
                ['Gelgitli koy', '4,2 / 0,6 m', '3,5 – 4,5 m', '35 m'],
                ['Kalabalık demir yeri', '3,0 / 0,4 m', '≈ 3 m', '25 m'],
              ],
            },
          },
          { ex: { title: 'Gelgitli koy, adım adım', lines: ['Gelgit şimdi 4,2 m, gece en düşük 0,6 m. Su çekimi 1,8 m.', 'En az harita derinliği: 1,8 + 0,5 − 0,6 = **1,7 m**. Daire büyük olacağı için ≈ **4 m** olan bir yer seçiyorum.', 'Şu anki derinlik: 4 + 4,2 = **8,2 m** → zincir en az 4 × 8,2 ≈ 33 m → **35 m** (en fazla 7 × 8,2 ≈ 57 m).', 'Salınım yarıçapı ≈ 35 + 5 = **40 m**. Bu daire kayaya ya da diğer teknenin dairesine değmiyorsa → Geceyi oynat → ⭐⭐⭐'] } },
          {
            list: [
              '**Demir taradı** → kalibre 4 : 1’in altında. Zinciri artır.',
              '**Karaya oturdu** → dairenin bir yerinde alçak suda yeterli su yok. Daha derin bir yer seç.',
              '**Kayaya ya da tekneye çarptı** → salınım dairen kayaya ya da başka bir dairenin içine girdi. Yer değiştir ya da zinciri biraz kısalt (ama 4 : 1’in altına inme).',
              '**İki yıldız** → güvendesin ama kalibre 7 : 1’den fazla ya da omurga altı bir an 0,5 m’nin altına indi.',
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
          { tip: 'Kanallar, prosedür kelimeleri, MAYDAY RELAY, DSC ve diğer denizcilerle canlı pratik için: **VHF telsiz: kanallar, prosedürler ve canlı pratik** dersi.' },
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
  radio: {
    title: 'VHF telsiz: kanallar, prosedürler ve canlı pratik',
    summary: 'Denizcilik VHF’i nasıl çalışır, hangi kanal kullanılır, telsizde nasıl konuşulur ve hecelenir, rutin ve tehlike çağrıları, ayrıntılı DSC – ardından VHF pratik telsizinde diğer denizcilerle pratik.',
    sections: [
      {
        h: 'Denizcilik VHF cihazı',
        blocks: [
          { p: 'VHF **görüş hattıyla** çalışır: yüksek antenli bir kıyı istasyonuna yaklaşık 20–30 mil, tekneden tekneye ya da el telsiziyle çok daha az. **Aynı anda yalnızca bir istasyon konuşabilir**: bas-konuş tuşunu (**PTT**) basılı tut, konuş, dinlemek için bırak.' },
          {
            table: {
              head: ['Kontrol', 'Ne işe yarar'],
              rows: [
                ['**16 / 9** tuşu', 'Doğrudan çağrı ve tehlike kanalına geçer.'],
                ['**H/L** (25 W / 1 W)', 'Limanda ve yakın mesafede **düşük güç**; uzak mesafe ve tehlike için **yüksek güç**.'],
                ['**Squelch**', 'Cızırtı tam kesilene kadar aç. Fazla açarsan zayıf istasyonları kaçırırsın.'],
                ['**Dual / tri watch**', 'Başka kanaldayken 16’yı da dinler. Denizde 16’yı düzgün dinlemenin yerini tutmaz.'],
                ['**DSC** kırmızı tuşu', 'Kapağın altında. MMSI ve mevkiinle dijital tehlike alarmı gönderir (GPS bağlantısı gerekir).'],
              ],
            },
          },
          { list: ['Denizcilik VHF’i kullanmak için operatör belgesi (**SRC**; Hollanda’da Marifoonbedieningscertificaat) ve tekne telsiz lisansı gerekir.', 'Lisans tekneye bir **çağrı işareti** (ör. PD1234) ve 9 haneli bir **MMSI** verir (Hollanda MMSI’leri 244, 245 ya da 246 ile başlar).', 'El telsizi yedek olarak ve botta idealdir, ama güverte seviyesinden menzili sadece birkaç mildir.'] },
        ],
      },
      {
        h: 'Hangi kanal?',
        blocks: [
          {
            table: {
              head: ['Kanal', 'Kullanım', 'Not'],
              rows: [
                ['**16**', 'Tehlike, emniyet ve çağrı', 'Denizde burayı dinle. Çağır, sonra çalışma kanalına geç. Asla sohbet etme.'],
                ['**70**', 'Sadece DSC', 'Dijital alarmlar – asla ses.'],
                ['**06**', 'Gemiden gemiye, olay yerinde arama kurtarma', 'Helikopter ve can botları da teknelerle burada konuşur.'],
                ['**08, 69, 72, 77**', 'Gemiden gemiye çalışma kanalları', '16’da birinde anlaş, sonra geç.'],
                ['**12, 14**', 'Liman işletmesi, VTS', 'Her liman ya da trafik bölgesi için almanakta yazan kanalı kullan.'],
                ['**13**', 'Köprüden köprüye seyir emniyeti', 'Büyük gemiler geçişlerini burada ayarlar.'],
                ['**23, 83**', 'Hollanda Sahil Güvenlik çalışma kanalları', 'Emniyet ve hava durumu yayınları 16’dan duyurulur.'],
                ['**31 / 80 / M**', 'Marinalar', 'Hollanda marinaları çoğunlukla 31, İngiltere marinaları 80 ya da M (37).'],
                ['**10**', 'Hollanda ve Belçika iç sularında gemiden gemiye', 'Nehir ve kanallarda (ör. Ren) **ATIS** açık olmak zorunda.'],
              ],
            },
          },
          { tip: 'Birini çağırmadan önce birkaç saniye **dinle**. Başka bir istasyonun üstüne konuşmaya doubling denir: iki mesaj da karşıya ulaşmaz.' },
        ],
      },
      {
        h: 'Konuşmak ve hecelemek',
        blocks: [
          { p: 'Yavaş ve net konuş, mikrofonu ağzından birkaç santim uzakta tut ve **sayıları rakam rakam** söyle. İsimleri fonetik alfabeyle hecele.' },
          {
            table: {
              head: ['A–I', 'J–R', 'S–Z', 'Sayılar'],
              rows: [
                ['A Alfa', 'J Juliett', 'S Sierra', '0 Zero'],
                ['B Bravo', 'K Kilo', 'T Tango', '1 One'],
                ['C Charlie', 'L Lima', 'U Uniform', '2 Two'],
                ['D Delta', 'M Mike', 'V Victor', '3 **Tree**'],
                ['E Echo', 'N November', 'W Whiskey', '4 **Fower**'],
                ['F Foxtrot', 'O Oscar', 'X X-ray', '5 **Fife**'],
                ['G Golf', 'P Papa', 'Y Yankee', '6 Six, 7 Seven'],
                ['H Hotel', 'Q Quebec', 'Z Zulu', '8 **Ait**'],
                ['I India', 'R Romeo', '', '9 **Niner**'],
              ],
            },
          },
          {
            table: {
              head: ['Prosedür kelimesi', 'Anlamı'],
              rows: [
                ['THIS IS', 'Kendi adından önce söylenir.'],
                ['OVER', 'Bitirdim, cevabını bekliyorum.'],
                ['OUT', 'Konuşma bitti, cevap beklenmiyor. Asla "over and out" deme.'],
                ['RECEIVED', 'Mesajını aldım.'],
                ['SAY AGAIN', 'Son mesajını (ya da belirttiğim kısmı) tekrarla.'],
                ['I SPELL', 'Ardından fonetik heceleme geliyor.'],
                ['CORRECTION', 'Hata yaptım; doğrusu geliyor.'],
                ['WAIT … MINUTES', 'Ara vermem gerekiyor; beklemede kal.'],
                ['ALL STATIONS', 'Dinleyen herkese yayın.'],
                ['STATION CALLING', 'Bir çağrı duydum ama kimin yaptığını anlamadım.'],
              ],
            },
          },
        ],
      },
      {
        h: 'Rutin bir çağrı',
        blocks: [
          { p: 'Karşı istasyonun adını **iki kez**, kendi adını **iki kez** söyle, bir çalışma kanalı öner ve over de. Kısa tut; kanal ortak kullanılıyor.' },
          {
            ex: {
              title: 'Puffin yatı marinadan bir gecelik yer istiyor',
              lines: [
                'Puffin: "Den Helder Marina, Den Helder Marina, this is yacht Puffin, Puffin, over."',
                'Marina: "Puffin, this is Den Helder Marina, go ahead, over."',
                'Puffin: "Puffin. Request a berth for one night, length eleven metres, draught one decimal eight metres, ETA one five tree zero, over."',
                'Marina: "Puffin, Den Helder Marina. Pontoon Charlie, box one two, port side to, over."',
                'Puffin: "Pontoon Charlie, box one two, port side to. Puffin, out."',
              ],
            },
          },
          { tip: '16’da sadece ilk teması kur. Bir çalışma kanalında anlaş ("channel seven two") ve orada devam et.' },
        ],
      },
      {
        h: 'Telsizde tehlike, aciliyet ve emniyet',
        blocks: [
          { p: 'Öncelikli çağrılar her şeyi keser. Hangisinin ne zaman kullanılacağını ve sesli MAYDAY’in tamamını **Tehlike çağrıları ve acil durumlar** dersi anlatıyor; burada 16’da duyacağın diğer şeyler var.' },
          {
            table: {
              head: ['Çağrı', 'Öncelik', 'Örnek'],
              rows: [
                ['**MAYDAY**', 'Tehlike: ciddi ve yakın tehlike', 'Kontrolsüz yangın, batma, denize adam düşmesi'],
                ['**PAN-PAN**', 'Aciliyet: hayati tehlike yok', 'Sığlık yakınında motor arızası, yaralı mürettebat'],
                ['**SÉCURITÉ**', 'Emniyet bilgisi', 'Sürüklenen konteyner, fırtına uyarısı'],
              ],
            },
          },
          {
            ex: {
              title: 'MAYDAY RELAY – kimsenin cevap vermediği bir tehlikeyi iletmek',
              lines: [
                '"MAYDAY RELAY, MAYDAY RELAY, MAYDAY RELAY"',
                '"ALL STATIONS, ALL STATIONS, ALL STATIONS (ya da kıyı istasyonu ×3)"',
                '"THIS IS yacht Puffin, Puffin, Puffin, call sign Papa Delta One Two Tree Fower"',
                '"Following received from yacht Sea Breeze at one four tree zero UTC:"',
                '"MAYDAY Sea Breeze, position …, on fire, four persons on board, require immediate assistance, OVER"',
              ],
            },
          },
          {
            table: {
              head: ['Telsiz sessizliği', 'Anlamı'],
              rows: [
                ['SEELONCE MAYDAY', 'Sadece tehlikeyi yöneten istasyon kullanır: diğer herkes yayını keser.'],
                ['PRUDONCE', 'Kısıtlı yayın yapılabilir; tehlike henüz bitmedi.'],
                ['SEELONCE FEENEE', 'Tehlike bitti; normal yayın devam edebilir.'],
              ],
            },
          },
          { warn: 'Bir MAYDAY mı duydun? **Not al** (saat, ad, mevki, tehlikenin türü), sessiz kal ve dinle. Kıyı istasyonu birkaç dakika içinde cevap vermezse ve yardım edebiliyorsan onayla; edemiyorsan MAYDAY RELAY gönder.' },
        ],
      },
      {
        h: 'Ayrıntılı DSC',
        blocks: [
          { p: 'Digital Selective Calling, kanal **70**’ten kısa bir dijital mesaj gönderir. Menzildeki her DSC cihazı alarm çalar ve kimin, nerede ve neden çağırdığını gösterir.' },
          {
            table: {
              head: ['DSC çağrısı', 'Kullanım'],
              rows: [
                ['**Distress**', 'Kırmızı tuş, 5 saniye basılı. Bir kıyı istasyonu onaylayana kadar otomatik tekrarlanır.'],
                ['**Urgency / Safety** (tüm gemiler)', 'Bir PAN-PAN ya da SÉCURITÉ’yi duyurur; mesaj 16’dan sesli gelir.'],
                ['**Individual / routine**', 'Tek bir tekneyi MMSI ile çağırır, telefon gibi; iki telsizi de seçtiğin çalışma kanalına geçirir.'],
              ],
            },
          },
          {
            ex: {
              title: 'Yanlış bir DSC alarmını iptal etmek',
              lines: [
                'Telsizin destekliyorsa DSC menüsünden iptal et.',
                'Kanal 16’da: "ALL STATIONS, ALL STATIONS, ALL STATIONS"',
                '"THIS IS Puffin, Puffin, Puffin, call sign Papa Delta One Two Tree Fower, MMSI two four four …"',
                '"Please cancel my distress alert of one four two five UTC. OUT."',
              ],
            },
          },
          { list: ['**GMDSS deniz alanları**: A1 bir kıyı istasyonunun VHF menzilinde (VHF’de DSC), A2 MF menzili, A3 uydu kapsamı, A4 kutup suları.', 'Kıyı istasyonları hava ve seyir uyarılarını (MSI) 16’da duyurduktan sonra yayınlar. Hollanda Sahil Güvenliği 23 ve 83 kanallarını kullanır.'] },
        ],
      },
      {
        h: 'VHF pratik telsizinde pratik yap',
        blocks: [
          { p: 'radio.mteke.com adresindeki **VHF pratik telsizi** ortak bir eğitim telsizidir: gerçek sesler, gerçek kanallar, DSC tuşu ve prosedür kartları – ama gerçek bir sahil güvenlik yok. Bir arkadaşınla ya da kulüpten biriyle pratik yap; biri tekneyi, diğeri Sahil Güvenlik’i ya da limanı oynar.' },
          {
            steps: [
              'Aşağıdan **Google ile giriş yap**. Telsizi sadece giriş yapan denizciler açabilir; diğerleri yalnızca seçtiğin tekne ya da istasyon adını görür.',
              'Bir **rol** seç: Vessel (denizdeki tekne), Coast Guard (DSC alarmlarını onaylar ve tehlikeyi yönetir), Port Control (liman) ya da Instructor (tüm kanalları duyar).',
              'Bir **tekne ya da istasyon adı**, uydurma bir **çağrı işareti** ve **MMSI** gir. Asla bir teknenin gerçek MMSI’sini kullanma.',
              'Partnerinle bir **tatbikat kodunda** anlaşın (ör. VHF-4821) ve ikiniz de girin. Aynı koda sahip herkes aynı "deniz"dedir.',
              '**Join exercise**’e bas ve **mikrofona** izin ver. Hoparlörden gelen ses mikrofona yankı yapmasın diye **kulaklık** kullan.',
            ],
          },
          { img: { src: '/academy/vhf/join.webp', alt: 'Tatbikata katılmak: rol, tekne adı, çağrı işareti, MMSI ve ortak tatbikat kodu.', width: 504 } },
          {
            steps: [
              '**Ekranı** oku: büyük sayı kanalın; STANDBY sessiz demek, RX ve isim kimin konuştuğunu gösterir, TX senin yayında olduğun anlamına gelir.',
              'Konuşurken **PUSH TO TALK**’u (ya da **boşluk** tuşunu) **basılı tut**, dinlemek için bırak – tıpkı gerçek bir telsiz gibi. Bir yayın 60 saniye sonra kesilir.',
              'Kanalı **CH ▲ / CH ▼**, listeden ya da kırmızı **16** tuşuyla değiştir. Sadece kendi kanalındaki istasyonları duyarsın.',
              'Tehlike için: **türü** seç, bir mevki belirle (**Wadden Sea pos** rastgele verir, **GPS** seninkini kullanır) ve **DISTRESS’i 5 saniye basılı tut**. Tüm istasyonlara alarm gider; telsiz sesli MAYDAY için 16’ya geçer.',
              '**Coast Guard** **Acknowledge (DSC)**’ye basar ve 16’dan cevap verir. **Prosedür kartları** isimler, çağrı işaretleri ve mevkiyle kendiliğinden dolar – ezberleyene kadar yüksek sesle oku.',
              '**Tatbikat kaydı** her yayını ve alarmı saatiyle tutar. Sonrasında değerlendirme için indir.',
            ],
          },
          { img: { src: '/academy/vhf/vessel.webp', alt: 'DSC alarmı onaylandıktan sonra kanal 16’da yayın yapan tekne; MAYDAY kartı kendiliğinden doldu.' } },
          { img: { src: '/academy/vhf/coast.webp', alt: 'Sahil Güvenlik görünümü: DSC tehlike alarmı, tekneden RX ve onay kartı.' } },
          { widget: 'vhfRadio' },
          {
            list: [
              '**Teknede yangın** – tekne DSC alarmı (Fire, explosion) ve sesli MAYDAY gönderir; Sahil Güvenlik onaylar, teknedeki kişi sayısını ve can kurtarma ekipmanını sorar ve SEELONCE MAYDAY ilan eder.',
              '**Motor arızası** – tekne 16’dan PAN-PAN çağırır; Sahil Güvenlik görüşmeyi kanal 23’e taşır, mevkiyi, sürüklenmeyi ve demirlemenin mümkün olup olmadığını sorar.',
              '**Limana giriş** – tekne kanal 12’den Port Control’den giriş izni ve yer ister.',
              '**Seyir uyarısı** – bir istasyon 16’dan SÉCURITÉ duyurur ve uyarıyı kanal 67’de okur.',
              '**Yanlış alarm** – DISTRESS’e yanlışlıkla bas, sonra cancel (false alert) ile ve 16’dan sesli olarak iptal et.',
            ],
          },
          { warn: 'Bu bir eğitim telsizidir. Asla gerçek bir VHF’te pratik yapma: gerçek bir MAYDAY ya da DSC alarmı gerçek bir kurtarma başlatır.' },
        ],
      },
    ],
    check: [
      { q: 'Akşamki demir yeri hakkında konuşmak için başka bir yatı çağırmak istiyorsun. Nerede?', options: ['16’da temas kur, sonra 72 gibi bir gemiden gemiye kanala geç', '16’da kal', 'Kanal 70', 'Kanal 13'], answer: 0, why: '16 sadece ilk temas için; 70 sadece DSC, 13 ise büyük gemiler arası seyir emniyeti içindir.' },
      { q: 'Telsizde 3 sayısı nasıl söylenir?', options: ['Tree', 'Three', 'Tri', 'Thuree'], answer: 0, why: 'Telsiz sayıları gürültüde anlaşılsın diye Tree, Fower, Fife ve Niner’dır.' },
      { q: 'Hangi prosedür kelimesi konuşmayı bitirir?', options: ['OUT', 'OVER', 'OVER AND OUT', 'ROGER'], answer: 0, why: 'OUT bitirir; OVER cevap ister. "Over and out" kendi içinde çelişkilidir.' },
      { q: 'Kimsenin cevap vermediği bir MAYDAY duyuyorsun ve tehlikedeki tekneye ulaşamıyorsun. Ne gönderirsin?', options: ['MAYDAY RELAY', 'SÉCURITÉ', 'PAN-PAN', 'Hiçbir şey'], answer: 0, why: 'MAYDAY RELAY tehlikeyi kıyı istasyonuna ya da tüm gemilere iletir.' },
      { q: 'DSC tehlike tuşuna yanlışlıkla bastın. Sonra…', options: ['İptal et ve iptali 16’dan ALL STATIONS’a duyur', 'Telsizi kapat ve hiçbir şey söyleme', 'PAN-PAN gönder', 'Can botunu bekle'], answer: 0, why: 'Hemen iptal et ve kurtarma başlamasın diye 16’dan herkese söyle.' },
    ],
  },
}
