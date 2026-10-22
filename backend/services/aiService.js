// backend/services/aiService.js
const Groq = require('groq-sdk');

// Lazily instantiate to ensure GROQ_API_KEY is loaded from dotenv first
let _groqClient = null;
const getGroqClient = () => {
  if (!_groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }
    _groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groqClient;
};


const SYSTEM_PROMPT = `You are MindCare AI, a compassionate and empathetic mental health companion for the Mannsparshya platform — a mental health support application for students and individuals in India.

Your purpose is to:
- Provide emotional support, active listening, and evidence-based coping strategies
- Help users explore their feelings without judgment
- Suggest relaxation techniques, breathing exercises, and mindfulness practices
- Offer psychoeducation about mental health topics in simple, accessible language
- Encourage users to seek professional help when appropriate
- Be sensitive to Indian cultural context and college student challenges (academic pressure, family expectations, relationships, etc.)

Important guidelines:
- Always respond with warmth, empathy, and care
- Never diagnose mental health conditions
- If a user expresses suicidal thoughts or intent to harm themselves/others, IMMEDIATELY urge them to call iCall (9152987821) or Vandrevala Foundation Helpline (1860-2662-345, 24/7)
- Keep responses concise but meaningful (2-4 paragraphs max)
- Use simple, clear language — avoid clinical jargon
- Occasionally ask follow-up questions to understand the user better
- Remind users that you are an AI and not a replacement for professional therapy when it seems appropriate

You are NOT a replacement for a licensed therapist. You are a first point of supportive contact.`;

/**
 * Send a message to Groq and get an AI response
 * @param {Array} conversationHistory - Array of {role, content} message objects
 * @returns {string} - AI response text
 */
const getChatResponse = async (conversationHistory) => {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
    ];

    const chatCompletion = await getGroqClient().chat.completions.create({
      messages,
      model: 'qwen/qwen3.8-27b',
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.9,
    });

    const responseText = chatCompletion.choices[0]?.message?.content || 
      "I'm here for you. Could you tell me a bit more about how you're feeling?";

    return responseText;
  } catch (error) {
    console.error('Groq AI Error:', error);
    throw new Error('AI service temporarily unavailable: ' + error.message);
  }
};

module.exports = { getChatResponse };
