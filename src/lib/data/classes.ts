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
  { id: "cl9", title: "Indices & Logarithms Crash Class", subject: "Mathematics", teacher: "Mr. Adebayo", level: "Secondary", offsetHours: 6, durationMin: 55, link: yt("indices and logarithms lesson"), summary: "Laws of indices and how to solve logarithm questions fast.", transcript: ["aᵐ × aⁿ = aᵐ⁺ⁿ and aᵐ ÷ aⁿ = aᵐ⁻ⁿ.", "log(xy) = log x + log y; log xⁿ = n log x.", "Exam tip: change every base to 10 or e when stuck."] },
  { id: "cl10", title: "WAEC Formal Letter Writing", subject: "English", teacher: "Mrs. Okafor", level: "Secondary", offsetHours: 26, durationMin: 50, link: yt("formal letter writing WAEC"), summary: "Layout, tone and common mistakes in WAEC and NECO letters.", transcript: ["Formal letters need your address, date, receiver's address, salutation and title.", "Keep the tone respectful and go straight to the point.", "Close with 'Yours faithfully' when you don't know the name."] },
  { id: "cl11", title: "Genetics & Heredity", subject: "Biology", teacher: "Miss Ibrahim", level: "Secondary", offsetHours: 52, durationMin: 60, link: yt("genetics and heredity lesson"), summary: "Genes, dominant and recessive traits, and Punnett squares.", transcript: ["Genes come in pairs; one from each parent.", "Dominant traits (T) hide recessive ones (t).", "Practise Punnett squares — WAEC loves them."] },
  { id: "cl12", title: "Demand & Supply Explained", subject: "Economics", teacher: "Mr. Danjuma", level: "Secondary", offsetHours: 96, durationMin: 50, link: yt("demand and supply economics lesson"), summary: "Why prices change — with Nigerian market examples.", transcript: ["When supply falls, prices rise — think tomato in the rainy season.", "Demand curve slopes down; supply curve slopes up.", "Equilibrium is where the two curves meet."] },
  { id: "cl13", title: "Waves and Sound", subject: "Physics", teacher: "Mr. Eze", level: "Secondary", offsetHours: 120, durationMin: 55, link: yt("waves and sound physics lesson"), summary: "Frequency, wavelength, amplitude and echoes.", transcript: ["v = f × λ links speed, frequency and wavelength.", "Echo problems: distance = (speed × time) ÷ 2.", "Sound needs a medium; it cannot travel in a vacuum."] },
  { id: "cl14", title: "Python for Beginners (CSC 102)", subject: "Computer Science", teacher: "Tunde (Tech Hub)", level: "University", offsetHours: 32, durationMin: 70, link: yt("python programming beginner lecture"), summary: "Variables, if statements, loops and your first program.", transcript: ["Python is beginner-friendly: no semicolons, indentation matters.", "Start with variables, then if statements, then loops.", "Write a program that prints your name — that's step one."] },
  { id: "cl15", title: "MTH 101: Introduction to Calculus", subject: "Mathematics", teacher: "Dr. Sadiq", level: "University", offsetHours: 68, durationMin: 90, link: yt("introduction to calculus lecture"), summary: "Limits, derivatives and simple applications.", transcript: ["A derivative measures rate of change.", "d/dx of xⁿ = n·xⁿ⁻¹.", "Calculus is used for speed, growth and optimisation problems."] },
  { id: "cl16", title: "Financial Accounting: The Ledger", subject: "Accounting", teacher: "Mr. Obi", level: "University", offsetHours: 92, durationMin: 80, link: yt("financial accounting ledger lecture"), summary: "Posting to ledger accounts and balancing them.", transcript: [] },
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
