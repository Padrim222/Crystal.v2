import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Imgur upload function called");
    
    const { imageBase64, title } = await req.json();
    
    if (!imageBase64) {
      throw new Error('Image data is required');
    }

    console.log("Uploading image to Imgur");

    // Upload to Imgur (anonymous upload, no API key needed)
    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID 546c25a59c58ad7', // Public anonymous client ID
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        type: 'base64',
        title: title || 'Crystal Crush Photo',
        description: 'Uploaded via Crystal.ai'
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Imgur API error:", response.status, errorData);
      throw new Error(`Imgur upload failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("Imgur upload successful");
    
    if (!data.success) {
      throw new Error(data.data?.error || 'Upload failed');
    }

    return new Response(JSON.stringify({ 
      success: true,
      data: {
        url: data.data.link,
        deleteHash: data.data.deletehash,
        id: data.data.id
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in imgur-upload function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});