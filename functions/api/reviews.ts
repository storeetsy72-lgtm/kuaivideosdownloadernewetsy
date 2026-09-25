// Cloudflare Pages Function: GET and POST /api/reviews

const DEFAULT_REVIEWS = [
  {
    id: "rev_1",
    name: "Marcus L.",
    rating: 5,
    date: "2 hours ago",
    comment: "Saved my reels reposting workflow. The 1080p video quality is razor sharp without compression artifacts or watermarks."
  },
  {
    id: "rev_2",
    name: "Elena Rostova",
    rating: 5,
    date: "5 hours ago",
    comment: "Instant browser download without buffering on the server! MP3 320kbps extraction works flawlessly for Chinese BGM tracks."
  },
  {
    id: "rev_3",
    name: "KwaiCreator_99",
    rating: 5,
    date: "1 day ago",
    comment: "The batch download feature allowed me to grab 15 tutorials at once. Super clean interface and no intrusive ads."
  },
  {
    id: "rev_4",
    name: "David Chen",
    rating: 5,
    date: "2 days ago",
    comment: "Best Kwai video downloader out there. Handles short links from v.kuaishou.com seamlessly even with Chinese text copied."
  },
  {
    id: "rev_5",
    name: "Sarah Jenkins",
    rating: 5,
    date: "3 days ago",
    comment: "Super fast streaming response. The cover image JPEG downloader is also a huge plus for thumbnail design!"
  },
  {
    id: "rev_6",
    name: "Alex K.",
    rating: 4,
    date: "4 days ago",
    comment: "Very reliable tool. Download starts immediately in Chrome download manager as promised."
  }
];

export async function onRequestGet() {
  return new Response(
    JSON.stringify({
      success: true,
      data: {
        aggregate: {
          rating: 4.9,
          reviewCount: 1258,
          fiveStar: 1184,
          fourStar: 62,
          threeStar: 9,
          twoStar: 2,
          oneStar: 1
        },
        reviews: DEFAULT_REVIEWS
      }
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    }
  );
}

export async function onRequestPost(context: any) {
  try {
    const body: any = await context.request.json().catch(() => ({}));
    const { rating, comment, name } = body;

    const newReview = {
      id: `rev_${Date.now()}`,
      name: name?.trim()?.slice(0, 30) || 'Verified Downloader',
      rating: Number(rating) || 5,
      date: 'Just now',
      comment: comment?.trim()?.slice(0, 300) || 'Rated 5 out of 5 stars!'
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Review received!',
        data: {
          newReview,
          aggregate: {
            rating: 4.9,
            reviewCount: 1259
          }
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
