export type Affirmation = {
  id: string;
  category: "Exam success" | "Goals & growth";
  title: string;
  text: string;
  /** URL of a pre-recorded voice note; when absent the device's voice reads it aloud. */
  audioUrl?: string;
};

export const AFFIRMATION_CATEGORIES = ["Exam success", "Goals & growth"] as const;

export const AFFIRMATIONS: Affirmation[] = [
  { id: "aff-pass", category: "Exam success", title: "I Will Pass", text: "Say it with me, out loud: I will pass my exams. I have prepared, and I am still preparing. Every question I practise today makes the real exam easier. When I sit down in that hall, my mind will be calm and my memory will be sharp. I am not afraid of any paper. Success is already mine, and I am walking towards it every single day." },
  { id: "aff-morning", category: "Exam success", title: "Morning Confidence", text: "Good morning, champion. Today is another chance to move closer to your score. Wake up your mind: read one page, solve one question, revise one topic. Small steps every day beat one big night of cramming. You are stronger than yesterday, and tomorrow you will be stronger than today. Go and make this day count." },
  { id: "aff-study", category: "Exam success", title: "Before You Study", text: "Before you open that book, take a deep breath. You don't need to know everything today — you only need to learn the next thing. Put your phone away, set your timer, and focus for the next thirty minutes. Understanding is coming. Knowledge is entering. You are becoming the student who passes. Now, go and study." },
  { id: "aff-fear", category: "Exam success", title: "No Fear of Failure", text: "Listen to me: fear is a liar. One failed test is not the end of your story — it is a lesson in it. Many great Nigerians failed before they succeeded, and they came back stronger. You are not your last score. You are your next effort. Stand up, pick your pen, and try again. You will pass." },
  { id: "aff-examday", category: "Exam success", title: "Exam Day Calm", text: "It is exam day, and you are ready. You have read, you have practised, you have sacrificed. Breathe in, breathe out. Read every question slowly. Answer the ones you know first, then return to the hard ones. Do not rush, and do not panic. Trust the work you have done. Walk into that hall like the champion you are." },
  { id: "aff-stuck", category: "Exam success", title: "When It Feels Hard", text: "This topic is hard, but so are you. Nobody learns anything worth learning without struggle. When you feel stuck, that is your brain growing stronger. Read it again, watch the class again, ask the tutor again. One day soon, this same topic will feel easy — and you will be the one explaining it to your friends. Keep going." },
  { id: "aff-goals", category: "Goals & growth", title: "I Achieve My Goals", text: "Say it and believe it: I achieve my goals. My dreams are not too big and my background is not a barrier. Every day, I take one action towards the life I want. I write my goals, I plan my steps, and I follow through. What I focus on, I finish. My future is bright, and I am building it now." },
  { id: "aff-discipline", category: "Goals & growth", title: "Discipline Over Feelings", text: "Motivation comes and goes, but discipline stays. You will not always feel like studying, and that is normal. Champions do what needs to be done even when the feeling is gone. Choose the future you want over the comfort of now. Five minutes of starting is all it takes — start, and the rest will follow." },
  { id: "aff-future", category: "Goals & growth", title: "Building My Future", text: "Close your eyes and see it: the certificate, the skill, the business, the life you are building. It is not a dream — it is a plan, and you are the one executing it. Every class you attend, every book you read, every skill you practise is a brick in that future. Keep laying the bricks. Your tomorrow will thank you." },
  { id: "aff-mindset", category: "Goals & growth", title: "Growth Mindset", text: "You are not bad at something — you are just not good at it yet. Yet is a powerful word. The people you admire were once beginners too. They asked questions, they made mistakes, they kept learning. So will you. Today's beginner is tomorrow's expert. Give yourself permission to learn slowly, and watch how far you go." },
];
