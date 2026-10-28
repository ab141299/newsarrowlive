export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || '';

  let title = "News Arrow - ताज़ा और निष्पक्ष ग्राउंड रिपोर्ट्स";
  let desc = "वाराणसी और देश-दुनिया की ताज़ा और प्रामाणिक खबरों के लिए News Arrow पढ़ें।";
  
  // टेस्टेड और एक्टिव इमेज (HTTP 200 Verified)
  let image = "https://i.ibb.co/s9Dv2jJy/1000151887-photoaidcom-cropped.png";

  try {
    const res = await fetch('https://newsarrow.in/news.json');
    if (res.ok) {
      const newsList = await res.json();
      const newsItem = newsList.find(n => String(n.id) === String(id));
      if (newsItem) {
        if (newsItem.title) title = newsItem.title;
        if (newsItem.metaDescription) desc = newsItem.metaDescription;
        if (newsItem.image && newsItem.image.startsWith('http')) {
          image = newsItem.image;
        }
      }
    }
  } catch (e) {}

  const redirectUrl = `https://newsarrow.in/?id=${encodeURIComponent(id)}`;

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
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
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
      'cache-control': 'public, max-age=60',
    },
  });
}
