/* Peril Suite EP 2 catalog and project facts.
   Edit this file to add songs, links, schedule notes, lyrics, or published stage status.
   Rates & budget live encrypted in rates.enc.js — plaintext figures stay in private/rates.json.
   Brand files live in assets/brand/ — see README. */
window.PS_DATA = (() => {
  /* Login passwords are NOT in this file — only SHA-256 hashes of the lowercased password.
     Plain passwords live in private/login_codes.md (never deploy the private/ folder).
     Still a client-side gate (same model as WBA), just without readable passwords in source. */
  const MEMBERS = [
    { name: "Brice", role: "Singer (vocals)", hash: "783d345a2f6695e4a59caa7e0946bc869c22dd089af1d4dff6adc486072e4e52", also: "Brice Haiden" },
    { name: "Twitch", role: "Session bassist", hash: "86ec5898c66dcc3f4a96ea31ff47013d3b6be71c066bbd86c9743620e1a57224" },
    { name: "Gary", role: "Session guitarist", hash: "137bbb75d50a7af587360cef144bae78b51039266f9701fb5500e103043ed6ba", also: "Garrett Turney" },
    { name: "AB", role: "Manager", hash: "7a5c6457e3f22efb81f5d9e743cef37585e0dd431822121f40c4138f369df6d0" },
    { name: "Jman", role: "Drummer", hash: "ecb0472b9ad4c17f5cbe732da9886d0f9684d25f59a16b697ce12a66b1b8622f" },
    { name: "Rob", role: "Producer", hash: "4102e5b01c2cab19d3496d512443ddedf4acca73bf3d9dc27e451ab3ba6f5f53", also: "Rob Hitchcock" }
  ];

  /* Pre-production order (through end of 2026): MIDI Drums → Guitar → Bass → Vocals → Drum Demo.
     Production tracks: Drums, Bass, Rhythm Guitars, Lead Guitars, Vocals, Aux/Other.
     Editing phases exist for every track except Aux/Other and Lead Guitars.
     Pre-pro bass is the record bass (Twitch exits by year end, agreed). Drums will be
     rigidly quantized up front so that bass lines up. */
  const PHASES = [
    {
      id: "pre",
      name: "Pre-production",
      stages: ["MIDI Drums", "Guitar (pre-pro)", "Bass (record)", "Vocals (pre-pro)", "Drum Demo"]
    },
    {
      id: "prod",
      name: "Production",
      stages: [
        "Drums", "Drum edits",
        "Bass edits",
        "Rhythm Guitars", "Rhythm Guitar edits",
        "Lead Guitars",
        "Vocals", "Vocal edits",
        "Aux/Other",
        "Re-amp"
      ]
    },
    {
      id: "post",
      name: "Post",
      stages: ["Mix", "Atmos mixes", "Master"]
    }
  ];

  /* No vocalist-TBD hold like WBA — Brice is on vocals. */
  const VOX = new Set();

  const songs = [
    { id: "stay-up",     title: "Stay Up" },
    { id: "circles",     title: "Circles" },
    { id: "back-2-rock", title: "Back 2 Rock" },
    { id: "the-wheel",   title: "The Wheel" }
  ];

  /* Lyrics Rob publishes for the band. Keyed by song id.
     Each song is an array of sections:
       { label, lines }                  — lyric section
       { label, instrumental: true }     — empty Solo (renders as an instrumental marker)
       { label, lines, repeat: 8 }       — section followed by a × 8 repeat marker
       { lines }                         — unlabeled continuation of the previous section
     Use [] (or omit the song) to show "Lyrics coming soon." Re-upload this file to update. */
  const LYRICS = {
    "stay-up": [
      {
        label: "Verse",
        lines: [
          "What goes up",
          "Must come down",
          "I stay up",
          "And I stay strung out",
          "All is well",
          "if there is light inside",
          "But time will tell",
          "If we were wrong or right",
          "Oooooooo, wrong or right"
        ]
      },
      {
        label: "Hook",
        lines: [
          "What goes up",
          "Must come down",
          "But I stay up"
        ]
      },
      {
        label: "Verse 2",
        lines: [
          "Sun comes up",
          "Sun goes down",
          "Take my chances",
          "Take my own route",
          "If you will",
          "Make your mind up now",
          "Give everything up",
          "‘Fore you’re times run out",
          "Oooooo, times run out",
          "Yeahhhhhhhhhhhh"
        ]
      },
      {
        label: "Hook",
        lines: [
          "Sun comes up",
          "Sun goes down",
          "But I STAY UP"
        ]
      },
      { label: "Solo", instrumental: true },
      {
        label: "Bridge-building part",
        lines: [
          "What goes up",
          "What goes up",
          "What goes up",
          "Yeah, it must come down",
          "What goes up",
          "What goes up",
          "What goes up",
          "I said it must come down",
          "Sun comes up",
          "Sun comes up",
          "Sun comes up",
          "And the sun goes down",
          "Sun comes up",
          "Sun comes up",
          "Sun comes up",
          "And the sun goes downnnnnnnnnnnn"
        ]
      }
    ],
    "circles": [
      {
        label: "Verse",
        lines: [
          "You don’t know my pain",
          "You don’t know my life",
          "You don’t know my story",
          "You can’t tell me a thing",
          "You haven’t got the right",
          "Your input just bores me",
          "You think you know my heart",
          "You think you know who I am",
          "You haven’t got a clue",
          "Cause I knew right from the start",
          "You’d never understand",
          "That’s why I’m asking you"
        ]
      },
      {
        label: "Hook",
        lines: [
          "Why do we go in circles",
          "Why do we fall victim to this game"
        ]
      },
      {
        label: "Verse 2",
        lines: [
          "You love to see me hurt",
          "You love to make me bleed",
          "You hate to lose the fight",
          "You’d stomp my heart in the dirt",
          "And bring me to my knees",
          "Shoot me out of the sky",
          "Break every promise you make",
          "Turn every memory to shame",
          "Feed me nothing but lies",
          "Choke on everything that you say",
          "Cause it ends today",
          "I’m taking back my pride"
        ]
      },
      {
        label: "Hook",
        lines: [
          "Why do we go in circles",
          "Why do we fall victim to this game",
          "How can you know my history",
          "How can you know who I am"
        ]
      },
      { label: "Solo", instrumental: true },
      {
        label: "Hook",
        lines: [
          "Why do we go in circles",
          "Why do we fall victim to this game",
          "How can you know my history",
          "How can you know who I am",
          "Who I am",
          "Who I am",
          "Who I am",
          "Who I am"
        ]
      }
    ],
    "back-2-rock": [
      {
        label: "Verse",
        lines: [
          "I call all of the girls",
          "All around the world",
          "Show me that you know how to roll",
          "Cause you’re twisting and turning",
          "Your body is burning",
          "You’re rocking down to your soul",
          "And you find your way to a meaning",
          "When you find your way",
          "BACK TO ROCK"
        ]
      },
      {
        label: "Verse 2",
        lines: [
          "I call all of the girls",
          "All around the world",
          "Show me that you’re ready to roll",
          "Cause the live and the lonely",
          "Come as one only to worship that sacred stone",
          "Now raise your hands to the ceiling",
          "If you feel the way that I feel",
          "SHOUT"
        ]
      },
      { label: "Solo", instrumental: true },
      {
        label: "Bridge",
        lines: [
          "Ohhhhhh back to rock",
          "Back to rock",
          "Back to rock",
          "Back to rock"
        ],
        repeat: 8
      },
      {
        lines: [
          "Now raise your hands to the ceiling",
          "If you feel the way that I feel",
          "Ohhh back to rock",
          "Back to rock",
          "Back to rock",
          "You know you’ve found your wayyyyyy",
          "Back to rock!!!!"
        ]
      }
    ],
    "the-wheel": [
      {
        label: "Verse",
        lines: [
          "Heading down",
          "Towards the sky",
          "My feet ain’t left the ground",
          "My head is beating",
          "To no surprise",
          "I cheat my way around"
        ]
      },
      {
        label: "Hook",
        lines: [
          "I wanna know how it feels",
          "I wanna know what is real"
        ]
      },
      {
        label: "Post hook/comedown",
        lines: [
          "I wanna know how it feels",
          "I wanna know what is real"
        ]
      },
      {
        label: "Verse",
        lines: [
          "Searching for my sweet surrender",
          "Waiting for my grace",
          "My heart is beating",
          "I’m growing older",
          "I’ll never see the day"
        ]
      },
      {
        label: "Hook",
        lines: [
          "I wanna know how it feels",
          "I wanna know what is real",
          "I wanna know how you feel",
          "I wanna let go of the wheel",
          "Yeahhhhhhh"
        ]
      },
      { label: "Solo", instrumental: true },
      {
        label: "Final hook over halftime drums",
        lines: [
          "I wanna know how it feels",
          "I wanna know what is real",
          "I wanna know how your feel",
          "I wanna let go of the wheel",
          "YEAHHHHHHHH 👹👹👹"
        ]
      }
    ]
  };

  /* Stage progress Rob publishes. For each song, map a stage name to "done".
     Stages not listed stay unknown. Re-upload this file to update the band.
     Example: "stay-up": { "MIDI Drums": "done", "Guitar (pre-pro)": "done" } */
  const STAGE_STATUS = {
    "stay-up": {},
    "circles": {},
    "back-2-rock": {},
    "the-wheel": {}
  };

  songs.forEach((s, i) => {
    s.n = i + 1;
    s.year = "TBD";
    s.tuning = "TBD";
    s.demoTitle = "TBD";
    s.suno = "unc";
    s.instrumental = null;
    s.drumDemo = null;
    s.media = {};
    s.themes = [];
    s.motifs = [];
    s.keyLine = "";
    s.notes = "";
  });

  const THEMES = {};
  const ALBUM_SUMMARY = "";
  const HERO_LINES = [];

  const PROJECT = {
    title: "Peril Suite",
    album: "EP 2",
    producer: "Rob Hitchcock",
    producerRole: "Producer / engineer / mixer",
    preProEnd: "2026-12-31T23:59:59-06:00",
    preProLabel: "Pre-production runs through the end of 2026",
    drumTracking: {
      date: "TBA",
      window: "Late January / early February 2027",
      venue: "The Orb, Austin, TX",
      notes: "Jman is the drummer and owns drums on this EP, including tracking at The Orb and the drum-edit stage. Drums will be rigidly quantized up front so the pre-production bass lines up."
    }
  };

  const SCHEDULE = [
    {
      phase: "Pre-production",
      when: "Now through the end of 2026",
      where: "Remote + one in-person rhythm-guitar session",
      detail: "Order: MIDI Drums, then Guitar, then Bass, then Vocals, then Drum Demo. The bass tracked in pre-production becomes the bass on the record, so Twitch can leave the project by year's end (agreed by all parties). Drums will be rigidly quantized up front so that bass lines up. Rhythm guitar gets an in-person pre-production session; Gary tracks leads and additional elements at home. Pre-production guitar parts may carry over into production. If the vocal chain is arranged up front (Rob's mic, a rented preamp, and a quality interface at AB's studio), pre-production vocals may also carry over to the record."
    },
    {
      phase: "Drum tracking",
      when: "Date TBA · targeting late January / early February 2027",
      where: "The Orb, Austin, TX",
      detail: "Live drums recorded after pre-production, with Jman as drummer. Jman owns drums on this EP, including this Orb session and the drum-edit stage. Rate for The Orb is TBD (listed as TBD on the Nov 4, 2026 Peril Suite EP agreement studio-options table)."
    },
    {
      phase: "Rhythm guitar, lead guitar, and vocals",
      when: "After drums are tracked",
      where: "Proposed: AB's studio (rhythm guitar + vocals); Gary tracks leads and additional elements at home",
      detail: "Proposal: track at AB's studio using Rob's mic, a rented preamp, and a quality interface. Rhythm guitar: a second, real production session after drums (the first was the in-person pre-production session). Lead guitars have no separate editing phase. Vocals have an editing phase."
    },
    {
      phase: "Re-amp",
      when: "After all elements are recorded and edited, before mixing and mastering",
      where: "Hendyamps Studio, Richmond, TX · 3 hours",
      detail: "Booked as a 3-hour re-amp date for this record at Hendyamps Studio. The studio rate and extended total are in Rates & budget (AB and Rob) and will be confirmed when booked."
    },
    {
      phase: "Mixing",
      when: "After re-amp",
      where: "Rob Hitchcock",
      detail: "Mixing by Rob Hitchcock (Nov 4, 2026 Peril Suite EP agreement). Up to five revision rounds per song are included; later mixes are billed per the rate on file in Rates & budget (AB and Rob)."
    },
    {
      phase: "Atmos mixes",
      when: "After (or alongside) stereo mixes",
      where: "Remote — Nick Matzke",
      detail: "Offered at the verified Tom Houck EP rate for Nick Matzke. Rob noted this rate is available for all projects he produces. Figures are in Rates & budget (AB and Rob)."
    },
    {
      phase: "Mastering",
      when: "After mixes",
      where: "Chris Henderson of Hendyamps (as on prior work / the Nov 4, 2026 agreement)",
      detail: "Mastering engineer on file: Chris Henderson. A rate was not quoted for this project. A prior-project figure exists but is not applied here; see Rates & budget (AB and Rob)."
    }
  ];

  const TEAM = [
    { name: "Brice",  role: "Singer (vocals)" },
    { name: "Twitch", role: "Session bassist", detail: "Pre-production bass is the record bass; Twitch exits by the end of 2026 (agreed by all parties)." },
    { name: "Gary",   role: "Session guitarist", detail: "Tracks leads and additional elements at home. Pre-pro guitar parts may carry over." },
    { name: "AB",     role: "Manager", detail: "AB's studio remains the proposed room for rhythm guitar and vocals." },
    { name: "Jman",   role: "Drummer", detail: "Owns drums on this EP, including tracking at The Orb and the drum-edit stage." },
    { name: "Rob",    role: "Producer" }
  ];

  /* Jman owns drums: The Orb tracking session and the drum-edit stage. */
  const STAGE_OWNERS = {
    "Drums": "Jman",
    "Drum edits": "Jman"
  };

  return {
    MEMBERS, PHASES, VOX, SONGS: songs, THEMES, ALBUM_SUMMARY, HERO_LINES,
    LYRICS, STAGE_STATUS, PROJECT, SCHEDULE, TEAM, STAGE_OWNERS
  };
})();
