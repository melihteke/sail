import type { Lang } from '../../../../i18n'
import type { ScenarioText } from '../text'

export const tssText: Record<Lang, ScenarioText> = {
  en: {
    title: 'TSS crossing: St Brannock → Port Merrow',
    short: 'TSS crossing',
    summary: 'Leave an island marina over a drying sill, cross a busy traffic separation scheme at right angles and let the stream set you – then correct for it.',
    chartTitle: 'Ravensey Strait – training chart (fictional)',
    legend: [
      'Pink lanes with arrows: traffic lanes of the TSS (westbound south, eastbound north)',
      'Darker band: separation zone – do not stop or fish in it',
      'Dashed magenta line: the lane crossing (fixed heading); circle = where we come out',
      'Magenta squares and lines: waypoints and course-to-steer legs',
      'Italic figures: charted depths (m below CD)',
    ],
    wptNotes: [
      'Outside St Brannock fairway buoy, clear of the island.',
      'Southern edge of the TSS – from here we hold the crossing heading.',
      'Port Merrow approach, near the fairway buoy.',
    ],
    notes: [
      'Cross the TSS on a heading at right angles to the traffic flow (000°T), as fast as practicable. Do not correct for the stream inside the lanes.',
      'Ships in the lanes have the right of way in practice: we must not impede them. Keep a sharp lookout and listen on VHF.',
      'The sill opens {dayOpen} and closes {dayClose} local – miss it and we stay in St Brannock until the next tide.',
      'After the lanes, plot the position: the stream will have set us about {setNm} M sideways. Work out a new CTS to WPT3.',
      'Bolt hole: return to St Brannock only inside the sill window; otherwise heave to or anchor off.',
    ],
    overview:
      'On {date} we slip from St Brannock at {castOff}, inside the sill window ({open}–{close}), and leave WPT1 at {depart}. At the edge of the TSS we turn to 000°T and hold it across the lanes for {l2min} min; the stream sets us about {setNm} M sideways. On the north side we steer {l3ctsM}M to WPT3 and reach Port Merrow at about {eta}. (All times local.)',
    gateNote: 'St Brannock marina has a sill drying 2.2 m – the gate is at departure, not on arrival.',
    sections: {
      brief: [
        {
          p: 'This time the tide limits the **departure**: the island marina has a **sill** that holds water in at low tide, so we can only get out around high water. Out at sea we must cross a **traffic separation scheme (TSS)**, where the collision rules say how to cross – and that changes how we use the stream.',
        },
        {
          ex: {
            title: 'The task',
            lines: [
              'Date: **{date}** · boat **{boat}**, draught **{draft} m**, **{speed} kn**.',
              'From St Brannock (secondary port, island) to Port Merrow (standard port, mainland), ≈ **{nm} M** at sea.',
              'Gate: the marina sill **dries 2.2 m**.',
              'Danger: the **TSS** – two lanes of big ships and a separation zone between them.',
            ],
          },
        },
        { warn: 'Ravensey Strait is fictional. Real TSS crossings (for example in the English Channel) need careful lookout, a radar reflector and often AIS.' },
      ],
      almanac: [
        { p: 'Port Merrow is the **standard port** with a big range (springs ≈ 5.4 m). St Brannock is the **secondary port**: its HW comes 10–20 minutes **earlier** (negative differences!) and a little lower.' },
        { tip: 'A minus in the differences box means the secondary port is earlier than the standard port. Subtract, do not add.' },
      ],
      tides: [{ p: 'HW Port Merrow is at **{hw}** local with **{hwH} m** (range **{range} m**, factor **{f}**). HW St Brannock is at **{secHw}** with **{secH} m**.' }],
      gate: [
        {
          ex: {
            title: 'When can we get over the sill?',
            lines: ['Need = sill drying 2.2 + draught 1.7 + clearance 0.4 = **{need} m** of tide at St Brannock.', 'Rising tide: the sill opens at **{dayOpen}** local.', 'Falling tide: it closes at **{dayClose}** local – we must have slipped by then.'],
          },
        },
        { tip: 'A marina sill is a departure gate: check the cast-off time, not the arrival time.' },
      ],
      streams: [
        {
          p: 'In the strait the stream runs **east before HW Port Merrow and west after it**, up to 2.6 kn at springs, with slack around HW−5 and HW+1. Our route goes **north**, so the stream is always **across** us: it never helps or hinders much, but it sets us sideways.',
        },
      ],
      departure: [
        {
          list: [
            'The sill decides the earliest and latest cast-off.',
            'Inside that window we choose the time that gives the **shortest passage**: crossing near HW the east-going stream is weak and the stream in the last leg is slack.',
            'Our choice: slip at **{castOff}**, WPT1 at **{depart}**. The lane crossing sets us **{setNm} M** sideways.',
          ],
        },
      ],
      route: [
        {
          list: [
            '**Rule 10 (IRPCS):** a vessel crossing a TSS shall do so on a **heading** as nearly as practicable at **right angles** to the general direction of traffic flow.',
            'The rule says **heading**, not track: we point the bow 000°T and accept the set. Other ships then see our side and know at once what we are doing, and we spend the least time in the lanes.',
            'Small sailing vessels must **not impede** ships following a lane. Cross quickly – motor-sail if needed.',
            'Do not enter the separation zone except to cross it. Plan WPT2 at the edge of the lane so the crossing starts cleanly.',
          ],
        },
      ],
      cts: [
        {
          ex: {
            title: 'Crossing the lanes, then correcting',
            lines: [
              'Leg 1 to the edge of the TSS: CTS **{l1cts}T** ({l1ctsM}M) – a normal course-to-steer leg.',
              'Lanes: heading **000°T** ({l2ctsM}M) for {l2min} min. Stream {l2set} {l2rate} kn → ground track **{l2track}T**, set **{setNm} M**.',
              'Plot where we come out, then a new triangle from there: CTS **{l3cts}T** ({l3ctsM}M) to WPT3.',
            ],
          },
        },
      ],
      practice: [{ tip: 'For the TSS leg there is no CTS to work out – only the sideways set: rate × sin(angle between set and heading) × time.' }],
    },
  },
  tr: {
    title: 'TSS geçişi: St Brannock → Port Merrow',
    short: 'TSS geçişi',
    summary: 'Kuruyan bir eşikten ada marinasından çık, yoğun bir trafik ayırım şeridini dik açıyla geç, akıntının seni sürüklemesine izin ver – sonra düzelt.',
    chartTitle: 'Ravensey Strait – eğitim haritası (kurgusal)',
    legend: [
      'Oklu pembe şeritler: TSS trafik şeritleri (güneyde batıya, kuzeyde doğuya)',
      'Koyu bant: ayırım bölgesi – içinde durma, balık tutma',
      'Kesikli mor çizgi: şerit geçişi (sabit pruva); daire = çıktığımız nokta',
      'Mor kare ve çizgiler: waypointler ve CTS legleri',
      'İtalik rakamlar: harita derinliği (CD altı, m)',
    ],
    wptNotes: ['St Brannock fairway şamandırasının dışı, adadan açık.', 'TSS’nin güney kenarı – buradan itibaren geçiş pruvasını tutarız.', 'Port Merrow yaklaşımı, fairway şamandırasının yakını.'],
    notes: [
      'TSS’yi trafik akışına dik bir pruvayla (000°T), mümkün olduğunca hızlı geç. Şeritlerin içinde akıntı için düzeltme yapma.',
      'Şeritteki gemilere engel olmamalıyız. Dikkatli gözcülük yap ve VHF’i dinle.',
      'Eşik {dayOpen}’de açılır, {dayClose}’de kapanır (yerel) – kaçırırsak bir sonraki gelgite kadar St Brannock’tayız.',
      'Şeritlerden sonra konumu işaretle: akıntı bizi yaklaşık {setNm} M yana sürükler. WPT3’e yeni CTS hesapla.',
      'Kaçış: St Brannock’a ancak eşik penceresinde dönülür; değilse yavaşla ya da açıkta demirle.',
    ],
    overview:
      '{date}’da {castOff}’de, eşik açıkken ({open}–{close}), St Brannock’tan ayrılıyor ve {depart}’da WPT1’den çıkıyoruz. TSS kenarında 000°T’ye dönüp şeritler boyunca {l2min} dk bu pruvayı tutuyoruz; akıntı bizi yaklaşık {setNm} M yana sürüklüyor. Kuzey tarafta WPT3’e {l3ctsM}M dümen tutup {eta} civarında Port Merrow’dayız. (Saatler yerel.)',
    gateNote: 'St Brannock marinasında 2,2 m kuruyan bir eşik var – kapı varışta değil, çıkışta.',
    sections: {
      brief: [
        {
          p: 'Bu sefer gelgit **çıkışı** sınırlıyor: ada marinasında alçak suda suyu içeride tutan bir **eşik (sill)** var, bu yüzden ancak yüksek su civarında çıkabiliriz. Denizde bir **trafik ayırım şeridini (TSS)** geçmemiz gerekiyor; çatışmayı önleme kuralları nasıl geçileceğini söylüyor – ve bu, akıntıyı nasıl kullandığımızı değiştiriyor.',
        },
        {
          ex: {
            title: 'Görev',
            lines: [
              'Tarih: **{date}** · tekne **{boat}**, draft **{draft} m**, **{speed} kn**.',
              'St Brannock’tan (ikincil liman, ada) Port Merrow’a (standart liman, ana kara), açık denizde ≈ **{nm} M**.',
              'Kapı: marina eşiği **2,2 m kuruyor**.',
              'Tehlike: **TSS** – iki büyük gemi şeridi ve aralarında bir ayırım bölgesi.',
            ],
          },
        },
        { warn: 'Ravensey Strait kurgusaldır. Gerçek TSS geçişleri (ör. Manş Denizi) dikkatli gözcülük, radar reflektörü ve çoğu zaman AIS ister.' },
      ],
      almanac: [
        { p: 'Port Merrow büyük aralıklı (springs ≈ 5,4 m) **standart liman**. St Brannock **ikincil liman**: HW’si 10–20 dakika **erken** (eksi farklar!) ve biraz daha alçak.' },
        { tip: 'Fark kutusunda eksi işareti, ikincil limanın standart limandan önce olduğu anlamına gelir. Ekleme, çıkar.' },
      ],
      tides: [{ p: 'HW Port Merrow yerel **{hw}**’de **{hwH} m** (aralık **{range} m**, faktör **{f}**). HW St Brannock **{secHw}**’de **{secH} m**.' }],
      gate: [
        {
          ex: {
            title: 'Eşikten ne zaman geçebiliriz?',
            lines: ['Gereken = eşik kuruması 2,2 + draft 1,7 + pay 0,4 = St Brannock’ta **{need} m** gelgit.', 'Yükselen su: eşik yerel **{dayOpen}**’de açılır.', 'Alçalan su: yerel **{dayClose}**’de kapanır – o saate kadar çıkmış olmalıyız.'],
          },
        },
        { tip: 'Marina eşiği bir çıkış kapısıdır: varış saatini değil, ayrılış saatini kontrol et.' },
      ],
      streams: [
        {
          p: 'Boğazda akıntı **HW Port Merrow’dan önce doğuya, sonra batıya** akar; springs’te 2,6 kn’a kadar, HW−5 ve HW+1 civarında durgun. Rotamız **kuzeye** olduğu için akıntı hep **yandan** gelir: pek yardım da etmez, engel de olmaz, ama bizi yana sürükler.',
        },
      ],
      departure: [
        {
          list: [
            'En erken ve en geç ayrılışı eşik belirler.',
            'Bu pencere içinde **en kısa seyri** veren saati seçeriz: HW civarı geçişte doğuya akıntı zayıf, son legde akıntı durgun.',
            'Seçimimiz: ayrılış **{castOff}**, WPT1 **{depart}**. Şerit geçişi bizi **{setNm} M** yana sürükler.',
          ],
        },
      ],
      route: [
        {
          list: [
            '**Kural 10 (COLREG):** TSS’yi geçen tekne, trafik akışının genel yönüne mümkün olduğunca **dik açıda** bir **pruvayla** geçer.',
            'Kural **pruva** der, iz değil: burnu 000°T’ye çevirir, sürüklenmeyi kabul ederiz. Böylece diğer gemiler bordamızı görür, ne yaptığımızı hemen anlar; biz de şeritte en az zamanı geçiririz.',
            'Küçük yelkenliler şeridi izleyen gemilere **engel olmamalıdır**. Hızlı geç – gerekirse motorla destekle.',
            'Ayırım bölgesine geçmek dışında girme. WPT2’yi şerit kenarına koy ki geçiş temiz başlasın.',
          ],
        },
      ],
      cts: [
        {
          ex: {
            title: 'Şeritleri geçmek, sonra düzeltmek',
            lines: [
              'TSS kenarına leg 1: CTS **{l1cts}T** ({l1ctsM}M) – normal bir CTS legi.',
              'Şeritler: **000°T** ({l2ctsM}M) pruva, {l2min} dk. Akıntı {l2set} {l2rate} kn → yerdeki iz **{l2track}T**, sürüklenme **{setNm} M**.',
              'Çıktığımız noktayı işaretle, oradan yeni üçgen: WPT3’e CTS **{l3cts}T** ({l3ctsM}M).',
            ],
          },
        },
      ],
      practice: [{ tip: 'TSS legi için CTS hesaplanmaz – sadece yana sürüklenme: hız × sin(akıntı ile pruva arasındaki açı) × süre.' }],
    },
  },
  nl: {
    title: 'TSS oversteken: St Brannock → Port Merrow',
    short: 'TSS oversteken',
    summary: 'Vertrek uit een eilandhaven over een droogvallende drempel, steek een druk verkeersscheidingsstelsel haaks over en laat je door de stroom verzetten – en corrigeer daarna.',
    chartTitle: 'Ravensey Strait – oefenkaart (fictief)',
    legend: [
      'Roze banen met pijlen: verkeersbanen van de TSS (zuid westwaarts, noord oostwaarts)',
      'Donkere strook: scheidingszone – daarin niet stilliggen of vissen',
      'Gestreepte magenta lijn: de oversteek (vaste koers); cirkel = waar we uitkomen',
      'Magenta vierkanten en lijnen: waypoints en CTS-legs',
      'Cursieve getallen: kaartdieptes (m onder CD)',
    ],
    wptNotes: ['Buiten de fairway-boei van St Brannock, vrij van het eiland.', 'Zuidrand van de TSS – vanaf hier houden we de oversteekkoers.', 'Aanloop Port Merrow, bij de fairway-boei.'],
    notes: [
      'Steek de TSS over met een koers haaks op de verkeersstroom (000°T), zo snel als redelijk kan. Corrigeer in de banen niet voor de stroom.',
      'We mogen schepen in de banen niet hinderen. Houd goed uitkijk en luister uit op de marifoon.',
      'De drempel gaat open om {dayOpen} en dicht om {dayClose} lokaal – missen we hem, dan blijven we tot het volgende getij in St Brannock.',
      'Zet na de banen de positie uit: de stroom heeft ons ongeveer {setNm} M opzij gezet. Bereken een nieuwe CTS naar WPT3.',
      'Uitwijken: terug naar St Brannock kan alleen binnen het drempelvenster; anders bijliggen of buiten ankeren.',
    ],
    overview:
      'Op {date} gooien we om {castOff} los in St Brannock, binnen het drempelvenster ({open}–{close}), en verlaten WPT1 om {depart}. Aan de rand van de TSS draaien we naar 000°T en houden die koers {l2min} min over de banen; de stroom zet ons ongeveer {setNm} M opzij. Aan de noordkant sturen we {l3ctsM}M naar WPT3 en zijn rond {eta} in Port Merrow. (Alle tijden lokaal.)',
    gateNote: 'De jachthaven van St Brannock heeft een drempel die 2,2 m droogvalt – de poort zit bij vertrek, niet bij aankomst.',
    sections: {
      brief: [
        {
          p: 'Deze keer beperkt het getij het **vertrek**: de eilandhaven heeft een **drempel** die bij laagwater het water binnen houdt, dus we kunnen alleen rond hoogwater weg. Op zee moeten we een **verkeersscheidingsstelsel (TSS)** oversteken; de bepalingen ter voorkoming van aanvaringen zeggen hoe – en dat verandert hoe we met de stroom omgaan.',
        },
        {
          ex: {
            title: 'De opdracht',
            lines: [
              'Datum: **{date}** · boot **{boat}**, diepgang **{draft} m**, **{speed} kn**.',
              'Van St Brannock (secundaire haven, eiland) naar Port Merrow (standaardhaven, vasteland), ≈ **{nm} M** op zee.',
              'Poort: de drempel van de jachthaven **valt 2,2 m droog**.',
              'Gevaar: de **TSS** – twee banen met grote schepen en een scheidingszone ertussen.',
            ],
          },
        },
        { warn: 'Ravensey Strait is fictief. Echte TSS-oversteken (bijvoorbeeld in Het Kanaal) vragen goede uitkijk, een radarreflector en vaak AIS.' },
      ],
      almanac: [
        { p: 'Port Merrow is de **standaardhaven** met een groot verval (springtij ≈ 5,4 m). St Brannock is de **secundaire haven**: HW valt er 10–20 minuten **eerder** (negatieve verschillen!) en iets lager.' },
        { tip: 'Een min in het verschillenkader betekent dat de secundaire haven eerder is dan de standaardhaven. Aftrekken, niet optellen.' },
      ],
      tides: [{ p: 'HW Port Merrow is om **{hw}** lokaal met **{hwH} m** (verval **{range} m**, factor **{f}**). HW St Brannock is om **{secHw}** met **{secH} m**.' }],
      gate: [
        {
          ex: {
            title: 'Wanneer kunnen we over de drempel?',
            lines: ['Nodig = drempel 2,2 droog + diepgang 1,7 + marge 0,4 = **{need} m** getij in St Brannock.', 'Stijgend water: de drempel gaat open om **{dayOpen}** lokaal.', 'Dalend water: hij gaat dicht om **{dayClose}** lokaal – dan moeten we weg zijn.'],
          },
        },
        { tip: 'Een drempel bij de jachthaven is een vertrekpoort: controleer de tijd van losgooien, niet de aankomsttijd.' },
      ],
      streams: [
        {
          p: 'In de zeestraat loopt de stroom **oost vóór HW Port Merrow en west erna**, tot 2,6 kn bij springtij, met kentering rond HW−5 en HW+1. Onze route gaat **naar het noorden**, dus de stroom staat altijd **dwars**: hij helpt of hindert weinig, maar zet ons opzij.',
        },
      ],
      departure: [
        {
          list: [
            'De drempel bepaalt het vroegste en laatste vertrek.',
            'Binnen dat venster kiezen we de tijd met de **kortste tocht**: rond HW is de oostgaande stroom zwak en in de laatste leg is het kentering.',
            'Onze keuze: losgooien om **{castOff}**, WPT1 om **{depart}**. De oversteek zet ons **{setNm} M** opzij.',
          ],
        },
      ],
      route: [
        {
          list: [
            '**Regel 10 (BvA):** een schip dat een TSS oversteekt doet dat met een **koers (heading)** zo veel mogelijk **haaks** op de algemene richting van de verkeersstroom.',
            'De regel zegt **koers**, niet koers over de grond: we richten de boeg op 000°T en accepteren het verzet. Andere schepen zien dan onze zijkant en weten direct wat we doen, en we zijn zo kort mogelijk in de banen.',
            'Kleine zeilschepen mogen schepen die een baan volgen **niet hinderen**. Steek snel over – zo nodig met de motor bij.',
            'Vaar de scheidingszone alleen in om hem over te steken. Leg WPT2 aan de rand van de baan, dan begint de oversteek netjes.',
          ],
        },
      ],
      cts: [
        {
          ex: {
            title: 'De banen oversteken, daarna corrigeren',
            lines: [
              'Leg 1 naar de rand van de TSS: CTS **{l1cts}T** ({l1ctsM}M) – een gewone CTS-leg.',
              'Banen: koers **000°T** ({l2ctsM}M) gedurende {l2min} min. Stroom {l2set} {l2rate} kn → grondkoers **{l2track}T**, verzet **{setNm} M**.',
              'Zet uit waar we uitkomen en teken van daaruit een nieuwe driehoek: CTS **{l3cts}T** ({l3ctsM}M) naar WPT3.',
            ],
          },
        },
      ],
      practice: [{ tip: 'Voor de TSS-leg reken je geen CTS uit – alleen het verzet opzij: snelheid × sin(hoek tussen stroom en koers) × tijd.' }],
    },
  },
}
