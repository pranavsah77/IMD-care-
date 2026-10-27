import { Router, Request, Response } from "express";
import { modelName, hasGeminiKey, generateContentWithTimeout } from "../gemini.ts";

export const wellnessTipsRouter = Router();

function getCategorizedTips(category: string, lang: string = "en"): any[] {
  const cat = category.toLowerCase();

  if (lang === "hi") {
    if (cat === "hydration") {
      return [
        {
          title: "सुबह का जल नियम",
          advice: "जागने के तुरंत बाद एक गिलास गुनगुना या सामान्य पानी पिएं ताकि पाचन तंत्र और चयापचय सक्रिय हो सके।",
          category: "hydration"
        },
        {
          title: "घूंट-घूंट कर पानी पिएं",
          advice: "दिन भर में लगातार घूंट-घूंट कर पानी पीना एक साथ बहुत अधिक पानी पीने से अधिक लाभकारी होता है।",
          category: "hydration"
        },
        {
          title: "प्राकृतिक इलेक्ट्रोलाइट्स",
          advice: "गर्मियों या कसरत के बाद नींबू पानी या नारियल पानी का सेवन शरीर में जलयोजन बनाए रखता है।",
          category: "hydration"
        }
      ];
    }
    if (cat === "sleep") {
      return [
        {
          title: "नियमित सोने का समय",
          advice: "हर रात एक ही समय पर सोएं और सुबह एक ही समय पर उठें ताकि मेलाटोनिन चक्र संतुलित रहे।",
          category: "sleep"
        },
        {
          title: "स्क्रीन से दूरी",
          advice: "सोने से 30 मिनट पहले मोबाइल या लैपटॉप का उपयोग बंद कर दें और हल्की रोशनी रखें।",
          category: "sleep"
        },
        {
          title: "शांत वातावरण",
          advice: "शयनकक्ष को शांत, अंधेरा और थोड़ा ठंडा रखने से गहरी और आरामदायक नींद आती है।",
          category: "sleep"
        }
      ];
    }
    if (cat === "movement") {
      return [
        {
          title: "दैनिक 30 मिनट की सैर",
          advice: "प्रतिदिन 30 मिनट तेज गति से टहलने से हृदय मजबूत रहता है और मानसिक तनाव कम होता है।",
          category: "movement"
        },
        {
          title: "कार्य के बीच ब्रेक",
          advice: "प्रत्येक 45 मिनट के बैठने के बाद 2 मिनट खड़े होकर स्ट्रेचिंग करें या चलें।",
          category: "movement"
        },
        {
          title: "हल्का योगाभ्यास",
          advice: "शाम को ताड़ासन या भुजंगासन जैसे हल्के योग करने से मांसपेशियों का तनाव दूर होता है।",
          category: "movement"
        }
      ];
    }
    return [
      {
        title: "संतुलित आहार",
        advice: "भोजन में ताजी मौसमी सब्जियां, फल और दालें शामिल करें ताकि शरीर को आवश्यक पोषण मिले।",
        category: "general"
      },
      {
        title: "पर्याप्त जलयोजन",
        advice: "दिन भर में 8-10 गिलास पानी पिएं जिससे ऊर्जा का स्तर और एकाग्रता बनी रहे।",
        category: "general"
      },
      {
        title: "प्राणायाम व ध्यान",
        advice: "प्रतिदिन 10 मिनट गहरी सांस लेने (अनुलोम-विलोम) से मानसिक शांति और ताजगी मिलती है।",
        category: "general"
      }
    ];
  }

  if (lang === "mr") {
    if (cat === "hydration") {
      return [
        {
          title: "सकाळचा पाण्याचा नियम",
          advice: "सकाळी उठल्यावर एक ग्लास कोमट पाणी प्यायल्याने पचनसंस्था सक्रिय होते आणि ऊर्जा मिळते.",
          category: "hydration"
        },
        {
          title: "थोड्या अंतराने पाणी प्या",
          advice: "एकाच वेळी खूप पाणी पिण्याऐवजी दिवसभर घोटघोट पाणी पिणे शरीरासाठी अधिक फायदेशीर ठरते.",
          category: "hydration"
        },
        {
          title: "हायड्रेशनवर लक्ष ठेवा",
          advice: "कामाच्या व्यस्ततेतही पुरेसे पाणी पिण्याची आठवण ठेवा, लिंबू पाणी किंवा नारळ पाणी उत्तम पर्याय आहेत.",
          category: "hydration"
        }
      ];
    }
    if (cat === "sleep") {
      return [
        {
          title: "झोपेची नियमित वेळ",
          advice: "रोज रात्री एकाच वेळी झोपण्याची आणि सकाळी एकाच वेळी उठण्याची सवय शरीराला निरोगी ठेवते.",
          category: "sleep"
        },
        {
          title: "स्क्रीनपासून दूर राहा",
          advice: "झोपण्यापूर्वी अर्धा तास मोबाईल किंवा टीव्ही पाहणे टाळा, यामुळे मेंदूला शांतता लाभते.",
          category: "sleep"
        },
        {
          title: "शांत व थंड खोली",
          advice: "झोपण्याच्या खोलीत मंद प्रकाश आणि शांतता असल्यास गाढ आणि शांत झोप लागते.",
          category: "sleep"
        }
      ];
    }
    if (cat === "movement") {
      return [
        {
          title: "दररोज ३० मिनिटे चालणे",
          advice: "रोज सकाळी किंवा संध्याकाळी ३० मिनिटे जलद चालल्याने हृदयाचे आरोग्य सुधारते.",
          category: "movement"
        },
        {
          title: "बसताना हलके स्ट्रेचिंग",
          advice: "सतत बसून काम करताना दर तासाला २ मिनिटे उठून थोडे चाला व हातपाय ताणा.",
          category: "movement"
        },
        {
          title: "साधे योगासन",
          advice: "संध्याकाळी वज्रासन किंवा शवासन केल्याने दिवसभराचा शारीरिक व मानसिक थकवा दूर होतो.",
          category: "movement"
        }
      ];
    }
    return [
      {
        title: "सकस व संतुलित आहार",
        advice: "आहारात पालेभाज्या, फळे आणि कडधान्यांचा समावेश ठेवा ज्यामुळे प्रतिकारशक्ती वाढते.",
        category: "general"
      },
      {
        title: "योग्य पाणी पिणे",
        advice: "दिवसभरात पुरेसे पाणी प्या जेणेकरून शरीरातील विषारी घटक बाहेर पडतील आणि ताजेतवाने वाटेल.",
        category: "general"
      },
      {
        title: "प्राणायाम व विश्रांती",
        advice: "दररोज १० मिनिटे ओंकार जप किंवा दीर्घ श्वसन केल्याने मानसिक ताणतणाव कमी होतो.",
        category: "general"
      }
    ];
  }

  if (cat === "sleep") {
    return [
      {
        title: "Maintain Circadian Regularity",
        advice: "Wake and sleep at the exact same hour daily to stabilize melatonin production and daytime alertness.",
        category: "sleep"
      },
      {
        title: "30-Minute Digital Wind-Down",
        advice: "Replace screen exposure before bed with reading paper books or gentle dim light relaxation.",
        category: "sleep"
      },
      {
        title: "Thermal Sleep Environment",
        advice: "A bedroom temperature around 65°F (18°C) facilitates the natural nocturnal core body temperature drop.",
        category: "sleep"
      }
    ];
  }

  if (cat === "hydration") {
    return [
      {
        title: "Morning Rehydration Routine",
        advice: "Drink a tall glass of room-temperature water upon waking to kickstart metabolic processes and kidney clearance.",
        category: "hydration"
      },
      {
        title: "Sip Consistently",
        advice: "Sipping water across the day absorbs more effectively than gulping large quantities infrequently.",
        category: "hydration"
      },
      {
        title: "Urine Color Check",
        advice: "Aim for a pale straw color as a reliable, non-invasive indicator of proper hydration status.",
        category: "hydration"
      }
    ];
  }

  if (cat === "movement") {
    return [
      {
        title: "Micro-Movement Breaks",
        advice: "Stand up and walk or stretch for 2 minutes for every 45 minutes of sedentary desk work.",
        category: "movement"
      },
      {
        title: "Brisk Daily 30-Minute Walk",
        advice: "A brisk daily walk supports cardiovascular compliance, joint lubrication, and mood elevation.",
        category: "movement"
      },
      {
        title: "Gentle Mobility Work",
        advice: "Perform basic calf and hip flexor stretches in the evening to release seated muscle tightness.",
        category: "movement"
      }
    ];
  }

  if (cat === "stress") {
    return [
      {
        title: "Box Breathing Practice",
        advice: "Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s. 3 rounds rapidly downregulates sympathetic arousal.",
        category: "stress"
      },
      {
        title: "Daylight Micro-Exposure",
        advice: "Spend 10 minutes outdoors in natural sunlight during morning or midday to enhance mood and reset stress hormones.",
        category: "stress"
      },
      {
        title: "Cognitive Offloading",
        advice: "Write down your top 3 priorities for tomorrow before leaving your desk to prevent nighttime ruminating.",
        category: "stress"
      }
    ];
  }

  return [
    {
      title: "Balanced Daily Nutrition",
      advice: "Incorporate fiber-rich whole vegetables and colorful produce to maintain gut microbiota resilience.",
      category: "general"
    },
    {
      title: "Consistent Hydration",
      advice: "Keep clean drinking water within reach to naturally maintain energy and mental clarity throughout the day.",
      category: "general"
    },
    {
      title: "Restorative Sleep Rhythm",
      advice: "Prioritize 7-8 hours of uninterrupted nocturnal rest to facilitate cellular repair and memory consolidation.",
      category: "general"
    }
  ];
}

wellnessTipsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { category, focusGoal, language = "en" } = req.body;
    const selectedCategory = category || "general";

    if (!hasGeminiKey()) {
      return res.json({
        category: selectedCategory,
        tips: getCategorizedTips(selectedCategory, language),
        disclaimer: language === "hi"
          ? "ये सुझाव सामान्य स्वास्थ्य जीवनशैली की जानकारी के लिए हैं और चिकित्सीय सलाह का विकल्प नहीं हैं।"
          : language === "mr"
          ? "या टिप्स सामान्य आरोग्यदायी जीवनशैलीसाठी असून वैद्यकीय सल्ल्याचा पर्याय नाहीत."
          : "These tips provide general health lifestyle education and do not replace personalized medical advice."
      });
    }

    try {
      const langPrompt =
        language === "hi"
          ? "Respond in Hindi (हिंदी) using Devanagari script for all titles and advice."
          : language === "mr"
          ? "Respond in Marathi (मराठी) using Devanagari script for all titles and advice."
          : "Respond in English.";

      const prompt = `You are a preventive wellness coach for IMD Care.
LANGUAGE REQUIREMENT: ${langPrompt}
Generate 3 actionable, evidence-based, concise preventive wellness recommendations for:
- Category: ${selectedCategory} (e.g., sleep, hydration, physical activity, stress relief, preventive care)
- User Goal / Preference: ${focusGoal || "General daily wellbeing"}

RULES:
1. Do NOT prescribe medical treatments or diets for chronic conditions.
2. Provide positive, practical, non-judgmental habits.
3. Return strictly valid JSON in this schema:
{
  "tips": [
    {
      "title": "Short catchy title in requested language",
      "advice": "1-2 sentences of practical explanation in requested language",
      "category": "${selectedCategory}"
    }
  ]
}`;

      const response = await generateContentWithTimeout(
        {
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        },
        5000
      );

      const parsed = JSON.parse(response.text || "{}");

      return res.json({
        category: selectedCategory,
        tips: Array.isArray(parsed.tips) && parsed.tips.length > 0 ? parsed.tips : getCategorizedTips(selectedCategory, language),
        disclaimer: language === "hi"
          ? "ये सुझाव सामान्य स्वास्थ्य जीवनशैली की जानकारी के लिए हैं और चिकित्सीय सलाह का विकल्प नहीं हैं।"
          : language === "mr"
          ? "या टिप्स सामान्य आरोग्यदायी जीवनशैलीसाठी असून वैद्यकीय सल्ल्याचा पर्याय नाहीत."
          : "These tips provide general health lifestyle education and do not replace personalized medical advice."
      });
    } catch (apiErr: any) {
      console.warn("Wellness tips Gemini timeout or error; returning curated tips:", apiErr?.message);
      return res.json({
        category: selectedCategory,
        tips: getCategorizedTips(selectedCategory, language),
        disclaimer: language === "hi"
          ? "ये सुझाव सामान्य स्वास्थ्य जीवनशैली की जानकारी के लिए हैं और चिकित्सीय सलाह का विकल्प नहीं हैं।"
          : language === "mr"
          ? "या टिप्स सामान्य आरोग्यदायी जीवनशैलीसाठी असून वैद्यकीय सल्ल्याचा पर्याय नाहीत."
          : "These tips provide general health lifestyle education and do not replace personalized medical advice."
      });
    }
  } catch (err: any) {
    console.error("Wellness Tips Error:", err?.message || err);
    return res.status(500).json({ error: "Failed to generate wellness tips.", details: err?.message });
  }
});
