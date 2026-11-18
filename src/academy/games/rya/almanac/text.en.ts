import type { AlmanacText } from './text'

export const almanacEn: AlmanacText = {
  title: 'End-to-end passage planning with the almanac',
  intro:
    'Two harbours in a fictional area, their tide tables and a tidal stream atlas – then a step-by-step passage plan the RYA Day Skipper way: HW/LW, the depth gate, tidal streams, departure time, waypoints and course to steer.',
  chapters: {
    start: {
      title: 'Getting started: what is an almanac and what will we do?',
      short: 'Getting started',
      sections: [
        {
          h: 'The almanac = the navigator’s handbook',
          blocks: [
            {
              p: 'An almanac gathers everything you need to navigate a stretch of coast in one book: **tide tables** for the harbours, **tidal streams** (stream atlas and tidal diamonds), harbour and approach notes, lights, VHF channels and weather broadcasts. On the RYA Day Skipper theory course you practise all of this on a **fictional area**, and the exam questions use that training chart and almanac.',
            },
            {
              p: 'We built our own fictional area in the same spirit: **Saltmere Sound**. It has two harbours: **Port Halyard** (a standard port) and **Gannet Cove** (a secondary port with a drying bar at the entrance). Every table, stream and position was invented for this lesson.',
            },
            { warn: 'This area and all its data are imaginary. For real navigation always use official, up-to-date charts and almanacs.' },
          ],
        },
        {
          h: 'The scenario',
          blocks: [
            {
              ex: {
                title: 'Our task',
                lines: [
                  'Date: **Saturday 13 June** (summer time: local = UT + 1).',
                  'Boat: **Aurora**, 9.8 m, draught **1.8 m**, cruising speed **5 knots**.',
                  'From: Port Halyard marina. To: the anchorage in Gannet Cove.',
                  'Obstacle 1: the bar at the entrance to Gannet Cove **dries 0.6 m** → we can only cross it with enough tide.',
                  'Obstacle 2: off Kestrel Head the stream runs at **more than 2 knots** → leave at the wrong time and it will be against us.',
                ],
              },
            },
            {
              p: 'The question is simple: **What time do we leave, which tracks do we follow and what course do we steer on the compass?** By the end of the lesson we will have turned that into a one-page passage plan, step by step.',
            },
          ],
        },
        {
          h: 'Road map',
          blocks: [
            {
              steps: [
                '**Area and chart** – where are we going and what are the dangers?',
                '**Tidal terms** – CD, LAT, HAT, MHWS, MHWN, MLWN, MLWS, charted depth, drying height…',
                '**Port Halyard** – reading a standard port page and its tide table.',
                '**Gannet Cove** – times and heights from secondary port differences.',
                '**Tidal streams** – stream atlas, tidal diamonds, interpolating springs and neaps.',
                '**Passage plan 1** – HW/LW, the depth gate, streams, departure time and the overview.',
                '**Passage plan 2** – waypoints, tracks (°T → °M) and distances.',
                '**Course to steer** – allowing for the stream with a vector triangle.',
                '**Plan sheet** – everything on one page.',
                '**Practice** – solve other days yourself.',
              ],
            },
            { tip: 'The calculation boxes are live: move the sliders and watch the result change. The numbers in the text come from the same calculator.' },
          ],
        },
      ],
    },

    area: {
      title: 'Saltmere Sound: the area and the chart',
      short: 'Area and chart',
      sections: [
        {
          h: 'First look at the chart',
          blocks: [
            { aw: 'chart' },
            {
              p: 'Mainland to the north, open sea to the south. **Port Halyard** lies in an inlet to the west and little **Gannet Cove** to the east. The headland between them is **Kestrel Head**, with a lighthouse (Fl(3)15s42m16M) and a **tidal race** just off it where the stream kicks up rough water.',
            },
          ],
        },
        {
          h: 'What the symbols mean',
          blocks: [
            {
              list: [
                '**Halyard Fairway** buoy (red and white, LFl.10s): safe water mark for the approach to the harbour.',
                '**The Anvil**: a rock **drying 1.2 m** west of Gannet Cove, about a mile north of leg 2.',
                '**Gannet bar**: a sand bar **drying 0.6 m** across the entrance. Cross it on the **016°** transit of two green lights (Oc.G.4s).',
                '**◇A and ◇B**: tidal diamonds – the almanac gives the stream at these points hour by hour.',
                '**WPT1–WPT3**: the waypoints we are going to plan.',
              ],
            },
          ],
        },
        {
          h: 'Position and distance on the chart',
          blocks: [
            {
              p: 'Lines of latitude run across the chart; on the **latitude scale at the side, 1 minute = 1 nautical mile (M)**. The longitude scale is along the bottom and is **never used for distance**: at 47° N one minute of longitude is only ≈ 0.68 M.',
            },
            {
              ex: {
                title: 'Measuring a distance',
                lines: ['Open the dividers between the two points.', 'Without changing them, move them to the latitude scale **at the same latitude**.', 'Count the minutes: 6.6′ = **6.6 nautical miles**.'],
              },
            },
            { tip: 'In real planning OpenStreetMap/OpenSeaMap is handy for a first look, but depths and dangers must come from an official chart.' },
          ],
        },
      ],
    },

    terms: {
      title: 'Tidal terms: from chart datum to bridge clearance',
      short: 'Tidal terms',
      sections: [
        {
          h: 'Where it all starts: Chart Datum (CD)',
          blocks: [
            {
              p: 'Every depth on the chart and every tidal height in the almanac is measured from **the same zero**: **Chart Datum (CD)**. On modern charts CD ≈ **LAT** (Lowest Astronomical Tide – the lowest level predicted under average weather). The water hardly ever falls below CD, so a charted depth is the "worst case" depth.',
            },
            { aw: 'levels' },
            { tip: 'Move the height-of-tide slider: the deep spot gets deeper, the drying bank disappears under water and the clearance under the bridge shrinks.' },
          ],
        },
        {
          h: 'The tidal levels (Port Halyard values)',
          blocks: [
            {
              table: {
                head: ['Abbreviation', 'Stands for', 'Meaning', 'Port Halyard'],
                rows: [
                  ['**HAT**', 'Highest Astronomical Tide', 'Highest predicted level. Vertical clearances under bridges are measured from here.', '5.6 m'],
                  ['**MHWS**', 'Mean High Water Springs', 'Average high water at springs. Light elevations are usually measured from here.', '5.1 m'],
                  ['**MHWN**', 'Mean High Water Neaps', 'Average high water at neaps.', '4.0 m'],
                  ['**MSL**', 'Mean Sea Level', 'Average sea level.', '2.8 m'],
                  ['**MLWN**', 'Mean Low Water Neaps', 'Average low water at neaps.', '1.8 m'],
                  ['**MLWS**', 'Mean Low Water Springs', 'Average low water at springs – the shallowest "normal" moment.', '0.5 m'],
                  ['**LAT / CD**', 'Lowest Astronomical Tide / Chart Datum', 'Chart zero. Depths are measured down from it, drying heights up from it.', '0.0 m'],
                ],
              },
            },
            {
              p: 'Two important numbers follow: **mean spring range** = MHWS − MLWS = 5.1 − 0.5 = **4.6 m**, **mean neap range** = MHWN − MLWN = 4.0 − 1.8 = **2.2 m**. We will use them for the tidal stream rates.',
            },
          ],
        },
        {
          h: 'Depth terms',
          blocks: [
            {
              table: {
                head: ['Term', 'On the chart', 'Meaning'],
                rows: [
                  ['**Charted depth**', 'italic figure, e.g. 8', 'Depth **below** CD. In normal conditions the water is never shallower.'],
                  ['**Drying height**', 'underlined figure, e.g. 0̲6', 'Height of the seabed **above** CD. Dry at low water, covered as the tide rises.'],
                  ['**Height of tide**', 'worked out from the almanac', 'How far the water surface is above CD at a given moment.'],
                  ['**Depth of water**', 'worked out', 'The actual depth at that moment.'],
                  ['**Elevation**', 'e.g. 42m', 'Height of a light above MHWS (HAT on newer charts).'],
                  ['**Vertical clearance**', 'e.g. 18m', 'Height of a bridge or cable above HAT. The lower the tide, the more clearance.'],
                ],
              },
            },
            {
              ex: {
                title: 'Three quick sums (height of tide 3.0 m)',
                lines: [
                  'Charted depth 8 m near the fairway → depth of water = 8 + 3.0 = **11.0 m**.',
                  'Gannet bar dries 0.6 m → water over the bar = 3.0 − 0.6 = **2.4 m**. Draught 1.8 m → **0.6 m** under the keel.',
                  'Halyard bridge clearance 18 m (above HAT) → clearance = 18 + (5.6 − 3.0) = **20.6 m**.',
                ],
              },
            },
            { warn: 'You **add** a charted depth but **subtract** a drying height. Mixing up the sign is the classic way to run aground.' },
          ],
        },
        {
          h: 'Springs, neaps and the Moon',
          blocks: [
            {
              p: 'The Moon and the Sun make the tide. About **two days after** full and new moon they pull in line and the range is biggest: **springs** – higher highs, lower lows, faster streams. Around first and last quarter you get **neaps**.',
            },
            {
              list: [
                '**Range**: height difference between successive HW and LW.',
                '**Duration**: time from LW to HW (roughly 6 hours).',
                '**Tidal hour**: duration ÷ 6. If the duration is 6 h 27 min, one tidal hour is 64.5 minutes.',
                '**Rule of twelfths**: in tidal hours 1–6 the tide rises or falls 1, 2, 3, 3, 2, 1 twelfths of the range.',
              ],
            },
          ],
        },
        {
          h: 'Standard port and secondary port',
          blocks: [
            {
              p: 'For a **standard port** the almanac prints the HW/LW times and heights for every day (here: Port Halyard). Small harbours get no table of their own; they are **secondary ports** and the almanac only gives **time and height differences** from the standard port (here: Gannet Cove).',
            },
          ],
        },
      ],
    },

    halyard: {
      title: 'Port Halyard: the standard port page',
      short: 'Port Halyard',
      sections: [
        {
          h: 'How to read a harbour page',
          blocks: [
            { p: 'Every harbour page in an almanac follows the same order. Our Port Halyard page:' },
            {
              table: {
                head: ['Heading', 'Port Halyard (fictional)'],
                rows: [
                  ['**Position / chart**', '47°17′.4N 012°23′.5W · Saltmere Sound training chart'],
                  ['**Standard port**', 'Port Halyard (this page)'],
                  ['**Description**', 'Sheltered natural harbour running north, accessible at all states of tide. Marina on the east shore; fishing and ferry traffic.'],
                  ['**Approach waypoint**', 'Halyard Fairway SWM buoy, 47°15′.9N 012°23′.0W.'],
                  ['**Pilotage notes**', 'From the fairway steer 347° up the middle of the inlet. Keep clear of the 4–5 m shoal on the west side. Short steep sea at the entrance in southerly winds.'],
                  ['**Tidal streams**', 'Less than 0.5 kn inside. Offshore see ◇A.'],
                  ['**Lights and marks**', 'Fairway LFl.10s · Kestrel Head Fl(3)15s42m16M (≈ 10 M to the south-east).'],
                  ['**VHF**', 'Port Halyard Port Control Ch 12; marina Ch 80.'],
                  ['**Facilities**', 'Marina, fuel, water, shore power, shop, repairs.'],
                ],
              },
            },
          ],
        },
        {
          h: 'The tide table',
          blocks: [
            { aw: 'tideTable' },
            {
              steps: [
                '**Check the time zone.** The table is printed in **UT**. In summer time **add 1 hour**: 1018 UT → **1118 local**.',
                '**Find the day.** There are usually two HWs and two LWs a day (sometimes one slips to the next day – see 15 June).',
                '**Tell HW from LW.** The big heights are HW, the small ones LW.',
                '**Work out the range.** Morning of 13 June: LW 0412 **0.8 m**, HW 1018 **4.8 m** → range **4.0 m**.',
                '**Springs or neaps?** 4.0 m lies between neaps (2.2) and springs (4.6) but close to springs. Full moon is on the 14th, springs on the 16th.',
              ],
            },
            {
              ex: {
                title: 'Saturday 13 June, Port Halyard',
                lines: [
                  'LW **0412 UT** (0512 local) **0.8 m**',
                  'HW **1018 UT** (1118 local) **4.8 m**',
                  'LW **1636 UT** (1736 local) **0.9 m**',
                  'HW **2242 UT** (2342 local) **4.7 m**',
                  'Morning range: 4.8 − 0.8 = **4.0 m** → close to springs.',
                ],
              },
            },
          ],
        },
        {
          h: 'The tidal curve: height at any time',
          blocks: [
            {
              p: 'A real almanac has a **spring/neap curve** for each standard port: you find the time relative to HW along the bottom, read a **factor** off the curve and work out the height as LW + factor × range. We do the same job with the **rule of twelfths and tidal hours**; the curve below is drawn that way.',
            },
            { aw: 'curveHalyard' },
            {
              ex: {
                title: 'Height at Port Halyard at 0715 UT?',
                lines: [
                  'LW 0412 → HW 1018: duration 6 h 06 min → tidal hour = 366 ÷ 6 = **61 min**.',
                  '0715 is 183 min after LW = 183 ÷ 61 = **3 tidal hours**.',
                  'Twelfths: 1 + 2 + 3 = **6/12** → half the range.',
                  'Height = 0.8 + 4.0 × 6 ÷ 12 = 0.8 + 2.0 = **2.8 m** (exactly mean sea level).',
                ],
              },
            },
            { tip: 'Every height between table times works the same way: first count the **tidal hours**, then add up the **twelfths**.' },
          ],
        },
      ],
    },

    gannet: {
      title: 'Gannet Cove: working a secondary port',
      short: 'Gannet Cove',
      sections: [
        {
          h: 'Harbour page',
          blocks: [
            {
              table: {
                head: ['Heading', 'Gannet Cove (fictional)'],
                rows: [
                  ['**Position / chart**', '47°06′.9N 012°07′.4W · Saltmere Sound training chart'],
                  ['**Standard port**', 'Port Halyard (differences below)'],
                  ['**Description**', 'Small quiet cove east of Kestrel Head. Good shelter from north and west; open to the south.'],
                  ['**Approach waypoint**', 'WPT3 47°05′.0N 012°08′.0W'],
                  ['**Pilotage notes**', 'The entrance bar **dries 0.6 m**. Two green lights (Oc.G.4s) in line on **016°** lead over the bar. Swell from the south can break on the bar. Anchor inside in 2–3 m, sand.'],
                  ['**Tidal streams**', 'Off the cove see ◇B (over 2 kn off Kestrel Head). Almost no stream inside.'],
                  ['**Lights and marks**', 'Gannet Ldg Lts 016° Oc.G.4s · The Anvil (1̲2) ≈ 2.7 M west of the cove, unmarked!'],
                  ['**VHF**', 'None.'],
                  ['**Facilities**', 'None. Picnic area ashore.'],
                ],
              },
            },
          ],
        },
        {
          h: 'The differences box',
          blocks: [
            { aw: 'diffBox' },
            { p: 'The top rows give **Port Halyard’s times and levels**, the bottom row the **differences to apply for Gannet Cove**:' },
            {
              list: [
                'When HW Port Halyard is at **0000 or 1200**, HW Gannet is **40 min later** (+0040).',
                'When HW Port Halyard is at **0600 or 1800**, it is **20 min later** (+0020).',
                'For a time in between, **interpolate** in proportion.',
                'LW works the same: 0500/1700 → +0010, 1100/2300 → +0030.',
                'Heights: if HW Port Halyard is near MHWS (5.1) use −0.4 m; near MHWN (4.0) use −0.3 m; interpolate in between. For LW: MLWN −0.1, MLWS 0.0.',
              ],
            },
          ],
        },
        {
          h: 'Step by step: the morning HW on 13 June',
          blocks: [
            {
              ex: {
                title: 'Time',
                lines: [
                  'HW Port Halyard **1018 UT**. Table: 0600 → +0020, 1200 → +0040.',
                  '1018 is 4 h 18 min after 0600 → 258 ÷ 360 = **0.72** of the way.',
                  'Difference = 20 + 0.72 × (40 − 20) = 20 + 14.3 ≈ **+34 min**.',
                  'HW Gannet = 1018 + 0034 = **1052 UT** (1152 local).',
                ],
              },
            },
            {
              ex: {
                title: 'Height',
                lines: [
                  'HW Port Halyard **4.8 m**. MHWN 4.0 → −0.3; MHWS 5.1 → −0.4.',
                  '4.8 is (4.8 − 4.0) ÷ 1.1 = **0.73** of the way from 4.0 to 5.1.',
                  'Difference = −0.3 + 0.73 × (−0.1) = −0.37 ≈ **−0.4 m**.',
                  'HW Gannet = 4.8 − 0.4 = **4.4 m**.',
                ],
              },
            },
            {
              ex: {
                title: 'The LW before',
                lines: [
                  'LW Port Halyard **0412 UT, 0.8 m**. Table: 2300 → +0030, 0500 → +0010.',
                  '0412 is 5 h 12 min after 2300 → 312 ÷ 360 = 0.87 → difference = 30 − 0.87 × 20 ≈ **+13 min** → **0425 UT**.',
                  'Height: 0.23 of the way from MLWS 0.5 (0.0) to MLWN 1.8 (−0.1) → difference ≈ −0.02 ≈ 0.0 → **0.8 m**.',
                ],
              },
            },
            { aw: 'secondary' },
            { tip: 'In a real almanac you interpolate time differences with a small graph or in your head. A few minutes do not matter for navigation, but never get the **sign** (+/−) wrong.' },
          ],
        },
        {
          h: 'The tidal curve for Gannet Cove',
          blocks: [
            { p: 'With Gannet Cove’s times and heights we can draw its curve too. The green band is when we can **safely cross the bar** (we will work it out in the passage plan).' },
            { aw: 'curveGannet' },
          ],
        },
      ],
    },

    streams: {
      title: 'Tidal streams: the atlas and the diamonds',
      short: 'Tidal streams',
      sections: [
        {
          h: 'Terms',
          blocks: [
            {
              list: [
                '**Set**: the direction the stream flows **towards** (the opposite of wind!). 090° = flowing east.',
                '**Rate**: speed in knots. The distance it carries you in one hour is the **drift**.',
                '**Flood / ebb**: the stream with the rising / falling tide. **Slack**: the pause when it turns.',
                'Times are given **relative to HW at the standard port**: "HW−3 Port Halyard".',
              ],
            },
          ],
        },
        {
          h: 'The tidal stream atlas',
          blocks: [
            {
              p: 'The atlas is one chartlet per hour. Arrows show the direction, figures the rate. A real atlas prints two figures such as "09,18" (neaps 0.9 / springs 1.8 kn); our atlas shows a single figure already worked out for the day’s range: **16 = 1.6 kn**.',
            },
            { aw: 'atlas' },
            { tip: 'Slide from HW−6 to HW+6: until HW the stream runs **east and south (with us)**, after HW it turns **west and north (against us)**. It is strongest off Kestrel Head.' },
          ],
        },
        {
          h: 'Tidal diamonds and interpolating springs/neaps',
          blocks: [
            { p: 'For each ◇ on the chart the almanac (or the chart margin) has a table: **direction**, **spring rate** and **neap rate** for every hour. For the day itself you interpolate on the range:' },
            { p: '**Factor = (today’s range − neap range) ÷ (spring range − neap range)** → **rate = Np + (Sp − Np) × factor**' },
            { aw: 'diamonds' },
            {
              ex: {
                title: '13 June 0700 UT, ◇A',
                lines: [
                  'HW Port Halyard 1018 UT → 0700 UT = HW − 3 h 18 min → the **HW−3** row.',
                  '◇A HW−3: **180°**, Sp **1.8**, Np **1.0**.',
                  'Range 4.0 m → factor = (4.0 − 2.2) ÷ (4.6 − 2.2) = 1.8 ÷ 2.4 = **0.75**.',
                  'Rate = 1.0 + (1.8 − 1.0) × 0.75 = **1.6 kn**, direction 180°.',
                ],
              },
            },
            { tip: 'The "computation of rates" graph in a real almanac does the same linear interpolation with a ruler: mark the spring and neap rates, join them, and read across from the day’s range.' },
            { p: 'Use the range of the **tide** that is running at the time. We sail on the morning tide: **4.0 m**.' },
          ],
        },
      ],
    },

    plan: {
      title: 'Passage plan 1: tides, streams and departure time',
      short: 'Plan: tides and timing',
      sections: [
        {
          h: 'Step 1 – Where, with whom, in what boat?',
          blocks: [
            {
              p: 'Always start with the same questions: **From where to where? How far? Boat speed and draught? How experienced is the crew? What does the weather say?** The Day Skipper order is: weather, tides, dangers, bolt holes, crew.',
            },
            {
              ex: {
                title: 'Our answers',
                lines: [
                  'Port Halyard marina → Gannet Cove anchorage: **14.5 M** offshore, ≈ **19 M** including the harbour sections.',
                  'Aurora: 5 kn, draught 1.8 m. We want at least **0.5 m** under the keel.',
                  'Weather (fictional): westerly 3–4, good visibility. With wind and stream **going the same way** the Kestrel Head race stays calm.',
                  'Bolt hole: return to Port Halyard (accessible at all states of tide).',
                ],
              },
            },
          ],
        },
        {
          h: 'Step 2 – Write down HW and LW',
          blocks: [
            { p: 'Put both harbours’ tides for the day in one table, **in UT and local time**. Port Halyard comes straight from the table, Gannet Cove from the differences:' },
            {
              table: {
                head: ['', 'LW', 'HW', 'LW', 'HW'],
                rows: [
                  ['**Port Halyard** (UT)', '0412 · 0.8', '1018 · 4.8', '1636 · 0.9', '2242 · 4.7'],
                  ['**Port Halyard** (local)', '0512', '1118', '1736', '2342'],
                  ['**Gannet Cove** (UT)', '0425 · 0.8', '1052 · 4.4', '1647 · 0.9', '2318 · 4.3'],
                  ['**Gannet Cove** (local)', '0525', '1152', '1747', '0018 (next day)'],
                ],
              },
            },
            { p: 'Port Halyard morning range **4.0 m** → stream factor **0.75**. Range at Gannet Cove 4.4 − 0.8 = **3.6 m**.' },
          ],
        },
        {
          h: 'Step 3 – The depth gate: when is the bar open?',
          blocks: [
            { ex: { title: 'Height of tide needed', lines: ['Drying height **0.6** + draught **1.8** + clearance **0.5** = **2.9 m**.'] } },
            {
              ex: {
                title: 'When does the bar open? (rising tide)',
                lines: [
                  'Gannet LW 0425 **0.8 m** → HW 1052 **4.4 m**: range 3.6 m, duration 6 h 27 min → tidal hour **64.5 min**.',
                  'Rise needed: 2.9 − 0.8 = 2.1 m = 2.1 ÷ 3.6 × 12 = **7 twelfths**.',
                  'Twelfths: 1 + 2 + 3 = 6 (3 hours) → the 7th twelfth is a third of the 4th hour → **3⅓ tidal hours**.',
                  '3.33 × 64.5 = 215 min = 3 h 35 min → 0425 + 0335 = **0800 UT** (0900 local).',
                ],
              },
            },
            {
              ex: {
                title: 'When does it close? (falling tide)',
                lines: [
                  'HW 1052 **4.4 m** → LW 1647 **0.9 m**: range 3.5 m, duration 5 h 55 min → tidal hour **59.2 min**.',
                  'Fall allowed: 4.4 − 2.9 = 1.5 m = 1.5 ÷ 3.5 × 12 = **5.14 twelfths**.',
                  '1 + 2 = 3 (2 hours); the remaining 2.14 of the 3rd hour’s 3 twelfths → **2.71 tidal hours**.',
                  '2.71 × 59.2 ≈ 161 min = 2 h 41 min → 1052 + 0241 = **1333 UT** (1433 local).',
                ],
              },
            },
            { p: '**Bar window: 0800 – 1333 UT (0900 – 1433 local).** It is the green band on the curve:' },
            { aw: 'curveGannet' },
            { tip: 'If you can, arrive at a bar on a **rising tide**: if you touch, the tide lifts you off. Ground on a falling tide and you wait for the next one.' },
          ],
        },
        {
          h: 'Step 4 – Assess the tidal streams',
          blocks: [
            { p: 'Now look at the stream along the route hour by hour. HW Port Halyard is 1018 UT, so each "HW±n" row covers a clock-time band (e.g. HW−3 = 0648–0748 UT). Rates with factor 0.75:' },
            { aw: 'streamDay' },
            {
              list: [
                '**HW−6 → HW**: stream running south/east – **with us**. Strongest HW−4 to HW−2, up to 2.1 kn off Kestrel Head.',
                '**Around HW**: slack.',
                '**From HW+1**: turns west – **against us**; 2.0 kn off Kestrel Head at HW+3.',
              ],
            },
            { p: 'Conclusion: we must be past Kestrel Head **by about HW (≈ 1000–1030 UT)** at the latest; ideally between **HW−4 and HW−2**.' },
          ],
        },
        {
          h: 'Step 5 – Choose the departure time',
          blocks: [
            { p: 'Two rules on top of each other: (1) reach the bar **after 0800 UT**, (2) go while the stream is **with us**. The planner below works out the whole passage for any departure time from WPT1. Try the slider:' },
            { aw: 'departure' },
            {
              list: [
                '**0500 UT or earlier**: a fast trip, but we reach the bar before 0800 and must **wait** (⏳).',
                '**0530–0700 UT**: shortest passage (136 min), fair stream all the way, bar open ✅.',
                '**Around 0800 UT**: still fine, but the stream weakens and the trip gets longer.',
                '**0900 UT or later**: stream **against us** off Kestrel Head (⚠️); after 1000 the bar closes too (⛔).',
              ],
            },
            {
              ex: {
                title: 'Our decision',
                lines: [
                  'Leave WPT1 at **0630 UT = 0730 local**. Slip from the marina 30 min earlier: **0700 local**.',
                  'Arrive at the bar **0902 UT (1002 local)** with **3.7 m** of tide (2.9 needed → 0.8 m to spare) and the tide still rising.',
                  'Even an hour late (0730 UT) the plan still works: fair stream, bar open. That is our **safety margin**.',
                ],
              },
            },
          ],
        },
        {
          h: 'Step 6 – Overview of the plan',
          blocks: [
            { p: 'The overview is the short text you read to the crew at the briefing. It gives the **decisions and the reasons**, not every detail:' },
            { aw: 'overview' },
          ],
        },
      ],
    },

    route: {
      title: 'Passage plan 2: route and waypoints',
      short: 'Plan: route and WPTs',
      sections: [
        {
          h: 'Choosing waypoints',
          blocks: [
            {
              list: [
                'Put them in **safe water**: at least 1 M from dangers and races.',
                'Make them **easy to recognise**: near a buoy, headland or light.',
                'Avoid **needless turns**, but never cut corners towards the shore.',
                'Never put a waypoint **on top of a buoy** – at night or in fog you will hit it; offset it 0.1–0.2 M.',
              ],
            },
            { aw: 'chart' },
          ],
        },
        { h: 'Waypoint list and leg table', blocks: [{ aw: 'legs' }] },
        {
          h: 'Measuring track and distance on the chart',
          blocks: [
            {
              steps: [
                'Lay the parallel rule (or Portland/Breton plotter) along the line WPT1 – WPT2.',
                'Line the plotter grid up with the chart’s latitude/longitude lines and check the arrow points **the way you are going**.',
                'Read the true direction (**°T**): WPT1 → WPT2 = **156°T**.',
                'Take the distance with the dividers and read it on the **latitude scale**: **6.6 M**.',
                'Do the same for WPT2 → WPT3: **120°T, 7.9 M**.',
              ],
            },
          ],
        },
        {
          h: 'Checking by calculation (plane sailing)',
          blocks: [
            { p: 'A right-angled triangle is enough to check your measurement. The difference in latitude (d.lat) is already in miles; multiply the difference in longitude (d.long) by **cos(latitude)** to turn it into miles (departure):' },
            {
              ex: {
                title: 'WPT1 → WPT2',
                lines: [
                  'd.lat = 47°15′.0 → 47°09′.0 = **6.0′ south** = 6.0 M.',
                  'd.long = 012°22′.0W → 012°18′.0W = **4.0′ east** → × cos 47° (0.68) = **2.7 M**.',
                  'Angle = tan⁻¹(2.7 ÷ 6.0) = 24° → 24° east of south → 180 − 24 = **156°T**.',
                  'Distance = √(6.0² + 2.7²) = **6.6 M**.',
                ],
              },
            },
            {
              ex: {
                title: 'WPT2 → WPT3',
                lines: ['d.lat = **4.0′ south** = 4.0 M · d.long = **10.0′ east** × 0.68 = **6.8 M**.', 'Angle = tan⁻¹(6.8 ÷ 4.0) = 60° → 180 − 60 = **120°T**.', 'Distance = √(4.0² + 6.8²) = **7.9 M**.'],
              },
            },
          ],
        },
        {
          h: 'True (T) → Magnetic (M) → Compass (C)',
          blocks: [
            { p: 'The chart is drawn to **true north**, the compass points to **magnetic north**. The difference is **variation** (printed on the chart’s compass rose): **3°W** in Saltmere Sound.' },
            {
              list: [
                '**Westerly variation: add**: 156°T + 3° = **159°M**; 120°T + 3° = **123°M**.',
                '**Easterly variation: subtract**.',
                'Memory aid: "**West is best**" (with westerly variation the magnetic figure is bigger), "**East is least**".',
                'The boat’s own compass error is **deviation** (deviation card). Aurora’s deviation is negligible on these headings, so °M = compass course.',
              ],
            },
            { warn: '159°M and 123°M are **not the courses to steer** – they are only the **ground tracks**. The stream will push us sideways, so we will steer something else → next chapter.' },
          ],
        },
        {
          h: 'Dangers and check points',
          blocks: [
            {
              list: [
                '**Kestrel Head race**: WPT2 is ≈ 2.7 M WSW of the headland; leg 2 passes ≈ 2 M south of it.',
                '**The Anvil** (dries 1.2 m): ≈ 0.9 M north of leg 2. The stream pushes us **north** → without the CTS correction we drift towards the rock!',
                '**Gannet bar**: cross only inside the window and on the 016° transit.',
                'Checks: at WPT2 Kestrel Head light should bear ≈ 075°T; at WPT3 the leading lights should be in line (016°).',
              ],
            },
          ],
        },
      ],
    },

    cts: {
      title: 'Course to steer: staying on track in a stream',
      short: 'Course to steer',
      sections: [
        {
          h: 'Three different directions',
          blocks: [
            {
              list: [
                '**Ground track** (two arrows): the line we want to follow over the ground. Leg 1: 156°T.',
                '**Water track / heading** (one arrow): where the bow points and the boat moves through the water. This is what we steer.',
                '**Tidal stream** (three arrows): the direction and speed the water itself carries us.',
              ],
            },
            { p: 'The stream pushes the boat sideways. Point the bow straight at WPT2 and you will be off track before you get there. The fix is to aim slightly **up-stream**, into the side the stream comes from. That corrected course is the **course to steer (CTS)**.' },
          ],
        },
        { h: 'Step by step: the one-hour vector triangle', blocks: [{ aw: 'cts' }] },
        {
          h: 'Leg 1: WPT1 → WPT2',
          blocks: [
            {
              ex: {
                title: 'Leg 1',
                lines: [
                  'Track **156°T**, 6.6 M. Middle of the leg ≈ 0701 UT → **HW−3** → ◇A **180°, 1.6 kn**.',
                  'From WPT1 draw one hour of stream: 1.6 M towards 180°.',
                  'From the end of the stream arrow, open the dividers to **5 M** and cut the track.',
                  'The line to that cut points **149°T** → + 3° W → **152°M** = course to steer.',
                  'WPT1 → cut = **6.4 M** → SOG 6.4 kn → 6.6 ÷ 6.4 × 60 ≈ **62 min** → WPT2 at **0732 UT** (0832 local).',
                ],
              },
            },
            { p: 'The stream (180°) flows to the **right** of the track (156°) → it pushes us right → we turn the bow 7° **left** (to a smaller number).' },
          ],
        },
        {
          h: 'Leg 2: WPT2 → WPT3',
          blocks: [
            {
              ex: {
                title: 'Leg 2',
                lines: [
                  'Track **120°T**, 7.9 M. Middle of the leg ≈ 0809 UT → **HW−2** → ◇B **092°, 1.7 kn**.',
                  'The stream flows to the **left** of the track (north) → it pushes us towards The Anvil.',
                  'Triangle: CTS **129°T** → **132°M**, SOG **6.4 kn**.',
                  '7.9 ÷ 6.4 × 60 ≈ **74 min** → WPT3 at **0846 UT** (0946 local).',
                  'WPT3 → bar 1.2 M (16 min at 4.5 kn) → bar at **0902 UT** with **3.7 m** of tide ✅.',
                ],
              },
            },
          ],
        },
        {
          h: 'Leeway, long legs and checking',
          blocks: [
            {
              list: [
                '**Leeway**: under sail the wind pushes the boat downwind. After finding the CTS, turn the bow **towards the wind** by the leeway angle (e.g. wind from the south-west, 5° leeway → **137°M** instead of 132°M).',
                '**Legs longer than an hour**: add each hour’s stream vector end to end, then cut the track with the boat speed for the total time. Our legs take ≈ 1 hour, so we used the stream for the hour containing the **middle of the leg**.',
                '**Check**: if the GPS COG equals the track (156° / 120°T) your CTS is right. If the cross-track error grows, your stream estimate is off – correct it.',
              ],
            },
            { warn: 'Working out a CTS is not the end: fix your position every 15–30 minutes and check where you are against the plan.' },
          ],
        },
      ],
    },

    sheet: {
      title: 'The end-to-end plan sheet',
      short: 'Plan sheet',
      sections: [
        {
          h: 'Everything on one page',
          blocks: [{ p: 'The last step is to put all the work onto **one page** for the cockpit. This sheet lives by the helm or on the chart table.' }, { aw: 'sheet' }],
        },
        {
          h: 'Checklist',
          blocks: [
            {
              steps: [
                'Weather forecast (before leaving and again on the way).',
                'Tides: HW/LW at both harbours, range, springs/neaps.',
                'Depth gates (bars, shoals) and the safe window.',
                'Tidal streams: fair/foul hours, races.',
                'Departure time and safety margin.',
                'Waypoints, tracks (°T/°M) and distances.',
                'CTS, SOG and ETA for each leg.',
                'Dangers, clearing bearings, bolt holes.',
                'VHF channels, lights, crew briefing.',
              ],
            },
            { tip: 'This is also the order expected in the RYA Day Skipper exam: tides and timing first, then the route, and finally CTS and ETA.' },
          ],
        },
      ],
    },

    practice: {
      title: 'Practice: your turn',
      short: 'Practice',
      sections: [
        {
          h: 'Work out your own plan',
          blocks: [
            {
              steps: [
                'Pick a day (12, 14 or 15 June). The departure time from WPT1 is given.',
                'Read the morning HW/LW at Port Halyard and work out the range.',
                'Use the differences box for the Gannet Cove HW.',
                'Find when the bar opens with the rule of twelfths.',
                'Work out ◇A and ◇B rates for the hour containing the middle of each leg.',
                'Find each CTS with the vector triangle; use SOG for leg times and the bar ETA.',
                'Enter your answers and press **Check**. If you get stuck, go back to the earlier chapters.',
              ],
            },
            { aw: 'practice' },
            { tip: 'Small differences are normal: there is a tolerance of ±3–10 min on times and ±2° on courses. What matters is the method.' },
          ],
        },
        {
          h: 'Think about it',
          blocks: [
            {
              list: [
                'Why do you have to leave later on 15 June? (Hint: HW is ≈ 50 min later every day.)',
                'How would the bar window change with a draught of 2.2 m? (You would need 3.3 m of tide.)',
                'With an easterly force 5, at what times would the Kestrel Head race be dangerous?',
              ],
            },
          ],
        },
      ],
    },
  },

  check: [
    {
      q: 'What does an underlined **0̲6** on the chart mean?',
      options: ['Seabed drying 0.6 m above CD', 'A charted depth of 0.6 m', 'A bridge clearance of 0.6 m', '0.6 m below MHWS'],
      answer: 0,
      why: 'Underlined figures are drying heights: the seabed is above CD, so depth = height of tide − 0.6.',
    },
    {
      q: 'Charted depth 3.0 m, height of tide 2.4 m. What is the depth of water?',
      options: ['5.4 m', '0.6 m', '3.0 m', '2.4 m'],
      answer: 0,
      why: 'Charted depth is below CD, so add the height of tide: 3.0 + 2.4 = 5.4 m.',
    },
    {
      q: 'Neap range 2.2 m, spring range 4.6 m, today’s range 3.4 m. What is the stream factor?',
      options: ['0.50', '0.74', '0.25', '1.00'],
      answer: 0,
      why: '(3.4 − 2.2) ÷ (4.6 − 2.2) = 1.2 ÷ 2.4 = 0.5 → exactly halfway between neaps and springs.',
    },
    {
      q: 'HW Port Halyard is at 0600 UT. When is HW Gannet Cove?',
      options: ['0620 UT', '0640 UT', '0600 UT', '0610 UT'],
      answer: 0,
      why: 'The differences box gives +0020 for 0600 directly; no interpolation needed.',
    },
    {
      q: 'Variation 3°W. A track of 120°T is how much magnetic?',
      options: ['123°M', '117°M', '120°M', '126°M'],
      answer: 0,
      why: 'Westerly variation is added: West is best.',
    },
    {
      q: 'The stream flows to the left of your track. Which way do you alter the heading?',
      options: ['To the right (into the stream)', 'To the left', 'No correction needed', 'Just go faster'],
      answer: 0,
      why: 'The stream pushes you left; to counter it you point the bow right, towards where the stream comes from.',
    },
    {
      q: 'In summer time the table says HW 1018 UT. What does your watch say?',
      options: ['1118', '0918', '1018', '1218'],
      answer: 0,
      why: 'Summer time is UT + 1: 1118.',
    },
    {
      q: 'The bar dries 0.6 m, draught 1.8 m, you want 0.5 m under the keel. What height of tide do you need?',
      options: ['2.9 m', '2.3 m', '1.7 m', '3.5 m'],
      answer: 0,
      why: '0.6 + 1.8 + 0.5 = 2.9 m.',
    },
  ],

  ui: {
    ut: 'UT',
    local: 'local',
    height: 'Height',
    minutes: 'min',
    chapters: 'Chapters',
    disclaimer: 'Saltmere Sound, Port Halyard and Gannet Cove are fictional places invented for this lesson. All tables are imaginary – not for navigation.',
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    month: 'June',
    chart: {
      title: 'Saltmere Sound – training chart (fictional)',
      legs: 'Legs',
      diamonds: 'Tidal diamonds',
      streams: 'Tidal streams',
      hour: 'Stream hour',
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
      scale: '2 M',
      variation: 'Var 3°W',
    },
    levels: {
      title: 'Tidal levels and depths',
      hot: 'Height of tide',
      depthDeep: 'Depth at the deep spot',
      overBank: 'Water over the drying bank',
      dries: 'bank is dry',
      bridge: 'Clearance under the bridge',
      charted: 'Charted depth',
      drying: 'Drying ht',
      elevation: 'Light elevation (above MHWS)',
      clearance: 'Bridge clearance 18 m (above HAT)',
      formula: [
        'Depth of water = charted depth + height of tide',
        'Water over a drying area = height of tide − drying height',
        'Clearance under a bridge = charted clearance + (HAT − height of tide)',
      ],
    },
    table: {
      title: 'Port Halyard – tide table (10–16 June)',
      springs: 'Red date = springs',
      neaps: 'black = towards neaps',
      fullMoon: 'Full moon',
      range: 'Range',
      note: 'Time zone UT · add 1 hour for summer time · heights in metres above CD',
    },
    curve: {
      title: '{port} – tidal curve',
      pickDay: 'Day',
      pickTime: 'Time',
      need: '{h} m needed',
      window: 'Bar open: {open} → {close}',
      at: '{time}: height of tide ≈ {h} m',
    },
    diff: {
      title: 'Gannet Cove – secondary port differences',
      times: 'Times',
      heights: 'Heights (m)',
      hw: 'High water',
      lw: 'Low water',
      differences: 'Differences: GANNET COVE',
      stdPort: 'Standard port: PORT HALYARD',
      bar: 'The entrance bar dries {d} m (underlined 0̲6 on the chart).',
    },
    secondary: {
      title: 'Calculator: Gannet Cove time and height',
      pickDay: 'Day',
      pickEvent: 'Port Halyard tide',
      stepTime: 'Time: Port Halyard {kind} {t}. Table: {a} → {da}, {b} → {db}. {t} is {f} of the way between them → difference ≈ {raw} min → {d}.',
      stepHeight: 'Height: {h} m is {f} of the way from {lo} ({dlo}) to {hi} ({dhi}) → difference ≈ {raw} → {d} m.',
      result: 'Gannet Cove {kind}: {t} · {h} m',
    },
    diamonds: {
      title: 'Tidal diamonds ◇A and ◇B (relative to HW Port Halyard)',
      hour: 'Hour',
      dir: 'Dir',
      today: 'Today',
      range: 'Today’s range',
      calc: '◇{d} {hour}: {dir}, Sp {sp} / Np {np}. Range {range} m → factor {f} → rate = Np + (Sp − Np) × {f} = {rate} kn',
    },
    atlas: {
      title: 'Tidal stream atlas – hour by hour',
      hour: 'Relative to HW Port Halyard',
      clock: '13 June: {hour} = {time}. Range {range} m.',
      note: 'Figures are tenths of a knot: 16 = 1.6 kn. The stream is strongest between Kestrel Head and The Anvil.',
    },
    streamDay: {
      title: '13 June: streams along the route (factor 0.75)',
      hour: 'Hour',
      band: 'Band',
      verdict: 'For us',
      fair: 'fair ✅',
      foul: 'foul ⛔',
      slack: 'slack',
    },
    departure: {
      title: 'Departure time planner (13 June)',
      depart: 'Leave WPT1',
      castOff: 'Slip from marina',
      leg: 'Leg',
      stream: 'Stream',
      cts: 'CTS',
      sog: 'SOG / time',
      arrive: 'Arrive',
      bar: 'At the bar',
      total: 'Time at sea',
      ok: 'You reach the bar while it is open ✅.',
      early: 'You reach the bar too early ⏳ – not enough water yet, you must wait.',
      late: 'The bar has closed ⛔ – not enough water.',
      foulWarn: 'The stream is foul on one leg ⚠️.',
      fairNote: 'The stream is fair or slack all the way.',
      timeline: 'Timeline',
      windowLbl: 'Bar window',
      fairLbl: 'Fair stream (HW−6 … HW)',
      passageLbl: 'Passage',
      options: 'Options',
      verdict: 'Result',
    },
    overview: {
      title: 'Overview of the plan (13 June)',
      rows: ['Date / boat', 'Port Halyard (standard port)', 'Gannet Cove (secondary port)', 'Bar gate', 'Fair stream', 'Slip from marina', 'At the bar', 'At anchor'],
      text: 'On Saturday 13 June we slip from Port Halyard at {castOff} and clear WPT1 at {wpt1}. With a fair stream we round Kestrel Head and reach the Gannet bar via WPT3 at {bar}, with {h} m of tide and rising (the bar is open {open}–{close}). We should be anchored by about {anchor}. If we are delayed we must leave WPT1 by 0930 at the latest; otherwise we stay in Port Halyard. (All times local.)',
    },
    legs: {
      title: 'Waypoints and legs',
      wpts: 'Waypoint list',
      wpt: 'WPT',
      pos: 'Position',
      note: 'Note',
      wptNotes: [
        '≈ 1.1 M south-east of Halyard Fairway buoy; open water, clear of harbour traffic.',
        '≈ 2.7 M WSW of Kestrel Head; outside the race. The route turns east here.',
        'Gannet Cove approach waypoint; 1.2 M to the bar on the 016° transit.',
      ],
      legTable: 'Leg table',
      leg: 'Leg',
      trueT: 'Track °T',
      magM: 'Track °M',
      dist: 'Distance',
      work: 'Working',
    },
    cts: {
      title: 'CTS vector triangle',
      leg: 'Leg',
      custom: 'Custom',
      track: 'Track (°T)',
      set: 'Stream set',
      rate: 'Stream rate',
      speed: 'Boat speed (STW)',
      result: 'Steer {t}T = {m}M. The bow is {off}° {side} of the track. SOG {sog} kn.',
      left: 'left',
      right: 'right',
      tooStrong: 'The stream is stronger than the boat – this track cannot be held!',
      steps: [
        'Draw the track (ground track) and extend it (two arrows).',
        'From the start, draw one hour of stream: direction = set, length = rate (three arrows).',
        'Open the dividers to the boat speed (5 M) and, from the end of the stream arrow, cut the track.',
        'Stream end → cut = water track; its direction is the CTS (°T, one arrow).',
        'Start → cut = SOG (miles over the ground in one hour).',
        'Convert the CTS to magnetic (+3° W), add leeway if needed, and give it to the helm.',
      ],
      groundTrack: 'Track',
      waterTrack: 'CTS',
      streamVec: 'Stream',
    },
    sheet: {
      title: 'Passage plan sheet – Port Halyard → Gannet Cove',
      print: 'Print',
      header: ['Date', 'Boat', 'Route', 'Offshore distance', 'Time', 'Variation'],
      tides: 'Tides (local time · m)',
      summary: 'Range {range} m · stream factor {f} · bar ≥ {need} m {open}–{close} local',
      timeline: 'Timeline',
      events: ['Slip from marina (Port Halyard)', 'WPT1 – passage starts', 'WPT2 – alter course', 'WPT3 – approach, 016° transit', 'Gannet bar ({h} m of tide)', 'Anchor – Gannet Cove'],
      legsH: 'Legs',
      notesH: 'Notes and dangers',
      notes: [
        'Keep at least 1 M off the Kestrel Head race; further out with wind against tide.',
        'On leg 2 the stream sets north – watch The Anvil, hold the CTS, fix every 15 min.',
        'Cross the bar on the 016° transit; not outside 0900–1433 local.',
        'Delay: leave WPT1 by 0930 local at the latest, otherwise return to Port Halyard.',
        'VHF: Port Halyard Port Control 12, marina 80, distress 16.',
        'If early, wait near WPT3 (outside the bar) or slow down.',
      ],
    },
    practice: {
      title: 'Exercise: your own passage plan',
      pickDay: 'Day',
      intro: '{day} June. You leave WPT1 at {depart}. Use the tables to work out the following (times in UT as HHMM, e.g. 0745).',
      check: 'Check',
      reveal: 'Show answers',
      questions: [
        'Morning HW Port Halyard (UT)',
        'Port Halyard range, LW → HW (m)',
        'HW Gannet Cove (UT)',
        'HW height Gannet Cove (m)',
        'Bar opens (UT, ≥ 2.9 m)',
        'Leg 1 stream rate ◇A (kn)',
        'Leg 1 CTS (°M)',
        'Leg 2 stream rate ◇B (kn)',
        'Leg 2 CTS (°M)',
        'ETA at the bar (UT)',
      ],
      answer: 'answer:',
      score: '{score}/{max} correct',
    },
    check: { title: 'Test yourself', intro: 'A quick revision of the almanac work.', correct: 'Correct!', wrong: 'Not quite.', score: '{score}/{max} correct' },
  },
}
