/* Peril Suite EP 2 catalog and project facts.
   Edit this file to add lyrics, years, tunings, links, or to swap rates once confirmed.
   Brand files live in assets/brand/ — see README. */
window.PS_DATA = (() => {
  /* Login codes are NOT in this file — only SHA-256 hashes of the lowercased code.
     Plain codes live in private/login_codes.md (never deploy the private/ folder).
     Still a client-side gate (same model as WBA), just without readable codes in source. */
  const MEMBERS = [
    { name: "Brice", role: "Singer (vocals)", hash: "94868ee705d3ee9464d20200860bc7626463fea8ae28d6434b4b041868f4e3eb", also: "Brice Haiden" },
    { name: "Twitch", role: "Session bassist", hash: "2f7ac5fb07d7aec6010f81429ad74ca0a4d421d2d3cf05d08276d48eb21031cc" },
    { name: "Gary", role: "Session guitarist", hash: "d60620f7231c89519156d3fcbe6aad1ceb8e2427596984802ed07377ec2c25ee", also: "Garrett Turney" },
    { name: "AB", role: "Manager", hash: "770376ab84842f7910fef673e4bf7c801b923a93dbd067730f7b34b45aa5e9e8" },
    { name: "Jman", role: "Drummer", hash: "7f2ba02e19a35e888a0138dc04ee5fb67b17577d2251c2ef47621d88ad39d52b" },
    { name: "Rob", role: "Producer", hash: "eedfd7b24a24d31f7fbf4c5ab5778375d21477877d5b4ad22a50a188d289efcb", also: "Rob Hitchcock" }
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

  songs.forEach((s, i) => {
    s.n = i + 1;
    s.year = "TBD";
    s.tuning = "TBD";
    s.demoTitle = "TBD";
    s.suno = "unc";
    s.lyricsStatus = "missing";
    s.lyrics = "";
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
  const CHAT = "Lyrics are not on file yet.";

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
      notes: "Jman is the drummer and owns drums on this EP, including tracking at The Orb and drum-edit reviews. Drums will be rigidly quantized up front so the pre-production bass lines up."
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
      detail: "Live drums recorded after pre-production, with Jman as drummer. Jman owns drums on this EP, including this Orb session and drum-edit reviews. Rate for The Orb is TBD (listed as TBD on the Nov 4, 2026 Peril Suite EP agreement studio-options table)."
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
      detail: "Booked as a 3-hour re-amp date for this record. Studio rate on file from the Nov 4, 2026 Peril Suite EP agreement: $75 / hour. Extended 3-hour total would be $225, to be confirmed when booked."
    },
    {
      phase: "Mixing",
      when: "After re-amp",
      where: "Rob Hitchcock",
      detail: "Mixing by Rob Hitchcock at $350 / song (Nov 4, 2026 Peril Suite EP agreement). Up to five revision rounds per song are included; a Mix 6.0 or later is $100 per revision."
    },
    {
      phase: "Atmos mixes",
      when: "After (or alongside) stereo mixes",
      where: "Remote — Nick Matzke",
      detail: "Offered at the Tom Houck EP quoted rate: $150 / song, verified for Nick Matzke. Rob noted this rate is available for all projects he produces. Four songs would extend to $600."
    },
    {
      phase: "Mastering",
      when: "After mixes",
      where: "Chris Henderson of Hendyamps (as on prior work / the Nov 4, 2026 agreement)",
      detail: "Mastering engineer on file: Chris Henderson. A rate was not quoted for this project. (The Tom Houck EP lists Chris Henderson at $50 / song, verified, but that figure is not applied here.)"
    }
  ];

  /* Only amounts Rob gave or that were found on file. Everything else stays TBD. */
  const RATES = {
    sourceNotes: [
      "Producer, mix, per diem, and studio-option figures are from the Peril Suite EP Project Proposal and Overview, offer date 11/04/2026 (on file in /workspace/peril_suite).",
      "Atmos rate is the verified Tom Houck EP quote for Nick Matzke: $150 / song (project_data.json, cost table, and 6-song timeline).",
      "Re-amp hours (3) were specified by Rob for this record. The $75 / hour Hendyamps figure is from the same Peril Suite agreement's studio-options table; the $225 extension is 3 × $75, to confirm when booked.",
      "The Orb (drum studio) rate is TBD. Mastering rate for this project is TBD."
    ],
    producer: [
      { item: "Producer's fees", rate: "$1,200 / song", qty: "4 songs", amount: "$4,800", note: "Covers pre-production, studio hours, edits before mixing, data stewardship, and project management." },
      { item: "Courtesy discount", rate: "", qty: "", amount: "– $100", note: "As credited on the Nov 4, 2026 agreement." },
      { item: "Prepayment received — credited", rate: "", qty: "", amount: "– $3,500", note: "Previously remitted (3 × $1,200 = $3,600, less the $100 courtesy discount) and credited in full toward this agreement." },
      { item: "Remaining producer's fee", rate: "", qty: "", amount: "$1,200", note: "Due upon completion of tracking, before final edits." },
      { item: "Mixing by Rob Hitchcock", rate: "$350 / song", qty: "4 songs", amount: "$1,400", note: "Due before Mix 1.0. Five revision rounds included; Mix 6.0+ is $100 per revision." },
      { item: "Balance due to producer (excl. per diems)", rate: "", qty: "", amount: "$2,600", note: "Remaining fee + mixing, as stated on the agreement." },
      { item: "Producer per diem", rate: "$50 / day", qty: "TBD", amount: "TBD", note: "Studio or travel days outside Bryan / College Station. Meals covered or $50 buyout." }
    ],
    outside: [
      { item: "Drum studio — The Orb, Austin, TX", rate: "TBD", qty: "Date TBA", amount: "TBD", note: "Targeting late January / early February 2027." },
      { item: "AB's studio (rhythm guitar, vocals; proposed)", rate: "TBD", qty: "TBD", amount: "TBD", note: "Rob's mic, a rented preamp, and a quality interface. Preamp / interface costs TBD." },
      { item: "Re-amp — Hendyamps Studio", rate: "$75 / hour", qty: "3 hours", amount: "$225 (to confirm)", note: "After all elements are recorded and edited, before mixing and mastering." },
      { item: "Dolby Atmos mixes — Nick Matzke", rate: "$150 / song", qty: "4 songs", amount: "$600", note: "Same verified rate quoted on the Tom Houck EP." },
      { item: "Mastering — Chris Henderson", rate: "TBD", qty: "4 songs", amount: "TBD", note: "Engineer named on the Peril Suite agreement. Rate not quoted for this project." }
    ],
    studiosOnFile: [
      { studio: "Nashville studio", location: "Nashville, TN", rate: "$300/day incl. house engineer" },
      { studio: "The Orb", location: "Austin, TX", rate: "TBD" },
      { studio: "Stormy Cooper Media", location: "Houston, TX", rate: "$400 half day / $800 full day" },
      { studio: "Lucky Run", location: "Houston, TX", rate: "$110 / hour" },
      { studio: "Hendyamps Studio", location: "Richmond, TX", rate: "$75 / hour" }
    ]
  };

  const TEAM = [
    { name: "Brice",  role: "Singer (vocals)" },
    { name: "Twitch", role: "Session bassist", detail: "Pre-production bass is the record bass; Twitch exits by the end of 2026 (agreed by all parties)." },
    { name: "Gary",   role: "Session guitarist", detail: "Tracks leads and additional elements at home. Pre-pro guitar parts may carry over." },
    { name: "AB",     role: "Manager", detail: "AB's studio remains the proposed room for rhythm guitar and vocals." },
    { name: "Jman",   role: "Drummer", detail: "Owns drums on this EP, including tracking at The Orb and drum-edit reviews." },
    { name: "Rob",    role: "Producer" }
  ];

  /* Jman owns drums: The Orb tracking session and drum-edit reviews. */
  const STAGE_OWNERS = {
    "Drums": "Jman",
    "Drum edits": "Jman"
  };

  return {
    MEMBERS, PHASES, VOX, SONGS: songs, THEMES, ALBUM_SUMMARY, HERO_LINES,
    CHAT_LYRICS_NOTE: CHAT, PROJECT, SCHEDULE, RATES, TEAM, STAGE_OWNERS
  };
})();
