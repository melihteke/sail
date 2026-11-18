import type { AlmanacText } from './text'

export const almanacNl: AlmanacText = {
  title: 'Almanaktraining: een tochtplan van begin tot eind',
  intro:
    'Twee havens in een fictief vaargebied, hun getijtafels en een getijstroomatlas – en dan stap voor stap een tochtplan zoals bij RYA Day Skipper: HW/LW, de dieptepoort, getijstromen, vertrektijd, waypoints en de te sturen koers.',
  chapters: {
    start: {
      title: 'Beginnen: wat is een almanak en wat gaan we doen?',
      short: 'Beginnen',
      sections: [
        {
          h: 'De almanak = het handboek van de navigator',
          blocks: [
            {
              p: 'Een almanak bundelt alles wat je nodig hebt om langs een kust te navigeren: **getijtafels** van de havens, **getijstromen** (stroomatlas en getijruiten), haven- en aanloopinformatie, lichten, marifoonkanalen en weerberichten. Op de RYA Day Skipper-theoriecursus oefen je dat in een **fictief vaargebied**; ook de examenvragen gebruiken die oefenkaart en -almanak.',
            },
            {
              p: 'In dezelfde geest hebben we een eigen fictief gebied gemaakt: **Saltmere Sound**. Er liggen twee havens: **Port Halyard** (standaardhaven) en **Gannet Cove** (secundaire haven met een droogvallende drempel in de ingang). Alle tabellen, stromen en posities zijn voor deze les verzonnen.',
            },
            { warn: 'Dit gebied en alle gegevens zijn verzonnen. Gebruik voor echte navigatie altijd officiële, actuele kaarten en almanakken.' },
          ],
        },
        {
          h: 'Het scenario',
          blocks: [
            {
              ex: {
                title: 'Onze opdracht',
                lines: [
                  'Datum: **zaterdag 13 juni** (zomertijd: lokaal = UT + 1).',
                  'Boot: **Aurora**, 9,8 m, diepgang **1,8 m**, kruissnelheid **5 knopen**.',
                  'Van: jachthaven Port Halyard. Naar: de ankerplaats in Gannet Cove.',
                  'Obstakel 1: de drempel in de ingang van Gannet Cove **valt 0,6 m droog** → alleen met genoeg water te passeren.',
                  'Obstakel 2: bij Kestrel Head loopt de stroom **harder dan 2 knopen** → vertrek je op het verkeerde moment, dan heb je hem tegen.',
                ],
              },
            },
            {
              p: 'De vraag is simpel: **Hoe laat vertrekken we, welke koersen over de grond volgen we en welke kompaskoers sturen we?** Aan het eind van de les hebben we dat stap voor stap omgezet in een tochtplan van één pagina.',
            },
          ],
        },
        {
          h: 'Routekaart',
          blocks: [
            {
              steps: [
                '**Gebied en kaart** – waar gaan we heen en wat zijn de gevaren?',
                '**Getijtermen** – CD, LAT, HAT, MHWS, MHWN, MLWN, MLWS, kaartdiepte, droogvalhoogte…',
                '**Port Halyard** – een standaardhavenpagina en getijtafel lezen.',
                '**Gannet Cove** – tijden en hoogtes uit de verschillen van een secundaire haven.',
                '**Getijstromen** – stroomatlas, getijruiten, interpoleren tussen springtij en doodtij.',
                '**Tochtplan 1** – HW/LW, de dieptepoort, stromen, vertrektijd en het overzicht.',
                '**Tochtplan 2** – waypoints, koersen (°W → °M) en afstanden.',
                '**Te sturen koers** – stroom verdisconteren met een vectordriehoek.',
                '**Plankaart** – alles op één pagina.',
                '**Oefenen** – andere dagen zelf uitrekenen.',
              ],
            },
            { tip: 'De rekenvakken zijn live: verschuif de schuifjes en kijk hoe de uitkomst verandert. De getallen in de tekst komen uit dezelfde rekenmodule.' },
          ],
        },
      ],
    },

    area: {
      title: 'Saltmere Sound: het gebied en de kaart',
      short: 'Gebied en kaart',
      sections: [
        {
          h: 'Eerste blik op de kaart',
          blocks: [
            { aw: 'chart' },
            {
              p: 'In het noorden het vasteland, in het zuiden open zee. **Port Halyard** ligt in een inham in het westen, het kleine **Gannet Cove** in het oosten. De kaap ertussen is **Kestrel Head**, met een vuurtoren (Fl(3)15s42m16M) en vlak daarbuiten een **race**: woelig water door de sterke stroom.',
            },
          ],
        },
        {
          h: 'Wat de symbolen betekenen',
          blocks: [
            {
              list: [
                '**Halyard Fairway**-boei (rood-wit, LFl.10s): veilig-vaarwaterteken voor de aanloop van de haven.',
                '**The Anvil**: een rots ten westen van Gannet Cove die **1,2 m droogvalt**, ongeveer een mijl ten noorden van leg 2.',
                '**Gannet-drempel**: zandbank in de ingang die **0,6 m droogvalt**. Passeer hem op de lijn **016°** van twee groene lichten (Oc.G.4s).',
                '**◇A en ◇B**: getijruiten – de almanak geeft de stroom op deze punten per uur.',
                '**WPT1–WPT3**: de waypoints die we gaan plannen.',
              ],
            },
          ],
        },
        {
          h: 'Positie en afstand op de kaart',
          blocks: [
            {
              p: 'Breedtelijnen lopen horizontaal; op de **breedteschaal aan de zijkant is 1 minuut = 1 zeemijl (M)**. De lengteschaal staat onderaan en gebruik je **nooit voor afstanden**: op 47° N is een minuut lengte maar ≈ 0,68 M.',
            },
            {
              ex: {
                title: 'Een afstand meten',
                lines: ['Zet de passer op de twee punten.', 'Breng hem zonder te verstellen naar de breedteschaal, **op dezelfde breedte**.', 'Tel de minuten: 6,6′ = **6,6 zeemijl**.'],
              },
            },
            { tip: 'Bij echte planning is OpenStreetMap/OpenSeaMap handig voor een eerste indruk, maar dieptes en gevaren haal je van een officiële kaart.' },
          ],
        },
      ],
    },

    terms: {
      title: 'Getijtermen: van kaartnul tot doorvaarthoogte',
      short: 'Getijtermen',
      sections: [
        {
          h: 'Waar alles begint: Chart Datum (CD)',
          blocks: [
            {
              p: 'Elke diepte op de kaart en elke getijhoogte in de almanak wordt gemeten vanaf **dezelfde nul**: **Chart Datum (CD)**, het reductievlak of kaartnul. Op moderne kaarten is CD ≈ **LAT** (Lowest Astronomical Tide – het laagste voorspelde waterpeil). Het water zakt bijna nooit onder CD, dus een kaartdiepte is de diepte "in het slechtste geval".',
            },
            { aw: 'levels' },
            { tip: 'Verschuif de getijhoogte: de diepe plek wordt dieper, de droogvallende bank verdwijnt onder water en de doorvaarthoogte onder de brug wordt kleiner.' },
          ],
        },
        {
          h: 'De getijniveaus (waarden Port Halyard)',
          blocks: [
            {
              table: {
                head: ['Afkorting', 'Voluit', 'Betekenis', 'Port Halyard'],
                rows: [
                  ['**HAT**', 'Highest Astronomical Tide', 'Hoogste voorspelde peil. Doorvaarthoogtes van bruggen worden hiervandaan gemeten.', '5,6 m'],
                  ['**MHWS**', 'Mean High Water Springs', 'Gemiddeld hoogwater bij springtij. Lichthoogtes worden meestal hiervandaan gemeten.', '5,1 m'],
                  ['**MHWN**', 'Mean High Water Neaps', 'Gemiddeld hoogwater bij doodtij.', '4,0 m'],
                  ['**MSL**', 'Mean Sea Level', 'Gemiddeld zeeniveau.', '2,8 m'],
                  ['**MLWN**', 'Mean Low Water Neaps', 'Gemiddeld laagwater bij doodtij.', '1,8 m'],
                  ['**MLWS**', 'Mean Low Water Springs', 'Gemiddeld laagwater bij springtij – het ondiepste "normale" moment.', '0,5 m'],
                  ['**LAT / CD**', 'Lowest Astronomical Tide / Chart Datum', 'Kaartnul. Dieptes meet je eronder, droogvalhoogtes erboven.', '0,0 m'],
                ],
              },
            },
            {
              p: 'Daaruit volgen twee belangrijke getallen: **gemiddeld springtijverval** = MHWS − MLWS = 5,1 − 0,5 = **4,6 m**, **gemiddeld doodtijverval** = MHWN − MLWN = 4,0 − 1,8 = **2,2 m**. Die gebruiken we voor de stroomsnelheden.',
            },
          ],
        },
        {
          h: 'Dieptetermen',
          blocks: [
            {
              table: {
                head: ['Term', 'Op de kaart', 'Betekenis'],
                rows: [
                  ['**Charted depth** (kaartdiepte)', 'cursief getal, bv. 8', 'Diepte **onder** CD. Normaal is het water nooit ondieper.'],
                  ['**Drying height** (droogvalhoogte)', 'onderstreept getal, bv. 0̲6', 'Hoogte van de bodem **boven** CD. Valt droog bij laagwater, loopt onder als het water stijgt.'],
                  ['**Height of tide** (getijhoogte)', 'uit de almanak berekend', 'Hoe hoog het water op een bepaald moment boven CD staat.'],
                  ['**Depth of water** (waterdiepte)', 'berekend', 'De werkelijke diepte op dat moment.'],
                  ['**Elevation** (lichthoogte)', 'bv. 42m', 'Hoogte van een licht boven MHWS (op nieuwere kaarten HAT).'],
                  ['**Vertical clearance** (doorvaarthoogte)', 'bv. 18m', 'Hoogte van een brug of kabel boven HAT. Hoe lager het water, hoe meer ruimte.'],
                ],
              },
            },
            {
              ex: {
                title: 'Drie snelle sommen (getijhoogte 3,0 m)',
                lines: [
                  'Kaartdiepte 8 m bij de fairway → waterdiepte = 8 + 3,0 = **11,0 m**.',
                  'Gannet-drempel valt 0,6 m droog → water boven de drempel = 3,0 − 0,6 = **2,4 m**. Diepgang 1,8 m → **0,6 m** onder de kiel.',
                  'Halyard-brug doorvaarthoogte 18 m (boven HAT) → ruimte = 18 + (5,6 − 3,0) = **20,6 m**.',
                ],
              },
            },
            { warn: 'Een kaartdiepte tel je **op**, een droogvalhoogte trek je **af**. Het teken verwisselen is de klassieke manier om vast te lopen.' },
          ],
        },
        {
          h: 'Springtij, doodtij en de maan',
          blocks: [
            {
              p: 'Maan en zon maken het getij. Ongeveer **twee dagen na** volle en nieuwe maan trekken ze op één lijn en is het verval het grootst: **springtij** – hogere hoogwaters, lagere laagwaters, snellere stroom. Rond eerste en laatste kwartier is het **doodtij**.',
            },
            {
              list: [
                '**Range (verval)**: hoogteverschil tussen opeenvolgend HW en LW.',
                '**Duration (rijzingsduur)**: tijd van LW tot HW (ongeveer 6 uur).',
                '**Getijuur**: rijzingsduur ÷ 6. Bij 6 u 27 min is één getijuur 64,5 minuut.',
                '**Twaalfdenregel**: in getijuur 1–6 stijgt of daalt het water 1, 2, 3, 3, 2, 1 twaalfde van het verval.',
              ],
            },
          ],
        },
        {
          h: 'Standaardhaven en secundaire haven',
          blocks: [
            {
              p: 'Voor een **standaardhaven** drukt de almanak voor elke dag de HW/LW-tijden en -hoogtes af (hier: Port Halyard). Kleine havens krijgen geen eigen tabel; dat zijn **secundaire havens** en de almanak geeft alleen **tijd- en hoogteverschillen** ten opzichte van de standaardhaven (hier: Gannet Cove).',
            },
          ],
        },
      ],
    },

    halyard: {
      title: 'Port Halyard: de standaardhavenpagina',
      short: 'Port Halyard',
      sections: [
        {
          h: 'Een havenpagina lezen',
          blocks: [
            { p: 'Elke havenpagina in een almanak heeft dezelfde volgorde. Onze pagina voor Port Halyard:' },
            {
              table: {
                head: ['Kop', 'Port Halyard (fictief)'],
                rows: [
                  ['**Positie / kaart**', '47°17′.4N 012°23′.5W · Saltmere Sound-oefenkaart'],
                  ['**Standaardhaven**', 'Port Halyard (deze pagina)'],
                  ['**Beschrijving**', 'Beschutte natuurlijke haven die naar het noorden loopt, bij elk getij bereikbaar. Jachthaven aan de oostoever; visserij- en veerverkeer.'],
                  ['**Aanloopwaypoint**', 'Halyard Fairway SWM-boei, 47°15′.9N 012°23′.0W.'],
                  ['**Loodsaanwijzingen**', 'Stuur vanaf de fairway 347° midden de inham in. Blijf weg van de ondiepte van 4–5 m aan de westkant. Bij zuidelijke wind korte, steile golven in de ingang.'],
                  ['**Getijstromen**', 'Binnen minder dan 0,5 kn. Buiten zie ◇A.'],
                  ['**Lichten en merktekens**', 'Fairway LFl.10s · Kestrel Head Fl(3)15s42m16M (≈ 10 M zuidoost).'],
                  ['**Marifoon**', 'Port Halyard Port Control kanaal 12; jachthaven kanaal 80.'],
                  ['**Voorzieningen**', 'Jachthaven, brandstof, water, walstroom, winkel, reparatie.'],
                ],
              },
            },
          ],
        },
        {
          h: 'De getijtafel',
          blocks: [
            { aw: 'tideTable' },
            {
              steps: [
                '**Controleer de tijdzone.** De tabel staat in **UT**. In de zomertijd **tel je 1 uur op**: 1018 UT → **1118 lokaal**.',
                '**Zoek de dag.** Meestal zijn er twee HW’s en twee LW’s per dag (soms schuift er één naar de volgende dag – kijk naar 15 juni).',
                '**Onderscheid HW en LW.** De grote hoogtes zijn HW, de kleine LW.',
                '**Bereken het verval.** Ochtend 13 juni: LW 0412 **0,8 m**, HW 1018 **4,8 m** → verval **4,0 m**.',
                '**Springtij of doodtij?** 4,0 m ligt tussen doodtij (2,2) en springtij (4,6) in, maar dicht bij springtij. Volle maan op de 14e, springtij op de 16e.',
              ],
            },
            {
              ex: {
                title: 'Zaterdag 13 juni, Port Halyard',
                lines: [
                  'LW **0412 UT** (0512 lokaal) **0,8 m**',
                  'HW **1018 UT** (1118 lokaal) **4,8 m**',
                  'LW **1636 UT** (1736 lokaal) **0,9 m**',
                  'HW **2242 UT** (2342 lokaal) **4,7 m**',
                  'Verval ’s ochtends: 4,8 − 0,8 = **4,0 m** → dicht bij springtij.',
                ],
              },
            },
          ],
        },
        {
          h: 'De getijkromme: hoogte op elk moment',
          blocks: [
            {
              p: 'Een echte almanak heeft per standaardhaven een **springtij/doodtij-kromme**: je zoekt de tijd ten opzichte van HW onderaan, leest een **factor** af en rekent de hoogte uit als LW + factor × verval. Wij doen hetzelfde met de **twaalfdenregel en getijuren**; de kromme hieronder is zo getekend.',
            },
            { aw: 'curveHalyard' },
            {
              ex: {
                title: 'Hoogte in Port Halyard om 0715 UT?',
                lines: [
                  'LW 0412 → HW 1018: rijzingsduur 6 u 06 min → getijuur = 366 ÷ 6 = **61 min**.',
                  '0715 is 183 min na LW = 183 ÷ 61 = **3 getijuren**.',
                  'Twaalfden: 1 + 2 + 3 = **6/12** → de helft van het verval.',
                  'Hoogte = 0,8 + 4,0 × 6 ÷ 12 = 0,8 + 2,0 = **2,8 m** (precies het gemiddelde zeeniveau).',
                ],
              },
            },
            { tip: 'Elke hoogte tussen de tabeltijden werkt hetzelfde: eerst de **getijuren** tellen, dan de **twaalfden** optellen.' },
          ],
        },
      ],
    },

    gannet: {
      title: 'Gannet Cove: rekenen met een secundaire haven',
      short: 'Gannet Cove',
      sections: [
        {
          h: 'Havenpagina',
          blocks: [
            {
              table: {
                head: ['Kop', 'Gannet Cove (fictief)'],
                rows: [
                  ['**Positie / kaart**', '47°06′.9N 012°07′.4W · Saltmere Sound-oefenkaart'],
                  ['**Standaardhaven**', 'Port Halyard (verschillen hieronder)'],
                  ['**Beschrijving**', 'Kleine, rustige baai ten oosten van Kestrel Head. Goede beschutting tegen noord en west; open naar het zuiden.'],
                  ['**Aanloopwaypoint**', 'WPT3 47°05′.0N 012°08′.0W'],
                  ['**Loodsaanwijzingen**', 'De drempel in de ingang **valt 0,6 m droog**. Twee groene lichten (Oc.G.4s) in lijn op **016°** leiden over de drempel. Deining uit het zuiden kan op de drempel breken. Ankeren binnen op 2–3 m, zand.'],
                  ['**Getijstromen**', 'Voor de baai zie ◇B (meer dan 2 kn bij Kestrel Head). Binnen nauwelijks stroom.'],
                  ['**Lichten en merktekens**', 'Gannet Ldg Lts 016° Oc.G.4s · The Anvil (1̲2) ≈ 2,7 M ten westen van de baai, onbebakend!'],
                  ['**Marifoon**', 'Geen.'],
                  ['**Voorzieningen**', 'Geen. Picknickplaats aan wal.'],
                ],
              },
            },
          ],
        },
        {
          h: 'Het verschillenkader',
          blocks: [
            { aw: 'diffBox' },
            { p: 'De bovenste rijen geven **de tijden en niveaus van Port Halyard**, de onderste rij de **verschillen voor Gannet Cove**:' },
            {
              list: [
                'Valt HW Port Halyard om **0000 of 1200**, dan is HW Gannet **40 min later** (+0040).',
                'Valt HW Port Halyard om **0600 of 1800**, dan **20 min later** (+0020).',
                'Voor een tijd ertussen **interpoleer** je naar verhouding.',
                'LW werkt net zo: 0500/1700 → +0010, 1100/2300 → +0030.',
                'Hoogtes: ligt HW Port Halyard bij MHWS (5,1) dan −0,4 m; bij MHWN (4,0) dan −0,3 m; ertussen interpoleren. Voor LW: MLWN −0,1, MLWS 0,0.',
              ],
            },
          ],
        },
        {
          h: 'Stap voor stap: het ochtend-HW op 13 juni',
          blocks: [
            {
              ex: {
                title: 'Tijd',
                lines: [
                  'HW Port Halyard **1018 UT**. Tabel: 0600 → +0020, 1200 → +0040.',
                  '1018 is 4 u 18 min na 0600 → 258 ÷ 360 = **0,72** van de weg.',
                  'Verschil = 20 + 0,72 × (40 − 20) = 20 + 14,3 ≈ **+34 min**.',
                  'HW Gannet = 1018 + 0034 = **1052 UT** (1152 lokaal).',
                ],
              },
            },
            {
              ex: {
                title: 'Hoogte',
                lines: [
                  'HW Port Halyard **4,8 m**. MHWN 4,0 → −0,3; MHWS 5,1 → −0,4.',
                  '4,8 ligt op (4,8 − 4,0) ÷ 1,1 = **0,73** van de weg van 4,0 naar 5,1.',
                  'Verschil = −0,3 + 0,73 × (−0,1) = −0,37 ≈ **−0,4 m**.',
                  'HW Gannet = 4,8 − 0,4 = **4,4 m**.',
                ],
              },
            },
            {
              ex: {
                title: 'Het LW ervoor',
                lines: [
                  'LW Port Halyard **0412 UT, 0,8 m**. Tabel: 2300 → +0030, 0500 → +0010.',
                  '0412 is 5 u 12 min na 2300 → 312 ÷ 360 = 0,87 → verschil = 30 − 0,87 × 20 ≈ **+13 min** → **0425 UT**.',
                  'Hoogte: 0,23 van de weg van MLWS 0,5 (0,0) naar MLWN 1,8 (−0,1) → verschil ≈ −0,02 ≈ 0,0 → **0,8 m**.',
                ],
              },
            },
            { aw: 'secondary' },
            { tip: 'In een echte almanak interpoleer je tijdsverschillen met een grafiekje of uit je hoofd. Een paar minuten maken voor de navigatie niet uit, maar vergis je nooit in het **teken** (+/−).' },
          ],
        },
        {
          h: 'De getijkromme van Gannet Cove',
          blocks: [
            { p: 'Met de tijden en hoogtes van Gannet Cove kunnen we ook zijn kromme tekenen. De groene band is wanneer we **veilig over de drempel** kunnen (dat rekenen we uit in het tochtplan).' },
            { aw: 'curveGannet' },
          ],
        },
      ],
    },

    streams: {
      title: 'Getijstromen: de atlas en de ruiten',
      short: 'Getijstromen',
      sections: [
        {
          h: 'Begrippen',
          blocks: [
            {
              list: [
                '**Set (richting)**: de richting **waarheen** de stroom loopt (andersom dan bij wind!). 090° = loopt naar het oosten.',
                '**Rate (snelheid)**: snelheid in knopen. De afstand die hij je in een uur meeneemt heet **drift**.',
                '**Vloed / eb**: de stroom bij stijgend / dalend water. **Kentering (slack)**: de stilte als hij draait.',
                'Tijden worden gegeven **ten opzichte van HW in de standaardhaven**: "HW−3 Port Halyard".',
              ],
            },
          ],
        },
        {
          h: 'De getijstroomatlas',
          blocks: [
            {
              p: 'De atlas is een kaartje per uur. Pijlen tonen de richting, getallen de snelheid. Een echte atlas drukt twee getallen af zoals "09,18" (doodtij 0,9 / springtij 1,8 kn); onze atlas toont één getal, al uitgerekend voor het verval van de dag: **16 = 1,6 kn**.',
            },
            { aw: 'atlas' },
            { tip: 'Schuif van HW−6 naar HW+6: tot HW loopt de stroom **oost en zuid (mee)**, na HW draait hij **west en noord (tegen)**. Het sterkst is hij bij Kestrel Head.' },
          ],
        },
        {
          h: 'Getijruiten en interpoleren tussen spring- en doodtij',
          blocks: [
            { p: 'Voor elke ◇ op de kaart staat in de almanak (of in de kaartrand) een tabel: **richting**, **springtijsnelheid** en **doodtijsnelheid** per uur. Voor de dag zelf interpoleer je op het verval:' },
            { p: '**Factor = (verval vandaag − doodtijverval) ÷ (springtijverval − doodtijverval)** → **snelheid = Np + (Sp − Np) × factor**' },
            { aw: 'diamonds' },
            {
              ex: {
                title: '13 juni 0700 UT, ◇A',
                lines: [
                  'HW Port Halyard 1018 UT → 0700 UT = HW − 3 u 18 min → de rij **HW−3**.',
                  '◇A HW−3: **180°**, Sp **1,8**, Np **1,0**.',
                  'Verval 4,0 m → factor = (4,0 − 2,2) ÷ (4,6 − 2,2) = 1,8 ÷ 2,4 = **0,75**.',
                  'Snelheid = 1,0 + (1,8 − 1,0) × 0,75 = **1,6 kn**, richting 180°.',
                ],
              },
            },
            { tip: 'De grafiek "computation of rates" in een echte almanak doet precies dezelfde lineaire interpolatie met een liniaal: zet spring- en doodtijsnelheid uit, verbind ze en lees af bij het verval van de dag.' },
            { p: 'Gebruik het verval van het **getij** dat op dat moment loopt. Wij varen op het ochtendgetij: **4,0 m**.' },
          ],
        },
      ],
    },

    plan: {
      title: 'Tochtplan 1: getij, stroom en vertrektijd',
      short: 'Plan: getij en tijd',
      sections: [
        {
          h: 'Stap 1 – Waarheen, met wie, met welke boot?',
          blocks: [
            {
              p: 'Begin altijd met dezelfde vragen: **Van waar naar waar? Hoe ver? Snelheid en diepgang van de boot? Hoe ervaren is de bemanning? Wat zegt het weer?** De Day Skipper-volgorde: weer, getij, gevaren, uitwijkhavens, bemanning.',
            },
            {
              ex: {
                title: 'Onze antwoorden',
                lines: [
                  'Jachthaven Port Halyard → ankerplaats Gannet Cove: **14,5 M** buitengaats, ≈ **19 M** inclusief de havenstukken.',
                  'Aurora: 5 kn, diepgang 1,8 m. We willen minstens **0,5 m** onder de kiel.',
                  'Weer (fictief): west 3–4, goed zicht. Lopen wind en stroom **dezelfde kant op**, dan blijft de race bij Kestrel Head rustig.',
                  'Uitwijkhaven: terug naar Port Halyard (bij elk getij bereikbaar).',
                ],
              },
            },
          ],
        },
        {
          h: 'Stap 2 – Schrijf HW en LW op',
          blocks: [
            { p: 'Zet de getijden van beide havens voor de dag in één tabel, **in UT en lokale tijd**. Port Halyard komt rechtstreeks uit de tafel, Gannet Cove uit de verschillen:' },
            {
              table: {
                head: ['', 'LW', 'HW', 'LW', 'HW'],
                rows: [
                  ['**Port Halyard** (UT)', '0412 · 0,8', '1018 · 4,8', '1636 · 0,9', '2242 · 4,7'],
                  ['**Port Halyard** (lokaal)', '0512', '1118', '1736', '2342'],
                  ['**Gannet Cove** (UT)', '0425 · 0,8', '1052 · 4,4', '1647 · 0,9', '2318 · 4,3'],
                  ['**Gannet Cove** (lokaal)', '0525', '1152', '1747', '0018 (volgende dag)'],
                ],
              },
            },
            { p: 'Verval Port Halyard ’s ochtends **4,0 m** → stroomfactor **0,75**. Verval in Gannet Cove 4,4 − 0,8 = **3,6 m**.' },
          ],
        },
        {
          h: 'Stap 3 – De dieptepoort: wanneer is de drempel open?',
          blocks: [
            { ex: { title: 'Benodigde getijhoogte', lines: ['Droogvalhoogte **0,6** + diepgang **1,8** + marge **0,5** = **2,9 m**.'] } },
            {
              ex: {
                title: 'Wanneer gaat de drempel open? (stijgend water)',
                lines: [
                  'Gannet LW 0425 **0,8 m** → HW 1052 **4,4 m**: verval 3,6 m, rijzingsduur 6 u 27 min → getijuur **64,5 min**.',
                  'Benodigde rijzing: 2,9 − 0,8 = 2,1 m = 2,1 ÷ 3,6 × 12 = **7 twaalfden**.',
                  'Twaalfden: 1 + 2 + 3 = 6 (3 uur) → het 7e twaalfde is een derde van het 4e uur → **3⅓ getijuur**.',
                  '3,33 × 64,5 = 215 min = 3 u 35 min → 0425 + 0335 = **0800 UT** (0900 lokaal).',
                ],
              },
            },
            {
              ex: {
                title: 'Wanneer gaat hij dicht? (dalend water)',
                lines: [
                  'HW 1052 **4,4 m** → LW 1647 **0,9 m**: verval 3,5 m, duur 5 u 55 min → getijuur **59,2 min**.',
                  'Toegestane daling: 4,4 − 2,9 = 1,5 m = 1,5 ÷ 3,5 × 12 = **5,14 twaalfden**.',
                  '1 + 2 = 3 (2 uur); de resterende 2,14 van de 3 twaalfden van het 3e uur → **2,71 getijuur**.',
                  '2,71 × 59,2 ≈ 161 min = 2 u 41 min → 1052 + 0241 = **1333 UT** (1433 lokaal).',
                ],
              },
            },
            { p: '**Drempelvenster: 0800 – 1333 UT (0900 – 1433 lokaal).** Het is de groene band op de kromme:' },
            { aw: 'curveGannet' },
            { tip: 'Kom zo mogelijk met **stijgend water** bij een drempel: raak je de grond, dan tilt het water je los. Loop je vast bij dalend water, dan wacht je op het volgende getij.' },
          ],
        },
        {
          h: 'Stap 4 – Beoordeel de getijstromen',
          blocks: [
            { p: 'Kijk nu uur voor uur naar de stroom langs de route. HW Port Halyard is 1018 UT, dus elke rij "HW±n" hoort bij een tijdvak (bv. HW−3 = 0648–0748 UT). Snelheden met factor 0,75:' },
            { aw: 'streamDay' },
            {
              list: [
                '**HW−6 → HW**: stroom naar zuid/oost – **mee**. Het sterkst HW−4 tot HW−2, tot 2,1 kn bij Kestrel Head.',
                '**Rond HW**: kentering.',
                '**Vanaf HW+1**: draait naar het westen – **tegen**; 2,0 kn bij Kestrel Head om HW+3.',
              ],
            },
            { p: 'Conclusie: we moeten **uiterlijk rond HW (≈ 1000–1030 UT)** voorbij Kestrel Head zijn; het liefst tussen **HW−4 en HW−2**.' },
          ],
        },
        {
          h: 'Stap 5 – Kies de vertrektijd',
          blocks: [
            { p: 'Twee regels over elkaar heen: (1) bij de drempel zijn **na 0800 UT**, (2) varen terwijl de stroom **mee** is. De planner hieronder rekent de hele tocht door voor elke vertrektijd vanaf WPT1. Probeer het schuifje:' },
            { aw: 'departure' },
            {
              list: [
                '**0500 UT of eerder**: snelle tocht, maar we zijn vóór 0800 bij de drempel en moeten **wachten** (⏳).',
                '**0530–0700 UT**: kortste tocht (136 min), stroom de hele weg mee, drempel open ✅.',
                '**Rond 0800 UT**: kan nog, maar de stroom zwakt af en de tocht duurt langer.',
                '**0900 UT of later**: stroom **tegen** bij Kestrel Head (⚠️); na 1000 gaat ook de drempel dicht (⛔).',
              ],
            },
            {
              ex: {
                title: 'Ons besluit',
                lines: [
                  'Vertrek bij WPT1 om **0630 UT = 0730 lokaal**. Los van de jachthaven 30 min eerder: **0700 lokaal**.',
                  'Bij de drempel om **0902 UT (1002 lokaal)** met **3,7 m** getij (2,9 nodig → 0,8 m marge) en het water stijgt nog.',
                  'Zelfs een uur later (0730 UT) werkt het plan nog: stroom mee, drempel open. Dat is onze **veiligheidsmarge**.',
                ],
              },
            },
          ],
        },
        {
          h: 'Stap 6 – Overzicht van het plan',
          blocks: [
            { p: 'Het overzicht is de korte tekst die je bij de briefing aan de bemanning voorleest. Het geeft de **beslissingen en de redenen**, niet elk detail:' },
            { aw: 'overview' },
          ],
        },
      ],
    },

    route: {
      title: 'Tochtplan 2: route en waypoints',
      short: 'Plan: route en WPT’s',
      sections: [
        {
          h: 'Waypoints kiezen',
          blocks: [
            {
              list: [
                'Leg ze in **veilig water**: minstens 1 M van gevaren en races.',
                'Maak ze **goed herkenbaar**: bij een boei, kaap of licht.',
                'Vermijd **onnodige bochten**, maar snij nooit een hoek richting kust af.',
                'Leg een waypoint nooit **precies op een boei** – ’s nachts of in mist vaar je ertegenaan; leg hem 0,1–0,2 M ernaast.',
              ],
            },
            { aw: 'chart' },
          ],
        },
        { h: 'Waypointlijst en legtabel', blocks: [{ aw: 'legs' }] },
        {
          h: 'Koers en afstand op de kaart meten',
          blocks: [
            {
              steps: [
                'Leg de parallelliniaal (of Portland/Breton-plotter) langs de lijn WPT1 – WPT2.',
                'Lijn het raster van de plotter uit met de breedte- en lengtelijnen en controleer dat de pijl **de vaarrichting** aanwijst.',
                'Lees de ware richting (**°W**, true) af: WPT1 → WPT2 = **156°T**.',
                'Neem de afstand met de passer en lees hem af op de **breedteschaal**: **6,6 M**.',
                'Doe hetzelfde voor WPT2 → WPT3: **120°T, 7,9 M**.',
              ],
            },
          ],
        },
        {
          h: 'Controleren met rekenen (plane sailing)',
          blocks: [
            { p: 'Een rechthoekige driehoek is genoeg om je meting te controleren. Het breedteverschil (d.lat) is al in mijlen; het lengteverschil (d.long) vermenigvuldig je met **cos(breedte)** om het in mijlen om te zetten (departure):' },
            {
              ex: {
                title: 'WPT1 → WPT2',
                lines: [
                  'd.lat = 47°15′.0 → 47°09′.0 = **6,0′ zuid** = 6,0 M.',
                  'd.long = 012°22′.0W → 012°18′.0W = **4,0′ oost** → × cos 47° (0,68) = **2,7 M**.',
                  'Hoek = tan⁻¹(2,7 ÷ 6,0) = 24° → 24° oost van zuid → 180 − 24 = **156°T**.',
                  'Afstand = √(6,0² + 2,7²) = **6,6 M**.',
                ],
              },
            },
            {
              ex: {
                title: 'WPT2 → WPT3',
                lines: ['d.lat = **4,0′ zuid** = 4,0 M · d.long = **10,0′ oost** × 0,68 = **6,8 M**.', 'Hoek = tan⁻¹(6,8 ÷ 4,0) = 60° → 180 − 60 = **120°T**.', 'Afstand = √(4,0² + 6,8²) = **7,9 M**.'],
              },
            },
          ],
        },
        {
          h: 'Waar (T) → Magnetisch (M) → Kompas (C)',
          blocks: [
            { p: 'De kaart is getekend op **ware noord**, het kompas wijst **magnetisch noord** aan. Het verschil is de **variatie** (staat in de kompasroos op de kaart): **3°W** in Saltmere Sound.' },
            {
              list: [
                '**Westelijke variatie: optellen**: 156°T + 3° = **159°M**; 120°T + 3° = **123°M**.',
                '**Oostelijke variatie: aftrekken**.',
                'Ezelsbruggetje: "**West is best**" (bij westelijke variatie is het magnetische getal groter), "**East is least**".',
                'De eigen kompasfout van de boot is de **deviatie** (deviatiekaart). Bij Aurora is die op deze koersen te verwaarlozen, dus °M = kompaskoers.',
              ],
            },
            { warn: '159°M en 123°M zijn **niet de te sturen koersen** – het zijn alleen de **koersen over de grond**. De stroom duwt ons opzij, dus we sturen iets anders → volgend hoofdstuk.' },
          ],
        },
        {
          h: 'Gevaren en controlepunten',
          blocks: [
            {
              list: [
                '**Race bij Kestrel Head**: WPT2 ligt ≈ 2,7 M WZW van de kaap; leg 2 passeert ≈ 2 M ten zuiden ervan.',
                '**The Anvil** (valt 1,2 m droog): ≈ 0,9 M ten noorden van leg 2. De stroom duwt ons **naar het noorden** → zonder koerscorrectie drijven we naar de rots!',
                '**Gannet-drempel**: alleen binnen het venster en op de lijn 016° passeren.',
                'Controles: bij WPT2 peilt het licht van Kestrel Head ≈ 075°T; bij WPT3 staan de geleidelichten in lijn (016°).',
              ],
            },
          ],
        },
      ],
    },

    cts: {
      title: 'Te sturen koers: op koers blijven in de stroom',
      short: 'Te sturen koers',
      sections: [
        {
          h: 'Drie verschillende richtingen',
          blocks: [
            {
              list: [
                '**Grondkoers / ground track** (twee pijlen): de lijn over de grond die we willen volgen. Leg 1: 156°T.',
                '**Koers door het water / heading** (één pijl): waar de boeg heen wijst en de boot door het water gaat. Dit sturen we.',
                '**Getijstroom** (drie pijlen): richting en snelheid waarmee het water zelf ons meeneemt.',
              ],
            },
            { p: 'De stroom duwt de boot opzij. Richt je de boeg recht op WPT2, dan ben je van je lijn af voordat je er bent. De oplossing: iets **de stroom in** sturen, naar de kant waar hij vandaan komt. Die gecorrigeerde koers is de **te sturen koers (CTS)**.' },
          ],
        },
        { h: 'Stap voor stap: de vectordriehoek van één uur', blocks: [{ aw: 'cts' }] },
        {
          h: 'Leg 1: WPT1 → WPT2',
          blocks: [
            {
              ex: {
                title: 'Leg 1',
                lines: [
                  'Track **156°T**, 6,6 M. Midden van de leg ≈ 0701 UT → **HW−3** → ◇A **180°, 1,6 kn**.',
                  'Teken vanaf WPT1 één uur stroom: 1,6 M richting 180°.',
                  'Zet vanaf het eind van de stroompijl de passer op **5 M** en snij de track.',
                  'De lijn naar dat snijpunt wijst **149°T** → + 3° W → **152°M** = te sturen koers.',
                  'WPT1 → snijpunt = **6,4 M** → SOG 6,4 kn → 6,6 ÷ 6,4 × 60 ≈ **62 min** → WPT2 om **0732 UT** (0832 lokaal).',
                ],
              },
            },
            { p: 'De stroom (180°) loopt naar **rechts** van de track (156°) → hij duwt ons naar rechts → we draaien de boeg 7° naar **links** (lager getal).' },
          ],
        },
        {
          h: 'Leg 2: WPT2 → WPT3',
          blocks: [
            {
              ex: {
                title: 'Leg 2',
                lines: [
                  'Track **120°T**, 7,9 M. Midden van de leg ≈ 0809 UT → **HW−2** → ◇B **092°, 1,7 kn**.',
                  'De stroom loopt naar **links** van de track (noord) → hij duwt ons richting The Anvil.',
                  'Driehoek: CTS **129°T** → **132°M**, SOG **6,4 kn**.',
                  '7,9 ÷ 6,4 × 60 ≈ **74 min** → WPT3 om **0846 UT** (0946 lokaal).',
                  'WPT3 → drempel 1,2 M (16 min bij 4,5 kn) → drempel om **0902 UT** met **3,7 m** getij ✅.',
                ],
              },
            },
          ],
        },
        {
          h: 'Drift door wind, lange legs en controleren',
          blocks: [
            {
              list: [
                '**Drift door wind (leeway)**: onder zeil duwt de wind de boot benedenwinds. Draai na het bepalen van de CTS de boeg nog de driftwinkel **naar de wind toe** (bv. wind uit het zuidwesten, 5° drift → **137°M** in plaats van 132°M).',
                '**Legs langer dan een uur**: zet de stroomvector van elk uur kop aan staart, en snij dan de track met de bootsnelheid voor de totale tijd. Onze legs duren ≈ 1 uur, dus we namen de stroom van het uur waarin het **midden van de leg** valt.',
                '**Controle**: is de COG op de GPS gelijk aan de track (156° / 120°T), dan klopt je CTS. Groeit de dwarsafwijking (XTE), dan klopt je stroomschatting niet – corrigeer.',
              ],
            },
            { warn: 'Met een CTS ben je er nog niet: bepaal elke 15–30 minuten je positie en vergelijk die met het plan.' },
          ],
        },
      ],
    },

    sheet: {
      title: 'De plankaart van begin tot eind',
      short: 'Plankaart',
      sections: [
        {
          h: 'Alles op één pagina',
          blocks: [{ p: 'De laatste stap is al het werk op **één pagina** voor de kuip zetten. Deze kaart ligt bij het roer of op de kaartentafel.' }, { aw: 'sheet' }],
        },
        {
          h: 'Checklist',
          blocks: [
            {
              steps: [
                'Weersverwachting (voor vertrek en onderweg opnieuw).',
                'Getij: HW/LW van beide havens, verval, spring-/doodtij.',
                'Dieptepoorten (drempels, ondieptes) en het veilige venster.',
                'Getijstromen: uren mee/tegen, races.',
                'Vertrektijd en veiligheidsmarge.',
                'Waypoints, tracks (°T/°M) en afstanden.',
                'CTS, SOG en ETA per leg.',
                'Gevaren, gevarenpeilingen, uitwijkhavens.',
                'Marifoonkanalen, lichten, briefing van de bemanning.',
              ],
            },
            { tip: 'Dit is ook de volgorde die het RYA Day Skipper-examen verwacht: eerst getij en tijd, dan de route, en tot slot CTS en ETA.' },
          ],
        },
      ],
    },

    practice: {
      title: 'Oefenen: nu jij',
      short: 'Oefenen',
      sections: [
        {
          h: 'Reken je eigen plan uit',
          blocks: [
            {
              steps: [
                'Kies een dag (12, 14 of 15 juni). De vertrektijd bij WPT1 is gegeven.',
                'Lees het ochtend-HW/LW van Port Halyard en bereken het verval.',
                'Gebruik het verschillenkader voor HW Gannet Cove.',
                'Bepaal met de twaalfdenregel wanneer de drempel opengaat.',
                'Bereken de snelheden bij ◇A en ◇B voor het uur waarin het midden van elke leg valt.',
                'Zoek elke CTS met de vectordriehoek; gebruik de SOG voor de legtijden en de ETA bij de drempel.',
                'Vul je antwoorden in en druk op **Controleer**. Loop je vast, ga dan terug naar de eerdere hoofdstukken.',
              ],
            },
            { aw: 'practice' },
            { tip: 'Kleine verschillen zijn normaal: er is een marge van ±3–10 min op tijden en ±2° op koersen. Het gaat om de methode.' },
          ],
        },
        {
          h: 'Denk erover na',
          blocks: [
            {
              list: [
                'Waarom moet je op 15 juni later vertrekken? (Tip: HW valt elke dag ≈ 50 min later.)',
                'Hoe verandert het drempelvenster bij een diepgang van 2,2 m? (Dan is 3,3 m getij nodig.)',
                'Bij oost 5: op welke tijden is de race bij Kestrel Head gevaarlijk?',
              ],
            },
          ],
        },
      ],
    },
  },

  check: [
    {
      q: 'Wat betekent een onderstreepte **0̲6** op de kaart?',
      options: ['Bodem die 0,6 m boven CD droogvalt', 'Een kaartdiepte van 0,6 m', 'Een doorvaarthoogte van 0,6 m', '0,6 m onder MHWS'],
      answer: 0,
      why: 'Onderstreepte getallen zijn droogvalhoogtes: de bodem ligt boven CD, dus diepte = getijhoogte − 0,6.',
    },
    {
      q: 'Kaartdiepte 3,0 m, getijhoogte 2,4 m. Wat is de waterdiepte?',
      options: ['5,4 m', '0,6 m', '3,0 m', '2,4 m'],
      answer: 0,
      why: 'Kaartdiepte ligt onder CD, dus tel de getijhoogte op: 3,0 + 2,4 = 5,4 m.',
    },
    {
      q: 'Doodtijverval 2,2 m, springtijverval 4,6 m, verval vandaag 3,4 m. Wat is de stroomfactor?',
      options: ['0,50', '0,74', '0,25', '1,00'],
      answer: 0,
      why: '(3,4 − 2,2) ÷ (4,6 − 2,2) = 1,2 ÷ 2,4 = 0,5 → precies halverwege doodtij en springtij.',
    },
    {
      q: 'HW Port Halyard is om 0600 UT. Wanneer is HW Gannet Cove?',
      options: ['0620 UT', '0640 UT', '0600 UT', '0610 UT'],
      answer: 0,
      why: 'Het verschillenkader geeft voor 0600 direct +0020; interpoleren is niet nodig.',
    },
    {
      q: 'Variatie 3°W. Een track van 120°T is magnetisch hoeveel?',
      options: ['123°M', '117°M', '120°M', '126°M'],
      answer: 0,
      why: 'Westelijke variatie tel je op: West is best.',
    },
    {
      q: 'De stroom loopt naar links van je track. Welke kant corrigeer je de koers?',
      options: ['Naar rechts (de stroom in)', 'Naar links', 'Geen correctie nodig', 'Gewoon harder varen'],
      answer: 0,
      why: 'De stroom duwt je naar links; daartegen richt je de boeg naar rechts, naar waar de stroom vandaan komt.',
    },
    {
      q: 'In de zomertijd zegt de tafel HW 1018 UT. Wat zegt je horloge?',
      options: ['1118', '0918', '1018', '1218'],
      answer: 0,
      why: 'Zomertijd is UT + 1: 1118.',
    },
    {
      q: 'De drempel valt 0,6 m droog, diepgang 1,8 m, je wilt 0,5 m onder de kiel. Welke getijhoogte heb je nodig?',
      options: ['2,9 m', '2,3 m', '1,7 m', '3,5 m'],
      answer: 0,
      why: '0,6 + 1,8 + 0,5 = 2,9 m.',
    },
  ],

  ui: {
    ut: 'UT',
    local: 'lokaal',
    height: 'Hoogte',
    minutes: 'min',
    chapters: 'Hoofdstukken',
    disclaimer: 'Saltmere Sound, Port Halyard en Gannet Cove zijn fictieve plaatsen, verzonnen voor deze les. Alle tabellen zijn denkbeeldig – niet voor navigatie.',
    weekdays: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
    month: 'juni',
    chart: {
      title: 'Saltmere Sound – oefenkaart (fictief)',
      legs: 'Legs',
      diamonds: 'Getijruiten',
      streams: 'Getijstromen',
      hour: 'Stroomuur',
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
      scale: '2 M',
      variation: 'Var 3°W',
    },
    levels: {
      title: 'Getijniveaus en dieptes',
      hot: 'Getijhoogte',
      depthDeep: 'Diepte op de diepe plek',
      overBank: 'Water boven de droogvallende bank',
      dries: 'bank ligt droog',
      bridge: 'Doorvaarthoogte onder de brug',
      charted: 'Kaartdiepte',
      drying: 'Droogvalhoogte',
      elevation: 'Lichthoogte (boven MHWS)',
      clearance: 'Doorvaarthoogte 18 m (boven HAT)',
      formula: [
        'Waterdiepte = kaartdiepte + getijhoogte',
        'Water boven droogvallend gebied = getijhoogte − droogvalhoogte',
        'Doorvaarthoogte = hoogte op de kaart + (HAT − getijhoogte)',
      ],
    },
    table: {
      title: 'Port Halyard – getijtafel (10–16 juni)',
      springs: 'Rode datum = springtij',
      neaps: 'zwart = richting doodtij',
      fullMoon: 'Volle maan',
      range: 'Verval',
      note: 'Tijdzone UT · zomertijd: 1 uur optellen · hoogtes in meters boven CD',
    },
    curve: {
      title: '{port} – getijkromme',
      pickDay: 'Dag',
      pickTime: 'Tijd',
      need: '{h} m nodig',
      window: 'Drempel open: {open} → {close}',
      at: '{time}: getijhoogte ≈ {h} m',
    },
    diff: {
      title: 'Gannet Cove – verschillen secundaire haven',
      times: 'Tijden',
      heights: 'Hoogtes (m)',
      hw: 'Hoogwater',
      lw: 'Laagwater',
      differences: 'Verschillen: GANNET COVE',
      stdPort: 'Standaardhaven: PORT HALYARD',
      bar: 'De drempel in de ingang valt {d} m droog (onderstreept 0̲6 op de kaart).',
    },
    secondary: {
      title: 'Rekenhulp: tijd en hoogte in Gannet Cove',
      pickDay: 'Dag',
      pickEvent: 'Getij Port Halyard',
      stepTime: 'Tijd: Port Halyard {kind} {t}. Tabel: {a} → {da}, {b} → {db}. {t} ligt op {f} van de weg ertussen → verschil ≈ {raw} min → {d}.',
      stepHeight: 'Hoogte: {h} m ligt op {f} van de weg van {lo} ({dlo}) naar {hi} ({dhi}) → verschil ≈ {raw} → {d} m.',
      result: 'Gannet Cove {kind}: {t} · {h} m',
    },
    diamonds: {
      title: 'Getijruiten ◇A en ◇B (t.o.v. HW Port Halyard)',
      hour: 'Uur',
      dir: 'Richting',
      today: 'Vandaag',
      range: 'Verval vandaag',
      calc: '◇{d} {hour}: {dir}, Sp {sp} / Np {np}. Verval {range} m → factor {f} → snelheid = Np + (Sp − Np) × {f} = {rate} kn',
    },
    atlas: {
      title: 'Getijstroomatlas – uur voor uur',
      hour: 'T.o.v. HW Port Halyard',
      clock: '13 juni: {hour} = {time}. Verval {range} m.',
      note: 'Getallen in tienden van een knoop: 16 = 1,6 kn. De stroom is het sterkst tussen Kestrel Head en The Anvil.',
    },
    streamDay: {
      title: '13 juni: stromen langs de route (factor 0,75)',
      hour: 'Uur',
      band: 'Tijdvak',
      verdict: 'Voor ons',
      fair: 'mee ✅',
      foul: 'tegen ⛔',
      slack: 'kentering',
    },
    departure: {
      title: 'Vertrektijdplanner (13 juni)',
      depart: 'Vertrek WPT1',
      castOff: 'Los van de jachthaven',
      leg: 'Leg',
      stream: 'Stroom',
      cts: 'CTS',
      sog: 'SOG / tijd',
      arrive: 'Aankomst',
      bar: 'Bij de drempel',
      total: 'Tijd op zee',
      ok: 'Je bent bij de drempel terwijl hij open is ✅.',
      early: 'Je bent te vroeg bij de drempel ⏳ – nog niet genoeg water, je moet wachten.',
      late: 'De drempel is dicht ⛔ – niet genoeg water.',
      foulWarn: 'Op één leg staat de stroom tegen ⚠️.',
      fairNote: 'De stroom is de hele weg mee of kentering.',
      timeline: 'Tijdlijn',
      windowLbl: 'Drempelvenster',
      fairLbl: 'Stroom mee (HW−6 … HW)',
      passageLbl: 'Tocht',
      options: 'Opties',
      verdict: 'Uitkomst',
    },
    overview: {
      title: 'Overzicht van het plan (13 juni)',
      rows: ['Datum / boot', 'Port Halyard (standaardhaven)', 'Gannet Cove (secundaire haven)', 'Drempelpoort', 'Stroom mee', 'Los van de jachthaven', 'Bij de drempel', 'Voor anker'],
      text: 'Op zaterdag 13 juni gooien we om {castOff} los in Port Halyard en passeren we WPT1 om {wpt1}. Met de stroom mee ronden we Kestrel Head en bereiken we via WPT3 om {bar} de Gannet-drempel, met {h} m getij en stijgend (de drempel is open van {open} tot {close}). Rond {anchor} liggen we voor anker. Bij vertraging moeten we uiterlijk om 0930 bij WPT1 vertrekken; anders blijven we in Port Halyard. (Alle tijden lokaal.)',
    },
    legs: {
      title: 'Waypoints en legs',
      wpts: 'Waypointlijst',
      wpt: 'WPT',
      pos: 'Positie',
      note: 'Opmerking',
      wptNotes: [
        '≈ 1,1 M zuidoost van de Halyard Fairway-boei; open water, vrij van havenverkeer.',
        '≈ 2,7 M WZW van Kestrel Head; buiten de race. Hier draait de route naar het oosten.',
        'Aanloopwaypoint Gannet Cove; 1,2 M naar de drempel op de lijn 016°.',
      ],
      legTable: 'Legtabel',
      leg: 'Leg',
      trueT: 'Track °T',
      magM: 'Track °M',
      dist: 'Afstand',
      work: 'Berekening',
    },
    cts: {
      title: 'CTS-vectordriehoek',
      leg: 'Leg',
      custom: 'Vrij',
      track: 'Track (°T)',
      set: 'Stroomrichting (set)',
      rate: 'Stroomsnelheid',
      speed: 'Bootsnelheid (STW)',
      result: 'Stuur {t}T = {m}M. De boeg staat {off}° {side} van de track. SOG {sog} kn.',
      left: 'links',
      right: 'rechts',
      tooStrong: 'De stroom is sterker dan de boot – deze track is niet te houden!',
      steps: [
        'Teken de track (koers over de grond) en verleng hem (twee pijlen).',
        'Teken vanaf het begin één uur stroom: richting = set, lengte = snelheid (drie pijlen).',
        'Zet de passer op de bootsnelheid (5 M) en snij vanaf het eind van de stroompijl de track.',
        'Eind stroompijl → snijpunt = koers door het water; die richting is de CTS (°T, één pijl).',
        'Begin → snijpunt = SOG (mijlen over de grond in één uur).',
        'Zet de CTS om naar magnetisch (+3° W), tel zo nodig drift door wind op en geef hem aan de roerganger.',
      ],
      groundTrack: 'Track',
      waterTrack: 'CTS',
      streamVec: 'Stroom',
    },
    sheet: {
      title: 'Tochtplankaart – Port Halyard → Gannet Cove',
      print: 'Afdrukken',
      header: ['Datum', 'Boot', 'Route', 'Afstand buitengaats', 'Tijd', 'Variatie'],
      tides: 'Getijden (lokale tijd · m)',
      summary: 'Verval {range} m · stroomfactor {f} · drempel ≥ {need} m {open}–{close} lokaal',
      timeline: 'Tijdlijn',
      events: ['Los van de jachthaven (Port Halyard)', 'WPT1 – tocht begint', 'WPT2 – koers wijzigen', 'WPT3 – aanloop, lijn 016°', 'Gannet-drempel ({h} m getij)', 'Anker – Gannet Cove'],
      legsH: 'Legs',
      notesH: 'Opmerkingen en gevaren',
      notes: [
        'Blijf minstens 1 M van de race bij Kestrel Head; verder weg bij wind tegen stroom.',
        'Op leg 2 zet de stroom naar het noorden – let op The Anvil, houd de CTS, bepaal elke 15 min je positie.',
        'Passeer de drempel op de lijn 016°; niet buiten 0900–1433 lokaal.',
        'Vertraging: uiterlijk 0930 lokaal bij WPT1 vertrekken, anders terug naar Port Halyard.',
        'Marifoon: Port Halyard Port Control 12, jachthaven 80, nood 16.',
        'Ben je te vroeg, wacht dan bij WPT3 (buiten de drempel) of vaar langzamer.',
      ],
    },
    practice: {
      title: 'Opgave: je eigen tochtplan',
      pickDay: 'Dag',
      intro: '{day} juni. Je vertrekt bij WPT1 om {depart}. Reken met de tabellen het volgende uit (tijden in UT als UUMM, bv. 0745).',
      check: 'Controleer',
      reveal: 'Toon antwoorden',
      questions: [
        'Ochtend-HW Port Halyard (UT)',
        'Verval Port Halyard, LW → HW (m)',
        'HW Gannet Cove (UT)',
        'HW-hoogte Gannet Cove (m)',
        'Drempel gaat open (UT, ≥ 2,9 m)',
        'Leg 1 stroomsnelheid ◇A (kn)',
        'Leg 1 CTS (°M)',
        'Leg 2 stroomsnelheid ◇B (kn)',
        'Leg 2 CTS (°M)',
        'ETA bij de drempel (UT)',
      ],
      answer: 'antwoord:',
      score: '{score}/{max} goed',
    },
    check: { title: 'Test jezelf', intro: 'Een snelle herhaling van het almanakwerk.', correct: 'Goed!', wrong: 'Niet helemaal.', score: '{score}/{max} goed' },
  },
}
