import type { LessonSet } from './lessons'

export const lessonsNl: LessonSet = {
  sails: {
    title: 'Zeilen: hijsen, reven, overstag en gijpen',
    summary: 'Welke lijn wat doet, de juiste volgorde voor hijsen, reven en strijken, koersen ten opzichte van de wind, de timing van de bemanning bij overstag en gijpen, en onder zeil een boei oppakken.',
    sections: [
      {
        h: 'De lijnen die de zeilen bedienen',
        blocks: [
          {
            list: [
              '**Val**: hijst een zeil. Vastgehouden door een **stopper** en strakgezet op een **lier**.',
              '**Schoot**: trimt een zeil in en uit. Grootschoot voor het grootzeil, twee fokkenschoten voor de fok.',
              '**Neerhouder (hale-neer)**: trekt de giek omlaag zodat die niet omhoog komt.',
              '**Kraanlijn**: houdt de giek op als het grootzeil hem niet draagt (hijsen, reven, strijken).',
              '**Rollijn**: rolt de fok om het voorstag op.',
              '**Reeflijn**: trekt het nieuwe schoothoorn van een gereefd grootzeil naar de giek; de **voorlijkkous** gaat over de **reefhaak**.',
            ],
          },
          { tip: 'Vuistregel: alles wat het zeil tegenhoudt (schoot, neerhouder) wordt **gevierd** voordat het zeil omhoog of omlaag gaat, en daarna weer **strakgezet**.' },
        ],
      },
      {
        h: 'Het grootzeil hijsen – de volgorde',
        blocks: [
          {
            steps: [
              'Haal de zeilhoes eraf.',
              'Haal de sjorringen los **en** draai de boot dicht bij de wind (niet recht erin).',
              'Vier de grootschoot **en** de neerhouder – het zeil moet kunnen klapperen.',
              'Hijs aan het val en let op haken. Lier het laatste stuk tot de plooien uit het voorlijk zijn.',
              'Sluit de valstopper.',
              'Trek de grootschoot aan **en** vier de kraanlijn.',
              'Zet de neerhouder strak **en** schiet het val op.',
              'Pas nu afvallen en zeilen.',
            ],
          },
          { tip: 'Stappen met **en** mogen in willekeurige volgorde. Al het andere moet de lijst volgen.' },
          { game: 'rig' },
        ],
      },
      {
        h: 'Fok: uitrollen en oprollen',
        blocks: [
          {
            list: [
              '**Uitrollen**: vier de rollijn gecontroleerd → trek aan de **lijwaartse** fokkenschoot (de kant weg van de wind) → ruim op. Wind van stuurboord = trek aan de **bakboord**schoot.',
              '**Oprollen**: vier de fokkenschoot maar houd er wat spanning op → trek de rollijn → ruim op. Gooi de schoot nooit los: de fok klappert en rolt los op.',
            ],
          },
        ],
      },
      {
        h: 'Reven en het grootzeil strijken',
        blocks: [
          {
            steps: [
              'Klik je harnas vast (je gaat naar de mast).',
              'Stuur dicht bij de wind.',
              'Vier de neerhouder en de grootschoot.',
              'Neem de kraanlijn door zodat de giek niet valt.',
              'Vier het val tot aan het rif.',
              'Haak de voorlijkkous op de reefhaak.',
              'Hijs het val weer strak.',
              'Lier de reeflijn door (het zeil moet nog klapperen).',
              'Vier de kraanlijn, schoot aan, neerhouder strak.',
              'Bind het losse zeil met platte knopen en ruim de lijnen op.',
              'Val af en zeil.',
            ],
          },
          { ex: { title: 'Het grootzeil strijken', lines: ['Stuur dicht bij de wind.', 'Kraanlijn door en neerhouder gevierd.', 'Vier het val.', 'Vouw het zeil op de giek.', 'Sjorringen om en grootschoot aan.', 'Lijnen opruimen en de hoes erop.'] } },
        ],
      },
      {
        h: 'Koersen ten opzichte van de wind',
        blocks: [
          { p: 'Een jacht kan niet hoger dan ongeveer **45°** van de wind zeilen (de dode hoek). De hoek tussen boeg en wind (TWA) bepaalt de koers:' },
          {
            table: {
              head: ['TWA', 'Koers', 'Zeilen'],
              rows: [
                ['0–45°', 'Dode hoek', 'klapperen'],
                ['45–60°', 'Aan de wind', 'strak'],
                ['60–80°', 'Halve wind dichtbij', 'iets gevierd'],
                ['80–105°', 'Halve wind', 'half uit'],
                ['105–155°', 'Ruime wind', 'ver uit'],
                ['155–180°', 'Voor de wind', 'helemaal uit'],
              ],
            },
          },
          { p: 'Wind over **stuurboord** = **stuurboordboeg**, de giek staat naar bakboord uit.' },
          { widget: 'points' },
          { p: '**Tell-tales** op de fok: de loefwaartse wappert → schoot aan of afvallen; de lijwaartse wappert → schoot vieren. Beide stromen = goed getrimd.' },
        ],
      },
      {
        h: 'Overstag: de timing van de bemanning',
        blocks: [
          {
            steps: [
              'Schipper: "Klaar om te wenden!" → leg de **nieuwe** schoot om zijn lier (2–3 slagen met de klok mee).',
              'Haal de **werkende** schoot uit de selftailer, klaar om los te gooien.',
              'Roep pas nu "Klaar!".',
              'Schipper: "Ree!" – de boeg draait in de wind.',
              'Als de boeg **in de wind** staat (TWA tussen ongeveer +12° en −12°) gooi je de oude schoot los.',
              'Trek de nieuwe schoot **snel** door, voordat de fok vult.',
              'Lier om te trimmen: stop als beide tell-tales stromen. Verder trekt het zeil over.',
            ],
          },
          { warn: 'Te vroeg: de fok klappert en de boot valt stil. Te laat: de fok staat bak en duwt de boeg te ver door.' },
        ],
      },
      {
        h: 'Gecontroleerde gijp',
        blocks: [
          {
            steps: [
              'Schipper: "Klaar om te gijpen!" → haal de bulletalie los.',
              'Haal het grootzeil midscheeps (giek binnen ongeveer 15° van het midden).',
              'Roep "Klaar!" – het hek gaat door de wind en de giek komt rustig over.',
              'Vier het grootzeil snel aan de nieuwe kant (anders schiet de boot in de wind).',
              'Schoot de fok aan de nieuwe kant – nadat de giek over is.',
            ],
          },
          { warn: 'Een giek die van ver uit overkomt is een **klapgijp**: gevaarlijk voor bemanning en tuig.' },
          { game: 'tack' },
        ],
      },
      {
        h: 'Onder zeil een boei oppakken',
        blocks: [
          { p: 'Zonder motor rem je door **wind te lossen**. Het grootzeil kan alleen lossen als de wind **voorlijker dan ongeveer dwars** inkomt (TWA onder ~95°). Met de wind van achteren ligt het grootzeil tegen de zalingen en blijft het trekken.' },
          {
            steps: [
              'Bepaal je eindkoers: **tegen de stroom in**; zonder stroom tegen de wind in.',
              'Kijk waar de wind op die koers vandaan komt.',
              'Wind voorlijker dan dwars (wind met stroom, of geen stroom) → kom binnen op **alleen het grootzeil**, halve wind dichtbij (~60° TWA), en vier om af te remmen.',
              'Wind achterlijker dan dwars (**wind tegen stroom**) → strijk het grootzeil, kom binnen op **alleen de fok** en rol die op om af te remmen.',
              'Kom met de boeg bij de boei aan op wandeltempo (minder dan 0,8 kn over de grond). Pak hem op aan de loefboeg.',
            ],
          },
          { tip: 'In het spel drie sterren = het juiste zeilplan en geen enkele keer "te snel". Schiet je door, draai een rondje en kom langzamer binnen.' },
          { game: 'buoy' },
        ],
      },
    ],
    check: [
      { q: 'Wind van stuurboord. Met welke schoot rol je de fok uit?', options: ['De bakboord(lij)schoot', 'De stuurboordschoot', 'De rollijn', 'De grootschoot'], answer: 0, why: 'De fok staat aan de kant weg van de wind: bij wind van stuurboord is dat bakboord.' },
      { q: 'Wanneer gooi je bij overstag de oude fokkenschoot los?', options: ['Als de boeg door de wind gaat', 'Bij "Klaar om te wenden"', 'Als de fok aan de nieuwe kant vol staat', 'Als de giek overkomt'], answer: 0, why: 'Rond in de wind (TWA ±12°): te vroeg valt de boot stil, te laat staat de fok bak.' },
      { q: 'Wind tegen stroom bij een meerboei. Welk zeil?', options: ['Alleen de fok', 'Alleen het grootzeil', 'Beide zeilen', 'Geen, laat je afdrijven'], answer: 0, why: 'Tegen de stroom in heb je de wind van achteren; alleen de rolfok kun je verkleinen.' },
      { q: 'Wat vier je voordat je het grootzeil hijst?', options: ['Grootschoot en neerhouder', 'Kraanlijn', 'Fokkenschoten', 'Achterstag'], answer: 0, why: 'Anders vult het zeil zich tijdens het hijsen en loopt het vast.' },
    ],
  },

  ropes: {
    title: 'Knopen, kikkers en landvasten',
    summary: 'De acht knopen die je nodig hebt, beleggen op een kikker, lieren en stoppers, en welke landvasten en stootwillen een boot bij elk weertype vasthouden.',
    sections: [
      {
        h: 'Een knoop voor elke klus',
        blocks: [
          {
            table: {
              head: ['Knoop', 'Klus'],
              rows: [
                ['Paalsteek', 'Een vast oog: fokkenschoten aan het schoothoorn, een oog om af te meren'],
                ['Mastworp', 'Stootwillen aan de zeereling, snelle tijdelijke steek'],
                ['Achtknoop', 'Stopper aan het eind van een schoot zodat die niet uit een blok loopt'],
                ['Round turn & two half hitches', 'Lijn aan een ring of paal; los te maken onder belasting'],
                ['Schootsteek', 'Twee lijnen verbinden, ook van verschillende dikte'],
                ['Platte knoop', 'Reefknuttels en sjorringen – nooit voor belasting'],
                ['Rolsteek', 'Een belaste lijn vastgrijpen om de spanning eraf te halen (kink op de lier)'],
                ['Beleg op de kikker', 'Een lijn vastzetten op een kikker'],
              ],
            },
          },
          { tip: 'Ezelsbruggetjes: **oog = paalsteek**, **stootwil = mastworp**, **eind van een schoot = achtknoop**, **ring = round turn**, **twee lijnen = schootsteek**.' },
          { game: 'knots' },
        ],
      },
      {
        h: 'Beleggen op een kikker: O – X – O',
        blocks: [
          {
            steps: [
              '**O**: leid de lijn naar de verste hoorn en neem een volle **slag rond** de voet. Die neemt de last en laat je vieren of vasthouden.',
              '**X**: kruis over de bovenkant in een **acht** – één, en voor de zekerheid een tweede.',
              '**O**: eindig met een **kruisslag** (een omgedraaide acht).',
            ],
          },
          { warn: 'Begin nooit met de kruisslag (loopt vast onder belasting) en draai nooit veel slagen – dan krijg je hem in nood niet los.' },
        ],
      },
      {
        h: 'Lieren en stoppers',
        blocks: [
          {
            list: [
              'Leg een lijn **met de klok mee** 2–3 slagen om de lier, houd spanning, vingers weg van de trommel.',
              'Draai een lijn nooit om je hand.',
              'Een stopper onder belasting openen: lier eerst een beetje zodat de lier de last houdt, open dan.',
            ],
          },
        ],
      },
      {
        h: 'Landvasten en wat ze doen',
        blocks: [
          {
            table: {
              head: ['Lijn', 'Van → naar', 'Voorkomt dat de boot…'],
              rows: [
                ['Voorlijn', 'voorkikker → walkikker **vóór** de boeg', 'naar achteren gaat, boeg afwaait'],
                ['Achterlijn', 'achterkikker → walkikker **achter** het hek', 'naar voren gaat, hek afwaait'],
                ['Voorspring', 'voorkikker → walkikker **naar achteren**, ongeveer midscheeps', 'naar voren schuift'],
                ['Achterspring', 'achterkikker → walkikker **naar voren**, ongeveer midscheeps', 'naar achteren schuift'],
                ['Dwarslijn', 'midscheeps → recht naar de wal', 'zijwaarts weggaat (alleen kort)'],
              ],
            },
          },
          { p: '**Springen** voorkomen dat de boot naar voren en achteren schuift. **Voor- en achterlijn** houden de uiteinden binnen. Een lijn is zo goed als zijn hoek: hoe langer en vlakker, hoe beter.' },
        ],
      },
      {
        h: 'Stootwillen',
        blocks: [
          {
            list: [
              'Altijd een stootwil bij het **midden** (breedste punt).',
              'Aanlandige wind duwt de hele romp tegen de steiger: stootwillen bij **boeg, midden en achterhoek**.',
              'Hang ze op de hoogte van de steiger of de andere boot.',
            ],
          },
        ],
      },
      {
        h: 'In het spel Lijnen & Stootwillen',
        blocks: [
          {
            table: {
              head: ['Weer', 'Lijnen (minstens)', 'Stootwillen'],
              rows: [
                ['Lichte bries', 'voorlijn + achterlijn', 'midden'],
                ['Schuivende stroom', 'voorlijn, achterlijn, voorspring, achterspring', 'midden'],
                ['Aanlandige storm', 'voorlijn + achterlijn', 'boeg, midden, achterhoek'],
                ['Aflandige wind', 'voorlijn, achterlijn, voorspring, achterspring', 'midden'],
              ],
            },
          },
          { p: 'De kikkers aan boord zitten voor, midscheeps en achter. Kies de walkikker naar de richting waarin de lijn moet lopen: een voorlijn naar een kikker vóór de boeg, een voorspring naar een kikker verder naar achteren.' },
          { tip: 'Geslaagd = de boot beweegt minder dan 1,2 m, draait minder dan 16° en schuurt nergens. Drie sterren = ook alle aanbevolen lijnen en stootwillen.' },
          { game: 'lines' },
        ],
      },
    ],
    check: [
      { q: 'Met welke knoop hang je een stootwil aan de zeereling?', options: ['Mastworp', 'Platte knoop', 'Schootsteek', 'Achtknoop'], answer: 0, why: 'Snel gelegd en makkelijk in hoogte te verstellen.' },
      { q: 'Welke lijnen voorkomen dat een afgemeerde boot heen en weer schuift?', options: ['De springen', 'Dwarslijnen', 'Stootwillen', 'Alleen de voorlijn'], answer: 0, why: 'Springen lopen langs de romp naar voren en achteren en stoppen het schuiven.' },
      { q: 'O-X-O op een kikker betekent…', options: ['Slag rond, achten, kruisslag', 'Kruisslag, slag rond, kruisslag', 'Drie slagen rond', 'Paalsteek over de hoorn'], answer: 0, why: 'De slag houdt de last, de achten zetten vast, de kruisslag borgt.' },
    ],
  },

  power: {
    title: 'Manoeuvreren op de motor',
    summary: 'Waarom een jacht stuurt zoals het stuurt: schroefstroom, draaipunt, schroefeffect, wind en stroom – en hoe je aanlegt, wegvaart op een spring en met het hek naar de kade afmeert.',
    sections: [
      {
        h: 'Geen waterstroom, geen sturing',
        blocks: [
          {
            list: [
              'Het roer werkt alleen als er water langs stroomt.',
              '**Vooruit**: de schroef blaast water recht over het roer (schroefstroom). Zelfs stilliggend draait een korte stoot vooruit de boot. **Eerst roer, dan gas.**',
              '**Achteruit**: geen schroefstroom over het roer. Je stuurt pas als de boot echt achteruit vaart.',
              'Een jacht houdt lang vaart: zet op tijd in neutraal.',
            ],
          },
        ],
      },
      {
        h: 'Draaipunt',
        blocks: [
          {
            list: [
              'Vooruit draait de boot rond een punt op ongeveer een derde vanaf de boeg (bij de mast): het **hek zwaait uit** – let op bij andere boten.',
              'Achteruit schuift het draaipunt naar achteren: nu zwaait de **boeg** het meest.',
            ],
          },
        ],
      },
      {
        h: 'Schroefeffect',
        blocks: [
          { p: 'Een schroef duwt het hek ook opzij, het sterkst als je **vanuit stilstand achteruit** gaat. De meeste jachten hebben een rechtse schroef: achteruit **zet het hek naar bakboord** (de boeg draait naar stuurboord).' },
          {
            list: [
              '**Gebruik het**: met bakboord langszij trekt de stoot achteruit die je stopt ook het hek naar de steiger.',
              '**Verwacht het**: recht achteruit varen gaat eerst met het hek naar bakboord. Heb je achteruitvaart, corrigeer dan met wat roer naar stuurboord.',
              '**Keren op eigen lengte** (naar stuurboord): roer hard naar stuurboord en laten staan. Korte stoot vooruit – de boeg draait. Korte stoot achteruit – de boot stopt en het schroefeffect zet het hek verder naar bakboord. Herhaal.',
            ],
          },
          { tip: 'In het spel toont een rode pijl bij het hek het schroefeffect als de hulplaag aan staat.' },
        ],
      },
      {
        h: 'Wind en stroom',
        blocks: [
          {
            list: [
              'Een stilliggende boot drijft met de wind mee, en de **boeg waait als eerste af** (meer windvang, minder grip).',
              'Stroom neemt je mee als een lopende band. Leg **tegen de stroom in** aan: traag over de grond, maar water langs het roer.',
              'Lees de signalen: vlaggen, rimpels, water dat zich ophoopt rond palen, afgemeerde boten die op de stroom liggen.',
            ],
          },
        ],
      },
      {
        h: 'Langszij aanleggen',
        blocks: [
          {
            steps: [
              'Stootwillen en lijnen klaar, bemanning gebriefd.',
              'Nader langzaam onder een kleine hoek (20–30°), gericht op de voorkant van de ligplaats.',
              'Op tijd neutraal – laat de boot glijden.',
              'Dichtbij parallel draaien; een korte stoot achteruit stopt de boot.',
            ],
          },
          {
            table: {
              head: ['Omstandigheid', 'Techniek'],
              rows: [
                ['Geen wind', 'Standaard nadering; de stoot achteruit trekt het hek in (bakboord langszij).'],
                ['Aanlandige wind', 'Stop parallel 1–2 m ervan af, bovenwinds van het gat, en laat de wind je aandrukken.'],
                ['Aflandige wind', 'Kom vastberadener binnen, op het voorste derde van de ligplaats; snel lijnen aan wal.'],
                ['Stroom', 'Draai met de kop in de stroom; lig stil over de grond en laat je zijwaarts naar binnen zetten (ferry gliding).'],
              ],
            },
          },
        ],
      },
      {
        h: 'Vertrekken: wegvaren op een spring',
        blocks: [
          { p: 'Vastgedrukt door aanlandige wind met boten voor en achter je? Zwaai één kant uit met een spring.' },
          {
            steps: [
              'Gooi voor- en achterlijn los, houd de **voorspring**. Een stootwil bij de boeg.',
              'Roer **naar** de steiger en stevig vooruit: de spring houdt de boeg, het hek zwaait uit.',
              'Staat het hek goed uit (30–40°): neutraal, dan achteruit.',
              'Gooi de spring los en vaar achteruit vrij, dan vooruit weg.',
            ],
          },
          { tip: 'Een **achterspring** werkt andersom: vaar er achteruit tegenaan en de boeg zwaait uit.' },
        ],
      },
      {
        h: 'Med-style met het hek naar de kade',
        blocks: [
          {
            steps: [
              'Lijn vroeg uit, hek naar het gat.',
              'Krijg achteruitvaart en stuur met kleine roerhoeken.',
              'Laat het anker vallen op ongeveer **3–4 bootlengtes (30–40 m)** van de kade.',
              'Blijf achteruit varen, stop met een tikje vooruit, lijnen aan wal, ketting strak.',
            ],
          },
        ],
      },
      {
        h: 'In het spel Havenmanoeuvres',
        blocks: [
          {
            list: [
              'Toetsen: ↑/↓ gas in stappen van 10 %, ←/→ roer, Spatie = neutraal, C = midscheeps, P = pauze.',
              'De stippellijn laat zien waar je over 8 seconden bent met de huidige bediening – gebruik hem om te plannen.',
              'Een steiger met stootwillen raken onder 0,3 m/s is gratis, tot 0,6 m/s telt als tik, sneller is een crash. Andere boten en muren: alleen zachtjes.',
              'Finish: stop in de groene zone in de richting van de groene pijl en lig 1,5 seconde stil.',
              'Drie sterren: geen tikken en binnen de normtijd.',
            ],
          },
          { game: 'harbour' },
        ],
      },
    ],
    check: [
      { q: 'Rechtse schroef, vanuit stilstand achteruit. Het hek gaat…', options: ['naar bakboord', 'naar stuurboord', 'nergens heen', 'naar voren'], answer: 0, why: 'Het schroefeffect zet het hek achteruit naar bakboord.' },
      { q: 'Je wilt stilliggend draaien. Wat eerst?', options: ['Roer om, dan een korte stoot vooruit', 'Vol vooruit, dan roer', 'Achteruit met het roer midscheeps', 'Wachten op wind'], answer: 0, why: 'De schroefstroom raakt het gedraaide roer en draait de boot op kleine ruimte.' },
      { q: 'Vooruit varen tegen welke lijn zwaait het hek uit?', options: ['Voorspring', 'Achterspring', 'Dwarslijn', 'Achterlijn'], answer: 0, why: 'De voorspring houdt de boeg; de duw vooruit zwaait het hek van de steiger.' },
    ],
  },

  tides: {
    title: 'Getijden, eenvoudig uitgelegd',
    summary: 'Hoog- en laagwater, getijverschil, diepte, de twaalfdenregel, getijstromen en getijdenpoorten – stap voor stap met uitgewerkte voorbeelden.',
    sections: [
      {
        h: 'Wat is het getij?',
        blocks: [
          { p: 'Twee keer per dag stijgt en daalt de zee. Het hoogste punt is **hoogwater (HW)**, het laagste **laagwater (LW)**. Van LW naar HW duurt ongeveer **6 uur**, en van HW terug naar LW ook 6.' },
          {
            list: [
              '**Waterhoogte**: hoeveel de zee nu boven het kaartnulpunt staat (uit de getijtafel).',
              '**Getijverschil** = HW-hoogte − LW-hoogte.',
              '**Kaartdiepte**: de diepte op de kaart, gemeten vanaf het kaartnulpunt (ongeveer het laagst mogelijke water).',
              '**Waterdiepte** = kaartdiepte + waterhoogte.',
              '**Droogvalhoogte**: een onderstreept getal op de kaart. Die plek ligt bij kaartnul zoveel meter **boven** water.',
            ],
          },
          { ex: { title: 'De diepte op dit moment', lines: ['Kaartdiepte 2,0 m, waterhoogte 3,0 m.', 'Diepte = 2,0 + 3,0 = **5,0 m**.', 'Een bank die 1,5 m droogvalt, waterhoogte 3,8 m: diepte = 3,8 − 1,5 = **2,3 m**.'] } },
        ],
      },
      {
        h: 'De twaalfdenregel',
        blocks: [
          { p: 'Het water stijgt niet gelijkmatig: eerst langzaam, in het midden snel, aan het eind weer langzaam. De twaalfdenregel verdeelt het verschil in 12 gelijke delen:' },
          {
            table: {
              head: ['Uur na LW', 'Stijgt dit uur', 'In totaal gestegen'],
              rows: [
                ['1e', '1/12', '1/12'],
                ['2e', '2/12', '3/12'],
                ['3e', '3/12', '6/12'],
                ['4e', '3/12', '9/12'],
                ['5e', '2/12', '11/12'],
                ['6e', '1/12', '12/12 = HW'],
              ],
            },
          },
          { tip: 'Onthoud **1 – 2 – 3 – 3 – 2 – 1**. Afgaand water werkt precies zo, vanaf HW omlaag.' },
          {
            steps: [
              'Zoek de tijden en hoogtes van LW en HW op.',
              'Verschil = HW − LW. Eén twaalfde = verschil ÷ 12.',
              'Tel de hele uren van LW tot jouw tijdstip.',
              'Lees het totaal aantal twaalfden voor die uren (1, 3, 6, 9, 11, 12).',
              'Hoogte = LW-hoogte + twaalfden × één twaalfde.',
            ],
          },
          { ex: { title: 'Waterhoogte om 11:00', lines: ['LW 07:00 0,8 m, HW 13:00 5,0 m.', 'Verschil = 5,0 − 0,8 = 4,2 m → één twaalfde = **0,35 m**.', '11:00 is 4 uur na LW → **9/12**.', 'Stijging = 9 × 0,35 = 3,15 m.', 'Hoogte = 0,8 + 3,15 = **3,95 m**.'] } },
          { widget: 'twelfths' },
        ],
      },
      {
        h: 'Wanneer staat er genoeg water?',
        blocks: [
          { p: 'Om over een drempel te varen of een haven in te gaan heb je een minimale diepte nodig. Reken uit welke waterhoogte je nodig hebt en zoek op wanneer het getij die bereikt.' },
          {
            steps: [
              'Benodigde hoogte = droogvalhoogte + diepgang + veiligheidsmarge (boven een plek met kaartdiepte: diepgang + marge − kaartdiepte).',
              'Trek de LW-hoogte eraf: zoveel moet het water stijgen.',
              'Deel door één twaalfde: zoveel twaalfden zijn dat.',
              'Zoek in de tabel na welk uur je er zoveel hebt.',
            ],
          },
          {
            ex: {
              title: 'Over de drempel van Kingsport',
              lines: [
                'De drempel valt 1,5 m droog, diepgang 1,8 m, marge 0,5 m → nodig 1,5 + 1,8 + 0,5 = **3,8 m**.',
                'Benodigde stijging boven LW: 3,8 − 0,8 = 3,0 m → 3,0 ÷ 0,35 ≈ **8,6 twaalfden**.',
                'Na 3 uur: 6/12 = 2,9 m – te weinig. Na 4 uur: 9/12 = 3,95 m – genoeg.',
                'De drempel gaat dus kort vóór **LW + 4 u ≈ 10:50** open.',
                'Met afgaand water sluit hij even lang vóór het volgende LW: rond **HW + 2 u ≈ 15:10**.',
              ],
            },
          },
          { warn: 'Houd altijd marge. Golven, hoge luchtdruk en aflandige wind kunnen het water lager maken dan voorspeld.' },
        ],
      },
      {
        h: 'Getijstromen',
        blocks: [
          { p: 'Terwijl het water stijgt en daalt, stroomt het ook: de **getijstroom**. De richting is waar het water **naartoe** stroomt (de zet), de snelheid in knopen.' },
          {
            list: [
              'Een **stroomatlas** of de **getijruiten** op de kaart geven richting en snelheid voor elk uur vóór en na HW.',
              'Snelheid over de grond = bootsnelheid ± stroom: 5 kn met 2 kn **mee** = 7 kn; met 2 kn **tegen** = maar 3 kn.',
              '**Springtij** (rond nieuwe en volle maan): groot verschil, sterke stroom. **Doodtij** (halve maan): klein verschil, zwakke stroom.',
            ],
          },
          { ex: { title: 'Mee of tegen?', lines: ['18 NM met 5 kn in stilstaand water = 3 u 36 min.', 'Met gemiddeld 2 kn stroom mee: 7 kn → ongeveer **2 u 35 min**.', 'Met 2 kn tegen: 3 kn → **6 uur**!'] } },
        ],
      },
      {
        h: 'Getijdenpoorten: de vertrektijd kiezen',
        blocks: [
          { p: 'Een getijdenpoort is een plek waar je alleen op bepaalde tijden langs kunt: een drempel, een sluis, een kaap met sterke stroom. Plan **terug** vanaf de poort.' },
          {
            steps: [
              'Zoek het venster waarin je erlangs kunt (genoeg water of stroom mee).',
              'Schat hoe lang de tocht duurt met de verwachte stroom.',
              'ETD (vertrek) = aankomsttijd − vaartijd.',
              'Controleer de stroom onderweg en schuif iets eerder of later om zo lang mogelijk stroom mee te hebben.',
            ],
          },
          {
            ex: {
              title: 'De tocht naar Kingsport plannen (18 NM, 5 kn, HW 13:00)',
              lines: [
                'Venster op de drempel: ongeveer 10:50 – 15:10.',
                'De stroom loopt mee van HW−5 tot HW (08:00–13:00), het sterkst van HW−3 tot HW−2 (10:00–11:00). Na HW kentert hij.',
                'Vertrek **09:00** → gemiddeld ≈ 6,9 kn → aankomst ≈ 11:37 bij 4,4 m water: **je komt binnen**, de hele weg met stroom mee.',
                'Vertrek 06:00 → je begint met stroom tegen en komt om 09:27 aan bij maar 2,3 m: de drempel is nog te ondiep.',
                'Vertrek 12:00 → de stroom kentert, je komt om 16:12 aan bij 2,7 m: te laat.',
              ],
            },
          },
          { tip: 'In het spel drie sterren = genoeg water op de drempel **en** een gemiddelde snelheid van minstens 6,6 kn (het grootste deel met stroom mee). Probeer vertrektijden tussen 08:30 en 10:00.' },
          { game: 'passage' },
        ],
      },
      {
        h: 'Getij en ankeren',
        blocks: [
          { p: 'Voor anker verandert de diepte de hele nacht. Gebruik de diepte bij **hoogwater** voor de kettinglengte en controleer dat er bij het **laagste** water rondom je zwaaicirkel nog genoeg water staat. Zie de les over ankeren.' },
          { game: 'anchor' },
        ],
      },
    ],
    check: [
      { q: 'LW 06:00 1,0 m, HW 12:00 4,6 m. Waterhoogte om 09:00?', options: ['2,8 m', '2,2 m', '3,7 m', '1,9 m'], answer: 0, why: 'Verschil 3,6 m, één twaalfde 0,3 m. 3 uur na LW = 6/12 = 1,8 m. 1,0 + 1,8 = 2,8 m.' },
      { q: 'Kaartdiepte 1,2 m, waterhoogte 2,5 m. Waterdiepte?', options: ['3,7 m', '1,3 m', '2,5 m', '1,2 m'], answer: 0, why: 'Diepte = kaartdiepte + waterhoogte.' },
      { q: 'In welke uren stijgt het water het snelst?', options: ['3e en 4e', '1e en 6e', '2e en 5e', 'Allemaal even snel'], answer: 0, why: '1-2-3-3-2-1: drie twaalfden in elk van de middelste uren.' },
      { q: 'Je boot vaart 5 kn, de stroom is 1,5 kn tegen. Snelheid over de grond?', options: ['3,5 kn', '6,5 kn', '5 kn', '1,5 kn'], answer: 0, why: 'Stroom tegen trek je af: 5 − 1,5 = 3,5 kn.' },
    ],
  },

  anchoring: {
    title: 'Ankeren: kettinglengte en zwaairuimte',
    summary: 'Hoeveel ketting je steekt, hoe groot je zwaaicirkel is en hoe je zeker weet dat je bij laagwater nog drijft – met een uitgewerkt voorbeeld.',
    sections: [
      {
        h: 'Hoe een anker houdt',
        blocks: [
          { p: 'Een anker graaft zich in als de trek bijna horizontaal is. Hoe meer ketting, hoe vlakker de trek. Daarom is de **verhouding** (scope) belangrijk.' },
          {
            list: [
              '**Verhouding** = kettinglengte ÷ waterdiepte.',
              'Alleen ketting: minstens **4 : 1**. Lijn met wat ketting: minstens **6 : 1**.',
              'Gebruik de diepte bij **hoogwater** (de diepste), anders wordt de verhouding kleiner als het water stijgt.',
              'Bij twijfel meer steken – zolang je niet tegen anderen aan zwaait.',
            ],
          },
        ],
      },
      {
        h: 'Zwaaicirkel',
        blocks: [
          { p: 'De boot zwaait rond het anker bij elke winddraaiing en kentering. De straal is ongeveer de horizontale kettinglengte plus een halve bootlengte – grofweg **ketting + 5 m** voor een jacht van 10 m.' },
          {
            list: [
              'Meer ketting = grotere cirkel.',
              'Bij laagwater ligt de ketting vlakker, de cirkel wordt iets groter.',
              'Elk punt in de cirkel moet bij **laagwater** genoeg water hebben, en vrij zijn van rotsen en van de cirkels van andere boten.',
            ],
          },
          {
            ex: {
              title: 'Is dit een goede plek?',
              lines: [
                'Kaartdiepte 4,0 m. Waterhoogte nu 4,2 m, vannacht laagst 0,6 m. Diepgang 1,8 m.',
                'Diepte nu: 4,0 + 4,2 = 8,2 m → ketting minstens 4 × 8,2 = **33 m** → neem 35 m.',
                'Zwaaistraal ≈ 35 + 5 = **40 m**.',
                'Laagwater hier: 4,0 + 0,6 = 4,6 m → **2,8 m** onder de kiel ✔.',
                'Nu de hele cirkel: elk punt binnen 40 m met een kaartdiepte onder 1,8 + 0,5 − 0,6 = **1,7 m** zet je aan de grond of te dichtbij.',
              ],
            },
          },
          { widget: 'scope' },
        ],
      },
      {
        h: 'Anker laten vallen en controleren',
        blocks: [
          {
            steps: [
              'Brief de bemanning; vaar langzaam langs de plek om diepte en ruimte te controleren.',
              'Nader tegen de wind in (of tegen de stroom als die sterker is) en stop.',
              'Laat het anker en ongeveer een derde van de ketting vallen, deins of vaar achteruit en steek de rest.',
              'Zet het anker met een korte stoot achteruit.',
              'Controleer met een enslijn of twee peilingen dat je niet krabt. Overdag de ankerbal, ’s nachts het ankerlicht.',
            ],
          },
        ],
      },
      {
        h: 'In het spel Ankerbaai',
        blocks: [
          {
            list: [
              'Beweeg de muis over de kaart om de kaartdiepte te lezen; onderstreepte dieptecijfers vallen droog.',
              'Het kader toont de waterhoogte nu, het laagste water vannacht en de windrichtingen door de nacht. Je boot ligt altijd **benedenwinds** van het anker.',
              'Verhouding onder **4 : 1** → het anker krabt als de wind na ongeveer 3 uur toeneemt.',
              'De blauwe cirkel is jouw zwaairuimte; de oranje gestippelde cirkels horen bij de andere boten – ze mogen niet overlappen.',
              'Drie sterren: verhouding tussen 4 en 7 : 1 **en** de hele nacht minstens 0,5 m onder de kiel.',
            ],
          },
          { game: 'anchor' },
        ],
      },
    ],
    check: [
      { q: 'Diepte bij hoogwater 6 m, alleen ketting. Minimale kettinglengte?', options: ['24 m', '12 m', '18 m', '6 m'], answer: 0, why: '4 × 6 m = 24 m.' },
      { q: 'Waarom gebruik je de diepte bij hoogwater voor de verhouding?', options: ['Het is de diepste – bij lager water wordt de verhouding alleen beter', 'De kaart is getekend bij hoogwater', 'Het is gelijk aan laagwater', 'Het maakt niet uit'], answer: 0, why: 'Is het genoeg op het diepste moment, dan is het altijd genoeg.' },
      { q: '30 m ketting, boot van 10 m. Ongeveer welke zwaaistraal?', options: ['35 m', '15 m', '30 m', '60 m'], answer: 0, why: 'Ketting + halve bootlengte ≈ 30 + 5 m.' },
    ],
  },

  colregs: {
    title: 'Aanvaringsregels: wie wijkt uit en hoe',
    summary: 'Herken aanvaringsgevaar met kompaspeilingen, weet wie uitwijkt, en hoe een uitwijkplichtige en een koershouder handelen – ook in mist.',
    sections: [
      {
        h: 'Is er aanvaringsgevaar?',
        blocks: [
          { p: 'Neem een kompaspeiling van het andere schip, wacht een minuut, neem er nog een, en nog een.' },
          {
            list: [
              'Peiling **constant** en afstand neemt af → **aanvaringsgevaar**.',
              'Peiling **verandert** duidelijk → ze passeert vóór of achter je.',
              'Met grote schepen dichtbij kan zelfs een langzaam veranderende peiling gevaarlijk zijn.',
            ],
          },
          { ex: { title: 'Drie peilingen', lines: ['10:00 – 090°, 4,0 NM', '10:01 – 090°, 3,7 NM', '10:02 – 089°, 3,4 NM', 'Constante peiling, afstand neemt af → nu handelen.'] } },
        ],
      },
      {
        h: 'Wie wijkt uit?',
        blocks: [
          {
            table: {
              head: ['Situatie', 'Wie blijft vrij', 'Gebruikelijke actie'],
              rows: [
                ['Motorschepen kruisend', 'Wie de ander aan **stuurboord** heeft', 'Naar stuurboord, achterlangs'],
                ['Motorschepen recht tegen elkaar in', 'Beide', 'Beide naar stuurboord, bakboord op bakboord'],
                ['Oplopen', 'De oploper (motor **of** zeil)', 'Ruim vrij blijven'],
                ['Motor en zeil', 'Motor', 'Achter het zeilschip langs'],
                ['Zeil: bakboord- vs stuurboordboeg', 'Bakboordboeg', 'Afvallen, achterlangs'],
                ['Zeil: zelfde boeg', 'De loefwaartse boot', 'Vrij blijven'],
                ['Nauw vaarwater', 'Kleine schepen', 'Schepen die alleen het vaarwater kunnen gebruiken niet hinderen'],
              ],
            },
          },
          { p: 'Rangorde (minst wendbaar eerst): onbestuurbaar → beperkt in manoeuvreerbaarheid → diepgangbeperkt → vissend → zeil → motor.' },
        ],
      },
      {
        h: 'Hoe wijk je uit?',
        blocks: [
          {
            list: [
              '**Vroeg**: handel terwijl het andere schip nog ver weg is (in het spel: meer dan 2 NM).',
              '**Duidelijk**: minstens 30° zodat het vanaf het andere schip opvalt, of flink vaart minderen / stoppen.',
              'Normaal **naar stuurboord**, achter haar langs. Nooit vóór haar langs.',
              'Blijf peilen: de peiling moet gaan veranderen.',
            ],
          },
        ],
      },
      {
        h: 'De koershouder',
        blocks: [
          {
            list: [
              'Houd **koers en snelheid** aan zodat het andere schip je kan voorspellen.',
              'Peil en kijk. Doet zij duidelijk niets, dan mag je ingrijpen – en als zij een aanvaring niet meer alleen kan voorkomen, moet je.',
              'Draai **niet** naar bakboord voor een schip aan je bakboordzijde.',
              'In het spel: wacht tot de afstand onder 1 NM is.',
            ],
          },
        ],
      },
      {
        h: 'Beperkt zicht (mist)',
        blocks: [
          { p: 'In mist is er **geen koershouder**. Iedereen handelt vroeg en mindert vaart.' },
          {
            table: {
              head: ['Schip', 'Geluidssein'],
              rows: [
                ['Motor, met vaart', '▬ één lange stoot elke 2 min'],
                ['Motor, gestopt', '▬ ▬ twee lange stoten elke 2 min'],
                ['Zeil, visser, onbestuurbaar, beperkt', '▬ • • één lange + twee korte'],
                ['Ten anker', 'elke minuut 5 s snel luiden'],
              ],
            },
          },
          {
            list: [
              'Een radarcontact **voorlicht van dwars**: niet naar bakboord draaien (behalve als je het oploopt).',
              'Een contact dwars of achterlijker: niet naar het contact toe draaien.',
              'Vaart minderen is altijd een goede keus.',
            ],
          },
        ],
      },
      {
        h: 'In het spel Aanvaringskoers',
        blocks: [
          {
            steps: [
              'Druk op Start en dan minstens twee keer op **Neem een peiling**, een paar seconden na elkaar. "constant!" betekent gevaar.',
              'Bepaal je rol (uitwijkplichtig, koershouder, recht tegen elkaar in, mist).',
              'Uitwijkplichtig: draai één of twee keer **+30°** (stuurboord) zolang de afstand boven 2 NM is, of minder vaart.',
              'Koershouder: niets doen tot de afstand onder 1 NM is.',
              'Blijf peilen tot ze duidelijk passeert.',
            ],
          },
          { p: 'Beoordeling: veilige afstand, peilingen vóór je handelt, timing, grootte en richting van je actie. In mist kies je ook het juiste geluidssein (motor met vaart = één lange stoot).' },
          { game: 'collision' },
        ],
      },
    ],
    check: [
      { q: 'Peiling constant, afstand neemt af. Dat betekent…', options: ['Aanvaringsgevaar', 'Ze passeert vóór je', 'Ze passeert achter je', 'Ze ligt voor anker'], answer: 0, why: 'Een constante peiling op een naderend schip is het klassieke teken van een aanvaringskoers.' },
      { q: 'Kruisende motorschepen. Wie wijkt uit?', options: ['Wie de ander aan stuurboord heeft', 'Wie de ander aan bakboord heeft', 'De grootste', 'De snelste'], answer: 0, why: 'Regel 15: het schip dat de ander aan stuurboord heeft, wijkt uit.' },
      { q: 'Een goede uitwijkmanoeuvre is…', options: ['Vroeg en minstens 30°, meestal naar stuurboord', 'Een paar graden naar bakboord', 'Op het laatste moment vol vooruit', 'Koers houden'], answer: 0, why: 'Ze moet vroeg zijn en groot genoeg om op te vallen.' },
      { q: 'Mistsein van een motorschip met vaart?', options: ['Elke 2 min één lange stoot', 'Twee lange', 'Eén lange + twee korte', 'Vijf korte'], answer: 0, why: '▬ elke 2 minuten. Gestopt: ▬ ▬.' },
    ],
  },

  lights: {
    title: 'Navigatielichten: de nacht lezen',
    summary: 'Top-, boord- en heklichten, wat elke combinatie vertelt over soort en koers van een schip, en ezelsbruggetjes voor bijzondere schepen.',
    sections: [
      {
        h: 'De basislichten',
        blocks: [
          {
            list: [
              '**Toplicht**: wit, schijnt naar voren over 225° (alleen motorschepen).',
              '**Boordlichten**: **rood aan bakboord**, **groen aan stuurboord**, elk over 112,5° van recht vooruit tot iets achter dwars.',
              '**Heklicht**: wit, schijnt naar achteren over 135°.',
              '**Rondomlichten**: van alle kanten zichtbaar – voor bijzondere schepen en ten anker.',
            ],
          },
          { tip: 'Port wine is red: **rood = bakboord**.' },
        ],
      },
      {
        h: 'Welke kant zie ik?',
        blocks: [
          {
            table: {
              head: ['Je ziet', 'Je kijkt naar haar…', 'Betekenis'],
              rows: [
                ['Rood **en** groen', 'boeg, recht van voren', 'Ze komt recht op je af'],
                ['Alleen rood', 'bakboordzijde', 'Ze kruist van rechts naar links'],
                ['Alleen groen', 'stuurboordzijde', 'Ze kruist van links naar rechts'],
                ['Alleen wit (laag)', 'hek', 'Jij loopt haar op'],
              ],
            },
          },
          { tip: 'Haar **rode** licht aan jouw **stuurboord**boeg: ze kruist van jouw stuurboordzijde – zijn jullie allebei motorschepen, dan wijk jij uit.' },
        ],
      },
      {
        h: 'Wat voor schip?',
        blocks: [
          {
            table: {
              head: ['Lichten', 'Schip'],
              rows: [
                ['1 wit toplicht + boordlichten + heklicht', 'Motorschip korter dan 50 m'],
                ['2 witte toplichten (achterste hoger) + boord + hek', 'Motorschip langer dan 50 m'],
                ['Boordlichten + heklicht, **geen** toplicht', 'Zeilschip'],
                ['Groen boven wit rondom', 'Trawler'],
                ['Rood boven wit rondom', 'Vissend (niet trawlend)'],
                ['Rood boven rood rondom', 'Onbestuurbaar'],
                ['Rood – wit – rood rondom', 'Beperkt in manoeuvreerbaarheid'],
                ['Drie rood rondom', 'Diepgangbeperkt'],
                ['Eén wit rondom', 'Ten anker (onder 50 m)'],
              ],
            },
          },
          { list: ['"**Groen boven wit – trawlt ’s nachts.**"', '"**Rood boven wit – vist ’s nachts.**"', '"**Rood boven rood – de kapitein is dood.**" (onbestuurbaar)'] },
          { widget: 'lights' },
        ],
      },
      {
        h: 'In het spel Nachtelijke uitkijk',
        blocks: [
          {
            steps: [
              'Start de wacht en tik op een licht aan de horizon.',
              'Neem twee peilingen met minstens een minuut (speltijd) ertussen. "constant!" = gevaar.',
              'Benoem het type schip aan de lichten.',
              'Zeg welke kant je ziet: rood+groen = recht van voren, rood = bakboordzijde, groen = stuurboordzijde, alleen wit = hek, één rondomlicht = alleen rondomlicht.',
              'Meld gevaar of vrij.',
            ],
          },
          { p: 'Elk goed antwoord levert een punt op. Drie goed per schip is perfect.' },
          { game: 'lookout' },
        ],
      },
    ],
    check: [
      { q: 'Je ziet alleen een groen licht. Je kijkt naar haar…', options: ['stuurboordzijde', 'bakboordzijde', 'hek', 'boeg'], answer: 0, why: 'Groen is het stuurboord-boordlicht.' },
      { q: 'Twee rode rondomlichten boven elkaar?', options: ['Onbestuurbaar', 'Vissend', 'Diepgangbeperkt', 'Ten anker'], answer: 0, why: '"Rood boven rood, de kapitein is dood."' },
      { q: 'Boord- en heklichten maar geen wit toplicht?', options: ['Een zeilschip', 'Een klein motorschip', 'Een trawler', 'Een schip voor anker'], answer: 0, why: 'Motorschepen voeren een toplicht, zeilschepen niet.' },
    ],
  },

  pilotage: {
    title: 'Tochtplanning en loodsen',
    summary: 'Wat er in een tochtplan hoort, hoe je loodst met enslijnen en peilingen, en hoe je met een veiligheidspeiling van een gevaar af blijft.',
    sections: [
      {
        h: 'Het tochtplan',
        blocks: [
          {
            list: [
              '**Hoe ver en hoe lang**: afstand ÷ bootsnelheid, gecorrigeerd voor stroom.',
              '**Getij**: hoogtes voor havens en drempels, stromen onderweg (zie de les over getijden).',
              '**Beperkingen**: getijdenpoorten, sluis- of havendeurtijden, daglicht.',
              '**Weer**: laatste weerbericht; plan B en vluchthavens.',
              '**Loodsplan** voor vertrek en aankomst; waypoints ingevoerd en dubbel gecontroleerd.',
              'Onderweg: noteer elk uur je positie.',
            ],
          },
        ],
      },
      {
        h: 'Hulpmiddelen bij het loodsen',
        blocks: [
          {
            list: [
              '**Enslijn**: twee objecten op de kaart in één lijn. Zolang ze in lijn blijven, zit je op die lijn.',
              '**Geleidelijn**: een enslijn op de kaart die een veilige vaargeul aangeeft.',
              '**Kompaspeiling** van een object op de kaart: je bent ergens op die lijn.',
              '**Dieptelijn**: volg een diepte met het echolood.',
            ],
          },
        ],
      },
      {
        h: 'Veiligheidspeilingen',
        blocks: [
          { p: 'Een veiligheidspeiling is een lijn vanaf een goed zichtbaar object op de kaart die **net vrij blijft van een gevaar**. Zolang de peiling van dat object aan de veilige kant blijft, zit je goed.' },
          {
            steps: [
              'Kies een opvallend object op de kaart achter het gevaar (kerk, vuurtoren).',
              'Teken er een lijn vanaf die net de zeezijde van het gevaar raakt.',
              'Tel er een paar graden marge bij, weg van het gevaar.',
              'Meet de peiling en zet erbij **NLT** (niet minder dan) of **NMT** (niet meer dan) – welke kant veilig is.',
              'Neem regelmatig handpeilingen. Aan de verkeerde kant? **Draai direct weg van het gevaar.**',
            ],
          },
          { tip: 'Welk label? Stel je voor dat je naar het gevaar toe vaart: wordt de peiling **kleiner**, dan is de veilige kant **NIET MINDER DAN**; wordt hij groter, **NIET MEER DAN**.' },
          {
            ex: {
              title: 'De rotsrichel ten noorden van Kingsport',
              lines: [
                'Je zeilt naar het noorden; aan de oostkant steekt een rotsrichel uit de kust. In het noorden staat een kerk op de wal.',
                'De lijn vanaf de kerk die net de westrand van de richel raakt, is ongeveer 15°.',
                'Marge erbij → veiligheidspeiling **NLT 20°**: naar het oosten (richting richel) wordt de peiling kleiner.',
                'Peiling **25°** → groter dan 20° → veilig, koers houden.',
                'Peiling **18°** → kleiner dan 20° → je zit binnen de lijn: **naar bakboord** (west, weg van de richel).',
              ],
            },
          },
        ],
      },
      {
        h: 'In het spel Tocht plannen & varen',
        blocks: [
          {
            list: [
              '**Deel 1 – Getijdenpoort**: verschuif de vertrektijd en let op de aankomsttijd, de gemiddelde snelheid en de waterhoogte op de drempel. Gebruik de les over getijden.',
              '**Deel 2 – Veiligheidspeiling**: draai de rode lijn door de kerk tot hij de rotsen net vrijhoudt (binnen een paar graden). Beslis dan bij elke peiling: koers houden of naar bakboord.',
              'De vloedstroom zet je elk stuk naar het oosten, dus reken op een correctie of twee.',
            ],
          },
          { game: 'passage' },
        ],
      },
    ],
    check: [
      { q: 'Veiligheidspeiling NLT 040°. Je peilt 035°. Je…', options: ['zit aan de gevaarkant – draai weg', 'zit veilig', 'moet naar het gevaar draaien', 'hoeft niets te doen'], answer: 0, why: '035° is minder dan 040°, dus je zit aan de verkeerde kant van de lijn.' },
      { q: 'Twee objecten op de kaart in één lijn heet een…', options: ['Enslijn', 'Veiligheidspeiling', 'Waypoint', 'Dieptelijn'], answer: 0, why: 'Zolang ze in lijn blijven, zit je op die lijn.' },
      { q: 'Onderweg noteer je je positie…', options: ['elk uur', 'alleen bij aankomst', 'één keer per dag', 'nooit met gps'], answer: 0, why: 'Valt de elektronica uit, dan kun je verder vanaf de laatste genoteerde positie.' },
    ],
  },

  safety: {
    title: 'Noodoproepen en calamiteiten',
    summary: 'Wanneer Mayday, Pan-Pan of Sécurité, hoe je een DSC-alarm en een Mayday per spraak verstuurt, en de belangrijkste beslissingen van de schipper bij veelvoorkomende noodsituaties.',
    sections: [
      {
        h: 'Mayday, Pan-Pan of Sécurité?',
        blocks: [
          {
            table: {
              head: ['Oproep', 'Wanneer', 'Voorbeelden'],
              rows: [
                ['MAYDAY', 'Ernstig en direct gevaar voor schip of persoon', 'Man over boord, zinken, brand niet onder controle, iemand ademt niet'],
                ['PAN-PAN', 'Urgent, maar niet direct levensbedreigend', 'Motorpech in een scheepvaartroute, ontmast en drijvend, medisch advies'],
                ['SÉCURITÉ', 'Veiligheidsinformatie voor anderen', 'Drijvende container, een boeilicht dat niet werkt'],
              ],
            },
          },
        ],
      },
      {
        h: 'DSC-noodalarm',
        blocks: [
          {
            steps: [
              'Zet de marifoon aan.',
              'Kies, als er tijd is, de aard van de nood (brand, waterinslag, man over boord…).',
              'Til de verende rode klep op.',
              'Druk de noodknop in en **houd** hem **5 seconden** vast. De marifoon zendt je MMSI en positie.',
              'Volg op met een Mayday per spraak op kanaal 16.',
            ],
          },
        ],
      },
      {
        h: 'De Mayday per spraak',
        blocks: [
          { p: 'Kanaal **16**, **hoog vermogen**. Houd de zendknop (PTT) het hele bericht ingedrukt en spreek langzaam.' },
          {
            steps: [
              '"MAYDAY, MAYDAY, MAYDAY"',
              '"This is yacht Puffin, Puffin, Puffin, MMSI …"',
              '"MAYDAY yacht Puffin, MMSI …"',
              '"My position …" (breedte/lengte of peiling en afstand vanaf een bekend punt)',
              'Aard van de nood – wat er gebeurd is',
              'Aantal personen aan boord **en** "require immediate assistance"',
              'Overige essentiële informatie (bijv. we gaan in het reddingsvlot)',
              '"Over" – laat dan de knop los en luister.',
            ],
          },
          { warn: 'Zeg nooit "over and out". Niet kletsen – alleen essentiële informatie.' },
          { game: 'vhf' },
        ],
      },
      {
        h: 'De beslissingen van de schipper',
        blocks: [
          {
            table: {
              head: ['Situatie', 'Belangrijkste beslissingen'],
              rows: [
                ['Verslechterend weerbericht', 'Plan rond de tijdlijn: vroeg weg, terug voordat de wind toeneemt. Krimpende wind + dikker wordende bewolking = front op komst. Reef op tijd.'],
                ['Motorpech in een vaarwater', 'Eerst het vaarwater uit zeilen, dan zo nodig Pan-Pan. Slepen: lange lijn en een hanenpoot naar beide voorkikkers; houd nooit een belaste lijn vast.'],
                ['Vastlopen (afgaand water)', 'Direct hard achteruit, de weg terug. Laat de boot hellen om de kiel op te tillen. Leg daarna een werpanker uit richting diep water.'],
                ['Brand in de motor', 'Motor stop, brandstof dicht, bemanning met reddingsvest aan dek. Blusser door het blusgat, gericht op de basis. Niet onder controle → Mayday.'],
                ['Helikopterredding', 'Stuur precies de gevraagde koers en snelheid. Laat de hi-line eerst het water raken, nooit vastmaken. Losse spullen opruimen en vastzetten.'],
                ['Het reddingsvlot in', 'Blijf zo lang mogelijk aan boord. Vanglijn vast, vlot aan lij te water, zwaarste volwassene eerst, droog instappen, grab bag en EPIRB mee, driftanker uit.'],
              ],
            },
          },
          { list: ['Weerberichttermen: **imminent** < 6 u, **soon** 6–12 u, **later** > 12 u.', '**Krimpen** = tegen de klok in draaien (NW → ZW), **ruimen** = met de klok mee.'] },
          { game: 'decisions' },
        ],
      },
    ],
    check: [
      { q: 'Ontmast, niemand gewond, langzaam van de kust af drijvend. Welke oproep?', options: ['Pan-Pan', 'Mayday', 'Sécurité', 'Geen oproep'], answer: 0, why: 'Je hebt hulp nodig maar bent niet in direct gevaar.' },
      { q: 'Hoe lang houd je de DSC-noodknop ingedrukt?', options: ['5 seconden', 'Even kort', 'Tot iemand antwoordt', '1 minuut'], answer: 0, why: 'Vijf seconden verstuurt het alarm.' },
      { q: 'Hoe eindig je een Mayday-bericht?', options: ['"Over"', '"Over and out"', '"Out"', '"Dank u"'], answer: 0, why: '"Over" betekent dat je op antwoord wacht; "over and out" wordt nooit gebruikt.' },
      { q: 'Een helikopter laat een hi-line zakken. Je…', options: ['laat hem het water raken, pakt hem dan – nooit vastmaken', 'vangt hem in de lucht', 'maakt hem vast aan een kikker', 'snijdt hem door'], answer: 0, why: 'Hij ontlaadt statische elektriciteit in het water; vastgemaakt kan hij de helikopter omlaag trekken.' },
    ],
  },
}
