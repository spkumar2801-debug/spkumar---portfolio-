/**
 * ==============================================================================
 * SALADI PRASANNA KUMAR - PORTFOLIO CONFIGURATION DATA (VERSION 2)
 * ==============================================================================
 * Central configuration file for all personal info, external URLs,
 * projects, skills, and experience.
 * 
 * TO UPDATE YOUR LINKS:
 * Insert your real URLs into the empty string fields below.
 * No fake URLs are generated.
 * ==============================================================================
 */

export const personalInfo = {
  name: "Saladi Prasanna Kumar",
  shortName: "Prasanna Kumar",
  role: "Full Stack AI Developer / Engineer",
  company: "Dream Team Services",
  status: "Currently working at Dream Team Services",
  headline: "Building intelligent, scalable and modern digital experiences across AI, frontend and backend technologies.",
  about: [
    "I currently work as a Full Stack AI Developer / Engineer at Dream Team Services, delivering robust digital products across frontend and backend development.",
    "My engineering work encompasses modern responsive web applications, scalable backend APIs, and seamless artificial intelligence integrations.",
    "I specialize in full-stack architecture with Python, Flask, JavaScript, Firebase, and Cloudinary, crafting systems that balance computational performance with refined aesthetics."
  ],
  education: {
    degree: "B.Tech — Artificial Intelligence and Data Science",
    institution: "VKR, VNB & AGK College of Engineering and Technology",
    graduationYear: "2025 Graduate"
  }
};

// Social & Contact Placeholders (Leave empty or set to real URLs)
export const contactLinks = {
  email: "", // Leave empty if not configured; UI will display "Available on Request"
  linkedin: "", // Insert real LinkedIn URL when available
  github: "https://github.com/spkumar2801-debug",
  youtube: "https://www.youtube.com/@TeluguDelightGamers",
};

// YouTube Creative Pursuit Channel
export const youtubeChannel = {
  name: "Telugu Delight Gamers",
  audience: "2K+ Followers / Subscribers",
  badge: "Creative Pursuit & Community",
  description: "A passionate personal creative achievement channel showcasing high-energy gaming walkthroughs, livestreams, and community leadership outside of software engineering.",
  url: "https://www.youtube.com/@TeluguDelightGamers"
};

// PROJECTS (ONLY THE FOUR REAL PROJECTS AS SPECIFIED)
export const projects = [
  {
    id: "sloopin",
    title: "Sloopin / Instagram Clone",
    shortTitle: "Sloopin",
    tagline: "Social Media Platform",
    description: "A modern social-media-style web application featuring user authentication, interactive feed, media sharing, and fluid responsive interactions.",
    technologies: ["Frontend", "Firebase", "Cloudinary", "JavaScript"],
    github: "https://github.com/spkumar2801-debug/Friend",
    live: ""    // Hidden if not configured
  },
  {
    id: "supermarket",
    title: "Supermarket Management System",
    shortTitle: "Supermarket",
    tagline: "Inventory & Commerce",
    description: "A comprehensive supermarket management application streamlining inventory tracking, product cataloging, transaction billing, and real-time operations.",
    technologies: ["Full Stack", "Database", "JavaScript", "Backend"],
    github: "https://github.com/spkumar2801-debug/SP.Market.Core",
    live: ""    // Hidden if not configured
  },
  {
    id: "pk-attendance",
    title: "PK Attendance Tracking System",
    shortTitle: "PK Attendance",
    tagline: "Enterprise Management",
    description: "An automated attendance tracking platform designed for institutional efficiency, attendance logging, administrative oversight, and student reporting.",
    technologies: ["Full Stack", "Firebase", "Frontend", "JavaScript"],
    github: "https://github.com/spkumar2801-debug/PK-Attendence",
    live: ""    // Hidden if not configured
  },
  {
    id: "pk-college-web",
    title: "PK College of Engineering and Technology Website",
    shortTitle: "PK College of Engineering and Technology",
    tagline: "Institutional Web Portal",
    description: "A modern responsive college website engineered with dynamic academic content management, administrative functionality, and cloud-integrated data architecture.",
    technologies: ["Frontend", "Firebase", "Cloudinary", "JavaScript"],
    github: "https://github.com/spkumar2801-debug/PK-college-",
    live: ""    // Hidden if not configured
  }
];

