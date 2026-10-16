// Authoritative INNOSPRINT Event Constants & Default Content

export const EVENT_DETAILS = {
  name: "INNOSPRINT",
  subtitle: "48-HOUR NATIONAL LEVEL HACKATHON",
  level: "National Level Hackathon",
  dates: "October 26–28, 2026",
  shortDates: "OCT 26-28, 2026",
  venue: "VVITU, Guntur, Andhra Pradesh, India",
  venueShort: "VVITU Campus, Guntur, AP",
  prizePool: "₹50,000",
  prizePoolNumeric: 50000,
  durationHours: "48 Hours",
  eligibility: "Students from any recognized College, University, or Technical Institute",
  targetAudience: "Open to Students (Undergraduate, Postgraduate, Diploma)",
  posterNote: "Certificates of participation will be provided to all registered participants according to event guidelines.",
  organizers: {
    institute: "VVITU",
    department: "Department of AI & Robotics",
    contactEmail: "innosprint2026@vvit.ac.in",
    contactPhone: "+91 98765 43210",
    coordinator: "INNOSPRINT Organizing Team",
  }
};

export const PARTNERS_DATA = {
  technologyPartner: {
    id: 'naprocs',
    name: 'NAPROCS Technologies Pvt. Ltd.',
    shortName: 'NAPROCS',
    badge: 'TECHNOLOGY PARTNER',
    role: 'Technology Partner',
    heading: 'Industry Collaboration. Student Innovation.',
    description: 'Collaborating with VVIT to support INNO SPRINT 2026 and its AI, robotics, and software innovation ecosystem.',
    img: '/logos/napros.png',
    accentColor: 'orange'
  },
  hostInstitution: {
    id: 'vvitu',
    name: 'VVIT University',
    shortName: 'VVITU',
    badge: 'HOST INSTITUTION',
    role: 'Host Institution & Venue',
    description: 'The academic institution hosting INNO SPRINT 2026.',
    img: '/logos/vvitu.jpg'
  },
  institutionalEcosystem: [
    {
      id: 'vvitu',
      name: 'VVIT University',
      badge: 'HOST INSTITUTION',
      description: 'The academic institution hosting INNO SPRINT 2026.',
      img: '/logos/vvitu.jpg'
    },
    {
      id: 'vvisc',
      name: 'VVISC',
      badge: 'STUDENT INNOVATION CLUB',
      description: 'Supporting student innovation and technical activities.',
      img: '/logos/vvisc.jpg'
    },
    {
      id: 'iic',
      name: 'IIC',
      badge: "INSTITUTION'S INNOVATION COUNCIL",
      description: 'Supporting the institutional innovation ecosystem.',
      img: '/logos/iic.jpg'
    },
    {
      id: 'ecell',
      name: 'E-CELL VVITU',
      badge: 'ENTREPRENEURSHIP CELL',
      description: 'Representing entrepreneurship and startup-oriented student initiatives.',
      img: '/logos/ecell.png'
    }
  ]
};

