// Cloudflare Pages Function: GET /api/extract-audio
export async function onRequestGet(context: any) {
  try {
    const { searchParams } = new URL(context.request.url);
    const targetUrl = searchParams.get('url');
    const bitrate = searchParams.get('bitrate') || '320k';
    const rawFilename = searchParams.get('filename') || `kuaivideosdownloader_audio_${bitrate}.mp3`;

    if (!targetUrl) {
      return new Response('Missing target URL', { status: 400 });
    }

    const safeAsciiFilename = rawFilename.replace(/[^\x20-\x7E]+/g, '_').replace(/"/g, '') || 'kuaivideosdownloader_audio.mp3';
    const encodedFilename = encodeURIComponent(rawFilename);

    const requestHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      'Accept': '*/*'
    };

    if (/kuaishou|kwai|kwimgs/i.test(targetUrl)) {
      requestHeaders['Referer'] = 'https://v.kuaishou.com/';
    }

    const remoteRes = await fetch(targetUrl, {
      method: 'GET',
      headers: requestHeaders
    });

    if (!remoteRes.ok || !remoteRes.body) {
      return new Response('Failed to stream audio', { status: 502 });
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'audio/mpeg');
    responseHeaders.set('Content-Disposition', `attachment; filename="${safeAsciiFilename}"; filename*=UTF-8''${encodedFilename}`);
    responseHeaders.set('Cache-Control', 'public, max-age=3600');

    return new Response(remoteRes.body, {
      status: 200,
      headers: responseHeaders
    });
  } catch (err: any) {
    return new Response('Audio extraction error: ' + err.message, { status: 500 });
  }
}
