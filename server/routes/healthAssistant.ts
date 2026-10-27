import { Router, Request, Response } from "express";
import { modelName, hasGeminiKey, generateContentWithTimeout } from "../gemini.ts";
import { checkEmergencyRedFlags } from "../safety.ts";

export const healthAssistantRouter = Router();

const SYSTEM_INSTRUCTION = `You are IMD Care AI Health Assistant, a compassionate, accurate, and responsible healthcare education assistant.
Your mission is to help users understand health concepts, anatomy, symptoms, wellness, and medical terminology in simple, calm, accessible terms.

CRITICAL HEALTHCARE SAFETY & BEHAVIORAL RULES:
1. NEVER provide definitive diagnoses (e.g., do not say "You have bronchitis"). Instead say "Symptoms like these can sometimes be associated with...".
2. NEVER prescribe medications, calculate medical drug dosages, or recommend altering prescribed treatments.
3. ALWAYS emphasize consulting a doctor, nurse practitioner, or qualified clinician for personal medical care.
4. If symptoms sound concerning or ambiguous, explicitly advise seeking medical evaluation.
5. If the user mentions severe red flags, advise immediate emergency care (911/112).
6. Be concise, well-structured (use bullet points and short paragraphs), reassuring, and free of medical jargon without being condescending.
7. Always append or maintain the ethos: "IMD Care provides general health information and does not replace a qualified healthcare professional."`;

// Curated educational explanations for common queries if API call times out
function getFallbackHealthResponse(question: string): string {
  const q = question.toLowerCase();

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
    const { message, conversationHistory } = req.body;

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
      return res.json({
        reply: `⚠️ **URGENT MEDICAL NOTICE**:\n\nBased on your description ("${emergencyCheck.reason}"), this situation may require immediate emergency attention.\n\n**Action Required:**\n${emergencyCheck.actionRequired}\n\n**Emergency Hotlines:**\n${emergencyCheck.emergencyContacts?.join("\n")}\n\nPlease do not delay seeking professional emergency care.`,
        isEmergency: true,
        emergencyDetails: emergencyCheck,
        disclaimer: "IMD Care provides general health information and does not replace a qualified healthcare professional."
      });
    }

    // Step 2: Check Gemini availability
    if (!hasGeminiKey()) {
      return res.json({
        reply: getFallbackHealthResponse(trimmedMessage),
        isEmergency: false,
        disclaimer: "IMD Care provides general health information and does not replace a qualified healthcare professional."
      });
    }

    // Step 3: Format conversation for Gemini with timeout protection
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
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.4,
          },
        },
        7000
      );

      const reply = response.text || getFallbackHealthResponse(trimmedMessage);

      return res.json({
        reply,
        isEmergency: false,
        disclaimer: "IMD Care provides general health information and does not replace a qualified healthcare professional."
      });
    } catch (apiErr: any) {
      console.warn("Gemini call timed out or failed; providing educational response:", apiErr?.message);
      return res.json({
        reply: getFallbackHealthResponse(trimmedMessage),
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
