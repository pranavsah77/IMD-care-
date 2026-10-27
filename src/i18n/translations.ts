export type Language = "en" | "hi" | "mr";

export interface Translations {
  // Brand & Nav
  appName: string;
  tagline: string;
  dashboard: string;
  assistant: string;
  symptoms: string;
  reports: string;
  preventive: string;
  settings: string;
  emergencyHotlines: string;
  informationalAid: string;

  // Header & Auth
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  howCanWeHelp: string;
  askAiAssistant: string;
  signIn: string;
  signOut: string;
  guestUser: string;
  demoReviewer: string;
  emergencySos: string;
  platformReady: string;

  // Feature Cards
  card1Title: string;
  card1Desc: string;
  card1Btn: string;
  card2Title: string;
  card2Desc: string;
  card2Btn: string;
  card3Title: string;
  card3Desc: string;
  card3Btn: string;
  card4Title: string;
  card4Desc: string;
  card4Btn: string;

  // Dashboard Sections
  upcomingReminders: string;
  manageAll: string;
  noRemindersToday: string;
  addReminder: string;
  wellnessSummary: string;
  syntheticDemo: string;
  hydration: string;
  sleepDuration: string;
  dailyMovement: string;
  openTracker: string;
  disclaimerText: string;

  // AI Assistant
  aiIntro: string;
  suggestedQuestions: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  askPlaceholder: string;
  send: string;
  clearChat: string;
  thinking: string;

  // Symptoms
  symptomTitle: string;
  symptomSubtitle: string;
  tryPresets: string;
  ageGroup: string;
  mainSymptom: string;
  duration: string;
  severity: string;
  additionalDetails: string;
  getGuidance: string;
  clearForm: string;
  evaluating: string;
  explTitle: string;
  selfCareTitle: string;
  doctorTitle: string;
  warningTitle: string;

  // Medical Reports
  reportsTitle: string;
  reportsSubtitle: string;
  trySampleBtn: string;
  dragDrop: string;
  browseFile: string;
  analyzeReport: string;
  analyzingReport: string;
  reportSummary: string;
  measuredTests: string;
  generalExpl: string;
  questionsForDoctor: string;

  // Preventive
  wellnessTracker: string;
  waterIntake: string;
  todayReflection: string;
  medicationReminders: string;
  appointmentReminders: string;
  aiWellnessTips: string;
  add: string;

  // Auth modal
  welcomeBack: string;
  loginSubtitle: string;
  emailLabel: string;
  passwordLabel: string;
  continueWithGoogle: string;
  continueAsGuest: string;
  switchProfile: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "IMD Care",
    tagline: "Your health, made easier.",
    dashboard: "Dashboard",
    assistant: "AI Health Assistant",
    symptoms: "Symptom Guidance",
    reports: "Medical Reports",
    preventive: "Preventive Healthcare",
    settings: "Settings",
    emergencyHotlines: "Emergency Hotlines",
    informationalAid: "Informational aid only. Not a substitute for clinical advice.",

    goodMorning: "Good morning!",
    goodAfternoon: "Good afternoon!",
    goodEvening: "Good evening!",
    howCanWeHelp: "How can we help you today? Explore verified guidance, simplify laboratory results, and monitor daily goals.",
    askAiAssistant: "Ask AI Assistant",
    signIn: "Sign In",
    signOut: "Sign Out",
    guestUser: "Demo Guest",
    demoReviewer: "Ideathon Reviewer",
    emergencySos: "Emergency SOS",
    platformReady: "Platform Ready",

    card1Title: "AI Health Assistant",
    card1Desc: "Understand health information and terminology.",
    card1Btn: "Start Chat",
    card2Title: "Symptom Guidance",
    card2Desc: "Explore appropriate next steps safely.",
    card2Btn: "Check Symptoms",
    card3Title: "Medical Reports",
    card3Desc: "Understand your laboratory results in simple terms.",
    card3Btn: "Analyze Report",
    card4Title: "Preventive Healthcare",
    card4Desc: "Track wellness goals, medications, and visits.",
    card4Btn: "View Wellness",

    upcomingReminders: "Upcoming Reminders",
    manageAll: "Manage All",
    noRemindersToday: "No reminders scheduled for today.",
    addReminder: "Add Reminder",
    wellnessSummary: "Wellness Summary",
    syntheticDemo: "Synthetic Demo",
    hydration: "Hydration",
    sleepDuration: "Sleep Duration",
    dailyMovement: "Daily Movement",
    openTracker: "Open Tracker",
    disclaimerText: "IMD Care provides general health information and does not replace a qualified healthcare professional.",

