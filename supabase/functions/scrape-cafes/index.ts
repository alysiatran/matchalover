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

    // Search for matcha cafes in Seattle
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'new matcha cafe openings Seattle WA 2025 site:yelp.com OR site:google.com/maps menu prices reviews',
        limit: 10,
        tbs: 'qdr:m',
        scrapeOptions: {
          formats: ['markdown'],
        },
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

    console.log('Search successful, results:', searchData?.data?.length || 0);

    // Now use AI to extract structured cafe data from the search results
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Combine the markdown from search results
    const combinedContent = (searchData.data || [])
      .map((r: { title?: string; url?: string; markdown?: string }) => 
        `Source: ${r.title || r.url}\n${r.markdown || ''}`)
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
            content: `You extract real matcha cafe data from web content. Return a JSON array of exactly 6 cafes found in Seattle. Each cafe must be a REAL place mentioned in the content. Use this exact schema:
{
  "id": "string (1-6)",
  "name": "string (real cafe name)",
  "rating": "number (from reviews or estimate 4.0-4.9)",
  "reviews": "number (from reviews or estimate 100-400)",
  "distance": "string (e.g. '0.5 mi')",
  "address": "string (real Seattle address)",
  "tags": ["string array, 2-3 tags like Ceremonial, Cozy, Modern, Traditional, etc."],
  "description": "string (2 sentences about the cafe)",
  "hours": "string (e.g. '7:00 AM – 5:00 PM')",
  "priceRange": "string ($ or $$ or $$$)",
  "matchaPowder": {
    "origin": "string (Japanese region)",
    "grade": "string (Ceremonial, Premium, etc.)",
    "flavorNotes": ["string array, 3 notes"],
    "body": "string (e.g. 'Full & velvety')",
    "finish": "string (e.g. 'Lingering sweetness')"
  },
  "menu": [
    {
      "category": "string",
      "items": [{ "name": "string", "price": "string like $5", "description": "string (optional)" }]
    }
  ]
}
Return ONLY the JSON array, no markdown fencing.`
          },
          {
            role: 'user',
            content: `Extract real Seattle matcha cafe data from this content:\n\n${combinedContent.slice(0, 15000)}`
          }
        ],
        temperature: 0.3,
      }),
    });

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    // Parse the JSON from AI response
    let cafes;
    try {
      // Try to extract JSON from response (handle potential markdown fencing)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      cafes = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content.slice(0, 500));
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse cafe data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, cafes }),
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
