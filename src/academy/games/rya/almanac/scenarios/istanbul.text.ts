import type { Lang } from '../../../../i18n'
import type { ScenarioText } from '../text'

export const istanbulText: Record<Lang, ScenarioText> = {
  en: {
    title: 'Istanbul: Kalamış → Kız Kulesi → Bebek',
    short: 'Istanbul',
    summary: 'Up the Bosphorus past the Maiden’s Tower. Hardly any tide – but a strong current that decides every course to steer.',
    chartTitle: 'Istanbul and the southern Bosphorus – simplified sketch (not for navigation)',
    legend: [
      'Kız Kulesi (Maiden’s Tower) on its rock off Salacak – pass outside it',
      'Grey line: 15 Temmuz Şehitler Bridge, vertical clearance 64 m',
      '≈≈ Akıntıburnu: the strongest current of the southern Bosphorus',
      'Magenta squares and lines: waypoints and legs',
      'Tick the box to see the current on each leg',
    ],
    wptNotes: [
      'Mouth of Kalamış bay, between Moda point and Fenerbahçe.',
      'Off Moda point; keep clear of the rocks close inshore.',
      'South-west of Kız Kulesi – the start of the Bosphorus.',
      'Off Kuzguncuk on the Asian side, before the bridge.',
      'Off Çengelköy, past the bridge.',
      'Off Kandilli: from here we cross to the European side.',
      'Bebek bay: moorings and anchorage.',
    ],
    notes: [
      'The surface current runs south, from the Black Sea to the Marmara. Going north, stay close to the Asian shore where it is weaker.',
      'Cross the strait as late and as square as possible, aiming well upstream – the current off Akıntıburnu can reach 4 kn or more.',
      'Heavy traffic: ships, ferries and tour boats. Keep to the starboard side, keep a lookout and listen to the VTS sector channel.',
      'Do not pass between Kız Kulesi and Salacak: shallow and rocky.',
      'Bridge clearance 64 m – no problem for a yacht, but always check air draught.',
      'Poyraz (NE wind) makes the current stronger and the sea short; lodos (SW) can weaken or reverse it and makes the entrance rough.',
    ],
    overview:
      'We leave Kalamış Marina at {castOff} and are off Moda at WPT2 soon after. We pass outside Kız Kulesi and go up the Asian side, where the current is weaker, under the bridge to Kandilli. There we cross to Bebek, steering {l6ctsM}M – {l6off}° upstream of the track – against a {l6rate} kn current. We should be in Bebek bay at about {eta}, after {total} min and {nm} M. (Local time, UT + 3.)',
    practiceLabels: ['Strong poyraz (current × 1.4)', 'Light lodos (current × 0.6)', 'Fresh poyraz (current × 1.2)'],
    sections: {
      brief: [
        {
          p: 'Now a real place: **Istanbul**. From Kalamış Marina on the Asian side, past **Kız Kulesi** (the Maiden’s Tower) and up the **Bosphorus** to Bebek. Is it a good place to practise tides? Not really – and that is exactly why it is useful: the method still works, but the **almanac part shrinks** and the **current part grows**.',
        },
        {
          ex: {
            title: 'The task',
            lines: [
              'Boat **{boat}**, draught **{draft} m**, **{speed} kn** under engine.',
              'Kalamış Marina → Bebek, ≈ **{nm} M**, about **{total} min**.',
              'Danger 1: the **surface current** of the Bosphorus, against us and very strong off Akıntıburnu.',
              'Danger 2: **traffic** – ships in the strait, ferries crossing everywhere.',
              'Check: **air draught** under the bridge (64 m).',
            ],
          },
        },
        { warn: 'Istanbul is real, but this chart is a simplified sketch and the currents are typical training values. For real navigation use official charts, the Turkish Straits rules and the latest forecasts.' },
      ],
      tides: [
        {
          p: 'The Marmara and the Bosphorus have a **tidal range of only a few centimetres**. There is no standard port table to work, no secondary port and no depth gate: the shores are steep and the strait is 30–100 m deep. Sea level changes more with **wind and air pressure** than with the tide.',
        },
        {
          list: [
            'Step 1–2 (HW/LW): not needed – write "no significant tide" on the plan.',
            'Step 3 (depth gate): the depth on the chart is the depth you get. Check only that marinas and anchorages are deep enough.',
            'Step 4 (streams): **this is the big one** – the steady current replaces the tidal stream.',
          ],
        },
      ],
      streams: [
        {
          p: 'Water from the Black Sea flows south over saltier Marmara water. The **surface current** therefore runs **south** all day, typically 1–3 kn, much faster in the narrows (Akıntıburnu, "current point"). Near the shores and in bays there are **weaker currents and even counter-currents** – local boats going north hug the shore.',
        },
        { tip: 'Unlike a tidal stream, this current does not turn every six hours. You plan it like one constant stream per leg – and the wind decides how strong it is.' },
      ],
      departure: [
        {
          list: [
            'No tidal gate, so the clock is set by **daylight, traffic and wind**.',
            'Avoid the ferry rush hours early morning and early evening.',
            'With a strong poyraz forecast, think twice: the current off Akıntıburnu can exceed 4 kn and the sea gets short and steep.',
            'Our choice: leave Kalamış at **{castOff}**, WPT1 at **{depart}**.',
          ],
        },
      ],
      route: [
        {
          list: [
            'Waypoints stay **close to the Asian shore** going north, where the current is weaker – but clear of piers and the rocks at Kız Kulesi.',
            'Pass **west of Kız Kulesi**, never between the tower and Salacak.',
            'Check the bridge: clearance 64 m, our mast is far lower.',
            'Cross the strait **once**, at Kandilli, as square as you can, and expect to point well upstream.',
          ],
        },
      ],
      cts: [
        {
          ex: {
            title: 'The crossing to Bebek (leg 6)',
            lines: [
              'Track **{l6track}T**, {l6nm} M. Current **{l6set} {l6rate} kn** – almost from ahead and across.',
              'Vector triangle with {speed} kn → CTS **{l6cts}T**, the bow **{l6off}°** upstream of the track.',
              'Variation 6°E: subtract → **{l6ctsM}M**. SOG only **{l6sog} kn**.',
              'Without the correction the current would carry us straight onto Akıntıburnu.',
            ],
          },
        },
        { tip: 'In a strong cross-current, check your progress with a transit: two objects on the far shore in line. If they open, you are being set.' },
      ],
      practice: [{ tip: 'Each case changes the strength of the current with the wind. Work out every leg’s CTS and SOG and see how much the crossing changes.' }],
    },
  },
  tr: {
    title: 'İstanbul: Kalamış → Kız Kulesi → Bebek',
    short: 'İstanbul',
    summary: 'Kız Kulesi’nin önünden Boğaz’a. Gelgit neredeyse yok – ama her CTS’i belirleyen güçlü bir akıntı var.',
    chartTitle: 'İstanbul ve Boğaz’ın güneyi – basitleştirilmiş kroki (seyirde kullanılmaz)',
    legend: [
      'Kız Kulesi, Salacak açığındaki kayalığın üstünde – dışından geç',
      'Gri çizgi: 15 Temmuz Şehitler Köprüsü, düşey açıklık 64 m',
      '≈≈ Akıntıburnu: Boğaz’ın güneyindeki en güçlü akıntı',
      'Mor kare ve çizgiler: waypointler ve legler',
      'Her legdeki akıntıyı görmek için kutuyu işaretle',
    ],
    wptNotes: [
      'Kalamış koyunun ağzı, Moda burnu ile Fenerbahçe arası.',
      'Moda burnu açığı; kıyıya yakın kayalardan uzak dur.',
      'Kız Kulesi’nin güneybatısı – Boğaz’ın başlangıcı.',
      'Anadolu yakasında Kuzguncuk açığı, köprüden önce.',
      'Çengelköy açığı, köprüden sonra.',
      'Kandilli açığı: buradan Avrupa yakasına geçeriz.',
      'Bebek koyu: şamandıralar ve demir yeri.',
    ],
    notes: [
      'Yüzey akıntısı Karadeniz’den Marmara’ya, güneye akar. Kuzeye giderken akıntının zayıf olduğu Anadolu kıyısına yakın kal.',
      'Boğaz’ı olabildiğince geç ve dik açıya yakın geç, iyice akıntının yukarısına nişan al – Akıntıburnu açığında akıntı 4 kn’u geçebilir.',
      'Yoğun trafik: gemiler, vapurlar, tur tekneleri. Sancak tarafında kal, gözcülük yap ve VTS sektör kanalını dinle.',
      'Kız Kulesi ile Salacak arasından geçme: sığ ve kayalık.',
      'Köprü açıklığı 64 m – yat için sorun değil ama air draft’ı her zaman kontrol et.',
      'Poyraz akıntıyı güçlendirir ve denizi kısa yapar; lodos akıntıyı zayıflatabilir, hatta tersine çevirebilir ve girişi dalgalı yapar.',
    ],
    overview:
      '{castOff}’de Kalamış Marina’dan ayrılıyor, kısa süre sonra Moda açığında WPT2’deyiz. Kız Kulesi’nin dışından geçip akıntının zayıf olduğu Anadolu yakasından, köprünün altından Kandilli’ye çıkıyoruz. Orada {l6rate} kn akıntıya karşı {l6ctsM}M dümen tutarak – track’in {l6off}° yukarısına – Bebek’e geçiyoruz. {total} dakikada, {nm} M sonra yaklaşık {eta}’de Bebek koyundayız. (Yerel saat, UT + 3.)',
    practiceLabels: ['Kuvvetli poyraz (akıntı × 1,4)', 'Hafif lodos (akıntı × 0,6)', 'Taze poyraz (akıntı × 1,2)'],
    sections: {
      brief: [
        {
          p: 'Şimdi gerçek bir yer: **İstanbul**. Anadolu yakasındaki Kalamış Marina’dan, **Kız Kulesi**’nin önünden **Boğaz**’dan Bebek’e. Gelgit çalışmak için iyi bir yer mi? Pek değil – ve tam da bu yüzden faydalı: yöntem yine işler, ama **almanak kısmı küçülür**, **akıntı kısmı büyür**.',
        },
        {
          ex: {
            title: 'Görev',
            lines: [
              'Tekne **{boat}**, draft **{draft} m**, motorla **{speed} kn**.',
              'Kalamış Marina → Bebek, ≈ **{nm} M**, yaklaşık **{total} dk**.',
              'Tehlike 1: Boğaz’ın **yüzey akıntısı** – karşımızda, Akıntıburnu açığında çok güçlü.',
              'Tehlike 2: **trafik** – Boğaz’da gemiler, her yerde karşıya geçen vapurlar.',
              'Kontrol: köprü altında **air draft** (64 m).',
            ],
          },
        },
        { warn: 'İstanbul gerçek ama bu harita basitleştirilmiş bir krokidir ve akıntılar eğitim için tipik değerlerdir. Gerçek seyirde resmî haritaları, Türk Boğazları kurallarını ve güncel hava tahminlerini kullan.' },
      ],
      tides: [
        {
          p: 'Marmara’da ve Boğaz’da **gelgit aralığı sadece birkaç santimetre**. Çalışılacak standart liman tablosu, ikincil liman ya da derinlik kapısı yok: kıyılar dik, Boğaz 30–100 m derin. Deniz seviyesi gelgitten çok **rüzgâr ve hava basıncıyla** değişir.',
        },
        {
          list: [
            'Adım 1–2 (HW/LW): gerekmez – plana "anlamlı gelgit yok" yaz.',
            'Adım 3 (derinlik kapısı): haritadaki derinlik, elindeki derinliktir. Sadece marina ve demir yerinin yeterince derin olduğunu kontrol et.',
            'Adım 4 (akıntılar): **asıl iş burada** – gelgit akıntısının yerini sabit akıntı alır.',
          ],
        },
      ],
      streams: [
        {
          p: 'Karadeniz’in suyu daha tuzlu Marmara suyunun üstünden güneye akar. Bu yüzden **yüzey akıntısı** gün boyu **güneye** akar; genelde 1–3 kn, daralan yerlerde (Akıntıburnu) çok daha hızlı. Kıyılara yakın ve koylarda **daha zayıf akıntılar, hatta ters akıntılar (anafor)** vardır – kuzeye giden yerel tekneler kıyıya yakın gider.',
        },
        { tip: 'Gelgit akıntısının aksine bu akıntı altı saatte bir dönmez. Her leg için tek bir sabit akıntı gibi planlarsın – gücünü de rüzgâr belirler.' },
      ],
      departure: [
        {
          list: [
            'Gelgit kapısı yok; saati **gün ışığı, trafik ve rüzgâr** belirler.',
            'Sabah erken ve akşamüstü vapur trafiğinin yoğun saatlerinden kaçın.',
            'Kuvvetli poyraz bekleniyorsa iki kez düşün: Akıntıburnu açığında akıntı 4 kn’u geçebilir, deniz kısa ve dik olur.',
            'Seçimimiz: Kalamış’tan **{castOff}**, WPT1’den **{depart}**.',
          ],
        },
      ],
      route: [
        {
          list: [
            'Kuzeye giderken waypointler **Anadolu kıyısına yakın** kalır; akıntı orada zayıf – ama iskelelerden ve Kız Kulesi kayalarından uzak.',
            '**Kız Kulesi’nin batısından** geç, asla kule ile Salacak arasından geçme.',
            'Köprüyü kontrol et: açıklık 64 m, direğimiz çok daha alçak.',
            'Boğaz’ı **bir kez**, Kandilli’de, olabildiğince dik geç ve iyice akıntının yukarısına bakmayı bekle.',
          ],
        },
      ],
      cts: [
        {
          ex: {
            title: 'Bebek’e geçiş (leg 6)',
            lines: [
              'Track **{l6track}T**, {l6nm} M. Akıntı **{l6set} {l6rate} kn** – neredeyse karşıdan ve yandan.',
              '{speed} kn ile vektör üçgeni → CTS **{l6cts}T**, burun track’in **{l6off}°** akıntı yukarısında.',
              'Varyasyon 6°E: çıkar → **{l6ctsM}M**. SOG sadece **{l6sog} kn**.',
              'Düzeltme yapmazsak akıntı bizi doğrudan Akıntıburnu’na taşır.',
            ],
          },
        },
        { tip: 'Güçlü yan akıntıda ilerlemeni bir hizayla kontrol et: karşı kıyıda iki nesne tek çizgide. Açılıyorlarsa sürükleniyorsun.' },
      ],
      practice: [{ tip: 'Her durum rüzgâra göre akıntının gücünü değiştirir. Her legin CTS ve SOG’unu hesapla, geçişin ne kadar değiştiğine bak.' }],
    },
  },
  nl: {
    title: 'Istanbul: Kalamış → Kız Kulesi → Bebek',
    short: 'Istanbul',
    summary: 'De Bosporus op langs de Maagdentoren. Nauwelijks getij – maar een sterke stroming die elke te sturen koers bepaalt.',
    chartTitle: 'Istanbul en de zuidelijke Bosporus – vereenvoudigde schets (niet voor navigatie)',
    legend: [
      'Kız Kulesi (Maagdentoren) op zijn rots voor Salacak – buitenom passeren',
      'Grijze lijn: 15 Temmuz Şehitler-brug, doorvaarthoogte 64 m',
      '≈≈ Akıntıburnu: de sterkste stroming van de zuidelijke Bosporus',
      'Magenta vierkanten en lijnen: waypoints en legs',
      'Vink het vakje aan om de stroming per leg te zien',
    ],
    wptNotes: [
      'Monding van de baai van Kalamış, tussen de kaap van Moda en Fenerbahçe.',
      'Voor de kaap van Moda; blijf weg van de rotsen dicht onder de kust.',
      'Zuidwest van Kız Kulesi – het begin van de Bosporus.',
      'Voor Kuzguncuk aan de Aziatische kant, vóór de brug.',
      'Voor Çengelköy, na de brug.',
      'Voor Kandilli: hier steken we over naar de Europese kant.',
      'Baai van Bebek: boeien en ankerplaats.',
    ],
    notes: [
      'De oppervlaktestroom loopt naar het zuiden, van de Zwarte Zee naar de Marmara. Op weg naar het noorden blijf je dicht onder de Aziatische kust, waar hij zwakker is.',
      'Steek de straat zo laat en zo haaks mogelijk over en mik ruim stroomop – bij Akıntıburnu kan de stroom 4 kn of meer halen.',
      'Druk verkeer: schepen, veerboten en rondvaartboten. Houd stuurboordwal, houd uitkijk en luister uit op het VTS-sectorkanaal.',
      'Vaar niet tussen Kız Kulesi en Salacak door: ondiep en rotsachtig.',
      'Doorvaarthoogte van de brug 64 m – geen probleem voor een jacht, maar controleer altijd je masthoogte.',
      'Poyraz (NO-wind) maakt de stroom sterker en de zee kort; lodos (ZW) kan hem afzwakken of omkeren en maakt de ingang ruw.',
    ],
    overview:
      'We vertrekken om {castOff} uit Kalamış Marina en zijn kort daarna voor Moda bij WPT2. We passeren buitenom Kız Kulesi en varen langs de Aziatische kant, waar de stroom zwakker is, onder de brug door naar Kandilli. Daar steken we over naar Bebek en sturen {l6ctsM}M – {l6off}° stroomop van de track – tegen {l6rate} kn stroom in. Rond {eta} liggen we in de baai van Bebek, na {total} min en {nm} M. (Lokale tijd, UT + 3.)',
    practiceLabels: ['Harde poyraz (stroom × 1,4)', 'Zwakke lodos (stroom × 0,6)', 'Frisse poyraz (stroom × 1,2)'],
    sections: {
      brief: [
        {
          p: 'Nu een echte plek: **Istanbul**. Van Kalamış Marina aan de Aziatische kant, langs **Kız Kulesi** (de Maagdentoren) de **Bosporus** op naar Bebek. Een goede plek om getij te oefenen? Niet echt – en juist daarom nuttig: de methode werkt nog steeds, maar het **almanakdeel krimpt** en het **stromingsdeel groeit**.',
        },
        {
          ex: {
            title: 'De opdracht',
            lines: [
              'Boot **{boat}**, diepgang **{draft} m**, **{speed} kn** op de motor.',
              'Kalamış Marina → Bebek, ≈ **{nm} M**, ongeveer **{total} min**.',
              'Gevaar 1: de **oppervlaktestroom** van de Bosporus, tegen en heel sterk bij Akıntıburnu.',
              'Gevaar 2: **verkeer** – schepen in de straat, overal overstekende veerboten.',
              'Controle: **masthoogte** onder de brug (64 m).',
            ],
          },
        },
        { warn: 'Istanbul is echt, maar deze kaart is een vereenvoudigde schets en de stromen zijn typische oefenwaarden. Gebruik voor echte navigatie officiële kaarten, de regels voor de Turkse Zeestraten en de laatste verwachtingen.' },
      ],
      tides: [
        {
          p: 'De Marmara en de Bosporus hebben een **getijverschil van maar een paar centimeter**. Er is geen standaardhaventafel, geen secundaire haven en geen dieptepoort: de kusten zijn steil en de straat is 30–100 m diep. Het waterpeil verandert meer door **wind en luchtdruk** dan door het getij.',
        },
        {
          list: [
            'Stap 1–2 (HW/LW): niet nodig – schrijf "geen noemenswaardig getij" op het plan.',
            'Stap 3 (dieptepoort): de diepte op de kaart is de diepte die je hebt. Controleer alleen of jachthaven en ankerplaats diep genoeg zijn.',
            'Stap 4 (stromen): **dit is het grote werk** – de vaste stroming vervangt de getijstroom.',
          ],
        },
      ],
      streams: [
        {
          p: 'Water uit de Zwarte Zee stroomt naar het zuiden over het zoutere Marmarawater. De **oppervlaktestroom** loopt dus de hele dag **zuidwaarts**, meestal 1–3 kn, veel harder in de vernauwingen (Akıntıburnu, "stroomkaap"). Dicht onder de kust en in baaien zijn er **zwakkere stromen en zelfs neerstromen** – lokale boten op weg naar het noorden blijven dicht bij de wal.',
        },
        { tip: 'Anders dan een getijstroom keert deze stroming niet elke zes uur. Je plant hem als één vaste stroom per leg – en de wind bepaalt hoe sterk hij is.' },
      ],
      departure: [
        {
          list: [
            'Geen getijpoort, dus de klok wordt bepaald door **daglicht, verkeer en wind**.',
            'Vermijd de spits van de veerboten vroeg in de ochtend en vroeg in de avond.',
            'Bij een verwachting van harde poyraz: denk twee keer na – bij Akıntıburnu kan de stroom boven 4 kn komen en wordt de zee kort en steil.',
            'Onze keuze: vertrek uit Kalamış om **{castOff}**, WPT1 om **{depart}**.',
          ],
        },
      ],
      route: [
        {
          list: [
            'Op weg naar het noorden blijven de waypoints **dicht onder de Aziatische kust**, waar de stroom zwakker is – maar vrij van steigers en de rotsen bij Kız Kulesi.',
            'Passeer **ten westen van Kız Kulesi**, nooit tussen de toren en Salacak door.',
            'Controleer de brug: doorvaarthoogte 64 m, onze mast is veel lager.',
            'Steek de straat **één keer** over, bij Kandilli, zo haaks mogelijk, en reken erop dat je ruim stroomop moet sturen.',
          ],
        },
      ],
      cts: [
        {
          ex: {
            title: 'De oversteek naar Bebek (leg 6)',
            lines: [
              'Track **{l6track}T**, {l6nm} M. Stroom **{l6set} {l6rate} kn** – bijna van voren en dwars.',
              'Vectordriehoek met {speed} kn → CTS **{l6cts}T**, de boeg **{l6off}°** stroomop van de track.',
              'Variatie 6°E: aftrekken → **{l6ctsM}M**. SOG maar **{l6sog} kn**.',
              'Zonder correctie zou de stroom ons recht op Akıntıburnu zetten.',
            ],
          },
        },
        { tip: 'Controleer in sterke dwarsstroom je voortgang met een lijn: twee punten op de overkant in één lijn. Gaan ze open, dan word je verzet.' },
      ],
      practice: [{ tip: 'Elk geval verandert de sterkte van de stroom door de wind. Reken voor elke leg de CTS en SOG uit en kijk hoeveel de oversteek verandert.' }],
    },
  },
}
