export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const requestUrl = new URL(req.url);
  const id = requestUrl.searchParams.get('id') || '';
  const userAgent = (req.headers.get('user-agent') || '').toLowerCase();

  // WhatsApp aur baki social bots
  const isBot = /facebookexternalhit|whatsapp|meta-externalagent|twitterbot|telegrambot/i.test(userAgent);

  const siteUrl = 'https://newsarrow.in';
  const redirectUrl = id ? `${siteUrl}/?id=${encodeURIComponent(id)}` : siteUrl;

  // Real user (jo link par click karega) seedhe khabar par jaye
  if (!isBot) {
    return Response.redirect(redirectUrl, 302);
  }

  // Fallback defaults
  let title = 'News Arrow - सच की बेबाक आवाज';
  let description = 'सटीक और निष्पक्ष खबर सिर्फ News Arrow पर।';
  let image = 'https://newsarrow.in/bhu.jpg';

  if (id) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(
        'https://raw.githubusercontent.com/ab141299/newsarrowlive/main/news.json',
        { signal: controller.signal, cache: 'no-store' }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const newsList = await res.json();
        const article = newsList.find((item) => String(item.id) === String(id));
        if (article) {
          title = article.title || title;
          description = article.metaDescription || article.title || description;
          if (article.image && article.image.startsWith('http')) {
            image = article.image.trim();
          }
        }
      }
    } catch (e) {}
  }

  const clean = (str) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  // Pure HTML for WhatsApp Crawler
  const html = `<!DOCTYPE html>
<html lang="hi" prefix="og: http://ogp.me/ns#">
<head>
  <meta charset="utf-8">
  <meta property="og:site_name" content="News Arrow">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${clean(title)}">
  <meta property="og:description" content="${clean(description)}">
  <meta property="og:image" content="${clean(image)}">
  <meta property="og:image:secure_url" content="${clean(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/jpeg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${clean(image)}">
  <title>${clean(title)}</title>
</head>
<body style="font-family:sans-serif;text-align:center;padding:20px;">
  <h2>${clean(title)}</h2>
  <img src="${clean(image)}" style="max-width:100%;height:auto;border-radius:8px;" alt="${clean(title)}">
  <p>${clean(description)}</p>
  <p><a href="${redirectUrl}">यहाँ क्लिक करके पूरी खबर पढ़ें</a></p>
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
