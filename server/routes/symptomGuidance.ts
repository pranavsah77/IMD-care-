import { Router, Request, Response } from "express";
import { modelName, hasGeminiKey, generateContentWithTimeout } from "../gemini.ts";
import { checkEmergencyRedFlags } from "../safety.ts";

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
  additionalDetails?: string
): any {
  const symptomLower = mainSymptom.toLowerCase();

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

  if (symptomLower.includes("allergy") || symptomLower.includes("sneeze") || symptomLower.includes("itch")) {
    return {
      explanations: [
        "Often related to allergic rhinitis triggered by airborne allergens like tree/grass pollen, dust mites, or pet dander.",
        "Mild viral upper respiratory infections can initially present with similar mucosal irritation."
      ],
      selfCare: [
        "Rinse nasal passages with sterile saline spray or wash.",
        "Keep windows closed during high pollen counts and shower after prolonged outdoor exposure.",
        "Maintain indoor humidity around 40-50%."
      ],
      whenToContactDoctor: [
        "If symptoms linger longer than 10-14 days without improvement.",
        "If sinus facial pressure develops into localized sharp pain with colored discharge.",
        "If you suspect underlying asthma or chronic environmental allergies."
      ],
      warningSigns: [
        "Audible wheezing, chest tightness, or difficulty catching your breath.",
        "Swelling of the lips, tongue, or airway (anaphylaxis signs).",
        "High persistent fever or severe lethargy."
      ],
      summaryNote: "Symptoms match common allergic or mild upper airway irritation. Review with your doctor or allergist for tailored management."
    };
  }

  // Default general guidance
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
    const { ageGroup, mainSymptom, duration, severity, additionalDetails } = req.body;

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
    // If severe or matches emergency pattern, return immediately WITHOUT waiting for Gemini.
    const emergencyCheck = checkEmergencyRedFlags(combinedText);
    if (emergencyCheck.isEmergency || severity.toLowerCase().includes("critical") || severity.toLowerCase().includes("emergency")) {
      return res.json({
        isEmergency: true,
        emergencyDetails: emergencyCheck,
        explanations: [
          "The reported symptoms indicate a potential high-acuity or time-critical medical condition.",
          emergencyCheck.reason || "Immediate clinical assessment is mandatory to rule out acute complications."
        ],
        selfCare: [
          "Do NOT attempt home remedies or unverified self-treatment.",
          "Rest calmly and keep airway clear while waiting for emergency responders.",
          "If prescribed an emergency intervention (e.g., EpiPen or nitroglycerin), follow previous physician instructions."
        ],
        whenToContactDoctor: [
          "Immediate emergency care is required. Do not wait for a scheduled clinic visit."
        ],
        warningSigns: [
          "Chest pain, pressure, or shortness of breath",
          "Sudden loss of speech, facial symmetry, or motor control",
          "Severe persistent bleeding, vomiting blood, or sudden altered mental state"
        ],
        summaryNote: "EMERGENCY ALERT: This scenario presents critical warning signs. Contact emergency responders right away.",
        disclaimer: "IMD Care provides general health information and does not replace a qualified healthcare professional. This guidance is not a clinical triage."
      });
    }

    // Step 2: Try Gemini with timeout protection, fallback gracefully if unavailable
    let parsedResult: any = null;

    if (hasGeminiKey()) {
      try {
        const prompt = `You are a clinical decision support and health education model for IMD Care.
Evaluate the following user-submitted symptom information:
- Age Group: ${ageGroup}
- Main Symptom: ${mainSymptom}
- Duration: ${duration}
- Reported Severity: ${severity}
- Additional Details: ${additionalDetails || "None provided"}

STRICT MEDICAL & ETHICAL SAFEGUARDS:
1. DO NOT assign definitive diagnoses or percentage disease probabilities.
2. DO NOT prescribe or alter any prescription medications.
3. Provide general, educational explanations of what could commonly cause these symptoms in this age group.
4. Provide sensible, safe, non-medicinal or OTC self-care info where suitable (e.g. hydration, rest, ice/heat).
5. State clear criteria for when to contact a doctor.
6. Detail specific red-flag warning signs that would require emergency room evaluation.
7. Return strictly valid JSON matching this schema:
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

        const rawText = (response.text || "").trim();
        parsedResult = JSON.parse(rawText);
      } catch (geminiErr: any) {
        console.warn("Gemini call timed out or failed in symptom guidance; using educational fallback:", geminiErr?.message);
        parsedResult = getEducationalFallback(ageGroup, mainSymptom, duration, severity, additionalDetails);
      }
    } else {
      parsedResult = getEducationalFallback(ageGroup, mainSymptom, duration, severity, additionalDetails);
    }

    if (!parsedResult) {
      parsedResult = getEducationalFallback(ageGroup, mainSymptom, duration, severity, additionalDetails);
    }

    const finalResponse: SymptomGuidanceResponse = {
      isEmergency: false,
      explanations: Array.isArray(parsedResult.explanations) ? parsedResult.explanations : [],
      selfCare: Array.isArray(parsedResult.selfCare) ? parsedResult.selfCare : [],
      whenToContactDoctor: Array.isArray(parsedResult.whenToContactDoctor) ? parsedResult.whenToContactDoctor : [],
      warningSigns: Array.isArray(parsedResult.warningSigns) ? parsedResult.warningSigns : [],
      summaryNote: typeof parsedResult.summaryNote === "string" ? parsedResult.summaryNote : "Please review the recommended next steps and consult your physician.",
      disclaimer: "IMD Care provides general health information and does not replace a qualified healthcare professional. This guidance is for educational demonstration only."
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
