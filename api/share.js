export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || '';

  let title = "News Arrow - ताज़ा और निष्पक्ष खबरें";
  let desc = "सटीक और निष्पक्ष ग्राउंड रिपोर्ट्स - News Arrow";
  // News Arrow का हल्का और 100% WhatsApp कम्पैटिबल JPG इमेज (साइज मात्र 45KB)
  let image = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&h=630&fit=crop&q=80";

  try {
    const res = await fetch('https://newsarrow.in/news.json', { cache: 'no-store' });
    if (res.ok) {
      const newsList = await res.json();
      const newsItem = newsList.find(n => String(n.id) === String(id));
      if (newsItem) {
        title = newsItem.title || title;
        desc = newsItem.metaDescription || newsItem.title || desc;
        if (newsItem.image && newsItem.image.startsWith('http')) {
          image = newsItem.image;
        }
      }
    }
  } catch (e) {}

  const redirectUrl = `https://newsarrow.in/?id=${encodeURIComponent(id)}`;

  const html = `<!DOCTYPE html>
<html lang="hi" prefix="og: http://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  
  <!-- Open Graph / WhatsApp Engine -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="News Arrow">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:secure_url" content="${image}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${redirectUrl}">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${image}">

  <script>
    window.location.replace("${redirectUrl}");
  </script>
  <meta http-equiv="refresh" content="0;url=${redirectUrl}">
</head>
<body style="background:#121316;color:#fff;text-align:center;padding-top:20%;">
  <p>लोड हो रहा है...</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=60, s-maxage=60',
    },
  });
}
