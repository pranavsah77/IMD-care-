import { Router, Request, Response } from "express";
import { modelName, hasGeminiKey, generateContentWithTimeout } from "../gemini.ts";
import { checkEmergencyRedFlags } from "../safety.ts";
import { addDiagnosticLog } from "../logger.ts";

export const healthAssistantRouter = Router();

const SYSTEM_INSTRUCTION_BASE = `You are IMD Care AI Health Assistant, a compassionate, accurate, and responsible healthcare education assistant.
Your mission is to help users understand health concepts, anatomy, symptoms, wellness, and medical terminology in simple, calm, accessible terms.

CRITICAL HEALTHCARE SAFETY & BEHAVIORAL RULES:
1. NEVER provide definitive diagnoses (e.g., do not say "You have bronchitis"). Instead say "Symptoms like these can sometimes be associated with...".
2. NEVER prescribe medications, calculate medical drug dosages, or recommend altering prescribed treatments.
3. ALWAYS emphasize consulting a doctor, nurse practitioner, or qualified clinician for personal medical care.
4. If symptoms sound concerning or ambiguous, explicitly advise seeking medical evaluation.
5. If the user mentions severe red flags, advise immediate emergency care (911 / 112 / 108).
6. Be concise, well-structured (use bullet points and short paragraphs), reassuring, and free of medical jargon without being condescending.
7. Always append or maintain the ethos: "IMD Care provides general health information and does not replace a qualified healthcare professional."`;

