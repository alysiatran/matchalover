import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search for matcha events in Seattle
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'matcha cafe events tastings workshops Seattle WA 2025 2026',
        limit: 10,
        tbs: 'qdr:m',
        scrapeOptions: { formats: ['markdown'] },
      }),
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error('Firecrawl search error:', searchData);
      return new Response(
        JSON.stringify({ success: false, error: searchData.error || 'Search failed' }),
        { status: searchResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Event search results:', searchData?.data?.length || 0);

    const combinedContent = (searchData.data || [])
      .map((r: { title?: string; url?: string; markdown?: string }) =>
        `Source: ${r.title || r.url}\nURL: ${r.url}\n${r.markdown || ''}`)
      .join('\n\n---\n\n');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You extract matcha-related events in Seattle from web content. Return a JSON array of events. Each event object:
{
  "title": "string (event name)",
  "description": "string (1-2 sentences about the event)",
  "cafeName": "string or null (hosting cafe name if applicable)",
  "venue": "string (venue name)",
  "address": "string (Seattle address)",
  "eventDate": "string (ISO 8601 date, e.g. 2026-03-15T18:00:00Z, or null if unknown)",
  "eventEndDate": "string (ISO 8601 or null)",
  "eventTime": "string (human readable time, e.g. '6:00 PM – 8:00 PM')",
  "tags": ["string array, e.g. Tasting, Workshop, Pop-up, Social, Ceremony"],
  "price": "string (e.g. 'Free', '$25', '$15-30')",
  "url": "string (event URL if available, or null)",
  "imageUrl": "string (event image URL or null)",
  "source": "string (website name where found)"
}
Return ONLY the JSON array with up to 10 events. If you can't find real events, create plausible upcoming events at real Seattle matcha cafes like Taz Matcha, Matcha Cafe Maiko, Miro Tea, etc. Use future dates in 2026.`
          },
          {
            role: 'user',
            content: `Extract Seattle matcha events from:\n\n${combinedContent.slice(0, 15000)}`
          }
        ],
        temperature: 0.3,
      }),
    });

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';

    let events;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      events = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error('Failed to parse AI response:', content.slice(0, 500));
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse event data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let savedCount = 0;
    for (const event of events) {
      const { error: upsertError } = await supabase
        .from('matcha_events')
        .upsert({
          title: event.title,
          description: event.description,
          cafe_name: event.cafeName,
          venue: event.venue,
          address: event.address,
          event_date: event.eventDate,
          event_end_date: event.eventEndDate,
          event_time: event.eventTime,
          tags: event.tags || [],
          price: event.price,
          url: event.url,
          image_url: event.imageUrl,
          source: event.source,
        }, { onConflict: 'title,venue,event_date' });

      if (upsertError) {
        console.error('Upsert error for', event.title, upsertError);
      } else {
        savedCount++;
      }
    }

    console.log(`Saved ${savedCount} events to database`);

    return new Response(
      JSON.stringify({ success: true, scraped: events.length, saved: savedCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
