
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { url } = await req.json()
        if (!url) {
            throw new Error('Missing URL parameter')
        }

        // 1. Get Firecrawl API Key
        const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY')
        if (!firecrawlApiKey) {
            console.error('Missing FIRECRAWL_API_KEY')
            throw new Error('Server configuration error')
        }

        console.log(`Processing URL: ${url}`)

        // 2. Call Firecrawl
        const scrapeResp = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${firecrawlApiKey}`
            },
            body: JSON.stringify({
                url: url,
                formats: ['html'],
            })
        })

        if (!scrapeResp.ok) {
            const errorText = await scrapeResp.text()
            console.error(`Firecrawl Error: ${errorText}`)
            throw new Error(`Failed to scrape page: ${errorText}`)
        }

        const scrapeData = await scrapeResp.json()
        const html = scrapeData.data?.html

        if (!html) {
            throw new Error('Failed to retrieve HTML content')
        }

        // 3. Extract Audio URL using Regex (Ported from Python)
        // Looking for: "play_url":"https://..."
        const playUrlMatch = /"play_url":\s*"([^"]+)"/.exec(html)

        if (!playUrlMatch || !playUrlMatch[1]) {
            throw new Error('Could not find audio URL. The song might be VIP-only or the page structure has changed.')
        }

        // Unescape the URL (it might contain \/)
        // A simple JSON.parse approach for the string value
        let audioUrl: string
        try {
            audioUrl = JSON.parse(`"${playUrlMatch[1]}"`)
        } catch (e) {
            // Fallback if parsing fails, just use raw string but replace escaped slashes
            audioUrl = playUrlMatch[1].replace(/\\\//g, '/')
        }

        // 4. Extract Title for Filename
        const titleMatch = /<title>(.*?)<\/title>/.exec(html)
        let filename = 'qishui_audio.mp3'
        if (titleMatch && titleMatch[1]) {
            // Remove branding and clean characters
            let title = titleMatch[1].replace(' - 汽水音乐', '').trim()
            title = title.replace(/[\\/:*?"<>|]/g, '_') // Sanitize for filename
            filename = `${title}.mp3`
        }

        console.log(`Found audio: ${filename} at ${audioUrl}`)

        // 5. Stream the audio file back to client
        const audioResp = await fetch(audioUrl)
        if (!audioResp.ok) {
            throw new Error(`Failed to fetch audio stream: ${audioResp.statusText}`)
        }

        // Return the stream with correct headers for download
        return new Response(audioResp.body, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
            }
        })

    } catch (error) {
        console.error('Error:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