    aiIntro: "Hello! I am your IMD Care AI Assistant. I can help explain medical terms, symptoms, and daily wellness habits in clear, simple language.",
    suggestedQuestions: "Suggested Questions:",
    q1: "What does blood pressure mean?",
    q2: "Explain dehydration in simple words.",
    q3: "What are common causes of a headache?",
    q4: "How can I improve my sleep?",
    askPlaceholder: "Ask a health question (e.g. 'What is the purpose of a lipid panel?')...",
    send: "Send",
    clearChat: "Clear Chat",
    thinking: "Thinking and analyzing health information...",

    symptomTitle: "Smart Symptom Guidance",
    symptomSubtitle: "Structured educational health insights and red-flag evaluations. This tool does not provide diagnoses.",
    tryPresets: "Try Synthetic Demo Scenarios (One-Click):",
    ageGroup: "Age Group",
    mainSymptom: "Primary Symptom / Description",
    duration: "Duration of Symptoms",
    severity: "Perceived Severity",
    additionalDetails: "Additional Details & Context (Optional)",
    getGuidance: "Get Guidance",
    clearForm: "Clear Form",
    evaluating: "Evaluating Symptoms...",
    explTitle: "1. Possible General Explanations",
    selfCareTitle: "2. General Self-Care Information",
    doctorTitle: "3. When to Contact a Healthcare Professional",
    warningTitle: "4. Warning Signs Requiring Urgent / Emergency Care",

    reportsTitle: "Medical Report Simplifier",
    reportsSubtitle: "Understand laboratory results, reference ranges, and test definitions in plain English without confusion.",
    trySampleBtn: "Try Sample Report (Synthetic CMP)",
    dragDrop: "Drag & drop your lab report here, or browse files",
    browseFile: "Browse Local File",
    analyzeReport: "Analyze Report",
    analyzingReport: "Simplifying Lab Report with Gemini...",
    reportSummary: "1. Report Summary",
    measuredTests: "2-5. Measured Tests, Values & Reference Intervals",
    generalExpl: "6. General Explanations of Findings",
    questionsForDoctor: "7. Questions to Ask a Healthcare Professional",

    wellnessTracker: "1. Daily Wellness Tracker",
    waterIntake: "Water Intake",
    todayReflection: "Today's Wellness Note & Reflection:",
    medicationReminders: "2. Medication Reminders",
    appointmentReminders: "3. Appointment Reminders",
    aiWellnessTips: "4. AI Preventive Wellness Tips",
    add: "Add",

