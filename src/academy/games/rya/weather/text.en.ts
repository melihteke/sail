import type { WeatherText } from './text'

export const weatherEn: WeatherText = {
  title: 'Weather for the skipper',
  intro:
    'From the global wind belts down to a sea breeze on your local beach: highs and lows, isobars, fronts, clouds, the Beaufort scale, fog, squalls, tropical storms and forecasts – with animations you can play with and drills that train you to read a weather chart like a skipper.',
  chapters: {
    start: {
      title: 'Why weather is the skipper’s job',
      short: 'Start here',
      sections: [
        {
          h: 'The most important safety decision',
          blocks: [
            {
              p: 'Most bad days at sea start ashore, with a weather decision. A Day Skipper is expected to **get a forecast, understand it, check it against the sky and the barometer, and decide** – go, wait, take a shorter route or reef early. You do not need to become a meteorologist; you need to recognise the patterns that matter to a small boat.',
            },
            {
              list: [
                '**Wind** – strength, direction, gusts and how they will change.',
                '**Sea state** – waves grow with wind, fetch and time, and get steeper against a tidal stream.',
                '**Visibility** – fog, rain and darkness.',
                '**Timing** – when a front, a gale or a shift will arrive.',
              ],
            },
          ],
        },
        {
          h: 'Three scales of weather',
          blocks: [
            {
              table: {
                head: ['Scale', 'Size', 'What it gives you', 'Where you find it'],
                rows: [
                  ['**Synoptic**', 'Thousands of miles, days', 'Highs, lows, fronts – the general wind for the next days', 'Synoptic charts, shipping forecast, GRIB'],
                  ['**Mesoscale**', '10–200 miles, hours', 'Sea breezes, squall lines, thunderstorms, fog banks', 'Inshore forecast, radar, satellite, the sky'],
                  ['**Local**', 'A bay or headland, minutes', 'Funnelling, gusts off cliffs, wind shadows, acceleration round headlands', 'Pilot books, local knowledge, your eyes'],
                ],
              },
            },
            { tip: 'Good skippers think from big to small: first the synoptic picture, then what the coast and the time of day will do to it.' },
          ],
        },
        {
          h: 'How to use this lesson',
          blocks: [
            {
              steps: [
                'Read the chapters in order – each one builds on the last.',
                'Play with every animation: move the sliders, switch hemispheres, click the symbols.',
                'Finish with the **mind drills**: chart questions, an ocean passage to plan, sequences to sort and quick-fire recognition games.',
                'Use the check at the end to see what stuck.',
              ],
            },
          ],
        },
      ],
    },

    global: {
      title: 'The global engine: wind belts and trade winds',
      short: 'Global winds',
      sections: [
        {
          h: 'Hot equator, cold poles',
          blocks: [
            {
              p: 'The Sun heats the tropics far more than the poles. Warm air rises at the equator, flows towards the poles high up, cools and sinks again at about 30° north and south. This loop is the **Hadley cell**. Two more loops sit between 30° and 60° (**Ferrel cell**) and over the poles (**polar cell**). Where air sinks the surface pressure is **high**; where it rises it is **low**.',
            },
            { ww: 'globe' },
          ],
        },
        {
          h: 'The wind belts',
          blocks: [
            {
              table: {
                head: ['Belt', 'Latitude', 'Wind', 'For the sailor'],
                rows: [
                  ['**Doldrums (ITCZ)**', '0–10°', 'Light and variable, heavy showers', 'Calms for days, then violent squalls. Cross quickly, ideally where the band is narrow.'],
                  ['**Trade winds**', '10–30°', 'NE in the north, SE in the south, 15–25 kn', 'The most reliable winds on Earth – the classic downwind ocean crossings.'],
                  ['**Horse latitudes**', '≈ 30°', 'Light winds under the subtropical highs (Azores, Pacific, St Helena…)', 'Avoid the centre of the high: no wind.'],
                  ['**Westerlies**', '35–60°', 'Mainly W, with a stream of depressions', 'Changeable weather of NW Europe; the **Roaring Forties** in the south.'],
                  ['**Polar front / subpolar lows**', '≈ 60°', 'Where cold and warm air meet', 'Birthplace of most mid-latitude depressions.'],
                  ['**Polar easterlies**', '60–90°', 'Cold E winds', 'High-latitude cruising only.'],
                ],
              },
            },
          ],
        },
        {
          h: 'Coriolis: why the winds curve',
          blocks: [
            {
              p: 'Because the Earth rotates, anything moving over it appears to be turned: **to the right in the northern hemisphere and to the left in the southern**. Air flowing back to the equator is turned west, so the trades blow from the **north-east** in the north and from the **south-east** in the south. The effect is zero at the equator and strongest at the poles – that is one reason tropical storms never form right on the equator.',
            },
          ],
        },
        {
          h: 'North and south: what changes?',
          blocks: [
            {
              table: {
                head: ['', 'Northern hemisphere', 'Southern hemisphere'],
                rows: [
                  ['Turning of moving air', 'to the right', 'to the left'],
                  ['Wind round a **low**', 'anticlockwise', 'clockwise'],
                  ['Wind round a **high**', 'clockwise', 'anticlockwise'],
                  ['Trade winds', 'north-east', 'south-east'],
                  ['Buys Ballot: back to the wind, low is on your…', 'left', 'right'],
                  ['Cold front passes: the wind…', 'veers (e.g. SW → NW)', 'backs (e.g. NW → SW)'],
                  ['Summer months', 'June–August', 'December–February'],
                  ['Tropical storm season', 'June–November', 'November–April'],
                ],
              },
            },
            { tip: 'The belts move with the Sun: about 5–10° north in the northern summer and south in the northern winter. That is why trade-wind crossings to the Caribbean leave in November–January.' },
          ],
        },
      ],
    },

    pressure: {
      title: 'Pressure: highs, lows and Buys Ballot',
      short: 'Highs & lows',
      sections: [
        {
          h: 'Air pressure and the barometer',
          blocks: [
            {
              p: 'Air pressure is the weight of the air above you, measured in **hectopascals (hPa)** – the same as millibars. Average sea-level pressure is about **1013 hPa**; deep lows go below 960, strong highs above 1040. "High" and "low" are always relative to the surroundings.',
            },
            {
              list: [
                'Log the barometer **every hour or every watch**. The trend matters more than the number.',
                'A fall of **3 hPa or more in 3 hours** means wind is coming; 6 hPa or more – expect a gale.',
                'A rapid rise after a front also brings strong, gusty wind.',
              ],
            },
          ],
        },
        {
          h: 'Highs and lows',
          blocks: [
            {
              table: {
                head: ['', 'High (anticyclone)', 'Low (depression)'],
                rows: [
                  ['Air', 'sinks, warms, dries out', 'rises, cools, forms cloud'],
                  ['Weather', 'settled, little cloud; fog or haze possible', 'cloud, rain, fronts, stronger wind'],
                  ['Isobars', 'usually wide apart → light winds', 'often close → strong winds'],
                  ['Movement', 'slow, can sit for days ("blocking")', 'usually moves east at 15–40 kn'],
                  ['Wind (NH / SH)', 'clockwise / anticlockwise, spiralling out', 'anticlockwise / clockwise, spiralling in'],
                ],
              },
            },
            { ww: 'pressure' },
            {
              p: 'Higher up (about 1 km) the wind blows **along** the isobars – the balance between the pressure push and Coriolis gives the **geostrophic wind**. At the surface, friction slows the wind; Coriolis then turns it less, so it blows **across the isobars in towards the low**: about **10–20° over the sea** and **30–40° over land**, and about a third slower over the sea.',
            },
          ],
        },
        {
          h: 'Buys Ballot’s law',
          blocks: [
            { p: '**Stand with your back to the true wind: in the northern hemisphere the low is on your left (and a little ahead); in the southern hemisphere it is on your right.** No chart needed – it tells you where the bad weather is.' },
            { ww: 'buys' },
            { warn: 'Use the true wind at the surface, not cloud movement. Clouds high up move with the wind aloft, which can be very different.' },
          ],
        },
      ],
    },

    isobars: {
      title: 'Reading isobars: wind from the chart',
      short: 'Isobars',
      sections: [
        {
          h: 'What an isobar is',
          blocks: [
            {
              list: [
                'An **isobar** joins places with the same sea-level pressure. Charts usually draw them every **4 hPa** (1000, 1004, 1008…).',
                '**Close isobars = strong wind; wide isobars = light wind.** Exactly like contour lines on a hill: steep slope, fast flow.',
                'The wind blows almost along the isobars, low on the left (NH), turned 10–20° inwards over the sea.',
                'For the same spacing the wind is **stronger at low latitudes** (Coriolis is weaker), so a 4 hPa gap means more wind at 40° than at 60°.',
              ],
            },
            { ww: 'isobars' },
          ],
        },
        {
          h: 'Measuring wind from a chart',
          blocks: [
            {
              steps: [
                'Find your position on the chart.',
                'Measure the distance between the two isobars either side of you, at right angles to them (use the latitude scale: 1′ = 1 nm).',
                'Read the **geostrophic wind** from the scale printed on the chart (or the calculator above).',
                'Reduce by about a third for the surface wind over the sea (half over land) and turn it 15° towards the low.',
                'Add gusts: about +30% in stable air, +50% or more in unstable air with showers.',
              ],
            },
            {
              ex: {
                title: 'Example at 50° N',
                lines: ['Isobars 4 hPa apart, 120 nm apart.', 'Geostrophic wind ≈ **25 kn**.', 'Surface wind ≈ 25 × ⅔ ≈ **17 kn** (force 5), gusts in showers ≈ 25 kn.', 'Direction: along the isobars, low on the left, turned 15° in.'],
              },
            },
          ],
        },
        {
          h: 'Backing and veering',
          blocks: [
            {
              list: [
                '**Veering**: the wind shifts **clockwise** (e.g. S → SW → W). In the NH a veer usually means a front or trough has passed.',
                '**Backing**: the wind shifts **anticlockwise** (e.g. W → SW → S). In the NH a backing wind with a falling barometer often means a low is approaching.',
                'These words mean the same in both hemispheres – but the weather that causes them is mirrored.',
              ],
            },
          ],
        },
        {
          h: 'Ridges, troughs and cols',
          blocks: [
            {
              table: {
                head: ['Feature', 'On the chart', 'Weather'],
                rows: [
                  ['**Ridge**', 'Isobars bulge out from a high', 'A short fine spell between two lows'],
                  ['**Trough**', 'Isobars bend into a V from a low (often a line)', 'Showers, squalls and a wind shift (veer in NH) as it passes'],
                  ['**Col**', 'The saddle between two highs and two lows', 'Light, variable winds; fog or thunderstorms possible'],
                  ['**Secondary low**', 'A small low on the edge of a big one', 'Can deepen fast and give unexpected gales'],
                ],
              },
            },
          ],
        },
      ],
    },

    airmass: {
      title: 'Air masses and stability',
      short: 'Air masses',
      sections: [
        {
          h: 'Where the air comes from',
          blocks: [
            {
              p: 'An **air mass** is a huge body of air that has taken on the temperature and humidity of where it came from. Knowing which one you are in tells you a lot about visibility, cloud and gusts.',
            },
            {
              table: {
                head: ['Air mass', 'Origin', 'Character', 'Typical weather at sea'],
                rows: [
                  ['**Arctic (A)**', 'Arctic ice', 'very cold, dry', 'snow showers, very good visibility between them'],
                  ['**Polar maritime (Pm)**', 'North Atlantic', 'cool, moist, unstable', 'cumulus, showers, gusty, good visibility'],
                  ['**Tropical maritime (Tm)**', 'Azores area', 'warm, moist, stable', 'low cloud, drizzle, poor visibility, sea fog in spring'],
                  ['**Polar continental (Pc)**', 'Siberia, winter', 'very cold, dry', 'bitter E winds, clear or low grey cloud over the sea'],
                  ['**Tropical continental (Tc)**', 'Sahara, summer', 'hot, dry', 'haze, hot spells, thunderstorms on its edges'],
                ],
              },
            },
          ],
        },
        {
          h: 'Stable and unstable air',
          blocks: [
            {
              table: {
                head: ['', 'Stable', 'Unstable'],
                rows: [
                  ['What happens', 'Warm air over a colder surface – it cannot rise', 'Cold air over a warmer surface – rising bubbles grow'],
                  ['Cloud', 'flat layers (stratus, stratocumulus)', 'heaped clouds (cumulus, cumulonimbus)'],
                  ['Precipitation', 'drizzle, light rain', 'showers, hail, thunder'],
                  ['Visibility', 'poor, mist and fog', 'good, except in showers'],
                  ['Wind', 'steady, few gusts', 'gusty; squalls under big clouds'],
                ],
              },
            },
            { tip: 'Rule of thumb: crisp clear air with fluffy clouds = gusty, sail with a reef ready. Grey murky air = steady wind but watch for fog.' },
          ],
        },
      ],
    },

    clouds: {
      title: 'Clouds: reading the sky',
      short: 'Clouds',
      sections: [
        {
          h: 'Ten cloud types in four families',
          blocks: [
            {
              p: 'Clouds are named by **height** (cirro- high, alto- middle) and **shape** (cumulus heaped, stratus layer, nimbus rain). Learn the ten basic types and what each one predicts – click the clouds in the drawing.',
            },
            { ww: 'clouds' },
          ],
        },
        {
          h: 'What the sky tells you',
          blocks: [
            {
              table: {
                head: ['You see', 'It usually means'],
                rows: [
                  ['Cirrus spreading from the west, thickening', 'a warm front and depression in 12–24 h'],
                  ['A halo round the sun or moon (cirrostratus)', 'rain likely within about 12 h'],
                  ['Sky lowering, sun becoming watery (altostratus)', 'rain within a few hours'],
                  ['Cumulus growing tall by late morning', 'showers or thunder in the afternoon'],
                  ['Anvil-topped cumulonimbus', 'squalls, heavy rain, hail, lightning nearby'],
                  ['Low grey sheet with drizzle', 'warm sector or moist stable air; poor visibility'],
                  ['Fair-weather cumulus that flatten in the evening', 'settled weather'],
                ],
              },
            },
          ],
        },
        {
          h: 'Old sayings that work',
          blocks: [
            {
              list: [
                '**"Mackerel sky and mares’ tails make tall ships carry low sails"** – cirrocumulus and cirrus ahead of a front.',
                '**"Red sky at night, sailor’s delight"** – in the westerlies, clear sky to the west at sunset.',
                '**"Long foretold, long last; short notice, soon past"** – a slow barometer fall brings a long blow; a sudden one a short sharp one.',
                '**"First rise after low, foretells a stronger blow"** – the wind often peaks just behind the cold front.',
              ],
            },
            { warn: 'A cumulonimbus can produce gusts of 40 kn or more from a calm. Reef early and keep clear of the dark base and its rain curtain.' },
          ],
        },
      ],
    },

    fronts: {
      title: 'Fronts and depressions',
      short: 'Fronts',
      sections: [
        {
          h: 'Symbols on a synoptic chart',
          blocks: [{ p: 'Fronts are drawn with symbols on the side the front is moving towards. Click each symbol to see what it means.' }, { ww: 'symbols' }],
        },
        {
          h: 'Fronts in a nutshell',
          blocks: [
            {
              table: {
                head: ['Front', 'What happens', 'Weather', 'Wind (NH)'],
                rows: [
                  ['**Warm front**', 'warm air slides up over cold air on a gentle slope (≈ 1:150)', 'cloud lowers for 12–24 h, then steady rain', 'backs and freshens ahead, veers as it passes'],
                  ['**Cold front**', 'cold air pushes under warm air, steep slope (≈ 1:50)', 'narrow band of heavy rain and squalls, then clearance', 'sharp veer, gusts, barometer jumps up'],
                  ['**Occluded front**', 'the cold front has caught up with the warm front', 'a mix: rain belt, often the depression is past its best', 'veers'],
                ],
              },
            },
          ],
        },
        {
          h: 'The life of a depression',
          blocks: [
            {
              steps: [
                'A kink forms on the **polar front** between cold polar air and warm tropical air.',
                'The kink deepens into a wave: a **warm front** ahead and a **cold front** behind, with a **warm sector** between them.',
                'Pressure falls at the centre and the low moves along, often east or north-east at 20–30 kn.',
                'The faster cold front catches the warm front: an **occlusion** forms and the low slowly fills.',
                'New lows often form on the trailing cold front – a **family** of depressions, each a day or so apart.',
              ],
            },
          ],
        },
        {
          h: 'A depression passes over you',
          blocks: [
            { p: 'Press **play** and watch a typical northern-hemisphere depression pass south of its centre over a boat. The panel shows what the crew sees and what the barometer does.' },
            { ww: 'passage' },
            {
              table: {
                head: ['Stage', 'Sky', 'Barometer', 'Wind (NH)', 'Visibility'],
                rows: [
                  ['Ahead of warm front', 'Ci → Cs (halo) → As → Ns', 'falling', 'backs S/SE, freshens', 'good, then poor in rain'],
                  ['Warm front passes', 'Ns, low St', 'fall slows', 'veers SW', 'poor'],
                  ['Warm sector', 'St, Sc, drizzle', 'steady or slow fall', 'steady SW', 'moderate to poor, fog'],
                  ['Cold front passes', 'Cb, heavy rain, squalls', 'rises sharply', 'veers W/NW, gusts', 'very poor in rain'],
                  ['Behind cold front', 'Cu, showers, blue sky', 'rising', 'NW, gusty', 'very good'],
                ],
              },
            },
            { tip: 'North of the centre the sequence is different: the wind backs steadily (E → N → NW) without a warm sector – often a long spell of rain.' },
          ],
        },
        {
          h: 'In the southern hemisphere',
          blocks: [
            {
              p: 'Everything is mirrored. Lows turn **clockwise**, the warm sector lies on the **equator side (north)** of the low, and when the cold front passes the wind shifts from **NW to SW – it backs**. The rest of the story – lowering cloud, falling barometer, squalls at the cold front, clear showery air behind – is the same.',
            },
          ],
        },
      ],
    },

    local: {
      title: 'Local winds, coasts and fog',
      short: 'Local effects',
      sections: [
        {
          h: 'Sea breeze and land breeze',
          blocks: [
            {
              p: 'On a sunny day the land heats up much faster than the sea. Warm air rises over the land, and cooler air flows in from the sea to replace it: the **sea breeze**. It starts late morning, peaks mid-afternoon (often 10–15 kn, sometimes more) and dies at sunset. At night the land cools below the sea temperature and a weaker **land breeze** blows offshore.',
            },
            { ww: 'seabreeze' },
            {
              list: [
                'Needs sunshine and a land–sea difference of at least about **5 °C**.',
                'An offshore gradient wind above about **15 kn** stops it; a light offshore wind delays it and makes a calm zone offshore.',
                'In the NH it **veers** through the afternoon (turns to the right of straight onshore).',
                'Cumulus over the land that stop at the coast are a sign it is blowing.',
              ],
            },
          ],
        },
        {
          h: 'The coast changes the wind',
          blocks: [
            {
              table: {
                head: ['Effect', 'What happens'],
                rows: [
                  ['**Headlands**', 'wind accelerates round them, often 5–10 kn stronger; seas build in overfalls'],
                  ['**Funnelling**', 'wind is squeezed and accelerated through straits and valleys'],
                  ['**Convergence / divergence**', 'with the coast on the right of the wind (NH, looking downwind), friction squeezes the flow → more wind; with it on the left → less'],
                  ['**Wind shadow**', 'calm patch behind cliffs and islands, then gusts where the wind comes down again'],
                  ['**Katabatic wind**', 'cold air pouring down valleys at night – strong gusts in fjords and mountain anchorages'],
                ],
              },
            },
          ],
        },
        {
          h: 'Fog',
          blocks: [
            {
              table: {
                head: ['Type', 'How it forms', 'When it clears'],
                rows: [
                  ['**Advection (sea) fog**', 'warm moist air over cold sea – spring and early summer', 'only with a change of air mass; wind does NOT clear it'],
                  ['**Radiation fog**', 'land cools on clear calm nights; drifts out of rivers and harbours', 'usually burns off by late morning'],
                  ['**Frontal fog**', 'rain falling into cold air ahead of a warm front', 'when the front has passed'],
                  ['**Sea smoke**', 'very cold air over warmer water', 'when the air warms'],
                ],
              },
            },
          ],
        },
        {
          h: 'Mediterranean and Turkish winds',
          blocks: [
            {
              table: {
                head: ['Wind', 'Where', 'Character'],
                rows: [
                  ['**Meltemi (meltem, Etesian)**', 'Aegean, summer', 'N–NW, 20–30 kn, strongest in the afternoon; days on end in July–August'],
                  ['**Poyraz**', 'Turkey, Black Sea, Marmara', 'NE, cold and strong, can bring a short steep sea in the Bosphorus'],
                  ['**Lodos**', 'Marmara, Aegean', 'SW, warm, can blow a gale and push up a big sea into exposed harbours'],
                  ['**Karayel**', 'Turkey', 'NW, cold, often after a front'],
                  ['**İmbat**', 'Izmir, Aegean coast', 'afternoon W sea breeze in summer'],
                  ['**Mistral**', 'Gulf of Lion', 'N–NW, funnelled down the Rhône, can exceed 40 kn in sunshine'],
                  ['**Bora**', 'Adriatic', 'NE, violent gusts down the mountains, can arrive almost without warning'],
                  ['**Sirocco / Scirocco**', 'from North Africa', 'S–SE, hot, dusty or humid, poor visibility'],
                ],
              },
            },
          ],
        },
        {
          h: 'Squalls and thunderstorms',
          blocks: [
            {
              list: [
                'A squall is a sudden increase in wind (at least 16 kn more, lasting a minute or more) – usually under a cumulonimbus or along a cold front.',
                'Watch for a dark arc of cloud and a white line on the water approaching from upwind.',
                'Reef or roll the genoa away **before** it arrives; turn downwind or heave to; keep lookouts – visibility can drop to near zero in the rain.',
                'In lightning: stay below, keep clear of the mast and rigging, unplug electronics if you can.',
              ],
            },
          ],
        },
      ],
    },

    beaufort: {
      title: 'The Beaufort scale, gusts and waves',
      short: 'Beaufort',
      sections: [
        {
          h: 'From calm to hurricane',
          blocks: [
            {
              p: 'Admiral Beaufort’s scale describes wind strength by what it does to the sea – so you can estimate it without instruments. Forecasts use it all the time: "southwest 5 to 7" is Beaufort. Move the slider and watch the sea build.',
            },
            { ww: 'beaufort' },
          ],
        },
        {
          h: 'Gusts',
          blocks: [
            {
              list: [
                'Forecast wind is a **mean** speed. Gusts are typically **30–50% higher** – more in unstable air, near squalls and in the lee of hills.',
                'Reef for the **gusts**, not the mean wind. A good habit: reef when the gusts reach the top of your comfort range.',
                'Apparent wind is stronger going upwind: a 15 kn true wind feels like 20 kn on the wind and 10 kn running.',
              ],
            },
          ],
        },
        {
          h: 'What makes the waves',
          blocks: [
            {
              list: [
                '**Wind speed, fetch** (open water upwind) and **duration** – the longer and further the wind blows, the bigger the sea.',
                '**Wind against tide** makes waves shorter and steeper; a force 5 against a 2 kn stream can feel like a force 7.',
                '**Shallow water** and **overfalls** off headlands make steep breaking seas.',
                '**Swell** travels far from distant storms; it can arrive before the wind does.',
              ],
            },
            { tip: 'For a Day Skipper boat and crew: plan to be in harbour above force 6, and think hard about force 5 against the tide.' },
          ],
        },
      ],
    },

    tropical: {
      title: 'Tropical storms and ocean passages',
      short: 'Tropics & oceans',
      sections: [
        {
          h: 'Tropical revolving storms',
          blocks: [
            {
              p: 'Over sea warmer than about **27 °C**, between roughly 5° and 25° from the equator, a cluster of thunderstorms can organise into a **tropical revolving storm** – winds of 64 kn and more round a calm eye. They move west with the trades, then often recurve polewards and east.',
            },
            {
              table: {
                head: ['Name', 'Where', 'Season'],
                rows: [
                  ['Hurricane', 'North Atlantic, Caribbean, NE Pacific', 'June – November (peak Aug–Oct)'],
                  ['Typhoon', 'NW Pacific', 'all year, peak Jul–Nov'],
                  ['Cyclone', 'Indian Ocean, South Pacific, Australia', 'Nov – April (S), May & Oct–Nov (N Indian Ocean)'],
                ],
              },
            },
            { ww: 'trs' },
          ],
        },
        {
          h: 'Escape rules',
          blocks: [
            {
              table: {
                head: ['Where you are', 'Northern hemisphere', 'Southern hemisphere'],
                rows: [
                  ['**Dangerous semicircle**', 'right of the track; wind **veers** – keep the wind on the **starboard bow** and make as much way as possible', 'left of the track; wind **backs** – keep the wind on the **port bow**'],
                  ['**Navigable semicircle**', 'left of the track; wind **backs** – keep the wind on the **starboard quarter**', 'right of the track; wind **veers** – wind on the **port quarter**'],
                  ['**In the path ahead**', 'wind steady in direction, rising, barometer falling – run with the wind on the **starboard quarter** into the navigable semicircle', 'same, wind on the **port quarter**'],
                ],
              },
            },
            { warn: 'The best tactic is not to be there: plan ocean passages outside the storm season and watch the forecasts from the National Hurricane Center or the local warning centre.' },
          ],
        },
        {
          h: 'Planning a trade-wind crossing',
          blocks: [
            {
              steps: [
                '**Season first**: Canaries → Caribbean leaves after the hurricane season, usually late November to January.',
                '**"Go south until the butter melts, then turn right"**: head south-west past the Cape Verdes to about 15–20° N before going west – into the steady trades and away from the light winds of the Azores high.',
                '**Avoid the high**: the direct (great-circle) route runs into its light centre.',
                '**Avoid the doldrums**: too far south and you meet the ITCZ – calms and squalls.',
                'Expect **squalls at night** in the trades and a swell from astern for weeks: plan sail plans and chafe protection.',
              ],
            },
            { tip: 'Try it yourself in the drills: plan a crossing and watch the boat sail through the wind field.' },
          ],
        },
      ],
    },

    forecasts: {
      title: 'Forecasts and the go/no-go decision',
      short: 'Forecasts',
      sections: [
        {
          h: 'Where to get the weather',
          blocks: [
            {
              table: {
                head: ['Source', 'What it gives', 'Tip'],
                rows: [
                  ['**Shipping forecast**', 'sea areas, 24 h, gale warnings', 'standard language – learn the terms below'],
                  ['**Inshore waters forecast**', 'to 12 nm offshore, more detail', 'best for coastal day sails'],
                  ['**Coastguard / MSI on VHF**', 'broadcasts on a working channel after an announcement on Ch 16', 'note the times in your plan'],
                  ['**Navtex**', 'printed or displayed text forecasts and warnings', 'works offshore without internet'],
                  ['**Synoptic charts**', 'analysis and forecast charts to 5 days', 'see how the pattern develops'],
                  ['**GRIB files / apps**', 'computer-model wind and pressure grids', 'tidy and detailed – but see the warnings below'],
                ],
              },
            },
            { ww: 'forecast' },
          ],
        },
        {
          h: 'GRIB data: useful but…',
          blocks: [
            {
              list: [
                'Models give a **mean** wind on a grid of several kilometres – they miss gusts, squalls, headlands and funnelling.',
                'Fronts can arrive hours earlier or later than modelled.',
                'Compare two models and the official forecast; if they disagree, the uncertainty is high.',
                'Always check against **reality**: the barometer, the sky and the wind you actually have.',
              ],
            },
          ],
        },
        {
          h: 'Making the decision',
          blocks: [
            {
              steps: [
                'Get the forecast for the whole passage plus a safety margin of several hours.',
                'Look at the **worst** expected conditions: gusts, wind against tide, the strongest period.',
                'Match them to the **weakest** part of the team: crew, boat, skipper experience.',
                'Plan bolt holes and reefing points; decide in advance what would make you turn back.',
                'If in doubt, don’t go – or choose a shorter, more sheltered plan.',
              ],
            },
            {
              ex: {
                title: 'Example',
                lines: [
                  'Forecast: SW 4 to 5, increasing 6 later. Showers. Good.',
                  '"Later" = more than 12 hours away. A 6-hour passage leaving now is within the 4–5.',
                  'Showers = unstable air: expect gusts to 25 kn. Leave with a reef in.',
                  'Plan to be in harbour well before the evening; choose a harbour that is safe in SW 6.',
                ],
              },
            },
          ],
        },
      ],
    },

    drills: {
      title: 'Mind drills',
      short: 'Drills',
      sections: [
        { h: 'Read the synoptic chart', blocks: [{ p: 'Three charts – two from the northern and one from the southern hemisphere. Answer the questions using the isobars, the fronts and Buys Ballot.' }, { wd: 'synoptic' }] },
        { h: 'Plan an ocean passage', blocks: [{ p: 'Gran Canaria to St Lucia, about 2,700 miles. Choose the month, click on the chart to add waypoints and set sail: the boat sails through the wind field round the Azores high and the trades. Can you beat the classic route?' }, { wd: 'route' }] },
        { h: 'A depression in the right order', blocks: [{ wd: 'order' }] },
        { h: 'What force is it?', blocks: [{ wd: 'beaufortGuess' }] },
        { h: 'Name that cloud', blocks: [{ wd: 'cloudGuess' }] },
        { h: 'Where is the low?', blocks: [{ wd: 'buysDrill' }] },
        { h: 'Escape the storm', blocks: [{ wd: 'trsDrill' }] },
        { h: 'Go or no-go?', blocks: [{ wd: 'gonogo' }] },
      ],
    },
  },

  check: [
    {
      q: 'In the northern hemisphere you stand with your back to the wind. Where is the low?',
      options: ['On your left, a little ahead', 'On your right', 'Straight ahead', 'Behind you'],
      answer: 0,
      why: 'Buys Ballot’s law: NH – low on the left; SH – low on the right.',
    },
    {
      q: 'Isobars get closer together on the forecast chart. What happens to the wind?',
      options: ['It gets stronger', 'It gets lighter', 'It turns calm', 'Nothing – only direction changes'],
      answer: 0,
      why: 'Close isobars mean a steep pressure gradient and strong wind.',
    },
    {
      q: 'Which cloud sequence warns of an approaching warm front?',
      options: ['Cirrus → cirrostratus → altostratus → nimbostratus', 'Cumulus → cumulonimbus → cumulus', 'Stratus → fog → stratus', 'Cumulonimbus → cirrus → clear sky'],
      answer: 0,
      why: 'The warm frontal surface slopes gently, so the high cloud arrives first, up to a day ahead.',
    },
    {
      q: 'A cold front passes in the northern hemisphere. What does the wind usually do?',
      options: ['Veers sharply, e.g. SW to NW, with gusts', 'Backs from W to S', 'Dies away to calm', 'Stays the same'],
      answer: 0,
      why: 'A sharp veer, squalls and a rising barometer are the signs of a cold front (it backs in the SH).',
    },
    {
      q: 'From which direction do the trade winds blow in the southern hemisphere?',
      options: ['South-east', 'North-east', 'West', 'South-west'],
      answer: 0,
      why: 'Air flowing to the equator is turned left in the SH, so the trades come from the SE.',
    },
    {
      q: 'What is force 6 on the Beaufort scale?',
      options: ['Strong breeze, 22–27 kn', 'Gale, 34–40 kn', 'Moderate breeze, 11–16 kn', 'Fresh breeze, 17–21 kn'],
      answer: 0,
      why: 'F4 moderate, F5 fresh, F6 strong breeze, F7 near gale, F8 gale.',
    },
    {
      q: 'Advection fog over the sea: what will clear it?',
      options: ['A change of air mass, e.g. a front passing', 'More wind', 'The morning sun', 'The ebb tide'],
      answer: 0,
      why: 'Sea fog forms in warm moist air over a cold sea and can persist in quite strong winds.',
    },
    {
      q: 'The forecast says "gale imminent". When is it expected?',
      options: ['Within 6 hours', 'In 6–12 hours', 'In more than 12 hours', 'It is already blowing'],
      answer: 0,
      why: 'Imminent < 6 h, soon 6–12 h, later > 12 h.',
    },
    {
      q: 'Why does the direct route from the Canaries to the Caribbean often take longer?',
      options: ['It passes close to the light winds of the Azores high', 'It is much longer', 'It meets the doldrums', 'It is against the trade winds'],
      answer: 0,
      why: 'Going south first puts you in the steady trades away from the high’s light centre.',
    },
    {
      q: 'In the northern hemisphere you are in the dangerous semicircle of a hurricane. How should you sail?',
      options: ['Wind on the starboard bow, making as much way as possible', 'Wind on the port quarter', 'Run straight downwind', 'Heave to and wait'],
      answer: 0,
      why: 'That takes you away from the track; in the navigable semicircle you put the wind on the starboard quarter.',
    },
  ],

  ui: {
    chapters: 'Chapters',
    disclaimer: 'Charts, fields and numbers here are simplified for training. For real passages use official forecasts.',
    play: 'Play',
    pause: 'Pause',
    hemi: 'Hemisphere',
    nh: 'Northern',
    sh: 'Southern',
    correct: 'Correct!',
    wrong: 'Not quite.',
    next: 'Next',
    again: 'Play again',
    score: '{score}/{max} correct',
    check: 'Check',
    round: 'Question {n} of {m}',
    final: { title: 'Final check', intro: 'Ten questions on the whole lesson. The options are shuffled each time.' },
    compass: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    globe: {
      title: 'Global circulation and wind belts',
      month: 'Month',
      hint: 'Click a belt to read about it. Move the month to see the belts follow the Sun.',
      cells: 'Hadley · Ferrel · Polar cells',
      bands: {
        polarE: { name: 'Polar easterlies', text: 'Cold air sinking over the poles spreads out and is turned west by Coriolis: E–NE winds in the north, E–SE in the south.' },
        subpolar: { name: 'Subpolar lows / polar front', text: 'Cold polar air meets warm air from the south. Waves on this front grow into the depressions that cross Europe.' },
        westerlies: { name: 'Westerlies', text: 'Between the highs and the polar front the wind blows mainly from the west, carried along by a stream of lows. In the south, with little land, they are the Roaring Forties and Furious Fifties.' },
        horse: { name: 'Subtropical highs (horse latitudes)', text: 'Air sinks at about 30°: large, slow highs like the Azores high. Light winds, clear skies – the deserts lie under them on land.' },
        trades: { name: 'Trade winds', text: 'Air returning to the equator is turned west: steady NE trades in the north and SE trades in the south, 15–25 kn with small cumulus clouds.' },
        itcz: { name: 'Doldrums (ITCZ)', text: 'The two trade winds meet where the Sun heats most. Air rises in huge cumulonimbus: calms, heavy rain and squalls. It moves north in the northern summer.' },
      },
    },
    pressure: {
      title: 'Wind round highs and lows',
      friction: 'Surface',
      frictionOpts: ['aloft (no friction)', 'over the sea', 'over land'],
      high: 'High',
      low: 'Low',
      note: 'Aloft the wind follows the isobars. Friction slows it and turns it in towards the low – more over land than over the sea.',
    },
    buys: {
      title: 'Buys Ballot’s law',
      windFrom: 'Wind from',
      rule: 'Back to the wind → the low is on your LEFT and a little ahead.',
      ruleS: 'Back to the wind → the low is on your RIGHT and a little ahead.',
      low: 'Low bears about {b}',
      high: 'High',
    },
    isobars: {
      title: 'Isobar spacing → wind speed',
      spacing: 'Distance between 4 hPa isobars',
      lat: 'Latitude',
      geo: 'Geostrophic wind',
      surface: 'Surface wind over the sea',
      force: 'Beaufort',
      note: 'Halve the spacing and the wind doubles. The same spacing gives more wind closer to the equator.',
    },
    clouds: {
      title: 'Cloud atlas',
      hint: 'Click a cloud.',
      bands: { high: 'High cloud > 6 km', mid: 'Middle cloud 2–6 km', low: 'Low cloud < 2 km', vertical: 'Vertical growth' },
      info: {
        ci: { name: 'Cirrus (Ci)', text: 'Thin white hair-like streaks of ice ("mares’ tails"). Increasing and thickening from the west: a front may arrive within a day.' },
        cc: { name: 'Cirrocumulus (Cc)', text: 'Small ripples high up – the "mackerel sky". Often ahead of a warm front.' },
        cs: { name: 'Cirrostratus (Cs)', text: 'A thin milky veil that gives a halo round the sun or moon. Rain likely within about 12 hours.' },
        ac: { name: 'Altocumulus (Ac)', text: 'Grey-white rolls or patches at middle level. Towers (castellanus) on a summer morning warn of thunderstorms later.' },
        as: { name: 'Altostratus (As)', text: 'A grey sheet; the sun shines through as if through frosted glass. The warm front is a few hours away.' },
        ns: { name: 'Nimbostratus (Ns)', text: 'Thick, dark, low layer with continuous rain or snow. Poor visibility – the warm front is here.' },
        sc: { name: 'Stratocumulus (Sc)', text: 'Lumpy grey layer with gaps. Usually dry; common in highs and in the warm sector.' },
        st: { name: 'Stratus (St)', text: 'Featureless low grey sheet, drizzle, hill tops hidden. Stable moist air – watch the visibility.' },
        cu: { name: 'Cumulus (Cu)', text: 'Heaped clouds with flat bases. Small ones = fair weather; growing tall = showers and gusts later.' },
        cb: { name: 'Cumulonimbus (Cb)', text: 'Huge towers with an anvil top: heavy showers, hail, thunder and squalls with gusts of 40 kn or more.' },
      },
    },
    symbols: {
      title: 'Synoptic chart symbols',
      hint: 'Click a symbol.',
      items: {
        cold: { name: 'Cold front', text: 'Blue line with triangles pointing the way it moves. Cold air undercuts warm air: squalls, heavy rain, then a veer (NH) and clearance.' },
        warm: { name: 'Warm front', text: 'Red line with semicircles. Warm air rides up over cold air: long spell of lowering cloud and rain ahead of it.' },
        occluded: { name: 'Occluded front', text: 'Purple line with triangles and semicircles together: the cold front has caught the warm front. Rain belt; the low is usually mature.' },
        stationary: { name: 'Stationary front', text: 'Alternating red semicircles and blue triangles on opposite sides: the front is hardly moving – a long belt of cloud and rain can sit over you.' },
        trough: { name: 'Trough', text: 'Line where the isobars bend sharply round a low. Showers, squalls and a wind shift as it passes.' },
        isobar: { name: 'Isobar', text: 'Line of equal pressure, labelled in hPa, usually every 4 hPa. Close together = strong wind.' },
        high: { name: 'High (H / anticyclone)', text: 'Centre of high pressure with its value. Settled weather, light winds near the centre.' },
        low: { name: 'Low (L / depression)', text: 'Centre of low pressure with its value. Cloud, rain, fronts, stronger winds.' },
      },
      barbs: 'Wind barbs (GRIB and station plots)',
      barbsText: 'The shaft points into the wind (where it comes from). Half barb = 5 kn, full barb = 10 kn, flag = 50 kn.',
    },
    passage: {
      title: 'A depression passes over a boat',
      time: 'Time',
      hours: '{h} h',
      labels: { pressure: 'Barometer', tendency: '3-hour tendency', wind: 'Wind', sky: 'Sky', weather: 'Weather', vis: 'Visibility', temp: 'Temperature', zone: 'Where the boat is' },
      tendency: ['steady', 'slowly', '', 'quickly', 'very rapidly'],
      rising: 'rising',
      falling: 'falling',
      section: 'Cross-section along the boat’s latitude (west ← → east)',
      barograph: 'Barograph at the boat',
      zones: {
        far: { name: 'Far ahead of the warm front', sky: 'cirrus, then a halo of cirrostratus', weather: 'dry', vis: 'good', temp: 'cool' },
        ahead: { name: 'Ahead of the warm front', sky: 'altostratus thickening to nimbostratus', weather: 'rain starting, becoming continuous', vis: 'moderate, becoming poor', temp: 'cool' },
        warmFront: { name: 'Warm front passing', sky: 'low nimbostratus and stratus', weather: 'steady rain easing to drizzle', vis: 'poor', temp: 'rising' },
        warmSector: { name: 'Warm sector', sky: 'stratus and stratocumulus', weather: 'drizzle, mist', vis: 'moderate to poor, fog possible', temp: 'mild' },
        coldFront: { name: 'Cold front passing', sky: 'cumulonimbus, dark squall line', weather: 'heavy rain, squalls, possibly hail', vis: 'very poor in rain', temp: 'falling sharply' },
        behind: { name: 'Behind the cold front', sky: 'cumulus, blue sky between showers', weather: 'showers, gusty', vis: 'very good', temp: 'cold' },
      },
    },
    seabreeze: {
      title: 'Sea breeze through the day',
      time: 'Time of day',
      gradient: 'Gradient wind (− offshore / + onshore)',
      land: 'Land',
      sea: 'Sea',
      result: 'Wind at the beach',
      onshore: 'onshore',
      offshore: 'offshore',
      calm: 'calm',
      sb: 'Sea breeze blowing',
      lb: 'Land breeze blowing',
      none: 'No local breeze',
      note: 'A strong offshore gradient wind kills the sea breeze; on a calm sunny day it can reach 15 kn.',
    },
    beaufort: {
      title: 'Beaufort scale',
      force: 'Force',
      kn: 'Wind',
      wave: 'Probable wave height',
      names: ['Calm', 'Light air', 'Light breeze', 'Gentle breeze', 'Moderate breeze', 'Fresh breeze', 'Strong breeze', 'Near gale', 'Gale', 'Severe gale', 'Storm', 'Violent storm', 'Hurricane'],
      sea: [
        'Sea like a mirror.',
        'Ripples, no foam crests.',
        'Small wavelets, crests glassy, not breaking.',
        'Large wavelets, crests begin to break, a few white horses.',
        'Small waves, fairly frequent white horses.',
        'Moderate longer waves, many white horses, some spray.',
        'Large waves, white foam crests everywhere, spray likely.',
        'Sea heaps up, white foam blown in streaks.',
        'Moderately high waves, crests break into spindrift, well-marked streaks.',
        'High waves, dense foam streaks, crests topple and roll over, spray affects visibility.',
        'Very high waves with long overhanging crests, sea looks white, visibility affected.',
        'Exceptionally high waves, small ships lost to view behind them.',
        'Air filled with foam and spray, sea completely white, visibility very seriously affected.',
      ],
      action: [
        'Motor or drift; check the forecast for wind later.',
        'Ghosting; light sails.',
        'Pleasant sailing for beginners.',
        'Ideal sailing, full sail.',
        'Good sailing; small boats start to think about reefing.',
        'Reef the main or roll some genoa; crew in harnesses at night.',
        'Two reefs, small headsail; Day Skipper limit for many crews.',
        'Deep reefs, storm jib ready; stay in harbour if you can.',
        'Gale: only if caught out – storm sails, heave to or run off.',
        'Survival conditions for small yachts.',
        'Survival conditions.',
        'Survival conditions.',
        'Survival conditions.',
      ],
    },
    trs: {
      title: 'Tropical revolving storm: the semicircles',
      hint: 'Click a boat to see what it should do.',
      dangerous: 'Dangerous semicircle',
      navigable: 'Navigable semicircle',
      path: 'In the path',
      track: 'Track of the storm',
      advice: {
        dangerous: 'Wind veers as the storm passes and the storm’s own motion adds to the wind; you could be blown into its path. Put the wind on the starboard bow and make as much way as possible away from the centre.',
        navigable: 'Wind backs; the storm’s motion reduces the wind and pushes you away from the track. Put the wind on the starboard quarter and run away from the centre.',
        path: 'Wind steady in direction, increasing, barometer falling fast. Run with the wind on the starboard quarter to get into the navigable semicircle.',
      },
      adviceS: {
        dangerous: 'Southern hemisphere: the dangerous semicircle is on the LEFT of the track and the wind backs. Wind on the port bow, make as much way as possible.',
        navigable: 'Southern hemisphere: the navigable semicircle is on the RIGHT; the wind veers. Wind on the port quarter and run.',
        path: 'Wind steady in direction and increasing. Run with the wind on the port quarter into the navigable semicircle.',
      },
    },
    forecast: {
      title: 'Decode the forecast',
      hint: 'Click the highlighted words.',
      sample:
        'Gale warning issued 0505 UTC. Ravensey: northwest [[severe|severe gale 9]] [[imminent]]. Saltmere: southwest [[gale|gale 8]] expected [[soon]].\nRavensey: Northwest 7 to severe gale 9, [[backing]] west 5 [[later]]. [[veryRough|Very rough]]. Squally showers. [[good|Good]].\nSaltmere: Southwest 5 to 7, [[veering]] west 6 to gale 8 later. [[modSea|Moderate]] [[becoming]] [[rough]]. Rain then showers. Good, [[occasionally]] [[poor]].\nGannet Bank: [[variable]] 3, becoming [[cyclonic]] 5 to 7. [[slight|Slight]]. [[fog|Fog patches]]. [[moderate|Moderate]] or [[veryPoor|very poor]].',
      terms: {
        imminent: 'Imminent: within 6 hours of the time of issue.',
        soon: 'Soon: 6 to 12 hours from the time of issue.',
        later: 'Later: more than 12 hours from the time of issue.',
        veering: 'Veering: the wind shifts clockwise (e.g. SW → W).',
        backing: 'Backing: the wind shifts anticlockwise (e.g. W → SW).',
        occasionally: 'Occasionally: for part of the time only.',
        becoming: 'Becoming: a change during the forecast period.',
        variable: 'Variable: light wind with no settled direction.',
        cyclonic: 'Cyclonic: the wind will change direction a lot as a low passes over or near the area.',
        gale: 'Gale (force 8): mean wind 34–40 kn, or gusts of 43–51 kn.',
        severe: 'Severe gale (force 9): 41–47 kn.',
        good: 'Good visibility: more than 5 nautical miles.',
        moderate: 'Moderate visibility: 2 to 5 nautical miles.',
        poor: 'Poor visibility: 1000 m to 2 nautical miles.',
        veryPoor: 'Very poor visibility: less than 1000 m.',
        fog: 'Fog: visibility less than 1000 m.',
        slight: 'Slight sea: waves 0.5 to 1.25 m.',
        modSea: 'Moderate sea: waves 1.25 to 2.5 m.',
        rough: 'Rough sea: waves 2.5 to 4 m.',
        veryRough: 'Very rough sea: waves 4 to 6 m.',
      },
    },
    drills: {
      synoptic: {
        title: 'Chart drill',
        intro: 'Isobars every 4 hPa. Each question is about the labelled points.',
        qStrong: 'At which point is the wind strongest?',
        qDir: 'From which direction does the wind blow at {p}?',
        qHigh: 'Which point has the highest pressure?',
        qFront: 'The cold front will soon pass {p}. What should the crew there expect?',
        frontN: ['Wind veers sharply, squalls, then the barometer rises and it clears', 'Wind backs and the rain eases slowly', 'Calm and fog', 'Wind and barometer stay the same'],
        frontS: ['Wind backs sharply (NW → SW), squalls, then the barometer rises', 'Wind veers from W to N', 'Calm and fog', 'Wind and barometer stay the same'],
        qLow: 'A crew at {p} stands with their back to the wind. On which side is the low?',
        chart: 'Chart {n} of {m}',
        whyStrong: 'The isobars are closest together at {p}: about {kn} kn.',
        whyDir: 'Along the isobars with the low on the {side}, turned in towards the low: about {dir}.',
        whyHigh: '{p} is nearest the high: about {hpa} hPa.',
        whyFrontN: 'Northern hemisphere cold front: sharp veer, squalls, pressure jump, then clear cold air.',
        whyFrontS: 'Southern hemisphere: the cold front brings a sharp BACK from NW to SW.',
        whyLow: 'Buys Ballot: {hemi} – low on the {side}.',
        left: 'left',
        right: 'right',
      },
      route: {
        title: 'Ocean passage: Gran Canaria → St Lucia',
        intro: 'Pick a month, click the chart to add up to 5 waypoints (or load a preset), then press Sail.',
        month: 'Month',
        monthNames: { nov: 'November', feb: 'February', jul: 'July (hurricane season)', sep: 'September (hurricane peak)' },
        presets: { rhumb: 'Direct route', butter: 'South till the butter melts', south: 'Too far south', north: 'Too far north' },
        add: 'Click the chart to add waypoints',
        undo: 'Undo',
        clear: 'Clear',
        sail: 'Sail!',
        days: 'Time',
        dayUnit: 'days',
        dist: 'Distance',
        avg: 'Average speed',
        calm: 'Hours in calms',
        gale: 'Hours in a gale',
        hurricane: '⚠️ {h} hours in the hurricane belt during the hurricane season – a real skipper would not go now.',
        land: '⛔ A leg crosses land. Move your waypoints.',
        best: 'Classic route this month: {d} days',
        verdict: { great: '★★★ Excellent routeing!', ok: '★★ Not bad – there is a faster way.', slow: '★ Slow – look at where the wind is.' },
        legend: 'Isobars round the Azores high · arrows: wind · shaded: doldrums',
      },
      order: {
        title: 'Put the depression in order',
        intro: 'A depression passes north of you (northern hemisphere). Tap the cards in the order you will see them.',
        cards: [
          'Cirrus streaks spread from the west; the barometer starts to fall',
          'A halo round the sun; the wind backs and freshens from the south',
          'Grey altostratus thickens and lowers; rain begins',
          'Steady rain from nimbostratus, barometer falling',
          'The wind veers south-west, the rain eases to drizzle',
          'Low stratus, drizzle and poor visibility in mild air',
          'A dark line of cumulonimbus: heavy rain and squalls',
          'The wind veers north-west, the barometer rises fast, clear cold air with showers',
        ],
        ok: 'Perfect sequence!',
        bad: 'Not quite – {n} cards in the right place. Compare with the correct order below.',
        reset: 'Try again',
      },
      beaufortGuess: { title: 'Guess the force', intro: 'Look at the sea and the wind instrument. What Beaufort force is it?', q: 'Which force?' },
      cloudGuess: { title: 'Cloud spotter', intro: 'Name the cloud, then say what it tells you.', q: 'What cloud is this?', q2: 'What does it usually mean?' },
      buysDrill: { title: 'Find the low', intro: 'The arrow shows where the wind is blowing to. Click the compass point where the low lies.', q: 'Where is the low?' },
      trsDrill: {
        title: 'Escape the storm',
        intro: 'A tropical revolving storm and your boat. Which semicircle are you in, and what do you do?',
        q: 'Where is the boat?',
        qAction: 'How do you sail?',
        actions: ['Wind on the starboard bow', 'Wind on the starboard quarter', 'Wind on the port bow', 'Wind on the port quarter'],
      },
      gonogo: {
        title: 'Go or no-go?',
        intro: 'You are the skipper. Read the situation and decide.',
        items: [
          {
            q: 'Day sail of 25 nm with a new crew in a 9 m yacht. Forecast: "SW 4 or 5, increasing 6 to 7 later. Rain then showers." It is 0800, passage 5 hours.',
            options: ['Go now with a reef, aim to arrive early afternoon, bolt hole planned', 'Go at 1600 when it has cleared', 'Go and shake out all reefs to be faster', 'Cancel – any F6 later means no sailing'],
            answer: 0,
            why: '"Later" is more than 12 h away: you will be in before the 6–7. Reef for the gusts and keep a bolt hole.',
          },
          {
            q: 'Thick sea fog in the harbour approach, wind SW 3. Your plan crosses a busy shipping lane. Forecast: "Fog patches, becoming good later."',
            options: ['Wait in harbour until the visibility improves', 'Go – the wind will blow the fog away', 'Go fast to spend less time in the lane', 'Go and rely on AIS only'],
            answer: 0,
            why: 'Advection fog is not cleared by wind. Crossing a lane in fog is a big risk – wait for "becoming good".',
          },
          {
            q: 'Barometer has fallen 7 hPa in the last 3 hours, wind backing SE and freshening, cirrostratus and a halo this morning. You are 15 nm from shelter.',
            options: ['Head for shelter now and reef early', 'Carry on – the forecast this morning was fine', 'Stop and anchor in the open bay', 'Wait to see what the wind does'],
            answer: 0,
            why: 'A fall of more than 6 hPa in 3 h warns of a gale. The signs of a warm front are all there – act early.',
          },
          {
            q: 'Settled high, sunny morning, light offshore wind 5 kn. Afternoon forecast: "Sea breezes developing". You plan to anchor off a beach for lunch.',
            options: ['Fine – but expect an onshore breeze of 10–15 kn in the afternoon: check the anchorage is safe in it', 'Fine – the wind will stay offshore all day', 'Cancel – sea breezes are dangerous', 'Anchor as close to the beach as possible'],
            answer: 0,
            why: 'The sea breeze will turn the anchorage into a lee shore in the afternoon. Plan the swing and an exit.',
          },
        ],
      },
    },
  },
}
