export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const response = await fetch('https://newsarrow.in/news.json');
    const newsList = await response.json();
    
    const newsItem = newsList.find(n => String(n.id) === String(id)) || newsList[0];

    const title = newsItem ? newsItem.title : "News Arrow - ताज़ा और निष्पक्ष खबरें";
    const desc = newsItem ? (newsItem.metaDescription || newsItem.title) : "सटीक और निष्पक्ष ग्राउंड रिपोर्ट्स - News Arrow";
    
    // अगर खबर में डायरेक्ट लिंक है तो वही दिखे, नहीं तो News Arrow का ऑफिशियल पोस्टर (छोटा और फास्ट JPG)
    let image = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80";
    if (newsItem && newsItem.image && newsItem.image.startsWith('http')) {
      image = newsItem.image;
    }

    const redirectUrl = `https://newsarrow.in/?id=${encodeURIComponent(id || '')}`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(`<!DOCTYPE html>
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
  <meta property="og:image:type" content="image/jpeg">
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
  <p>लोड हो रहा है...</p>
</body>
</html>`);
  } catch (error) {
    res.redirect(302, `https://newsarrow.in/?id=${encodeURIComponent(id || '')}`);
  }
}
