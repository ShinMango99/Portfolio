    window.PORTFOLIO = {
  profile: {
    name: "Jaemin Cho",
    title: "Unity / C# Game Developer",
    photo: "assets/img/profile.webp",
    intro:
      "Unity & C# Developer and Pixel Artist turning creative game concepts into playable reality.",
    // hero title: heroLead / (typed phrase) / heroTail, one per line
    heroLead: "I'm confident in",
    typedPhrases: ["Unity & C# gameplay", "pixel art", "teaching & mentoring", "team collaboration"],
    heroTail: "and I ship what I start.",
    // Master reel (~1 min highlight video cut to music). YouTube URL or "assets/video/reel.mp4".
    // While null, the Home hero shows the featured project thumbnails instead.
    reel: "assets/video/reel.mp4",
    reelPoster: "assets/img/reel-poster.jpg",
    // silent 960x540 copy of the reel that autoplays on loop in the Home hero, like a GIF
    reelLoop: "assets/video/reel-loop.mp4",
    // shown big on the Home page, in this order
    featured: ["shh", "save-the-pig", "this-is-not-chess", "toast-to-the-past"],
    // evidence for the claims above; each links to the page that proves it
    proof: [
      { title: "1st Place", text: "Mason Korea Game Jam Fall 2025, solo", href: "project.html?id=shh" },
      { title: "World Food Forum", text: "Exhibited in Rome, 2023", href: "project.html?id=save-the-pig" },
      { title: "10+ Games", text: "Playable, in Unity and Unreal", href: "solo.html" },
      { title: "Unity / C# Teacher", text: "Lecturer and Learning Assistant", href: "teaching.html" }
    ],
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
        { name: "C#", level: 7, desc: "Main language. What I have used the most while working in Unity." },
        { name: "C++", level: 6, desc: "A stepping stone I went through while learning C#." }
      ]
    },
    {
      group: "Engine",
      items: [
        { name: "Unity", level: 7, desc: "Main engine, used in every project." },
        { name: "Unreal", level: 4, desc: "Blueprint-style coding was hard at first, but I have grown comfortable with it." }
      ]
    },
    {
      group: "Art",
      items: [
        { name: "Pixel Art", level: 5, desc: "I can generally produce the look I have in mind." },
        { name: "DaVinci Resolve", level: 4, desc: "I can edit and put together game trailers." },
        { name: "Adobe", level: 3, desc: "Photoshop, Illustrator, InDesign and Premiere Pro: I understand how they are structured and can use them." },
        { name: "3ds Max", level: 2, desc: "I understand how it is structured and can use it." }
      ]
    },
    {
      group: "Communication",
      items: [
        { name: "Teaching", level: 6, desc: "Experience teaching as a teaching assistant / instructor." },
        { name: "Collaboration", level: 5, desc: "Experience making games through team projects and collaborations." }
      ]
    }
  ],

  // Sub-pages linked from the Home portal and the top menu.
  // Projects are sorted into solo / team / teaching automatically (main.js: groupOf).
  categories: [
    {
      id: "solo",
      title: "Solo Projects",
      page: "solo.html",
      cover: "shh",
      more: "team", // "More projects" link at the bottom of the page
      blurb: "Projects I built alone from start to finish: programming, art, sound and release. Includes Shh, the 1st-place game jam entry."
    },
    {
      id: "team",
      title: "Team Projects",
      page: "team.html",
      cover: "save-the-pig",
      more: "solo",
      blurb: "Club, class and competition projects with teams of 2 to 14, including Save the Pig for FAO Korea and the mobile shooter Cat'astrophe."
    },
    {
      id: "teaching",
      title: "Communication",
      page: "teaching.html",
      cover: "learning-assistant",
      blurb: "Explaining games and code to other people: teaching Unity and C# as a lecturer and as a Learning Assistant at George Mason University."
    },
    {
      id: "about",
      title: "About & Resume",
      page: "about.html",
      coverImage: "assets/img/profile.webp",
      blurb: "Bio, skills, resume and a timeline from 2022 to now."
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
      // plain-language summary for readers outside games (shown at the top of the project page)
      plain:
        "A game about the dangers of drug addiction, told through a girl who collects sweets. I was one of the programmers in a 14-person club team and built the enemies and part of the on-screen interface.",
      sections: [
        {
          heading: "What I built",
          items: [
            "Enemy AI built as a state machine, with separate ranges for noticing, chasing and attacking the player. It was my first enemy AI.",
            "UI, which gave me a much deeper understanding of how game interfaces work.",
            "An opening camera shot made with Cinemachine that focuses on the scene before play starts.",
            "Fitting my code together with the other programmers in a 14-person team."
          ]
        },
        {
          heading: "What I learned",
          text: "How a serious game, a game made to teach or raise awareness, balances fun with its message. Finishing and releasing it with the club meant a lot to me."
        }
      ],
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
      preview: "assets/video/preview/digdigmole.mp4", // 4 s silent loop, plays on hover like an itch.io cover GIF
      summary: "Help a baby mole dig across platforms, defeat enemies and dodge obstacles to find his family.",
      // plain-language summary for readers outside games (shown at the top of the project page)
      plain:
        "A 2D pixel-art game where a baby mole digs through the ground, jumps across platforms and dodges enemies to find his family. I programmed it and designed the levels in a team of three.",
      sections: [
        {
          heading: "What I built",
          items: [
            "Digging: a pixel tilemap where tiles can be dug away. It was my first time building this, and it got me comfortable with tilemaps.",
            "Simple enemy AI.",
            "Level design, which taught me how to shape the flow of a game.",
            "Platformer controls, tuned again and again to feel better in the player's hands."
          ]
        }
      ],
      role: "Programming, level design",
      tools: "Unity",
      team: "3",
      outcome: "Shipped a 2D pixel-art platformer for Windows on itch.io as a 3-person team."
    },
    {
      id: "mk-mentoring",
      title: "MK Mentoring",
      category: "Communication",
      date: "2023-09-16",
      ongoing: false,
      completion: 1,
      links: { itch: null, instagram: null, youtube: null },
      video: null,
      poster: "assets/img/mentoring-1.webp",
      // extra photos shown on the project page
      gallery: ["assets/img/mentoring-1.webp", "assets/img/mentoring-2.webp", "assets/img/mentoring-3.webp"],
      summary:
        "Lectured for 9 hours in total (3 sessions of 3 hours each over 21 days) on \"How to Recreate the Game Pong\", and successfully recreated the Pong game with students during the program.",
      // plain-language summary for readers outside games (shown at the top of the project page)
      plain:
        "I taught a short coding class where students built the classic game Pong step by step, in three classes of three hours each. By the end, the students had a working Pong game.",
      sections: [
        {
          heading: "What I did",
          items: [
            "Designed the curriculum and class materials, splitting Pong into three classes.",
            "Studied the topics again even though I already knew them, so my examples were easier for beginners to follow.",
            "Explained coding to students who were learning it for the first time.",
            "Fixed problems on the spot when students hit errors or fell behind."
          ]
        }
      ],
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
        youtube: "https://youtu.be/0fFwyaOrnb8" 
      },
      video: null,
      poster: "assets/img/ccc-challenge.png",
      preview: "assets/video/preview/ccc-challenge.mp4", // 4 s silent loop of the AR filter preview, plays on hover
      summary:
        "Created a TikTok AR filter for the Clear Code Challenge in collaboration with Purito. Players have to catch falling serum ingredients with a bottle.",
      // plain-language summary for readers outside games (shown at the top of the project page)
      plain:
        "A TikTok camera filter game made for a competition with the skincare brand Purito: you move a bottle to catch falling serum ingredients. Our team of three was called MileStone, and I was the producer and programmer and handled marketing.",
      sections: [
        {
          heading: "What I built",
          items: [
            "My first augmented reality (AR) filter, built in TikTok's Effect House.",
            "The catching gameplay: ingredients fall, and the bottle catches them.",
            "Effect House uses visual scripting much like Unreal's Blueprints, so my Unreal experience carried over.",
            "There were very few examples online, so debugging took hundreds of tries. Just as we were about to settle for less, it worked the way we wanted.",
            "Marketing through our presentation, showing what we built and why it stands out."
          ]
        }
      ],
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
      // plain-language summary for readers outside games (shown at the top of the project page)
      plain:
        "A short game about a loaf of bread escaping from the oven, made for The Figment, a small retro game console. I programmed it and designed the levels in a team of three.",
      sections: [
        {
          heading: "What I built",
          items: [
            "Gameplay and levels that fit the limits of a retro console.",
            "The bread's escape, and the way its story is shown as you play.",
            "Level design."
          ]
        },
        {
          heading: "What I learned",
          text: "This project taught me the most about teamwork. Feedback came slowly, plans slipped and the results weren't what we hoped, but I took responsibility, pushed through and shipped on time. It also taught me to whitebox early: build a working version with simple shapes first, then add the art."
        }
      ],
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
      preview: "assets/video/preview/doodling.mp4", // 4 s silent loop, plays on hover like an itch.io cover GIF
      summary: "Defend the castle against the paper army!",
      // plain-language summary for readers outside games (shown at the top of the project page)
      plain:
        "A side-scrolling defense game where you protect your castle from an army of paper soldiers, made to run on a Nintendo DS. I programmed it and designed the levels in a team of three.",
      sections: [
        {
          heading: "What I built",
          items: [
            "Touch controls for the DS touch screen. It has its own functions, different from the phone touch input I knew, which made it fresh and fun to learn.",
            "Castle defense gameplay and waves of enemies.",
            "Level design.",
            "Whiteboxing first, so the working game was in place early and the schedule barely slipped.",
            "Fixing balance, hitboxes and button response after playtests so the game feels fair."
          ]
        }
      ],
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
        youtube: "https://youtu.be/fpMcv02b-Ic"
      },
      video: null,
      poster: null,
      preview: "assets/video/preview/lost.mp4", // 4 s silent loop, plays on hover like an itch.io cover GIF
      summary: "A maze escape game: run from monsters and find a way out of a maze that seems to repeat forever.",
      // plain-language summary for readers outside games (shown at the top of the project page)
      plain:
        "A 3D horror game where you run from monsters through a maze that seems to repeat forever, looking for the way out. I made it alone, and it was my first game in Unreal Engine.",
      sections: [
        {
          heading: "What I built",
          items: [
            "My first Unreal Engine project, and my first time using Blueprints, Unreal's visual scripting.",
            "Monster AI that hunts you by sound, and a statue that reacts to light, like the Weeping Angels: it only moves when you can't see it.",
            "Doors and drawers that swing open with animation, and a cabinet you can hide inside.",
            "Triggers that set off scares and events as you move through the maze.",
            "Lighting and sound tuned to build fear.",
            "The maze level design, which was the hardest part."
          ]
        },
        {
          heading: "What I learned",
          text: "Playtest feedback showed me where players got confused or bored, and I changed the game to make their experience better."
        }
      ],
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
      poster: "assets/img/save-the-pig.jpg",
      preview: "assets/video/preview/save-the-pig.mp4", // 4 s silent loop, plays on hover like an itch.io cover GIF
      award: "Exhibited at the World Food Forum 2023, Rome",
      press: [
        { label: "GMU article", href: "https://chss.gmu.edu/articles/19979" },
        { label: "FAO event page", href: "https://www.fao.org/asiapacific/events/events-detail/World-Food-Forum-/en" }
      ],
      summary: "ASF Prevention Farm: a farming sim about protecting pigs from African Swine Fever.",
      // plain-language summary for readers outside games (shown at the top of the project page)
      plain:
        "A farming game that teaches how to protect pigs from African Swine Fever, a deadly pig disease. My club made it with FAO Korea, part of the UN's food and farming agency, and it was shown at the World Food Forum in Rome. I was one of the two programmers.",
      sections: [
        {
          heading: "What I built",
          text: "The inventory, drag and drop into the world, level-ups and the zoomable map camera were all new to me here.",
          items: [
            "Core farm-sim systems for raising and protecting the pigs.",
            "An inventory system.",
            "Drag and drop: an item dragged out of the menu turns into an object placed on the farm.",
            "A level-up system.",
            "A map camera you can zoom in and out and drag around, like in mobile strategy games.",
            "The UI, including the screens that teach how to prevent the disease.",
            "The HTML5 and Android builds.",
            "Working with FAO Korea to fit their requests and prepare the version shown in Rome."
          ]
        }
      ],
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
      award: "1st place overall, Mason Korea Game Jam Fall 2025",
      links: {
        itch: "https://mangocareer.itch.io/shh",
        instagram: "https://www.instagram.com/p/DO6b5fDkjz-/",
        youtube: "https://youtu.be/h2Kdwcp37r0"
      },
      video: null,
      poster: null,
      preview: "assets/video/preview/shh.mp4", // 4 s silent loop, plays on hover like an itch.io cover GIF
      summary: "Trapped in an abandoned subway tunnel, you escape using a flashlight while mysterious voices guide or mislead you.",
      // plain-language summary for readers outside games (shown at the top of the project page)
      plain:
        "A short horror game: you are lost in a dark subway tunnel with only a flashlight, and voices tell you where to go, but some of them lie. I made all of it alone, from the code to the art, sound and voices, and it won 1st place at a game jam (a short game-making contest).",
      sections: [
        {
          heading: "What I built",
          items: [
            "The whole game, alone, from the first idea to the submitted build: programming, art, sound and voice acting.",
            "Flashlight and darkness: the tunnel is lit only by your flashlight, so you never see more than a few steps ahead.",
            "A voice guide that can lie: recorded voices point the way, and some of them lead you wrong.",
            "A 3D tunnel and monsters built mostly from simple cubes to fit my modeling skills. The centipede came out especially well.",
            "Sound and horror pacing that keep the tension up from start to end."
          ]
        },
        {
          heading: "What I learned",
          items: [
            "Procedural animation: I learned it for the first time to make the centipede crawl, and I'm happy with how it moves.",
            "Adding animated cutscenes caused a bug I couldn't fully fix during the jam, so cutscenes are the next thing I want to study."
          ]
        }
      ],
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
      // plain-language summary for readers outside games (shown at the top of the project page)
      plain:
        "A 2D vertical-scrolling shooter for phones: the screen scrolls upward as Simon the cat fights waves of enemies on his way to find his missing Granny. I wrote all of the code and led the team of six as producer.",
      sections: [
        {
          heading: "What I built",
          text: "Infinite scrolling, parallax, object pooling and data-driven waves were all new to me on this project.",
          items: [
            "All of the game's code, as coding lead, including bringing my teammates' work together into one project.",
            "The whole game flow, designed from start to finish, and carrying it all the way to a shipped Android build.",
            "An endless scrolling background with parallax layers for depth.",
            "Enemy waves driven by data, so new waves can be added without writing new code.",
            "Object pooling: bullets and enemies are reused instead of destroyed, so no leftover garbage slows the phone down.",
            "Touch controls, tuned again and again from playtest feedback.",
            "Level design, and as producer, running the team of six."
          ]
        }
      ],
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
      links: { itch: "https://mangocareer.itch.io/toast-to-the-past", instagram: null, youtube: "https://youtu.be/NUGwvdhcQ6I" },
      video: null,
      poster: "https://img.itch.zone/aW1nLzI3NDYyNDI5LnBuZw==/original/85QetF.png",
      preview: "assets/video/preview/toast-to-the-past.mp4", // 4 s silent loop, plays on hover like an itch.io cover GIF
      summary: "Time is your most precious resource: every action that speeds up or pauses time leaves an echo in the environment.",
      // plain-language summary for readers outside games (shown at the top of the project page)
      plain:
        "A 2D jumping game where you can speed up, slow down or stop time, and every choice changes the world around you. I made the code, the pixel art and the levels alone in a two-day game jam.",
      sections: [
        {
          heading: "What I built",
          items: [
            "Time controls: speeding up, slowing down and stopping time, and the puzzles built around them.",
            "Level design around those time puzzles.",
            "A countdown timer set to tense music. When you slow or stop time, the music slows and stops with it.",
            "Several endings, each with a small surprise to find.",
            "The platformer controls and all of the pixel art."
          ]
        },
        {
          heading: "How I worked",
          text: "I spent the first of the two jam days only on design. That gave the game a solid base and a clear direction, so the second day went into building it."
        }
      ],
      role: "Programming, pixel art",
      tools: "Unity",
      team: "1 (solo)",
      outcome: "Shipped a Windows platformer on itch.io for the 2026 GMU Spring GameJam (theme: \"Every Choice Echoes\")."
    },
    {
      id: "learning-assistant",
      title: "Learning Assistant (LA)",
      category: "Communication",
      date: "2026-06-20",
      period: "Mar - Jun 2026 (Spring semester, 16 weeks)",
      ongoing: false,
      completion: 1,
      links: { itch: null, instagram: null, youtube: null },
      // my UNIV 333 video post on asking questions instead of handing over answers
      video: "assets/video/la-questions.mp4",
      mediaLabel: "Play video",
      poster: "assets/img/la.webp",
      summary:
        "Learning Assistant for GAME 140 and GAME 240 at George Mason University Korea, supporting Prof. John P. Doran. Over 16 weeks and about 180 hours, I helped students turn game design ideas into working Unity and C# code, from isometric cameras and collision matrices to health systems and build errors.",
      description:
        "In the LA program, a student who has already taken a course works beside its professor: in the classroom, in office hours and online. Alongside the job I took UNIV 333, the LA seminar on peer teaching, where I set a SMART goal, presented a semester plan, and gave a midterm and a final report on what worked.",
      stats: [
        { value: "180+", label: "hours over 16 weeks" },
        { value: "2", label: "courses: GAME 140 & 240" },
        { value: "6 h", label: "of office hours every week" },
        { value: "100%", label: "of build errors brought to me fixed" }
      ],
      sections: [
        {
          heading: "What I did",
          items: [
            "Sat in on every GAME 140 and GAME 240 class (about 5.5 hours a week) and debugged C# live while students worked in Unity.",
            "Held office hours on Tuesdays 2-5 PM and Wednesdays 1-4 PM, plus open lab and online sessions before deadlines.",
            "Answered questions on Discord, KakaoTalk and email, on weekends and up to midnight, so nobody was stuck alone with a broken build.",
            "Gave code reviews on projects such as Pong and projectile mechanics, and wrote feedback on graded assignments.",
            "When a bug was hard to explain in text, I recorded short video tutorials for common Unity problems that students could rewatch any time.",
            "Acted as the bridge to Prof. Doran: we talked through assignment structure, grading and course flow, and when I wasn't sure of an answer, I asked him and shared it with the whole class."
          ]
        },
        {
          heading: "Questions, not answers",
          text: "My goal was to grow students' own debugging, so I pointed to the exact line and asked why it fails instead of rewriting the code for them.",
          items: [
            "Probing: \"Is the script not running, or is the physics engine not responding?\"",
            "Leading: \"If the Ground Check is at the waist instead of the feet, what happens to the boolean?\"",
            "Comparing: \"How does Input.GetAxis compare to the New Input System's CallbackContext?\""
          ]
        },
        {
          heading: "Results",
          items: [
            "Every student who came to me with a build error ended up with a working, exported build.",
            "Guided struggling students to finish and submit working Unity games, many of them non-programmers who were afraid of C# at the start.",
            "Prof. Doran praised how clear and actionable my messages to students were, and encouraged me to organize student feedback logs."
          ]
        },
        {
          heading: "What I learned",
          items: [
            "Empathy comes before debugging. My job wasn't to be a \"human compiler\"; when a student was frustrated, understanding what they meant to design came first.",
            "Make asking easy and early. At the midterm, most students only reached out the night before the deadline, so in the second half I pushed for earlier contact to avoid emergency debugging.",
            "Be kind and fair at once: enforcing late-submission rules and rubrics while keeping a supportive relationship.",
            "Next time, I'd write structured debugging guides for common physics and collision-matrix issues instead of solving each case one by one."
          ]
        }
      ],
      quote: "You don't need to know everything. \"This is a tricky bug, let's read the docs and figure it out together\" builds real trust. Be their guide, not their answer sheet.",
      quoteSource: "My message to future LAs, UNIV 333 final report",
      gallery: [
        { src: "assets/img/la-semester-plan.webp", caption: "Semester plan: roles, goals, and my weekly class and office-hour schedule." },
        { src: "assets/img/la-channels.webp", caption: "Midterm report: added video tutorials to Kakao, email and Discord support." },
        { src: "assets/img/la-csharp-barrier.webp", caption: "Midterm report: lowering the C# barrier for non-programmers." },
        { src: "assets/img/la-questions.webp", caption: "Questioning techniques that guide thinking without giving the answer away." },
        { src: "assets/img/la-concept-map.webp", caption: "Concept map of Computer Game Design as a triathlon of art, coding and design." },
        { src: "assets/img/la-discord-code.webp", caption: "A Discord guide I shared: how to paste code so I can read and review it." }
      ],
      // plain-language summary for readers outside games (shown at the top of the project page)
      plain:
        "For one semester I worked beside a professor in two game programming classes, helping students turn their game ideas into working code in class, in office hours and online: about 180 hours in all.",
      role: "Learning Assistant to Prof. John P. Doran",
      tools: "Unity, C#, Discord, KakaoTalk",
      team: null,
      outcome: "About 180 hours of class, office-hour and online support; every student who brought me a build error left with a working build."
    },
    {
      id: "ohmycod",
      title: "OhmyCod",
      category: "Personal",
      date: "2026-09-09",
      ongoing: true,
      completion: 0.3,
      links: { itch: null, instagram: "https://www.instagram.com/p/DdB52fcKDRq/", youtube: "https://youtu.be/MTsg2eIMW3U" },
      video: null,
      poster: "assets/img/ohmycod.webp",
      preview: "assets/video/preview/ohmycod.mp4", // 4 s silent loop, plays on hover like an itch.io cover GIF
      summary: "A desperate flopping journey of a fish out of water!",
      description: "I'm currently developing OhmyCod, a 2D pixel platformer packed with unique physics and fun mechanics!",
      // plain-language summary for readers outside games (shown at the top of the project page)
      plain:
        "A 2D pixel game about a fish out of water, flopping its way across land. Two of us are making it: I do the programming and the art. It is about 30% done.",
      sections: [
        {
          heading: "What I'm focusing on",
          items: [
            "The fish's flop and the slosh of water: the feel that sets this game apart from other platformers.",
            "Juice: squishy, bouncy animation for the player and enemies, and a book that turns its pages on the title screen.",
            "Enemy AI built as a state machine, with every case split apart so bugs are easier to predict and fix.",
            "Particle effects, which I'm still learning."
          ]
        }
      ],
      role: "Programming, art",
      tools: "Unity, Aseprite",
      team: "2",
      outcome: "In development: 30% complete. A 2D pixel fish platformer."
    },
    {
      id: "this-is-not-chess",
      title: "This Is Not Chess",
      category: "Personal",
      date: "2026-10-17",
      ongoing: true,
      completion: 0.2,
      links: { itch: "https://mangocareer.itch.io/this-is-not-chess", instagram: "https://www.instagram.com/reel/DenDmP3Kjz-/", youtube: "https://youtu.be/M9X4RftFP8I" },
      video: null,
      poster: "assets/img/this-is-not-chess.webp",
      preview: "assets/video/preview/this-is-not-chess.mp4", // 4 s silent loop, plays on hover like an itch.io cover GIF
      summary: "Chess, but nothing stays still.",
      description:
        "An online multiplayer chess game made for people who don't know chess. It fuses chess with entirely different genres, so the other genre does half the teaching. The first is Deckmate, a card game mode with Uno-style cards: play a card to bend the rules, and 22 jokers can completely change the board mid-game.",
      // plain-language summary for readers outside games (shown at the top of the project page)
      plain:
        "Chess for people who don't know chess. It mixes chess with completely different kinds of games, starting with a card mode where cards change the rules mid-game, and you can play it online against a friend. I design the rules and build it with two teammates.",
      sections: [
        {
          heading: "What I focused on",
          items: [
            "Fusing chess with different genres, and stretching one idea into many modes. Deckmate, the card mode with 22 jokers, is the first.",
            "Online multiplayer, so two players can face each other from different computers.",
            "Game feel and VFX: making every move, card and joker feel punchy on screen.",
            "AI pair programming: using AI tools, skills and plugins to build faster, while checking that the game never feels AI-made and actually gives players a good experience.",
            "Testing the limits of AI: finding where it helps and where I still need to design and fix things myself."
          ]
        }
      ],
      role: "Game design, rules design, game feel/VFX direction, programming (AI-assisted)",
      tools: "Unity, C#, AI pair programming",
      team: "3",
      outcome: "Windows build downloadable on itch.io, with online multiplayer, a Classic mode, and a Deckmate card mode with 22 jokers."
    }
  ]
};
