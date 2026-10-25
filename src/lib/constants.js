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
    contactEmail: "innosprint2k26@gmail.com",
    contactPhone: "+91 90145 09649",
    contactPhoneRaw: "9014509649",
    coordinator: "INNOSPRINT Organizing Team",
  },
  registrationsOpen: false,
  registrationClosedNotice: "The registration window for INNOSPRINT 2026 has officially concluded. Registration time is completed."
};

export const REGISTRATIONS_OPEN = false;

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
    date: "Monday, October 26, 2026",
    shortDate: "OCT 26, 2026",
    theme: "cyan",
    highlightText: "Inauguration, Theme Reveal, Sprint Launch & Mentor Guidance",
    events: [
      {
        time: "10:00 AM – 11:00 AM",
        title: "Inauguration",
        type: "ceremony",
        badge: "INAUGURATION",
        description: "Official opening and welcome ceremony of INNOSPRINT 2026.",
        isMilestone: true,
        highlight: true
      },
      {
        time: "11:00 AM – 12:00 PM",
        title: "Theme Reveal and Problem Statement Briefing",
        type: "briefing",
        badge: "THEME REVEAL",
        description: "Unveiling of competition tracks, problem statement briefing, guidelines, and evaluation rubrics.",
        isMilestone: true
      },
      {
        time: "12:00 PM",
        title: "Hackathon Begins",
        type: "code-start",
        badge: "SPRINT LAUNCH",
        description: "Official 48-hour hackathon timer starts. Teams assemble in sprint arenas.",
        isMilestone: true,
        highlight: true
      },
      {
        time: "12:00 PM – 1:00 PM",
        title: "Idea Discussion – Phase 1",
        type: "pitch",
        badge: "PHASE 1",
        description: "Internal team ideation, solution scoping, technology stack finalization, and architecture planning.",
        isMilestone: false
      },
      {
        time: "1:00 PM – 2:00 PM",
        title: "Lunch Break",
        type: "meal",
        badge: "LUNCH BREAK",
        description: "Lunch served for all participants and organizing teams at the campus dining hall.",
        isMilestone: false
      },
      {
        time: "2:00 PM – 4:00 PM",
        title: "Idea Discussion and Mentor Guidance – Phase 1 Ends",
        type: "review",
        badge: "MENTOR GUIDANCE",
        description: "Mentorship review round for architectural validation and feedback. Marks conclusion of Phase 1.",
        isMilestone: true,
        highlight: true
      },
      {
        time: "4:30 PM – 6:00 PM",
        title: "Games / Recreational Activities",
        type: "prep",
        badge: "RECREATION",
        description: "Fun team activities, interactive recreational games, and mental recharge.",
        isMilestone: false
      },
      {
        time: "6:00 PM – 6:30 PM",
        title: "Refreshments",
        type: "refreshment",
        badge: "REFRESHMENTS",
        description: "Evening tea, coffee, and energy snacks.",
        isMilestone: false
      },
      {
        time: "6:30 PM – 8:00 PM",
        title: "Hackathon",
        type: "dev",
        badge: "SPRINT ACTIVE",
        description: "Focused development sprint on core algorithms, UI prototyping, and database schemas.",
        isMilestone: false
      },
      {
        time: "8:00 PM – 9:00 PM",
        title: "Dinner Break",
        type: "meal",
        badge: "DINNER BREAK",
        description: "Catered dinner break for all hackathon teams.",
        isMilestone: false
      },
      {
        time: "9:00 PM – 11:00 PM",
        title: "Hackathon",
        type: "dev",
        badge: "SPRINT ACTIVE",
        description: "Intensive coding block; frontend components and backend API implementation.",
        isMilestone: false
      },
      {
        time: "11:00 PM – 1:00 AM",
        title: "Ice Break / Rest Break",
        type: "prep",
        badge: "ICE BREAK",
        description: "Midnight icebreakers, informal networking, and relaxation break.",
        isMilestone: false
      },
      {
        time: "1:00 AM – 3:00 AM",
        title: "Hackathon",
        type: "dev",
        badge: "OVERNIGHT SPRINT",
        description: "Late-night development session: component wiring, integrations, and logic testing.",
        isMilestone: false
      },
      {
        time: "3:00 AM – 3:15 AM",
        title: "Refreshments",
        type: "refreshment",
        badge: "REFRESHMENTS",
        description: "Midnight hot coffee, tea, and biscuits.",
        isMilestone: false
      },
      {
        time: "3:15 AM – 5:00 AM",
        title: "Hackathon",
        type: "dev",
        badge: "OVERNIGHT SPRINT",
        description: "Overnight coding sprint continuing until dawn.",
        isMilestone: false
      }
    ]
  },
  {
    dayNumber: 2,
    dayName: "Day 2",
    dayLabel: "DAY 02",
    date: "Tuesday, October 27, 2026",
    shortDate: "OCT 27, 2026",
    theme: "amber",
    highlightText: "Sponsors Spotlight, Mentorship Round 2 & Cultural Eve",
    events: [
      {
        time: "5:00 AM – 7:00 AM",
        title: "Freshening Up / Refreshment Break",
        type: "refreshment",
        badge: "REST BREAK",
        description: "Morning freshening up, personal time, and quick morning beverages.",
        isMilestone: false
      },
      {
        time: "7:00 AM – 8:00 AM",
        title: "Breakfast",
        type: "meal",
        badge: "BREAKFAST",
        description: "Wholesome breakfast served to all participants.",
        isMilestone: false
      },
      {
        time: "8:00 AM – 8:40 AM",
        title: "Sponsors Promotions",
        type: "briefing",
        badge: "SPONSOR SHOWCASE",
        description: "Technology partner presentations, API showcase, and sponsor platform spotlight.",
        isMilestone: true
      },
      {
        time: "8:40 AM – 10:00 AM",
        title: "Hackathon",
        type: "dev",
        badge: "MORNING SPRINT",
        description: "Morning development resumes across all hackathon workspaces.",
        isMilestone: false
      },
      {
        time: "10:00 AM – 11:00 AM",
        title: "Mentorship Round 2 – Phase 2 Ends",
        type: "review",
        badge: "MENTORSHIP ROUND 2",
        description: "Second milestone review checkpoint with mentors. Technical progress validation and Phase 2 conclusion.",
        isMilestone: true,
        highlight: true
      },
      {
        time: "11:00 AM – 1:00 PM",
        title: "Hackathon",
        type: "dev",
        badge: "SPRINT ACTIVE",
        description: "Post-review adjustments, feature polishing, and model fine-tuning.",
        isMilestone: false
      },
      {
        time: "1:00 PM – 2:00 PM",
        title: "Lunch Break",
        type: "meal",
        badge: "LUNCH BREAK",
        description: "Lunch served for participants and organizing staff.",
        isMilestone: false
      },
      {
        time: "2:00 PM – 4:30 PM",
        title: "Hackathon",
        type: "dev",
        badge: "SPRINT ACTIVE",
        description: "Afternoon development block: frontend integration and backend robustness.",
        isMilestone: false
      },
      {
        time: "4:30 PM – 6:00 PM",
        title: "Club Performances",
        type: "ceremony",
        badge: "CULTURAL / PERFORMANCES",
        description: "Live student club performances, music, and cultural events for motivation and energy.",
        isMilestone: true,
        highlight: true
      },
      {
        time: "6:00 PM – 6:15 PM",
        title: "Refreshments",
        type: "refreshment",
        badge: "REFRESHMENTS",
        description: "Evening tea, snacks, and beverage break.",
        isMilestone: false
      },
      {
        time: "6:15 PM – 8:00 PM",
        title: "Hackathon",
        type: "dev",
        badge: "SPRINT ACTIVE",
        description: "Integration testing, error handling, and pre-deployment setups.",
        isMilestone: false
      },
      {
        time: "8:00 PM – 9:00 PM",
        title: "Dinner Break",
        type: "meal",
        badge: "DINNER BREAK",
        description: "Dinner served at the venue.",
        isMilestone: false
      },
      {
        time: "9:00 PM – 9:30 PM",
        title: "Rest / Transition Break",
        type: "prep",
        badge: "REST BREAK",
        description: "Short relaxation break before entering the overnight push.",
        isMilestone: false
      },
      {
        time: "9:30 PM – 12:00 AM",
        title: "Hackathon",
        type: "dev",
        badge: "NIGHT SPRINT",
        description: "Night sprint focusing on core deliverables, presentations, and demo prep.",
        isMilestone: false
      },
      {
        time: "12:00 AM – 1:00 AM",
        title: "Personal Break",
        type: "prep",
        badge: "PERSONAL BREAK",
        description: "Personal downtime, rest, and energy replenishment.",
        isMilestone: false
      },
      {
        time: "1:00 AM – 3:00 AM",
        title: "Hackathon",
        type: "dev",
        badge: "OVERNIGHT SPRINT",
        description: "Late-night build optimization, styling refinements, and test verification.",
        isMilestone: false
      },
      {
        time: "3:00 AM – 3:15 AM",
        title: "Snack / Refreshment Break",
        type: "refreshment",
        badge: "REFRESHMENTS",
        description: "Hot beverages and snacks to keep stamina high.",
        isMilestone: false
      },
      {
        time: "3:15 AM – 5:00 AM",
        title: "Hackathon",
        type: "dev",
        badge: "OVERNIGHT SPRINT",
        description: "Final overnight coding stretch leading into Day 3.",
        isMilestone: false
      }
    ]
  },
  {
    dayNumber: 3,
    dayName: "Day 3",
    dayLabel: "DAY 03",
    date: "Wednesday, October 28, 2026",
    shortDate: "OCT 28, 2026",
    theme: "purple",
    highlightText: "Final Evaluation (Phase 3) & Grand Closing Ceremony",
    events: [
      {
        time: "5:00 AM – 7:00 AM",
        title: "Refreshment / Freshening Up",
        type: "refreshment",
        badge: "REST BREAK",
        description: "Freshening up, packing workspaces, and morning refreshments.",
        isMilestone: false
      },
      {
        time: "7:00 AM – 8:00 AM",
        title: "Breakfast",
        type: "meal",
        badge: "BREAKFAST",
        description: "Breakfast served to all participants and jury members.",
        isMilestone: false
      },
      {
        time: "8:00 AM – 9:00 AM",
        title: "Final Evaluation – Phase 3 Ends",
        type: "review",
        badge: "FINAL EVALUATION",
        description: "Formal jury evaluation, live project demonstration, and code inspection. Marks the end of Phase 3.",
        isMilestone: true,
        highlight: true
      },
      {
        time: "9:00 AM – 10:00 AM",
        title: "Buffer / Preparation for Closing Ceremony",
        type: "prep",
        badge: "PREPARATION",
        description: "Jury score compilation, winner deliberations, auditorium seating, and stage setup.",
        isMilestone: false
      },
      {
        time: "10:00 AM – 12:00 PM",
        title: "Closing Ceremony",
        type: "ceremony",
        badge: "CLOSING CEREMONY",
        description: "Grand valedictory function, trophy presentation, winner announcements, and certificate awards.",
        isMilestone: true,
        highlight: true
      }
    ]
  }
];

