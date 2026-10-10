// ALL app content lives here. Logic lives in app.js.
// Translatable text = { en: "...", ta: "..." }. Missing ta -> app shows English marked "[EN]".
// TRANSLATION POLICY: every `ta` string in this file was written by the AI assistant and is
// NOT verified. They are listed in TRANSLATION_STATUS and must be reviewed by a native speaker.
// Phone numbers, source names and source URLs are never translated.

export const TRANSLATION_STATUS = {
  ui: "needs-native-speaker-review",
  content: "needs-native-speaker-review",
  officialTamilTextFound: false
};

export const LANGS = [
  { code: "en", label: "EN" },
  { code: "ta", label: "தமிழ்" }
];

export const UI = {
  appTitle: { en: "Disaster Prep", ta: "பேரிடர் தயார்நிலை" },
  online: { en: "Online", ta: "ஆன்லைன்" },
  offline: { en: "Offline - showing saved info", ta: "ஆஃப்லைன் - சேமித்த தகவல்" },
  notTranslated: { en: "English only", ta: "ஆங்கிலம் மட்டும்" },
  welcome: { en: "Welcome. Set up in 2 steps.", ta: "வரவேற்கிறோம். 2 படிகளில் அமைக்கவும்." },
  chooseLang: { en: "Language", ta: "மொழி" },
  chooseCountry: { en: "Your country", ta: "உங்கள் நாடு" },
  chooseState: { en: "Your state / region (optional)", ta: "உங்கள் மாநிலம் / பகுதி (விருப்பம்)" },
  noState: { en: "Not listed / skip", ta: "பட்டியலில் இல்லை / தவிர்" },
  continue: { en: "Continue", ta: "தொடர்க" },
  save: { en: "Save", ta: "சேமி" },
  home: { en: "Home", ta: "முகப்பு" },
  contacts: { en: "Contacts", ta: "தொடர்புகள்" },
  emergency: { en: "Emergency", ta: "அவசரம்" },
  profile: { en: "My info", ta: "என் தகவல்" },
  settings: { en: "Settings", ta: "அமைப்புகள்" },
  back: { en: "Back", ta: "பின்" },
  chooseHazard: { en: "What are you preparing for?", ta: "எதற்காக தயாராகிறீர்கள்?" },
  hazardFlood: { en: "Flood", ta: "வெள்ளம்" },
  hazardCyclone: { en: "Cyclone", ta: "புயல்" },
  phaseBefore: { en: "Before", ta: "முன்பு" },
  phaseDuring: { en: "During", ta: "போது" },
  phaseAfter: { en: "After", ta: "பின்பு" },
  emergencyMode: { en: "EMERGENCY MODE", ta: "அவசர நிலை" },
  emergencyHint: { en: "Big call buttons and top actions", ta: "பெரிய அழைப்பு பொத்தான்கள்" },
  call: { en: "Call", ta: "அழைக்க" },
  source: { en: "Source", ta: "ஆதாரம்" },
  lastVerified: { en: "Last verified", ta: "கடைசியாக சரிபார்த்தது" },
  unverified: { en: "UNVERIFIED - confirm before relying", ta: "சரிபார்க்கப்படவில்லை" },
  notYetVerified: {
    en: "Not yet verified for this country. Use the official agency site:",
    ta: "இந்த நாட்டிற்கு இன்னும் சரிபார்க்கப்படவில்லை. அதிகாரப்பூர்வ தளம்:"
  },
  officialSite: { en: "Official agency website", ta: "அதிகாரப்பூர்வ இணையதளம்" },
  contentComingSoon: { en: "Content for this section is being added.", ta: "இந்த பகுதியின் உள்ளடக்கம் சேர்க்கப்படுகிறது." },
  nationalContacts: { en: "National", ta: "தேசிய" },
  stateContacts: { en: "State", ta: "மாநிலம்" },
  yourCountry: { en: "Country", ta: "நாடு" },
  yourState: { en: "State / region", ta: "மாநிலம் / பகுதி" },
  changeSettings: { en: "Change country / language", ta: "நாடு / மொழி மாற்று" },
  storageNote: { en: "Your choices are stored only on this phone.", ta: "உங்கள் தேர்வுகள் இந்த தொலைபேசியில் மட்டுமே சேமிக்கப்படும்." },
  checklist: { en: "Checklist", ta: "சரிபார்ப்பு பட்டியல்" },
  safetyCards: { en: "Family safety instructions", ta: "குடும்ப பாதுகாப்பு வழிமுறைகள்" },
  progress: { en: "{done} of {total} done", ta: "{total}-இல் {done} முடிந்தது" },
  do: { en: "DO", ta: "செய்யுங்கள்" },
  dont: { en: "DON'T", ta: "செய்யாதீர்கள்" },
  top5: { en: "Top 5 actions", ta: "முக்கிய 5 செயல்கள்" },
  callNow: { en: "Call for help", ta: "உதவிக்கு அழையுங்கள்" },
  noContactsYet: { en: "No verified numbers saved for this country.", ta: "இந்த நாட்டிற்கு சரிபார்க்கப்பட்ட எண்கள் இல்லை." },
  exitEmergency: { en: "Exit emergency mode", ta: "அவசர நிலையிலிருந்து வெளியேறு" },
  hazardPick: { en: "Hazard", ta: "ஆபத்து" },
  verifiedOn: { en: "Verified", ta: "சரிபார்த்த நாள்" },
  notVerifiedDate: { en: "Not verified", ta: "சரிபார்க்கப்படவில்லை" },
  translationNote: {
    en: "Tamil text is not yet reviewed by a native speaker. Check the source link.",
    ta: "தமிழ் உரை இன்னும் தாய்மொழி நிபுணரால் சரிபார்க்கப்படவில்லை. ஆதார இணைப்பை பார்க்கவும்."
  }
};

export const HAZARDS = [
  { id: "flood", name: "hazardFlood", icon: "🌊" },
  { id: "cyclone", name: "hazardCyclone", icon: "🌀" }
];

export const PHASES = [
  { id: "before", name: "phaseBefore" },
  { id: "during", name: "phaseDuring" },
  { id: "after", name: "phaseAfter" }
];

