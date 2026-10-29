
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || '';

  let title = "News Arrow - ताज़ा और निष्पक्ष ग्राउंड रिपोर्ट्स";
  let desc = "सटीक और निष्पक्ष ग्राउंड रिपोर्ट्स - News Arrow";
  let sourceImage = "https://i.ibb.co/s9Dv2jJy/1000151887-photoaidcom-cropped.png";

  if (id) {
    try {
      const res = await fetch(
        'https://raw.githubusercontent.com/ab141299/newsarrowlive/main/news.json'
      );

      if (res.ok) {
        const newsList = await res.json();
        const item = newsList.find(n => String(n.id) === String(id));

        if (item) {
          if (item.title) title = item.title;
          if (item.metaDescription) desc = item.metaDescription;

          if (item.image && item.image.startsWith('http')) {
            sourceImage = item.image;
          }
        }
      }
    } catch (e) {}
  }

  const image = id
    ? `https://newsarrow.in/api/og-image?id=${encodeURIComponent(id)}`
    : sourceImage;

  const redirectUrl =
    `https://newsarrow.in/?id=${encodeURIComponent(id)}`;

  const html = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${desc}">

  <meta property="og:type" content="article">
  <meta property="og:site_name" content="News Arrow">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:secure_url" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${redirectUrl}">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${image}">

  <script>
    window.location.replace("${redirectUrl}");
  </script>
  <meta http-equiv="refresh" content="0;url=${redirectUrl}">
</head>
<body style="background:#121316;color:#fff;text-align:center;padding-top:20%;">
  <p>News Arrow लोड हो रहा है...</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
    },
  });
}