export const DEFAULT_SCHEDULE = [
  {
    date: "October 26, 2026",
    time: "10:00 AM – 04:00 PM",
    title: "DAY 1: INAUGURATION, THEME REVEAL & PHASE 1",
    description: "10:00 AM Inauguration, 11:00 AM Theme Reveal, 12:00 PM Hackathon Begins & Idea Discussion, followed by Lunch and Mentor Guidance (Phase 1 Ends at 04:00 PM).",
    location: "Main Auditorium & Arena"
  },
  {
    date: "October 26, 2026",
    time: "04:30 PM – Overnight",
    title: "DAY 1: RECREATION, MEALS & OVERNIGHT SPRINT",
    description: "Games & recreational activities, refreshments, dinner break at 08:00 PM, midnight icebreakers, and intensive overnight development blocks.",
    location: "Sprint Arena"
  },
  {
    date: "October 27, 2026",
    time: "07:00 AM – 01:00 PM",
    title: "DAY 2: SPONSOR SHOWCASE & MENTORSHIP ROUND 2",
    description: "Breakfast at 07:00 AM, Sponsor Promotions at 08:00 AM, Morning Sprint, and Mentorship Round 2 (Phase 2 Ends at 11:00 AM).",
    location: "Sprint Arena"
  },
  {
    date: "October 27, 2026",
    time: "01:00 PM – Overnight",
    title: "DAY 2: CLUB PERFORMANCES & NIGHT BUILD",
    description: "Lunch break, afternoon sprint, Club Performances at 04:30 PM, dinner at 08:00 PM, and late-night coding towards final completion.",
    location: "Campus Amphitheatre & Arena"
  },
  {
    date: "October 28, 2026",
    time: "05:00 AM – 09:00 AM",
    title: "DAY 3: BREAKFAST & FINAL EVALUATION (PHASE 3)",
    description: "Freshening up, breakfast at 07:00 AM, and Final Evaluation with the judging panel from 08:00 AM – 09:00 AM (Phase 3 Ends).",
    location: "Evaluation Halls"
  },
  {
    date: "October 28, 2026",
    time: "09:00 AM – 12:00 PM",
    title: "DAY 3: BUFFER & GRAND CLOSING CEREMONY",
    description: "Score compilation and stage setup, followed by the Grand Closing Ceremony and Prize Distribution from 10:00 AM – 12:00 PM.",
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