// Countries. `contacts` only contains numbers confirmed from an official page (see `status`).
// status: "verified" = number read on the cited official page on `verified` date.
//         "unverified" = could not be confirmed from an official page; shown with a warning.
// `state` = only show for that selected state.
export const COUNTRIES = [
  {
    code: "IN",
    name: { en: "India", ta: "இந்தியா" },
    states: ["Tamil Nadu", "Kerala", "Andhra Pradesh", "Odisha", "West Bengal", "Puducherry"],
    agency: { name: "National Disaster Management Authority (NDMA)", url: "https://ndma.gov.in" },
    contacts: [
      {
        id: "in-112", em: true,
        name: { en: "National emergency number (police, fire, ambulance)", ta: "தேசிய அவசர எண் (காவல், தீயணைப்பு, ஆம்புலன்ஸ்)" },
        number: "112", tel: "112",
        sourceLabel: "ERSS - 112.gov.in", sourceUrl: "https://112.gov.in/about",
        status: "unverified", verified: null,
        note: "112.gov.in could not be opened during build; only seen in search results."
      },
      {
        id: "in-ndma",
        name: { en: "NDMA Control Room (24x7)", ta: "NDMA கட்டுப்பாட்டு அறை (24x7)" },
        number: "011-26701728", tel: "+911126701728",
        sourceLabel: "NDMA - Contact Us", sourceUrl: "https://ndma.gov.in/Contact-Us",
        status: "verified", verified: "2026-10-10"
      },
      {
        id: "in-ndrf-helpline", em: true,
        name: { en: "NDRF Helpline", ta: "NDRF உதவி எண்" },
        number: "+91-9711077372", tel: "+919711077372",
        sourceLabel: "NDRF - Force Headquarters", sourceUrl: "https://www.ndrf.gov.in/en/node/88256",
        status: "verified", verified: "2026-10-10"
      },
      {
        id: "in-ndrf-hq",
        name: { en: "NDRF Headquarters Control Room", ta: "NDRF தலைமையக கட்டுப்பாட்டு அறை" },
        number: "011-23438091", tel: "+911123438091",
        sourceLabel: "NDRF - Force Headquarters", sourceUrl: "https://www.ndrf.gov.in/en/node/88256",
        status: "verified", verified: "2026-10-10"
      },
      {
        id: "tn-1070", em: true,
        state: "Tamil Nadu",
        name: { en: "Tamil Nadu State disaster helpline (toll-free)", ta: "தமிழ்நாடு மாநில பேரிடர் உதவி எண் (கட்டணமில்லா)" },
        number: "1070", tel: "1070",
        sourceLabel: "Govt. of Tamil Nadu, Labour Dept - disaster contact numbers",
        sourceUrl: "https://labour.tn.gov.in/disaster_contact_numbers.php",
        status: "verified", verified: "2026-10-10"
      },
      {
        id: "tn-1077", em: true,
        state: "Tamil Nadu",
        name: { en: "Tamil Nadu District disaster helpline (toll-free)", ta: "தமிழ்நாடு மாவட்ட பேரிடர் உதவி எண் (கட்டணமில்லா)" },
        number: "1077", tel: "1077",
        sourceLabel: "Govt. of Tamil Nadu, Labour Dept - disaster contact numbers",
        sourceUrl: "https://labour.tn.gov.in/disaster_contact_numbers.php",
        status: "verified", verified: "2026-10-10"
      }
    ]
  },
  { code: "BD", name: { en: "Bangladesh", ta: "வங்காளதேசம்" }, states: [], contacts: [],
    agency: { name: "Department of Disaster Management", url: "https://ddm.gov.bd" } },
  { code: "LK", name: { en: "Sri Lanka", ta: "இலங்கை" }, states: [], contacts: [],
    agency: { name: "Disaster Management Centre", url: "https://www.dmc.gov.lk" } },
  { code: "PH", name: { en: "Philippines", ta: "பிலிப்பைன்ஸ்" }, states: [], contacts: [],
    agency: { name: "NDRRMC", url: "https://ndrrmc.gov.ph" } },
  { code: "US", name: { en: "United States", ta: "அமெரிக்கா" }, states: [], contacts: [],
    agency: { name: "FEMA", url: "https://www.fema.gov" } }
];

// ---------------------------------------------------------------------------
// SAFETY CONTENT. Every English item is taken from the cited source (wording kept close to the
// source, lightly shortened). Tamil = AI-written, NOT reviewed (see TRANSLATION_STATUS).
// Sources read on 2026-10-10:
//  - IMD flood sheet: PDF text extracted and read. The document does not name its issuer; it is
//    hosted by IMD (Raipur). We label it "IMD" only, and do NOT claim it is NDMA.
//  - NDMA cyclone circular: PDF (scanned) hosted by Govt. of Puducherry, Revenue Dept; read via OCR.
//  - NDMA cyclone web page: emergency kit + post-cyclone checks.
// ---------------------------------------------------------------------------
export const SOURCES = {
  imdFlood: { short: "IMD", label: "IMD - Floods: Dos and Don'ts", url: "https://mausam.imd.gov.in/raipur/docs/flood.pdf", read: "2026-10-10" },
  ndmaCycDD: { short: "NDMA", label: "NDMA - Cyclone: Do's and Don'ts (circular, hosted by Govt. of Puducherry)", url: "https://revenue.py.gov.in/downloads/dm/NDMA%20-%20Cyclone%20-%20Does%20and%20Donts.pdf", read: "2026-10-10" },
  ndmaCycPage: { short: "NDMA", label: "NDMA - Cyclone (Natural Hazards page)", url: "https://ndma.gov.in/Natural-Hazards/Cyclone", read: "2026-10-10" }
};

const I = (id, src, en, ta) => ({ id, src, text: { en, ta } });

