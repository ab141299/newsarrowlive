export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || '';

  let title = "News Arrow - ताज़ा और निष्पक्ष खबरें";
  let desc = "सटीक और निष्पक्ष ग्राउंड रिपोर्ट्स - News Arrow";
  
  // News Arrow की अपनी रिपॉजिटरी की फ़ोटो (WhatsApp इसे कभी ब्लॉक नहीं करेगा)
  let image = "https://newsarrow.in/AD.png";

  try {
    const res = await fetch('https://newsarrow.in/news.json', { cache: 'no-store' });
    if (res.ok) {
      const newsList = await res.json();
      const newsItem = newsList.find(n => String(n.id) === String(id));
      if (newsItem) {
        title = newsItem.title || title;
        desc = newsItem.metaDescription || newsItem.title || desc;
        // अगर खबर में असली https फ़ोटो लिंक है (Base64 नहीं) तो वही दिखे
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
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="News Arrow">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:secure_url" content="${image}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${redirectUrl}">

  <!-- Twitter Meta Tags -->
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
