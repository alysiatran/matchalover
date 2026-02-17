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

    // Use AI to extract structured cafe data
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    let cafes;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      cafes = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content.slice(0, 500));
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse cafe data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch real photos for each cafe in parallel using Firecrawl search
    await Promise.allSettled(cafes.map(async (cafe: any) => {
      try {
        const photoSearch = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `${cafe.name} Seattle cafe`,
            limit: 3,
            scrapeOptions: { formats: ['markdown'] },
          }),
        });
        const photoData = await photoSearch.json();
        const results = photoData?.data || [];

        // Try multiple strategies to find a good image
        for (const result of results) {
          // Strategy 1: og:image from metadata
          const ogImage = result?.metadata?.ogImage || result?.metadata?.['og:image'];
          if (ogImage && ogImage.startsWith('http') && !ogImage.includes('placeholder') && !ogImage.includes('yelp_og_image') && !ogImage.includes('logo')) {
            cafe.photoUrl = ogImage;
            return;
          }
          // Strategy 2: sourceURL image from Yelp bphoto
          const sourceUrl = result?.metadata?.sourceURL || result?.url || '';
          if (sourceUrl.includes('yelp.com')) {
            const ogImg2 = result?.metadata?.ogImage || result?.metadata?.['og:image'];
            if (ogImg2 && ogImg2.startsWith('http')) {
              cafe.photoUrl = ogImg2;
              return;
            }
          }
        }

        // Strategy 3: Extract image URLs from markdown content
        for (const result of results) {
          const md = result?.markdown || '';
          const imgMatch = md.match(/!\[.*?\]\((https?:\/\/[^\s)]+\.(?:jpg|jpeg|png|webp)[^\s)]*)\)/i);
          if (imgMatch) {
            cafe.photoUrl = imgMatch[1];
            return;
          }
        }
      } catch (photoErr) {
        console.error('Photo search failed for', cafe.name, photoErr);
      }
    }));

    // Persist cafes to database using service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let savedCount = 0;
    for (const cafe of cafes) {
      const row: Record<string, unknown> = {
        name: cafe.name,
        address: cafe.address,
        rating: cafe.rating,
        reviews: cafe.reviews,
        distance: cafe.distance,
        tags: cafe.tags || [],
        description: cafe.description,
        hours: cafe.hours,
        price_range: cafe.priceRange,
        matcha_origin: cafe.matchaPowder?.origin,
        matcha_grade: cafe.matchaPowder?.grade,
        matcha_flavor_notes: cafe.matchaPowder?.flavorNotes || [],
        matcha_body: cafe.matchaPowder?.body,
        matcha_finish: cafe.matchaPowder?.finish,
        menu: cafe.menu || [],
      };

      if (cafe.photoUrl) {
        row.photo_url = cafe.photoUrl;
      }

      const { error: upsertError } = await supabase
        .from('cafes')
        .upsert(row, { onConflict: 'name,address' });

      if (upsertError) {
        console.error('Upsert error for', cafe.name, upsertError);
      } else {
        savedCount++;
      }
    }

    console.log(`Saved ${savedCount} cafes to database`);

    return new Response(
      JSON.stringify({ success: true, scraped: cafes.length, saved: savedCount }),
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