export const CONTENT = {
  flood: {
    checklist: {
      before: [
        I("f-b1", "imdFlood", "Ignore rumours, stay calm, don't panic.", "வதந்திகளை நம்பாதீர்கள்; அமைதியாக இருங்கள்; பதற்றப்பட வேண்டாம்."),
        I("f-b2", "imdFlood", "Keep your mobile phone charged for emergency communication; use SMS.", "அவசரத் தொடர்புக்கு உங்கள் கைபேசியை சார்ஜ் செய்து வைத்திருங்கள்; SMS பயன்படுத்துங்கள்."),
        I("f-b3", "imdFlood", "Listen to radio, watch TV, read newspapers for weather updates.", "வானிலை தகவலுக்கு வானொலி கேளுங்கள், தொலைக்காட்சி பாருங்கள், செய்தித்தாள் படியுங்கள்."),
        I("f-b4", "imdFlood", "Prepare an emergency kit with essential items for safety and survival.", "பாதுகாப்பு மற்றும் உயிர்வாழ்வுக்கு தேவையான பொருட்களுடன் அவசரகாலப் பெட்டியை தயார் செய்யுங்கள்."),
        I("f-b5", "imdFlood", "Keep your documents and valuables in water-proof bags.", "ஆவணங்கள் மற்றும் விலைமதிப்புள்ள பொருட்களை நீர்புகாத பைகளில் வைத்திருங்கள்."),
        I("f-b6", "imdFlood", "Know the safe routes to the nearest shelter / raised pucca house.", "அருகிலுள்ள தங்குமிடம் / உயர்ந்த கான்கிரீட் வீட்டிற்கான பாதுகாப்பான வழிகளை அறிந்து வையுங்கள்."),
        I("f-b7", "imdFlood", "Store enough ready-to-eat food and water for at least a week.", "குறைந்தது ஒரு வாரத்திற்கு போதுமான சமைக்காமல் உண்ணக்கூடிய உணவு மற்றும் தண்ணீரை சேமித்து வையுங்கள்."),
        I("f-b8", "imdFlood", "Be aware of flash flood areas such as rivers, streams, drainage channels.", "ஆறுகள், ஓடைகள், வடிகால்கள் போன்ற திடீர் வெள்ள பகுதிகளை அறிந்திருங்கள்."),
        I("f-b9", "imdFlood", "Keep cattle/animals untied to ensure their safety.", "கால்நடைகளின் பாதுகாப்பிற்காக அவற்றை கட்டவிழ்த்து விடுங்கள்.")
      ],
      during: [
        I("f-d1", "imdFlood", "Don't enter floodwaters. If you must, wear suitable footwear.", "வெள்ள நீரில் இறங்க வேண்டாம். தவிர்க்க முடியாவிட்டால் தகுந்த காலணி அணியுங்கள்."),
        I("f-d2", "imdFlood", "Do not walk or drive in flood waters. Two feet of moving flood water can wash away big cars as well.", "வெள்ள நீரில் நடக்கவோ வாகனம் ஓட்டவோ வேண்டாம். இரண்டு அடி ஓடும் வெள்ளம் பெரிய கார்களையும் அடித்துச் செல்லும்."),
        I("f-d3", "imdFlood", "Stay away from sewerage lines, gutters, drains, culverts, etc.", "கழிவுநீர்க் குழாய்கள், சாக்கடைகள், வடிகால்கள், சிறு பாலங்களிலிருந்து விலகி இருங்கள்."),
        I("f-d4", "imdFlood", "Stay away from electric poles and fallen power lines to avoid electrocution.", "மின்சாரம் தாக்காமல் இருக்க மின்கம்பங்கள் மற்றும் அறுந்து விழுந்த மின்கம்பிகளிலிருந்து விலகி இருங்கள்."),
        I("f-d5", "imdFlood", "Eat freshly cooked or dry food. Keep your food covered.", "புதிதாக சமைத்த அல்லது உலர் உணவை உண்ணுங்கள். உணவை மூடி வையுங்கள்."),
        I("f-d6", "imdFlood", "Drink boiled/chlorinated water.", "காய்ச்சிய / குளோரின் கலந்த தண்ணீரை குடியுங்கள்."),
        I("f-d7", "imdFlood", "Evacuate immediately to safe places when directed by government officials.", "அரசு அதிகாரிகள் கூறும்போது உடனடியாக பாதுகாப்பான இடங்களுக்கு வெளியேறுங்கள்.")
      ],
      after: [
        I("f-a1", "imdFlood", "Do not allow children to play in or near flood waters.", "குழந்தைகளை வெள்ள நீரில் அல்லது அதன் அருகில் விளையாட அனுமதிக்காதீர்கள்."),
        I("f-a2", "imdFlood", "Don't use any damaged electrical goods; get them checked.", "சேதமடைந்த மின்சாதனங்களை பயன்படுத்த வேண்டாம்; பரிசோதித்து கொள்ளுங்கள்."),
        I("f-a3", "imdFlood", "Watch out for broken electric poles and wires, sharp objects and debris.", "உடைந்த மின்கம்பங்கள், கம்பிகள், கூர்மையான பொருட்கள், குப்பைகள் குறித்து எச்சரிக்கையாக இருங்கள்."),
        I("f-a4", "imdFlood", "Do not eat food that has been in flood waters.", "வெள்ள நீரில் பட்ட உணவை உண்ண வேண்டாம்."),
        I("f-a5", "imdFlood", "Use mosquito nets to prevent malaria.", "மலேரியாவைத் தடுக்க கொசுவலை பயன்படுத்துங்கள்."),
        I("f-a6", "imdFlood", "Be careful of snakes, as snake bites are common during floods.", "வெள்ளத்தின் போது பாம்புக்கடி அதிகம்; பாம்புகள் குறித்து எச்சரிக்கையாக இருங்கள்."),
        I("f-a7", "imdFlood", "Don't use the toilet or tap water if water lines / sewage pipes are damaged. Do not drink tap water until the Health Department advises it is safe.", "நீர்க்குழாய்கள் / கழிவுநீர்க் குழாய்கள் சேதமடைந்திருந்தால் கழிப்பறை அல்லது குழாய் நீரை பயன்படுத்த வேண்டாம். சுகாதாரத் துறை பாதுகாப்பானது என்று அறிவிக்கும் வரை குழாய் நீரைக் குடிக்க வேண்டாம்."),
        I("f-a8", "imdFlood", "Clean and disinfect everything that got wet.", "நனைந்த அனைத்தையும் சுத்தம் செய்து கிருமிநாசினியால் தூய்மைப்படுத்துங்கள்.")
      ]
    },
    cards: [
      {
        id: "f-card-evac", phase: "during", src: "imdFlood",
        title: { en: "If you need to evacuate", ta: "வெளியேற வேண்டியிருந்தால்" },
        steps: [
          { en: "Keep furniture and appliances on beds and tables.", ta: "மரச்சாமான்கள், மின்சாதனங்களை கட்டில்கள், மேசைகள் மீது வையுங்கள்." },
          { en: "Turn off power and gas connection.", ta: "மின்சாரம் மற்றும் எரிவாயு இணைப்பை அணைக்கவும்." },
          { en: "Move to higher ground / a safe shelter.", ta: "உயரமான இடம் / பாதுகாப்பான தங்குமிடத்திற்கு செல்லுங்கள்." },
          { en: "Take the emergency kit, first aid box, valuables and important documents with you.", ta: "அவசரகாலப் பெட்டி, முதலுதவிப் பெட்டி, விலைமதிப்புள்ள பொருட்கள், முக்கிய ஆவணங்களை எடுத்துச் செல்லுங்கள்." },
          { en: "Do not enter deep, unknown water; use a stick to check water depth.", ta: "ஆழமான, தெரியாத நீரில் இறங்காதீர்கள்; ஆழத்தை சோதிக்க ஒரு குச்சியைப் பயன்படுத்துங்கள்." },
          { en: "Come back home only when officials ask you to do so.", ta: "அதிகாரிகள் கூறிய பின்னரே வீடு திரும்புங்கள்." }
        ]
      }
    ],
    top5: [
      { kind: "do", src: "imdFlood", text: { en: "Move to higher ground or a safe shelter. Return only when officials ask.", ta: "உயரமான இடம் அல்லது பாதுகாப்பான தங்குமிடத்திற்கு செல்லுங்கள். அதிகாரிகள் கூறிய பின்னரே திரும்புங்கள்." } },
      { kind: "dont", src: "imdFlood", text: { en: "Do not walk or drive in flood waters.", ta: "வெள்ள நீரில் நடக்கவோ வாகனம் ஓட்டவோ வேண்டாம்." } },
      { kind: "dont", src: "imdFlood", text: { en: "Stay away from electric poles and fallen power lines.", ta: "மின்கம்பங்கள் மற்றும் அறுந்து விழுந்த மின்கம்பிகளிலிருந்து விலகி இருங்கள்." } },
      { kind: "do", src: "imdFlood", text: { en: "Turn off power and gas connection before you leave.", ta: "புறப்படும் முன் மின்சாரம் மற்றும் எரிவாயு இணைப்பை அணைக்கவும்." } },
      { kind: "do", src: "imdFlood", text: { en: "Drink boiled/chlorinated water.", ta: "காய்ச்சிய / குளோரின் கலந்த தண்ணீரை குடியுங்கள்." } }
    ]
  },
  cyclone: {
    checklist: {
      before: [
        I("c-b1", "ndmaCycDD", "Check the house; secure loose tiles and repair doors and windows.", "வீட்டை சரிபார்க்கவும்; தளர்வான ஓடுகளை பாதுகாக்கவும்; கதவுகள், ஜன்னல்களை பழுதுபார்க்கவும்."),
        I("c-b2", "ndmaCycDD", "Remove dead branches or dying trees close to the house; anchor things that can fly in strong winds (loose tin sheets, bricks, garbage cans, sign-boards).", "வீட்டின் அருகிலுள்ள காய்ந்த கிளைகள் அல்லது பட்டுப்போகும் மரங்களை அகற்றுங்கள்; பலத்த காற்றில் பறக்கக்கூடிய பொருட்களை (தளர்வான தகரத் தகடுகள், செங்கற்கள், குப்பைத் தொட்டிகள், பலகைகள்) கட்டி வையுங்கள்."),
        I("c-b3", "ndmaCycDD", "Keep some wooden boards ready so glass windows can be boarded if needed.", "தேவைப்பட்டால் கண்ணாடி ஜன்னல்களை மூட சில மரப்பலகைகளை தயாராக வைத்திருங்கள்."),
        I("c-b4", "ndmaCycDD", "Keep a hurricane lantern filled with kerosene, battery-operated torches and enough dry cells.", "மண்ணெண்ணெய் நிரப்பிய விளக்கு, பேட்டரி டார்ச் மற்றும் போதுமான பேட்டரிகளை வைத்திருங்கள்."),
        I("c-b5", "ndmaCycDD", "Keep some extra batteries for your radio/transistor.", "வானொலிக்கு கூடுதல் பேட்டரிகளை வைத்திருங்கள்."),
        I("c-b6", "ndmaCycDD", "Keep some dry non-perishable food ready for emergency use.", "அவசரத்திற்கு கெட்டுப்போகாத உலர் உணவை தயாராக வைத்திருங்கள்."),
        I("c-b7", "ndmaCycDD", "Keep your mobile phone charged for emergency communication; use SMS.", "அவசரத் தொடர்புக்கு உங்கள் கைபேசியை சார்ஜ் செய்து வைத்திருங்கள்; SMS பயன்படுத்துங்கள்."),
        I("c-b8", "ndmaCycDD", "Keep your documents and valuables in water-proof containers.", "ஆவணங்கள் மற்றும் விலைமதிப்புள்ள பொருட்களை நீர்புகாத கலன்களில் வைத்திருங்கள்."),
        I("c-b9", "ndmaCycPage", "Emergency kit: torch, extra batteries, battery radio, first aid kit and essential medicines, important papers, dry food and sealed water, candles and matches in a waterproof container, chlorine tablets, cash, thick rope, shoes.", "அவசரகாலப் பெட்டி: டார்ச், கூடுதல் பேட்டரிகள், பேட்டரி வானொலி, முதலுதவிப் பெட்டி மற்றும் அத்தியாவசிய மருந்துகள், முக்கிய ஆவணங்கள், உலர் உணவு, சீல் செய்த குடிநீர், நீர்புகாத கலனில் மெழுகுவர்த்தி மற்றும் தீப்பெட்டி, குளோரின் மாத்திரைகள், பணம், தடிமனான கயிறு, காலணிகள்."),
        I("c-b10", "ndmaCycDD", "Listen to the radio, watch TV and read newspapers for weather warnings. Ignore rumours; believe only official information.", "வானிலை எச்சரிக்கைகளுக்கு வானொலி கேளுங்கள், தொலைக்காட்சி பாருங்கள், செய்தித்தாள் படியுங்கள். வதந்திகளை புறக்கணியுங்கள்; அதிகாரப்பூர்வ தகவலை மட்டும் நம்புங்கள்."),
        I("c-b11", "ndmaCycDD", "Fishermen: keep boats/rafts tied up in a safe place and do not venture out to sea.", "மீனவர்கள்: படகுகள் / தெப்பங்களை பாதுகாப்பான இடத்தில் கட்டி வையுங்கள்; கடலுக்குச் செல்ல வேண்டாம்."),
        I("c-b12", "ndmaCycDD", "Keep cattle/animals untied to ensure their safety.", "கால்நடைகளின் பாதுகாப்பிற்காக அவற்றை கட்டவிழ்த்து விடுங்கள்.")
      ],
      during: [
        I("c-d1", "ndmaCycDD", "If indoors, switch off electrical mains and gas connection.", "வீட்டிற்குள் இருந்தால் மின் இணைப்பு மற்றும் எரிவாயு இணைப்பை அணைக்கவும்."),
        I("c-d2", "ndmaCycDD", "Keep doors and windows shut.", "கதவுகள் மற்றும் ஜன்னல்களை மூடி வையுங்கள்."),
        I("c-d3", "ndmaCycDD", "Listen to the radio; rely only on official warnings.", "வானொலி கேளுங்கள்; அதிகாரப்பூர்வ எச்சரிக்கைகளை மட்டும் நம்புங்கள்."),
        I("c-d4", "ndmaCycDD", "If your house is unsafe, leave early, before the onset of the cyclone.", "உங்கள் வீடு பாதுகாப்பற்றதாக இருந்தால் புயல் தொடங்கும் முன்பே வெளியேறுங்கள்."),
        I("c-d5", "ndmaCycDD", "When your area is under a cyclone warning, get away from low-lying beaches and coastal areas. Leave early, before your way to high ground or shelter gets flooded.", "உங்கள் பகுதிக்கு புயல் எச்சரிக்கை இருக்கும்போது தாழ்வான கடற்கரை மற்றும் கடலோரப் பகுதிகளிலிருந்து விலகிச் செல்லுங்கள். உயரமான இடம் அல்லது தங்குமிடத்திற்கான வழி நீரில் மூழ்கும் முன்பே புறப்படுங்கள்."),
        I("c-d6", "ndmaCycDD", "Board up glass windows or put storm shutters in place.", "கண்ணாடி ஜன்னல்களை பலகைகளால் மூடுங்கள் அல்லது புயல் மறைப்புகளை பொருத்துங்கள்."),
        I("c-d7", "ndmaCycDD", "If the centre of the cyclone passes over your house there will be a lull for about half an hour. Do not go out: very strong winds will blow from the opposite direction right after.", "புயலின் மையம் உங்கள் வீட்டின் மேல் கடக்கும்போது சுமார் அரை மணி நேரம் காற்றும் மழையும் தணியும். வெளியே செல்ல வேண்டாம்: அதன் பின் எதிர்த் திசையிலிருந்து மிகப் பலத்த காற்று வீசும்."),
        I("c-d8", "ndmaCycDD", "If outdoors: do not enter damaged buildings, watch out for broken electric poles, wires and sharp objects, and seek a safe shelter as soon as possible.", "வெளியே இருந்தால்: சேதமடைந்த கட்டிடங்களுக்குள் செல்ல வேண்டாம்; உடைந்த மின்கம்பங்கள், கம்பிகள், கூர்மையான பொருட்கள் குறித்து எச்சரிக்கையாக இருங்கள்; முடிந்தவரை விரைவில் பாதுகாப்பான தங்குமிடத்தை நாடுங்கள்.")
      ],
      after: [
        I("c-a1", "ndmaCycDD", "Remain in the shelter until you are informed that you can return home.", "வீடு திரும்பலாம் என்று தெரிவிக்கப்படும் வரை தங்குமிடத்திலேயே இருங்கள்."),
        I("c-a2", "ndmaCycDD", "Drink boiled/chlorinated water.", "காய்ச்சிய / குளோரின் கலந்த தண்ணீரை குடியுங்கள்."),
        I("c-a3", "ndmaCycDD", "Strictly avoid loose and dangling wires from lamp posts.", "மின்கம்பங்களிலிருந்து தொங்கும் தளர்வான கம்பிகளை முற்றிலும் தவிர்க்கவும்."),
        I("c-a4", "ndmaCycDD", "If you have to drive, drive carefully.", "வாகனம் ஓட்ட வேண்டியிருந்தால் கவனமாக ஓட்டுங்கள்."),
        I("c-a5", "ndmaCycDD", "Clear debris from your premises immediately.", "உங்கள் இடத்திலுள்ள குப்பைகளை உடனடியாக அகற்றுங்கள்."),
        I("c-a6", "ndmaCycDD", "Report the losses to the appropriate authorities.", "இழப்புகளை உரிய அதிகாரிகளுக்கு தெரிவியுங்கள்."),
        I("c-a7", "ndmaCycDD", "Get inoculated against diseases immediately.", "நோய்களுக்கு எதிரான தடுப்பூசியை உடனடியாக போட்டுக்கொள்ளுங்கள்."),
        I("c-a8", "ndmaCycPage", "Before returning home, check with the authorities: roads are recommended as safe, power lines are safe, drinking water is available, sewage lines are working.", "வீடு திரும்பும் முன் அதிகாரிகளிடம் உறுதி செய்யுங்கள்: சாலைகள் பாதுகாப்பானவை, மின்கம்பிகள் பாதுகாப்பானவை, குடிநீர் கிடைக்கிறது, கழிவுநீர்க் குழாய்கள் செயல்படுகின்றன.")
      ]
    },
    cards: [
      {
        id: "c-card-alert", phase: "before", src: "ndmaCycDD",
        title: { en: "Cyclone alert: what it means", ta: "புயல் எச்சரிக்கை: இதன் பொருள்" },
        steps: [
          { en: "A cyclone alert means the danger is within 24 hours. Stay alert for the next 24 hours.", ta: "புயல் எச்சரிக்கை என்றால் 24 மணி நேரத்திற்குள் ஆபத்து உள்ளது என்று பொருள். அடுத்த 24 மணி நேரம் விழிப்புடன் இருங்கள்." },
          { en: "While an alert is on, continue normal work but stay alert to the radio warnings.", ta: "எச்சரிக்கை இருக்கும்போது வழக்கமான வேலைகளைத் தொடரலாம்; ஆனால் வானொலி எச்சரிக்கைகளை கவனியுங்கள்." },
          { en: "When your area is under a warning, move away from low-lying coastal areas.", ta: "உங்கள் பகுதிக்கு எச்சரிக்கை வந்தால் தாழ்வான கடலோரப் பகுதிகளிலிருந்து விலகிச் செல்லுங்கள்." }
        ]
      },
      {
        id: "c-card-evac", phase: "during", src: "ndmaCycDD",
        title: { en: "If you are told to evacuate", ta: "வெளியேற அறிவுறுத்தப்பட்டால்" },
        steps: [
          { en: "Pack essentials for yourself and your family to last a few days, including medicines and special food for babies, children or elders.", ta: "உங்களுக்கும் குடும்பத்திற்கும் சில நாட்களுக்கு தேவையானவற்றை எடுத்துக்கொள்ளுங்கள்; மருந்துகள், குழந்தைகள் அல்லது முதியோருக்கான சிறப்பு உணவு உட்பட." },
          { en: "Head for the proper shelter or evacuation points indicated for your area.", ta: "உங்கள் பகுதிக்கு குறிப்பிடப்பட்டுள்ள தங்குமிடம் அல்லது வெளியேற்ற இடத்திற்கு செல்லுங்கள்." },
          { en: "Do not worry about your property.", ta: "உடைமைகளைப் பற்றி கவலைப்பட வேண்டாம்." },
          { en: "At the shelter, follow the instructions of the person in charge.", ta: "தங்குமிடத்தில் பொறுப்பாளரின் அறிவுரைகளை பின்பற்றுங்கள்." },
          { en: "Remain in the shelter until you are informed to leave.", ta: "வெளியேறலாம் என்று தெரிவிக்கப்படும் வரை தங்குமிடத்திலேயே இருங்கள்." }
        ]
      },
      {
        id: "c-card-eye", phase: "during", src: "ndmaCycDD",
        title: { en: "If the centre (eye) of the cyclone passes over you", ta: "புயலின் மையம் (கண்) உங்கள் மேல் கடந்தால்" },
        steps: [
          { en: "There will be a lull in the wind and rain lasting for half an hour or so.", ta: "காற்றும் மழையும் சுமார் அரை மணி நேரம் தணியும்." },
          { en: "During this time do not go out.", ta: "இந்த நேரத்தில் வெளியே செல்ல வேண்டாம்." },
          { en: "Immediately after, very strong winds will blow from the opposite direction.", ta: "அதன் உடனே எதிர்த் திசையிலிருந்து மிகப் பலத்த காற்று வீசும்." }
        ]
      }
    ],
    top5: [
      { kind: "do", src: "ndmaCycDD", text: { en: "Switch off electrical mains and gas connection.", ta: "மின் இணைப்பு மற்றும் எரிவாயு இணைப்பை அணைக்கவும்." } },
      { kind: "do", src: "ndmaCycDD", text: { en: "Keep doors and windows shut.", ta: "கதவுகள் மற்றும் ஜன்னல்களை மூடி வையுங்கள்." } },
      { kind: "dont", src: "ndmaCycDD", text: { en: "If the centre passes over you, do not go out during the lull.", ta: "புயலின் மையம் கடக்கும்போது ஏற்படும் தணிவு நேரத்தில் வெளியே செல்ல வேண்டாம்." } },
      { kind: "do", src: "ndmaCycDD", text: { en: "If told to evacuate, go to the shelter and stay until informed.", ta: "வெளியேற அறிவுறுத்தப்பட்டால் தங்குமிடத்திற்கு சென்று தெரிவிக்கும் வரை இருங்கள்." } },
      { kind: "dont", src: "ndmaCycDD", text: { en: "Do not enter damaged buildings; avoid loose and dangling wires.", ta: "சேதமடைந்த கட்டிடங்களுக்குள் செல்ல வேண்டாம்; தொங்கும் கம்பிகளை தவிர்க்கவும்." } }
    ]
  }
};

