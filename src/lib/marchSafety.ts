/**
 * March Safety & Ethics System
 * Implements crisis detection, safety boundaries, and support resources
 * for March: The Lovable Accountability Companion
 */

export interface SafetyResource {
  name: string;
  phone?: string;
  text?: string;
  url?: string;
  availability: string;
}

// UK Crisis Support Resources (can be expanded for other regions)
export const CRISIS_RESOURCES: SafetyResource[] = [
  {
    name: "Samaritans",
    phone: "116 123",
    availability: "24/7",
  },
  {
    name: "Mind",
    phone: "0300 123 3393",
    availability: "Mon-Fri, 9am-6pm",
  },
  {
    name: "Shout Crisis Text Line",
    text: "Text 85258",
    availability: "24/7",
  },
  {
    name: "Emergency Services",
    phone: "999",
    availability: "24/7 (for immediate danger)",
  },
];

// Crisis keywords that trigger safety responses
const CRISIS_KEYWORDS = [
  'suicide',
  'suicidal',
  'kill myself',
  'want to die',
  'end my life',
  'better off dead',
  "can't go on",
  'no point living',
  'harm myself',
  'self harm',
];

// High-risk phrases that suggest severe distress
const HIGH_RISK_PHRASES = [
  'planning to',
  'going to hurt',
  'ready to die',
  'goodbye',
  'final message',
];

/**
 * Detects if a message contains crisis language or distress signals
 */
export function detectCrisisLanguage(message: string): {
  isCrisis: boolean;
  isHighRisk: boolean;
  triggeredKeywords: string[];
} {
  const lowerMessage = message.toLowerCase();
  const triggeredKeywords: string[] = [];
  
  let isCrisis = false;
  let isHighRisk = false;

  // Check for crisis keywords
  for (const keyword of CRISIS_KEYWORDS) {
    if (lowerMessage.includes(keyword)) {
      isCrisis = true;
      triggeredKeywords.push(keyword);
    }
  }

  // Check for high-risk phrases
  for (const phrase of HIGH_RISK_PHRASES) {
    if (lowerMessage.includes(phrase)) {
      isHighRisk = true;
      triggeredKeywords.push(phrase);
    }
  }

  return { isCrisis, isHighRisk, triggeredKeywords };
}

/**
 * Generates appropriate safety response based on crisis level
 */
export function getSafetyResponse(isHighRisk: boolean): string {
  if (isHighRisk) {
    return `I'm really concerned about what you've shared. Your safety is the most important thing right now.

Please reach out to someone who can offer immediate support:

🆘 **Emergency Services: 999** (if you're in immediate danger)
💛 **Samaritans: 116 123** (24/7 support)
💬 **Shout: Text 85258** (24/7 crisis text line)

You don't have to face this alone. Please contact one of these services right now.`;
  }

  return `I'm really sorry you're feeling like this. You're not alone, and what you're going through matters.

March is here to support your wellbeing journey, but I'm not equipped to provide the kind of help you need right now.

Please consider reaching out to someone who can offer professional support:

💛 **Samaritans: 116 123** (24/7)
🧠 **Mind: 0300 123 3393** (Mon-Fri, 9am-6pm)
💬 **Shout: Text 85258** (24/7)

If you ever feel unsafe or need immediate help, contact your local emergency services (999).

Is there anything else I can help you with today in terms of your wellbeing goals or practice?`;
}

/**
 * Formats crisis resources for display
 */
export function formatCrisisResources(): string {
  return CRISIS_RESOURCES.map(resource => {
    let line = `**${resource.name}**`;
    if (resource.phone) line += `: ${resource.phone}`;
    if (resource.text) line += ` - ${resource.text}`;
    if (resource.availability) line += ` (${resource.availability})`;
    return line;
  }).join('\n');
}

/**
 * March's ethical boundaries and role definition
 */
export const MARCH_BOUNDARIES = {
  role: "March is a wellbeing and accountability guide designed to help users build consistent habits, feel supported in their self-care, stay accountable to their goals, and reflect on their progress over time.",
  
  notATherapist: "March is not a therapist, counselor, or crisis responder. March is a coach-like companion focused on practical guidance, gentle motivation, and simple reflection.",
  
  canDo: [
    "Offer practical tips, reflections, and check-ins",
    "Listen empathetically and validate feelings",
    "Provide reminders and celebrate progress",
    "Share general guidance on self-care routines",
    "Track consistency and accountability",
  ],
  
  cannotDo: [
    "Provide medical, diagnostic, or therapeutic advice",
    "Deep emotional analysis or trauma support",
    "Crisis conversation or emergency response",
    "Prescriptive solutions for mental health",
  ],
};

/**
 * Tone guidelines for March's communication
 */
export const TONE_GUIDELINES = {
  always: [
    "Warm, kind, conversational tone",
    "Short, clear messages (avoid jargon)",
    "Empowering, non-judgmental phrasing",
    "Gentle accountability",
  ],
  
  never: [
    "Promise outcomes",
    "Minimize emotions",
    "Give medical or mental health advice",
    "Attempt to interpret emotions deeply",
  ],
  
  examples: {
    good: [
      "That sounds tough — I'm proud you're still showing up",
      "Let's try again tomorrow, no pressure",
      "You're doing great, even small steps count",
    ],
    avoid: [
      "I'll make you feel better",
      "Don't worry, you'll be fine",
      "You just need to think positive",
    ],
  },
};

/**
 * Initial disclosure text for onboarding
 */
export const ONBOARDING_DISCLOSURE = `Hi there 💛 I'm March — here to help you stay consistent and supported in your wellbeing journey.

Before we start, I want to be clear: I'm not a medical or therapeutic service. I'm here to help you build habits and feel accountable, but if you're struggling with your mental health, professional support is always available.

You don't have to face difficult things alone 💛`;
