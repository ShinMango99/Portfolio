    window.PORTFOLIO = {
  profile: {
    name: "Jaemin Cho",
    title: "Unity / C# Game Developer",
    photo: "assets/img/profile.webp",
    intro:
      "Unity & C# Developer and Pixel Artist turning creative game concepts into playable reality.",
    typedPhrases: ["Unity & C# gameplay", "pixel art", "teaching & mentoring", "team collaboration"],
    featured: "shh", // project id whose trailer is shown at the top right
    contact: {
      itch: "https://mangocareer.itch.io",
      github: "https://github.com/shinmango99",
      email: "mangocareer030624@gmail.com",
      linkedin: "https://www.linkedin.com/in/jaemin-cho-a26674267/",
      instagram: "https://www.instagram.com/jammini_._/"
    }
  },

  skills: [
    {
      group: "Programming",
      items: [
        { name: "C#", level: 9, desc: "Main language. What I have used the most while working in Unity." },
        { name: "C++", level: 8, desc: "A stepping stone I went through while learning C#." }
      ]
    },
    {
      group: "Engine",
      items: [
        { name: "Unity", level: 9, desc: "Main engine, used in every project." },
        { name: "Unreal", level: 5, desc: "Blueprint-style coding was hard at first, but I have grown comfortable with it." }
      ]
    },
    {
      group: "Art",
      items: [
        { name: "Pixel Art", level: 7, desc: "I can generally produce the look I have in mind." },
        { name: "DaVinci Resolve", level: 6, desc: "I can edit and put together game trailers." },
        { name: "Concept Art", level: 5, desc: "I can block out the compositions I imagine." },
        { name: "Adobe", level: 4, desc: "Photoshop, Illustrator, InDesign and Premiere Pro: I understand how they are structured and can use them." },
        { name: "3ds Max", level: 3, desc: "I understand how it is structured and can use it." }
      ]
    },
    {
      group: "Communication",
      items: [
        { name: "Teaching", level: 8, desc: "Experience teaching as a teaching assistant / instructor." },
        { name: "Collaboration", level: 6, desc: "Experience making games through team projects and collaborations." }
      ]
    }
  ],

  // Life events shown on the timeline only.
  // date / end: "YYYY-MM-DD" or "YYYY-MM". image: optional small logo.
  milestones: [
    { date: "2022-02-21", title: "Entered George Mason University: Computer Game Design" },
    { date: "2022-03", title: "Joined Gnonymous, a game development club", image: "assets/img/gnonymous.png" },
    { date: "2022-08-22", title: "Gnonymous: PR Manager", image: "assets/img/gnonymous.png" },
    { date: "2023-02-20", end: "2023-12-13", title: "Gnonymous: Vice President", image: "assets/img/gnonymous.png" },
    { date: "2023-12-17", title: "Military service" },
    { date: "2025-08", title: "Returned to school" }
  ],

  projects: [
    {
      id: "sweet-sixteen",
      title: "Sweet Sixteen",
      category: "Competition",
      date: "2023-05-23",
      ongoing: false,
      completion: 1,
      links: { itch: "https://mangocareer.itch.io/sweet-sixteen", instagram: null, youtube: null },
      video: null,
      poster: "https://img.itch.zone/aW1nLzEyMjUyMzEwLnBuZw==/347x500/KOc5S%2B.png",
      summary: "Sweet Sixteen is an original game that uses a metaphor of a girl collecting sweets to highlight the dangers of drug addiction.",
      role: "Programmer: enemy and UI",
      tools: "Unity",
      team: "14",
      outcome: "Programmed the enemies and co-built the UI; released on itch.io as a 14-person club project."
    },
    {
      id: "digdigmole",
      title: "DigDigMole",
      category: "Class",
      date: "2023-06-08",
      ongoing: false,
      completion: 1,
      links: {
        itch: "https://mangocareer.itch.io/digdigmole",
        instagram: "https://www.instagram.com/p/CwRumypKfPb/",
        youtube: "https://youtu.be/OxRKc0Kkkwg"
      },
      video: null,
      poster: null,
      summary: "Help a baby mole dig across platforms, defeat enemies and dodge obstacles to find his family.",
      role: "Programming, level design",
      tools: "Unity",
      team: "3",
      outcome: "Shipped a 2D pixel-art platformer for Windows on itch.io as a 3-person team."
    },
    {
      id: "mk-mentoring",
      title: "MK Mentoring",
      category: "Teaching",
      date: "2023-09-16",
      ongoing: false,
      completion: 1,
      links: { itch: null, instagram: null, youtube: null },
      video: null,
      poster: null,
      summary:
        "Lectured for 9 hours in total (3 sessions of 3 hours each over 21 days) on \"How to Recreate the Game Pong\", and successfully recreated the Pong game with students during the program.",
      role: "Lecturer",
      tools: "Unity",
      team: "5",
      outcome: "Students recreated a working Pong game by the end of the 3-session program."
    },
    {
      id: "ccc-challenge",
      title: "CCC challenge",
      category: "Competition",
      date: "2023-09-23",
      ongoing: false,
      completion: 1,
      links: {
        itch: null,
        instagram: "https://www.instagram.com/p/DOC-EH6kjHV/",
        youtube: https://youtu.be/0fFwyaOrnb8
      },
      video: null,
      poster: "assets/img/ccc-challenge.png",
      summary:
        "Created a TikTok AR filter for the Clear Code Challenge in collaboration with Purito. Players have to catch falling serum ingredients with a bottle.",
      role: "Producer, programming, marketing",
      tools: "Effect House",
      team: "3",
      outcome: "Built a playable TikTok AR filter game in Effect House for the Clear Code Challenge (with Purito)."
    },
    {
      id: "bread-game",
      title: "Bread Game",
      category: "Class",
      date: "2023-10-16",
      ongoing: false,
      completion: 1,
      links: {
        itch: "https://mangocareer.itch.io/bread-game",
        instagram: "https://www.instagram.com/p/DOC_O63EmOS/",
        youtube: "https://youtu.be/556cxQthys8"
      },
      video: null,
      poster: null,
      summary: "A story about a loaf of bread escaping from the oven",
      role: "Programming, level design",
      tools: "Unity",
      team: "3",
      outcome: "Made a game that runs on 'The Figment', a retro game console."
    },
    {
      id: "doodling",
      title: "Doodling",
      category: "Class",
      date: "2023-12-08",
      ongoing: false,
      completion: 1,
      links: {
        itch: null,
        instagram: "https://www.instagram.com/p/DOENZFFEiNo/",
        youtube: "https://youtu.be/R9j2GF6ZlTA"
      },
      video: null,
      poster: null,
      summary: "Defend the castle against the paper army!",
      role: "Programming, level design",
      tools: "Unity",
      team: "3",
      outcome: "Made a side-scrolling action defense game that can be played on a 'NintendoDS' console."
    },
    {
      id: "lost",
      title: "Lost",
      category: "Class",
      date: "2023-12-11",
      ongoing: false,
      completion: 1,
      links: {
        itch: "https://mangocareer.itch.io/lost",
        instagram: "https://www.instagram.com/p/DN4l3thEs0A/",
        youtube: "https://youtu.be/nUGToROrL2Y"
      },
      video: null,
      poster: null,
      summary: "A maze escape game: run from monsters and find a way out of a maze that seems to repeat forever.",
      role: "Producer, programming",
      tools: "Unreal Engine",
      team: "1 (solo)",
      outcome: "Shipped a 3D horror Windows build on itch.io, made in Unreal Engine."
    },
    {
      id: "save-the-pig",
      title: "Save the Pig",
      category: "Competition",
      date: "2024-04-15",
      ongoing: false,
      completion: 1,
      links: {
        itch: "https://g-nonymous.itch.io/bio",
        instagram: "https://www.instagram.com/p/DN4s9RIktL-/",
        youtube: "https://youtu.be/xtaSFKIv6q4"
      },
      video: null,
      poster: null,
      summary: "ASF Prevention Farm: a farming sim about protecting pigs from African Swine Fever.",
      role: "Programmer (with Jiwon Bae)",
      tools: "Unity",
      team: "7",
      outcome:
        "Made by Gnonymous in collaboration with SDGsBuilders and FAO Korea; released on itch.io for HTML5 and Android."
    },
    {
      id: "shh",
      title: "Shh",
      category: "GameJam",
      date: "2025-09-21",
      ongoing: false,
      completion: 1,
      featured: true,
      links: {
        itch: "https://mangocareer.itch.io/shh",
        instagram: "https://www.instagram.com/p/DO6b5fDkjz-/",
        youtube: "https://youtu.be/h2Kdwcp37r0"
      },
      video: null,
      poster: null,
      summary: "Trapped in an abandoned subway tunnel, you escape using a flashlight while mysterious voices guide or mislead you.",
      role: "Solo developer: programming, art, sound and voice acting",
      tools: "Unity, 3ds Max, Aseprite",
      team: "1 (solo)",
      outcome: "Built solo and shipped a Windows build on itch.io for Mason Korea Game Jam Fall 2025."
    },
    {
      id: "catastrophe",
      title: "Cat'astrophe",
      category: "Club",
      date: "2025-11-23",
      ongoing: true,
      completion: 0.9,
      links: { itch: "https://mangocareer.itch.io/catastrophe", instagram: null, youtube: null },
      video: null,
      poster: "https://img.itch.zone/aW1nLzIzNjk5NDEwLnBuZw==/original/I5gLm1.png",
      summary: "Simon the cat is on a mission to find his missing Granny.",
      role: "Producer, main programmer, level design",
      tools: "Unity",
      team: "6",
      outcome: "Android build on itch.io, 90% complete. Level design is the last step before the planned Google Play Store release."
    },
    {
      id: "toast-to-the-past",
      title: "Toast to the Past",
      category: "GameJam",
      date: "2026-05-26",
      ongoing: false,
      completion: 1,
      links: { itch: "https://mangocareer.itch.io/toast-to-the-past", instagram: null, youtube: null },
      video: null,
      poster: "https://img.itch.zone/aW1nLzI3NDYyNDI5LnBuZw==/original/85QetF.png",
      summary: "Time is your most precious resource: every action that speeds up or pauses time leaves an echo in the environment.",
      role: "Programming, pixel art",
      tools: "Unity",
      team: "1 (solo)",
      outcome: "Shipped a Windows platformer on itch.io for the 2026 GMU Spring GameJam (theme: \"Every Choice Echoes\")."
    },
    {
      id: "learning-assistant",
      title: "Learning Assistant (LA)",
      category: "Teaching",
      date: "2026-06-22",
      ongoing: false,
      completion: 1,
      links: { itch: null, instagram: null, youtube: null },
      video: null,
      poster: null,
      summary:
        "Provided code reviews and technical guidance for Unity & C# projects (e.g., Isometric Camera, Physics/Collision, Health Systems). Helped students bridge the gap between game design concepts and practical C# implementation.",
      role: "Learning Assistant",
      tools: "Unity, C#",
      team: null,
      outcome: "Helped students bridge the gap between game design concepts and practical C# implementation."
    },
    {
      id: "ohmycod",
      title: "OhmyCod",
      category: "Personal",
      date: "2026-09-09",
      ongoing: true,
      completion: 0.3,
      links: { itch: null, instagram: "https://www.instagram.com/p/DdB52fcKDRq/", youtube: null },
      video: null,
      poster: "assets/img/ohmycod.webp",
      summary: "A desperate flopping journey of a fish out of water!",
      description: "I'm currently developing OhmyCod, a 2D pixel platformer packed with unique physics and fun mechanics!",
      role: "Programming, art",
      tools: "Unity, Aseprite",
      team: "2",
      outcome: "In development: 30% complete. A 2D pixel fish platformer."
    }
  ]
};
