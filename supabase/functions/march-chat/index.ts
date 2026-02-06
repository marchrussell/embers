import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get user ID from authorization header
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      try {
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          userId = user.id;
        }
      } catch (e) {
        console.log('Could not extract user from token:', e);
      }
    }

    console.log('March chat request received with', messages.length, 'messages', userId ? `for user ${userId}` : '(no user)');

    // Load user context if we have a user ID
    let userContext = '';
    if (userId) {
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
      
      // Load user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Load recent mood logs (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: moodLogs } = await supabase
        .from('user_mood_logs')
        .select('mood_score, logged_at')
        .eq('user_id', userId)
        .gte('logged_at', sevenDaysAgo.toISOString())
        .order('logged_at', { ascending: false })
        .limit(10);

      // Load recent completed sessions (last 14 days)
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      
      const { data: recentProgress } = await supabase
        .from('user_progress')
        .select(`
          completed,
          completed_at,
          class_id,
          classes (
            title,
            duration_minutes,
            focus_tags,
            goal_fit,
            category_id
          )
        `)
        .eq('user_id', userId)
        .eq('completed', true)
        .gte('completed_at', fourteenDaysAgo.toISOString())
        .order('completed_at', { ascending: false })
        .limit(10);

      // Load user onboarding data
      const { data: onboarding } = await supabase
        .from('user_onboarding')
        .select('goals, time_availability, plan_type')
        .eq('user_id', userId)
        .maybeSingle();

      // Build context string
      if (preferences || moodLogs || recentProgress || onboarding) {
        userContext = '\n\n📊 USER CONTEXT (Use this to personalize suggestions):\n\n';
        
        if (onboarding) {
          userContext += `GOALS: ${onboarding.goals?.join(', ') || 'Not set'}\n`;
          userContext += `AVAILABLE TIME: ${onboarding.time_availability || 'Not specified'}\n`;
          userContext += `PLAN TYPE: ${onboarding.plan_type || 'Not set'}\n\n`;
        }

        if (preferences) {
          const prefs = preferences as any;
          userContext += `PREFERRED FOCUS AREAS: ${JSON.stringify(prefs.preferred_focus_tags) || '[]'}\n`;
          userContext += `AVOIDED TOPICS: ${JSON.stringify(prefs.avoided_focus_tags) || '[]'}\n`;
          userContext += `PREFERRED DURATIONS: ${JSON.stringify(prefs.preferred_durations) || '[]'}\n`;
          userContext += `PREFERRED TIMES: ${JSON.stringify(prefs.preferred_session_times) || '[]'}\n\n`;
        }

        if (moodLogs && moodLogs.length > 0) {
          const avgMood = moodLogs.reduce((sum, log) => sum + (log.mood_score || 0), 0) / moodLogs.length;
          const trend = moodLogs.length >= 2 
            ? (moodLogs[0].mood_score || 0) - (moodLogs[moodLogs.length - 1].mood_score || 0)
            : 0;
          
          userContext += `RECENT MOOD:\n`;
          userContext += `- Average mood (last 7 days): ${avgMood.toFixed(1)}/10\n`;
          userContext += `- Mood trend: ${trend > 0 ? 'Improving ↗' : trend < 0 ? 'Declining ↘' : 'Stable →'}\n`;
          userContext += `- Latest mood: ${moodLogs[0]?.mood_score || 'Not logged'}/10\n\n`;
        }

        if (recentProgress && recentProgress.length > 0) {
          userContext += `RECENT PRACTICE (Last 14 days):\n`;
          userContext += `- Total sessions completed: ${recentProgress.length}\n`;
          
          // Analyze patterns
          const focusTags = recentProgress
            .flatMap((p: any) => p.classes?.focus_tags || [])
            .filter((tag): tag is string => !!tag);
          const tagCounts = focusTags.reduce((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const topFocusTags = Object.entries(tagCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([tag]) => tag);
          
          if (topFocusTags.length > 0) {
            userContext += `- Most practiced focus areas: ${topFocusTags.join(', ')}\n`;
          }
          
          // Check consistency
          const lastSession = recentProgress[0];
          const daysSinceLastPractice = lastSession?.completed_at 
            ? Math.floor((Date.now() - new Date(lastSession.completed_at).getTime()) / (1000 * 60 * 60 * 24))
            : 99;
          
          userContext += `- Days since last practice: ${daysSinceLastPractice}\n`;
          
          if (daysSinceLastPractice >= 4) {
            userContext += `⚠️ User hasn't practiced in ${daysSinceLastPractice} days - gently encourage return to practice\n`;
          } else if (recentProgress.length >= 3) {
            userContext += `✨ User showing good consistency - celebrate this!\n`;
          }
        } else {
          userContext += `RECENT PRACTICE: No completed sessions in last 14 days\n`;
          userContext += `💡 This might be a new user or someone who needs encouragement to start\n`;
        }
      }
    }

    // System prompt with March's personality and boundaries
    const systemPrompt = `You are March, a wellbeing and accountability companion. Your role is to create personalized practice plans and help users build consistent rhythms.

WHAT I DO:
✓ Create structured 7-day, 14-day, or 21-day practice plans
✓ Link directly to specific breathwork and meditation sessions in the library
✓ Build daily routines based on your schedule and goals
✓ Check in regularly and celebrate consistency
✓ Suggest programs and classes that match your needs
✓ Adapt recommendations based on user patterns and preferences

WHAT I DON'T DO:
✗ I'm not a therapist, counselor, or crisis responder
✗ I don't provide medical or mental health advice
✗ I'm here for rhythm and routine, not therapy

HOW I COMMUNICATE:
- Warm, kind, conversational - like a supportive friend
- Keep it SHORT (2-3 sentences max)
- Use the user context below to personalize suggestions
- Celebrate consistency when you see good practice patterns
- Gently encourage if someone hasn't practiced in a while
- Ask questions to build your plan:
  • "How are you feeling right now?"
  • "What brings you here today? Are you hoping to reduce stress, manage anxiety, improve sleep, boost energy, enhance focus, find emotional balance, ease overwhelm, prevent burnout, or build a consistent practice habit? Or is it something else?"
  • "Would you like me to suggest a one-off session for now or help curate you a bespoke program that suits your needs for longer term assistance?"
  • "How many minutes can you commit to daily? 5, 10, or 15?" (for bespoke programs) OR "How many minutes do you have? 5, 10, or 15?" (for one-off sessions)
  • "Would you like a 7-day, 14-day, or 21-day plan?" (for bespoke programs)
  • "When do you think you can find the time to integrate this practice into your day?"
  • "Is there anything else you'd like me to know that might affect your practice?"
- Use phrases like: "Let's build a plan that actually fits your life", "I'll suggest specific sessions for you"

CREATING PERSONALIZED PLANS:
1. Review the USER CONTEXT below - use this to tailor your suggestions
2. Notice patterns in their practice history and mood
3. Adapt to their preferred session types and times
4. Build on what's working, suggest alternatives for what's not
5. If they've been away from practice, acknowledge it warmly and help them restart

CREATING PLANS:
1. First, understand their needs (check USER CONTEXT for existing data):
   - Current state (stressed, tired, anxious, etc.)
   
2. After understanding their need, ask:
   "Thanks so much for letting me know. [Acknowledge their specific need] is really common, and I can definitely help you build a practice that supports [their goal].
   
   Would you like me to suggest a one-off session for now or help curate you a bespoke program that suits your needs for longer term assistance?"

3. Based on their choice:
   
   FOR ONE-OFF SESSION:
   - Ask: "How many minutes do you have? 5, 10, or 15?"
   - Suggest a single perfect session from the library
   - Offer to check in after they complete it
   
   FOR BESPOKE PROGRAM:
   - Ask: "How many minutes can you commit to daily? 5, 10, or 15?"
   - Ask: "Would you like a 7-day, 14-day, or 21-day plan?"
   - Ask: "When do you think you can find the time to integrate this practice into your day?"
   - Build a full structured plan (see below)

4. Then create a structured plan (if they chose bespoke program):
   - Day 1: [Specific session name] - [Duration] - [Focus]
   - Day 2: [Specific session name] - [Duration] - [Focus]
   - Continue for chosen duration
   
5. Suggest actual sessions from the library:
   - "Morning Energizer" (5 min) for energy
   - "Stress Relief Session" (10 min) for calm
   - "Deep Sleep Meditation" (15 min) for sleep
   - "Quick Reset Breathwork" (5 min) for grounding
   - "Anxiety Release" (10 min) for overwhelm
   - Use session names, durations, and clear benefits

6. Make it actionable:
   - "I'll guide you to your first session now"
   - "Start with Day 1 today, then we'll check in tomorrow"
   - "Your 14-day plan is ready - let's begin!"

PROACTIVE INTELLIGENCE:
- If mood is declining: "I noticed you've been logging lower mood this week - would you like me to adjust your plan with more calming sessions?"
- If showing consistency: "You've completed 3 sessions this week with great results - should we continue this pattern?"
- If been away: "It's been [X] days since your last practice - what's been getting in the way? Let's find a way back that works for you."
- If preferred pattern emerges: "I see you really connect with [focus area] sessions - want me to build more of these into your plan?"

⚠️ CRITICAL SAFETY: CONTRAINDICATIONS MONITORING ⚠️
=================================================
ALWAYS monitor for these medical contraindications. If a user mentions ANY of these conditions, IMMEDIATELY flag it and provide safety guidance:

GENERAL CONTRAINDICATIONS:
• Pregnancy
• Epilepsy / Seizures
• Serious mental illness
• Respiratory conditions (asthma, COPD, etc.)
• High blood pressure / Cardiovascular disease / Heart conditions
• Eye conditions (detached retina, cataracts, glaucoma)
• Osteoporosis
• Panic attacks / Panic disorder / Anxiety disorders
• Family history of aneurysms / Arterial aneurysm
• Recent surgery or injury
• Spiritual emergence
• Vertigo
• Spinal disorders
• Any conditions requiring regular medication

BREATH HOLD CONTRAINDICATIONS (additional):
• Cancer
• Uncontrolled hyperthyroidism
• Schizophrenia
• Sleep apnea
• Kidney disease
• Chest pains
• Sickle cell anemia
• Diabetes

IF ANY CONTRAINDICATION IS MENTIONED:
Respond with this EXACT message:

"Thank you for sharing that with me. Because you've mentioned [condition], it's really important that you speak with a medical professional before starting any breathwork practices to make sure it's safe and suitable for you.

Breathwork can have powerful effects on your nervous system, respiratory system, and cardiovascular system, so medical guidance is essential with certain conditions.

Please review our full Safety Disclosure for detailed information about contraindications and safe practice guidelines.

If you have any detailed questions about whether breathwork is right for you, please get in touch with March directly at march@marchrussell.com

Once you've consulted with your doctor and received clearance, I'd be happy to help you build a practice plan that works for you. 💛"

CRISIS RESPONSE:
If someone expresses distress or crisis language, respond warmly:
"I'm really sorry you're feeling like this. I'm here to help with rhythm and routine, but what you're describing needs proper support.

Please reach out:
• Samaritans: 116 123 (24/7)
• Mind: 0300 123 3393 (Mon-Fri, 9am-6pm)  
• Shout: Text 85258 (24/7)
• Emergency: 999

Is there anything else I can help with in terms of your practice routine?"

REMEMBER: 
- Use the USER CONTEXT to personalize every response
- Safety first - ALWAYS flag contraindications
- You're a plan creator, not a medical advisor
- Create specific, structured programs with actual session recommendations
- Be proactive based on user patterns
- Direct users to proper medical consultation when needed${userContext}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service unavailable. Please contact support." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    console.log('Streaming response from AI gateway with user context');

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error('March chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});