    welcomeBack: "Welcome to IMD Care",
    loginSubtitle: "Sign in to save your personal health profile and reminders",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    continueWithGoogle: "Continue with Google (Demo)",
    continueAsGuest: "Continue as Guest Explorer",
    switchProfile: "Quick Profile Switcher",
  },

  hi: {
    appName: "आईएमडी केयर",
    tagline: "आपका स्वास्थ्य, अब हुआ आसान।",
    dashboard: "डैशबोर्ड",
    assistant: "एआई स्वास्थ्य सहायक",
    symptoms: "लक्षण मार्गदर्शन",
    reports: "मेडिकल रिपोर्ट्स",
    preventive: "निवारक स्वास्थ्य",
    settings: "सेटिंग्स",
    emergencyHotlines: "आपातकालीन नंबर",
    informationalAid: "केवल सामान्य जानकारी हेतु। यह चिकित्सीय सलाह का विकल्प नहीं है।",

    goodMorning: "शुभ प्रभात!",
    goodAfternoon: "शुभ दोपहर!",
    goodEvening: "शुभ संध्या!",
    howCanWeHelp: "आज हम आपकी क्या मदद कर सकते हैं? प्रामाणिक मार्गदर्शन प्राप्त करें, लैब रिपोर्ट्स समझें और स्वास्थ्य लक्ष्यों को ट्रैक करें।",
    askAiAssistant: "एआई सहायक से पूछें",
    signIn: "साइन इन करें",
    signOut: "साइन आउट",
    guestUser: "डेमो अतिथि",
    demoReviewer: "आइडियाथॉन समीक्षक",
    emergencySos: "आपातकालीन संकट (SOS)",
    platformReady: "सिस्टम तैयार है",

    card1Title: "एआई स्वास्थ्य सहायक",
    card1Desc: "स्वास्थ्य संबंधी जानकारी और शब्दों को सरल भाषा में समझें।",
    card1Btn: "बातचीत शुरू करें",
    card2Title: "लक्षण मार्गदर्शन",
    card2Desc: "उचित और सुरक्षित अगले कदम जानें।",
    card2Btn: "लक्षण जांचें",
    card3Title: "मेडिकल रिपोर्ट्स",
    card3Desc: "अपनी लैब रिपोर्ट के नतीजों को आसान भाषा में समझें।",
    card3Btn: "रिपोर्ट समझें",
    card4Title: "निवारक स्वास्थ्य",
    card4Desc: "दवाइयों के रिमाइंडर और दैनिक स्वास्थ्य आदतें ट्रैक करें।",
    card4Btn: "स्वास्थ्य देखें",

    upcomingReminders: "आगामी रिमाइंडर्स",
    manageAll: "सभी देखें",
    noRemindersToday: "आज के लिए कोई रिमाइंडर नहीं है।",
    addReminder: "रिमाइंडर जोड़ें",
    wellnessSummary: "स्वास्थ्य सारांश",
    syntheticDemo: "डेमो डेटा",
    hydration: "जल स्तर (पानी)",
    sleepDuration: "नींद की अवधि",
    dailyMovement: "दैनिक हलचल",
    openTracker: "ट्रैकर खोलें",
    disclaimerText: "आईएमडी केयर केवल सामान्य स्वास्थ्य जानकारी प्रदान करता है और योग्य चिकित्सक का विकल्प नहीं है।",

    aiIntro: "नमस्ते! मैं आपका आईएमडी केयर एआई स्वास्थ्य सहायक हूँ। मैं स्वास्थ्य शब्दावली, लक्षण और जीवनशैली संबंधी सुझाव सरल हिंदी में समझा सकता हूँ।",
    suggestedQuestions: "सुझाए गए प्रश्न:",
    q1: "ब्लड प्रेशर (रक्तचाप) का क्या अर्थ है?",
    q2: "डिहाइड्रेशन (पानी की कमी) को सरल शब्दों में समझाएं।",
    q3: "सिरदर्द के सामान्य कारण क्या होते हैं?",
    q4: "मैं अपनी नींद की गुणवत्ता कैसे सुधार सकता हूँ?",
    askPlaceholder: "स्वास्थ्य संबंधी प्रश्न पूछें (जैसे: 'लिपिड प्रोफाइल का क्या महत्व है?')...",
    send: "भेजें",
    clearChat: "चैट साफ़ करें",
    thinking: "स्वास्थ्य जानकारी का विश्लेषण किया जा रहा है...",

    symptomTitle: "स्मार्ट लक्षण मार्गदर्शन",
    symptomSubtitle: "संरचित शैक्षणिक स्वास्थ्य अंतर्दृष्टि और आपातकालीन चेतावनी। यह टूल कोई अंतिम निदान नहीं करता।",
    tryPresets: "डेमो परिदृश्य आज़माएं (एक क्लिक):",
    ageGroup: "आयु वर्ग",
    mainSymptom: "मुख्य लक्षण / विवरण",
    duration: "लक्षणों की अवधि",
    severity: "गंभीरता स्तर",
    additionalDetails: "अतिरिक्त विवरण (वैकल्पिक)",
    getGuidance: "मार्गदर्शन प्राप्त करें",
    clearForm: "फ़ॉर्म साफ़ करें",
    evaluating: "लक्षणों का मूल्यांकन हो रहा है...",
    explTitle: "१. संभावित सामान्य कारण",
    selfCareTitle: "२. सामान्य घरेलू देखभाल जानकारी",
    doctorTitle: "३. डॉक्टर से कब संपर्क करें",
    warningTitle: "४. आपातकालीन चेतावनी संकेत",

    reportsTitle: "मेडिकल रिपोर्ट विश्लेषक",
    reportsSubtitle: "अपनी प्रयोगशाला रिपोर्ट, रेफरेंस रेंज और टेस्ट के अर्थ को बिना किसी उलझन के समझें।",
    trySampleBtn: "सैंपल रिपोर्ट देखें (सीएमपी व लिपिड)",
    dragDrop: "अपनी लैब रिपोर्ट यहाँ ड्रैग करें, या फ़ाइल चुनें",
    browseFile: "लोकल फ़ाइल चुनें",
    analyzeReport: "रिपोर्ट का विश्लेषण करें",
    analyzingReport: "जेमिनी एआई द्वारा रिपोर्ट का विश्लेषण हो रहा है...",
    reportSummary: "१. रिपोर्ट सारांश",
    measuredTests: "२-५. टेस्ट के मान और रेफरेंस रेंज",
    generalExpl: "६. निष्कर्षों की सामान्य व्याख्या",
    questionsForDoctor: "७. अपने डॉक्टर से पूछने योग्य प्रश्न",

    wellnessTracker: "१. दैनिक स्वास्थ्य ट्रैकर",
    waterIntake: "पानी का सेवन",
    todayReflection: "आज का स्वास्थ्य अनुभव व विचार:",
    medicationReminders: "२. दवाइयों के रिमाइंडर्स",
    appointmentReminders: "३. डॉक्टर अपॉइंटमेंट रिमाइंडर्स",
    aiWellnessTips: "४. एआई निवारक स्वास्थ्य सुझाव",
    add: "जोड़ें",

    welcomeBack: "आईएमडी केयर में आपका स्वागत है",
    loginSubtitle: "अपनी स्वास्थ्य प्रोफ़ाइल और रिमाइंडर्स सुरक्षित रखने के लिए साइन इन करें",
    emailLabel: "ईमेल पता",
    passwordLabel: "पासवर्ड",
    continueWithGoogle: "गूगल के साथ जारी रखें (डेमो)",
    continueAsGuest: "अतिथि के रूप में जारी रखें",
    switchProfile: "त्वरित प्रोफ़ाइल बदलें",
  },

  mr: {
    appName: "आयएमडी केअर",
    tagline: "तुमचे आरोग्य, आता झाले सोपे.",
    dashboard: "डॅशबोर्ड",
    assistant: "एआय आरोग्य सहाय्यक",
    symptoms: "लक्षण मार्गदर्शन",
    reports: "वैद्यकीय अहवाल",
    preventive: "प्रतिबंधात्मक आरोग्य",
    settings: "सेटिंग्ज",
    emergencyHotlines: "आपत्कालीन संपर्क",
    informationalAid: "केवळ माहितीसाठी. हा प्रत्यक्ष वैद्यकीय सल्ल्याचा पर्याय नाही.",

    goodMorning: "शुभ प्रभात!",
    goodAfternoon: "शुभ दुपार!",
    goodEvening: "शुभ संध्याकाळ!",
    howCanWeHelp: "आज आम्ही तुम्हाला कशी मदत करू शकतो? विश्वासार्ह मार्गदर्शन मिळवा, लॅब अहवाल सोप्या भाषेत समजून घ्या.",
    askAiAssistant: "एआय सहाय्यकाला विचारा",
    signIn: "साइन इन करा",
    signOut: "साइन आउट",
    guestUser: "डेमो पाहुणे",
    demoReviewer: "आयडियाथॉन परीक्षक",
    emergencySos: "आपत्कालीन मदत (SOS)",
    platformReady: "प्लॅटफॉर्म सज्ज आहे",

    card1Title: "एआय आरोग्य सहाय्यक",
    card1Desc: "आरोग्य माहिती आणि वैद्यकीय संज्ञा सोप्या भाषेत समजून घ्या.",
    card1Btn: "संभाषण सुरू करा",
    card2Title: "लक्षण मार्गदर्शन",
    card2Desc: "पुढील योग्य आणि सुरक्षित पावले जाणून घ्या.",
    card2Btn: "लक्षणे तपासा",
    card3Title: "वैद्यकीय अहवाल",
    card3Desc: "तुमच्या लॅब टेस्टचे निकाल सोप्या भाषेत समजून घ्या.",
    card3Btn: "अहवाल तपासा",
    card4Title: "प्रतिबंधात्मक आरोग्य",
    card4Desc: "औषधांचे स्मरणपत्र आणि दैनंदिन आरोग्य सवयी नोंदवा.",
    card4Btn: "आरोग्य पहा",

    upcomingReminders: "आगामी स्मरणपत्रे (Reminders)",
    manageAll: "सर्व व्यवस्थापित करा",
    noRemindersToday: "आज कोणतेही स्मरणपत्र नियोजित नाही.",
    addReminder: "स्मरणपत्र जोडा",
    wellnessSummary: "आरोग्य सारांश",
    syntheticDemo: "डेमो माहिती",
    hydration: "पाणी पिण्याची पातळी",
    sleepDuration: "झोपेचा वेळ",
    dailyMovement: "दैनंदिन हालचाल / व्यायाम",
    openTracker: "ट्रॅकर उघडा",
    disclaimerText: "आयएमडी केअर केवळ सामान्य आरोग्य माहिती पुरवते आणि तज्ज्ञ डॉक्टरांचा पर्याय नाही.",

    aiIntro: "नमस्कार! मी तुमचा आयएमडी केअर एआय आरोग्य सहाय्यक आहे. मी वैद्यकीय संज्ञा, लक्षणे आणि दैनंदिन निरोगी सवयी सोप्या मराठीत समजावून सांगू शकतो.",
    suggestedQuestions: "सुचवलेले प्रश्न:",
    q1: "ब्लड प्रेशर (रक्तदाब) म्हणजे काय?",
    q2: "डिहायड्रेशन (पाण्याची कमतरता) सोप्या भाषेत समजावून सांगा.",
    q3: "डोकेदुखीची सामान्य कारणे कोणती आहेत?",
    q4: "मी माझी झोप कशी सुधारू शकतो?",
    askPlaceholder: "आरोग्याविषयी प्रश्न विचारा (उदा. 'लिपिड प्रोफाइल चाचणी कशासाठी असते?')...",
    send: "पाठवा",
    clearChat: "चॅट साफ करा",
    thinking: "आरोग्य माहितीचे विश्लेषण चालू आहे...",

    symptomTitle: "स्मार्ट लक्षण मार्गदर्शन",
    symptomSubtitle: "रचनात्मक आरोग्य मार्गदर्शन आणि धोक्याचे इशारे. हे साधन कोणताही रोग निदान करत नाही.",
    tryPresets: "डेमो परिस्थिती निवडा (एक क्लिक):",
    ageGroup: "वयोगट",
    mainSymptom: "मुख्य लक्षण / वर्णन",
    duration: "लक्षणे किती दिवस आहेत",
    severity: "तीव्रता",
    additionalDetails: "अधिक तपशील (ऐच्छिक)",
    getGuidance: "मार्गदर्शन मिळवा",
    clearForm: "फॉर्म साफ करा",
    evaluating: "लक्षणांचे मूल्यांकन होत आहे...",
    explTitle: "१. संभाव्य सामान्य कारणे",
    selfCareTitle: "२. घरी घ्यावयाची काळजी",
    doctorTitle: "३. डॉक्टरांशी कधी संपर्क साधावा",
    warningTitle: "४. तातडीने डॉक्टरकडे जाण्याची चेतावणी",

    reportsTitle: "वैद्यकीय अहवाल विश्लेषक",
    reportsSubtitle: "तुमचा लॅब रिपोर्ट, चाचण्यांचे प्रमाण आणि संदर्भ मर्यादा सोप्या भाषेत समजून घ्या.",
    trySampleBtn: "नमुना अहवाल पहा (सीएमपी आणि लिपिड)",
    dragDrop: "तुमचा लॅब अहवाल येथे टाका, किंवा फाईल निवडा",
    browseFile: "स्थानिक फाईल निवडा",
    analyzeReport: "अहवाल तपासा",
    analyzingReport: "जेमिनी एआय अहवालाचे विश्लेषण करत आहे...",
    reportSummary: "१. अहवाल सारांश",
    measuredTests: "२-५. केलेल्या चाचण्या आणि संदर्भ प्रमाण",
    generalExpl: "६. निष्कर्षांचे स्पष्टीकरण",
    questionsForDoctor: "७. डॉक्टरांना विचारण्यासारखे प्रश्न",

    wellnessTracker: "१. दैनंदिन आरोग्य ट्रॅकर",
    waterIntake: "पाण्याचे प्रमाण",
    todayReflection: "आजची आरोग्य नोंद आणि अनुभव:",
    medicationReminders: "२. औषधांची स्मरणपत्रे",
    appointmentReminders: "३. डॉक्टरांच्या भेटींचे स्मरणपत्र",
    aiWellnessTips: "४. एआय प्रतिबंधात्मक आरोग्य सल्ले",
    add: "जोडा",

    welcomeBack: "आयएमडी केअर मध्ये स्वागत आहे",
    loginSubtitle: "तुमची आरोग्य माहिती आणि स्मरणपत्रे जतन करण्यासाठी साइन इन करा",
    emailLabel: "ईमेल पत्ता",
    passwordLabel: "पासवर्ड",
    continueWithGoogle: "गुगलने पुढे जा (डेमो)",
    continueAsGuest: "पाहुणे म्हणून पुढे जा",
    switchProfile: "प्रोफाइल बदला",
  },
};
