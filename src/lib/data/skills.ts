export type Lesson = { id: string; title: string; text: string; video: string; quiz: { q: string; options: string[]; answer: number } };
export type Module = { title: string; lessons: Lesson[] };
export type Skill = { id: string; name: string; track: "Tech" | "Vocational"; emoji: string; blurb: string; modules: Module[] };

const yt = (s: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(s)}`;

type Seed = [id: string, name: string, track: "Tech" | "Vocational", emoji: string, blurb: string, lessons: [string, string, string, string[], number][]];

const SEEDS: Seed[] = [
  ["web-dev", "Web Development", "Tech", "💻", "Build websites with HTML, CSS and JavaScript.", [
    ["What is HTML?", "HTML gives a web page its structure using tags like <h1>, <p> and <a>. Every page starts with <!DOCTYPE html>.", "Which language gives a page its structure?", ["CSS", "HTML", "Python", "SQL"], 1],
    ["Styling with CSS", "CSS controls colours, fonts and layout. You select an element and set properties: p { color: blue; }.", "CSS is mainly used for…", ["Styling", "Databases", "Servers", "Math"], 0],
    ["JavaScript basics", "JavaScript makes pages interactive — responding to clicks, checking forms and updating content.", "Which makes a page interactive?", ["HTML", "JavaScript", "PNG", "Wi-Fi"], 1],
    ["Publishing your site", "You can host a site for free using services like GitHub Pages. Upload your files and share the link.", "A 'host' does what?", ["Deletes files", "Serves your site online", "Designs logos", "Writes code"], 1],
  ]],
  ["cybersecurity", "Cybersecurity", "Tech", "🛡️", "Protect yourself and businesses online.", [
    ["Strong passwords", "Use long passphrases (12+ characters), never reuse passwords, and use a password manager.", "A strong password is…", ["Your birthday", "Long and unique", "123456", "Your name"], 1],
    ["Spotting phishing", "Phishing messages pretend to be banks or friends to steal details. Check the sender and never share your BVN or OTP.", "You should share your OTP with…", ["Bank staff on phone", "Nobody", "Friends", "Anyone who asks"], 1],
    ["Two-factor authentication", "2FA adds a second step like a code on your phone, so a stolen password alone isn't enough.", "2FA adds…", ["A second check", "More ads", "Faster Wi-Fi", "Nothing"], 0],
    ["Safe Wi-Fi use", "Avoid banking on public Wi-Fi. Use mobile data or a trusted VPN.", "Public Wi-Fi is risky for…", ["Reading news", "Banking", "Weather", "Music"], 1],
  ]],
  ["ai", "Artificial Intelligence", "Tech", "🤖", "Understand and use AI tools wisely.", [
    ["What is AI?", "AI is software that learns patterns from data to make predictions or generate content.", "AI learns from…", ["Data", "Magic", "Electricity only", "Paper"], 0],
    ["Writing good prompts", "Be specific: give context, the goal and the format you want. Example: 'Explain photosynthesis to an SS1 student in 5 bullet points.'", "A good prompt is…", ["Vague", "Specific", "Empty", "Rude"], 1],
    ["AI mistakes", "AI can be confidently wrong. Always check important facts with trusted sources.", "You should ___ AI answers.", ["Always trust", "Verify", "Ignore", "Delete"], 1],
    ["AI for work", "Use AI to draft emails, summarise notes, plan projects and brainstorm ideas.", "AI can help you…", ["Draft emails", "Grow taller", "Cook food", "Drive"], 0],
  ]],
  ["video-editing", "Video Making & Editing", "Tech", "🎬", "Shoot and edit videos with just your phone.", [
    ["Shooting basics", "Shoot in good light, hold the phone steady, and record horizontally for YouTube.", "Good video needs…", ["Good light", "Darkness", "Shaking", "Noise"], 0],
    ["Editing with CapCut", "Free apps like CapCut let you cut clips, add music, text and transitions.", "CapCut is a…", ["Video editor", "Bank app", "Game", "Browser"], 0],
    ["Sound matters", "Clear audio is more important than perfect video. Record in a quiet room.", "Which matters a lot?", ["Clear audio", "Loud noise", "No sound", "Echo"], 0],
    ["Exporting & sharing", "Export in 1080p for quality, or 720p to save data. Share to YouTube, TikTok or WhatsApp.", "720p helps to…", ["Save data", "Add colour", "Make it longer", "Delete it"], 0],
  ]],
  ["graphic-design", "Graphic Design", "Tech", "🎨", "Create flyers, logos and social posts.", [
    ["Design principles", "Contrast, alignment, repetition and proximity make designs clear.", "Which is a design principle?", ["Contrast", "Noise", "Clutter", "Random"], 0],
    ["Colour & fonts", "Use 2–3 colours and 1–2 fonts. Too many makes designs messy.", "How many fonts is best?", ["1–2", "7", "10", "20"], 0],
    ["Using Canva", "Canva offers free templates. Change text, colours and images to fit your brand.", "Canva provides…", ["Templates", "Food", "Money", "Airtime"], 0],
    ["Getting clients", "Build a portfolio of 5–10 designs and share on Instagram and WhatsApp status.", "A portfolio shows…", ["Your work", "Your bank balance", "Your age", "Your house"], 0],
  ]],
  ["data-analysis", "Data Analysis", "Tech", "📊", "Turn numbers into decisions with Excel & more.", [
    ["What is data?", "Data is recorded facts — sales, scores, prices. Analysis finds patterns in it.", "Data analysis finds…", ["Patterns", "Viruses", "Recipes", "Songs"], 0],
    ["Spreadsheets", "Excel or Google Sheets organise data in rows and columns. Use SUM, AVERAGE and COUNT.", "Which gives an average?", ["SUM", "AVERAGE", "COUNT", "LEN"], 1],
    ["Charts", "Bar charts compare categories; line charts show change over time.", "Change over time uses a…", ["Line chart", "Pie only", "Table", "Map"], 0],
    ["Telling the story", "Share 3 key insights with a simple chart each. Keep it short.", "Good reports are…", ["Clear and short", "Very long", "Confusing", "Empty"], 0],
  ]],
  ["mobile-dev", "Mobile Development", "Tech", "📱", "Build apps for Android phones.", [
    ["How apps work", "An app has screens (UI), logic, and often talks to a server for data.", "App screens are called the…", ["UI", "CPU", "SIM", "USB"], 0],
    ["Tools", "Flutter and React Native let you build Android and iPhone apps from one codebase.", "Flutter builds apps for…", ["Android & iOS", "Only TVs", "Only printers", "Radios"], 0],
    ["Your first screen", "Start with a simple screen: a title, a button and a text that changes when tapped.", "A first app should be…", ["Simple", "Huge", "Impossible", "Secret"], 0],
    ["Publishing", "Publish to Google Play with a developer account and app screenshots.", "Android apps are published on…", ["Google Play", "Facebook", "Radio", "Email"], 0],
  ]],
  ["digital-marketing", "Digital Marketing", "Tech", "📣", "Grow businesses on social media.", [
    ["Know your audience", "Decide who your customer is: age, location, needs. Speak directly to them.", "First step in marketing?", ["Know your audience", "Buy ads blindly", "Post randomly", "Stop posting"], 0],
    ["Content that sells", "Show before/after results, customer reviews and how-to tips.", "Which content builds trust?", ["Customer reviews", "Blank posts", "Spam", "Fake news"], 0],
    ["WhatsApp Business", "Use catalogues, quick replies and status updates to sell directly.", "WhatsApp Business has…", ["Catalogues", "Bank loans", "Cooking", "Games"], 0],
    ["Measuring results", "Track reach, clicks and sales. Keep what works, drop what doesn't.", "You should track…", ["Results", "Nothing", "Weather", "Rumours"], 0],
  ]],
  ["fashion", "Fashion Design & Tailoring", "Vocational", "🧵", "Sew native and modern outfits.", [
    ["Tools of the trade", "Tape rule, scissors, chalk, pins, and a sewing machine are the basics.", "Which is a tailoring tool?", ["Tape rule", "Hammer", "Spoon", "Phone"], 0],
    ["Taking measurements", "Measure bust, waist, hip, shoulder and length. Write each down immediately.", "Measurements should be…", ["Written down", "Guessed", "Forgotten", "Shouted"], 0],
    ["Pattern drafting", "Draft patterns on paper using measurements before cutting fabric.", "Draft patterns before…", ["Cutting fabric", "Sleeping", "Eating", "Buying thread"], 0],
    ["Finishing", "Neat hems, pressed seams and clean edges make clothes look professional.", "Pressed seams look…", ["Professional", "Rough", "Torn", "Wet"], 0],
  ]],
  ["catering", "Catering & Baking", "Vocational", "🧁", "Bake cakes, pastries and cook for events.", [
    ["Kitchen hygiene", "Wash hands, cover hair, and keep raw and cooked food apart.", "Raw and cooked food should be…", ["Kept apart", "Mixed", "Shared", "Thrown"], 0],
    ["Basic sponge cake", "Cream butter and sugar, add eggs one at a time, fold in flour, bake at 180°C.", "Common baking temperature?", ["180°C", "20°C", "500°C", "0°C"], 0],
    ["Small chops", "Puff-puff, samosa and spring rolls are popular for Nigerian events.", "A popular small chop is…", ["Puff-puff", "Garri", "Rice", "Beans"], 0],
    ["Pricing", "Add up ingredients, gas, packaging and your time, then add profit.", "Pricing should include…", ["All costs + profit", "Only sugar", "Nothing", "Guesswork"], 0],
  ]],
  ["makeup", "Makeup Artistry", "Vocational", "💄", "Everyday, bridal and gele-ready looks.", [
    ["Skin prep", "Cleanse, moisturise and prime before foundation for a smooth finish.", "First step in makeup?", ["Skin prep", "Lipstick", "Lashes", "Powder only"], 0],
    ["Matching foundation", "Test on the jawline in natural light to find the right shade.", "Test foundation on the…", ["Jawline", "Hand", "Foot", "Hair"], 0],
    ["Brows & eyes", "Shape brows to frame the face; blend eyeshadow with no harsh lines.", "Eyeshadow should be…", ["Blended", "Blocky", "Wet", "Skipped"], 0],
    ["Hygiene", "Clean brushes weekly and never share mascara.", "Brushes should be cleaned…", ["Weekly", "Never", "Yearly", "Once"], 0],
  ]],
  ["hair", "Hair Styling", "Vocational", "💇", "Braids, weaves and natural hair care.", [
    ["Hair types", "Know hair textures (4A–4C) to choose products and styles.", "Hair textures help choose…", ["Products", "Shoes", "Food", "Music"], 0],
    ["Braiding basics", "Section neatly, keep tension even and don't pull edges too tight.", "Braids should not be…", ["Too tight at edges", "Neat", "Even", "Clean"], 0],
    ["Natural hair care", "Moisturise, seal with oil, and protect hair at night with satin.", "Protect hair at night with…", ["Satin", "Sand", "Nothing", "Wool"], 0],
    ["Running a salon", "Keep a booking book, price clearly and post your work online.", "Post your work…", ["Online", "Nowhere", "In secret", "Never"], 0],
  ]],
  ["shoe-making", "Shoe Making", "Vocational", "👞", "Craft leather shoes and sandals.", [
    ["Materials", "Leather, soles, glue, thread and a last (foot mould) are essentials.", "A 'last' is a…", ["Foot mould", "Final shoe", "Hammer", "Paint"], 0],
    ["Cutting patterns", "Draw the upper pattern on paper, then cut leather carefully.", "Cut leather after…", ["Drawing a pattern", "Painting", "Selling", "Eating"], 0],
    ["Stitching & lasting", "Stitch the upper, then pull it over the last and glue to the insole.", "The upper goes over the…", ["Last", "Table", "Box", "Bag"], 0],
    ["Finishing & selling", "Polish, pack neatly and price by materials, time and quality.", "Good packaging helps…", ["Sales", "Nothing", "Rain", "Glue"], 0],
  ]],
  ["phone-repair", "Phone Repair", "Vocational", "🔧", "Fix screens, batteries and charging ports.", [
    ["Safety first", "Disconnect the battery before repairs and use an anti-static strap.", "Before repair, disconnect the…", ["Battery", "Screen protector", "Case", "SIM only"], 0],
    ["Tools", "Precision screwdrivers, spudger, heat gun and multimeter.", "A multimeter measures…", ["Voltage", "Weight", "Colour", "Time"], 0],
    ["Screen replacement", "Heat the edges, separate gently, disconnect, and fit the new screen.", "To remove a screen, first…", ["Apply gentle heat", "Hit it", "Wet it", "Bend it"], 0],
    ["Charging faults", "Clean the port; if still faulty, test and replace the charging board.", "First fix for charging issue?", ["Clean the port", "Throw phone", "Buy new phone", "Ignore"], 0],
  ]],
  ["photography", "Photography", "Vocational", "📷", "Take stunning photos for events and brands.", [
    ["Light", "Soft window light is great for portraits. Avoid harsh midday sun.", "Best portrait light?", ["Soft window light", "Midday sun", "Darkness", "Torch"], 0],
    ["Composition", "Use the rule of thirds: place your subject off-centre.", "Rule of thirds places subject…", ["Off-centre", "At the edge only", "Upside down", "Nowhere"], 0],
    ["Phone vs camera", "Phones are fine to start. Learn manual settings: ISO, shutter, aperture.", "ISO controls…", ["Light sensitivity", "Zoom", "Battery", "Colour of case"], 0],
    ["Booking clients", "Offer event packages and share a portfolio on Instagram.", "Share your portfolio on…", ["Instagram", "Radio", "Paper only", "Nowhere"], 0],
  ]],
  ["barbing", "Barbing", "Vocational", "💈", "Clean cuts, fades and shop hygiene.", [
    ["Tools", "Clippers, guards, trimmers, combs, and disinfectant.", "Guards control…", ["Cut length", "Colour", "Price", "Music"], 0],
    ["Hygiene", "Disinfect clippers after every client to prevent infections.", "Disinfect clippers…", ["After every client", "Weekly", "Never", "Yearly"], 0],
    ["The fade", "Start with a longer guard, then blend down with shorter guards.", "Fades are blended with…", ["Different guards", "Scissors only", "Water", "Gel"], 0],
    ["Customer care", "Ask what style they want, show them the mirror, and keep your shop clean.", "Good customer care means…", ["Listening", "Rushing", "Ignoring", "Arguing"], 0],
  ]],
];

export const SKILLS: Skill[] = SEEDS.map(([id, name, track, emoji, blurb, lessons]) => {
  const L: Lesson[] = lessons.map(([title, text, q, options, answer], i) => ({
    id: `${id}-l${i + 1}`, title, text, video: yt(`${name} ${title} tutorial`), quiz: { q, options, answer },
  }));
  return {
    id, name, track, emoji, blurb,
    modules: [
      { title: "Module 1: Getting started", lessons: L.slice(0, 2) },
      { title: "Module 2: Going further", lessons: L.slice(2) },
    ],
  };
});

export const skillById = (id: string) => SKILLS.find((s) => s.id === id);
export const lessonCount = (s: Skill) => s.modules.reduce((n, m) => n + m.lessons.length, 0);
