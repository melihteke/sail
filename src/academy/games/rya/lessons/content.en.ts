import type { LessonSet } from './lessons'

export const lessonsEn: LessonSet = {
  sails: {
    title: 'Sails: hoisting, reefing, tacking and gybing',
    summary: 'Which line does what, the exact order for hoisting, reefing and dropping, points of sail, crew timing in a tack and gybe, and picking up a buoy under sail.',
    sections: [
      {
        h: 'The lines that work the sails',
        blocks: [
          {
            list: [
              '**Halyard**: hoists a sail. Held by a **jammer** (clutch) and tensioned on a **winch**.',
              '**Sheet**: trims a sail in and out. Mainsheet for the main, two jib sheets for the jib.',
              '**Kicking strap (kicker, vang)**: pulls the boom down so it does not lift.',
              '**Topping lift**: holds the boom up when the main is not carrying it (hoisting, reefing, dropping).',
              '**Furling line**: rolls the jib away round the forestay.',
              '**Reefing pennant**: pulls the new clew of a reefed main down to the boom; the **luff cringle** hooks onto the **rams-horn**.',
            ],
          },
          { tip: 'Rule of thumb: whatever stops the sail from moving freely (sheet, kicker) is **eased** before the sail goes up or down, and **tightened** again afterwards.' },
          { widget: 'rig3d' },
          { game: 'rig3d' },
        ],
      },
      {
        h: 'Hoisting the mainsail – the order',
        blocks: [
          {
            steps: [
              'Remove the sail cover.',
              'Remove the sail ties **and** turn the boat close to the wind (not straight into it).',
              'Ease the mainsheet **and** the kicking strap – the sail must be able to flap.',
              'Hoist on the halyard, watching the sail for snags. Winch the last part until the luff wrinkles disappear.',
              'Close the halyard jammer.',
              'Sheet in the mainsheet **and** ease the topping lift.',
              'Tighten the kicker **and** coil the halyard.',
              'Only now bear away and sail.',
            ],
          },
          { tip: 'Steps joined with **and** can be done in either order. Everything else must follow the list.' },
          { game: 'rig' },
        ],
      },
      {
        h: 'Jib: unfurling and furling',
        blocks: [
          {
            list: [
              '**Unfurl**: ease the furling line under control → pull the **leeward** jib sheet (the side away from the wind) → tidy the lines. Wind on the starboard side = pull the **port** sheet.',
              '**Furl**: ease the jib sheet but keep a little tension on it → pull the furling line → tidy. Never let the sheet fly: the jib flogs and rolls up loosely.',
            ],
          },
        ],
      },
      {
        h: 'Reefing and dropping the main',
        blocks: [
          {
            steps: [
              'Clip your harness on (you will go to the mast).',
              'Head close to the wind.',
              'Ease the kicker and the mainsheet.',
              'Take up the topping lift so the boom does not drop.',
              'Ease the halyard down to the reef.',
              'Hook the luff cringle on the rams-horn.',
              'Hoist the halyard tight again.',
              'Winch in the reefing pennant (the sail must still flap).',
              'Ease the topping lift, sheet in, tighten the kicker.',
              'Tie the loose sail with reef knots and tidy the lines.',
              'Bear away and sail.',
            ],
          },
          { ex: { title: 'Dropping the main', lines: ['Head close to the wind.', 'Topping lift up and kicker eased.', 'Lower the halyard.', 'Flake the sail on the boom.', 'Sail ties on and mainsheet in.', 'Tidy the lines and put the cover on.'] } },
        ],
      },
      {
        h: 'Points of sail',
        blocks: [
          { p: 'A yacht cannot sail closer than about **45°** to the wind (the no-go zone). The angle between the bow and the wind (TWA) gives the point of sail:' },
          {
            table: {
              head: ['TWA', 'Point of sail', 'Sails'],
              rows: [
                ['0–45°', 'No-go zone', 'flapping'],
                ['45–60°', 'Close-hauled', 'in tight'],
                ['60–80°', 'Close reach', 'slightly eased'],
                ['80–105°', 'Beam reach', 'half out'],
                ['105–155°', 'Broad reach', 'well out'],
                ['155–180°', 'Run', 'all the way out'],
              ],
            },
          },
          { p: 'Wind over the **starboard** side = **starboard tack**, the boom is out to port.' },
          { widget: 'points' },
          { p: '**Telltales** on the jib: windward one flutters → sheet in or bear away; leeward one flutters → ease the sheet. Both streaming = trimmed.' },
        ],
      },
      {
        h: 'Tacking: the crew\'s timing',
        blocks: [
          {
            steps: [
              'Skipper: "Ready about!" → load the **new** sheet on its winch (2–3 turns clockwise).',
              'Take the **working** sheet off the self-tailer, ready to release.',
              'Only now call "Ready!".',
              'Skipper: "Lee-oh!" – the bow turns into the wind.',
              'When the bow is **head to wind** (TWA between about +12° and −12°) let fly the old sheet.',
              'Haul in the new sheet **fast**, before the jib fills.',
              'Winch to trim: stop when both telltales stream. Too far and the sail stalls.',
            ],
          },
          { warn: 'Too early: the jib flogs and the boat stops. Too late: the jib backs and pushes the bow round too far.' },
        ],
      },
      {
        h: 'Controlled gybe',
        blocks: [
          {
            steps: [
              'Skipper: "Stand by to gybe!" → release the preventer.',
              'Sheet the main into the centre (boom within about 15° of the centreline).',
              'Call "Ready!" – the stern turns through the wind and the boom crosses gently.',
              'Ease the main out quickly on the new side (otherwise the boat rounds up into the wind).',
              'Sheet the jib on the new side – after the boom has crossed.',
            ],
          },
          { warn: 'A boom that crosses from far out is a **crash gybe**: it can injure crew and break gear.' },
          { game: 'tack' },
        ],
      },
      {
        h: 'Picking up a buoy under sail',
        blocks: [
          { p: 'Without an engine you brake by **spilling wind**. The mainsail can only spill when the wind is **forward of about the beam** (TWA below ~95°). With the wind behind, the main presses on the shrouds and keeps driving you.' },
          {
            steps: [
              'Decide your final heading: **into the stream**; with no stream, into the wind.',
              'Look at the wind on that heading.',
              'Wind forward of the beam (wind with stream, or no stream) → come in on the **mainsail only**, on a close reach (~60° TWA), easing it to slow down.',
              'Wind aft of the beam (**wind against stream**) → drop the main, come in on the **jib only** and furl it to slow down.',
              'Arrive with the bow at the buoy at walking pace (under 0.8 kn over the ground). Pick it up on the windward bow.',
            ],
          },
          { tip: 'In the game three stars = the right sail plan and no "too fast" passes. If you overshoot, circle round and come in slower.' },
          { game: 'buoy' },
        ],
      },
    ],
    check: [
      { q: 'Wind on the starboard side. Which sheet unrolls the jib?', options: ['The port (leeward) sheet', 'The starboard sheet', 'The furling line', 'The mainsheet'], answer: 0, why: 'The jib sets on the side away from the wind: with wind from starboard that is port.' },
      { q: 'When do you let fly the old jib sheet in a tack?', options: ['As the bow passes head to wind', 'When the skipper says "Ready about"', 'After the jib has filled on the new side', 'When the boom crosses'], answer: 0, why: 'Around head to wind (TWA ±12°): early stalls the boat, late backs the jib.' },
      { q: 'Wind against stream at a mooring buoy. Which sail?', options: ['Jib only', 'Main only', 'Both sails', 'None, drift down'], answer: 0, why: 'Heading into the stream you have the wind behind you; only the furling jib can be depowered.' },
      { q: 'What must be eased before hoisting the main?', options: ['Mainsheet and kicker', 'Topping lift', 'Jib sheets', 'Backstay'], answer: 0, why: 'Otherwise the sail fills while you hoist and jams.' },
    ],
  },

  ropes: {
    title: 'Knots, cleats and mooring lines',
    summary: 'The eight knots you need, making fast on a cleat, winches and jammers, and which mooring lines and fenders hold a boat in each kind of weather.',
    sections: [
      {
        h: 'A knot for every job',
        blocks: [
          {
            table: {
              head: ['Knot', 'Job'],
              rows: [
                ['Bowline', 'A fixed loop: jib sheets to the clew, a loop for mooring'],
                ['Clove hitch', 'Fenders on the guardrail, quick temporary hitch'],
                ['Figure-of-eight', 'Stopper at the end of a sheet so it cannot run out of a block'],
                ['Round turn & two half hitches', 'Line to a ring or post; can be released under load'],
                ['Sheet bend', 'Join two ropes, also of different thickness'],
                ['Reef knot', 'Reef points and sail ties – never for loads'],
                ['Rolling hitch', 'Grip a loaded rope to take the strain off (riding turn on a winch)'],
                ['Cleat hitch', 'Making a line fast on a cleat'],
              ],
            },
          },
          { tip: 'Memory hooks: **loop = bowline**, **fender = clove hitch**, **end of a sheet = figure-of-eight**, **ring = round turn**, **two ropes = sheet bend**.' },
          { game: 'knots' },
        ],
      },
      {
        h: 'Making fast on a cleat: O – X – O',
        blocks: [
          {
            steps: [
              '**O**: lead the line to the far horn and take a full **round turn** round the base. This takes the load and lets you ease or hold.',
              '**X**: cross over the top in a **figure-of-eight** – one, then a second for security.',
              '**O**: finish with a **locking hitch** (a figure-of-eight turned under).',
            ],
          },
          { warn: 'Never start with the locking hitch (it jams under load) and never wrap many turns – you could not release it in a hurry.' },
        ],
      },
      {
        h: 'Winches and jammers',
        blocks: [
          {
            list: [
              'Load a winch **clockwise** with 2–3 turns, keep tension, fingers away from the drum.',
              'Never wrap a rope round your hand.',
              'To open a jammer under load: winch in a little first so the winch holds the load, then open it.',
            ],
          },
        ],
      },
      {
        h: 'Mooring lines and what they do',
        blocks: [
          {
            table: {
              head: ['Line', 'Leads from → to', 'Stops the boat…'],
              rows: [
                ['Bow line', 'bow cleat → shore cleat **ahead** of the bow', 'moving back, bow blowing off'],
                ['Stern line', 'stern cleat → shore cleat **behind** the stern', 'moving forward, stern blowing off'],
                ['Bow spring', 'bow cleat → shore cleat **aft**, about amidships', 'surging forward'],
                ['Stern spring', 'stern cleat → shore cleat **forward**, about amidships', 'surging back'],
                ['Breast line', 'midships → straight across', 'moving sideways (short term only)'],
              ],
            },
          },
          { p: '**Springs** stop the boat surging fore and aft. **Bow and stern lines** hold the ends in. A line is only as good as its angle: the longer and flatter, the better.' },
        ],
      },
      {
        h: 'Fenders',
        blocks: [
          {
            list: [
              'Always fender the **beam** (widest point).',
              'Onshore wind pushes the whole hull against the pontoon: fenders at the **bow, beam and quarter**.',
              'Hang them at the height of the pontoon or of the other boat.',
            ],
          },
        ],
      },
      {
        h: 'In the Lines & Fenders game',
        blocks: [
          {
            table: {
              head: ['Weather', 'Lines (at least)', 'Fenders'],
              rows: [
                ['Light breeze', 'bow line + stern line', 'beam'],
                ['Surging stream', 'bow line, stern line, bow spring, stern spring', 'beam'],
                ['Onshore gale', 'bow line + stern line', 'bow, beam, quarter'],
                ['Offshore blow', 'bow line, stern line, bow spring, stern spring', 'beam'],
              ],
            },
          },
          { p: 'The boat\'s cleats are at the bow, midships and stern. Choose the shore cleat by the direction you want the line to lead: a bow line goes to a cleat ahead of the bow, a bow spring to one further aft.' },
          { tip: 'Pass = the boat moves less than 1.2 m, swings less than 16° and nothing scratches. Three stars = also every recommended line and fender.' },
          { game: 'lines' },
        ],
      },
    ],
    check: [
      { q: 'Which knot hangs a fender on the guardrail?', options: ['Clove hitch', 'Reef knot', 'Sheet bend', 'Figure-of-eight'], answer: 0, why: 'Quick to tie and easy to adjust in height.' },
      { q: 'Which lines stop a moored boat surging forward and back?', options: ['The springs', 'Breast lines', 'Fenders', 'Only the bow line'], answer: 0, why: 'Springs lead fore and aft along the hull and stop surging.' },
      { q: 'O-X-O on a cleat means…', options: ['Round turn, figure-of-eights, locking hitch', 'Locking hitch, round turn, locking hitch', 'Three round turns', 'Bowline over the horn'], answer: 0, why: 'The round turn holds the load, the eights secure it, the hitch locks it.' },
    ],
  },

  power: {
    title: 'Boat handling under power',
    summary: 'Why a yacht steers the way she does: propwash, pivot point, prop walk, wind and stream – and how to come alongside, spring off and moor stern-to.',
    sections: [
      {
        h: 'No water flow, no steering',
        blocks: [
          {
            list: [
              'The rudder only works with water flowing past it.',
              '**Ahead**: the propeller blows water straight over the rudder (propwash). Even from rest a short burst ahead turns the boat. **Rudder first, then power.**',
              '**Astern**: no propwash over the rudder. You only steer once the boat is really moving backwards.',
              'A yacht carries her way for a long time: go to neutral early.',
            ],
          },
        ],
      },
      {
        h: 'Pivot point',
        blocks: [
          {
            list: [
              'Going ahead the boat pivots about a third from the bow (near the mast): the **stern swings out** – watch it near other boats.',
              'Going astern the pivot moves aft: now the **bow swings** the most.',
            ],
          },
        ],
      },
      {
        h: 'Prop walk',
        blocks: [
          { p: 'A propeller also pushes the stern sideways, strongest when you go **astern from rest**. Most yachts have a right-handed propeller: in astern the **stern kicks to port** (the bow turns to starboard).' },
          {
            list: [
              '**Use it**: berthing port side to, the burst astern that stops you also pulls the stern in.',
              '**Expect it**: reversing straight, the stern first goes to port. Once you have sternway, correct with a little wheel to starboard.',
              '**Turning in your own length** (to starboard): wheel hard to starboard and leave it. Short burst ahead – the bow turns. Short burst astern – the boat stops and prop walk keeps the stern going to port. Repeat.',
            ],
          },
          { tip: 'In the game a red arrow at the stern shows prop walk when the help overlay is on.' },
        ],
      },
      {
        h: 'Wind and stream',
        blocks: [
          {
            list: [
              'A stopped boat drifts downwind, and the **bow blows off first** (more windage, less grip).',
              'Stream moves you like a conveyor belt. Berth **into the stream**: slow over the ground, but water over the rudder.',
              'Read the clues: flags, ripples, water piling up round posts, moored boats lying to the stream.',
            ],
          },
        ],
      },
      {
        h: 'Coming alongside',
        blocks: [
          {
            steps: [
              'Fenders and lines ready, crew briefed.',
              'Approach slowly at a shallow angle (20–30°), aiming at the front of the berth.',
              'Neutral early – let the boat glide.',
              'Close in, turn parallel; a short burst astern stops the boat.',
            ],
          },
          {
            table: {
              head: ['Condition', 'Technique'],
              rows: [
                ['No wind', 'Standard approach; the astern burst pulls the stern in (port side to).'],
                ['Onshore wind', 'Stop parallel 1–2 m off, upwind of the gap, and let the wind push you on.'],
                ['Offshore wind', 'Come in more positively, at the front third of the berth; lines ashore fast.'],
                ['Stream', 'Turn to face into the stream; hold position over the ground and let it carry you sideways in (ferry glide).'],
              ],
            },
          },
        ],
      },
      {
        h: 'Leaving: springing off',
        blocks: [
          { p: 'Pinned by an onshore wind with boats ahead and astern? Swing one end out with a spring.' },
          {
            steps: [
              'Slip the bow and stern lines, keep the **bow spring**. A fender at the bow.',
              'Wheel **towards** the pontoon and motor ahead firmly: the spring holds the bow, the stern swings out.',
              'When the stern is well out (30–40°): neutral, then astern.',
              'Slip the spring and reverse clear, then motor away.',
            ],
          },
          { tip: 'A **stern spring** works the other way round: motor astern against it and the bow swings out.' },
        ],
      },
      {
        h: 'Med-style stern-to',
        blocks: [
          {
            steps: [
              'Line up early, stern towards the gap.',
              'Get sternway, then steer with small rudder angles.',
              'Drop the anchor about **3–4 boat lengths (30–40 m)** from the quay as you pass.',
              'Keep reversing, stop with a touch ahead, lines ashore, tighten the chain.',
            ],
          },
        ],
      },
      {
        h: 'In the Harbour Handling game',
        blocks: [
          {
            list: [
              'Keys: ↑/↓ throttle in 10 % steps, ←/→ wheel, Space = neutral, C = amidships, P = pause.',
              'The dashed line shows where you will be in 8 seconds with the current controls – use it to plan.',
              'Touching a fendered pontoon below 0.3 m/s is free, up to 0.6 m/s counts as a bump, faster is a crash. Other boats and walls: only a gentle touch.',
              'Finish: stop in the green zone pointing like the green arrow and stay still for 1.5 seconds.',
              'Three stars: no bumps and within the par time.',
            ],
          },
          { game: 'harbour' },
        ],
      },
    ],
    check: [
      { q: 'Right-handed propeller, going astern from rest. The stern goes…', options: ['to port', 'to starboard', 'nowhere', 'forward'], answer: 0, why: 'Prop walk kicks the stern to port in astern.' },
      { q: 'You want to turn at rest. What first?', options: ['Wheel over, then a short burst ahead', 'Full ahead, then wheel', 'Astern with the wheel amidships', 'Wait for the wind'], answer: 0, why: 'The propwash hits the angled rudder and turns the boat in a small space.' },
      { q: 'Motoring ahead against which line swings the stern out?', options: ['Bow spring', 'Stern spring', 'Breast line', 'Stern line'], answer: 0, why: 'The bow spring holds the bow; the push ahead swings the stern away from the pontoon.' },
    ],
  },

  tides: {
    title: 'Tides made simple',
    summary: 'High and low water, range, depth, the rule of twelfths, tidal streams and tidal gates – step by step with worked examples.',
    sections: [
      {
        h: 'What is the tide?',
        blocks: [
          { p: 'Twice a day the sea rises and falls. The highest point is **high water (HW)**, the lowest **low water (LW)**. From LW to HW takes about **6 hours**, and from HW back to LW another 6.' },
          {
            list: [
              '**Height of tide**: how far the sea is above chart datum right now (from the tide table).',
              '**Range** = HW height − LW height.',
              '**Charted depth**: the depth printed on the chart, measured at chart datum (about the lowest possible tide).',
              '**Depth of water** = charted depth + height of tide.',
              '**Drying height**: an underlined number on the chart. That spot is that many metres **above** water at chart datum.',
            ],
          },
          { ex: { title: 'Depth right now', lines: ['Charted depth 2.0 m, height of tide 3.0 m.', 'Depth = 2.0 + 3.0 = **5.0 m**.', 'A bank that dries 1.5 m, height of tide 3.8 m: depth = 3.8 − 1.5 = **2.3 m**.'] } },
          { p: '**Why does it happen?** The Moon (and, less strongly, the Sun) pulls the sea towards it. This creates two “humps” of water in the ocean: one on the side facing the Moon and one on the opposite side. As the Earth turns, every coast passes through both humps – so there are **two high waters** and **two low waters** a day. When Sun and Moon are in line their pulls add up (**springs**, big range); at right angles they partly cancel out (**neaps**, small range).' },
          { widget: 'moon' },
        ],
      },
      {
        h: 'The rule of twelfths',
        blocks: [
          { p: 'The tide does not rise at a steady speed: slowly at first, fast in the middle, slowly at the end. The rule of twelfths splits the range into 12 equal parts:' },
          {
            table: {
              head: ['Hour after LW', 'Rises this hour', 'Risen in total'],
              rows: [
                ['1st', '1/12', '1/12'],
                ['2nd', '2/12', '3/12'],
                ['3rd', '3/12', '6/12'],
                ['4th', '3/12', '9/12'],
                ['5th', '2/12', '11/12'],
                ['6th', '1/12', '12/12 = HW'],
              ],
            },
          },
          { tip: 'Remember **1 – 2 – 3 – 3 – 2 – 1**. A falling tide works the same way down from HW.' },
          {
            steps: [
              'Look up the LW and HW times and heights.',
              'Range = HW − LW. One twelfth = range ÷ 12.',
              'Count the whole hours from LW to your time.',
              'Read the total twelfths for those hours (1, 3, 6, 9, 11, 12).',
              'Height = LW height + twelfths × one twelfth.',
            ],
          },
          { ex: { title: 'Height at 11:00', lines: ['LW 07:00 0.8 m, HW 13:00 5.0 m.', 'Range = 5.0 − 0.8 = 4.2 m → one twelfth = **0.35 m**.', '11:00 is 4 hours after LW → **9/12**.', 'Rise = 9 × 0.35 = 3.15 m.', 'Height = 0.8 + 3.15 = **3.95 m**.'] } },
          { widget: 'twelfths' },
        ],
      },
      {
        h: 'When is there enough water?',
        blocks: [
          { p: 'To cross a bar or enter a harbour you need a minimum depth. Work out the height of tide you need, then find when the tide reaches it.' },
          {
            steps: [
              'Needed height = drying height + draught + safety clearance (over a spot with charted depth: draught + clearance − charted depth).',
              'Subtract the LW height: how much the tide must rise.',
              'Divide by one twelfth: how many twelfths that is.',
              'Find in the table after which hour you have that many.',
            ],
          },
          {
            ex: {
              title: 'Crossing the Kingsport bar',
              lines: [
                'Bar dries 1.5 m, draught 1.8 m, clearance 0.5 m → need 1.5 + 1.8 + 0.5 = **3.8 m**.',
                'Rise needed above LW: 3.8 − 0.8 = 3.0 m → 3.0 ÷ 0.35 ≈ **8.6 twelfths**.',
                'After 3 hours: 6/12 = 2.9 m – not enough. After 4 hours: 9/12 = 3.95 m – enough.',
                'So the bar opens shortly before **LW + 4 h ≈ 10:50**.',
                'On the falling tide it closes the same time before the next LW: about **HW + 2 h ≈ 15:10**.',
              ],
            },
          },
          { warn: 'Always keep a margin. Waves, high air pressure and offshore wind can make the water lower than predicted.' },
        ],
      },
      {
        h: 'Tidal streams',
        blocks: [
          { p: '**What is a current?** A current is water **moving** sideways from one place to another – like a river in the sea. A boat moves through the water; if the water itself moves, it carries the boat with it. At sea you meet four kinds of current:' },
          {
            table: {
              head: ['Kind of current', 'Why it happens', 'Example'],
              rows: [
                ['Tidal stream', 'Water flowing to and from the coast as the sea rises and falls under the pull of Moon and Sun', 'English Channel, Dutch coast – changes direction about every 6 hours'],
                ['Ocean current', 'Steady winds, differences in temperature and saltiness, the turning of the Earth', 'Gulf Stream – always flows the same way'],
                ['Wind-driven current', 'Days of wind from one direction dragging the surface water along', '0.5–1 kn along the coast after a gale'],
                ['River and strait current', 'River water, or a difference in level and saltiness between two seas', 'Bosphorus – from the Black Sea to the Sea of Marmara'],
              ],
            },
          },
          { p: '**Why is there a tidal stream?** If the sea is going to rise 4 m at the coast, that much water has to **come in** from the open sea; when it falls, the same water **goes back out**. That moving water is the tidal stream. The stream while the tide rises is the **flood**, while it falls the **ebb**. The short quiet moment when it turns is **slack water**.' },
          {
            list: [
              'The direction of a stream is where the water is **going to** (the **set**; 090° = flowing east). Its speed is in knots (the **rate**). Careful: wind is the other way round – wind is named after where it **comes from**.',
              '**It behaves like the rule of twelfths**: weak around HW and LW, strongest in the middle of the tide (3rd and 4th hours).',
              '**Springs** (around new and full moon) = strong streams; **neaps** (half moon) = weak streams, roughly half. See the Moon animation in “What is the tide?”.',
              '**Speed over the ground (SOG)** = boat speed ± stream. A fair stream adds, a foul stream subtracts; a cross stream **pushes** you off your line.',
            ],
          },
          { widget: 'stream' },
          { ex: { title: 'Fair or foul?', lines: ['In still water, 18 NM at 5 kn = **3 h 36 min**.', 'With 2 kn fair on average: 5 + 2 = 7 kn → about **2 h 35 min**.', 'With 2 kn foul: 5 − 2 = 3 kn → **6 hours**!', 'Same passage, only a different departure time: **3½ hours difference**.'] } },
          { p: '**Where does stream information come from?** Two sources: the **tidal stream atlas**, which shows a whole area, and **tidal diamonds** for particular spots on the chart. Both give the time relative to high water at a **reference (standard) port** – for example “3 hours before HW Dover”. So first you look up today’s HW time at that port in the tide table.' },
          { p: '**1) The tidal stream atlas** is a separate, thin booklet (in the UK the Admiralty “Tidal Stream Atlas” series; nautical almanacs such as Reeds contain the same pages). It has **13 pages**: **one chartlet for every hour** from 6 hours before HW to 6 hours after. Each chartlet has arrows: the **direction of the arrow** = where the water is going, the **thickness and length** = the speed. Numbers like **“14,26”** next to an arrow are tenths of a knot: **1.4 kn at neaps, 2.6 kn at springs**. The animation below is a simple drawing that works exactly like a real atlas page.' },
          {
            steps: [
              'Look up today’s HW time at the reference port in the tide table (for example 13:00).',
              'How many hours before or after HW is your time? (10:00 → HW−3). Open that page of the atlas.',
              'Find the arrow where you will be: read its direction and the “nn,ss” numbers.',
              'Springs or neaps today? Take that number; if it is in between, use a value in between.',
            ],
          },
          { widget: 'atlas' },
          { ex: { title: 'Reading the stream from the atlas', lines: ['HW today is 13:00 and you are at A at 10:00 → page **HW−3**.', 'The arrow at A points east and is marked **“14,26”**.', 'Springs today → **2.6 kn towards the east**. At neaps it would be **1.4 kn**.', 'At the same spot on the HW+3 page the arrow points **west**: the stream runs the other way. On the HW page there is only a circle: slack water.'] } },
          { p: '**2) A tidal diamond** is a **letter in a magenta ◊** on the chart (A, B, C…). In the chart margin there is a table: one column per letter, one row per hour (HW−6 … HW+6). Each row gives the **direction** and two rates: **Sp** (springs) and **Np** (neaps). A diamond describes one spot, so it is more precise than the atlas; the atlas shows the whole area at a glance. Part of a diamond table:' },
          {
            table: {
              head: ['Time', 'Set', 'Springs (kn)', 'Neaps (kn)'],
              rows: [
                ['HW −3', '045°', '2.4', '1.2'],
                ['HW −2', '050°', '2.0', '1.0'],
                ['HW −1', '060°', '1.0', '0.5'],
                ['HW', '140°', '0.2', '0.1'],
                ['HW +1', '220°', '1.0', '0.5'],
                ['HW +2', '230°', '2.1', '1.0'],
                ['HW +3', '225°', '2.5', '1.3'],
              ],
            },
          },
          {
            steps: [
              'Find the diamond closest to your route on the chart (for example ◊A).',
              'How many hours before or after HW is your time? Go to that row in the table.',
              'Find today’s range (HW − LW) in the tide table: closer to springs or to neaps? If in between, take a rate in between.',
              'Note the set and rate: the water is flowing **towards** that direction.',
            ],
          },
          { widget: 'diamond' },
          { ex: { title: 'What is the stream at 10:00?', lines: ['HW today 13:00 → 10:00 = **HW −3**.', 'Table: set 045°, springs 2.4 kn, neaps 1.2 kn.', 'Today’s range is 3.1 m: exactly halfway between the mean spring range of 4.2 m and the mean neap range of 2.0 m → rate ≈ (2.4 + 1.2) ÷ 2 = **1.8 kn**.', 'Result: the water is flowing **towards 045° at 1.8 kn**.'] } },
          { ex: { title: 'Cross stream: what if you do not correct?', lines: ['Your boat does 5 kn, the stream is 2 kn straight across.', 'Without correction you drift **2 NM sideways** every hour – 6 NM in 3 hours!', 'To stay on your line, point ≈ **24°** up into the stream. Choose “Across” in the stream animation and try it with the angle slider: at 0° you are pushed down, at 24° you are right on the line, at 40° you over-correct and climb above it.', 'Your speed over the ground drops a little: ≈ **4.6 kn**.'] } },
          { p: '**How many degrees? – the calculation.** The idea is simple: the boat has to turn into the stream just enough to **cancel** the speed at which the stream pushes you sideways. In other words, the “sideways part” of the boat’s speed must equal the stream. There are three ways – from easy to thorough:' },
          {
            steps: [
              '**Rule of 60 (in your head):** angle ≈ stream ÷ boat speed × 60. Example: 2 kn stream, 5 kn boat → 2 ÷ 5 = 0.4 → 0.4 × 60 = **24°**.',
              '**Exact formula (with a calculator):** sin(angle) = stream ÷ boat speed → angle = arcsin(0.4) = **23.6°**. Speed over the ground = boat speed × cos(angle) = 5 × 0.92 ≈ **4.6 kn**.',
              '**Vector triangle on the chart (the Day Skipper method):** from your start point draw one hour of stream (2 kn → 2 NM in the direction of the set). From the end of that arrow, open the dividers to your boat speed (5 NM) and mark where they cut the line you want to follow. The direction from the end of the stream arrow to that mark is **the course to steer**.',
              'The stream changes every hour, so redo the calculation **every hour** (or whenever the tidal diamond value changes).',
            ],
          },
          {
            table: {
              head: ['Stream ÷ boat speed', 'Rule of 60', 'Exact angle'],
              rows: [
                ['0.1 (e.g. 0.5 ÷ 5)', '6°', '6°'],
                ['0.2 (1 ÷ 5)', '12°', '12°'],
                ['0.3 (1.5 ÷ 5)', '18°', '17°'],
                ['0.4 (2 ÷ 5)', '24°', '24°'],
                ['0.5 (2.5 ÷ 5)', '30°', '30°'],
                ['0.6 (3 ÷ 5)', '36°', '37°'],
              ],
            },
          },
          { tip: 'The rule of 60 is good enough for everyday sailing. If the stream is more than half your boat speed, your speed over the ground drops a lot – then consider moving the passage to a time when the stream is weaker.' },
        ],
      },
      {
        h: 'Tidal gates: choosing the departure time',
        blocks: [
          { p: 'A **tidal gate** is a place that is only “open” at certain times – like a bridge that only lifts at certain hours. While the gate is closed you cannot get through, or it is very hard and dangerous. So you plan **backwards from the gate**.' },
          {
            list: [
              '**A shallow bar or harbour entrance**: open while there is enough **height of tide**.',
              '**A headland or a narrow channel**: open while the stream is **fair** or weak; wind against a strong stream makes dangerous seas.',
              '**A lock or marina sill**: open only during its **opening hours**.',
            ],
          },
          {
            steps: [
              'Find the window when the gate is open (enough water or a fair stream).',
              'Estimate how long the passage takes – **including the stream**.',
              'ETD (departure) = arrival time − passage time.',
              'Check the streams along the way; shift a little earlier or later to ride a fair stream for as long as possible.',
            ],
          },
          { widget: 'gate' },
          { ex: { title: 'Simple example: still water first, then the stream', lines: ['The gate (bar) opens at **10:50** and closes at **15:10**. Passage 18 NM, boat speed 5 kn.', 'Still water: 18 ÷ 5 = 3.6 h = **3 h 36 min** → earliest departure 10:50 − 3:36 ≈ **07:15**?', 'But in the morning the stream is **fair**: leave at 07:15 and you arrive at 10:17 – only 3.2 m over the bar. **Too early!**', 'Recalculate with the stream: earliest good departure ≈ **08:30**, latest ≈ **11:30** (with a foul stream you arrive at 15:04, just before the gate closes).', 'Lesson: the stream changes the passage time, and the passage time changes the arrival. **Always calculate with the stream.**'] } },
          {
            ex: {
              title: 'Kingsport: three departure times compared (HW 13:00)',
              lines: [
                'The stream is fair from 08:00 to 13:00, strongest 10:00–11:00; after HW it turns foul.',
                'Leave **06:00** → foul stream at first, arrive 09:27, 2.3 m over the bar: **too early** ✗',
                'Leave **09:00** → average ≈ 6.9 kn, arrive 11:37, 4.4 m: **you get in**, with a fair stream all the way ✔⭐⭐⭐',
                'Leave **12:00** → the stream turns foul, arrive 16:12, 2.7 m: **too late** ✗',
              ],
            },
          },
          { tip: 'Three stars in the game = enough water over the bar **and** an average of at least 6.6 kn (a fair stream for most of the way). Try departures between 08:30 and 10:00 in the planner above, then do the same in the game.' },
          { game: 'passage' },
        ],
      },
      {
        h: 'Tide and anchoring',
        blocks: [
          { p: 'At anchor the sea rises and falls all night, so the **depth keeps changing**. Before you settle, answer two questions: at **high water**, is my chain long enough? At **low water**, is there still water under my keel?' },
          { p: '**What is scope?** Scope = **length of chain ÷ depth of water**. 4 : 1 means “4 m of chain for every 1 m of depth”. The longer the chain, the more horizontal the pull on the anchor and the better it holds. Always use the depth at **high water**: if it is enough at the deepest moment of the night, it is enough all night.' },
          {
            table: {
              head: ['Situation', 'Scope', 'Chain if the HW depth is 6 m'],
              rows: [
                ['All chain, calm weather, short stop', 'at least 4 : 1', '24 m'],
                ['All chain, staying the night or the wind may increase', '5 : 1', '30 m'],
                ['All chain, strong wind', '7 : 1', '42 m'],
                ['Rope with a few metres of chain', '6 : 1 – 8 : 1', '36 – 48 m'],
              ],
            },
          },
          { tip: 'More than 7 : 1 is usually pointless: your swinging circle grows and you hit your neighbours. In the Anchor Bay game, three stars needs **between 4 : 1 and 7 : 1**.' },
          {
            steps: [
              'From the tide table, find the **HW** and **LW** heights for the night.',
              'Depth at HW = charted depth + HW height → chain at least **4 ×** that depth.',
              'Depth at LW = charted depth + LW height → under the keel = LW depth − draught; at least **0.5 m**.',
              'Do the same check for the **shallowest** point of your swinging circle (see the Anchoring lesson).',
            ],
          },
          { widget: 'tideanchor' },
          { p: '**How to use the animation:** there are three sliders: **charted depth**, **chain** and **time**. Press ▶ to play the 12 hours, or drag the time slider yourself. Do the **practice tasks** under the picture in order: each one ticks itself ✔ when done; if you get stuck, read the 💡 hint.' },
          { ex: { title: 'Trap 1: anchor at low water, drag at high water', lines: ['Charted depth 3.0 m. You anchor in the evening at LW (0.6 m): depth 3.6 m.', '“Four times is enough”, so you let out 4 × 3.6 ≈ **15 m** of chain.', 'At midnight HW (4.2 m): depth 7.2 m → scope 15 ÷ 7.2 ≈ **2 : 1** → when the wind picks up, **the anchor drags**!', 'Correct: use the depth at HW → 4 × 7.2 ≈ **30 m** of chain.'] } },
          { ex: { title: 'Trap 2: anchor at high water, ground at low water', lines: ['Charted depth only 0.5 m. At HW (4.2 m) the depth is 4.7 m – it looks like “plenty of water”.', 'At night LW (0.6 m): depth 0.5 + 0.6 = **1.1 m**. Your draught is 1.8 m.', 'Result: **you go aground** – in the middle of the night, on a heeling boat.', 'Correct: check the depth at LW → 1.1 − 1.8 < 0.5 m → this spot is **no good**.'] } },
          { warn: 'After anchoring, set an **anchor alarm** (plotter or phone app) and check your position when the wind or the tide turns.' },
          { tip: 'For details see the **Anchoring** lesson; it explains the Anchor Bay game step by step. Then try it in **Anchor Bay**.' },
          { game: 'anchor' },
        ],
      },
    ],
    check: [
      { q: 'LW 06:00 1.0 m, HW 12:00 4.6 m. Height of tide at 09:00?', options: ['2.8 m', '2.2 m', '3.7 m', '1.9 m'], answer: 0, why: 'Range 3.6 m, one twelfth 0.3 m. 3 hours after LW = 6/12 = 1.8 m. 1.0 + 1.8 = 2.8 m.' },
      { q: 'Charted depth 1.2 m, height of tide 2.5 m. Depth of water?', options: ['3.7 m', '1.3 m', '2.5 m', '1.2 m'], answer: 0, why: 'Depth = charted depth + height of tide.' },
      { q: 'In which hours does the tide rise fastest?', options: ['3rd and 4th', '1st and 6th', '2nd and 5th', 'All the same'], answer: 0, why: '1-2-3-3-2-1: three twelfths in each of the middle hours.' },
      { q: 'Your boat does 5 kn, the stream is 1.5 kn against you. Speed over the ground?', options: ['3.5 kn', '6.5 kn', '5 kn', '1.5 kn'], answer: 0, why: 'A foul stream is subtracted: 5 − 1.5 = 3.5 kn.' },
      { q: 'You anchored at low water in 3.6 m with 15 m of chain. At high water the depth is 7.2 m. What happens?', options: ['Scope drops to ≈ 2 : 1, the anchor may drag', 'Nothing changes', 'There is only more water under the keel', 'You go aground'], answer: 0, why: '15 ÷ 7.2 ≈ 2 : 1. Always size the chain for the depth at high water: 4 × 7.2 ≈ 30 m.' },
      { q: 'Your boat does 6 kn, the stream is 2 kn straight across. Roughly how much correction to stay on your line?', options: ['≈ 20°', '≈ 2°', '≈ 45°', 'None'], answer: 0, why: 'Rule of 60: 2 ÷ 6 × 60 = 20°.' },
    ],
  },

  anchoring: {
    title: 'Anchoring: scope and swinging room',
    summary: 'How much chain to let out, how big your swinging circle is, and how to make sure you still float at low water – with a worked example.',
    sections: [
      {
        h: 'How an anchor holds',
        blocks: [
          { p: 'An anchor digs in when the pull on it is close to horizontal. The more chain, the flatter the pull. That is why the **scope** matters.' },
          {
            list: [
              '**Scope** = length of chain ÷ depth of water.',
              'All chain: at least **4 : 1**. Rope with some chain: at least **6 : 1**.',
              'Use the depth at **high water** (the deepest), or the scope shrinks when the tide comes in.',
              'In doubt, let out more – as long as you do not swing into others.',
            ],
          },
        ],
      },
      {
        h: 'Swinging circle',
        blocks: [
          { p: 'The boat swings round the anchor with every wind shift and turn of the tide. Its radius is about the horizontal length of chain plus half a boat length – roughly **chain + 5 m** for a 10 m yacht.' },
          {
            list: [
              'More chain = bigger circle.',
              'At low water the chain lies flatter, so the circle grows a little.',
              'Every point in the circle needs enough water at **low water**, and must be clear of rocks and of other boats\' circles.',
            ],
          },
          {
            ex: {
              title: 'Is this a good spot?',
              lines: [
                'Charted depth 4.0 m. Height of tide now 4.2 m, lowest tonight 0.6 m. Draught 1.8 m.',
                'Depth now: 4.0 + 4.2 = 8.2 m → chain at least 4 × 8.2 = **33 m** → take 35 m.',
                'Swinging radius ≈ 35 + 5 = **40 m**.',
                'Low water here: 4.0 + 0.6 = 4.6 m → **2.8 m** under the keel ✔.',
                'Now the whole circle: any point within 40 m with a charted depth below 1.8 + 0.5 − 0.6 = **1.7 m** would leave you aground or too close.',
              ],
            },
          },
          { widget: 'scope' },
        ],
      },
      {
        h: 'Dropping and checking',
        blocks: [
          {
            steps: [
              'Brief the crew; run slowly past the spot to check depth and room.',
              'Approach into the wind (or the stream if it is stronger) and stop.',
              'Drop the anchor and about a third of the chain, then drift or reverse back paying out the rest.',
              'Set the anchor with a short burst astern.',
              'Check with a transit or two bearings that you are not dragging. Show the anchor ball by day, the anchor light at night.',
            ],
          },
        ],
      },
      {
        h: 'In the Anchor Bay game',
        blocks: [
          { p: '**The goal:** anchor for the night in a bay. Twelve hours pass until morning; meanwhile the tide goes down and up and the wind goes round. The anchor must **not drag**, the boat must **not go aground**, and while swinging it must **not touch a rock or another boat**.' },
          {
            steps: [
              'Choose a bay at the top: **Mediterranean cove** (no tide, the wind goes round), **Tidal bay** (3.6 m range) or **Crowded anchorage** (4 boats, 2 rocks).',
              'Read the box: **height of tide now** (the highest of the night), **lowest tide tonight** and the **wind forecast**.',
              'Move the mouse over the chart: you see the **charted depth** of every point. Underlined numbers dry out.',
              'Pick a spot that is deep enough: charted depth ≥ 1.8 (draught) + 0.5 (margin) − lowest tide. Keep away from the shore – the boat swings round in a circle.',
              '**Click** the chart: the anchor goes down there. The box shows the **depth now**.',
              'Set the chain slider: at least **4 ×** the depth now, at most **7 ×**. The scope is shown under the slider.',
              'The blue **swinging circle** must **not touch** the shore, a rock or the orange dashed circles. If it does, choose another spot or shorten the chain a little.',
              'Press **Play the night** and watch.',
            ],
          },
          {
            table: {
              head: ['Bay', 'Tide (now / lowest)', 'Suggested charted depth', 'Chain'],
              rows: [
                ['Mediterranean cove', '0.3 / 0.1 m', '5.5 – 7 m', '25 m'],
                ['Tidal bay', '4.2 / 0.6 m', '3.5 – 4.5 m', '35 m'],
                ['Crowded anchorage', '3.0 / 0.4 m', '≈ 3 m', '25 m'],
              ],
            },
          },
          { ex: { title: 'Tidal bay, step by step', lines: ['Tide now 4.2 m, lowest tonight 0.6 m. Draught 1.8 m.', 'Minimum charted depth: 1.8 + 0.5 − 0.6 = **1.7 m**. Because the circle will be big, I pick a spot of ≈ **4 m**.', 'Depth now: 4 + 4.2 = **8.2 m** → chain at least 4 × 8.2 ≈ 33 m → **35 m** (at most 7 × 8.2 ≈ 57 m).', 'Swinging radius ≈ 35 + 5 = **40 m**. If that circle touches no rock and no other boat’s circle → Play the night → ⭐⭐⭐'] } },
          {
            list: [
              '**The anchor dragged** → scope below 4 : 1. Let out more chain.',
              '**Aground** → somewhere in your circle there is not enough water at low water. Choose a deeper spot.',
              '**Hit a rock or a boat** → your swinging circle reached a rock or another circle. Move, or shorten the chain a little (but not below 4 : 1).',
              '**Two stars** → you were safe, but the scope was more than 7 : 1 or the water under the keel dipped below 0.5 m.',
            ],
          },
          { game: 'anchor' },
        ],
      },
    ],
    check: [
      { q: 'Depth at high water 6 m, all chain. Minimum chain?', options: ['24 m', '12 m', '18 m', '6 m'], answer: 0, why: '4 × 6 m = 24 m.' },
      { q: 'Why use the depth at high water for the scope?', options: ['It is the deepest – at lower water the scope only gets better', 'The chart is drawn at high water', 'It is the same as low water', 'It does not matter'], answer: 0, why: 'If the scope is enough at the deepest moment, it is enough all the time.' },
      { q: '30 m of chain, 10 m boat. Approximate swinging radius?', options: ['35 m', '15 m', '30 m', '60 m'], answer: 0, why: 'Chain + half a boat length ≈ 30 + 5 m.' },
    ],
  },

  colregs: {
    title: 'Collision rules: who gives way and how',
    summary: 'Spot a risk of collision with compass bearings, know who gives way, and how a give-way and a stand-on vessel act – also in fog.',
    sections: [
      {
        h: 'Is there a risk of collision?',
        blocks: [
          { p: 'Take a compass bearing of the other vessel, wait a minute, take another, and another.' },
          {
            list: [
              'Bearing **steady** and range closing → **risk of collision**.',
              'Bearing **changing** clearly → she will pass ahead or astern.',
              'With large ships close by, even a slowly changing bearing can be dangerous.',
            ],
          },
          { ex: { title: 'Three bearings', lines: ['10:00 – 090°, 4.0 NM', '10:01 – 090°, 3.7 NM', '10:02 – 089°, 3.4 NM', 'Steady bearing, range closing → act now.'] } },
        ],
      },
      {
        h: 'Who gives way?',
        blocks: [
          {
            table: {
              head: ['Situation', 'Who keeps clear', 'Usual action'],
              rows: [
                ['Power vessels crossing', 'The one with the other on her **starboard** side', 'Turn to starboard, pass astern'],
                ['Power vessels head-on', 'Both', 'Both turn to starboard, pass port to port'],
                ['Overtaking', 'The overtaking vessel (power **or** sail)', 'Keep well clear'],
                ['Power and sail', 'Power', 'Pass astern of the sailing vessel'],
                ['Sail: port vs starboard tack', 'Port tack', 'Bear away, pass astern'],
                ['Sail: same tack', 'The windward boat', 'Keep clear'],
                ['Narrow channel', 'Small craft', 'Do not impede ships that can only use the channel'],
              ],
            },
          },
          { p: 'Pecking order (less manoeuvrable first): not under command → restricted in ability to manoeuvre → constrained by draught → fishing → sail → power.' },
        ],
      },
      {
        h: 'How to give way',
        blocks: [
          {
            list: [
              '**Early**: act while the other vessel is still far away (in the game: more than 2 NM).',
              '**Substantial**: at least 30° so it is obvious from the other ship, or slow right down / stop.',
              'Normally **to starboard**, passing astern of her. Never cross ahead.',
              'Keep taking bearings: the bearing must start to change.',
            ],
          },
        ],
      },
      {
        h: 'The stand-on vessel',
        blocks: [
          {
            list: [
              'Keep your **course and speed** so the other vessel can predict you.',
              'Take bearings and watch. If she clearly does not act, you may act – and when a collision can no longer be avoided by her alone, you must.',
              'Do **not** turn to port for a vessel on your port side.',
              'In the game: hold on until the range is under 1 NM.',
            ],
          },
        ],
      },
      {
        h: 'Restricted visibility (fog)',
        blocks: [
          { p: 'In fog there is **no stand-on vessel**. Everybody acts early and slows down.' },
          {
            table: {
              head: ['Vessel', 'Sound signal'],
              rows: [
                ['Power, making way', '▬ one prolonged every 2 min'],
                ['Power, stopped', '▬ ▬ two prolonged every 2 min'],
                ['Sail, fishing, NUC, RAM, CBD', '▬ • • one prolonged + two short'],
                ['At anchor', 'rapid bell for 5 s every minute'],
              ],
            },
          },
          {
            list: [
              'A radar contact **forward of the beam**: do not turn to port (except when overtaking it).',
              'A contact abeam or abaft the beam: do not turn towards it.',
              'Slowing down is always a good choice.',
            ],
          },
        ],
      },
      {
        h: 'In the Collision Course game',
        blocks: [
          {
            steps: [
              'Press Start, then **Take a bearing** at least twice, a few seconds apart. "steady!" means risk.',
              'Decide your role (give-way, stand-on, head-on, fog).',
              'Give-way: alter **+30°** (starboard) once or twice while the range is above 2 NM, or slow down.',
              'Stand-on: do nothing until the range is under 1 NM.',
              'Keep taking bearings until she is clearly passing.',
            ],
          },
          { p: 'Scoring: safe distance, bearings before acting, timing, size and direction of your action. In fog you also pick the right sound signal (power making way = one prolonged).' },
          { game: 'collision' },
        ],
      },
    ],
    check: [
      { q: 'Bearing steady, range closing. That means…', options: ['Risk of collision', 'She passes ahead', 'She passes astern', 'She is anchored'], answer: 0, why: 'A steady bearing on a closing vessel is the classic sign of a collision course.' },
      { q: 'Power vessels crossing. Who gives way?', options: ['The one with the other on her starboard side', 'The one with the other on her port side', 'The bigger one', 'The faster one'], answer: 0, why: 'Rule 15: the vessel that has the other on her starboard side keeps out of the way.' },
      { q: 'A good give-way action is…', options: ['Early and at least 30°, usually to starboard', 'A few degrees to port', 'Last-minute full speed ahead', 'Holding course'], answer: 0, why: 'It must be early and big enough for the other vessel to notice.' },
      { q: 'Fog signal of a power vessel making way?', options: ['One prolonged blast every 2 min', 'Two prolonged', 'One prolonged + two short', 'Five short'], answer: 0, why: '▬ every 2 minutes. Stopped: ▬ ▬.' },
    ],
  },

  lights: {
    title: 'Navigation lights: reading the night',
    summary: 'Masthead, side and stern lights, what each combination tells you about a vessel\'s type and heading, and the memory rhymes for special vessels.',
    sections: [
      {
        h: 'The basic lights',
        blocks: [
          {
            list: [
              '**Masthead light**: white, shines forward over 225° (power vessels only).',
              '**Sidelights**: **red on the port** side, **green on starboard**, each over 112.5° from ahead to just abaft the beam.',
              '**Sternlight**: white, shines aft over 135°.',
              '**All-round lights**: visible from every direction – used for special vessels and at anchor.',
            ],
          },
          { tip: 'Port wine is red: **red = port**.' },
        ],
      },
      {
        h: 'Which side am I looking at?',
        blocks: [
          {
            table: {
              head: ['You see', 'You are looking at her…', 'Meaning'],
              rows: [
                ['Red **and** green', 'bow, head-on', 'She is coming straight at you'],
                ['Red only', 'port side', 'She is crossing from your right to your left'],
                ['Green only', 'starboard side', 'She is crossing from your left to your right'],
                ['White only (low)', 'stern', 'You are overtaking her'],
              ],
            },
          },
          { tip: 'Her **red** light on your **starboard** bow: she is crossing from your starboard side – if she is a power vessel and so are you, you give way.' },
        ],
      },
      {
        h: 'What kind of vessel?',
        blocks: [
          {
            table: {
              head: ['Lights', 'Vessel'],
              rows: [
                ['1 white masthead + sidelights + sternlight', 'Power vessel under 50 m'],
                ['2 white masthead (aft one higher) + sides + stern', 'Power vessel over 50 m'],
                ['Sidelights + sternlight, **no** masthead light', 'Sailing vessel'],
                ['Green over white all-round', 'Trawler'],
                ['Red over white all-round', 'Fishing (not trawling)'],
                ['Red over red all-round', 'Not under command'],
                ['Red – white – red all-round', 'Restricted in ability to manoeuvre'],
                ['Three red all-round', 'Constrained by her draught'],
                ['One white all-round', 'At anchor (under 50 m)'],
              ],
            },
          },
          { list: ['"**Green over white – trawling tonight.**"', '"**Red over white – fishing at night.**"', '"**Red over red – the captain is dead.**" (not under command)'] },
          { widget: 'lights' },
        ],
      },
      {
        h: 'In the Night Look-out game',
        blocks: [
          {
            steps: [
              'Start the watch and tap a light on the horizon.',
              'Take two bearings at least a minute apart (game time). "steady!" = risk.',
              'Name the vessel type from the lights.',
              'Say which side you see: red+green = head-on, red = port side, green = starboard side, white only = stern, single all-round light = all-round.',
              'Report risk or clear.',
            ],
          },
          { p: 'Each correct answer scores a point. Three correct per vessel is perfect.' },
          { game: 'lookout' },
        ],
      },
    ],
    check: [
      { q: 'You see only a green light. You are looking at her…', options: ['starboard side', 'port side', 'stern', 'bow'], answer: 0, why: 'Green is the starboard sidelight.' },
      { q: 'Two red all-round lights, one above the other?', options: ['Not under command', 'Fishing', 'Constrained by draught', 'At anchor'], answer: 0, why: '"Red over red, the captain is dead."' },
      { q: 'Sidelights and sternlight but no white masthead light?', options: ['A sailing vessel', 'A small power vessel', 'A trawler', 'A ship at anchor'], answer: 0, why: 'Power vessels show a masthead light; sailing vessels do not.' },
    ],
  },

  pilotage: {
    title: 'Passage planning and pilotage',
    summary: 'What goes into a passage plan, how to pilot with transits and bearings, and how to use a clearing bearing to stay off a danger.',
    sections: [
      {
        h: 'The passage plan',
        blocks: [
          {
            list: [
              '**How far and how long**: distance ÷ boat speed, corrected for the stream.',
              '**Tides**: heights for harbours and bars, streams along the way (see the tides lesson).',
              '**Constraints**: tidal gates, lock or marina gate times, daylight.',
              '**Weather**: latest forecast; plan B and harbours of refuge.',
              '**Pilotage plan** for leaving and arriving; waypoints entered and double-checked.',
              'Under way: log your position every hour.',
            ],
          },
        ],
      },
      {
        h: 'Pilotage tools',
        blocks: [
          {
            list: [
              '**Transit**: two charted objects in line. While they stay in line, you are on that line.',
              '**Leading line**: a charted transit that marks a safe channel.',
              '**Compass bearing** of a charted object: you are somewhere on that line.',
              '**Depth contour**: follow a depth with the echo sounder.',
            ],
          },
        ],
      },
      {
        h: 'Clearing bearings',
        blocks: [
          { p: 'A clearing bearing is a line from an easy-to-see charted object that **just clears a danger**. As long as the bearing of that object stays on the safe side, you are clear.' },
          {
            steps: [
              'Pick a conspicuous charted object beyond the danger (church, lighthouse).',
              'Draw a line from it that just touches the seaward edge of the danger.',
              'Add a few degrees of margin, away from the danger.',
              'Measure the bearing and label it **NLT** (not less than) or **NMT** (not more than) – whichever side is safe.',
              'Take hand-bearings regularly. On the wrong side? **Turn away from the danger at once.**',
            ],
          },
          { tip: 'Which label? Imagine moving towards the danger: if the bearing gets **smaller**, the safe side is **NOT LESS THAN**; if it gets bigger, **NOT MORE THAN**.' },
          {
            ex: {
              title: 'The ledge north of Kingsport',
              lines: [
                'You sail north; a rocky ledge sticks out from the coast to the east. A church stands on the shore to the north.',
                'The line from the church that just touches the western edge of the ledge is about 15°.',
                'Add margin → clearing bearing **NLT 20°**: moving east (towards the ledge) makes the bearing smaller.',
                'Reading **25°** → bigger than 20° → safe, hold your course.',
                'Reading **18°** → less than 20° → you are inside the line: **alter to port** (west, away from the ledge).',
              ],
            },
          },
        ],
      },
      {
        h: 'In the Plan & Run a Passage game',
        blocks: [
          {
            list: [
              '**Part 1 – Tidal gate**: move the departure slider and watch the arrival time, average speed and the height at the bar. Use the tides lesson.',
              '**Part 2 – Clearing bearing**: turn the red line through the church until it just clears the rocks (within a few degrees). Then at every reading decide: hold, or alter to port.',
              'The flood stream sets you east every leg, so expect to need a correction or two.',
            ],
          },
          { game: 'passage' },
        ],
      },
    ],
    check: [
      { q: 'Clearing bearing NLT 040°. You read 035°. You…', options: ['are on the danger side – turn away', 'are safe', 'should turn towards the danger', 'need no action'], answer: 0, why: '035° is less than 040°, so you are on the wrong side of the line.' },
      { q: 'Two charted objects in line are called a…', options: ['Transit', 'Clearing bearing', 'Waypoint', 'Contour'], answer: 0, why: 'While they stay in line you are on that line.' },
      { q: 'Under way you should log your position…', options: ['every hour', 'only on arrival', 'once a day', 'never with GPS'], answer: 0, why: 'If the electronics fail you can carry on from the last logged position.' },
    ],
  },

  safety: {
    title: 'Distress calls and emergencies',
    summary: 'When to call Mayday, Pan-Pan or Sécurité, how to send a DSC alert and a voice Mayday, and the skipper\'s key decisions in common emergencies.',
    sections: [
      {
        h: 'Mayday, Pan-Pan or Sécurité?',
        blocks: [
          {
            table: {
              head: ['Call', 'When', 'Examples'],
              rows: [
                ['MAYDAY', 'Grave and imminent danger to a vessel or person', 'Man overboard, sinking, fire out of control, someone not breathing'],
                ['PAN-PAN', 'Urgent, but not immediately life-threatening', 'Engine failure in a shipping lane, dismasted and drifting, medical advice'],
                ['SÉCURITÉ', 'Safety information for others', 'Floating container, a buoy light not working'],
              ],
            },
          },
        ],
      },
      {
        h: 'DSC distress alert',
        blocks: [
          {
            steps: [
              'Switch the radio on.',
              'If there is time, choose the nature of distress (fire, flooding, man overboard…).',
              'Lift the spring-loaded red cover.',
              'Press and **hold** the distress button for **5 seconds**. The radio sends your MMSI and position.',
              'Follow up with a voice Mayday on channel 16.',
            ],
          },
        ],
      },
      {
        h: 'The voice Mayday',
        blocks: [
          { p: 'Channel **16**, **high power**. Hold the transmit button (PTT) for the whole message and speak slowly.' },
          {
            steps: [
              '"MAYDAY, MAYDAY, MAYDAY"',
              '"This is yacht Puffin, Puffin, Puffin, MMSI …"',
              '"MAYDAY yacht Puffin, MMSI …"',
              '"My position …" (latitude/longitude or bearing and distance from a known point)',
              'Nature of distress – what happened',
              'Number of persons on board **and** "require immediate assistance"',
              'Other vital information (e.g. abandoning to the liferaft)',
              '"Over" – then release the button and listen.',
            ],
          },
          { warn: 'Never say "over and out". Do not chat – only vital information.' },
          { game: 'vhf' },
        ],
      },
      {
        h: 'The skipper\'s decisions',
        blocks: [
          {
            table: {
              head: ['Situation', 'Key decisions'],
              rows: [
                ['Forecast getting worse', 'Plan around the timeline: go early, come back before the wind rises. Backing wind + thickening cloud = front coming. Reef early.'],
                ['Engine failure in a channel', 'Sail out of the channel first, then Pan-Pan if needed. For a tow: long line and a bridle to both bow cleats; never hold a loaded line.'],
                ['Running aground (falling tide)', 'Hard astern at once, the way you came. Heel the boat to lift the keel. Then lay out a kedge towards deep water.'],
                ['Fire in the engine', 'Stop the engine, fuel off, crew on deck in lifejackets. Extinguisher through the fire port, aimed at the base. Out of control → Mayday.'],
                ['Helicopter rescue', 'Steer exactly the course and speed asked. Let the hi-line touch the water first, never tie it on. Clear and secure loose gear.'],
                ['Abandon to the liferaft', 'Stay aboard as long as possible. Painter tied on, launch to leeward, heaviest adult first, step in dry, take the grab bag and EPIRB, stream the drogue.'],
              ],
            },
          },
          { list: ['Forecast words: **imminent** < 6 h, **soon** 6–12 h, **later** > 12 h.', '**Backing** = shifting anticlockwise (NW → SW), **veering** = clockwise.'] },
          { game: 'decisions' },
        ],
      },
    ],
    check: [
      { q: 'Dismasted, nobody hurt, drifting slowly offshore. Which call?', options: ['Pan-Pan', 'Mayday', 'Sécurité', 'No call'], answer: 0, why: 'You need help but are not in immediate danger.' },
      { q: 'How long do you hold the DSC distress button?', options: ['5 seconds', 'A quick press', 'Until someone answers', '1 minute'], answer: 0, why: 'Five seconds sends the alert.' },
      { q: 'How do you end a Mayday message?', options: ['"Over"', '"Over and out"', '"Out"', '"Thank you"'], answer: 0, why: '"Over" means you are waiting for an answer; "over and out" is never used.' },
      { q: 'A helicopter lowers a hi-line. You…', options: ['let it touch the water, then handle it – never tie it on', 'catch it in the air', 'tie it to a cleat', 'cut it'], answer: 0, why: 'It discharges static in the water; tied on it could pull the helicopter down.' },
    ],
  },
}