// ---------------------------------------------------------------------------
// STEP 3: profile form strings + personalised tips.
// Personalised tips come from: Ready.gov (US DHS/FEMA, general guidance - NOT India-specific; read 2026-10-10),
// NDMA cyclone circular/page, IMD flood sheet. No "child ID" tip is included: no source found.
// Tamil = AI-written, NOT reviewed.
// ---------------------------------------------------------------------------
Object.assign(UI, {
  profileIntro: { en: "Tell us about your household to get tailored tips.", ta: "உங்கள் குடும்பத்திற்கேற்ற குறிப்புகளைப் பெற விவரங்களை பதிவு செய்யுங்கள்." },
  privacyDevice: { en: "Your information is saved only on this phone. It is not sent to any server.", ta: "உங்கள் தகவல் இந்த தொலைபேசியில் மட்டுமே சேமிக்கப்படும். எந்த சேவையகத்திற்கும் அனுப்பப்படாது." },
  fName: { en: "Your name", ta: "உங்கள் பெயர்" },
  fDistrict: { en: "District (optional)", ta: "மாவட்டம் (விருப்பம்)" },
  fHousehold: { en: "People in your household (1-30)", ta: "குடும்ப உறுப்பினர்கள் (1-30)" },
  fWho: { en: "Is anyone in your household:", ta: "உங்கள் குடும்பத்தில் உள்ளவர்கள்:" },
  fChildren: { en: "Children", ta: "குழந்தைகள்" },
  fElderly: { en: "Elderly person", ta: "முதியவர்" },
  fDisability: { en: "Person with disability or mobility needs", ta: "மாற்றுத்திறனாளி அல்லது நடமாட்ட உதவி தேவைப்படுபவர்" },
  fPets: { en: "Pets", ta: "செல்லப்பிராணிகள்" },
  fMeds: { en: "Does anyone need regular medicines?", ta: "யாருக்காவது தொடர்ந்து மருந்துகள் தேவையா?" },
  fVehicle: { en: "Do you own a vehicle?", ta: "உங்களிடம் வாகனம் உள்ளதா?" },
  yes: { en: "Yes", ta: "ஆம்" },
  no: { en: "No", ta: "இல்லை" },
  fContacts: { en: "Personal emergency contacts (1 to 3)", ta: "தனிப்பட்ட அவசரத் தொடர்புகள் (1 முதல் 3)" },
  fContactName: { en: "Contact name", ta: "தொடர்பு பெயர்" },
  fContactPhone: { en: "Phone number", ta: "தொலைபேசி எண்" },
  errRequired: { en: "This is required.", ta: "இது அவசியம்." },
  errTooLong: { en: "Too long (max {n} characters).", ta: "மிக நீளம் (அதிகபட்சம் {n} எழுத்துகள்)." },
  errPhone: { en: "Enter a valid phone number: 7 to 15 digits, may start with +.", ta: "சரியான தொலைபேசி எண்ணை உள்ளிடவும்: 7 முதல் 15 இலக்கங்கள், + உடன் தொடங்கலாம்." },
  errHousehold: { en: "Enter a whole number from 1 to 30.", ta: "1 முதல் 30 வரை முழு எண்ணை உள்ளிடவும்." },
  errPair: { en: "Enter both a name and a phone number.", ta: "பெயர் மற்றும் தொலைபேசி எண் இரண்டையும் உள்ளிடவும்." },
  errContactMin: { en: "Add at least one emergency contact.", ta: "குறைந்தது ஒரு அவசரத் தொடர்பை சேர்க்கவும்." },
  errFix: { en: "Please fix the highlighted fields.", ta: "குறிக்கப்பட்ட பகுதிகளை சரிசெய்யவும்." },
  savedOnDevice: { en: "Saved on this phone.", ta: "இந்த தொலைபேசியில் சேமிக்கப்பட்டது." },
  edit: { en: "Edit", ta: "திருத்து" },
  deleteData: { en: "Delete my data", ta: "என் தகவலை அழி" },
  deleteConfirm: { en: "Delete your saved information and checklist progress from this phone? This cannot be undone.", ta: "சேமித்த உங்கள் தகவல் மற்றும் சரிபார்ப்பு முன்னேற்றத்தை இந்த தொலைபேசியிலிருந்து அழிக்கவா? இதை திரும்பப் பெற முடியாது." },
  deleteYes: { en: "Yes, delete", ta: "ஆம், அழி" },
  cancel: { en: "Cancel", ta: "ரத்து" },
  deletedMsg: { en: "Your information and checklist progress were deleted from this phone.", ta: "உங்கள் தகவல் மற்றும் சரிபார்ப்பு முன்னேற்றம் இந்த தொலைபேசியிலிருந்து அழிக்கப்பட்டது." },
  forYou: { en: "For your household", ta: "உங்கள் குடும்பத்திற்கு" },
  forYouHint: { en: "Based on the information you saved.", ta: "நீங்கள் சேமித்த தகவலின் அடிப்படையில்." },
  readyNote: { en: "Some tips come from Ready.gov (US government). They are general guidance, not India-specific.", ta: "சில குறிப்புகள் Ready.gov (அமெரிக்க அரசு) தளத்திலிருந்து. இவை பொதுவான வழிகாட்டுதல், இந்தியாவுக்கு மட்டும் உரியவை அல்ல." },
  noProfileYet: { en: "Save your information to see tips for your household.", ta: "உங்கள் குடும்பத்திற்கான குறிப்புகளைக் காண தகவலை சேமிக்கவும்." },
  summaryHousehold: { en: "Household size", ta: "குடும்ப உறுப்பினர்கள்" },
  summaryContacts: { en: "Emergency contacts", ta: "அவசரத் தொடர்புகள்" },
  myTips: { en: "Personalised tips", ta: "தனிப்பயன் குறிப்புகள்" }
});

