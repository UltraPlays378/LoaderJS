const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
};

export default {
  async fetch(request, env, ctx) {
    // 1. CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");
    
    // 2. Security: Check the Secret defined in Cloudflare
    const clientKey = request.headers.get("x-api-key") || url.searchParams.get("key");
    
    // PROXY_SECRET is pulled from your Cloudflare Secrets/Env
    if (!clientKey || clientKey !== env.PROXY_SECRET) {
      return new Response("401 Unauthorized", { status: 401, headers: corsHeaders });
    }

    if (!targetUrl) {
      return new Response("Missing URL parameter", { status: 400, headers: corsHeaders });
    }

    try {
      // 3. Perform the Proxy Fetch
      const response = await fetch(targetUrl, { redirect: "follow" });
      
      // 4. Inject CORS headers into the response stream
      const newHeaders = new Headers(response.headers);
      Object.keys(corsHeaders).forEach(k => newHeaders.set(k, corsHeaders[k]));

      return new Response(response.body, {
        status: response.status,
        headers: newHeaders
      });
    } catch (e) {
      return new Response(`Proxy Error: ${e.message}`, { status: 500, headers: corsHeaders });
    }
  }
};