// Experience Data
export const experience = [
  {
    company: "Dream Team Services",
    role: "Full Stack AI Developer / Engineer",
    status: "Current role",
    period: "Present",
    responsibilities: [
      "Full-stack web development across modern web applications",
      "Frontend development with high responsiveness and cross-device precision",
      "Backend development, server architecture and RESTful API integrations",
      "AI-related development and machine learning application workflows",
      "Firebase integration for real-time data handling and cloud synchronization",
      "Cloudinary integration for scalable cloud media asset pipelines",
      "Building modern responsive web applications optimized for speed and stability"
    ],
    technologies: ["Python", "Flask", "JavaScript", "Frontend", "Backend", "Firebase", "Cloudinary", "AI/ML"]
  }
];

// Skills Matrix (Structured categories without fake percentages)
export const skillCategories = [
  {
    id: "programming",
    name: "Programming",
    kanji: "言語",
    skills: ["Python", "C", "JavaScript"]
  },
  {
    id: "frontend",
    name: "Frontend Development",
    kanji: "表層",
    skills: ["HTML", "CSS", "JavaScript", "Responsive Web Development"]
  },
  {
    id: "backend",
    name: "Backend Development",
    kanji: "基盤",
    skills: ["Python", "Flask", "Backend Development", "API Integration"]
  },
  {
    id: "cloud-data",
    name: "Cloud & Data",
    kanji: "雲層",
    skills: ["Firebase", "MySQL", "Cloudinary"]
  },
  {
    id: "ai",
    name: "AI & Machine Learning",
    kanji: "知能",
    skills: ["Artificial Intelligence", "Machine Learning", "CNN", "AI Application Development"]
  },
  {
    id: "tools",
    name: "Tools & Deployment",
    kanji: "道具",
    skills: ["Git", "GitHub", "Vercel"]
  }
];

// Unified portfolioConfig bridge for modular compatibility with components and main.js
export const portfolioConfig = {
  personalInfo,
  contact: {
    email: contactLinks.email,
    linkedinUrl: contactLinks.linkedin,
    githubUrl: contactLinks.github,
    location: "India"
  },
  contactLinks,
  youtubeChannel,
  projects: projects.map(p => ({
    ...p,
    category: p.tagline,
    githubUrl: p.github,
    liveUrl: p.live,
    highlights: [
      p.tagline,
      p.technologies.slice(0, 2).join(' & ') + ' Integration',
      'Engineered with modern architecture'
    ]
  })),
  skills: {
    programming: {
      category: "Programming",
      kanji: "言語",
      skills: ["Python", "C", "JavaScript"]
    },
    frontend: {
      category: "Frontend Development",
      kanji: "表層",
      skills: ["HTML", "CSS", "JavaScript", "Responsive Web Development"]
    },
    backend: {
      category: "Backend Development",
      kanji: "基盤",
      skills: ["Python", "Flask", "Backend Development", "API Integration"]
    },
    databaseCloud: {
      category: "Cloud & Database",
      kanji: "雲層",
      skills: ["Firebase", "MySQL", "Cloudinary"]
    },
    ai: {
      category: "AI & Machine Learning",
      kanji: "知能",
      skills: ["Artificial Intelligence", "Machine Learning", "CNN", "AI Application Development"]
    },
    tools: {
      category: "Tools & Deployment",
      kanji: "道具",
      skills: ["Git", "GitHub", "Vercel"]
    }
  },
  experience,
  skillCategories
};

export default portfolioConfig;