SOURCES.readyPets = { short: "Ready.gov", label: "Ready.gov (US DHS/FEMA) - Pets", url: "https://www.ready.gov/pets", read: "2026-10-10" };
SOURCES.readyOlder = { short: "Ready.gov", label: "Ready.gov (US DHS/FEMA) - Older adults", url: "https://www.ready.gov/older-adults", read: "2026-10-10" };
SOURCES.readyDisability = { short: "Ready.gov", label: "Ready.gov (US DHS/FEMA) - People with disabilities", url: "https://www.ready.gov/disability", read: "2026-10-10" };
SOURCES.readyKit = { short: "Ready.gov", label: "Ready.gov (US DHS/FEMA) - Emergency supply kit", url: "https://www.ready.gov/kit", read: "2026-10-10" };
SOURCES.readyFamily = { short: "Ready.gov", label: "Ready.gov (US DHS/FEMA) - Family emergency planning", url: "https://www.ready.gov/kids/family-emergency-planning", read: "2026-10-10" };

// key -> profile condition (see profile.js personalItems): elderly, disability, children, pets, meds, vehicle
export const PERSONAL = [
  {
    key: "elderly", title: { en: "Elderly person in your household", ta: "உங்கள் குடும்பத்தில் முதியவர்" },
    items: [
      I("p-el-1", "readyOlder", "Plan for transportation if you need help evacuating.", "வெளியேற உதவி தேவைப்பட்டால் போக்குவரத்துக்கு முன்கூட்டியே திட்டமிடுங்கள்."),
      I("p-el-2", "readyOlder", "Include items for your needs, such as medicines, medical supplies, batteries and chargers, in your emergency supply kit.", "உங்கள் தேவைகளுக்கான மருந்துகள், மருத்துவப் பொருட்கள், பேட்டரிகள், சார்ஜர்களை அவசரகாலப் பெட்டியில் சேர்க்கவும்."),
      I("p-el-3", "readyOlder", "Create a support network of people who can assist you in an emergency, and practice your plan with them.", "அவசரத்தில் உதவக்கூடியவர்களின் ஆதரவு வலையமைப்பை உருவாக்கி, அவர்களுடன் திட்டத்தை பயிற்சி செய்யுங்கள்."),
      I("p-el-4", "ndmaCycDD", "If you evacuate, pack essentials for a few days, including medicines and special food for babies, children or elders.", "வெளியேறினால் சில நாட்களுக்கு தேவையானவற்றை எடுத்துக்கொள்ளுங்கள்; மருந்துகள், குழந்தைகள் அல்லது முதியோருக்கான சிறப்பு உணவு உட்பட.")
    ]
  },
  {
    key: "disability", title: { en: "Disability or mobility needs", ta: "மாற்றுத்திறன் அல்லது நடமாட்ட தேவைகள்" },
    items: [
      I("p-di-1", "readyDisability", "Create a support network of people who can help you in a disaster, and tell them where you keep your emergency supplies.", "பேரிடரில் உதவக்கூடியவர்களின் வலையமைப்பை உருவாக்கி, அவசரகாலப் பொருட்கள் எங்கே உள்ளன என்று அவர்களுக்கு தெரிவியுங்கள்."),
      I("p-di-2", "readyDisability", "If you use a power wheelchair, have a lightweight manual chair as a backup if possible. Keep an extra battery for battery-operated assistive devices, and an extra cane or walker if you use one.", "மின் சக்கர நாற்காலி பயன்படுத்தினால் முடிந்தால் இலகுவான கைச் சக்கர நாற்காலியை மாற்றாக வைத்திருங்கள். பேட்டரியில் இயங்கும் உதவி சாதனங்களுக்கு கூடுதல் பேட்டரியும், கைத்தடி அல்லது நடைபயிற்சி சட்டம் பயன்படுத்தினால் கூடுதல் ஒன்றும் வைத்திருங்கள்."),
      I("p-di-3", "readyDisability", "Plan ahead for accessible transportation you may need for evacuation. Talk to neighbours who can help if you need to evacuate the building.", "வெளியேற தேவைப்படும் அணுகக்கூடிய போக்குவரத்துக்கு முன்கூட்டியே திட்டமிடுங்கள். கட்டிடத்திலிருந்து வெளியேற உதவக்கூடிய அண்டை வீட்டாருடன் பேசுங்கள்.")
    ]
  },
  {
    key: "children", title: { en: "Children in your household", ta: "உங்கள் குடும்பத்தில் குழந்தைகள்" },
    items: [
      I("p-ch-1", "ndmaCycDD", "Make provision for children and adults requiring special diet.", "சிறப்பு உணவு தேவைப்படும் குழந்தைகள் மற்றும் பெரியவர்களுக்கு ஏற்பாடு செய்யுங்கள்."),
      I("p-ch-2", "readyKit", "If you have a baby, add infant formula, bottles, diapers, wipes and diaper rash cream to your emergency kit.", "குழந்தை இருந்தால் குழந்தைப் பால் பவுடர், பாட்டில்கள், டயப்பர்கள், துடைப்பான்கள், டயப்பர் ராஷ் க்ரீம் ஆகியவற்றை அவசரகாலப் பெட்டியில் சேர்க்கவும்."),
      I("p-ch-3", "readyKit", "Add books, games, puzzles or other activities for children to your kit.", "குழந்தைகளுக்கான புத்தகங்கள், விளையாட்டுகள், புதிர்கள் அல்லது பிற செயல்பாடுகளை பெட்டியில் சேர்க்கவும்."),
      I("p-ch-4", "readyFamily", "Agree a family plan: how will you get in touch with each other, and where will you meet?", "குடும்பத் திட்டத்தை முடிவு செய்யுங்கள்: ஒருவருக்கொருவர் எப்படி தொடர்பு கொள்வது, எங்கே சந்திப்பது?")
    ]
  },
  {
    key: "pets", title: { en: "Pets", ta: "செல்லப்பிராணிகள்" },
    items: [
      I("p-pe-1", "readyPets", "Pet kit: several days' food in an airtight waterproof container, water and a bowl, extra regular medicine, a backup leash, collar and ID tag, copies of key documents, and a sturdy carrier.", "செல்லப்பிராணி பெட்டி: காற்றுபுகாத நீர்புகாத கலனில் சில நாட்களுக்கான உணவு, தண்ணீர் மற்றும் கிண்ணம், வழக்கமான மருந்து கூடுதலாக, கூடுதல் கயிறு, கழுத்துப்பட்டை மற்றும் அடையாள அட்டை, முக்கிய ஆவண நகல்கள், உறுதியான கூடை."),
      I("p-pe-2", "readyPets", "If officials ask you to evacuate, your pet should evacuate too. Have an evacuation plan for your pet; many shelters do not allow pets, so find pet-friendly places in advance.", "அதிகாரிகள் வெளியேறச் சொன்னால் உங்கள் செல்லப்பிராணியும் வெளியேற வேண்டும். அதற்கான திட்டம் வைத்திருங்கள்; பல தங்குமிடங்கள் செல்லப்பிராணிகளை அனுமதிக்காது, எனவே முன்கூட்டியே இடங்களை கண்டறியுங்கள்."),
      I("p-pe-3", "readyPets", "Always bring pets indoors at the first sign of a storm or disaster.", "புயல் அல்லது பேரிடரின் முதல் அறிகுறியிலேயே செல்லப்பிராணிகளை வீட்டிற்குள் அழைத்து வாருங்கள்.")
    ]
  },
  {
    key: "meds", title: { en: "Regular medicines", ta: "வழக்கமான மருந்துகள்" },
    items: [
      I("p-me-1", "readyDisability", "Talk to your doctor or pharmacist about how you can create an emergency supply of medicines.", "மருந்துகளின் அவசரகால இருப்பை எப்படி வைத்திருப்பது என்று உங்கள் மருத்துவர் அல்லது மருந்தாளுநரிடம் பேசுங்கள்."),
      I("p-me-2", "ndmaCycPage", "Keep a first aid kit and essential medicines in your emergency kit.", "முதலுதவிப் பெட்டி மற்றும் அத்தியாவசிய மருந்துகளை அவசரகாலப் பெட்டியில் வைத்திருங்கள்.")
    ]
  },
  {
    key: "vehicle", title: { en: "You own a vehicle", ta: "உங்களிடம் வாகனம் உள்ளது" },
    items: [
      I("p-ve-1", "imdFlood", "Do not walk or drive in flood waters. Two feet of moving flood water can wash away big cars as well.", "வெள்ள நீரில் நடக்கவோ வாகனம் ஓட்டவோ வேண்டாம். இரண்டு அடி ஓடும் வெள்ளம் பெரிய கார்களையும் அடித்துச் செல்லும்."),
      I("p-ve-2", "ndmaCycDD", "After a cyclone, if you have to drive, drive carefully.", "புயலுக்குப் பின் வாகனம் ஓட்ட வேண்டியிருந்தால் கவனமாக ஓட்டுங்கள்.")
    ]
  }
];

