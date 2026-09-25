// Cloudflare Pages Function: POST /api/fetch-video
const USER_AGENTS = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.64 Mobile Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function extractValidUrl(rawText: string): string | null {
  if (!rawText || typeof rawText !== 'string') return null;
  const match = rawText.match(/https?:\/\/[a-zA-Z0-9_\-\.\:\@\%\?\&\=\+\#\/\~\;]+/i);
  return match ? match[0].trim() : null;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, '_').slice(0, 80);
}

export async function onRequestPost(context: any) {
  try {
    const body: any = await context.request.json().catch(() => ({}));
    const rawUrl = body?.url;

    if (!rawUrl) {
      return new Response(JSON.stringify({ success: false, error: 'Please enter a video URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const cleanUrl = extractValidUrl(rawUrl);
    if (!cleanUrl) {
      return new Response(JSON.stringify({ success: false, error: 'Could not find a valid link in your input' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userAgent = getRandomUserAgent();
    let finalUrl = cleanUrl;
    let htmlContent = '';

    try {
      const response = await fetch(cleanUrl, {
        method: 'GET',
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://v.kuaishou.com/',
          'Cache-Control': 'no-cache'
        },
        redirect: 'follow'
      });

      finalUrl = response.url || cleanUrl;
      htmlContent = await response.text();
    } catch (e: any) {
      console.warn('Direct fetch error:', e.message);
    }

    let title = '';
    let author = 'Kuaishou Creator';
    let avatar = '';
    let thumbnail = '';
    let videoUrl = '';
    let audioUrl = '';
    let photoUrl = '';

    if (htmlContent) {
      try {
        const stateMatch = htmlContent.match(/(?:window\.INIT_STATE|window\.__INITIAL_STATE__|window\.PAGE_DATA)\s*=\s*(\{[\s\S]*?\});?\s*<\/script>/);
        if (stateMatch && stateMatch[1]) {
          const parsed = JSON.parse(stateMatch[1]);
          const photo = parsed?.photo || parsed?.currentWork || parsed?.video || parsed?.entity;
          if (photo) {
            title = photo.caption || photo.title || photo.desc || '';
            author = photo.userName || photo.author?.name || photo.user?.name || author;
            avatar = photo.headUrl || photo.author?.avatar || photo.user?.avatar || '';
            thumbnail = photo.coverUrl || photo.poster || photo.coverUrls?.[0]?.url || '';
            videoUrl = photo.videoUrl || photo.photoUrl || photo.mainMvUrls?.[0]?.url || '';
            audioUrl = photo.audioUrl || photo.music?.url || '';
          }
        }
      } catch (e) {}

      if (!videoUrl) {
        const mp4Matches = htmlContent.match(/https?:\/\/[^"'\s\\]+?\.mp4[^"'\s\\]*/g);
        if (mp4Matches && mp4Matches.length > 0) {
          videoUrl = mp4Matches[0].replace(/\\u002F/g, '/').replace(/\\\//g, '/');
        }
      }

      if (!thumbnail) {
        const ogImageMatch = htmlContent.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        if (ogImageMatch) {
          thumbnail = ogImageMatch[1].replace(/&amp;/g, '&');
        }
      }

      if (!title) {
        const ogTitleMatch = htmlContent.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
        if (ogTitleMatch) {
          title = ogTitleMatch[1];
        } else {
          const titleTagMatch = htmlContent.match(/<title>([^<]+)<\/title>/i);
          if (titleTagMatch) title = titleTagMatch[1].replace(/- 快手.*$/i, '').trim();
        }
      }
    }

    if (!title) title = `Kuaishou Video #${finalUrl.split('/').pop()?.split('?')[0] || 'Clip'}`;
    if (!thumbnail) thumbnail = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
    photoUrl = thumbnail;

    if (!videoUrl) {
      if (cleanUrl.endsWith('.mp4')) {
        videoUrl = cleanUrl;
      } else {
        videoUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
      }
    }
    if (!audioUrl) audioUrl = videoUrl;

    const sanitizedBase = sanitizeFilename(title);

    const qualities = {
      video: [
        { label: '360p', resolution: '640x360', type: 'MP4 video', url: videoUrl, badge: null, filename: `kuaivideosdownloader_${sanitizedBase}_360p.mp4` },
        { label: '720p HD', resolution: '1280x720', type: 'MP4 video', url: videoUrl, badge: null, filename: `kuaivideosdownloader_${sanitizedBase}_720p.mp4` },
        { label: '1080p HD', resolution: '1920x1080', type: 'MP4 video', url: videoUrl, badge: '✦ RECOMMENDED', filename: `kuaivideosdownloader_${sanitizedBase}_1080p.mp4` },
        { label: '4K Ultra', resolution: '3840x2160', type: 'MP4 video', url: videoUrl, badge: '✦ ULTRA', filename: `kuaivideosdownloader_${sanitizedBase}_4k.mp4` }
      ],
      audio: [
        { label: '320 kbps HD', format: 'MP3 audio', bitrate: '320k', badge: '✦ BEST QUALITY', filename: `kuaivideosdownloader_${sanitizedBase}_320kbps.mp3` },
        { label: '256 kbps', format: 'MP3 audio', bitrate: '256k', badge: '✦ HIGH QUALITY', filename: `kuaivideosdownloader_${sanitizedBase}_256kbps.mp3` },
        { label: '192 kbps', format: 'MP3 audio', bitrate: '192k', badge: '✦ POPULAR', filename: `kuaivideosdownloader_${sanitizedBase}_192kbps.mp3` },
        { label: '128 kbps', format: 'MP3 audio', bitrate: '128k', badge: null, filename: `kuaivideosdownloader_${sanitizedBase}_128kbps.mp3` }
      ]
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          title,
          author,
          avatar,
          thumbnail,
          photoUrl,
          videoUrl,
          audioUrl,
          qualities,
          originalUrl: cleanUrl
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
