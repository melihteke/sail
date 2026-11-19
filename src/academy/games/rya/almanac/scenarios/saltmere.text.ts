import type { Lang } from '../../../../i18n'
import type { ScenarioText } from '../text'

/** Saltmere Sound texts used by the widgets of the main lesson. */
export const saltmereText: Record<Lang, ScenarioText> = {
  en: {
    title: 'Tidal gate and drying bar: Port Halyard → Gannet Cove',
    short: 'Tidal gate',
    summary: 'The full guided lesson: tidal terms, tide tables, a secondary port, tidal streams, a drying bar and a tidal race – every step of the plan explained.',
    chartTitle: 'Saltmere Sound – training chart (fictional)',
    legend: [
      'Magenta square: waypoint (WPT) · magenta line: leg (°T and miles)',
      'Magenta ◇: tidal diamond',
      'Green: drying area – underlined figure is the drying height',
      'Light blue: shallow water (less than ≈ 5 m)',
      'Italic figures: charted depths (m below CD)',
      '+ The Anvil: rock drying 1.2 m',
      '≈≈ Race: rough water off Kestrel Head',
      'Left edge: latitude scale – 1′ = 1 nautical mile',
    ],
    wptNotes: [
      '≈ 1.1 M south-east of Halyard Fairway buoy; open water, clear of harbour traffic.',
      '≈ 2.7 M WSW of Kestrel Head; outside the race. The route turns east here.',
      'Gannet Cove approach waypoint; 1.2 M to the bar on the 016° transit.',
    ],
    notes: [
      'Keep at least 1 M off the Kestrel Head race; further out with wind against tide.',
      'On leg 2 the stream sets north – watch The Anvil, hold the CTS, fix every 15 min.',
      'Cross the bar on the 016° transit; only inside the window {dayOpen}–{dayClose} local.',
      'Delay: leave WPT1 by 0930 local at the latest, otherwise return to Port Halyard.',
      'VHF: Port Halyard Port Control 12, marina 80, distress 16.',
      'If early, wait near WPT3 (outside the bar) or slow down.',
    ],
    overview:
      'On Saturday 13 June we slip from Port Halyard at {castOff} and clear WPT1 at {depart}. With a fair stream we round Kestrel Head and reach the Gannet bar via WPT3 at {gate}, with {gateH} m of tide and rising (the bar is open {open}–{close}). We should be anchored by about {eta}. If we are delayed we must leave WPT1 by 0930 at the latest; otherwise we stay in Port Halyard. (All times local.)',
    gateNote: 'The entrance bar dries 0.6 m (underlined 0̲6 on the chart).',
  },
  tr: {
    title: 'Gelgit kapısı ve bar: Port Halyard → Gannet Cove',
    short: 'Gelgit kapısı',
    summary: 'Tam rehberli ders: gelgit terimleri, gelgit tabloları, ikincil liman, akıntılar, kuruyan bir bar ve bir race – planın her adımı anlatılıyor.',
    chartTitle: 'Saltmere Sound – eğitim haritası (kurgusal)',
    legend: [
      'Mor kare: waypoint (WPT) · mor çizgi: leg (°T ve mil)',
      'Mor ◇: gelgit elması (tidal diamond)',
      'Yeşil: kuruyan alan – altı çizili rakam kuruma yüksekliği',
      'Açık mavi: sığ su (≈ 5 m’den az)',
      'İtalik rakamlar: harita derinliği (CD altı, m)',
      '+ The Anvil: 1,2 m kuruyan kaya',
      '≈≈ Race: Kestrel Head açığında çalkantılı akıntı',
      'Sol kenar: enlem ölçeği – 1′ = 1 deniz mili',
    ],
    wptNotes: [
      'Halyard Fairway şamandırasının ≈ 1,1 M güneydoğusu; açık su, liman trafiğinin dışı.',
      'Kestrel Head’in ≈ 2,7 M batı-güneybatısı; race’in dışı. Burada rota doğuya döner.',
      'Gannet Cove yaklaşım waypointi; buradan 016° giriş hattıyla bara 1,2 M.',
    ],
    notes: [
      'Kestrel Head race’inden en az 1 M uzak dur; rüzgâr akıntıya karşıysa daha da açıl.',
      'Leg 2’de akıntı kuzeye iter – The Anvil’e dikkat, CTS’i tut, 15 dk’da bir konum işaretle.',
      'Bara 016° giriş hattıyla gir; yalnızca {dayOpen}–{dayClose} yerel penceresinde.',
      'Gecikme: WPT1’den en geç 0930 yerel çık; aksi halde Port Halyard’a dön.',
      'VHF: Port Halyard Port Control 12, marina 80, acil durum 16.',
      'Erken varırsan WPT3 civarında (bar dışında) bekle ya da yavaşla.',
    ],
    overview:
      '13 Haziran Cumartesi {castOff}’de Port Halyard’dan ayrılıyor, {depart}’da WPT1’den açık denize çıkıyoruz. Lehte akıntıyla Kestrel Head’i geçip WPT3 üzerinden Gannet barına {gate}’de varıyoruz: gelgit {gateH} m ve yükseliyor (bar {open}–{close} arasında açık). {eta} civarında demirdeyiz. Gecikirsek WPT1’den en geç 0930’da çıkmalıyız; aksi halde Port Halyard’da kalırız. (Saatler yerel.)',
    gateNote: 'Giriş barı 0,6 m kurur (haritada altı çizili 0̲6).',
  },
  nl: {
    title: 'Getijpoort en drempel: Port Halyard → Gannet Cove',
    short: 'Getijpoort',
    summary: 'De volledige begeleide les: getijtermen, getijtafels, een secundaire haven, getijstromen, een droogvallende drempel en een race – elke stap van het plan uitgelegd.',
    chartTitle: 'Saltmere Sound – oefenkaart (fictief)',
    legend: [
      'Magenta vierkant: waypoint (WPT) · magenta lijn: leg (°T en mijlen)',
      'Magenta ◇: getijruit',
      'Groen: droogvallend gebied – onderstreept getal is de droogvalhoogte',
      'Lichtblauw: ondiep water (minder dan ≈ 5 m)',
      'Cursieve getallen: kaartdieptes (m onder CD)',
      '+ The Anvil: rots die 1,2 m droogvalt',
      '≈≈ Race: woelig water bij Kestrel Head',
      'Linkerrand: breedteschaal – 1′ = 1 zeemijl',
    ],
    wptNotes: [
      '≈ 1,1 M zuidoost van de Halyard Fairway-boei; open water, vrij van havenverkeer.',
      '≈ 2,7 M WZW van Kestrel Head; buiten de race. Hier draait de route naar het oosten.',
      'Aanloopwaypoint Gannet Cove; 1,2 M naar de drempel op de lijn 016°.',
    ],
    notes: [
      'Blijf minstens 1 M van de race bij Kestrel Head; verder weg bij wind tegen stroom.',
      'Op leg 2 zet de stroom naar het noorden – let op The Anvil, houd de CTS, bepaal elke 15 min je positie.',
      'Passeer de drempel op de lijn 016°; alleen binnen het venster {dayOpen}–{dayClose} lokaal.',
      'Vertraging: uiterlijk 0930 lokaal bij WPT1 vertrekken, anders terug naar Port Halyard.',
      'Marifoon: Port Halyard Port Control 12, jachthaven 80, nood 16.',
      'Ben je te vroeg, wacht dan bij WPT3 (buiten de drempel) of vaar langzamer.',
    ],
    overview:
      'Op zaterdag 13 juni gooien we om {castOff} los in Port Halyard en passeren we WPT1 om {depart}. Met de stroom mee ronden we Kestrel Head en bereiken we via WPT3 om {gate} de Gannet-drempel, met {gateH} m getij en stijgend (de drempel is open van {open} tot {close}). Rond {eta} liggen we voor anker. Bij vertraging moeten we uiterlijk om 0930 bij WPT1 vertrekken; anders blijven we in Port Halyard. (Alle tijden lokaal.)',
    gateNote: 'De drempel in de ingang valt 0,6 m droog (onderstreept 0̲6 op de kaart).',
  },
}