export const THEMES = [
  {
    id: "agentic-ai",
    name: "Agentic AI",
    badge: "TRACK 01",
    icon: "Bot",
    color: "cyan",
    gradient: "from-cyan-500 to-blue-600",
    description: "Develop autonomous agents that plan, execute multi-step workflows, interact with APIs, and solve complex real-world tasks with minimal human intervention.",
    keyPoints: [
      "Autonomous Multi-Agent Collaboration",
      "Intelligent Tool & API Calling Workflows",
      "Self-Correcting & Reasoning Systems"
    ],
    exampleProblems: [
      {
        id: "ps-agent-1",
        title: "Autonomous Campus Support & Operations Agent",
        description: "Build an agentic system that can triage student support tickets, navigate university databases, and execute administrative actions autonomously."
      },
      {
        id: "ps-agent-2",
        title: "Multi-Agent Automated Code Auditor & Patch Generator",
        description: "Develop a team of collaborating AI agents that analyze security vulnerabilities in real-time, draft pull requests, and run unit test suites."
      }
    ]
  },
  {
    id: "robotic-ai",
    name: "Robotic AI",
    badge: "TRACK 02",
    icon: "Cpu",
    color: "amber",
    gradient: "from-amber-500 to-orange-600",
    description: "Integrate artificial intelligence with physical or simulated robotics, sensor networks, computer vision, and real-world automation.",
    keyPoints: [
      "Intelligent Autonomous Robotics",
      "Real-time Sensor Processing & IoT Integration",
      "Computer Vision for Navigation & Object Handling"
    ],
    exampleProblems: [
      {
        id: "ps-robot-1",
        title: "Vision-Guided Warehouse Autonomous Mobile Robot (AMR)",
        description: "Design a camera-based navigation pipeline for AMR obstacle avoidance, path optimization, and automated inventory scanning."
      },
      {
        id: "ps-robot-2",
        title: "AI-Powered Agricultural Crop Health Inspection Drone",
        description: "Create an edge-AI system for autonomous aerial drones to detect early crop disease and pinpoint irrigation needs."
      }
    ]
  },
  {
    id: "generative-ai",
    name: "Generative AI",
    badge: "TRACK 03",
    icon: "Sparkles",
    color: "purple",
    gradient: "from-purple-500 to-pink-600",
    description: "Harness multimodal LLMs, diffusion models, and synthesis architectures to revolutionize content generation, creative design, and technical productivity.",
    keyPoints: [
      "Multimodal Text, Code & Media Synthesis",
      "Domain-Specific Fine-Tuned GenAI Workflows",
      "Generative Assistive Tools for Education & Healthcare"
    ],
    exampleProblems: [
      {
        id: "ps-gen-1",
        title: "Interactive GenAI Tutor for Complex Engineering Concepts",
        description: "Build a generative tutor that dynamically creates visual diagrams, code sandboxes, and personalized quizzes tailored to student learning styles."
      },
      {
        id: "ps-gen-2",
        title: "Multilingual Medical Report Synthesizer & Patient Explainer",
        description: "Develop a secure GenAI tool that translates complex clinical diagnostic reports into clear, empathetic local language summaries."
      }
    ]
  }
];

export const DEFAULT_RULES = [
  {
    category: "Eligibility & Team Formation",
    items: [
      "Participants must be currently enrolled students at an accredited educational institution.",
      "A valid student ID must be presented during check-in.",
      "Teams must contain 2–4 members. Individual participation is not permitted.",
      "Cross-institutional teams are allowed.",
      "Each participant may belong to only one team throughout the event."
    ]
  },
  {
    category: "Originality & Development",
    items: [
      "Project development for the competition must occur during the official 48-hour sprint.",
      "Existing open-source libraries, frameworks, and APIs are allowed when appropriately credited.",
      "Complete pre-built applications cannot be presented as work created during the sprint.",
      "Plagiarism, uncredited code theft, or falsified development claims can result in disqualification."
    ]
  },
  {
    category: "AI Tools & Infrastructure",
    items: [
      "Commercial and open-source LLMs, APIs, and AI frameworks are permitted.",
      "Teams must use API keys and cloud credentials they are authorized to use.",
      "Submissions must demonstrate original system architecture and meaningful custom code or prompt engineering.",
      "Teams must disclose significant third-party tools and dependencies used in their projects."
    ]
  },
  {
    category: "Submission Requirements",
    items: [
      "Submit a public GitHub repository containing the project source code.",
      "Include a demonstration video no longer than 3 minutes.",
      "Deliver a live project pitch.",
      "Submit the final project before the official code-freeze deadline on October 28, 2026 (Official deadline time to be announced)."
    ]
  },
  {
    category: "Judging & Scoring",
    items: [
      "Innovation (30%): Originality and the value of the idea.",
      "Technical Execution (30%): Implementation quality and functionality.",
      "Practical Impact (20%): Relevance and potential real-world usefulness.",
      "Presentation (20%): Clarity, demonstration, and explanation.",
      "The organizers' and judges' decisions are final and binding under the event rules."
    ]
  },
  {
    category: "Code of Conduct",
    items: [
      "Treat participants, mentors, judges, volunteers, and organizers respectfully.",
      "Harassment, discrimination, threats, and disruptive behavior are prohibited.",
      "Do not misrepresent project ownership, development history, or results.",
      "Follow event safety requirements and organizer instructions."
    ]
  }
];

