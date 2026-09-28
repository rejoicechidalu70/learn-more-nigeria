export type ClassItem = {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  level: "Secondary" | "University" | "Skills";
  offsetHours: number; // relative to now; negative = past
  durationMin: number;
  link: string;
  summary: string;
  transcript: string[];
};

const yt = (s: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(s)}`;

export const CLASSES: ClassItem[] = [
  { id: "cl1", title: "Quadratic Equations Made Easy", subject: "Mathematics", teacher: "Mr. Adebayo", level: "Secondary", offsetHours: 0, durationMin: 60, link: yt("quadratic equations lesson"), summary: "Solving by factorisation, completing the square and the formula.", transcript: ["A quadratic equation has the form ax² + bx + c = 0.", "Step 1: try to factorise. Step 2: set each factor to zero.", "If it won't factorise, use x = (−b ± √(b² − 4ac)) / 2a."] },
  { id: "cl2", title: "JAMB Use of English Drill", subject: "English", teacher: "Mrs. Okafor", level: "Secondary", offsetHours: 20, durationMin: 45, link: yt("JAMB use of english lesson"), summary: "Lexis & structure, concord and comprehension strategies.", transcript: [] },
  { id: "cl3", title: "Intro to Microeconomics", subject: "ECO 101", teacher: "Dr. Bello", level: "University", offsetHours: 44, durationMin: 90, link: yt("introduction to microeconomics lecture"), summary: "Scarcity, choice, demand and supply curves.", transcript: [] },
  { id: "cl4", title: "Build Your First Web Page", subject: "Web Development", teacher: "Tunde (Tech Hub)", level: "Skills", offsetHours: 70, durationMin: 60, link: yt("html css beginner tutorial"), summary: "HTML structure and basic CSS styling.", transcript: [] },
  { id: "cl5", title: "Cell Structure & Functions", subject: "Biology", teacher: "Miss Ibrahim", level: "Secondary", offsetHours: -26, durationMin: 50, link: yt("cell structure and function biology"), summary: "Organelles and what they do — plus WAEC-style questions.", transcript: ["Every living thing is made of cells.", "The nucleus controls the cell; mitochondria release energy.", "Plant cells have a cell wall, chloroplasts and a large vacuole.", "Exam tip: always draw and label diagrams neatly."] },
  { id: "cl6", title: "Electricity: Ohm's Law", subject: "Physics", teacher: "Mr. Eze", level: "Secondary", offsetHours: -50, durationMin: 55, link: yt("ohm's law physics lesson"), summary: "Current, voltage, resistance and simple circuits.", transcript: ["Ohm's law: V = IR.", "Resistors in series add up: R = R₁ + R₂.", "In parallel: 1/R = 1/R₁ + 1/R₂."] },
  { id: "cl7", title: "Organic Chemistry Basics", subject: "CHM 102", teacher: "Dr. Nwosu", level: "University", offsetHours: -74, durationMin: 90, link: yt("organic chemistry basics lecture"), summary: "Hydrocarbons, functional groups and naming (IUPAC).", transcript: ["Organic chemistry is the chemistry of carbon compounds.", "Alkanes are saturated: CnH2n+2.", "Functional groups decide how a compound reacts."] },
  { id: "cl8", title: "Fashion Design: Taking Measurements", subject: "Fashion Design", teacher: "Aunty Ngozi", level: "Skills", offsetHours: -98, durationMin: 40, link: yt("how to take body measurements for sewing"), summary: "Accurate body measurements for any outfit.", transcript: ["Use a soft tape and measure over light clothing.", "Key measurements: bust, waist, hip, shoulder, length.", "Write every measurement down immediately."] },
];

export function classTime(c: ClassItem, now = Date.now()) {
  const start = new Date(Math.floor(now / 3_600_000) * 3_600_000 + c.offsetHours * 3_600_000);
  const end = new Date(start.getTime() + c.durationMin * 60_000);
  const status: "live" | "upcoming" | "past" =
    now >= start.getTime() && now < end.getTime() ? "live" : now < start.getTime() ? "upcoming" : "past";
  return { start, end, status };
}

export function icsFor(c: ClassItem) {
  const { start, end } = classTime(c);
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
    `UID:${c.id}@learnmore`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`,
    `SUMMARY:LEARN MORE: ${c.title}`, `DESCRIPTION:${c.summary} ${c.link}`,
    "BEGIN:VALARM", "TRIGGER:-PT15M", "ACTION:DISPLAY", "DESCRIPTION:Class starts soon", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}
