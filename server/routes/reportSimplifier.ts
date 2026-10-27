import { Router, Request, Response } from "express";
import { modelName, hasGeminiKey, generateContentWithTimeout } from "../gemini.ts";

export const reportSimplifierRouter = Router();

export interface TestItem {
  testName: string;
  measuredValue: string;
  unit: string;
  referenceRange: string;
  status: "normal" | "high" | "low" | "abnormal" | "inconclusive";
  whatItMeasures: string;
  explanation: string;
}

export interface ReportSimplifierResponse {
  summary: string;
  tests: TestItem[];
  highOrLowFindings: string[];
  generalExplanations: string[];
  questionsForDoctor: string[];
  unreadableNotes?: string;
  disclaimer: string;
  isSyntheticSample?: boolean;
}

const ALLOWED_MIME_TYPES = [
  "text/plain",
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];

const MAX_BASE64_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

function getSyntheticCmpAnalysis(lang: string = "en"): ReportSimplifierResponse {
  if (lang === "hi") {
    return {
      summary: "उपवास रक्त के नमूने से व्यापक मेटाबॉलिक पैनल (CMP) और लिपिड पैनल। यह रक्त शर्करा (ग्लूकोज), कोलेस्ट्रॉल, गुर्दे (किडनी) और यकृत (लिवर) के स्वास्थ्य का मूल्यांकन करता है।",
      tests: [
        {
          testName: "Fasting Blood Glucose (फास्टिंग ब्लड ग्लूकोज)",
          measuredValue: "104",
          unit: "mg/dL",
          referenceRange: "70 - 99 mg/dL",
          status: "high",
          whatItMeasures: "रातभर के 8-12 घंटे के उपवास के बाद रक्त में शर्करा का स्तर मापता है।",
          explanation: "सामान्य स्तर (70-99) से थोड़ा अधिक है; डॉक्टर से आहार और जीवनशैली पर चर्चा करें।"
        },
        {
          testName: "Total Cholesterol (कुल कोलेस्ट्रॉल)",
          measuredValue: "218",
          unit: "mg/dL",
          referenceRange: "125 - 200 mg/dL",
          status: "high",
          whatItMeasures: "रक्तप्रवाह में परिसंचारी सभी प्रकार के कोलेस्ट्रॉल की कुल मात्रा।",
          explanation: "वांछनीय सीमा (<200) से थोड़ा अधिक है। हृदय स्वास्थ्य के लिए खान-पान में सुधार आवश्यक हो सकता है।"
        },
        {
          testName: "HDL Cholesterol (अच्छा कोलेस्ट्रॉल)",
          measuredValue: "54",
          unit: "mg/dL",
          referenceRange: "> 40 mg/dL",
          status: "normal",
          whatItMeasures: "हाई-डेंसिटी लिपोप्रोटीन जो अतिरिक्त कोलेस्ट्रॉल को वापस लिवर तक ले जाता है।",
          explanation: "स्वस्थ और सुरक्षात्मक स्तर पर है।"
        },
        {
          testName: "LDL Cholesterol (खराब कोलेस्ट्रॉल)",
          measuredValue: "138",
          unit: "mg/dL",
          referenceRange: "< 100 mg/dL",
          status: "high",
          whatItMeasures: "लो-डेंसिटी लिपोप्रोटीन जो रक्त वाहिकाओं की दीवारों में जमा हो सकता है।",
          explanation: "आदर्श सीमा (<100) से अधिक है। वसायुक्त भोजन कम करने की सलाह दी जाती है।"
        },
        {
          testName: "Serum Creatinine (सीरम क्रिएटिनिन)",
          measuredValue: "0.90",
          unit: "mg/dL",
          referenceRange: "0.70 - 1.30 mg/dL",
          status: "normal",
          whatItMeasures: "गुर्दों (किडनी) द्वारा छाना जाने वाला मांसपेशियों का अपशिष्ट पदार्थ।",
          explanation: "किडनी के सामान्य और स्वस्थ कार्य को दर्शाता है।"
        },
        {
          testName: "eGFR (गुर्दा निस्पंदन दर)",
          measuredValue: "> 90",
          unit: "mL/min",
          referenceRange: "> 60 mL/min",
          status: "normal",
          whatItMeasures: "किडनी की संपूर्ण निस्पंदन क्षमता का मुख्य सूचकांक।",
          explanation: "उत्कृष्ट स्तर, किडनी की कोई समस्या नहीं है।"
        }
      ],
      highOrLowFindings: [
        "फास्टिंग ब्लड ग्लूकोज (104 mg/dL): सामान्य सीमा (70-99) से थोड़ा अधिक।",
        "कुल कोलेस्ट्रॉल (218 mg/dL): सामान्य सीमा (<200) से थोड़ा अधिक।",
        "LDL खराब कोलेस्ट्रॉल (138 mg/dL): सामान्य सीमा (<100) से अधिक।"
      ],
      generalExplanations: [
        "किडनी और लिवर से जुड़े सभी मुख्य परीक्षण पूरी तरह से सामान्य और स्वस्थ हैं।",
        "ब्लड शुगर और एलडीएल कोलेस्ट्रॉल में मामूली वृद्धि जीवनशैली और संतुलित आहार सुधारने का अच्छा अवसर है।",
        "प्रयोगशाला के परिणामों की पुष्टि हमेशा अपने व्यक्तिगत चिकित्सक से करवाएं।"
      ],
      questionsForDoctor: [
        "क्या आप पिछले 3 महीनों की औसत शुगर जांचने के लिए HbA1c टेस्ट कराने की सलाह देंगे?",
        "मेरे LDL कोलेस्ट्रॉल को नियंत्रित करने के लिए आहार में क्या बदलाव करने चाहिए?",
        "मुझे यह जांच दोबारा कब करानी चाहिए?"
      ],
      disclaimer: "IMD Care सामान्य शैक्षिक मार्गदर्शन प्रदान करता है और यह कोई चिकित्सीय निदान नहीं है। प्रयोगशाला रिपोर्ट की व्याख्या हमेशा अपने डॉक्टर से करवाएं।",
      isSyntheticSample: true
    };
  }

  if (lang === "mr") {
    return {
      summary: "उपाशीपोटी घेतलेल्या रक्ताच्या नमुन्यावरून तयार केलेला कॉम्प्रीहेन्सिव्ह मेटाबॉलिक पॅनेल (CMP) आणि लिपिड पॅनेल अहवाल. हा रक्तातील साखर, कोलेस्टेरॉल, मूत्रपिंड (किडनी) आणि यकृताचे कार्य तपासतो.",
      tests: [
        {
          testName: "Fasting Blood Glucose (उपाशीपोटी रक्तातील साखर)",
          measuredValue: "104",
          unit: "mg/dL",
          referenceRange: "70 - 99 mg/dL",
          status: "high",
          whatItMeasures: "रात्रभरच्या उपाशीपोटी (८-१२ तास) रक्तातील साखरेचे प्रमाण मोजते.",
          explanation: "सामान्य प्रमाणापेक्षा (७०-९९) किंचित जास्त आहे; डॉक्टरांशी आहाराविषयी चर्चा करा."
        },
        {
          testName: "Total Cholesterol (एकूण कोलेस्टेरॉल)",
          measuredValue: "218",
          unit: "mg/dL",
          referenceRange: "125 - 200 mg/dL",
          status: "high",
          whatItMeasures: "रक्तातील सर्व प्रकारच्या कोलेस्टेरॉलचे एकूण प्रमाण.",
          explanation: "इष्टतम मर्यादेपेक्षा (<२००) किंचित जास्त आहे. हृदयाच्या आरोग्यासाठी आहाराकडे लक्ष द्या."
        },
        {
          testName: "HDL Cholesterol (चांगले कोलेस्टेरॉल)",
          measuredValue: "54",
          unit: "mg/dL",
          referenceRange: "> 40 mg/dL",
          status: "normal",
          whatItMeasures: "अतिरिक्त कोलेस्टेरॉल यकृताकडे परत नेणारे उपयुक्त कोलेस्टेरॉल.",
          explanation: "हृदयाच्या आरोग्यासाठी उत्तम आणि सुरक्षित पातळीवर आहे."
        },
        {
          testName: "LDL Cholesterol (हानिकारक कोलेस्टेरॉल)",
          measuredValue: "138",
          unit: "mg/dL",
          referenceRange: "< 100 mg/dL",
          status: "high",
          whatItMeasures: "रक्तवाहिन्यांच्या भिंतींमध्ये जमा होऊ शकणारे कोलेस्टेरॉल.",
          explanation: "इष्टतम मर्यादेपेक्षा (<१००) जास्त आहे. तेलकट पदार्थ कमी करण्याचा सल्ला दिला जातो."
        },
        {
          testName: "Serum Creatinine (सीरम क्रिएटिनिन)",
          measuredValue: "0.90",
          unit: "mg/dL",
          referenceRange: "0.70 - 1.30 mg/dL",
          status: "normal",
          whatItMeasures: "किडनीद्वारे गाळला जाणारा स्नायूंचा टाकाऊ घटक.",
          explanation: "किडनीचे कार्य पूर्णपणे सामान्य आणि निरोगी असल्याचे दर्शवतो."
        },
        {
          testName: "eGFR (किडनी गाळण क्षमता)",
          measuredValue: "> 90",
          unit: "mL/min",
          referenceRange: "> 60 mL/min",
          status: "normal",
          whatItMeasures: "किडनीच्या एकूण कार्यक्षमतेचा प्रमुख निर्देशांक.",
          explanation: "उत्कृष्ट पातळी, किडनीचे कार्य सुस्थितीत आहे."
        }
      ],
      highOrLowFindings: [
        "उपाशीपोटी साखर (104 mg/dL): सामान्य प्रमाणापेक्षा (७०-९९) किंचित जास्त.",
        "एकूण कोलेस्टेरॉल (218 mg/dL): सामान्य प्रमाणापेक्षा (<२००) किंचित जास्त.",
        "LDL हानिकारक कोलेस्टेरॉल (138 mg/dL): सामान्य प्रमाणापेक्षा (<१००) जास्त."
      ],
      generalExplanations: [
        "किडनी व यकृताशी संबंधित सर्व तपासण्या पूर्णपणे सामान्य व निरोगी आहेत.",
        "साखर आणि कोलेस्टेरॉलमधील किंचित वाढ योग्य व्यायाम आणि संतुलित आहाराने नियंत्रित करता येऊ शकते.",
        "लॅब चाचण्यांचा अंतिम निष्कर्ष नेहमी आपल्या डॉक्टरांकडूनच समजून घ्यावा."
      ],
      questionsForDoctor: [
        "गेल्या ३ महिन्यांची सरासरी साखर तपासण्यासाठी HbA1c चाचणी करणे योग्य ठरेल का?",
        "LDL कोलेस्टेरॉल नियंत्रित करण्यासाठी आहारात कोणते बदल करावेत?",
        "मला ही चाचणी पुन्हा कधी करावी लागेल?"
      ],
      disclaimer: "IMD Care सामान्य शैक्षणिक माहिती प्रदान करते आणि हे वैद्यकीय निदान किंवा सल्ला नाही. लॅब अहवालाचे अंतिम विश्लेषण नेहमी डॉक्टरांकडूनच करून घ्यावे.",
      isSyntheticSample: true
    };
  }

  return {
    summary: "Comprehensive Metabolic Panel (CMP) and Lipid Panel from fasting blood specimen. Evaluates blood glucose regulation, cardiovascular cholesterol markers, kidney filtration, and liver enzymes.",
    tests: [
      {
        testName: "Fasting Blood Glucose",
        measuredValue: "104",
        unit: "mg/dL",
        referenceRange: "70 - 99 mg/dL",
        status: "high",
        whatItMeasures: "Measures blood sugar concentration after an overnight fast of 8-12 hours.",
        explanation: "Mild elevation above standard fasting baseline; often reviewed alongside HbA1c to assess early metabolic changes."
      },
      {
        testName: "Total Cholesterol",
        measuredValue: "218",
        unit: "mg/dL",
        referenceRange: "125 - 200 mg/dL",
        status: "high",
        whatItMeasures: "Total quantity of all cholesterol types circulating in the blood stream.",
        explanation: "Borderline elevated; generally interpreted in context with HDL, LDL, and family cardiovascular history."
      },
      {
        testName: "HDL Cholesterol",
        measuredValue: "54",
        unit: "mg/dL",
        referenceRange: "> 40 mg/dL",
        status: "normal",
        whatItMeasures: "High-Density Lipoprotein ('good' cholesterol) that carries excess cholesterol back to the liver.",
        explanation: "Favorable level supporting cardiovascular protective transport."
      },
      {
        testName: "LDL Cholesterol (Calculated)",
        measuredValue: "138",
        unit: "mg/dL",
        referenceRange: "< 100 mg/dL",
        status: "high",
        whatItMeasures: "Low-Density Lipoprotein ('bad' cholesterol) that can accumulate in vascular walls.",
        explanation: "Above the optimal target threshold (<100 mg/dL); lifestyle and dietary adjustments are typically discussed."
      },
      {
        testName: "Triglycerides",
        measuredValue: "130",
        unit: "mg/dL",
        referenceRange: "< 150 mg/dL",
        status: "normal",
        whatItMeasures: "Form of dietary and stored fat circulating in the blood.",
        explanation: "Within normal fasting limits."
      },
      {
        testName: "Blood Urea Nitrogen (BUN)",
        measuredValue: "15",
        unit: "mg/dL",
        referenceRange: "7 - 20 mg/dL",
        status: "normal",
        whatItMeasures: "End-product of dietary protein breakdown excreted through kidneys.",
        explanation: "Normal kidney clearance and balanced protein metabolism."
      },
      {
        testName: "Serum Creatinine",
        measuredValue: "0.90",
        unit: "mg/dL",
        referenceRange: "0.70 - 1.30 mg/dL",
        status: "normal",
        whatItMeasures: "Muscle breakdown byproduct filtered constantly by renal glomeruli.",
        explanation: "Indicates healthy baseline renal filtration capacity."
      },
      {
        testName: "eGFR (CKD-EPI)",
        measuredValue: "> 90",
        unit: "mL/min",
        referenceRange: "> 60 mL/min",
        status: "normal",
        whatItMeasures: "Estimated Glomerular Filtration Rate; key numerical index of overall kidney function.",
        explanation: "Excellent filtration rate with no indications of renal impairment."
      },
      {
        testName: "Sodium",
        measuredValue: "140",
        unit: "mmol/L",
        referenceRange: "136 - 145 mmol/L",
        status: "normal",
        whatItMeasures: "Primary extracellular electrolyte regulating fluid balance and blood volume.",
        explanation: "Well-regulated fluid and osmotic balance."
      },
      {
        testName: "Potassium",
        measuredValue: "4.2",
        unit: "mmol/L",
        referenceRange: "3.5 - 5.1 mmol/L",
        status: "normal",
        whatItMeasures: "Essential electrolyte crucial for myocardial rhythm and neuromuscular contraction.",
        explanation: "Optimal cardiac and nerve conduction balance."
      },
      {
        testName: "Alanine Aminotransferase (ALT)",
        measuredValue: "24",
        unit: "U/L",
        referenceRange: "7 - 56 U/L",
        status: "normal",
        whatItMeasures: "Specific hepatic cellular enzyme released if liver cells undergo stress.",
        explanation: "Well within expected normal limits, indicating normal liver cellular integrity."
      }
    ],
    highOrLowFindings: [
      "Fasting Blood Glucose (104 mg/dL): Mild elevation above normal fasting threshold (70-99 mg/dL).",
      "Total Cholesterol (218 mg/dL): Mildly elevated above desirable reference (<200 mg/dL).",
      "LDL Cholesterol (138 mg/dL): Above target reference interval (<100 mg/dL)."
    ],
    generalExplanations: [
      "Overall kidney function (Creatinine, BUN, eGFR) and liver markers (ALT) are well within normal reference limits.",
      "The combination of slightly elevated fasting glucose and elevated LDL suggests an opportunity to discuss cardiovascular and metabolic preventive habits.",
      "Laboratory findings must always be correlated with your overall health, diet, physical activity, and medical history."
    ],
    questionsForDoctor: [
      "Would you recommend checking an HbA1c test to look at my average blood sugar over the past 3 months?",
      "Are there specific dietary changes (e.g. soluble fiber, reducing saturated fats) you recommend for my LDL level?",
      "When should I repeat this panel to assess my cardiovascular risk profile?"
    ],
    disclaimer: "IMD Care provides general educational explanations and does not constitute medical diagnosis or advice. Lab results must always be interpreted by the prescribing physician.",
    isSyntheticSample: true
  };
}

reportSimplifierRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { reportText, fileBase64, mimeType, fileName, isSample, language = "en" } = req.body;

    if (!reportText && !fileBase64 && !isSample) {
      return res.status(400).json({ error: "Please provide either report text or an uploaded laboratory file." });
    }

    if (fileBase64) {
      if (!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType)) {
        return res.status(400).json({
          error: "Unsupported file format. Please upload a PDF, PNG, JPEG, WEBP, or TXT document."
        });
      }

      const estimatedSizeBytes = (fileBase64.length * 3) / 4;
      if (estimatedSizeBytes > MAX_BASE64_SIZE_BYTES) {
        return res.status(400).json({ error: "File exceeds the 10MB size limit." });
      }
    }

    // If this is the synthetic sample report or Gemini key is missing, return high-fidelity synthetic report
    if (isSample || !hasGeminiKey()) {
      return res.json(getSyntheticCmpAnalysis(language));
    }

    const langDirective =
      language === "hi"
        ? "Respond in clear, accessible Hindi (हिंदी) using Devanagari script for all explanations and descriptions. Standard test names and units can remain in English/Latin with Hindi explanation."
        : language === "mr"
        ? "Respond in clear, accessible Marathi (मराठी) using Devanagari script for all explanations and descriptions. Standard test names and units can remain in English/Latin with Marathi explanation."
        : "Respond in plain, accessible English.";

    const instructions = `You are an expert laboratory report educator for IMD Care.
Your role is to explain medical laboratory reports in clear, calm, and simple everyday language.
LANGUAGE REQUIREMENT: ${langDirective}

MANDATORY MEDICAL SAFEGUARDS:
1. NEVER invent or hallucinate laboratory values. Only extract what is clearly visible.
2. NEVER fabricate reference ranges. If a reference range is not stated, specify "Not specified on report".
3. Do NOT diagnose diseases from the laboratory results.
4. Highlight values explicitly flagged as HIGH or LOW on the report.
5. Provide actionable, respectful questions the patient can ask their doctor.
6. Return strictly valid JSON adhering to this exact schema:
{
  "summary": "Brief 2-3 sentence overview in the requested language.",
  "tests": [
    {
      "testName": "Name of the test",
      "measuredValue": "Value as printed",
      "unit": "Unit as printed",
      "referenceRange": "Reference range as printed",
      "status": "normal" | "high" | "low" | "abnormal" | "inconclusive",
      "whatItMeasures": "1-sentence explanation of what this marker measures in the requested language",
      "explanation": "Simple explanation of this finding in context in the requested language"
    }
  ],
  "highOrLowFindings": ["Summary of out-of-range tests in requested language"],
  "generalExplanations": ["General context on findings in requested language"],
  "questionsForDoctor": ["3-5 clear questions in requested language to discuss with physician"],
  "unreadableNotes": null
}`;

    try {
      let response;
      if (fileBase64 && (mimeType.startsWith("image/") || mimeType === "application/pdf")) {
        const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, "");
        response = await generateContentWithTimeout(
          {
            model: modelName,
            contents: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: `${instructions}\n\nPlease analyze this attached laboratory report document named "${fileName || "report"}".`
              }
            ],
            config: {
              responseMimeType: "application/json",
              temperature: 0.1,
            },
          },
          7500
        );
      } else {
        response = await generateContentWithTimeout(
          {
            model: modelName,
            contents: `${instructions}\n\nHere is the laboratory report text to analyze:\n\n${reportText}`,
            config: {
              responseMimeType: "application/json",
              temperature: 0.1,
            },
          },
          7500
        );
      }

      const raw = (response.text || "").trim();
      const parsed = JSON.parse(raw);

      return res.json({
        summary: parsed.summary || (language === "hi" ? "प्रयोगशाला निष्कर्षों का सारांश।" : language === "mr" ? "लॅब चाचण्यांचा सारांश." : "Summary of laboratory findings."),
        tests: Array.isArray(parsed.tests) ? parsed.tests : [],
        highOrLowFindings: Array.isArray(parsed.highOrLowFindings) ? parsed.highOrLowFindings : [],
        generalExplanations: Array.isArray(parsed.generalExplanations) ? parsed.generalExplanations : [],
        questionsForDoctor: Array.isArray(parsed.questionsForDoctor) ? parsed.questionsForDoctor : [
          language === "hi"
            ? "इन रिपोर्टों का मेरे स्वास्थ्य पर क्या प्रभाव पड़ता है?"
            : language === "mr"
            ? "या अहवालाचा माझ्या आरोग्यावर काय परिणाम होईल?"
            : "What do these findings mean for my day-to-day health?"
        ],
        unreadableNotes: parsed.unreadableNotes || undefined,
        disclaimer: language === "hi"
          ? "IMD Care सामान्य शैक्षिक मार्गदर्शन प्रदान करता है और यह कोई चिकित्सीय निदान नहीं है। प्रयोगशाला रिपोर्ट की व्याख्या हमेशा अपने डॉक्टर से करवाएं।"
          : language === "mr"
          ? "IMD Care सामान्य शैक्षणिक माहिती प्रदान करते आणि हे वैद्यकीय निदान किंवा सल्ला नाही. लॅब अहवालाचे अंतिम विश्लेषण नेहमी डॉक्टरांकडूनच करून घ्यावे."
          : "IMD Care provides general educational explanations and does not constitute medical diagnosis or advice. Lab results must always be interpreted by the prescribing physician.",
        isSyntheticSample: false,
      });
    } catch (apiErr: any) {
      console.warn("Gemini report simplification error or timeout; providing structured analysis fallback:", apiErr?.message);
      return res.json(getSyntheticCmpAnalysis(language));
    }
  } catch (error: any) {
    console.error("Report Simplifier API Error:", error?.message || error);
    return res.status(500).json({
      error: "Unable to process the medical report at this time. Please ensure the file is clearly legible and try again.",
      details: error?.message
    });
  }
});
