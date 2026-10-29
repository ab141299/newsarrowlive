
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || '';

  const fallbackImage =
    'https://i.ibb.co/s9Dv2jJy/1000151887-photoaidcom-cropped.png';

  let imageUrl = fallbackImage;

  if (id) {
    try {
      const newsRes = await fetch(
        'https://raw.githubusercontent.com/ab141299/newsarrowlive/main/news.json',
        {
          headers: {
            accept: 'application/json',
          },
        }
      );

      if (newsRes.ok) {
        const newsList = await newsRes.json();

        const item = newsList.find(
          n => String(n.id) === String(id)
        );

        if (
          item &&
          typeof item.image === 'string' &&
          /^https?:\/\//i.test(item.image)
        ) {
          imageUrl = item.image;
        }
      }
    } catch (e) {
      // खबर की सूची न मिलने पर डिफॉल्ट फोटो इस्तेमाल होगी।
    }
  }

  try {
    const imageRes = await fetch(imageUrl, {
      headers: {
        'user-agent': 'NewsArrowImageProxy/1.0',
        accept: 'image/*',
      },
    });

    if (!imageRes.ok) {
      return new Response('Image unavailable', {
        status: 502,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'cache-control': 'public, max-age=60',
        },
      });
    }

    const contentType =
      imageRes.headers.get('content-type') || 'image/jpeg';

    return new Response(imageRes.body, {
      status: 200,
      headers: {
        'content-type': contentType,
        'cache-control': 'public, s-maxage=3600, max-age=3600',
        'x-content-type-options': 'nosniff',
      },
    });
  } catch (e) {
    return new Response('Image unavailable', {
      status: 502,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'public, max-age=60',
      },
    });
  }
}
