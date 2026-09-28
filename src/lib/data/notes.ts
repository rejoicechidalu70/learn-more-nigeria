export type NoteLevel = "JSS" | "SSS" | "University";
export type SampleNote = {
  id: string; level: NoteLevel; subject: string; course: string; topic: string; title: string; body: string;
};

export const LEVELS: NoteLevel[] = ["JSS", "SSS", "University"];

export const SUBJECTS_BY_LEVEL: Record<NoteLevel, string[]> = {
  JSS: ["Mathematics", "English Studies", "Basic Science", "Basic Technology", "Social Studies", "Civic Education", "Business Studies", "Computer Studies"],
  SSS: ["Mathematics", "English", "Biology", "Physics", "Chemistry", "Economics", "Government", "Literature", "Geography", "Commerce", "Accounting", "Agricultural Science"],
  University: ["Computer Science", "Economics", "Medicine & Surgery", "Law", "Engineering", "Accounting", "Mass Communication", "Microbiology", "Political Science", "Education"],
};

export const SAMPLE_NOTES: SampleNote[] = [
  { id: "n1", level: "JSS", subject: "Mathematics", course: "JSS 1", topic: "Fractions", title: "Understanding Fractions", body: "A fraction shows part of a whole. Top number = numerator, bottom = denominator.\n\nTo add fractions with the same denominator, add the numerators: 1/5 + 2/5 = 3/5.\n\nWith different denominators, find the LCM first: 1/2 + 1/3 = 3/6 + 2/6 = 5/6." },
  { id: "n2", level: "JSS", subject: "Basic Science", course: "JSS 2", topic: "Living Things", title: "Characteristics of Living Things", body: "Remember MR NIGER D:\nMovement, Respiration, Nutrition, Irritability, Growth, Excretion, Reproduction, Death." },
  { id: "n3", level: "SSS", subject: "Biology", course: "SS 2", topic: "Photosynthesis", title: "Photosynthesis Summary", body: "Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (in the presence of light and chlorophyll).\n\nLight stage happens in the grana; dark stage (Calvin cycle) happens in the stroma.\n\nFactors: light intensity, CO₂ concentration, temperature, water." },
  { id: "n4", level: "SSS", subject: "Physics", course: "SS 1", topic: "Motion", title: "Equations of Motion", body: "v = u + at\ns = ut + ½at²\nv² = u² + 2as\n\nu = initial velocity, v = final velocity, a = acceleration, t = time, s = distance." },
  { id: "n5", level: "SSS", subject: "Economics", course: "SS 3", topic: "Elasticity", title: "Price Elasticity of Demand", body: "PED = % change in quantity demanded ÷ % change in price.\n\n|PED| > 1 → elastic; < 1 → inelastic; = 1 → unitary.\n\nNecessities (salt, fuel) tend to be inelastic." },
  { id: "n6", level: "University", subject: "Computer Science", course: "CSC 101 – Intro to Computing", topic: "Number Systems", title: "Binary & Hexadecimal", body: "Binary is base 2 (0,1). Hex is base 16 (0–9, A–F).\n\nConvert 13 to binary: 13 = 8 + 4 + 1 → 1101.\n\nEach hex digit = 4 binary bits: 1101 = D." },
  { id: "n7", level: "University", subject: "Economics", course: "ECO 101 – Principles of Economics", topic: "Market Structures", title: "Perfect Competition vs Monopoly", body: "Perfect competition: many sellers, identical products, free entry, price takers.\n\nMonopoly: single seller, no close substitutes, barriers to entry, price maker." },
  { id: "n8", level: "University", subject: "Law", course: "LAW 101 – Nigerian Legal System", topic: "Sources of Law", title: "Sources of Nigerian Law", body: "1. The Constitution (supreme)\n2. Legislation (Acts, Laws)\n3. Received English law\n4. Customary law\n5. Islamic law\n6. Judicial precedent" },
  { id: "n9", level: "University", subject: "Microbiology", course: "MCB 201 – General Microbiology", topic: "Bacteria", title: "Bacterial Cell Structure", body: "Bacteria are prokaryotes: no true nucleus.\n\nParts: cell wall, cell membrane, cytoplasm, ribosomes (70S), nucleoid, sometimes flagella and capsule.\n\nGram-positive: thick peptidoglycan (purple). Gram-negative: thin + outer membrane (pink)." },
];
