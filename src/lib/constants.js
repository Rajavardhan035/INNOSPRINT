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

export const DEFAULT_SCHEDULE = [
  {
    date: "October 26, 2026",
    time: "STAGE 01",
    title: "KICKOFF",
    description: "Begin the INNOSPRINT challenge: Registration and check-in, opening ceremony, problem briefing, and team readiness.",
    location: "VVIT University, Guntur"
  },
  {
    date: "October 26–27, 2026",
    time: "STAGE 02",
    title: "BUILD",
    description: "Transform ideas into working prototypes using permitted AI, robotics, and technology tools with teammate collaboration and mentor support.",
    location: "Innovation Arenas"
  },
  {
    date: "October 27–28, 2026",
    time: "STAGE 03",
    title: "REFINE",
    description: "Test and debug, improve performance, validate core features, prepare demonstration and presentation, and finalize documentation.",
    location: "Sprint Labs"
  },
  {
    date: "October 28, 2026",
    time: "TIME TO BE ANNOUNCED",
    title: "CODE FREEZE",
    description: "Finalize source code, submit GitHub repository, upload demonstration video (max 3 minutes), and prepare final pitch.",
    location: "Official Submission Portal"
  },
  {
    date: "October 28, 2026",
    time: "OFFICIAL SCHEDULE",
    title: "PITCH & JUDGING",
    description: "Live project demonstration, presentation to the judges, technical and practical evaluation, and results announcement.",
    location: "Judging Arena"
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