// Step 4 UI strings (Tamil unreviewed)
Object.assign(UI, {
  offlineReady: { en: "Saved for offline use", ta: "ஆஃப்லைன் பயன்பாட்டிற்கு சேமிக்கப்பட்டது" }
});

// ---------------------------------------------------------------------------
// STEP 5: live alerts config + strings. Tamil = AI-written, NOT reviewed.
// ---------------------------------------------------------------------------
export const API_BASE = "/api"; // Netlify function routes: /api/sachet, /api/hazard

// How to decide that a SACHET alert is "for my area". Verified on the live feed (2026-10-10): titles list DISTRICT
// names (not the state), and <author> names the issuing agency, e.g. "IMD Chennai". So we match on: state name,
// district/area names, or the issuing agency. District lists exist only for Tamil Nadu (approximate; spelling variants
// included). For other states only the state name + agency are matched. A miss only affects highlighting:
// ALL alerts remain viewable under "Other alerts".
export const ALERT_AREAS = {
  "Tamil Nadu": {
    names: ["Tamil Nadu", "Tamilnadu", "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode",
      "Kallakurichi", "Kancheepuram", "Kanchipuram", "Kanniyakumari", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
      "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Pudukottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga",
      "Sivagangai", "Tenkasi", "Thanjavur", "Theni", "Thiruvarur", "Tiruvarur", "Thoothukudi", "Thoothukkudi", "Tuticorin", "Tiruchirappalli",
      "Trichy", "Tirunelveli", "Tirupathur", "Tirupattur", "Tiruppur", "Tiruvallur", "Thiruvallur", "Tiruvannamalai", "Vellore", "Viluppuram",
      "Villupuram", "Virudhunagar"],
    agencies: ["Chennai", "Tamil Nadu"]
  },
  "Kerala": { names: ["Kerala"], agencies: ["Thiruvananthapuram", "Kerala"] },
  "Andhra Pradesh": { names: ["Andhra Pradesh"], agencies: ["Andhra Pradesh"] },
  "Odisha": { names: ["Odisha"], agencies: ["Bhubaneswar", "Odisha"] },
  "West Bengal": { names: ["West Bengal"], agencies: ["Kolkata", "West Bengal"] },
  "Puducherry": { names: ["Puducherry", "Karaikal", "Mahe", "Yanam"], agencies: ["Chennai", "Puducherry"] }
};

