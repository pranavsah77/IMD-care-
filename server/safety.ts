/**
 * Deterministic Emergency & Safety Checker for IMD Care
 * Detects red-flag emergency symptoms immediately without waiting for AI.
 */

export interface EmergencyCheckResult {
  isEmergency: boolean;
  severity: 'emergency' | 'urgent' | 'routine';
  reason?: string;
  actionRequired?: string;
  emergencyContacts?: string[];
}

const EMERGENCY_PATTERNS = [
  // Cardiac / Vascular
  {
    pattern: /\b(chest pain|crushing pain|heart attack|pain radiating to (left )?arm|chest pressure|chest tightness)\b/i,
    reason: "Possible acute coronary syndrome or cardiac emergency.",
  },
  // Respiratory
  {
    pattern: /\b(cannot breathe|can't breathe|severe shortness of breath|gasping for air|turning blue|choking|inability to breathe)\b/i,
    reason: "Severe respiratory distress requiring immediate medical airway support.",
  },
  // Neurological / Stroke
  {
    pattern: /\b(facial droop|face drooping|arm weakness|slurred speech|sudden loss of vision|sudden paralysis|worst headache of my life|thunderclap headache)\b/i,
    reason: "Potential stroke or intracranial emergency (FAST signs).",
  },
  // Anaphylaxis / Severe Allergy
  {
    pattern: /\b(throat swelling|tongue swelling|lips swelling|anaphylaxis|swollen airway|severe allergic reaction)\b/i,
    reason: "Signs of acute anaphylaxis requiring epinephrine and urgent emergency intervention.",
  },
  // Bleeding / Shock
  {
    pattern: /\b(vomiting blood|coughing up blood|hemorrhag|uncontrolled bleeding|stab wound|gunshot)\b/i,
    reason: "Acute severe bleeding or trauma requiring immediate surgical / emergency evaluation.",
  },
  // Altered consciousness / Poisoning
  {
    pattern: /\b(loss of consciousness|passed out and won't wake up|unresponsive|seizure lasting more than 5 minutes|poisoning|overdose)\b/i,
    reason: "Altered mental status, prolonged seizure, or overdose.",
  },
  // Mental Health Crisis
  {
    pattern: /\b(suicide|kill myself|want to end my life|harm myself|suicidal thoughts)\b/i,
    reason: "Immediate mental health crisis or suicide risk.",
  },
];

export function checkEmergencyRedFlags(text: string): EmergencyCheckResult {
  if (!text || typeof text !== 'string') {
    return { isEmergency: false, severity: 'routine' };
  }

  for (const item of EMERGENCY_PATTERNS) {
    if (item.pattern.test(text)) {
      const isCrisis = item.pattern.source.includes('suicid') || item.pattern.source.includes('harm');
      return {
        isEmergency: true,
        severity: 'emergency',
        reason: item.reason,
        actionRequired: isCrisis
          ? "Please call or text 988 immediately (Suicide & Crisis Lifeline in the US/Canada) or reach your nearest crisis support center or emergency room."
          : "Seek emergency medical care immediately. Call 911 (or your local emergency number like 112/999) or proceed to the nearest emergency department right away. Do not drive yourself.",
        emergencyContacts: isCrisis
          ? ["988 (Suicide & Crisis Lifeline)", "Emergency: 911 / 112", "Text HOME to 741741 (Crisis Text Line)"]
          : ["Emergency: 911 (US/Canada)", "Emergency: 112 (EU/International)", "Emergency: 999 (UK)"]
      };
    }
  }

  return { isEmergency: false, severity: 'routine' };
}
