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
          { p: 'While the tide rises and falls the water also flows: the **tidal stream**. Its direction is where it flows **to** (the set), its speed in knots (the rate).' },
          {
            list: [
              'A **tidal atlas** or the **tidal diamonds** on the chart give set and rate for each hour before and after HW.',
              'Speed over the ground = boat speed ± stream: 5 kn with 2 kn **fair** = 7 kn; with 2 kn **foul** = only 3 kn.',
              '**Springs** (around new and full moon): big range, strong streams. **Neaps** (half moon): small range, weak streams.',
            ],
          },
          { ex: { title: 'Fair or foul?', lines: ['18 NM at 5 kn in still water = 3 h 36 min.', 'With an average 2 kn fair stream: 7 kn → about **2 h 35 min**.', 'With 2 kn foul: 3 kn → **6 hours**!'] } },
        ],
      },
      {
        h: 'Tidal gates: choosing the departure time',
        blocks: [
          { p: 'A tidal gate is a place you can only pass at certain times: a bar, a lock, a headland with strong streams. Plan **backwards** from the gate.' },
          {
            steps: [
              'Find the window when you can pass (enough water, or a fair stream).',
              'Estimate how long the passage takes with the expected stream.',
              'ETD (departure) = arrival time − passage time.',
              'Check the stream along the way and shift a little earlier or later to carry the fair stream as long as possible.',
            ],
          },
          {
            ex: {
              title: 'Planning the Kingsport passage (18 NM, 5 kn, HW 13:00)',
              lines: [
                'Window at the bar: about 10:50 – 15:10.',
                'The stream is fair from HW−5 to HW (08:00–13:00) and strongest at HW−3 to HW−2 (10:00–11:00). After HW it turns foul.',
                'Leave **09:00** → average ≈ 6.9 kn → arrive ≈ 11:37 with 4.4 m of tide: **in**, with a fair stream all the way.',
                'Leave 06:00 → you start with a foul stream and arrive at 09:27 with only 2.3 m: the bar is still too shallow.',
                'Leave 12:00 → the stream turns foul, you arrive at 16:12 with 2.7 m: too late.',
              ],
            },
          },
          { tip: 'In the game three stars = enough water at the bar **and** an average speed of at least 6.6 kn (a fair stream most of the way). Try departures between 08:30 and 10:00.' },
          { game: 'passage' },
        ],
      },
      {
        h: 'Tide and anchoring',
        blocks: [
          { p: 'At anchor the depth changes all night. Use the depth at **high water** for the length of chain, and check there is still enough water at the **lowest** tide all round your swinging circle. See the anchoring lesson.' },
          { game: 'anchor' },
        ],
      },
    ],
    check: [
      { q: 'LW 06:00 1.0 m, HW 12:00 4.6 m. Height of tide at 09:00?', options: ['2.8 m', '2.2 m', '3.7 m', '1.9 m'], answer: 0, why: 'Range 3.6 m, one twelfth 0.3 m. 3 hours after LW = 6/12 = 1.8 m. 1.0 + 1.8 = 2.8 m.' },
      { q: 'Charted depth 1.2 m, height of tide 2.5 m. Depth of water?', options: ['3.7 m', '1.3 m', '2.5 m', '1.2 m'], answer: 0, why: 'Depth = charted depth + height of tide.' },
      { q: 'In which hours does the tide rise fastest?', options: ['3rd and 4th', '1st and 6th', '2nd and 5th', 'All the same'], answer: 0, why: '1-2-3-3-2-1: three twelfths in each of the middle hours.' },
      { q: 'Your boat does 5 kn, the stream is 1.5 kn against you. Speed over the ground?', options: ['3.5 kn', '6.5 kn', '5 kn', '1.5 kn'], answer: 0, why: 'A foul stream is subtracted: 5 − 1.5 = 3.5 kn.' },
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
          {
            list: [
              'Move the mouse over the chart to read the charted depth; underlined soundings dry.',
              'The box shows the tide now, the lowest tide tonight and the wind directions through the night. Your boat always lies **downwind** of the anchor.',
              'Scope below **4 : 1** → the anchor drags when the wind freshens after about 3 hours.',
              'The blue circle is your swinging room; the dashed orange circles belong to the other boats – they must not overlap.',
              'Three stars: scope between 4 and 7 : 1 **and** at least 0.5 m under the keel all night.',
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
