export type Exam = "JAMB" | "WAEC" | "NECO";
export type Question = {
  id: string;
  exams: Exam[];
  year: number;
  subject: string;
  topic: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export const EXAMS: Exam[] = ["JAMB", "WAEC", "NECO"];
export const SUBJECTS = ["Mathematics", "English", "Biology", "Physics", "Chemistry", "Economics"];
export const YEARS = [2023, 2022, 2021, 2020, 2019];

const q = (
  id: string, exams: Exam[], year: number, subject: string, topic: string,
  question: string, options: string[], answer: number, explanation: string,
): Question => ({ id, exams, year, subject, topic, question, options, answer, explanation });

const ALL: Exam[] = ["JAMB", "WAEC", "NECO"];

export const QUESTIONS: Question[] = [
  // Mathematics
  q("m1", ALL, 2023, "Mathematics", "Algebra", "Solve for x: 3x − 7 = 11", ["4", "5", "6", "7"], 2, "Add 7 to both sides: 3x = 18. Divide by 3: x = 6."),
  q("m2", ALL, 2022, "Mathematics", "Indices", "Simplify 2³ × 2⁴", ["2⁷", "2¹²", "4⁷", "8¹²"], 0, "When multiplying same bases, add the powers: 3 + 4 = 7, so 2⁷."),
  q("m3", ["JAMB", "WAEC"], 2021, "Mathematics", "Geometry", "The sum of interior angles of a hexagon is", ["540°", "720°", "900°", "1080°"], 1, "Sum = (n − 2) × 180° = (6 − 2) × 180° = 720°."),
  q("m4", ALL, 2020, "Mathematics", "Statistics", "Find the mean of 4, 8, 6, 10, 2", ["5", "6", "7", "8"], 1, "Sum = 30, count = 5, mean = 30 ÷ 5 = 6."),
  q("m5", ["WAEC", "NECO"], 2019, "Mathematics", "Algebra", "Factorise x² − 9", ["(x − 3)²", "(x + 9)(x − 1)", "(x − 3)(x + 3)", "x(x − 9)"], 2, "Difference of two squares: a² − b² = (a − b)(a + b), with a = x, b = 3."),
  q("m6", ALL, 2023, "Mathematics", "Percentages", "What is 15% of ₦2,000?", ["₦150", "₦200", "₦300", "₦350"], 2, "15/100 × 2000 = 300."),
  q("m7", ["JAMB"], 2022, "Mathematics", "Probability", "A fair die is tossed once. What is the probability of getting an even number?", ["1/6", "1/3", "1/2", "2/3"], 2, "Even numbers: 2, 4, 6 → 3 out of 6 outcomes = 1/2."),
  q("m8", ALL, 2021, "Mathematics", "Indices", "Evaluate 16^(1/2)", ["2", "4", "8", "32"], 1, "A power of 1/2 means square root. √16 = 4."),
  // English
  q("e1", ALL, 2023, "English", "Synonyms", "Choose the word nearest in meaning to 'candid'.", ["Frank", "Shy", "Rude", "Clever"], 0, "Candid means honest and direct — 'frank'."),
  q("e2", ALL, 2022, "English", "Antonyms", "Choose the word opposite in meaning to 'scarce'.", ["Rare", "Plentiful", "Small", "Costly"], 1, "Scarce means hard to find; the opposite is plentiful."),
  q("e3", ["JAMB", "WAEC"], 2021, "English", "Grammar", "Neither the teacher nor the students ___ in the hall.", ["was", "is", "were", "has been"], 2, "With 'neither…nor', the verb agrees with the nearer subject: 'students' (plural) → 'were'."),
  q("e4", ALL, 2020, "English", "Grammar", "She has been living in Enugu ___ 2015.", ["for", "since", "from", "in"], 1, "Use 'since' with a point in time (2015); 'for' is used with a length of time."),
  q("e5", ["WAEC", "NECO"], 2019, "English", "Idioms", "'To bury the hatchet' means to", ["hide a weapon", "make peace", "start a fight", "dig a hole"], 1, "The idiom means to end a quarrel and make peace."),
  q("e6", ALL, 2023, "English", "Spelling", "Choose the correctly spelt word.", ["Accomodate", "Acommodate", "Accommodate", "Acomodate"], 2, "'Accommodate' has double c and double m."),
  // Biology
  q("b1", ALL, 2023, "Biology", "Cell Biology", "The powerhouse of the cell is the", ["Nucleus", "Mitochondrion", "Ribosome", "Vacuole"], 1, "Mitochondria release energy (ATP) through respiration."),
  q("b2", ALL, 2022, "Biology", "Ecology", "Organisms that make their own food are called", ["Consumers", "Decomposers", "Producers", "Parasites"], 2, "Producers (like green plants) make food by photosynthesis."),
  q("b3", ["JAMB", "NECO"], 2021, "Biology", "Genetics", "The number of chromosomes in a normal human body cell is", ["23", "44", "46", "48"], 2, "Human body (somatic) cells have 46 chromosomes — 23 pairs."),
  q("b4", ALL, 2020, "Biology", "Human Physiology", "Which blood vessel carries blood away from the heart?", ["Vein", "Artery", "Capillary", "Venule"], 1, "Arteries carry blood away from the heart; veins bring it back."),
  q("b5", ["WAEC", "NECO"], 2019, "Biology", "Plant Biology", "The green pigment in plants is", ["Haemoglobin", "Chlorophyll", "Melanin", "Carotene"], 1, "Chlorophyll absorbs light for photosynthesis."),
  q("b6", ALL, 2022, "Biology", "Human Physiology", "Malaria is caused by", ["A virus", "A bacterium", "Plasmodium", "A fungus"], 2, "Malaria is caused by the Plasmodium parasite, spread by female Anopheles mosquitoes."),
  // Physics
  q("p1", ALL, 2023, "Physics", "Mechanics", "The SI unit of force is the", ["Joule", "Watt", "Newton", "Pascal"], 2, "Force is measured in newtons (N). 1 N = 1 kg·m/s²."),
  q("p2", ALL, 2022, "Physics", "Mechanics", "A car travels 120 km in 2 hours. Its average speed is", ["40 km/h", "60 km/h", "80 km/h", "240 km/h"], 1, "Speed = distance ÷ time = 120 ÷ 2 = 60 km/h."),
  q("p3", ["JAMB", "WAEC"], 2021, "Physics", "Electricity", "Using V = IR, if I = 2 A and R = 5 Ω, V is", ["2.5 V", "7 V", "10 V", "3 V"], 2, "V = I × R = 2 × 5 = 10 V."),
  q("p4", ALL, 2020, "Physics", "Waves", "Sound cannot travel through", ["Water", "Steel", "Air", "A vacuum"], 3, "Sound needs a medium (particles) to travel. A vacuum has none."),
  q("p5", ["WAEC", "NECO"], 2019, "Physics", "Heat", "The temperature at which water boils at sea level is", ["0°C", "50°C", "100°C", "212°C"], 2, "Water boils at 100°C (212°F) at standard atmospheric pressure."),
  // Chemistry
  q("c1", ALL, 2023, "Chemistry", "Atomic Structure", "The atomic number of an element is the number of", ["Neutrons", "Protons", "Electrons + neutrons", "Nucleons"], 1, "Atomic number = number of protons in the nucleus."),
  q("c2", ALL, 2022, "Chemistry", "Acids & Bases", "A solution with pH 2 is", ["Strongly acidic", "Neutral", "Weakly alkaline", "Strongly alkaline"], 0, "pH below 7 is acidic; the lower it is, the stronger the acid."),
  q("c3", ["JAMB", "NECO"], 2021, "Chemistry", "Chemical Bonding", "The bond in NaCl is", ["Covalent", "Ionic", "Metallic", "Hydrogen"], 1, "Sodium gives an electron to chlorine, forming ions held by an ionic bond."),
  q("c4", ALL, 2020, "Chemistry", "Periodic Table", "Which of these is a noble gas?", ["Oxygen", "Nitrogen", "Argon", "Chlorine"], 2, "Argon is in Group 0 (18) — the noble gases."),
  q("c5", ["WAEC", "NECO"], 2019, "Chemistry", "Acids & Bases", "The chemical formula of water is", ["HO", "H₂O", "H₂O₂", "OH₂"], 1, "Two hydrogen atoms bonded to one oxygen atom: H₂O."),
  // Economics
  q("ec1", ALL, 2023, "Economics", "Demand & Supply", "When price rises and other things stay the same, quantity demanded", ["Rises", "Falls", "Stays the same", "Doubles"], 1, "Law of demand: higher price → lower quantity demanded, ceteris paribus."),
  q("ec2", ALL, 2022, "Economics", "Basic Concepts", "Opportunity cost is", ["Money spent", "The next best alternative given up", "Cost of production", "Total revenue"], 1, "It's the value of the next best alternative you give up when you choose."),
  q("ec3", ["JAMB", "WAEC"], 2021, "Economics", "Money & Banking", "The Central Bank of Nigeria controls", ["Only fiscal policy", "Monetary policy", "Trade unions", "School fees"], 1, "The CBN regulates money supply and interest rates — monetary policy."),
  q("ec4", ALL, 2020, "Economics", "Basic Concepts", "The basic economic problem is", ["Inflation", "Scarcity", "Unemployment", "Taxation"], 1, "Wants are unlimited but resources are scarce — this forces choice."),
];

export function filterQuestions(opts: { exam?: string; subject?: string; year?: number }) {
  return QUESTIONS.filter(
    (x) =>
      (!opts.exam || x.exams.includes(opts.exam as Exam)) &&
      (!opts.subject || x.subject === opts.subject) &&
      (!opts.year || x.year === opts.year),
  );
}

export const byId = (id: string) => QUESTIONS.find((x) => x.id === id);
