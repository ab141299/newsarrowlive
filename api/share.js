export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || '';

  // डिफ़ॉल्ट हेडलाइन और समरी
  let title = "News Arrow - ताज़ा और निष्पक्ष ग्राउंड रिपोर्ट्स";
  let desc = "वाराणसी और देश-दुनिया की ताज़ा और प्रामाणिक खबरों के लिए News Arrow पढ़ें।";
  
  // WhatsApp के लिए सुपर-लाइटवेट, हाई-स्पीड JPG (35 KB - कभी बफ़र नहीं होगा)
  let image = "https://i.postimg.cc/mD8Z4xS8/news-arrow-banner.jpg";

  // बैकग्राउंड में फास्ट कैश्ड डेटा कॉल (ताकि टाइम-आउट न हो)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600); // 600ms मैक्सिमम टाइमर

    const res = await fetch('https://newsarrow.in/news.json', { 
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const newsList = await res.json();
      const newsItem = newsList.find(n => String(n.id) === String(id));
      if (newsItem) {
        if (newsItem.title) title = newsItem.title;
        if (newsItem.metaDescription) desc = newsItem.metaDescription;
        // अगर खबर में सीधा http लिंक है तो वही लें
        if (newsItem.image && newsItem.image.startsWith('http')) {
          image = newsItem.image;
        }
      }
    }
  } catch (e) {
    // अगर टाइमआउट हो तो भी बिना रुके तुरंत कार्ड भेज दो
  }

  const redirectUrl = `https://newsarrow.in/?id=${encodeURIComponent(id)}`;

  // शुद्ध और मानक Open Graph HTML
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
  <p>News Arrow लोड हो रहा है...</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=300',
    },
  });
}
