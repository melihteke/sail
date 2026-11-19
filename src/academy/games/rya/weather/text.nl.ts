import type { WeatherText } from './text'

export const weatherNl: WeatherText = {
  title: 'Weer voor de schipper',
  intro:
    'Van de wereldwijde windgordels tot de zeewind op je eigen strand: hogedruk en lagedruk, isobaren, fronten, wolken, de schaal van Beaufort, mist, buien, tropische stormen en weerberichten – met animaties om mee te spelen en oefeningen die je leren een weerkaart te lezen als een schipper.',
  chapters: {
    start: {
      title: 'Waarom het weer de taak van de schipper is',
      short: 'Beginnen',
      sections: [
        {
          h: 'De belangrijkste veiligheidsbeslissing',
          blocks: [
            {
              p: 'De meeste slechte dagen op zee beginnen aan wal, met een beslissing over het weer. Van een Day Skipper wordt verwacht dat hij **een verwachting haalt, die begrijpt, toetst aan de lucht en de barometer, en beslist** – gaan, wachten, een kortere route nemen of vroeg reven. Je hoeft geen meteoroloog te worden; je moet de patronen herkennen die voor een klein schip tellen.',
            },
            {
              list: [
                '**Wind** – kracht, richting, vlagen en hoe die veranderen.',
                '**Zeegang** – golven groeien met wind, strijklengte en tijd, en worden steiler tegen de stroom in.',
                '**Zicht** – mist, regen en duisternis.',
                '**Timing** – wanneer een front, storm of windsprong komt.',
              ],
            },
          ],
        },
        {
          h: 'Drie schalen van weer',
          blocks: [
            {
              table: {
                head: ['Schaal', 'Grootte', 'Wat het je geeft', 'Waar je het vindt'],
                rows: [
                  ['**Synoptisch**', 'Duizenden mijlen, dagen', 'Hogedruk, lagedruk, fronten – de algemene wind voor de komende dagen', 'Synoptische kaarten, shipping forecast, GRIB'],
                  ['**Mesoschaal**', '10–200 mijl, uren', 'Zeewind, buienlijnen, onweer, mistbanken', 'Kustverwachting, radar, satelliet, de lucht'],
                  ['**Lokaal**', 'Een baai of kaap, minuten', 'Trechtereffect, vlagen van kliffen, windschaduw, versnelling om kapen', 'Pilots, lokale kennis, je ogen'],
                ],
              },
            },
            { tip: 'Goede schippers denken van groot naar klein: eerst het synoptische beeld, dan wat de kust en het tijdstip ermee doen.' },
          ],
        },
        {
          h: 'Hoe je deze les gebruikt',
          blocks: [
            {
              steps: [
                'Lees de hoofdstukken op volgorde – elk bouwt voort op het vorige.',
                'Speel met elke animatie: verschuif de schuifjes, wissel van halfrond, klik op de symbolen.',
                'Sluit af met de **denkoefeningen**: kaartvragen, een oceaanoversteek om te plannen, volgordes om te sorteren en snelle herkenningsspellen.',
                'Gebruik de toets aan het eind om te zien wat is blijven hangen.',
              ],
            },
          ],
        },
      ],
    },

    global: {
      title: 'De wereldwijde motor: windgordels en passaten',
      short: 'Wereldwinden',
      sections: [
        {
          h: 'Warme evenaar, koude polen',
          blocks: [
            {
              p: 'De zon verwarmt de tropen veel meer dan de polen. Warme lucht stijgt op bij de evenaar, stroomt hoog naar de polen, koelt af en daalt weer bij ongeveer 30° noord en zuid. Die kringloop is de **Hadleycel**. Tussen 30° en 60° ligt er nog een (**Ferrelcel**) en boven de polen een derde (**poolcel**). Waar lucht daalt is de druk aan het oppervlak **hoog**, waar ze stijgt **laag**.',
            },
            { ww: 'globe' },
          ],
        },
        {
          h: 'De windgordels',
          blocks: [
            {
              table: {
                head: ['Gordel', 'Breedte', 'Wind', 'Voor de zeiler'],
                rows: [
                  ['**Doldrums (ITCZ)**', '0–10°', 'Zwak en veranderlijk, zware buien', 'Dagenlang windstil, dan felle buien. Snel oversteken, liefst waar de band smal is.'],
                  ['**Passaten**', '10–30°', 'NO in het noorden, ZO in het zuiden, 15–25 kn', 'De betrouwbaarste winden op aarde – de klassieke oceaanoversteken voor de wind.'],
                  ['**Paardenbreedten**', '≈ 30°', 'Zwakke wind onder de subtropische hogedrukgebieden (Azoren, Pacific, St Helena…)', 'Blijf weg uit het centrum van het hoog: geen wind.'],
                  ['**Westenwinden**', '35–60°', 'Vooral W, met een reeks depressies', 'Het wisselvallige weer van NW-Europa; in het zuiden de **Roaring Forties**.'],
                  ['**Polair front / subpolaire lagen**', '≈ 60°', 'Waar koude en warme lucht elkaar ontmoeten', 'Geboorteplaats van de meeste depressies op onze breedte.'],
                  ['**Polaire oostenwinden**', '60–90°', 'Koude O-winden', 'Alleen voor zeilen op hoge breedte.'],
                ],
              },
            },
          ],
        },
        {
          h: 'Coriolis: waarom winden afbuigen',
          blocks: [
            {
              p: 'Omdat de aarde draait, lijkt alles wat erover beweegt af te buigen: **naar rechts op het noordelijk halfrond en naar links op het zuidelijk**. Lucht die terugstroomt naar de evenaar buigt naar het westen af, dus de passaat waait in het noorden uit het **noordoosten** en in het zuiden uit het **zuidoosten**. Het effect is nul op de evenaar en het sterkst bij de polen – een reden waarom tropische stormen nooit precies op de evenaar ontstaan.',
            },
          ],
        },
        {
          h: 'Noord en zuid: wat verandert er?',
          blocks: [
            {
              table: {
                head: ['', 'Noordelijk halfrond', 'Zuidelijk halfrond'],
                rows: [
                  ['Afbuiging van bewegende lucht', 'naar rechts', 'naar links'],
                  ['Wind rond een **lagedrukgebied**', 'tegen de klok in', 'met de klok mee'],
                  ['Wind rond een **hogedrukgebied**', 'met de klok mee', 'tegen de klok in'],
                  ['Passaat', 'noordoost', 'zuidoost'],
                  ['Buys Ballot: rug naar de wind, de depressie ligt…', 'links', 'rechts'],
                  ['Koufront trekt over: de wind…', 'ruimt (bv. ZW → NW)', 'krimpt (bv. NW → ZW)'],
                  ['Zomermaanden', 'juni–augustus', 'december–februari'],
                  ['Seizoen tropische stormen', 'juni–november', 'november–april'],
                ],
              },
            },
            { tip: 'De gordels schuiven mee met de zon: ongeveer 5–10° naar het noorden in de noordelijke zomer en naar het zuiden in de noordelijke winter. Daarom vertrekken passaatoversteken naar de Cariben in november–januari.' },
          ],
        },
      ],
    },

    pressure: {
      title: 'Luchtdruk: hogedruk, lagedruk en Buys Ballot',
      short: 'Hoog & laag',
      sections: [
        {
          h: 'Luchtdruk en de barometer',
          blocks: [
            {
              p: 'Luchtdruk is het gewicht van de lucht boven je, gemeten in **hectopascal (hPa)** – hetzelfde als millibar. De gemiddelde druk op zeeniveau is ongeveer **1013 hPa**; diepe depressies gaan onder 960, sterke hogedrukgebieden boven 1040. "Hoog" en "laag" zijn altijd ten opzichte van de omgeving.',
            },
            {
              list: [
                'Schrijf de barometer **elk uur of elke wacht** op. De trend telt meer dan het getal.',
                'Een daling van **3 hPa of meer in 3 uur** betekent dat er wind komt; 6 hPa of meer – reken op storm.',
                'Een snelle stijging na een front geeft ook harde, vlagerige wind.',
              ],
            },
          ],
        },
        {
          h: 'Hogedruk en lagedruk',
          blocks: [
            {
              table: {
                head: ['', 'Hogedruk (anticycloon)', 'Lagedruk (depressie)'],
                rows: [
                  ['Lucht', 'daalt, warmt op, droogt uit', 'stijgt, koelt af, vormt wolken'],
                  ['Weer', 'rustig, weinig bewolking; mist of nevel mogelijk', 'bewolking, regen, fronten, meer wind'],
                  ['Isobaren', 'meestal ver uit elkaar → zwakke wind', 'vaak dicht op elkaar → harde wind'],
                  ['Beweging', 'langzaam, kan dagen blijven liggen ("blokkade")', 'trekt meestal oostwaarts met 15–40 kn'],
                  ['Wind (NH / ZH)', 'met / tegen de klok, naar buiten spiralend', 'tegen / met de klok, naar binnen spiralend'],
                ],
              },
            },
            { ww: 'pressure' },
            {
              p: 'Hoger (ongeveer 1 km) waait de wind **langs** de isobaren – het evenwicht tussen de drukkracht en Coriolis geeft de **geostrofische wind**. Aan het oppervlak remt wrijving de wind af; Coriolis buigt hem dan minder af, zodat hij **schuin over de isobaren naar het lagedrukgebied** waait: ongeveer **10–20° boven zee** en **30–40° boven land**, en boven zee ongeveer een derde zwakker.',
            },
          ],
        },
        {
          h: 'De wet van Buys Ballot',
          blocks: [
            { p: '**Ga met je rug naar de ware wind staan: op het noordelijk halfrond ligt de depressie links (en iets naar voren); op het zuidelijk halfrond rechts.** Geen kaart nodig – het vertelt je waar het slechte weer zit.' },
            { ww: 'buys' },
            { warn: 'Gebruik de ware wind aan het oppervlak, niet de trek van de wolken. Hoge wolken bewegen met de wind daarboven, en die kan heel anders zijn.' },
          ],
        },
      ],
    },

    isobars: {
      title: 'Isobaren lezen: wind uit de kaart',
      short: 'Isobaren',
      sections: [
        {
          h: 'Wat een isobaar is',
          blocks: [
            {
              list: [
                'Een **isobaar** verbindt plaatsen met dezelfde luchtdruk op zeeniveau. Kaarten tekenen ze meestal om de **4 hPa** (1000, 1004, 1008…).',
                '**Dichte isobaren = harde wind; ver uit elkaar = zwakke wind.** Net als hoogtelijnen op een heuvel: steile helling, snelle stroming.',
                'De wind waait bijna langs de isobaren, met de depressie links (NH), boven zee 10–20° naar binnen gedraaid.',
                'Bij dezelfde afstand is de wind **sterker op lage breedte** (Coriolis is zwakker): 4 hPa betekent op 40° meer wind dan op 60°.',
              ],
            },
            { ww: 'isobars' },
          ],
        },
        {
          h: 'Wind meten uit een kaart',
          blocks: [
            {
              steps: [
                'Zoek je positie op de kaart.',
                'Meet de afstand tussen de twee isobaren aan weerszijden, loodrecht erop (breedteschaal: 1′ = 1 mijl).',
                'Lees de **geostrofische wind** af van de schaal op de kaart (of met de rekenhulp hierboven).',
                'Trek boven zee ongeveer een derde af voor de oppervlaktewind (boven land de helft) en draai hem 15° naar de depressie.',
                'Tel de vlagen erbij: ongeveer +30% in stabiele lucht, +50% of meer in onstabiele lucht met buien.',
              ],
            },
            {
              ex: {
                title: 'Voorbeeld op 50° N',
                lines: ['Isobaren 4 hPa uit elkaar, op 120 mijl afstand.', 'Geostrofische wind ≈ **25 kn**.', 'Oppervlaktewind ≈ 25 × ⅔ ≈ **17 kn** (kracht 5), vlagen in buien ≈ 25 kn.', 'Richting: langs de isobaren, depressie links, 15° naar binnen.'],
              },
            },
          ],
        },
        {
          h: 'Ruimen en krimpen',
          blocks: [
            {
              list: [
                '**Ruimen (veering)**: de wind draait **met de klok mee** (bv. Z → ZW → W). Op het NH is meestal een front of trog gepasseerd.',
                '**Krimpen (backing)**: de wind draait **tegen de klok in** (bv. W → ZW → Z). Op het NH betekent krimpende wind met dalende barometer vaak een naderende depressie.',
                'De woorden betekenen op beide halfronden hetzelfde – maar het weer dat ze veroorzaakt is gespiegeld.',
              ],
            },
          ],
        },
        {
          h: 'Rug, trog en zadel',
          blocks: [
            {
              table: {
                head: ['Vorm', 'Op de kaart', 'Weer'],
                rows: [
                  ['**Rug**', 'Isobaren bollen uit vanaf een hogedrukgebied', 'Een korte mooie periode tussen twee depressies'],
                  ['**Trog**', 'Isobaren buigen in een V vanaf een depressie (vaak een lijn)', 'Buien, windstoten en een windsprong (ruimen op NH) als hij passeert'],
                  ['**Zadel (col)**', 'Het zadel tussen twee hoge en twee lage gebieden', 'Zwakke, veranderlijke wind; mist of onweer mogelijk'],
                  ['**Secundaire depressie**', 'Een kleine depressie aan de rand van een grote', 'Kan snel verdiepen en onverwacht storm geven'],
                ],
              },
            },
          ],
        },
      ],
    },

    airmass: {
      title: 'Luchtsoorten en stabiliteit',
      short: 'Luchtsoorten',
      sections: [
        {
          h: 'Waar de lucht vandaan komt',
          blocks: [
            {
              p: 'Een **luchtsoort** is een enorme hoeveelheid lucht die de temperatuur en vochtigheid heeft aangenomen van waar ze vandaan komt. Weten in welke je zit, zegt veel over zicht, bewolking en vlagen.',
            },
            {
              table: {
                head: ['Luchtsoort', 'Herkomst', 'Karakter', 'Typisch weer op zee'],
                rows: [
                  ['**Arctisch (A)**', 'Arctisch ijs', 'zeer koud, droog', 'sneeuwbuien, daartussen zeer goed zicht'],
                  ['**Polair maritiem (Pm)**', 'Noord-Atlantische Oceaan', 'koel, vochtig, onstabiel', 'stapelwolken, buien, vlagerig, goed zicht'],
                  ['**Tropisch maritiem (Tm)**', 'omgeving Azoren', 'zacht, vochtig, stabiel', 'lage bewolking, motregen, slecht zicht, zeemist in het voorjaar'],
                  ['**Polair continentaal (Pc)**', 'Siberië, winter', 'zeer koud, droog', 'snijdende O-wind, helder of boven zee laag grijs'],
                  ['**Tropisch continentaal (Tc)**', 'Sahara, zomer', 'heet, droog', 'nevel, hittegolven, onweer aan de randen'],
                ],
              },
            },
          ],
        },
        {
          h: 'Stabiele en onstabiele lucht',
          blocks: [
            {
              table: {
                head: ['', 'Stabiel', 'Onstabiel'],
                rows: [
                  ['Wat er gebeurt', 'Warme lucht boven een koudere ondergrond – kan niet stijgen', 'Koude lucht boven een warmere ondergrond – stijgende bellen groeien'],
                  ['Bewolking', 'vlakke lagen (stratus, stratocumulus)', 'stapelwolken (cumulus, cumulonimbus)'],
                  ['Neerslag', 'motregen, lichte regen', 'buien, hagel, onweer'],
                  ['Zicht', 'slecht, nevel en mist', 'goed, behalve in buien'],
                  ['Wind', 'gelijkmatig, weinig vlagen', 'vlagerig; windstoten onder grote wolken'],
                ],
              },
            },
            { tip: 'Vuistregel: heldere frisse lucht met wattenwolkjes = vlagerig, zeil met een rif klaar. Grijze diesige lucht = gelijkmatige wind maar let op mist.' },
          ],
        },
      ],
    },

    clouds: {
      title: 'Wolken: de lucht lezen',
      short: 'Wolken',
      sections: [
        {
          h: 'Tien wolkensoorten in vier families',
          blocks: [
            {
              p: 'Wolken worden benoemd naar **hoogte** (cirro- hoog, alto- middelhoog) en **vorm** (cumulus stapel, stratus laag, nimbus regen). Leer de tien basissoorten en wat elk voorspelt – klik op de wolken in de tekening.',
            },
            { ww: 'clouds' },
          ],
        },
        {
          h: 'Wat de lucht je vertelt',
          blocks: [
            {
              table: {
                head: ['Je ziet', 'Het betekent meestal'],
                rows: [
                  ['Cirrus die zich uit het westen verspreidt en dikker wordt', 'een warmtefront en depressie binnen 12–24 uur'],
                  ['Een halo rond zon of maan (cirrostratus)', 'regen waarschijnlijk binnen ongeveer 12 uur'],
                  ['De lucht zakt, de zon wordt waterig (altostratus)', 'regen binnen een paar uur'],
                  ['Cumulus die rond het middaguur hoog uitgroeit', "buien of onweer in de middag"],
                  ['Cumulonimbus met aambeeld', 'windstoten, zware regen, hagel, bliksem in de buurt'],
                  ['Laag grijs dek met motregen', 'warme sector of vochtige stabiele lucht; slecht zicht'],
                  ['Mooiweerwolken die ’s avonds afvlakken', 'bestendig weer'],
                ],
              },
            },
          ],
        },
        {
          h: 'Oude spreuken die kloppen',
          blocks: [
            {
              list: [
                '**"Makreellucht en paardenstaarten: grote schepen zeilen klein"** – cirrocumulus en cirrus voor een front uit.',
                '**"Avondrood, mooi weer aan boord"** – in de westenwinden een heldere westhemel bij zonsondergang.',
                '**"Lang aangekondigd, lang van duur; kort aangekondigd, snel voorbij"** – een langzame barometerdaling geeft langdurige wind, een plotselinge een korte felle.',
                '**"Eerste stijging na het laag, belooft een hardere vlaag"** – de wind is vaak het sterkst net achter het koufront.',
              ],
            },
            { warn: 'Een cumulonimbus kan uit windstilte vlagen van 40 kn of meer geven. Rif vroeg en blijf weg van de donkere basis en het regengordijn.' },
          ],
        },
      ],
    },

    fronts: {
      title: 'Fronten en depressies',
      short: 'Fronten',
      sections: [
        {
          h: 'Symbolen op een synoptische kaart',
          blocks: [{ p: 'Fronten worden getekend met symbolen aan de kant waarheen het front beweegt. Klik op elk symbool om te zien wat het betekent.' }, { ww: 'symbols' }],
        },
        {
          h: 'Fronten in het kort',
          blocks: [
            {
              table: {
                head: ['Front', 'Wat er gebeurt', 'Weer', 'Wind (NH)'],
                rows: [
                  ['**Warmtefront**', 'warme lucht glijdt op een flauwe helling (≈ 1:150) over koude lucht', 'bewolking zakt 12–24 uur, dan aanhoudende regen', 'krimpt en neemt toe vooraf, ruimt bij passage'],
                  ['**Koufront**', 'koude lucht duwt onder warme lucht, steile helling (≈ 1:50)', 'smalle band met zware regen en windstoten, dan opklaring', 'scherpe ruiming, vlagen, barometer springt omhoog'],
                  ['**Occlusiefront**', 'het koufront heeft het warmtefront ingehaald', 'een mengeling: regenband, de depressie is meestal over haar hoogtepunt', 'ruimt'],
                ],
              },
            },
          ],
        },
        {
          h: 'Het leven van een depressie',
          blocks: [
            {
              steps: [
                'Op het **polaire front** tussen koude poollucht en warme tropische lucht ontstaat een knik.',
                'De knik groeit uit tot een golf: een **warmtefront** voorop en een **koufront** erachter, met een **warme sector** ertussen.',
                'De druk in het centrum daalt en de depressie trekt verder, vaak oost of noordoost met 20–30 kn.',
                'Het snellere koufront haalt het warmtefront in: er ontstaat een **occlusie** en de depressie vult langzaam op.',
                'Op het achterblijvende koufront ontstaan vaak nieuwe depressies – een **familie** van depressies, elk een dag of zo na elkaar.',
              ],
            },
          ],
        },
        {
          h: 'Een depressie trekt over je heen',
          blocks: [
            { p: 'Druk op **afspelen** en kijk hoe een typische depressie op het noordelijk halfrond ten zuiden van haar centrum over een boot trekt. Het paneel laat zien wat de bemanning ziet en wat de barometer doet.' },
            { ww: 'passage' },
            {
              table: {
                head: ['Fase', 'Lucht', 'Barometer', 'Wind (NH)', 'Zicht'],
                rows: [
                  ['Voor het warmtefront', 'Ci → Cs (halo) → As → Ns', 'dalend', 'krimpt Z/ZO, neemt toe', 'goed, dan slecht in regen'],
                  ['Warmtefront trekt over', 'Ns, lage St', 'daling vertraagt', 'ruimt ZW', 'slecht'],
                  ['Warme sector', 'St, Sc, motregen', 'gelijk of langzaam dalend', 'gelijkmatig ZW', 'matig tot slecht, mist'],
                  ['Koufront trekt over', 'Cb, zware regen, windstoten', 'stijgt sterk', 'ruimt W/NW, vlagen', 'zeer slecht in regen'],
                  ['Achter het koufront', 'Cu, buien, blauwe lucht', 'stijgend', 'NW, vlagerig', 'zeer goed'],
                ],
              },
            },
            { tip: 'Ten noorden van het centrum is de volgorde anders: de wind krimpt geleidelijk (O → N → NW) zonder warme sector – vaak een lange periode regen.' },
          ],
        },
        {
          h: 'Op het zuidelijk halfrond',
          blocks: [
            {
              p: 'Alles is gespiegeld. Depressies draaien **met de klok mee**, de warme sector ligt aan de **evenaarkant (noord)** van de depressie, en als het koufront passeert draait de wind van **NW naar ZW – hij krimpt**. De rest van het verhaal – zakkende bewolking, dalende barometer, windstoten bij het koufront, heldere buiige lucht erachter – is hetzelfde.',
            },
          ],
        },
      ],
    },

    local: {
      title: 'Lokale winden, kusten en mist',
      short: 'Lokale effecten',
      sections: [
        {
          h: 'Zeewind en landwind',
          blocks: [
            {
              p: 'Op een zonnige dag warmt het land veel sneller op dan de zee. Boven land stijgt warme lucht op en koelere lucht stroomt van zee aan om die te vervangen: de **zeewind**. Hij begint eind van de ochtend, is ’s middags het sterkst (vaak 10–15 kn, soms meer) en valt weg bij zonsondergang. ’s Nachts koelt het land af onder de zeetemperatuur en waait een zwakkere **landwind** naar zee.',
            },
            { ww: 'seabreeze' },
            {
              list: [
                'Er is zon nodig en een verschil tussen land en zee van minstens ongeveer **5 °C**.',
                'Een aflandige gradiëntwind boven ongeveer **15 kn** houdt hem tegen; een zwakke aflandige wind vertraagt hem en geeft een windstille zone voor de kust.',
                'Op het NH **ruimt** hij in de loop van de middag (draait naar rechts van recht aanlandig).',
                'Stapelwolken boven land die bij de kust ophouden, zijn een teken dat hij waait.',
              ],
            },
          ],
        },
        {
          h: 'De kust verandert de wind',
          blocks: [
            {
              table: {
                head: ['Effect', 'Wat er gebeurt'],
                rows: [
                  ['**Kapen**', 'de wind versnelt eromheen, vaak 5–10 kn harder; in stroomrafelingen staat steile zee'],
                  ['**Trechtereffect**', 'de wind wordt samengeperst en versneld in zeestraten en dalen'],
                  ['**Convergentie / divergentie**', 'met de kust rechts van de wind (NH, benedenwinds kijkend) perst wrijving de stroming samen → meer wind; met de kust links → minder'],
                  ['**Windschaduw**', 'windstille plek achter kliffen en eilanden, dan vlagen waar de wind weer naar beneden komt'],
                  ['**Katabatische wind**', '’s nachts door dalen naar beneden stromende koude lucht – harde vlagen in fjorden en bergankerplaatsen'],
                ],
              },
            },
          ],
        },
        {
          h: 'Mist',
          blocks: [
            {
              table: {
                head: ['Soort', 'Hoe het ontstaat', 'Wanneer het optrekt'],
                rows: [
                  ['**Advectiemist (zeemist)**', 'warme vochtige lucht boven koud zeewater – voorjaar en begin zomer', 'alleen bij een andere luchtsoort; wind ruimt het NIET op'],
                  ['**Stralingsmist**', 'land koelt af in heldere windstille nachten; drijft rivieren en havens uit', 'brandt meestal eind van de ochtend weg'],
                  ['**Frontale mist**', 'regen die in koude lucht voor een warmtefront valt', 'als het front gepasseerd is'],
                  ['**Zeerook**', 'zeer koude lucht boven warmer water', 'als de lucht opwarmt'],
                ],
              },
            },
          ],
        },
        {
          h: 'Middellandse Zee en Turkse winden',
          blocks: [
            {
              table: {
                head: ['Wind', 'Waar', 'Karakter'],
                rows: [
                  ['**Meltemi (meltem, Etesiën)**', 'Egeïsche Zee, zomer', 'N–NW, 20–30 kn, ’s middags het sterkst; dagenlang in juli–augustus'],
                  ['**Poyraz**', 'Turkije, Zwarte Zee, Marmara', 'NO, koud en krachtig, kan in de Bosporus een korte steile zee geven'],
                  ['**Lodos**', 'Marmara, Egeïsche Zee', 'ZW, warm, kan stormkracht halen en zware zee in open havens zetten'],
                  ['**Karayel**', 'Turkije', 'NW, koud, vaak na een front'],
                  ['**İmbat**', 'Izmir, Egeïsche kust', 'westelijke zeewind in de zomermiddag'],
                  ['**Mistral**', 'Golfe du Lion', 'N–NW, door het Rhônedal getrechterd, kan bij zon boven 40 kn komen'],
                  ['**Bora**', 'Adriatische Zee', 'NO, felle valwinden van de bergen, kan bijna zonder waarschuwing komen'],
                  ['**Sirocco / Scirocco**', 'uit Noord-Afrika', 'Z–ZO, heet, stoffig of vochtig, slecht zicht'],
                ],
              },
            },
          ],
        },
        {
          h: 'Windstoten en onweer',
          blocks: [
            {
              list: [
                'Een windstoot (squall) is een plotselinge toename van de wind (minstens 16 kn meer, een minuut of langer) – meestal onder een cumulonimbus of langs een koufront.',
                'Let op een donkere wolkenboog en een witte streep op het water die van loefwaarts nadert.',
                'Rif of rol de genua in **voordat** hij er is; ga voor de wind of bijliggen; houd uitkijk – in de regen kan het zicht bijna nul worden.',
                'Bij bliksem: blijf binnen, weg van mast en tuigage, haal zo mogelijk elektronica los.',
              ],
            },
          ],
        },
      ],
    },

    beaufort: {
      title: 'De schaal van Beaufort, vlagen en golven',
      short: 'Beaufort',
      sections: [
        {
          h: 'Van windstil tot orkaan',
          blocks: [
            {
              p: 'De schaal van admiraal Beaufort beschrijft windkracht aan de hand van wat de wind met de zee doet – zo kun je hem zonder instrumenten schatten. Verwachtingen gebruiken hem voortdurend: "zuidwest 5 tot 7" is Beaufort. Verschuif het schuifje en kijk hoe de zee opbouwt.',
            },
            { ww: 'beaufort' },
          ],
        },
        {
          h: 'Vlagen',
          blocks: [
            {
              list: [
                'Verwachte wind is een **gemiddelde** snelheid. Vlagen zijn meestal **30–50% hoger** – meer in onstabiele lucht, bij buien en achter heuvels.',
                'Rif voor de **vlagen**, niet voor het gemiddelde. Goede gewoonte: reven als de vlagen de bovenkant van je comfortzone halen.',
                'Aan de wind is de schijnbare wind sterker: 15 kn ware wind voelt aan de wind als 20 kn en voor de wind als 10 kn.',
              ],
            },
          ],
        },
        {
          h: 'Wat de golven maakt',
          blocks: [
            {
              list: [
                '**Windsnelheid, strijklengte** (open water aan loef) en **duur** – hoe langer en verder de wind waait, hoe hoger de zee.',
                '**Wind tegen stroom** maakt golven korter en steiler; kracht 5 tegen 2 kn stroom kan aanvoelen als kracht 7.',
                '**Ondiep water** en **stroomrafelingen** bij kapen geven steile brekende zeeën.',
                '**Deining** reist ver van verre stormen; ze kan er eerder zijn dan de wind.',
              ],
            },
            { tip: 'Voor een Day Skipper-boot en -bemanning: plan boven kracht 6 in de haven te liggen, en denk goed na over kracht 5 tegen de stroom.' },
          ],
        },
      ],
    },

    tropical: {
      title: 'Tropische stormen en oceaanoversteken',
      short: 'Tropen & oceanen',
      sections: [
        {
          h: 'Tropische wervelstormen',
          blocks: [
            {
              p: 'Boven zeewater warmer dan ongeveer **27 °C**, tussen grofweg 5° en 25° van de evenaar, kan een groep onweersbuien uitgroeien tot een **tropische wervelstorm** – winden van 64 kn en meer rond een windstil oog. Ze trekken met de passaat naar het westen en buigen daarna vaak af naar de pool en het oosten.',
            },
            {
              table: {
                head: ['Naam', 'Waar', 'Seizoen'],
                rows: [
                  ['Orkaan (hurricane)', 'Noord-Atlantische Oceaan, Cariben, NO-Pacific', 'juni – november (piek aug–okt)'],
                  ['Tyfoon', 'NW-Pacific', 'hele jaar, piek jul–nov'],
                  ['Cycloon', 'Indische Oceaan, Zuidelijke Pacific, Australië', 'nov – april (Z), mei en okt–nov (N Indische Oceaan)'],
                ],
              },
            },
            { ww: 'trs' },
          ],
        },
        {
          h: 'Ontsnappingsregels',
          blocks: [
            {
              table: {
                head: ['Waar je bent', 'Noordelijk halfrond', 'Zuidelijk halfrond'],
                rows: [
                  ['**Gevaarlijke halve cirkel**', 'rechts van het spoor; de wind **ruimt** – houd de wind **stuurboord voorlijk** en maak zoveel mogelijk vaart', 'links van het spoor; de wind **krimpt** – houd de wind **bakboord voorlijk**'],
                  ['**Bevaarbare halve cirkel**', 'links van het spoor; de wind **krimpt** – houd de wind **stuurboord achterlijk**', 'rechts van het spoor; de wind **ruimt** – wind **bakboord achterlijk**'],
                  ['**Recht in het pad**', 'wind gelijk van richting, toenemend, barometer dalend – loop voor de wind met de wind **stuurboord achterlijk** naar de bevaarbare halve cirkel', 'hetzelfde, wind **bakboord achterlijk**'],
                ],
              },
            },
            { warn: 'De beste tactiek is er niet te zijn: plan oceaanoversteken buiten het stormseizoen en volg de verwachtingen van het National Hurricane Center of het plaatselijke waarschuwingscentrum.' },
          ],
        },
        {
          h: 'Een passaatoversteek plannen',
          blocks: [
            {
              steps: [
                '**Eerst het seizoen**: Canarische Eilanden → Cariben vertrekt na het orkaanseizoen, meestal eind november tot januari.',
                '**"Ga naar het zuiden tot de boter smelt, dan rechtsaf"**: koers zuidwest langs de Kaapverden naar ongeveer 15–20° N voordat je west gaat – de stabiele passaat in en weg van de zwakke wind van het Azorenhoog.',
                '**Vermijd het hoog**: de directe (grootcirkel)route loopt het windstille centrum in.',
                '**Vermijd de doldrums**: te ver naar het zuiden en je komt in de ITCZ – windstilte en buien.',
                'Reken op **buien ’s nachts** in de passaat en wekenlang deining van achteren: plan zeilvoering en schamelbescherming.',
              ],
            },
            { tip: 'Probeer het zelf in de oefeningen: plan een oversteek en kijk hoe de boot door het windveld zeilt.' },
          ],
        },
      ],
    },

    forecasts: {
      title: 'Weerberichten en de go/no-go-beslissing',
      short: 'Weerberichten',
      sections: [
        {
          h: 'Waar je het weer vandaan haalt',
          blocks: [
            {
              table: {
                head: ['Bron', 'Wat het geeft', 'Tip'],
                rows: [
                  ['**Shipping forecast / zeegebiedenbericht**', 'zeegebieden, 24 uur, stormwaarschuwingen', 'standaardtaal – leer de termen hieronder'],
                  ['**Kustwaterbericht**', 'tot 12 mijl uit de kust, gedetailleerder', 'het beste voor dagtochten langs de kust'],
                  ['**Kustwacht / MSI via marifoon**', 'uitzending op een werkkanaal na aankondiging op kanaal 16', 'zet de tijden in je tochtplan'],
                  ['**Navtex**', 'geprinte of getoonde tekstverwachtingen en waarschuwingen', 'werkt op zee zonder internet'],
                  ['**Synoptische kaarten**', 'analyse- en verwachtingskaarten tot 5 dagen', 'zie hoe het patroon zich ontwikkelt'],
                  ['**GRIB-bestanden / apps**', 'wind- en drukrasters van computermodellen', 'netjes en gedetailleerd – maar lees de waarschuwingen hieronder'],
                ],
              },
            },
            { ww: 'forecast' },
          ],
        },
        {
          h: 'GRIB-data: handig, maar…',
          blocks: [
            {
              list: [
                'Modellen geven een **gemiddelde** wind op een rooster van enkele kilometers – ze missen vlagen, buien, kapen en trechtereffecten.',
                'Fronten kunnen uren eerder of later komen dan het model zegt.',
                'Vergelijk twee modellen en de officiële verwachting; verschillen ze, dan is de onzekerheid groot.',
                'Toets altijd aan de **werkelijkheid**: de barometer, de lucht en de wind die je echt hebt.',
              ],
            },
          ],
        },
        {
          h: 'De beslissing nemen',
          blocks: [
            {
              steps: [
                'Haal de verwachting voor de hele tocht plus een veiligheidsmarge van enkele uren.',
                'Kijk naar de **slechtste** verwachte omstandigheden: vlagen, wind tegen stroom, de zwaarste periode.',
                'Leg ze naast het **zwakste** deel van het team: bemanning, boot, ervaring van de schipper.',
                'Plan uitwijkhavens en rifpunten; bepaal vooraf wat je zou doen terugkeren.',
                'Bij twijfel: niet gaan – of kies een korter, beschutter plan.',
              ],
            },
            {
              ex: {
                title: 'Voorbeeld',
                lines: [
                  'Verwachting: SW 4 to 5, increasing 6 later. Showers. Good.',
                  '"Later" = meer dan 12 uur verder. Een tocht van 6 uur die nu vertrekt valt binnen de 4–5.',
                  'Showers = onstabiele lucht: reken op vlagen tot 25 kn. Vertrek met een rif.',
                  'Plan ruim voor de avond in de haven te zijn; kies een haven die veilig is bij ZW 6.',
                ],
              },
            },
          ],
        },
      ],
    },

    drills: {
      title: 'Denkoefeningen',
      short: 'Oefeningen',
      sections: [
        { h: 'Lees de synoptische kaart', blocks: [{ p: 'Drie kaarten – twee van het noordelijk en één van het zuidelijk halfrond. Beantwoord de vragen met de isobaren, de fronten en Buys Ballot.' }, { wd: 'synoptic' }] },
        { h: 'Plan een oceaanoversteek', blocks: [{ p: 'Gran Canaria naar St Lucia, ongeveer 2.700 mijl. Kies de maand, klik op de kaart om waypoints toe te voegen en vertrek: de boot zeilt door het windveld rond het Azorenhoog en de passaat. Verslaan jij de klassieke route?' }, { wd: 'route' }] },
        { h: 'Een depressie in de juiste volgorde', blocks: [{ wd: 'order' }] },
        { h: 'Welke kracht is het?', blocks: [{ wd: 'beaufortGuess' }] },
        { h: 'Welke wolk is dit?', blocks: [{ wd: 'cloudGuess' }] },
        { h: 'Waar ligt de depressie?', blocks: [{ wd: 'buysDrill' }] },
        { h: 'Ontsnap aan de storm', blocks: [{ wd: 'trsDrill' }] },
        { h: 'Gaan of niet gaan?', blocks: [{ wd: 'gonogo' }] },
      ],
    },
  },

  check: [
    {
      q: 'Op het noordelijk halfrond sta je met je rug naar de wind. Waar ligt de depressie?',
      options: ['Links, iets naar voren', 'Rechts', 'Recht vooruit', 'Achter je'],
      answer: 0,
      why: 'Buys Ballot: NH – depressie links; ZH – depressie rechts.',
    },
    {
      q: 'De isobaren op de verwachtingskaart komen dichter bij elkaar. Wat doet de wind?',
      options: ['Hij neemt toe', 'Hij neemt af', 'Hij valt weg', 'Niets – alleen de richting verandert'],
      answer: 0,
      why: 'Dichte isobaren betekenen een steile drukgradiënt en harde wind.',
    },
    {
      q: 'Welke wolkenvolgorde waarschuwt voor een naderend warmtefront?',
      options: ['Cirrus → cirrostratus → altostratus → nimbostratus', 'Cumulus → cumulonimbus → cumulus', 'Stratus → mist → stratus', 'Cumulonimbus → cirrus → heldere lucht'],
      answer: 0,
      why: 'Het warmtefrontvlak helt flauw; de hoge bewolking komt tot een dag van tevoren.',
    },
    {
      q: 'Op het noordelijk halfrond trekt een koufront over. Wat doet de wind meestal?',
      options: ['Ruimt scherp, bv. ZW naar NW, met vlagen', 'Krimpt van W naar Z', 'Valt weg', 'Blijft gelijk'],
      answer: 0,
      why: 'Een scherpe ruiming, windstoten en een stijgende barometer zijn de tekenen van een koufront (op het ZH krimpt hij).',
    },
    {
      q: 'Uit welke richting waait de passaat op het zuidelijk halfrond?',
      options: ['Zuidoost', 'Noordoost', 'West', 'Zuidwest'],
      answer: 0,
      why: 'Lucht die naar de evenaar stroomt buigt op het ZH naar links af, dus de passaat komt uit het ZO.',
    },
    {
      q: 'Wat is kracht 6 op de schaal van Beaufort?',
      options: ['Krachtige wind, 22–27 kn', 'Stormachtig, 34–40 kn', 'Matige wind, 11–16 kn', 'Vrij krachtige wind, 17–21 kn'],
      answer: 0,
      why: 'K4 matig, K5 vrij krachtig, K6 krachtig, K7 hard, K8 stormachtig.',
    },
    {
      q: 'Advectiemist op zee: wat ruimt het op?',
      options: ['Een andere luchtsoort, bv. als er een front passeert', 'Meer wind', 'De ochtendzon', 'De eb'],
      answer: 0,
      why: 'Zeemist ontstaat in warme vochtige lucht boven koud water en kan bij behoorlijk wat wind blijven hangen.',
    },
    {
      q: 'De verwachting zegt "gale imminent". Wanneer wordt die verwacht?',
      options: ['Binnen 6 uur', 'Over 6–12 uur', 'Over meer dan 12 uur', 'Hij waait al'],
      answer: 0,
      why: 'Imminent < 6 u, soon 6–12 u, later > 12 u.',
    },
    {
      q: 'Waarom duurt de directe route van de Canarische Eilanden naar de Cariben vaak langer?',
      options: ['Ze loopt dicht langs de zwakke wind van het Azorenhoog', 'Ze is veel langer', 'Ze komt in de doldrums', 'Ze is tegen de passaat in'],
      answer: 0,
      why: 'Eerst naar het zuiden brengt je in de stabiele passaat, weg van het windstille centrum van het hoog.',
    },
    {
      q: 'Op het noordelijk halfrond zit je in de gevaarlijke halve cirkel van een orkaan. Hoe zeil je?',
      options: ['Wind stuurboord voorlijk, zoveel mogelijk vaart', 'Wind bakboord achterlijk', 'Recht voor de wind', 'Bijliggen en afwachten'],
      answer: 0,
      why: 'Daarmee kom je weg van het spoor; in de bevaarbare halve cirkel neem je de wind stuurboord achterlijk.',
    },
  ],

  ui: {
    chapters: 'Hoofdstukken',
    disclaimer: 'Kaarten, velden en getallen zijn hier vereenvoudigd voor training. Gebruik voor echte tochten officiële verwachtingen.',
    play: 'Afspelen',
    pause: 'Pauze',
    hemi: 'Halfrond',
    nh: 'Noordelijk',
    sh: 'Zuidelijk',
    correct: 'Goed!',
    wrong: 'Niet helemaal.',
    next: 'Volgende',
    again: 'Opnieuw',
    score: '{score}/{max} goed',
    check: 'Controleer',
    round: 'Vraag {n} van {m}',
    final: { title: 'Eindtoets', intro: 'Tien vragen over de hele les. De antwoorden worden telkens geschud.' },
    compass: ['N', 'NO', 'O', 'ZO', 'Z', 'ZW', 'W', 'NW'],
    months: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
    globe: {
      title: 'Algemene circulatie en windgordels',
      month: 'Maand',
      hint: 'Klik op een gordel om erover te lezen. Verschuif de maand en zie de gordels de zon volgen.',
      cells: 'Hadley- · Ferrel- · poolcellen',
      bands: {
        polarE: { name: 'Polaire oostenwinden', text: 'Koude lucht die boven de polen daalt waaiert uit en buigt door Coriolis naar het westen af: O–NO-winden in het noorden, O–ZO in het zuiden.' },
        subpolar: { name: 'Subpolaire lagen / polair front', text: 'Koude poollucht ontmoet warme lucht uit het zuiden. Golven op dit front groeien uit tot de depressies die over Europa trekken.' },
        westerlies: { name: 'Westenwinden', text: 'Tussen de hogedrukgebieden en het polaire front waait de wind vooral uit het westen, meegevoerd door een reeks depressies. In het zuiden, met weinig land, zijn het de Roaring Forties en Furious Fifties.' },
        horse: { name: 'Subtropische hogedrukgebieden (paardenbreedten)', text: 'Lucht daalt bij ongeveer 30°: grote, trage hogedrukgebieden zoals het Azorenhoog. Zwakke wind, heldere lucht – op land liggen de woestijnen eronder.' },
        trades: { name: 'Passaten', text: 'Lucht die terugstroomt naar de evenaar buigt naar het westen af: stabiele NO-passaat in het noorden en ZO-passaat in het zuiden, 15–25 kn met kleine stapelwolken.' },
        itcz: { name: 'Doldrums (ITCZ)', text: 'De twee passaten ontmoeten elkaar waar de zon het meest verwarmt. Lucht stijgt op in enorme cumulonimbus: windstilte, zware regen en buien. Schuift in de noordelijke zomer naar het noorden.' },
      },
    },
    pressure: {
      title: 'Wind rond hoge- en lagedrukgebieden',
      friction: 'Oppervlak',
      frictionOpts: ['hoog (geen wrijving)', 'boven zee', 'boven land'],
      high: 'Hoog',
      low: 'Laag',
      note: 'Hoog in de lucht volgt de wind de isobaren. Wrijving remt hem af en draait hem naar de depressie toe – boven land meer dan boven zee.',
    },
    buys: {
      title: 'De wet van Buys Ballot',
      windFrom: 'Wind uit',
      rule: 'Rug naar de wind → de depressie ligt LINKS en iets naar voren.',
      ruleS: 'Rug naar de wind → de depressie ligt RECHTS en iets naar voren.',
      low: 'Depressie ligt ongeveer in {b}',
      high: 'Hoog',
    },
    isobars: {
      title: 'Afstand tussen isobaren → windsnelheid',
      spacing: 'Afstand tussen isobaren van 4 hPa',
      lat: 'Breedte',
      geo: 'Geostrofische wind',
      surface: 'Oppervlaktewind boven zee',
      force: 'Beaufort',
      note: 'Halveer de afstand en de wind verdubbelt. Dezelfde afstand geeft meer wind dichter bij de evenaar.',
    },
    clouds: {
      title: 'Wolkenatlas',
      hint: 'Klik op een wolk.',
      bands: { high: 'Hoge bewolking > 6 km', mid: 'Middelbare bewolking 2–6 km', low: 'Lage bewolking < 2 km', vertical: 'Verticale ontwikkeling' },
      info: {
        ci: { name: 'Cirrus (Ci)', text: 'Dunne witte haarachtige ijsslierten ("paardenstaarten"). Meer en dikker uit het westen: binnen een dag kan er een front komen.' },
        cc: { name: 'Cirrocumulus (Cc)', text: 'Kleine rimpels hoog in de lucht – de "makreellucht". Vaak voor een warmtefront uit.' },
        cs: { name: 'Cirrostratus (Cs)', text: 'Een dunne melkachtige sluier die een halo rond zon of maan geeft. Regen waarschijnlijk binnen ongeveer 12 uur.' },
        ac: { name: 'Altocumulus (Ac)', text: 'Grijswitte rollen of plukken op middelbare hoogte. Torentjes (castellanus) op een zomerochtend waarschuwen voor onweer later.' },
        as: { name: 'Altostratus (As)', text: 'Een grijs dek; de zon schijnt erdoor als door matglas. Het warmtefront is nog een paar uur weg.' },
        ns: { name: 'Nimbostratus (Ns)', text: 'Dikke, donkere, lage laag met aanhoudende regen of sneeuw. Slecht zicht – het warmtefront is er.' },
        sc: { name: 'Stratocumulus (Sc)', text: 'Bobbelige grijze laag met gaten. Meestal droog; vaak in hogedrukgebieden en in de warme sector.' },
        st: { name: 'Stratus (St)', text: 'Vormloos laag grijs dek, motregen, heuveltoppen verdwijnen. Stabiele vochtige lucht – let op het zicht.' },
        cu: { name: 'Cumulus (Cu)', text: 'Stapelwolken met vlakke basis. Kleine = mooi weer; uitgroeiende = later buien en vlagen.' },
        cb: { name: 'Cumulonimbus (Cb)', text: 'Enorme torens met een aambeeld: zware buien, hagel, onweer en windstoten van 40 kn of meer.' },
      },
    },
    symbols: {
      title: 'Symbolen op de synoptische kaart',
      hint: 'Klik op een symbool.',
      items: {
        cold: { name: 'Koufront', text: 'Blauwe lijn met driehoeken die de bewegingsrichting aanwijzen. Koude lucht schuift onder warme: windstoten, zware regen, dan ruimen (NH) en opklaring.' },
        warm: { name: 'Warmtefront', text: 'Rode lijn met halve cirkels. Warme lucht glijdt over koude lucht: lang van tevoren zakkende bewolking en regen.' },
        occluded: { name: 'Occlusiefront', text: 'Paarse lijn met driehoeken en halve cirkels samen: het koufront heeft het warmtefront ingehaald. Regenband; de depressie is meestal volgroeid.' },
        stationary: { name: 'Stationair front', text: 'Afwisselend rode halve cirkels en blauwe driehoeken aan weerszijden: het front beweegt nauwelijks – een lange band bewolking en regen kan boven je blijven hangen.' },
        trough: { name: 'Trog', text: 'Lijn waar de isobaren scherp rond een depressie buigen. Buien, windstoten en een windsprong als hij passeert.' },
        isobar: { name: 'Isobaar', text: 'Lijn van gelijke druk, met hPa erbij, meestal om de 4 hPa. Dicht op elkaar = harde wind.' },
        high: { name: 'Hoog (H / anticycloon)', text: 'Centrum van hoge druk met de waarde. Bestendig weer, zwakke wind bij het centrum.' },
        low: { name: 'Laag (L / depressie)', text: 'Centrum van lage druk met de waarde. Bewolking, regen, fronten, meer wind.' },
      },
      barbs: 'Windvaantjes (GRIB en stationsweergave)',
      barbsText: 'De steel wijst de wind in (waar hij vandaan komt). Halve veer = 5 kn, hele veer = 10 kn, vlag = 50 kn.',
    },
    passage: {
      title: 'Een depressie trekt over een boot',
      time: 'Tijd',
      hours: '{h} u',
      labels: { pressure: 'Barometer', tendency: 'Tendens over 3 uur', wind: 'Wind', sky: 'Lucht', weather: 'Weer', vis: 'Zicht', temp: 'Temperatuur', zone: 'Waar de boot is' },
      tendency: ['gelijk', 'langzaam', '', 'snel', 'zeer snel'],
      rising: 'stijgend',
      falling: 'dalend',
      section: 'Doorsnede langs de breedte van de boot (west ← → oost)',
      barograph: 'Barograaf aan boord',
      zones: {
        far: { name: 'Ver voor het warmtefront', sky: 'cirrus, dan een halo van cirrostratus', weather: 'droog', vis: 'goed', temp: 'koel' },
        ahead: { name: 'Voor het warmtefront', sky: 'altostratus die dikker wordt tot nimbostratus', weather: 'regen begint, wordt aanhoudend', vis: 'matig, wordt slecht', temp: 'koel' },
        warmFront: { name: 'Warmtefront trekt over', sky: 'lage nimbostratus en stratus', weather: 'aanhoudende regen gaat over in motregen', vis: 'slecht', temp: 'stijgend' },
        warmSector: { name: 'Warme sector', sky: 'stratus en stratocumulus', weather: 'motregen, nevel', vis: 'matig tot slecht, mist mogelijk', temp: 'zacht' },
        coldFront: { name: 'Koufront trekt over', sky: 'cumulonimbus, donkere buienlijn', weather: 'zware regen, windstoten, mogelijk hagel', vis: 'zeer slecht in regen', temp: 'daalt sterk' },
        behind: { name: 'Achter het koufront', sky: 'cumulus, blauwe lucht tussen de buien', weather: 'buien, vlagerig', vis: 'zeer goed', temp: 'koud' },
      },
    },
    seabreeze: {
      title: 'Zeewind door de dag',
      time: 'Tijdstip',
      gradient: 'Gradiëntwind (− aflandig / + aanlandig)',
      land: 'Land',
      sea: 'Zee',
      result: 'Wind op het strand',
      onshore: 'aanlandig',
      offshore: 'aflandig',
      calm: 'windstil',
      sb: 'Zeewind waait',
      lb: 'Landwind waait',
      none: 'Geen lokale wind',
      note: 'Een harde aflandige gradiëntwind maakt de zeewind kapot; op een windstille zonnige dag kan hij 15 kn halen.',
    },
    beaufort: {
      title: 'Schaal van Beaufort',
      force: 'Kracht',
      kn: 'Wind',
      wave: 'Waarschijnlijke golfhoogte',
      names: ['Windstil', 'Zwak', 'Zwak', 'Matig', 'Matig', 'Vrij krachtig', 'Krachtig', 'Hard', 'Stormachtig', 'Storm', 'Zware storm', 'Zeer zware storm', 'Orkaan'],
      sea: [
        'Zee spiegelglad.',
        'Rimpelingen, geen schuimkoppen.',
        'Kleine golfjes, glazige toppen, niet brekend.',
        'Grotere golfjes, toppen beginnen te breken, hier en daar schuimkoppen.',
        'Kleine golven, vrij veel schuimkoppen.',
        'Matige langere golven, veel schuimkoppen, wat buiswater.',
        'Grote golven, overal witte schuimkoppen, buiswater waarschijnlijk.',
        'Zee loopt op, wit schuim waait in strepen.',
        'Matig hoge golven, toppen breken in stuifwater, duidelijke schuimstrepen.',
        'Hoge golven, dichte schuimstrepen, toppen slaan om, stuifwater beperkt het zicht.',
        'Zeer hoge golven met lange overhangende toppen, de zee ziet wit, zicht beperkt.',
        'Uitzonderlijk hoge golven, kleine schepen verdwijnen erachter uit het zicht.',
        'Lucht vol schuim en stuifwater, zee volledig wit, zicht zeer ernstig beperkt.',
      ],
      action: [
        'Motor of drijven; kijk naar de verwachting voor later.',
        'Ghosting; lichte zeilen.',
        'Prettig zeilen voor beginners.',
        'Ideaal zeilweer, vol tuig.',
        'Goed zeilen; kleine boten denken aan reven.',
        'Rif in het grootzeil of genua deels in; ’s nachts lifelines.',
        'Twee riffen, klein voorzeil; voor veel bemanningen de Day Skipper-grens.',
        'Diepe riffen, stormfok klaar; blijf zo mogelijk binnen.',
        'Storm: alleen als je overvallen wordt – stormzeilen, bijliggen of lenzen.',
        'Overlevingsomstandigheden voor kleine jachten.',
        'Overlevingsomstandigheden.',
        'Overlevingsomstandigheden.',
        'Overlevingsomstandigheden.',
      ],
    },
    trs: {
      title: 'Tropische wervelstorm: de halve cirkels',
      hint: 'Klik op een boot om te zien wat die moet doen.',
      dangerous: 'Gevaarlijke halve cirkel',
      navigable: 'Bevaarbare halve cirkel',
      path: 'In het pad',
      track: 'Spoor van de storm',
      advice: {
        dangerous: 'De wind ruimt als de storm passeert en de eigen beweging van de storm komt bij de wind op; je kunt in het pad gedreven worden. Neem de wind stuurboord voorlijk en maak zoveel mogelijk vaart weg van het centrum.',
        navigable: 'De wind krimpt; de beweging van de storm vermindert de wind en duwt je van het spoor af. Neem de wind stuurboord achterlijk en loop weg van het centrum.',
        path: 'Wind gelijk van richting, toenemend, barometer snel dalend. Loop met de wind stuurboord achterlijk naar de bevaarbare halve cirkel.',
      },
      adviceS: {
        dangerous: 'Zuidelijk halfrond: de gevaarlijke halve cirkel ligt LINKS van het spoor en de wind krimpt. Wind bakboord voorlijk, zoveel mogelijk vaart.',
        navigable: 'Zuidelijk halfrond: de bevaarbare halve cirkel ligt RECHTS; de wind ruimt. Wind bakboord achterlijk en wegvaren.',
        path: 'Wind gelijk van richting en toenemend. Loop met de wind bakboord achterlijk naar de bevaarbare halve cirkel.',
      },
    },
    forecast: {
      title: 'Ontcijfer het weerbericht',
      hint: 'Klik op de gemarkeerde woorden.',
      sample:
        'Gale warning issued 0505 UTC. Ravensey: northwest [[severe|severe gale 9]] [[imminent]]. Saltmere: southwest [[gale|gale 8]] expected [[soon]].\nRavensey: Northwest 7 to severe gale 9, [[backing]] west 5 [[later]]. [[veryRough|Very rough]]. Squally showers. [[good|Good]].\nSaltmere: Southwest 5 to 7, [[veering]] west 6 to gale 8 later. [[modSea|Moderate]] [[becoming]] [[rough]]. Rain then showers. Good, [[occasionally]] [[poor]].\nGannet Bank: [[variable]] 3, becoming [[cyclonic]] 5 to 7. [[slight|Slight]]. [[fog|Fog patches]]. [[moderate|Moderate]] or [[veryPoor|very poor]].',
      terms: {
        imminent: 'Imminent: binnen 6 uur na het tijdstip van uitgifte.',
        soon: 'Soon: 6 tot 12 uur na uitgifte.',
        later: 'Later: meer dan 12 uur na uitgifte.',
        veering: 'Veering (ruimend): de wind draait met de klok mee (bv. ZW → W).',
        backing: 'Backing (krimpend): de wind draait tegen de klok in (bv. W → ZW).',
        occasionally: 'Occasionally: slechts een deel van de tijd.',
        becoming: 'Becoming: een verandering tijdens de verwachtingsperiode.',
        variable: 'Variable: zwakke wind zonder vaste richting.',
        cyclonic: 'Cyclonic: de wind verandert sterk van richting omdat een depressie over of langs het gebied trekt.',
        gale: 'Gale (kracht 8): gemiddeld 34–40 kn, of vlagen van 43–51 kn.',
        severe: 'Severe gale (kracht 9): 41–47 kn.',
        good: 'Good (goed zicht): meer dan 5 zeemijl.',
        moderate: 'Moderate (matig zicht): 2 tot 5 zeemijl.',
        poor: 'Poor (slecht zicht): 1000 m tot 2 zeemijl.',
        veryPoor: 'Very poor (zeer slecht zicht): minder dan 1000 m.',
        fog: 'Fog (mist): zicht minder dan 1000 m.',
        slight: 'Slight (lichte zee): golven 0,5 tot 1,25 m.',
        modSea: 'Moderate (matige zee): golven 1,25 tot 2,5 m.',
        rough: 'Rough (ruwe zee): golven 2,5 tot 4 m.',
        veryRough: 'Very rough (zeer ruwe zee): golven 4 tot 6 m.',
      },
    },
    drills: {
      synoptic: {
        title: 'Kaartoefening',
        intro: 'Isobaren om de 4 hPa. Elke vraag gaat over de gemarkeerde punten.',
        qStrong: 'Op welk punt is de wind het hardst?',
        qDir: 'Uit welke richting waait de wind bij {p}?',
        qHigh: 'Welk punt heeft de hoogste luchtdruk?',
        qFront: 'Het koufront trekt binnenkort over {p}. Wat kan de bemanning daar verwachten?',
        frontN: ['De wind ruimt scherp, windstoten, dan stijgt de barometer en klaart het op', 'De wind krimpt en de regen houdt langzaam op', 'Windstilte en mist', 'Wind en barometer blijven gelijk'],
        frontS: ['De wind krimpt scherp (NW → ZW), windstoten, dan stijgt de barometer', 'De wind ruimt van W naar N', 'Windstilte en mist', 'Wind en barometer blijven gelijk'],
        qLow: 'Een bemanning bij {p} staat met de rug naar de wind. Aan welke kant ligt de depressie?',
        chart: 'Kaart {n} van {m}',
        whyStrong: 'De isobaren liggen het dichtst bij elkaar bij {p}: ongeveer {kn} kn.',
        whyDir: 'Langs de isobaren met de depressie {side}, naar de depressie toe gedraaid: ongeveer {dir}.',
        whyHigh: '{p} ligt het dichtst bij het hoog: ongeveer {hpa} hPa.',
        whyFrontN: 'Koufront op het noordelijk halfrond: scherpe ruiming, windstoten, drukstijging, dan heldere koude lucht.',
        whyFrontS: 'Zuidelijk halfrond: het koufront geeft een scherpe KRIMPING van NW naar ZW.',
        whyLow: 'Buys Ballot: {hemi} – depressie {side}.',
        left: 'links',
        right: 'rechts',
      },
      route: {
        title: 'Oceaanoversteek: Gran Canaria → St Lucia',
        intro: 'Kies een maand, klik op de kaart om tot 5 waypoints toe te voegen (of laad een voorbeeldroute) en druk op Vertrekken.',
        month: 'Maand',
        monthNames: { nov: 'november', feb: 'februari', jul: 'juli (orkaanseizoen)', sep: 'september (orkaanpiek)' },
        presets: { rhumb: 'Directe route', butter: 'Zuid tot de boter smelt', south: 'Te zuidelijk', north: 'Te noordelijk' },
        add: 'Klik op de kaart om waypoints toe te voegen',
        undo: 'Ongedaan maken',
        clear: 'Wissen',
        sail: 'Vertrekken!',
        days: 'Tijd',
        dayUnit: 'dagen',
        dist: 'Afstand',
        avg: 'Gemiddelde snelheid',
        calm: 'Uren in windstilte',
        gale: 'Uren in storm',
        hurricane: '⚠️ {h} uur in de orkaangordel tijdens het orkaanseizoen – een echte schipper zou nu niet gaan.',
        land: '⛔ Een leg gaat over land. Verplaats je waypoints.',
        best: 'Klassieke route deze maand: {d} dagen',
        verdict: { great: '★★★ Uitstekende route!', ok: '★★ Niet slecht – er is een snellere weg.', slow: '★ Traag – kijk waar de wind zit.' },
        legend: 'Isobaren rond het Azorenhoog · pijlen: wind · gearceerd: doldrums',
      },
      order: {
        title: 'Zet de depressie op volgorde',
        intro: 'Een depressie trekt ten noorden van je langs (noordelijk halfrond). Tik de kaarten aan in de volgorde waarin je ze ziet.',
        cards: [
          'Cirrusslierten verspreiden zich uit het westen; de barometer begint te dalen',
          'Een halo rond de zon; de wind krimpt en neemt toe uit het zuiden',
          'Grijze altostratus wordt dikker en zakt; de regen begint',
          'Aanhoudende regen uit nimbostratus, barometer dalend',
          'De wind ruimt naar zuidwest, de regen gaat over in motregen',
          'Lage stratus, motregen en slecht zicht in zachte lucht',
          'Een donkere lijn cumulonimbus: zware regen en windstoten',
          'De wind ruimt naar noordwest, de barometer stijgt snel, heldere koude lucht met buien',
        ],
        ok: 'Perfecte volgorde!',
        bad: 'Niet helemaal – {n} kaarten op de goede plek. Vergelijk met de juiste volgorde hieronder.',
        reset: 'Opnieuw',
      },
      beaufortGuess: { title: 'Raad de kracht', intro: 'Kijk naar de zee en de windmeter. Welke Beaufortkracht is het?', q: 'Welke kracht?' },
      cloudGuess: { title: 'Wolkenspotter', intro: 'Noem de wolk en zeg dan wat ze je vertelt.', q: 'Welke wolk is dit?', q2: 'Wat betekent ze meestal?' },
      buysDrill: { title: 'Vind de depressie', intro: 'De pijl wijst waarheen de wind waait. Klik op het kompaspunt waar de depressie ligt.', q: 'Waar ligt de depressie?' },
      trsDrill: {
        title: 'Ontsnap aan de storm',
        intro: 'Een tropische wervelstorm en je boot. In welke halve cirkel zit je, en wat doe je?',
        q: 'Waar is de boot?',
        qAction: 'Hoe zeil je?',
        actions: ['Wind stuurboord voorlijk', 'Wind stuurboord achterlijk', 'Wind bakboord voorlijk', 'Wind bakboord achterlijk'],
      },
      gonogo: {
        title: 'Gaan of niet gaan?',
        intro: 'Jij bent de schipper. Lees de situatie en beslis.',
        items: [
          {
            q: 'Dagtocht van 25 mijl met een nieuwe bemanning op een jacht van 9 m. Verwachting: "SW 4 or 5, increasing 6 to 7 later. Rain then showers." Het is 0800, de tocht duurt 5 uur.',
            options: ['Nu vertrekken met een rif, vroeg in de middag aankomen, uitwijkhaven gepland', 'Om 1600 vertrekken als het opgeklaard is', 'Vertrekken en alle riffen eruit om sneller te zijn', 'Afzeggen – kracht 6 later betekent niet zeilen'],
            answer: 0,
            why: '"Later" is meer dan 12 uur verder: je bent binnen voor de 6–7. Rif voor de vlagen en houd een uitwijkhaven achter de hand.',
          },
          {
            q: 'Dichte zeemist bij de haveningang, wind ZW 3. Je route kruist een druk scheepvaartgebied. Verwachting: "Fog patches, becoming good later."',
            options: ['In de haven wachten tot het zicht verbetert', 'Gaan – de wind blaast de mist weg', 'Snel gaan om korter in de vaarbaan te zijn', 'Gaan en alleen op AIS vertrouwen'],
            answer: 0,
            why: 'Advectiemist verdwijnt niet door wind. Een vaarbaan oversteken in mist is een groot risico – wacht op "becoming good".',
          },
          {
            q: 'De barometer is de afgelopen 3 uur 7 hPa gedaald, de wind krimpt naar ZO en neemt toe, vanochtend cirrostratus en een halo. Je bent 15 mijl van beschutting.',
            options: ['Nu naar beschutting gaan en vroeg reven', 'Doorgaan – de verwachting vanochtend was goed', 'Ankeren in de open baai', 'Afwachten wat de wind doet'],
            answer: 0,
            why: 'Meer dan 6 hPa in 3 uur waarschuwt voor storm. Alle tekenen van een warmtefront zijn er – handel vroeg.',
          },
          {
            q: 'Bestendig hoog, zonnige ochtend, zwakke aflandige wind 5 kn. Verwachting voor de middag: "Sea breezes developing". Je wilt voor een strand ankeren om te lunchen.',
            options: ['Prima – maar reken ’s middags op een aanlandige zeewind van 10–15 kn: controleer of de ankerplaats daarin veilig is', 'Prima – de wind blijft de hele dag aflandig', 'Afzeggen – zeewind is gevaarlijk', 'Zo dicht mogelijk bij het strand ankeren'],
            answer: 0,
            why: 'De zeewind maakt van de ankerplaats ’s middags een lagerwal. Plan de zwaaicirkel en een uitweg.',
          },
        ],
      },
    },
  },
}
