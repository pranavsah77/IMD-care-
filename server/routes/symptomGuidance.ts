import { Router, Request, Response } from "express";
import { modelName, hasGeminiKey, generateContentWithTimeout } from "../gemini.ts";
import { checkEmergencyRedFlags } from "../safety.ts";
import { addDiagnosticLog } from "../logger.ts";

export const symptomGuidanceRouter = Router();

export interface SymptomGuidanceResponse {
  isEmergency: boolean;
  emergencyDetails?: any;
  explanations: string[];
  selfCare: string[];
  whenToContactDoctor: string[];
  warningSigns: string[];
  summaryNote: string;
  disclaimer: string;
}

function getEducationalFallback(
  ageGroup: string,
  mainSymptom: string,
  duration: string,
  severity: string,
  additionalDetails?: string,
  lang: string = "en"
): any {
  const symptomLower = mainSymptom.toLowerCase();

  if (lang === "hi") {
    if (symptomLower.includes("headache") || symptomLower.includes("सिरदर्द")) {
      return {
        explanations: [
          "स्क्रीन के अत्यधिक उपयोग, आंखों की थकान या तनाव के कारण होने वाला सामान्य तनाव सिरदर्द (Tension Headache)।",
          "शरीर में पानी की कमी (डिहाइड्रेशन) या भोजन छोड़ने से भी सिर के दोनों किनारों पर दर्द हो सकता है।"
        ],
        selfCare: [
          "आंखों को आराम दें, 20-20-20 नियम का पालन करें और मंद रोशनी में विश्राम करें।",
          "तुरंत 1-2 गिलास पानी या तरल पेय पिएं।",
          "गर्दन और माथे पर हल्का ठंडा या गर्म सेंक करें।"
        ],
        whenToContactDoctor: [
          `यदि सिरदर्द ${duration} से अधिक समय तक लगातार बना रहे।`,
          "यदि उल्टी, चक्कर या आंखों के आगे धुंधलापन महसूस हो।",
          "यदि नियमित आराम से कोई राहत न मिल रही हो।"
        ],
        warningSigns: [
          "अचानक बिजली की तरह तेज असहनीय सिरदर्द (Thunderclap Headache)।",
          "गर्दन का अकड़ जाना और तेज बुखार।",
          "चेहरे या हाथ-पैर में सुन्नता या बोलने में परेशानी।"
        ],
        summaryNote: "स्क्रीन और तनाव से जुड़ा सिरदर्द सामान्य है, लेकिन यदि लक्षण बढ़ें तो डॉक्टर से परामर्श लें।"
      };
    }
    return {
      explanations: [
        `आपके द्वारा बताए गए लक्षण ("${mainSymptom}") सामान्यतः थकान, मौसम बदलाव या हल्के वायरल संक्रमण से जुड़े हो सकते हैं।`,
        "शारीरिक तनाव और अपर्याप्त पानी पीने से भी इस प्रकार के लक्षण उभर सकते हैं।"
      ],
      selfCare: [
        "पर्याप्त पानी पिएं और 7-8 घंटे की पूरी नींद लें।",
        "अत्यधिक श्रम से बचें और संतुलित हल्का आहार लें।",
        "लक्षणों के समय और गंभीरता की डायरी बनाएं।"
      ],
      whenToContactDoctor: [
        `यदि लक्षण ${duration} के बाद भी कम न हों या बढ़ते जाएं।`,
        "यदि रोजमर्रा के काम करने में कठिनाई होने लगे।",
        "यदि कोई अन्य नया लक्षण जैसे तेज बुखार उत्पन्न हो।"
      ],
      warningSigns: [
        "छाती में दर्द या सांस लेने में भारीपन।",
        "तेज बुखार, चक्कर आना या बेहोशी की स्थिति।",
        "अत्यधिक कमजोरी या सुन्नता।"
      ],
      summaryNote: "यह मार्गदर्शन सामान्य स्वास्थ्य शिक्षा हेतु है। व्यक्तिगत जांच के लिए अपने डॉक्टर से संपर्क करें।"
    };
  }

  if (lang === "mr") {
    if (symptomLower.includes("headache") || symptomLower.includes("डोकेदुखी")) {
      return {
        explanations: [
          "सतत स्क्रीन पाहिल्यामुळे डोळ्यांवर व मानेच्या स्नायूंवर आलेला ताण (Tension Headache).",
          "पाण्याची कमतरता (डिहायड्रेशन) किंवा उपाशी राहिल्यामुळे निर्माण झालेला थकवा."
        ],
        selfCare: [
          "शांत खोलीत डोळे मिटून विश्रांती घ्या आणि स्क्रीनपासून दूर राहा.",
          "१ ते २ ग्लास कोमट किंवा साधे पाणी प्या.",
          "कपाळावर आणि मानेवर हलका शेक द्या."
        ],
        whenToContactDoctor: [
          `डोकेदुखी ${duration} पेक्षा जास्त दिवस सतत चालू राहिल्यास.`,
          "उलटी, चक्कर किंवा अंधारी येत असल्यास.",
          "विश्रांती घेऊनही त्रास कमी न झाल्यास."
        ],
        warningSigns: [
          "अचानक विजेसारखी प्रचंड तीव्र डोकेदुखी सुरू होणे.",
          "मान ताठ होणे आणि सोबत प्रचंड ताप असणे.",
          "बोलताना अडखळणे किंवा शरीराची एक बाजू कमकुवत वाटणे."
        ],
        summaryNote: "तणाव व अपुऱ्या झोपेमुळे डोकेदुखी होऊ शकते; त्रास वाढल्यास वैद्यकीय तपासणी करून घ्या."
      };
    }
    return {
      explanations: [
        `नोंदवलेली लक्षणे ("${mainSymptom}") थकवा, हवामानातील बदल किंवा सौम्य संसर्गामुळे उद्भवू शकतात.`,
        "जीवनशैलीतील ताण आणि झोपेचा अभाव यामुळे शारीरिक अस्वस्थता वाढू शकते."
      ],
      selfCare: [
        "पुरेसे पाणी प्या आणि शांत झोप घ्या.",
        "पचायला हलके अन्न खा आणि कष्टाची कामे तात्पुरती टाळा.",
        "लक्षणे कधी वाढतात याची नोंद ठेवा."
      ],
      whenToContactDoctor: [
        `लक्षणे ${duration} नंतरही कमी न झाल्यास किंवा वाढत गेल्यास.`,
        "दैनिक कामांमध्ये व्यत्यय येत असल्यास.",
        "नवीन त्रास किंवा तीव्र ताप सुरू झाल्यास."
      ],
      warningSigns: [
        "छातीत वेदना किंवा श्वास घेण्यास त्रास होणे.",
        "अंधारी येणे, तोल जाणे किंवा बेशुद्ध पडणे.",
        "तीव्र असह्य वेदना."
      ],
      summaryNote: "हे मार्गदर्शन केवळ प्राथमिक माहितीसाठी आहे. उपचारांसाठी डॉक्टरांचा सल्ला घ्या."
    };
  }

  // English default
  if (symptomLower.includes("headache")) {
    return {
      explanations: [
        "Common benign causes include tension headaches from screen glare or neck fatigue, mild dehydration, or lack of rest.",
        "Caffeine fluctuations, stress, or skipped meals can also provoke vascular and muscular tension around the temples."
      ],
      selfCare: [
        "Rest your eyes in a dim, quiet room and practice the 20-20-20 screen rule.",
        "Hydrate with 300-500ml of water or cool fluids.",
        "Apply a gentle warm or cool compress to forehead and neck muscles."
      ],
      whenToContactDoctor: [
        `If the headache persists beyond ${duration} or increases progressively in severity.`,
        "If regular over-the-counter self-care does not provide any relief.",
        "If accompanied by nausea, vision disturbances, or sensitivity to light."
      ],
      warningSigns: [
        "Sudden 'thunderclap' onset reaching peak intensity in seconds.",
        "Headache accompanied by stiff neck, high fever, or confusion.",
        "Focal neurological symptoms such as facial weakness or slurred speech."
      ],
      summaryNote: "Headaches associated with screen fatigue and stress are common, but persistent or severe symptoms warrant clinical consultation."
    };
  }

  return {
    explanations: [
      `Symptoms reported ("${mainSymptom}") in this age demographic (${ageGroup}) may arise from routine physiological fatigue, mild viral exposure, or environmental strain.`,
      "Variability in sleep, nutrition, and daily physical activity frequently impacts baseline comfort."
    ],
    selfCare: [
      "Ensure adequate hydration and prioritize 7 to 9 hours of uninterrupted rest.",
      "Engage in gentle pacing and avoid strenuous exertion while symptoms are active.",
      "Record symptom frequency, time of day, and potential triggers in a diary."
    ],
    whenToContactDoctor: [
      `If symptoms continue past ${duration} or gradually worsen in intensity.`,
      "If daily functioning, appetite, or restful sleep become disrupted.",
      "If you have preexisting medical conditions that could be aggravated."
    ],
    warningSigns: [
      "Sudden high fever, severe unremitting pain, or unexplained breathlessness.",
      "Confusion, persistent dizziness, fainting, or altered speech.",
      "Uncontrolled fluid loss or signs of systemic distress."
    ],
    summaryNote: "Guidance reflects general health literacy. Please follow up with your healthcare provider for an individualized assessment."
  };
}

symptomGuidanceRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { ageGroup, mainSymptom, duration, severity, additionalDetails, language } = req.body;
    const selectedLang = language === "hi" || language === "mr" ? language : "en";

    // Validation
    if (!mainSymptom || typeof mainSymptom !== "string" || !mainSymptom.trim()) {
      return res.status(400).json({ error: "Main symptom is required." });
    }

    if (!ageGroup || typeof ageGroup !== "string") {
      return res.status(400).json({ error: "Age group is required." });
    }

    if (!duration || typeof duration !== "string") {
      return res.status(400).json({ error: "Duration of symptoms is required." });
    }

    if (!severity || typeof severity !== "string") {
      return res.status(400).json({ error: "Severity rating is required." });
    }

    const combinedText = `${mainSymptom} ${additionalDetails || ""}`;

    // Step 1: Immediate Deterministic Safety Red-Flag Check
    const emergencyCheck = checkEmergencyRedFlags(combinedText);
    if (emergencyCheck.isEmergency || severity.toLowerCase().includes("critical") || severity.toLowerCase().includes("emergency")) {
      addDiagnosticLog("warn", "safety", `Deterministic red flag in symptom assessment: "${mainSymptom}"`, emergencyCheck);

      const isHi = selectedLang === "hi";
      const isMr = selectedLang === "mr";

      return res.json({
        isEmergency: true,
        emergencyDetails: emergencyCheck,
        explanations: isHi
          ? [
              "बताए गए लक्षण गंभीर एवं आपातकालीन चिकित्सीय स्थिति का संकेत देते हैं।",
              emergencyCheck.reason || "जटिलताओं से बचाव के लिए तुरंत अस्पताल में जांच आवश्यक है।"
            ]
          : isMr
          ? [
              "नोंदवलेली लक्षणे तातडीच्या आणि गंभीर वैद्यकीय समस्येचे संकेत देतात.",
              emergencyCheck.reason || "गुंतागुंत टाळण्यासाठी त्वरित दवाखान्यात जाणे आवश्यक आहे."
            ]
          : [
              "The reported symptoms indicate a potential high-acuity or time-critical medical condition.",
              emergencyCheck.reason || "Immediate clinical assessment is mandatory to rule out acute complications."
            ],
        selfCare: isHi
          ? [
              "घरेलू उपचार या दवाओं का प्रयोग बिल्कुल न करें।",
              "एम्बुलेंस आने तक शांत होकर विश्राम करें और सांस का रास्ता खुला रखें।",
              "यदि डॉक्टर द्वारा आपातकालीन दवाई (जैसे EpiPen) दी गई हो, तो निर्देशों का पालन करें।"
            ]
          : isMr
          ? [
              "कोणतेही घरगुती उपचार करण्याचा प्रयत्न करू नका.",
              "मदत येईपर्यंत शांत पडून राहा आणि श्वसनमार्ग मोकळा ठेवा.",
              "डॉक्टरांनी आपत्कालीन औषध सुचवले असल्यास ते नियमानुसार वापरा."
            ]
          : [
              "Do NOT attempt home remedies or unverified self-treatment.",
              "Rest calmly and keep airway clear while waiting for emergency responders.",
              "If prescribed an emergency intervention (e.g., EpiPen or nitroglycerin), follow previous physician instructions."
            ],
        whenToContactDoctor: isHi
          ? ["तुरंत आपातकालीन चिकित्सा लें (कॉल 112 / 108 / 911)। सामान्य ओपीडी की प्रतीक्षा न करें।"]
          : isMr
          ? ["तातडीने आपत्कालीन कक्षाशी संपर्क साधा (112 / 108 / 911 डायल करा). नियमित भेटीची वाट पाहू नका."]
          : ["Immediate emergency care is required. Do not wait for a scheduled clinic visit."],
        warningSigns: isHi
          ? [
              "छाती में दबाव, दर्द या सांस फूलना",
              "चेहरे या हाथ का सुन्न पड़ना, बोलने में लड़खड़ाहट",
              "अत्यधिक रक्तस्त्राव, खून की उल्टी या बेहोशी"
            ]
          : isMr
          ? [
              "छातीत दाब किंवा श्वास घेण्यास अडचण",
              "चेहऱ्याची किंवा हाताची ताकद कमी होणे, बोलता न येणे",
              "तीव्र रक्तस्त्राव किंवा बेशुद्ध पडणे"
            ]
          : [
              "Chest pain, pressure, or shortness of breath",
              "Sudden loss of speech, facial symmetry, or motor control",
              "Severe persistent bleeding, vomiting blood, or sudden altered mental state"
            ],
        summaryNote: isHi
          ? "आपातकालीन चेतावनी: ये लक्षण अतिगंभीर हैं। कृपया तुरंत 112 / 108 / 911 पर संपर्क करें।"
          : isMr
          ? "आपत्कालीन इशारा: ही लक्षणे गंभीर आहेत. कृपया त्वरित 112 / 108 / 911 वर कॉल करा."
          : "EMERGENCY ALERT: This scenario presents critical warning signs. Contact emergency responders right away.",
        disclaimer: isHi
          ? "आईएमडी केयर केवल सामान्य स्वास्थ्य जानकारी प्रदान करता है और चिकित्सक का विकल्प नहीं है।"
          : isMr
          ? "आयएमडी केअर केवळ माहितीसाठी आहे आणि डॉक्टरांचा पर्याय नाही."
          : "IMD Care provides general health information and does not replace a qualified healthcare professional. This guidance is not a clinical triage."
      });
    }

    // Step 2: Query Gemini or Educational Fallback with language instructions
    let parsedResult: any = null;

    if (hasGeminiKey()) {
      try {
        const langRule = selectedLang === "hi"
          ? "MANDATORY: Return all explanations, selfCare, whenToContactDoctor, warningSigns, and summaryNote entirely in natural, respectful Hindi (हिन्दी) using Devanagari script."
          : selectedLang === "mr"
          ? "MANDATORY: Return all explanations, selfCare, whenToContactDoctor, warningSigns, and summaryNote entirely in natural, respectful Marathi (मराठी) using Devanagari script."
          : "Return all text in English.";

        const prompt = `You are a clinical decision support and health education model for IMD Care.
Evaluate the following user-submitted symptom information:
- Age Group: ${ageGroup}
- Main Symptom: ${mainSymptom}
- Duration: ${duration}
- Reported Severity: ${severity}
- Additional Details: ${additionalDetails || "None provided"}
- Language: ${selectedLang}

STRICT MEDICAL & ETHICAL SAFEGUARDS:
1. DO NOT assign definitive diagnoses or percentage disease probabilities.
2. DO NOT prescribe or alter any prescription medications.
3. Provide general, educational explanations of what could commonly cause these symptoms in this age group.
4. Provide sensible, safe, non-medicinal or OTC self-care info where suitable.
5. State clear criteria for when to contact a doctor.
6. Detail specific red-flag warning signs that would require emergency room evaluation.
7. ${langRule}
8. Return strictly valid JSON matching this schema:
{
  "explanations": ["item 1", "item 2"],
  "selfCare": ["item 1", "item 2"],
  "whenToContactDoctor": ["item 1", "item 2"],
  "warningSigns": ["item 1", "item 2"],
  "summaryNote": "A 2-3 sentence neutral, calm summary of next steps."
}`;

        const response = await generateContentWithTimeout(
          {
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          },
          7000
        );

        const rawText = (response?.text || "").trim();
        parsedResult = JSON.parse(rawText);
      } catch (geminiErr: any) {
        console.warn("Gemini call timed out or failed in symptom guidance; using educational fallback:", geminiErr?.message);
        parsedResult = getEducationalFallback(ageGroup, mainSymptom, duration, severity, additionalDetails, selectedLang);
      }
    } else {
      parsedResult = getEducationalFallback(ageGroup, mainSymptom, duration, severity, additionalDetails, selectedLang);
    }

    if (!parsedResult) {
      parsedResult = getEducationalFallback(ageGroup, mainSymptom, duration, severity, additionalDetails, selectedLang);
    }

    const finalResponse: SymptomGuidanceResponse = {
      isEmergency: false,
      explanations: Array.isArray(parsedResult.explanations) ? parsedResult.explanations : [],
      selfCare: Array.isArray(parsedResult.selfCare) ? parsedResult.selfCare : [],
      whenToContactDoctor: Array.isArray(parsedResult.whenToContactDoctor) ? parsedResult.whenToContactDoctor : [],
      warningSigns: Array.isArray(parsedResult.warningSigns) ? parsedResult.warningSigns : [],
      summaryNote: typeof parsedResult.summaryNote === "string" ? parsedResult.summaryNote : "Please review the recommended next steps and consult your physician.",
      disclaimer: selectedLang === "hi"
        ? "आईएमडी केयर सामान्य स्वास्थ्य जानकारी प्रदान करता है और चिकित्सक का विकल्प नहीं है।"
        : selectedLang === "mr"
        ? "आयएमडी केअर केवळ सामान्य माहितीसाठी आहे आणि डॉक्टरांचा पर्याय नाही."
        : "IMD Care provides general health information and does not replace a qualified healthcare professional. This guidance is for educational demonstration only."
    };

    return res.json(finalResponse);
  } catch (error: any) {
    console.error("Symptom Guidance API Error:", error?.message || error);
    return res.status(500).json({
      error: "Unable to process symptom guidance at this moment. If you are experiencing severe symptoms, please seek immediate medical care.",
      details: error?.message
    });
  }
});
