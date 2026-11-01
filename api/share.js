export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const requestUrl = new URL(req.url);
  const id = requestUrl.searchParams.get('id') || '';
  const userAgent = (req.headers.get('user-agent') || '').toLowerCase();

  const isBot = /facebookexternalhit|whatsapp|meta-externalagent|twitterbot|telegrambot/i.test(userAgent);

  const siteUrl = 'https://newsarrow.in';
  const redirectUrl = id ? `${siteUrl}/?id=${encodeURIComponent(id)}` : siteUrl;

  // Real user clicks -> Direct redirect to site
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

  const isPng = image.toLowerCase().endsWith('.png');
  const mimeType = isPng ? 'image/png' : 'image/jpeg';

  const html = `<!DOCTYPE html>
<html lang="hi" prefix="og: http://ogp.me/ns#">
<head>
  <meta charset="utf-8">
  <title>${clean(title)}</title>
  <meta name="description" content="${clean(description)}">
  
  <meta property="og:site_name" content="News Arrow">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${requestUrl.href}">
  <meta property="og:title" content="${clean(title)}">
  <meta property="og:description" content="${clean(description)}">
  
  <meta property="og:image" content="${clean(image)}">
  <meta property="og:image:secure_url" content="${clean(image)}">
  <meta property="og:image:type" content="${mimeType}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${clean(title)}">
  <meta name="twitter:description" content="${clean(description)}">
  <meta name="twitter:image" content="${clean(image)}">
</head>
<body>
  <h1>${clean(title)}</h1>
  <p>${clean(description)}</p>
  <img src="${clean(image)}" alt="${clean(title)}" />
  <script>location.replace("${redirectUrl}");</script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=600',
    },
  });
}