Object.assign(UI, {
  alertsTitle: { en: "Live alerts", ta: "நேரடி எச்சரிக்கைகள்" },
  alertsHome: { en: "Live weather alerts", ta: "நேரடி வானிலை எச்சரிக்கைகள்" },
  alertsFor: { en: "{n} alert(s) for {area}", ta: "{area} பகுதிக்கு {n} எச்சரிக்கை(கள்)" },
  noAlertsFor: { en: "No alerts for {area} in the latest feed.", ta: "சமீபத்திய தொகுப்பில் {area} பகுதிக்கு எச்சரிக்கைகள் இல்லை." },
  lastUpdated: { en: "Last updated {time}", ta: "கடைசி புதுப்பிப்பு {time}" },
  couldNotRefresh: { en: "Could not refresh - showing last saved at {time}", ta: "புதுப்பிக்க முடியவில்லை - {time} அன்று சேமித்தது காட்டப்படுகிறது" },
  offlineSaved: { en: "Offline - showing last saved at {time}", ta: "ஆஃப்லைன் - {time} அன்று சேமித்தது காட்டப்படுகிறது" },
  noDataYet: { en: "No alert data saved yet. Connect to the internet to load alerts.", ta: "இன்னும் எச்சரிக்கை தகவல் சேமிக்கப்படவில்லை. இணையத்தில் இணைந்து ஏற்றவும்." },
  refresh: { en: "Refresh", ta: "புதுப்பி" },
  refreshing: { en: "Refreshing…", ta: "புதுப்பிக்கிறது…" },
  alertsHonest: {
    en: "Alerts load only while this app is open and online. This is NOT an SMS or push message when the app is closed. Always follow official warnings.",
    ta: "இந்த செயலி திறந்திருந்து இணையத்தில் இருக்கும்போது மட்டுமே எச்சரிக்கைகள் ஏற்றப்படும். செயலி மூடியிருந்தால் இது SMS அல்லது புஷ் செய்தி அல்ல. எப்போதும் அதிகாரப்பூர்வ எச்சரிக்கைகளை பின்பற்றுங்கள்."
  },
  alertsSource: { en: "Official source: SACHET (NDMA)", ta: "அதிகாரப்பூர்வ ஆதாரம்: SACHET (NDMA)" },
  alertTextNote: { en: "Alert text is shown as published by the issuing agency (it may be in another language).", ta: "எச்சரிக்கை உரை வெளியிட்ட நிறுவனம் வழங்கியபடியே காட்டப்படுகிறது (வேறு மொழியில் இருக்கலாம்)." },
  otherAlerts: { en: "Other alerts across India", ta: "இந்தியா முழுவதும் பிற எச்சரிக்கைகள்" },
  viewOfficial: { en: "Official alert", ta: "அதிகாரப்பூர்வ எச்சரிக்கை" },
  pickStateForAlerts: { en: "Choose your state in Settings to highlight alerts for your area.", ta: "உங்கள் பகுதிக்கான எச்சரிக்கைகளை முன்னிலைப்படுத்த அமைப்புகளில் மாநிலத்தை தேர்வு செய்யவும்." },
  notifOn: { en: "Turn on browser notifications", ta: "உலாவி அறிவிப்புகளை இயக்கு" },
  notifGranted: { en: "Notifications are on, but only while this app is open.", ta: "அறிவிப்புகள் இயக்கத்தில் உள்ளன, ஆனால் இந்த செயலி திறந்திருக்கும்போது மட்டும்." },
  notifDenied: { en: "Notifications are blocked in your browser settings.", ta: "உங்கள் உலாவி அமைப்புகளில் அறிவிப்புகள் தடுக்கப்பட்டுள்ளன." },
  notifUnsupported: { en: "This browser does not support notifications.", ta: "இந்த உலாவி அறிவிப்புகளை ஆதரிக்கவில்லை." },
  notifDefault: { en: "Notifications are off.", ta: "அறிவிப்புகள் அணைக்கப்பட்டுள்ளன." },
  notifTitle: { en: "New alert for your area", ta: "உங்கள் பகுதிக்கு புதிய எச்சரிக்கை" },
  hazardTitle: { en: "Long-term hazard level (ThinkHazard)", ta: "நீண்டகால ஆபத்து நிலை (ThinkHazard)" },
  hazardNote: { en: "This is a long-term hazard level for your area, not a live warning.", ta: "இது உங்கள் பகுதிக்கான நீண்டகால ஆபத்து நிலை, நேரடி எச்சரிக்கை அல்ல." },
  hazardUnavailable: { en: "Hazard level could not be loaded. It will appear here once you are online and the service is available.", ta: "ஆபத்து நிலையை ஏற்ற முடியவில்லை. இணையத்தில் இருந்து சேவை கிடைத்ததும் இங்கே தோன்றும்." },
  hazardSaved: { en: "Saved {time}", ta: "சேமித்தது {time}" },
  sampleLabel: { en: "SAMPLE DATA - a saved copy from {time}. Not live. For demo only.", ta: "மாதிரி தரவு - {time} அன்று சேமித்த நகல். நேரடி அல்ல. செயல்விளக்கத்திற்கு மட்டும்." },
  useSample: { en: "Show saved sample (demo)", ta: "சேமித்த மாதிரியைக் காட்டு (செயல்விளக்கம்)" },
  leaveSample: { en: "Back to live data", ta: "நேரடி தரவுக்கு திரும்பு" },
  levelHigh: { en: "High", ta: "அதிகம்" },
  levelMedium: { en: "Medium", ta: "நடுத்தரம்" },
  levelLow: { en: "Low", ta: "குறைவு" },
  levelVeryLow: { en: "Very low", ta: "மிகக் குறைவு" },
  levelNoData: { en: "No data", ta: "தரவு இல்லை" },
  hazRiver: { en: "River flood", ta: "ஆற்று வெள்ளம்" },
  hazUrban: { en: "Urban flood", ta: "நகர வெள்ளம்" },
  hazCoastal: { en: "Coastal flood", ta: "கடலோர வெள்ளம்" },
  hazCyclone: { en: "Cyclone", ta: "புயல்" }
});

// Short labels for the 5-item bottom nav (long Tamil words were clipped at 360px)
Object.assign(UI, {
  navContacts: { en: "Contacts", ta: "தொடர்பு" },
  navSettings: { en: "Settings", ta: "அமைப்பு" }
});