export const SCHEDULE_JOURNEY_STAGES = [
  {
    id: "stage-01",
    number: "01",
    stageLabel: "STAGE 01",
    title: "KICKOFF",
    fullTitle: "STAGE 01 — KICKOFF",
    date: "October 26, 2026",
    description: "Begin the INNOSPRINT challenge.",
    checklist: [
      "Registration and check-in",
      "Opening ceremony",
      "Problem briefing",
      "Team readiness"
    ],
    accent: "cyan",
    align: "left",
    iconType: "kickoff"
  },
  {
    id: "stage-02",
    number: "02",
    stageLabel: "STAGE 02",
    title: "BUILD",
    fullTitle: "STAGE 02 — BUILD",
    date: "October 26–27, 2026",
    description: "Transform ideas into working prototypes.",
    checklist: [
      "Develop the solution",
      "Build the application or prototype",
      "Use permitted AI, robotics, and technology tools",
      "Collaborate with teammates",
      "Seek mentor support where available"
    ],
    accent: "red",
    align: "right",
    iconType: "build"
  },
  {
    id: "stage-03",
    number: "03",
    stageLabel: "STAGE 03",
    title: "REFINE",
    fullTitle: "STAGE 03 — REFINE",
    date: "October 27–28, 2026",
    description: "Improve functionality and prepare the final demonstration.",
    checklist: [
      "Test and debug",
      "Improve performance",
      "Validate the core features",
      "Prepare the demonstration and presentation",
      "Finalize project documentation"
    ],
    accent: "purple",
    align: "left",
    iconType: "refine"
  },
  {
    id: "stage-04",
    number: "04",
    stageLabel: "STAGE 04",
    title: "CODE FREEZE",
    fullTitle: "STAGE 04 — CODE FREEZE",
    date: "October 28, 2026",
    description: "Finalize the project and prepare the official submission.",
    checklist: [
      "Finalize the source code",
      "Submit the GitHub repository",
      "Upload the demonstration video, maximum 3 minutes",
      "Prepare the final pitch"
    ],
    specialCallout: {
      label: "OFFICIAL SUBMISSION DEADLINE",
      value: "TIME TO BE ANNOUNCED"
    },
    accent: "amber",
    align: "right",
    iconType: "code-freeze"
  },
  {
    id: "stage-05",
    number: "05",
    stageLabel: "STAGE 05",
    title: "PITCH & JUDGING",
    fullTitle: "STAGE 05 — PITCH & JUDGING",
    date: "October 28, 2026, subject to the official schedule.",
    description: "Demonstrate the project and explain its real-world value.",
    checklist: [
      "Live project demonstration",
      "Presentation to the judges",
      "Technical and practical evaluation",
      "Results announcement according to the official schedule"
    ],
    accent: "blue",
    align: "left",
    iconType: "pitch"
  }
];

export const SCHEDULE_FINAL_STAGE = {
  id: "final-stage",
  stageLabel: "FINAL STAGE",
  title: "RESULTS & RECOGNITION",
  fullTitle: "FINAL STAGE — RESULTS & RECOGNITION",
  description: "The culmination of the 48-hour AI & Robotics innovation journey.",
  checklist: [
    "Winner announcement",
    "Awards and recognition",
    "Participation certificates according to event guidelines",
    "Celebration of innovation and teamwork"
  ]
};

