import { GoogleGenAI } from '@google/genai';

export interface CaptionSuggestion {
  id: string;
  title: string;
  caption: string;
  hashtags: string[];
  hookReason: string;
  tone: string;
}

export async function generateCaptionsWithGemini(params: {
  topic: string;
  tone?: string;
  platforms?: string[];
  videoDurationSec?: number;
}): Promise<CaptionSuggestion[]> {
  const { topic, tone = 'viral', platforms = ['youtube', 'tiktok', 'instagram'] } = params;

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({});
      const prompt = `You are a world-class social media viral strategist specializing in short-form vertical videos (YouTube Shorts, TikTok, Instagram Reels, X).
Video Topic/Summary: "${topic}"
Tone/Style requested: "${tone}" (options: viral, punchy, professional, storytelling)
Target Platforms: ${platforms.join(', ')}

Generate 3 DISTINCT, HIGH-CONVERTING, CATCHY caption options.
For each option provide:
1. title: An irresistible 1-line hook/title (under 80 characters, with high CTR curiosity or bold claim)
2. caption: A concise, engaging 2-4 sentence caption with a call to action (question, comment trigger)
3. hashtags: 5-8 trending, relevant hashtags (without the # symbol in array)
4. hookReason: A 1-sentence explanation of why this hook stops the scroll
5. tone: The specific sub-tone (e.g., "High-Curiosity Viral", "Direct Value", "Contrarian")

Respond ONLY with valid JSON in this exact structure:
[
  {
    "id": "1",
    "title": "...",
    "caption": "...",
    "hashtags": ["shorts", "tech", "viral"],
    "hookReason": "...",
    "tone": "..."
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.8
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, idx) => ({
            id: item.id || `ai_${idx}_${Date.now()}`,
            title: item.title || topic,
            caption: item.caption || '',
            hashtags: Array.isArray(item.hashtags) ? item.hashtags : ['viral', 'shorts'],
            hookReason: item.hookReason || 'Optimized for high retention',
            tone: item.tone || tone
          }));
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed or timed out, falling back to curated viral templates:', err);
    }
  }

  // Fallback high-impact algorithmic templates based on topic & tone
  const cleanedTopic = topic.trim() || 'This Secret Trick';
  return [
    {
      id: 'template_1',
      title: `Nobody Is Talking About This ${cleanedTopic} (Until Now)`,
      caption: `I tested this for 30 days and the results completely surprised me. Most creators completely overlook step 2! Have you experienced this yet? Drop your thoughts below! 👇`,
      hashtags: ['viral', 'shorts', 'reels', 'contentcreator', 'productivity', 'trending'],
      hookReason: 'Creates a powerful curiosity gap & FOMO (Fear Of Missing Out)',
      tone: 'Viral & Curiosity-Driven'
    },
    {
      id: 'template_2',
      title: `3 Seconds That Will Change How You Do ${cleanedTopic} 🔥`,
      caption: `Save this before the algorithm buries it! Here is the exact breakdown you can implement in under 60 seconds. Share this with someone who needs to see it!`,
      hashtags: ['lifehack', 'shorts', 'tiktoktech', 'reelsvideo', 'growthhacks'],
      hookReason: 'Fast pattern interrupt that promises immediate actionable value',
      tone: 'Punchy & Action-Oriented'
    },
    {
      id: 'template_3',
      title: `Why 99% Of People Fail At ${cleanedTopic} (And How To Fix It)`,
      caption: `The harsh truth about getting results without wasting hours. The top 1% use this exact framework daily. Double tap if you agree! ⚡`,
      hashtags: ['mastery', 'mindset', 'creatorrig', 'techtips', 'explorepage'],
      hookReason: 'Contrarian hook that challenges common assumptions to trigger comments',
      tone: 'Contrarian & Insightful'
    }
  ];
}