function getFallbackHealthResponse(question: string, lang: string = "en"): string {
  const q = question.toLowerCase();

  if (lang === "hi") {
    if (q.includes("blood pressure") || q.includes("रक्तचाप") || q.includes("बीपी")) {
      return `**रक्तचाप (Blood Pressure) को समझें:**\n\n• **यह क्या है:** रक्तचाप वह दबाव है जो धमनियों की दीवारों पर रक्त संचार के दौरान पड़ता है।\n• **दो मुख्य संख्याएं:**\n  - **सिस्टोलिक (ऊपर की संख्या):** जब हृदय धड़कता है और रक्त पंप करता है।\n  - **डायस्टोलिक (नीचे की संख्या):** जब धड़कनों के बीच हृदय आराम करता है।\n• **सामान्य स्तर:** वयस्कों के लिए लगभग 120/80 mmHg सामान्य माना जाता है।\n\n*नोट: यह केवल सामान्य जानकारी है। व्यक्तिगत स्वास्थ्य के लिए अपने चिकित्सक से संपर्क करें।*`;
    }
    if (q.includes("dehydration") || q.includes("पानी की कमी") || q.includes("निर्जलीकरण")) {
      return `**डिहाइड्रेशन (पानी की कमी):**\n\n• **सरल शब्दों में:** जब शरीर में जितना पानी जा रहा है उससे अधिक निकल जाए, तो डिहाइड्रेशन होता है।\n• **लक्षण:** अत्यधिक प्यास, गहरे रंग का मूत्र, सिर में भारीपन, थकान और मुंह का सूखना।\n• **घरेलू देखभाल:** दिनभर थोड़ा-थोड़ा पानी पिएं, नारियल पानी या ओआरएस का उपयोग करें।\n\n*चक्कर आना या बेहोशी होने पर तुरंत डॉक्टर को दिखाएं।*`;
    }
    if (q.includes("headache") || q.includes("सिरदर्द")) {
      return `**सिरदर्द के सामान्य कारण:**\n\n• **तनाव व थकान:** अधिक स्क्रीन समय या गर्दन की मांसपेशियों में खिंचाव।\n• **पानी की कमी:** पर्याप्त पानी न पीना या समय पर भोजन न करना।\n• **नींद की कमी:** अनियमित दिनचर्या या तनाव।\n\n*⚠️ चेतावनी: यदि सिर में अचानक असह्य तेज दर्द हो, गर्दन अकड़ जाए या बुखार हो, तो तत्काल आपातकालीन सहायता लें।*`;
    }
    return `आपके प्रश्न **"${question}"** के संदर्भ में:\n\n• संतुलित खानपान, पर्याप्त जल सेवन और 7-8 घंटे की गहरी नींद स्वास्थ्य के आधार स्तंभ हैं।\n• यदि आपके लक्षण 2-3 दिन से अधिक समय तक बने रहते हैं, तो डॉक्टर से सलाह लेना सबसे उचित है।\n\n*आईएमडी केयर केवल स्वास्थ्य शिक्षा प्रदान करता है और प्रत्यक्ष डॉक्टरी सलाह का विकल्प नहीं है।*`;
  }

  if (lang === "mr") {
    if (q.includes("blood pressure") || q.includes("रक्तदाब") || q.includes("बीपी")) {
      return `**रक्तदाब (Blood Pressure) सोप्या भाषेत:**\n\n• **रक्तदाब म्हणजे काय:** हृदय जेव्हा शरीरात रक्त पंप करते, तेव्हा रक्तवाहिन्यांवर पडणाऱ्या दाबाला रक्तदाब म्हणतात.\n• **दोन मुख्य आकडे:**\n  - **सिस्टॉलिक (वरचा आकडा):** हृदय आकुंचन पावताना निर्माण होणारा दाब.\n  - **डायस्टॉलिक (खालचा आकडा):** हृदयाच्या दोन ठोक्यांमधील विश्रांतीच्या वेळेसचा दाब.\n• **सामान्य मर्यादा:** प्रौढांसाठी साधारण 120/80 mmHg ही निरोगी मर्यादा मानली जाते.\n\n*टीप: ही माहिती केवळ आरोग्याच्या शिक्षणासाठी आहे. प्रत्यक्ष सल्ल्यासाठी डॉक्टरांना भेटा.*`;
    }
    if (q.includes("dehydration") || q.includes("पाण्याची कमतरता") || q.includes("डिहायड्रेशन")) {
      return `**डिहायड्रेशन (पाण्याची कमतरता):**\n\n• **सोप्या भाषेत:** शरीरातील पाण्याचे प्रमाण गरजेपेक्षा कमी झाल्यास पेशींचे कार्य मंदावते.\n• **लक्षणे:** तीव्र तहान, गडद पिवळी लघवी, कोरडी जीभ आणि थकवा.\n• **काळजी:** दर अर्ध्या तासाने घोट घोट पाणी प्या, लिंबू पाणी किंवा ताक घ्या.\n\n*तीव्र चक्कर किंवा अशक्तपणा जाणवल्यास त्वरित वैद्यकीय मदत घ्या.*`;
    }
    if (q.includes("headache") || q.includes("डोकेदुखी")) {
      return `**डोकेदुखीची सामान्य कारणे:**\n\n• **स्क्रीनचा ताण:** सतत कॉम्प्युटर किंवा मोबाईल पाहिल्याने डोळ्यांवर व मानेवर येणारा ताण.\n• **अपुरी झोप किंवा उपवास:** वेळेवर जेवण न करणे आणि झोपेचा अभाव.\n• **मानसिक ताण:** कामाचा किंवा दैनंदिन ताण.\n\n*⚠️ चेतावणी: अचानक प्रचंड तीव्र डोकेदुखी किंवा ताप असल्यास त्वरित डॉक्टरांकडे जा.*`;
    }
    return `तुमच्या प्रश्न **"${question}"** बाबत:\n\n• पुरेसे पाणी पिणे, वेळेवर झोपणे आणि हलका व्यायाम यामुळे आरोग्य उत्तम राहते.\n• त्रास वाढल्यास किंवा अनेक दिवस राहिल्यास वैद्यकीय तपासणी करून घेणे आवश्यक आहे.\n\n*आयएमडी केअर केवळ सामान्य मार्गदर्शनासाठी आहे. प्रत्यक्ष उपचारांसाठी डॉक्टरांचा सल्ला घ्या.*`;
  }

  // English fallback
  if (q.includes("blood pressure")) {
    return `**Understanding Blood Pressure:**\n\n• **What it is:** Blood pressure is the force of circulating blood against the walls of the arteries as your heart pumps it around the body.\n• **The Two Numbers:**\n  - **Systolic (top number):** Measures pressure when the heart beats.\n  - **Diastolic (bottom number):** Measures pressure when the heart rests between beats.\n• **General Guidelines:** A typical healthy reading for many adults is around 120/80 mmHg, though individual targets vary with age and medical history.\n\n*Note: This information is for health literacy. For personalized cardiovascular evaluation, consult your primary care doctor.*`;
  }

  if (q.includes("dehydration")) {
    return `**Understanding Dehydration:**\n\n• **In Simple Terms:** Dehydration occurs when your body loses more fluids and electrolytes than you take in, preventing cells from functioning normally.\n• **Early Signs:** Thirst, darker yellow urine, dry lips or mouth, mild fatigue, and slight lightheadedness upon standing quickly.\n• **Simple Self-Care:** Sip water steadily, avoid excessive heat exposure, and incorporate electrolyte-rich broths or coconut water after intense sweating.\n\n*If someone develops confusion, inability to keep fluids down, or fainting, seek urgent medical attention.*`;
  }

  if (q.includes("headache")) {
    return `**Common Causes of Headaches:**\n\n• **Tension & Posture:** Muscle strain from prolonged screen use, poor neck ergonomics, or psychological stress.\n• **Hydration & Nutrition:** Inadequate fluid intake or skipping meals (low blood sugar).\n• **Sleep Disruption:** Irregular sleep schedules, lack of deep rest, or caffeine withdrawal.\n• **Environmental Factors:** Bright glare, loud noise, or weather shifts.\n\n*⚠️ Warning: A sudden severe "thunderclap" headache, or headache with high fever, stiff neck, or numbness requires immediate emergency room care.*`;
  }

  if (q.includes("sleep")) {
    return `**Healthy Sleep Hygiene Strategies:**\n\n• **Consistent Rhythm:** Go to sleep and wake up at approximately the same time daily, even on weekends.\n• **Screen Curfew:** Dim ambient lighting and power down phones/laptops 30-60 minutes before bed to allow natural melatonin release.\n• **Cool, Dark Environment:** Keep the bedroom quiet and around 65-68°F (18-20°C).\n• **Caffeine Timing:** Limit coffee or caffeinated teas 6 to 8 hours before bedtime.\n\n*Discuss chronic insomnia or loud snoring/gasping with a healthcare professional to rule out sleep apnea.*`;
  }

  return `Thank you for your question about **"${question}"**.\n\n**Educational Summary:**\n• General wellness and physical balance depend on staying hydrated, maintaining consistent rest, and managing daily stress.\n• If you are experiencing persistent or unusual physical symptoms, keeping a daily symptom log can be very useful for your physician.\n\n*IMD Care provides general educational information and cannot provide personal medical diagnoses. Please consult a qualified clinician for personal health recommendations.*`;
}

healthAssistantRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory, language } = req.body;
    const selectedLang = language === "hi" || language === "mr" ? language : "en";

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message cannot be empty." });
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length > 2000) {
      return res.status(400).json({ error: "Message exceeds maximum length of 2000 characters." });
    }

    // Step 1: Deterministic emergency check
    const emergencyCheck = checkEmergencyRedFlags(trimmedMessage);
    if (emergencyCheck.isEmergency) {
      addDiagnosticLog("warn", "safety", `Deterministic emergency triggered for query: "${trimmedMessage.slice(0, 50)}..."`, emergencyCheck);
      const isHi = selectedLang === "hi";
      const isMr = selectedLang === "mr";

      const urgentPrefix = isHi
        ? "⚠️ **तत्काल चिकित्सीय सूचना**:"
        : isMr
        ? "⚠️ **तातडीची वैद्यकीय सूचना**:"
        : "⚠️ **URGENT MEDICAL NOTICE**:";

      const actionText = isHi
        ? "कृपया तुरंत आपातकालीन सेवाओं (112 / 108 / 911) को कॉल करें या निकटतम आपातकालीन कक्ष में जाएं।"
        : isMr
        ? "कृपया त्वरित आपत्कालीन सेवा (112 / 108 / 911) शी संपर्क साधा किंवा जवळच्या रुग्णालयात जा."
        : emergencyCheck.actionRequired;

      return res.json({
        reply: `${urgentPrefix}\n\n${emergencyCheck.reason}\n\n**Action Required / आवश्यक पावले:**\n${actionText}\n\n**Emergency Contacts / संपर्क:**\n• India / भारत: 112 / 108\n• US / Canada: 911\n• Crisis Lifeline: 988 / 14416 (Tele-MANAS)\n\nPlease seek professional emergency care immediately.`,
        isEmergency: true,
        emergencyDetails: emergencyCheck,
        disclaimer: isHi
          ? "आईएमडी केयर केवल सामान्य जानकारी प्रदान करता है और चिकित्सक का विकल्प नहीं है।"
          : isMr
          ? "आयएमडी केअर केवळ माहितीसाठी आहे आणि डॉक्टरांचा पर्याय नाही."
          : "IMD Care provides general health information and does not replace a qualified healthcare professional."
      });
    }

    // Step 2: Check Gemini availability
    if (!hasGeminiKey()) {
      addDiagnosticLog("info", "api", `No Gemini key; served ${selectedLang} educational fallback for assistant query.`);
      return res.json({
        reply: getFallbackHealthResponse(trimmedMessage, selectedLang),
        isEmergency: false,
        disclaimer: "IMD Care provides general health information and does not replace a qualified healthcare professional."
      });
    }

    // Step 3: Format conversation for Gemini with language instruction
    const langInstruction = selectedLang === "hi"
      ? "\n8. IMPORTANT: The user has selected Hindi (हिन्दी). Provide your response completely in fluent, respectful, grammatically natural Hindi using Devanagari script."
      : selectedLang === "mr"
      ? "\n8. IMPORTANT: The user has selected Marathi (मराठी). Provide your response completely in fluent, respectful, grammatically natural Marathi using Devanagari script."
      : "";

    let promptContents: string[] = [];
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-4).map((item: any) => {
        const role = item.role === "user" ? "User" : "Assistant";
        return `${role}: ${String(item.content || "").slice(0, 400)}`;
      });
      promptContents.push("Previous Conversation:\n" + recentHistory.join("\n"));
    }
    promptContents.push(`User Question: ${trimmedMessage}`);

    try {
      const response = await generateContentWithTimeout(
        {
          model: modelName,
          contents: promptContents.join("\n\n"),
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_BASE + langInstruction,
            temperature: 0.4,
          },
        },
        7000
      );

      const reply = response?.text || getFallbackHealthResponse(trimmedMessage, selectedLang);

      return res.json({
        reply,
        isEmergency: false,
        disclaimer: "IMD Care provides general health information and does not replace a qualified healthcare professional."
      });
    } catch (apiErr: any) {
      console.warn("Gemini call timed out or failed; providing educational response:", apiErr?.message);
      return res.json({
        reply: getFallbackHealthResponse(trimmedMessage, selectedLang),
        isEmergency: false,
        disclaimer: "IMD Care provides general health information and does not replace a qualified healthcare professional."
      });
    }
  } catch (error: any) {
    console.error("Health Assistant API Error:", error?.message || error);
    return res.status(500).json({
      error: "Unable to process your request at this time. Please try again shortly or contact a healthcare provider.",
      details: error?.message
    });
  }
});