export const OFFICIAL_SCHEDULE_DAYS = [
  {
    dayNumber: 1,
    dayName: "Day 1",
    dayLabel: "DAY 01",
    date: "Friday, July 26, 2026",
    shortDate: "JUL 26, 2026",
    theme: "cyan",
    highlightText: "Reporting, Kickoff, Pitching & Sprint Launch",
    events: [
      {
        time: "06:45 AM",
        title: "Reporting",
        type: "milestone",
        badge: "ARRIVAL",
        description: "Participants report to VVITU hackathon premises for attendance and desk allocation.",
        isMilestone: true
      },
      {
        time: "07:00–07:15 AM",
        title: "Opening Ceremony",
        type: "ceremony",
        badge: "CEREMONY",
        description: "Official inauguration of Naprocs Innovation Sprint 2026.",
        isMilestone: true
      },
      {
        time: "07:15–07:20 AM",
        title: "CEO Address",
        type: "keynote",
        badge: "KEYNOTE",
        description: "Address and strategic vision shared by the CEO.",
        isMilestone: false
      },
      {
        time: "07:20–07:30 AM",
        title: "Hackathon Theme Announcement, Rules & Guidelines",
        type: "briefing",
        badge: "GUIDELINES",
        description: "Official release of competition tracks, challenge statements, submission criteria, and rules.",
        isMilestone: true
      },
      {
        time: "07:30–08:30 AM",
        title: "Idea Pitch",
        type: "pitch",
        badge: "PITCHING",
        note: "10 minutes per team",
        description: "Each team pitches their proposed software solution and architectural direction (10 mins per team).",
        isMilestone: true
      },
      {
        time: "08:45 AM",
        title: "Coding Begins",
        type: "code-start",
        badge: "SPRINT START",
        description: "Official sprint timer commences. All teams start development in their designated workspaces.",
        isMilestone: true,
        highlight: true
      },
      {
        time: "01:00 PM",
        title: "Lunch",
        type: "meal",
        badge: "MEAL BREAK",
        description: "Catered lunch break and energy recharge for all teams.",
        isMilestone: false
      },
      {
        time: "01:45 PM",
        title: "Code Back",
        type: "dev",
        badge: "SPRINT ACTIVE",
        description: "Resume technical implementation and module building.",
        isMilestone: false
      },
      {
        time: "04:00 PM",
        title: "Mentor Review, Session 1",
        type: "review",
        badge: "MENTORSHIP",
        description: "First technical checkpoint with industry mentors for architecture review and feedback.",
        isMilestone: true
      },
      {
        time: "04:30 PM",
        title: "Evening Coffee",
        type: "refreshment",
        badge: "REFRESHMENT",
        description: "Quick coffee break and informal team discussion.",
        isMilestone: false
      },
      {
        time: "04:45 PM",
        title: "Code Back",
        type: "dev",
        badge: "SPRINT ACTIVE",
        description: "Continue feature integration, backend/AI pipelines, and frontend styling.",
        isMilestone: false
      },
      {
        time: "07:30 PM",
        title: "Dinner",
        type: "meal",
        badge: "MEAL BREAK",
        description: "Dinner served on campus for all participants and organizers.",
        isMilestone: false
      },
      {
        time: "08:15 PM",
        title: "Code Back",
        type: "dev",
        badge: "NIGHT SPRINT",
        description: "Night sprint begins; core logic stabilization and component assembly.",
        isMilestone: false
      },
      {
        time: "08:45 PM",
        title: "Self-Review 1",
        type: "review",
        badge: "INTERNAL REVIEW",
        description: "Team self-assessment on milestone progress and backlog prioritization.",
        isMilestone: false
      },
      {
        time: "09:00 PM",
        title: "Checkpoint",
        type: "milestone",
        badge: "CHECKPOINT",
        description: "Day 1 status checkpoint with the organizing committee.",
        isMilestone: true
      }
    ]
  },
  {
    dayNumber: 2,
    dayName: "Day 2",
    dayLabel: "DAY 02",
    date: "Saturday, July 27, 2026",
    shortDate: "JUL 27, 2026",
    theme: "amber",
    highlightText: "Full-Throttle Development, QA & Final Code Freeze",
    events: [
      {
        time: "07:00 AM",
        title: "Code Back",
        type: "dev",
        badge: "MORNING SPRINT",
        description: "Resume development after rest; teams work on core functionalities.",
        isMilestone: false
      },
      {
        time: "08:15 AM",
        title: "Morning Coffee",
        type: "refreshment",
        badge: "REFRESHMENT",
        description: "Morning coffee and breakfast recharge.",
        isMilestone: false
      },
      {
        time: "08:30 AM",
        title: "Code Back",
        type: "dev",
        badge: "SPRINT ACTIVE",
        description: "Full integration of frontend, APIs, and AI/database layers.",
        isMilestone: false
      },
      {
        time: "01:00 PM",
        title: "Lunch",
        type: "meal",
        badge: "MEAL BREAK",
        description: "Lunch break for all participants and organizing staff.",
        isMilestone: false
      },
      {
        time: "01:45 PM",
        title: "Code Back",
        type: "dev",
        badge: "SPRINT ACTIVE",
        description: "Polishing user flows, UI/UX responsiveness, and core algorithms.",
        isMilestone: false
      },
      {
        time: "04:00 PM",
        title: "Mentor Review, Session 2",
        type: "review",
        badge: "MENTORSHIP",
        description: "Second checkpoint with mentors to test edge cases and presentation readiness.",
        isMilestone: true
      },
      {
        time: "04:30 PM",
        title: "Evening Coffee",
        type: "refreshment",
        badge: "REFRESHMENT",
        description: "Evening beverage break.",
        isMilestone: false
      },
      {
        time: "04:45 PM",
        title: "QA & Testing",
        type: "qa",
        badge: "QA & TESTING",
        description: "Rigorous quality assurance, cross-browser checks, and defect mitigation.",
        isMilestone: true
      },
      {
        time: "07:30 PM",
        title: "Dinner",
        type: "meal",
        badge: "MEAL BREAK",
        description: "Dinner served at the venue.",
        isMilestone: false
      },
      {
        time: "08:15 PM",
        title: "Code Back / Bug Fix",
        type: "dev",
        badge: "BUG SQUASHING",
        description: "Final bug squashing, documentation sync, and pre-freeze verification.",
        isMilestone: false
      },
      {
        time: "08:45 PM",
        title: "Self-Review 2",
        type: "review",
        badge: "INTERNAL REVIEW",
        description: "Final team self-check before strict source code lock.",
        isMilestone: false
      },
      {
        time: "09:00 PM",
        title: "Final Code Freeze",
        type: "freeze",
        badge: "MAJOR MILESTONE",
        description: "Strict code freeze. All commit activity on development repositories must cease.",
        isMilestone: true,
        highlight: true
      }
    ]
  },
  {
    dayNumber: 3,
    dayName: "Day 3",
    dayLabel: "DAY 03",
    date: "Sunday, July 28, 2026",
    shortDate: "JUL 28, 2026",
    theme: "purple",
    highlightText: "Presentation Prep, Final Freeze, Demos & Closing Ceremony",
    events: [
      {
        time: "07:00 AM",
        title: "Presentation & Report Preparation",
        type: "prep",
        badge: "DOCS & SLIDES",
        description: "Teams finalize their PPT pitch decks, BRD documentation, architecture diagrams, and submission assets.",
        isMilestone: false
      },
      {
        time: "08:15 AM",
        title: "Morning Coffee",
        type: "refreshment",
        badge: "REFRESHMENT",
        description: "Morning coffee and final setup.",
        isMilestone: false
      },
      {
        time: "08:30 AM",
        title: "Work Back",
        type: "dev",
        badge: "FINAL POLISH",
        description: "Final rehearsal of presentation delivery and verification of demo environment.",
        isMilestone: false
      },
      {
        time: "09:45 AM",
        title: "Final Freeze",
        type: "freeze",
        badge: "ABSOLUTE LOCK",
        description: "All presentation slides, BRDs, architecture diagrams, and submission deliverables are locked.",
        isMilestone: true,
        highlight: true
      },
      {
        time: "09:50 AM",
        title: "Introduction of Judges Panel",
        type: "ceremony",
        badge: "PANEL INTRO",
        description: "Official introduction and welcoming of the distinguished evaluation jury.",
        isMilestone: true
      },
      {
        time: "10:00 AM",
        title: "Final Project Presentation, Live Demo & Judges Evaluation",
        type: "pitch",
        badge: "GRAND EVALUATION",
        note: "10 min presentation • 5 min demo • 10 min Q&A",
        description: "Each team presents to the panel: 10 minutes maximum presentation, 5 minutes live demonstration, and 10 minutes judges' analysis & Q&A.",
        isMilestone: true,
        highlight: true
      },
      {
        time: "11:00 AM",
        title: "Closing Ceremony",
        type: "ceremony",
        badge: "VALEDICTORY",
        description: "Winner trophy announcement, certificates of excellence, exciting rewards, CEO recognition, and conclusion.",
        isMilestone: true,
        highlight: true
      }
    ]
  }
];

