/*
 * ALL site content lives in this file.
 * ---------------------------------------------------------------
 * - Any value set to "TODO" is hidden on the live site (shown as
 *   "Details coming soon"). Open the site with ?todo at the end of
 *   the URL to highlight every TODO in red.
 * - Projects are sorted automatically (ongoing first, then newest).
 * - Optional per-entry fields:
 *     pixel:   "assets/pixel/xxx.png"  -> replaces the generated sprite
 *     poster:  "assets/img/<id>.jpg"   -> thumbnail / trailer poster
 *     video:   "assets/video/<id>.mp4" -> local trailer (falls back to
 *              links.youtube, then to a pixel placeholder card)
 *     preview: "assets/img/<id>.gif"   -> shown in the timeline preview
 */
window.PORTFOLIO = {
  profile: {
    name: "Jaemin Cho",
    title: "Unity / C# Game Developer",
    intro:
      "I build games in Unity and C#, draw my own pixel art, and teach other students how to turn game ideas into working code.",
    // Phrases for "I'm confident in ___."
    typedPhrases: [
      "Unity & C# gameplay",
      "pixel art",
      "teaching & mentoring",
      "team collaboration"
    ],
    pixel: null, // e.g. "assets/pixel/hero.png" replaces the generated hero sprite
    featured: "ohmycod", // project id shown next to the hero
    contact: {
      itch: "https://mangocareer.itch.io",
      github: "https://github.com/shinmango99",
      email: "TODO", // e.g. "name@example.com"
      linkedin: "TODO" // e.g. "https://www.linkedin.com/in/..."
    }
  },

  skills: [
    {
      group: "Programming",
      sprite: "programming",
      pixel: null,
      items: [
        { name: "C#", level: 9, desc: "Main language. What I have used the most while working in Unity." },
        { name: "C++", level: 8, desc: "A stepping stone I went through while learning C#." }
      ]
    },
    {
      group: "Engine",
      sprite: "engine",
      pixel: null,
      items: [
        { name: "Unity", level: 9, desc: "Main engine, used in every project." },
        { name: "Unreal", level: 5, desc: "Blueprint-style coding was hard at first, but I have grown comfortable with it." }
      ]
    },
    {
      group: "Art",
      sprite: "art",
      pixel: null,
      items: [
        { name: "Pixel Art", level: 7, desc: "I can generally produce the look I have in mind." },
        { name: "Concept Art", level: 5, desc: "I can block out the compositions I imagine." }
      ]
    },
    {
      group: "Communication",
      sprite: "communication",
      pixel: null,
      items: [
        { name: "Teaching", level: 8, desc: "Experience teaching as a teaching assistant / instructor." },
        { name: "Collaboration", level: 6, desc: "Experience making games through team projects and collaborations." }
      ]
    }
  ],

  // color = one of the palette names in css/style.css
  categories: {
    GameJam: { label: "Game Jam", color: "rose", sprite: "gamejam", pixel: null },
    Class: { label: "Class", color: "sky", sprite: "class", pixel: null },
    Club: { label: "Club", color: "mint", sprite: "club", pixel: null },
    Competition: { label: "Competition", color: "gold", sprite: "competition", pixel: null },
    Personal: { label: "Personal", color: "violet", sprite: "personal", pixel: null },
    Teaching: { label: "Teaching", color: "paper", sprite: "teaching", pixel: null }
  },

  projects: [
    {
      id: "ohmycod",
      title: "OhmyCod",
      category: "Personal",
      date: "2026-09-09",
      ongoing: true,
      completion: 0.3,
      status: "In development",
      featured: true,
      links: { itch: null, instagram: "https://www.instagram.com/p/DdB52fcKDRq/", youtube: null },
      video: null,
      poster: null,
      pixel: null,
      summary: "TODO",
      role: "TODO",
      tools: "TODO",
      team: "TODO",
      outcome: "In development: 30% complete. Personal project I am actively building."
    },
    {
      id: "catastrophe",
      title: "Cat'astrophe",
      category: "Club",
      date: "2025-11-23",
      ongoing: true,
      completion: 0.9,
      status: "In progress",
      links: { itch: "https://mangocareer.itch.io/catastrophe", instagram: null, youtube: null },
      video: null,
      poster: "https://img.itch.zone/aW1nLzIzNjk5NDEwLnBuZw==/original/I5gLm1.png",
      pixel: null,
      summary: "Simon the cat is on a mission to find his missing Granny.",
      description:
        "From mischievous mice to arrogant kings and sneaky raccoons, every encounter brings a new challenge. Fight, talk, and chase your way through five unique stages in this humorous yet heartfelt little adventure.",
      role: "TODO",
      tools: "TODO",
      team: "TODO",
      outcome:
        "Android build on itch.io, 90% complete. Level design is the last step before the planned Google Play Store release."
    },
    {
      id: "toast-to-the-past",
      title: "Toast to the Past",
      category: "GameJam",
      date: "2026-05-26",
      ongoing: false,
      completion: 1,
      status: "Completed",
      links: { itch: "https://mangocareer.itch.io/toast-to-the-past", instagram: null, youtube: null },
      video: null,
      poster: "https://img.itch.zone/aW1nLzI3NDYyNDI5LnBuZw==/original/85QetF.png",
      pixel: null,
      summary:
        "Time is your most precious resource: every action that speeds up or pauses time leaves an echo in the environment.",
      description:
        "As the protagonist desperately tries to get to school on time with a piece of toast in her mouth, every action she takes, speeding up or pausing time, leaves an echo in the environment.",
      role: "TODO",
      tools: "Unity",
      team: "TODO", // itch.io lists the team name "ShinMango"
      outcome:
        "Shipped a Windows platformer on itch.io for the 2026 GMU Spring GameJam (theme: \"Every Choice Echoes\")."
    },
    {
      id: "learning-assistant",
      title: "Learning Assistant (LA)",
      category: "Teaching",
      date: "2026-06-22",
      ongoing: false,
      completion: 1,
      status: "Completed",
      links: { itch: null, instagram: null, youtube: null },
      video: null,
      poster: null,
      pixel: null,
      summary:
        "Provided code reviews and technical guidance for Unity & C# projects (e.g., Isometric Camera, Physics/Collision, Health Systems).",
      description:
        "Provided code reviews and technical guidance for Unity & C# projects (e.g., Isometric Camera, Physics/Collision, Health Systems). Helped students bridge the gap between game design concepts and practical C# implementation.",
      role: "Learning Assistant",
      tools: "Unity, C#",
      team: "TODO",
      outcome:
        "Helped students bridge the gap between game design concepts and practical C# implementation."
    },
    {
      id: "shh",
      title: "Shh",
      category: "GameJam",
      date: "2025-09-21",
      ongoing: false,
      completion: 1,
      status: "Completed",
      links: {
        itch: "https://mangocareer.itch.io/shh",
        instagram: "https://www.instagram.com/p/DO6b5fDkjz-/",
        youtube: null
      },
      video: null,
      poster: "https://img.itch.zone/aW1hZ2UvMzg5ODkzMi8yMzI3ODkxMy5wbmc=/347x500/MWcDFF.png",
      pixel: null,
      summary:
        "Trapped in an abandoned subway tunnel, you escape using a flashlight while mysterious voices guide or mislead you.",
      description:
        "You are trapped inside an abandoned subway tunnel with only one goal: escape. Use WASD to move, Shift to run, and F to toggle your flashlight as you navigate the darkness. The tunnel hides more than shadows. Strange mechanisms, unseen dangers, and mysterious voices echo around you. Listen carefully; they may guide you, or mislead you.",
      role: "Solo developer: programming, art, sound and voice acting",
      tools: "TODO",
      team: "1 (solo)",
      outcome: "Built solo and shipped a Windows build on itch.io for Mason Korea Game Jam Fall 2025."
    },
    {
      id: "save-the-pig",
      title: "Save the Pig",
      category: "Club",
      date: "2024-04-15",
      ongoing: false,
      completion: 1,
      status: "Completed",
      links: {
        itch: "https://g-nonymous.itch.io/bio",
        instagram: "https://www.instagram.com/p/DN4s9RIktL-/",
        youtube: null
      },
      video: null,
      poster: "https://img.itch.zone/aW1nLzEzNzI0MzY5LnBuZw==/347x500/GX%2FIYp.png",
      pixel: null,
      summary: "ASF Prevention Farm: a farming sim about protecting pigs from African Swine Fever.",
      description:
        "In \"ASF Prevention Farm: A Safe Pig Adventure,\" players take on the role of a farmer tasked with safeguarding their animals from the looming threat of ASF. By meeting various requirements, players can ensure their pigs grow up healthy and can be sold for money.",
      role: "Programmer (with Jiwon Bae)",
      tools: "Unity",
      team: "7",
      outcome: "Released on itch.io for HTML5 and Android as part of the GMU x FAO Biosecurity Project."
    },
    {
      id: "lost",
      title: "Lost",
      category: "Class",
      date: "2023-12-11",
      ongoing: false,
      completion: 1,
      status: "Completed",
      links: {
        itch: "https://mangocareer.itch.io/lost",
        instagram: "https://www.instagram.com/p/DN4l3thEs0A/",
        youtube: null
      },
      video: null,
      poster: "https://img.itch.zone/aW1hZ2UvMzkwNDEzMS8yMzI5MjA0Mi5qcGc=/347x500/JdIJ%2BR.jpg",
      pixel: null,
      summary:
        "A maze escape game: run from monsters and find a way out of a maze that seems to repeat forever.",
      description:
        "The protagonist Sooho finds himself in a dimly lit backroom after stumbling while taking out the trash. Armed only with an old camera and a flashlight, he must navigate a strange, seemingly infinite maze while evading monsters to escape. Controls: WASD to move, F for the flashlight, E to interact.",
      role: "TODO",
      tools: "Unreal Engine",
      team: "TODO",
      outcome: "Shipped a 3D horror Windows build on itch.io, made in Unreal Engine."
    },
    {
      id: "doodling",
      title: "Doodling",
      category: "Class",
      date: "2023-12-08",
      ongoing: false,
      completion: 1,
      status: "Completed",
      links: { itch: null, instagram: "https://www.instagram.com/p/DOENZFFEiNo/", youtube: null },
      video: null,
      poster: null,
      pixel: null,
      summary: "TODO",
      role: "TODO",
      tools: "TODO",
      team: "TODO",
      outcome: "TODO"
    },
    {
      id: "bread-game",
      title: "Bread Game",
      category: "Class",
      date: "2023-10-16",
      ongoing: false,
      completion: 1,
      status: "Completed",
      links: {
        itch: "https://mangocareer.itch.io/bread-game",
        instagram: "https://www.instagram.com/p/DOC_O63EmOS/",
        youtube: null
      },
      video: null,
      poster: "https://img.itch.zone/aW1hZ2UvMzg1NDQzNC8yMzI3NjA0NS5wbmc=/347x500/PEIeEQ.png",
      pixel: null,
      summary: "TODO",
      role: "TODO",
      tools: "TODO",
      team: "TODO",
      outcome: "Shipped a Windows build on itch.io as my GAME330 midterm project."
    },
    {
      id: "ccc-challenge",
      title: "CCC challenge",
      category: "Competition",
      date: "2023-09-23",
      ongoing: false,
      completion: 1,
      status: "Completed",
      links: { itch: null, instagram: "https://www.instagram.com/p/DOC-EH6kjHV/", youtube: null },
      video: null,
      poster: null,
      pixel: null,
      summary: "TODO",
      role: "TODO",
      tools: "TODO",
      team: "TODO",
      outcome: "TODO"
    },
    {
      id: "mk-mentoring",
      title: "MK Mentoring",
      category: "Teaching",
      date: "2023-09-16",
      ongoing: false,
      completion: 1,
      status: "Completed",
      links: { itch: null, instagram: null, youtube: null },
      video: null,
      poster: null,
      pixel: null,
      summary: "Lectured on \"How to Recreate the Game Pong\": 9 hours in total over 21 days.",
      description:
        "Lectured for 9 hours in total (3 sessions of 3 hours each over 21 days) on \"How to Recreate the Game Pong\", and successfully recreated the Pong game with students during the program.",
      role: "Lecturer",
      tools: "TODO",
      team: "TODO",
      outcome: "Students recreated a working Pong game by the end of the 3-session program."
    },
    {
      id: "digdigmole",
      title: "DigDigMole",
      category: "Class",
      date: "2023-06-08",
      ongoing: false,
      completion: 1,
      status: "Completed",
      links: {
        itch: "https://mangocareer.itch.io/digdigmole",
        instagram: "https://www.instagram.com/p/CwRumypKfPb/",
        youtube: null
      },
      video: null,
      poster: "https://img.itch.zone/aW1hZ2UvMjEwODgyMC8yMzI3NjA5OS5wbmc=/347x500/U5OwAx.png",
      pixel: null,
      summary:
        "Help a baby mole dig across platforms, defeat enemies and dodge obstacles to find his family.",
      description:
        "Help the baby mole navigate dangerous environments, defeat enemies, and dig across platforms to find his family, all while avoiding obstacles and uncovering secrets in this platformer adventure.",
      role: "TODO",
      tools: "Unity",
      team: "2",
      outcome: "Shipped a 2D pixel-art platformer for Windows on itch.io as a 2-person team."
    },
    {
      id: "sweet-sixteen",
      title: "Sweet Sixteen",
      category: "Club",
      date: "2023-05-23",
      ongoing: false,
      completion: 1,
      status: "Completed",
      links: { itch: "https://mangocareer.itch.io/sweet-sixteen", instagram: null, youtube: null },
      video: null,
      poster: "https://img.itch.zone/aW1nLzEyMjUyMzEwLnBuZw==/347x500/KOc5S%2B.png",
      pixel: null,
      summary: "TODO",
      role: "Programmer: enemy and UI",
      tools: "Unity",
      team: "14",
      outcome: "Programmed the enemies and co-built the UI; released on itch.io as a 14-person club project."
    }
  ]
};
