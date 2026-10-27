import { Router, Request, Response } from "express";
import { modelName, hasGeminiKey, generateContentWithTimeout } from "../gemini.ts";

export const wellnessTipsRouter = Router();

function getCategorizedTips(category: string): any[] {
  const cat = category.toLowerCase();

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
    const { category, focusGoal } = req.body;
    const selectedCategory = category || "general";

    if (!hasGeminiKey()) {
      return res.json({
        category: selectedCategory,
        tips: getCategorizedTips(selectedCategory),
        disclaimer: "These tips provide general health lifestyle education and do not replace personalized medical advice."
      });
    }

    try {
      const prompt = `You are a preventive wellness coach for IMD Care.
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
      "title": "Short catchy title",
      "advice": "1-2 sentences of practical explanation",
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
        tips: Array.isArray(parsed.tips) && parsed.tips.length > 0 ? parsed.tips : getCategorizedTips(selectedCategory),
        disclaimer: "These tips provide general health lifestyle education and do not replace personalized medical advice."
      });
    } catch (apiErr: any) {
      console.warn("Wellness tips Gemini timeout or error; returning curated tips:", apiErr?.message);
      return res.json({
        category: selectedCategory,
        tips: getCategorizedTips(selectedCategory),
        disclaimer: "These tips provide general health lifestyle education and do not replace personalized medical advice."
      });
    }
  } catch (err: any) {
    console.error("Wellness Tips Error:", err?.message || err);
    return res.status(500).json({ error: "Failed to generate wellness tips.", details: err?.message });
  }
});
