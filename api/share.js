export default async function handler(req, res) {
  const { id } = req.query;

  try {
    // news.json से खबरें फेच करें
    const response = await fetch('https://newsarrow.in/news.json');
    const newsList = await response.json();
    
    // संबंधित खबर ढूंढें
    const newsItem = newsList.find(n => String(n.id) === String(id)) || newsList[0];

    const title = newsItem ? newsItem.title : "News Arrow - ताज़ा और निष्पक्ष खबरें";
    const desc = newsItem ? (newsItem.metaDescription || newsItem.title) : "सटीक और निष्पक्ष ग्राउंड रिपोर्ट्स - News Arrow";
    const image = (newsItem && newsItem.image && newsItem.image.startsWith('http')) 
                  ? newsItem.image 
                  : "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png";
    const redirectUrl = `https://newsarrow.in/?id=${encodeURIComponent(id || '')}`;

    // WhatsApp बॉट के लिए शुद्ध HTML मेटा टैग्स लौटाएं
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="hi">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <meta name="description" content="${desc}">
        
        <!-- Open Graph WhatsApp Cards -->
        <meta property="og:type" content="article">
        <meta property="og:site_name" content="News Arrow">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${desc}">
        <meta property="og:image" content="${image}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:url" content="${redirectUrl}">
        
        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:description" content="${desc}">
        <meta name="twitter:image" content="${image}">

        <!-- असली यूजर को सीधे खबर पर रीडायरेक्ट करें -->
        <script>
          window.location.replace("${redirectUrl}");
        </script>
        <meta http-equiv="refresh" content="0;url=${redirectUrl}">
      </head>
      <body style="background:#121316;color:#fff;font-family:sans-serif;text-align:center;padding-top:20%;">
        <p>लोड हो रहा है... कृपया प्रतीक्षा करें...</p>
      </body>
      </html>
    `);
  } catch (error) {
    res.redirect(302, `https://newsarrow.in/?id=${encodeURIComponent(id || '')}`);
  }
}
