// Cloudflare Pages Function: GET /api/download-proxy
export async function onRequestGet(context: any) {
  try {
    const { searchParams } = new URL(context.request.url);
    const targetUrl = searchParams.get('url');
    const type = searchParams.get('type') || 'video';
    const rawFilename = searchParams.get('filename') || `kuaivideosdownloader_media_${Date.now()}.${type === 'audio' ? 'mp3' : type === 'image' ? 'jpg' : 'mp4'}`;

    if (!targetUrl) {
      return new Response('Missing target URL', { status: 400 });
    }

    const safeAsciiFilename = rawFilename.replace(/[^\x20-\x7E]+/g, '_').replace(/"/g, '') || 'kuaivideosdownloader_media';
    const encodedFilename = encodeURIComponent(rawFilename);

    let contentType = 'video/mp4';
    if (type === 'audio') contentType = 'audio/mpeg';
    else if (type === 'image') contentType = 'image/jpeg';

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
      return new Response('Failed to stream media', { status: remoteRes.status || 502 });
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', contentType);
    responseHeaders.set('Content-Disposition', `attachment; filename="${safeAsciiFilename}"; filename*=UTF-8''${encodedFilename}`);
    responseHeaders.set('Cache-Control', 'public, max-age=3600');

    const contentLength = remoteRes.headers.get('content-length');
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    return new Response(remoteRes.body, {
      status: 200,
      headers: responseHeaders
    });
  } catch (err: any) {
    return new Response('Download proxy error: ' + err.message, { status: 500 });
  }
}
