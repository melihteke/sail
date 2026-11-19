import type { Lang } from '../../../../i18n'
import type { ScenarioText } from '../text'

export const windfarmText: Record<Lang, ScenarioText> = {
  en: {
    title: 'Wind farm coast: Zeelust → Duinhaven',
    short: 'Wind farm',
    summary: 'A Dutch-style sandy coast with an offshore wind farm you may not enter, a narrow inshore corridor and a silted harbour entrance.',
    chartTitle: 'Zeebries Bank – training chart (fictional, Dutch-style)',
    legend: [
      'Magenta area with turbines: Windpark Zeebries – no entry',
      'Dashed magenta line: 500 m safety zone round the wind farm',
      'Yellow-black buoys: cardinal marks on the corners of the wind farm',
      'Green: Ribbelbank, a sandbank drying 0.4 m on the inshore side',
      'Italic figures: charted depths (m below CD)',
      'Magenta squares and lines: waypoints and legs',
    ],
    wptNotes: [
      '≈ 1 M west of the Zeelust entrance, clear of the harbour moles.',
      'SE corner of the wind farm, outside the 500 m zone; south cardinal ZB-S to port.',
      'NE corner, past the north cardinal ZB-N; the corridor ends here.',
      'Duinhaven approach, 0.6 M off the entrance; enter on the leading lights.',
    ],
    notes: [
      'Never enter the wind farm or its 500 m safety zone; the turbines also block radar and AIS signals behind them.',
      'In the corridor the flood sets north-east, towards the Ribbelbank – hold the CTS and check the depth.',
      'Duinhaven entrance: least depth 0.8 m – only inside {dayOpen}–{dayClose} local.',
      'Commercial wind farm vessels work in the area: listen on VHF and keep clear of them.',
      'If you are late and the stream turns, Zeelust is the bolt hole (all-tide access).',
    ],
    overview:
      'On {date} we slip from Zeelust at {castOff} and clear WPT1 at {depart}. We pass east of Windpark Zeebries, outside its 500 m zone, with the flood behind us. In the corridor the stream sets towards the Ribbelbank, so we steer {l2ctsM}M to make good 000°T. We reach the Duinhaven entrance at {gate} with {gateH} m of tide (open {open}–{close}) and are alongside at about {eta}. (All times local.)',
    gateNote: 'The entrance channel has silted to a charted depth of 0.8 m – an italic 0.8 on the chart, so this time the depth is added, not subtracted.',
    sections: {
      brief: [
        {
          p: 'A typical North Sea day sail: two harbours on a straight sandy coast, a small tidal range, a stream that runs along the coast – and a big **offshore wind farm** right where the direct line would go. The almanac work is the same; the new problem is a **no-go area** and a **narrow corridor** between the wind farm and a sandbank.',
        },
        {
          ex: {
            title: 'The task',
            lines: [
              'Date: **{date}** · boat **{boat}**, draught **{draft} m**, **{speed} kn**.',
              'From Zeelust (standard port) to Duinhaven (secondary port), ≈ **{nm} M** at sea.',
              'Obstacle 1: **Windpark Zeebries** – no entry, plus a 500 m safety zone.',
              'Obstacle 2: the **Ribbelbank** on the inshore side of the corridor.',
              'Obstacle 3: the **Duinhaven entrance** has silted to 0.8 m.',
            ],
          },
        },
        { warn: 'Zeebries Bank is fictional. Real Dutch wind farms have their own rules – some allow small craft through in daylight, many do not. Always check the current notices before you go.' },
      ],
      almanac: [
        {
          p: 'Same pages as before: a **standard port** table (Zeelust) and a **differences box** for the secondary port (Duinhaven). Notice how small the range is – only about 2 m at springs. Small range does not mean "no planning": a 0.8 m entrance and a 1.6 m keel still make a depth gate.',
        },
        { tip: 'Summer time here is UT + 2. Many Dutch almanacs print times in UT + 1 (MET); then you add only one more hour. Always read the time zone line on the page.' },
      ],
      tides: [{ p: 'HW Zeelust is at **{hw}** local with **{hwH} m**, the range is **{range} m** (factor **{f}**). Duinhaven HW follows at **{secHw}** with **{secH} m**.' }],
      gate: [
        {
          ex: {
            title: 'Height of tide needed at the entrance',
            lines: ['Charted depth **0.8 m** is already water at chart datum, so it reduces what we need.', 'Need = draught 1.6 + clearance 0.5 − charted depth 0.8 = **{need} m**.', 'Rule of twelfths at Duinhaven → open **{dayOpen}**, closes **{dayClose}** (local).'],
          },
        },
      ],
      streams: [
        {
          p: 'The flood runs **north-north-east along the coast** – that is with us. It starts about HW−5 Zeelust and turns about HW+1. In the corridor (◇B) it sets about **020°**, a little across our 000°T track: it pushes us **east, towards the Ribbelbank**.',
        },
      ],
      departure: [
        {
          list: [
            'Leave too early and we reach Duinhaven before the entrance opens.',
            'Leave too late and the ebb starts against us in the corridor, and the entrance closes.',
            'Our choice: WPT1 at **{depart}**, slip at **{castOff}** – fair stream all the way, entrance at **{gate}** with **{gateH} m**.',
          ],
        },
      ],
      route: [
        {
          list: [
            'Treat the wind farm plus its **500 m safety zone** like land: waypoints stay outside it.',
            'The **cardinal marks** on the corners tell you where the wind farm is safe to pass: keep north of a north cardinal, east of an east cardinal, south of a south cardinal.',
            'The corridor is less than 1 M wide between the zone and the Ribbelbank – plan it as one straight leg (000°T) so it is easy to hold and check.',
            'At night the turbines on the edge show yellow flashing lights; inside the park radar shows many echoes and small boats are hard to see.',
          ],
        },
      ],
      cts: [
        {
          ex: {
            title: 'Leg 2 through the corridor',
            lines: [
              'Track **000°T**, {l2nm} M. Stream **{l2set} {l2rate} kn** – pushing us east.',
              'Vector triangle → CTS **{l2cts}T**. Variation 1°E: subtract → **{l2ctsM}M**.',
              'The bow points a few degrees towards the wind farm, but the boat moves straight up the corridor at **{l2sog} kn**.',
            ],
          },
        },
      ],
      practice: [{ tip: 'Here the depth gate uses a charted depth, not a drying height: subtract it from draught + clearance.' }],
    },
  },
  tr: {
    title: 'Rüzgâr santralli kıyı: Zeelust → Duinhaven',
    short: 'Rüzgâr santrali',
    summary: 'Hollanda tarzı kumlu bir kıyı: içine girilemeyen bir deniz rüzgâr santrali, dar bir kıyı koridoru ve dolmuş bir liman girişi.',
    chartTitle: 'Zeebries Bank – eğitim haritası (kurgusal, Hollanda tarzı)',
    legend: [
      'Türbinli mor alan: Windpark Zeebries – girmek yasak',
      'Kesikli mor çizgi: santralin etrafındaki 500 m güvenlik bölgesi',
      'Sarı-siyah şamandıralar: santral köşelerindeki kardinal işaretler',
      'Yeşil: Ribbelbank, koridorun kıyı tarafında 0,4 m kuruyan kum seti',
      'İtalik rakamlar: harita derinliği (CD altı, m)',
      'Mor kare ve çizgiler: waypointler ve legler',
    ],
    wptNotes: [
      'Zeelust girişinin ≈ 1 M batısı, mendireklerden uzak.',
      'Santralin GD köşesi, 500 m bölgenin dışı; güney kardinali ZB-S iskelede.',
      'KD köşe, kuzey kardinali ZB-N’nin ötesi; koridor burada biter.',
      'Duinhaven yaklaşımı, girişin 0,6 M açığı; girişe hizalama fenerleriyle gir.',
    ],
    notes: [
      'Santrale ve 500 m güvenlik bölgesine asla girme; türbinler arkalarındaki radar ve AIS sinyallerini de keser.',
      'Koridorda akıntı kuzeydoğuya, Ribbelbank’a doğru iter – CTS’i tut, derinliği kontrol et.',
      'Duinhaven girişi: en az derinlik 0,8 m – yalnızca {dayOpen}–{dayClose} yerel arası.',
      'Bölgede santral servis tekneleri çalışır: VHF’i dinle ve onlardan uzak dur.',
      'Gecikir de akıntı dönerse kaçış limanı Zeelust (her gelgitte girilir).',
    ],
    overview:
      '{date}’da {castOff}’de Zeelust’tan ayrılıyor, {depart}’da WPT1’den çıkıyoruz. Windpark Zeebries’in doğusundan, 500 m bölgesinin dışından, akıntı arkamızdayken geçiyoruz. Koridorda akıntı bizi Ribbelbank’a doğru ittiği için 000°T izini tutmak üzere {l2ctsM}M dümen tutuyoruz. Duinhaven girişine {gate}’de {gateH} m gelgitle varıyoruz (açık: {open}–{close}); {eta} civarında rıhtımdayız. (Saatler yerel.)',
    gateNote: 'Giriş kanalı dolmuş: harita derinliği 0,8 m. Haritada italik 0,8 – bu sefer derinlik çıkarılmaz, eklenir.',
    sections: {
      brief: [
        {
          p: 'Tipik bir Kuzey Denizi günlük seyri: düz kumlu bir kıyıda iki liman, küçük bir gelgit aralığı, kıyıya paralel akan bir akıntı – ve tam doğrudan rotanın üstünde büyük bir **deniz rüzgâr santrali**. Almanak işi aynı; yeni sorun **girilmez bir alan** ve santral ile bir kum seti arasındaki **dar bir koridor**.',
        },
        {
          ex: {
            title: 'Görev',
            lines: [
              'Tarih: **{date}** · tekne **{boat}**, draft **{draft} m**, **{speed} kn**.',
              'Zeelust’tan (standart liman) Duinhaven’e (ikincil liman), açık denizde ≈ **{nm} M**.',
              'Engel 1: **Windpark Zeebries** – girmek yasak, üstüne 500 m güvenlik bölgesi.',
              'Engel 2: koridorun kıyı tarafındaki **Ribbelbank**.',
              'Engel 3: **Duinhaven girişi** 0,8 m’ye kadar dolmuş.',
            ],
          },
        },
        { warn: 'Zeebries Bank kurgusaldır. Gerçek Hollanda rüzgâr santrallerinin kendi kuralları var – bazıları gündüz küçük teknelerin geçişine izin verir, çoğu vermez. Yola çıkmadan güncel duyuruları mutlaka kontrol et.' },
      ],
      almanac: [
        {
          p: 'Sayfalar aynı: bir **standart liman** tablosu (Zeelust) ve ikincil liman için bir **fark kutusu** (Duinhaven). Aralığın ne kadar küçük olduğuna dikkat et – springs’te bile yaklaşık 2 m. Küçük aralık "plan gerekmez" demek değil: 0,8 m’lik bir giriş ve 1,6 m’lik omurga yine bir derinlik kapısı yaratır.',
        },
        { tip: 'Buradaki yaz saati UT + 2. Hollanda almanaklarının çoğu saatleri UT + 1 (MET) ile basar; o zaman sadece 1 saat daha eklersin. Sayfadaki saat dilimi satırını hep oku.' },
      ],
      tides: [{ p: 'HW Zeelust yerel **{hw}**’de **{hwH} m**, aralık **{range} m** (faktör **{f}**). Duinhaven HW’si **{secHw}**’de **{secH} m**.' }],
      gate: [
        {
          ex: {
            title: 'Girişte gereken gelgit yüksekliği',
            lines: ['Harita derinliği **0,8 m** zaten CD’de var olan su; gerekeni azaltır.', 'Gereken = draft 1,6 + pay 0,5 − harita derinliği 0,8 = **{need} m**.', 'Duinhaven’de on ikiler kuralı → açılış **{dayOpen}**, kapanış **{dayClose}** (yerel).'],
          },
        },
      ],
      streams: [
        {
          p: 'Flood **kıyı boyunca kuzey-kuzeydoğuya** akar – lehimize. HW−5 Zeelust civarı başlar, HW+1 civarı döner. Koridorda (◇B) yaklaşık **020°** yönünde akar; 000°T izimize biraz çapraz: bizi **doğuya, Ribbelbank’a doğru** iter.',
        },
      ],
      departure: [
        {
          list: [
            'Çok erken çıkarsak Duinhaven’e giriş açılmadan varırız.',
            'Çok geç çıkarsak koridorda ebb aleyhimize başlar ve giriş kapanır.',
            'Seçimimiz: WPT1 **{depart}**, ayrılış **{castOff}** – akıntı yol boyunca lehte, girişte **{gate}**’de **{gateH} m**.',
          ],
        },
      ],
      route: [
        {
          list: [
            'Santrali ve **500 m güvenlik bölgesini** kara gibi düşün: waypointler hep dışında kalır.',
            'Köşelerdeki **kardinal işaretler** nereden güvenle geçileceğini söyler: kuzey kardinalinin kuzeyinden, doğu kardinalinin doğusundan, güney kardinalinin güneyinden geç.',
            'Bölge ile Ribbelbank arasındaki koridor 1 M’den dar – tutması ve kontrolü kolay olsun diye tek düz leg (000°T) olarak planla.',
            'Gece kenardaki türbinler sarı çakar fener gösterir; santral içinde radar çok yankı verir ve küçük tekneler zor görülür.',
          ],
        },
      ],
      cts: [
        {
          ex: {
            title: 'Koridordan leg 2',
            lines: [
              'Track **000°T**, {l2nm} M. Akıntı **{l2set} {l2rate} kn** – bizi doğuya itiyor.',
              'Vektör üçgeni → CTS **{l2cts}T**. Varyasyon 1°E: çıkar → **{l2ctsM}M**.',
              'Burun birkaç derece santrale doğru bakar ama tekne koridorda dümdüz **{l2sog} kn** ile ilerler.',
            ],
          },
        },
      ],
      practice: [{ tip: 'Burada derinlik kapısı kuruma yüksekliği değil harita derinliği kullanır: draft + paydan çıkar.' }],
    },
  },
  nl: {
    title: 'Windparkkust: Zeelust → Duinhaven',
    short: 'Windpark',
    summary: 'Een Nederlands aandoende zandkust met een windpark op zee waar je niet in mag, een smalle corridor langs de kust en een verzande haveningang.',
    chartTitle: 'Zeebries Bank – oefenkaart (fictief, Nederlandse stijl)',
    legend: [
      'Magenta gebied met turbines: Windpark Zeebries – verboden gebied',
      'Gestreepte magenta lijn: veiligheidszone van 500 m rond het windpark',
      'Geel-zwarte boeien: kardinale tekens op de hoeken van het windpark',
      'Groen: Ribbelbank, een zandbank die 0,4 m droogvalt aan de kustkant',
      'Cursieve getallen: kaartdieptes (m onder CD)',
      'Magenta vierkanten en lijnen: waypoints en legs',
    ],
    wptNotes: [
      '≈ 1 M west van de ingang van Zeelust, vrij van de havenhoofden.',
      'ZO-hoek van het windpark, buiten de 500 m-zone; zuidkardinaal ZB-S aan bakboord.',
      'NO-hoek, voorbij noordkardinaal ZB-N; hier eindigt de corridor.',
      'Aanloop Duinhaven, 0,6 M voor de ingang; binnenlopen op de geleidelichten.',
    ],
    notes: [
      'Vaar nooit het windpark of de veiligheidszone van 500 m in; de turbines blokkeren ook radar- en AIS-signalen erachter.',
      'In de corridor zet de vloed naar het noordoosten, richting Ribbelbank – houd de CTS en let op de diepte.',
      'Ingang Duinhaven: minste diepte 0,8 m – alleen tussen {dayOpen} en {dayClose} lokaal.',
      'Er werken onderhoudsschepen van het windpark: luister uit op de marifoon en blijf uit hun buurt.',
      'Te laat en draait de stroom? Zeelust is de uitwijkhaven (bij elk getij bereikbaar).',
    ],
    overview:
      'Op {date} gooien we om {castOff} los in Zeelust en passeren we WPT1 om {depart}. We varen ten oosten van Windpark Zeebries, buiten de 500 m-zone, met de vloed mee. In de corridor duwt de stroom ons richting Ribbelbank, dus sturen we {l2ctsM}M om 000°T over de grond te maken. Om {gate} zijn we bij de ingang van Duinhaven met {gateH} m getij (open {open}–{close}) en rond {eta} liggen we vast. (Alle tijden lokaal.)',
    gateNote: 'De toegangsgeul is verzand tot een kaartdiepte van 0,8 m – een cursieve 0,8 op de kaart, dus deze keer tel je de diepte op in plaats van af te trekken.',
    sections: {
      brief: [
        {
          p: 'Een typische dagtocht op de Noordzee: twee havens aan een rechte zandkust, een klein getijverschil, een stroom langs de kust – en een groot **windpark op zee** precies op de rechte lijn. Het almanakwerk is hetzelfde; nieuw is een **verboden gebied** en een **smalle corridor** tussen het windpark en een zandbank.',
        },
        {
          ex: {
            title: 'De opdracht',
            lines: [
              'Datum: **{date}** · boot **{boat}**, diepgang **{draft} m**, **{speed} kn**.',
              'Van Zeelust (standaardhaven) naar Duinhaven (secundaire haven), ≈ **{nm} M** op zee.',
              'Obstakel 1: **Windpark Zeebries** – verboden gebied, plus een veiligheidszone van 500 m.',
              'Obstakel 2: de **Ribbelbank** aan de kustkant van de corridor.',
              'Obstakel 3: de **ingang van Duinhaven** is verzand tot 0,8 m.',
            ],
          },
        },
        { warn: 'Zeebries Bank is fictief. Echte Nederlandse windparken hebben eigen regels – sommige laten kleine schepen overdag door, veel niet. Controleer altijd de actuele berichten voor je vertrekt.' },
      ],
      almanac: [
        {
          p: 'Dezelfde pagina’s als eerder: een **standaardhaven**-tafel (Zeelust) en een **verschillenkader** voor de secundaire haven (Duinhaven). Let op hoe klein het verval is – zelfs bij springtij maar ongeveer 2 m. Klein verval betekent niet "geen planning": een ingang van 0,8 m en een kiel van 1,6 m maken nog steeds een dieptepoort.',
        },
        { tip: 'De zomertijd is hier UT + 2. Veel Nederlandse almanakken drukken de tijden in UT + 1 (MET); dan tel je er nog maar één uur bij. Lees altijd de tijdzoneregel op de pagina.' },
      ],
      tides: [{ p: 'HW Zeelust is om **{hw}** lokaal met **{hwH} m**, het verval is **{range} m** (factor **{f}**). HW Duinhaven volgt om **{secHw}** met **{secH} m**.' }],
      gate: [
        {
          ex: {
            title: 'Benodigde getijhoogte bij de ingang',
            lines: ['Kaartdiepte **0,8 m** is al water bij kaartnul, dus die verlaagt wat we nodig hebben.', 'Nodig = diepgang 1,6 + marge 0,5 − kaartdiepte 0,8 = **{need} m**.', 'Twaalfdenregel in Duinhaven → open **{dayOpen}**, dicht **{dayClose}** (lokaal).'],
          },
        },
      ],
      streams: [
        {
          p: 'De vloed loopt **noordnoordoost langs de kust** – dat is mee. Hij begint rond HW−5 Zeelust en kentert rond HW+1. In de corridor (◇B) zet hij ongeveer **020°**, een beetje dwars op onze track van 000°T: hij duwt ons **naar het oosten, richting Ribbelbank**.',
        },
      ],
      departure: [
        {
          list: [
            'Te vroeg weg: we zijn bij Duinhaven voordat de ingang open is.',
            'Te laat weg: de eb begint tegen ons in de corridor en de ingang gaat dicht.',
            'Onze keuze: WPT1 om **{depart}**, losgooien om **{castOff}** – stroom de hele weg mee, ingang om **{gate}** met **{gateH} m**.',
          ],
        },
      ],
      route: [
        {
          list: [
            'Behandel het windpark plus de **veiligheidszone van 500 m** als land: waypoints blijven erbuiten.',
            'De **kardinale tekens** op de hoeken vertellen waar je veilig langs kunt: ten noorden van een noordkardinaal, ten oosten van een oostkardinaal, ten zuiden van een zuidkardinaal.',
            'De corridor tussen de zone en de Ribbelbank is smaller dan 1 M – plan hem als één rechte leg (000°T), makkelijk te houden en te controleren.',
            '’s Nachts tonen de randturbines gele flitslichten; in het park geeft de radar veel echo’s en zijn kleine boten moeilijk te zien.',
          ],
        },
      ],
      cts: [
        {
          ex: {
            title: 'Leg 2 door de corridor',
            lines: [
              'Track **000°T**, {l2nm} M. Stroom **{l2set} {l2rate} kn** – duwt ons naar het oosten.',
              'Vectordriehoek → CTS **{l2cts}T**. Variatie 1°E: aftrekken → **{l2ctsM}M**.',
              'De boeg wijst een paar graden naar het windpark, maar de boot gaat recht door de corridor met **{l2sog} kn**.',
            ],
          },
        },
      ],
      practice: [{ tip: 'Hier gebruikt de dieptepoort een kaartdiepte, geen droogvalhoogte: trek die af van diepgang + marge.' }],
    },
  },
}