export const DEFAULT_SCHEDULE = [
  {
    date: "July 26, 2026",
    time: "06:45 AM – 08:45 AM",
    title: "DAY 1: REPORTING, KICKOFF & PITCHING",
    description: "06:45 AM Reporting, Opening Ceremony, CEO Address, Theme & Rules Announcement, Team Idea Pitch (10m per team), and 08:45 AM Coding Begins.",
    location: "VVITU Campus"
  },
  {
    date: "July 26, 2026",
    time: "08:45 AM – 09:00 PM",
    title: "DAY 1: SPRINT SESSIONS & MENTOR REVIEW",
    description: "Intensive coding blocks with lunch & dinner breaks, Mentor Review Session 1 at 04:00 PM, Self-Review 1 at 08:45 PM, and Day 1 Checkpoint at 09:00 PM.",
    location: "Sprint Arena"
  },
  {
    date: "July 27, 2026",
    time: "07:00 AM – 04:45 PM",
    title: "DAY 2: DEEP BUILD & MENTOR REVIEW 2",
    description: "Morning sprint resume, Mentor Review Session 2 at 04:00 PM, and scheduled coffee & meal recharges throughout the day.",
    location: "Sprint Arena"
  },
  {
    date: "July 27, 2026",
    time: "04:45 PM – 09:00 PM",
    title: "DAY 2: QA, TESTING & FINAL CODE FREEZE",
    description: "04:45 PM QA & Testing, Dinner at 07:30 PM, Bug fixing, Self-Review 2 at 08:45 PM, and 09:00 PM Final Code Freeze.",
    location: "Sprint Arena"
  },
  {
    date: "July 28, 2026",
    time: "07:00 AM – 09:45 AM",
    title: "DAY 3: PRESENTATION PREP & FINAL FREEZE",
    description: "07:00 AM Presentation & Report Prep, Coffee recharge, Work Back, and 09:45 AM Final Freeze (slides, BRD & deliverables lock).",
    location: "Auditorium / Media Lab"
  },
  {
    date: "July 28, 2026",
    time: "09:50 AM – 11:00 AM",
    title: "DAY 3: LIVE DEMOS, EVALUATION & CLOSING CEREMONY",
    description: "09:50 AM Judges Panel Intro, 10:00 AM Final Presentation (10m pitch, 5m live demo, 10m Q&A per team), followed by 11:00 AM Closing Ceremony & Awards.",
    location: "Main Auditorium, VVITU"
  }
];

export const DEFAULT_FAQS = [
  {
    category: "General",
    question: "What is INNOSPRINT 2026?",
    answer: "INNOSPRINT is an intensive 48-hour national hackathon hosted at VVITU, Guntur, focused on Agentic AI, Robotic AI, and Generative AI challenges."
  },
  {
    category: "Registration",
    question: "Is there a registration fee for participants?",
    answer: "No, there is no registration fee. Participation in INNOSPRINT 2026 is completely free for all eligible students."
  },
  {
    category: "Participation",
    question: "Can I participate individually without a team?",
    answer: "No, individual participation is not allowed. You must register and participate as a team of 2 to 4 members."
  },
  {
    category: "Submission",
    question: "What needs to be submitted at code freeze?",
    answer: "Teams must submit a link to their public GitHub repository, a brief project description, demo video, and slides before the October 28 deadline."
  },
  {
    category: "Certificates",
    question: "Will every participant receive a certificate?",
    answer: "Yes, official certificates of participation will be awarded to all participants who present a valid project submission according to event guidelines."
  }
];
