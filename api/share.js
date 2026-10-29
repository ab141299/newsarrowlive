export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const requestUrl = new URL(req.url);
  const id = requestUrl.searchParams.get('id') || '';
  const userAgent = req.headers.get('user-agent') || '';

  // Check if WhatsApp or Facebook bot is fetching preview
  const isBot = /facebookexternalhit|whatsapp|meta-externalagent|twitterbot|slackbot|telegrambot/i.test(userAgent);

  const siteUrl = 'https://www.newsarrow.in';
  const redirectUrl = id ? `${siteUrl}/?id=${encodeURIComponent(id)}` : siteUrl;

  // Agar aam insaan browser me link khole, to seedhe website par bhej do
  if (!isBot) {
    return Response.redirect(redirectUrl, 302);
  }

  // Agar bot (WhatsApp) aaye, to news.json se data uthao
  let title = 'News Arrow - सच की बेबाक आवाज';
  let description = 'सटीक और निष्पक्ष खबर सिर्फ News Arrow पर।';
  let image = 'https://i.ibb.co/s9Vdv2jy/1000151887-photoidcom-cropped.png';

  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/ab141299/newsarrowlive/main/news.json',
      { headers: { accept: 'application/json' }, cache: 'no-store' }
    );

    if (response.ok) {
      const newsList = await response.json();
      const article = newsList.find((item) => String(item.id) === String(id));

      if (article) {
        title = article.title || title;
        description = article.metaDescription || article.title || description;
        if (article.image && /^https?:\/\//i.test(article.image)) {
          image = article.image;
        }
      }
    }
  } catch (error) {
    // Keep fallback metadata if fetch fails
  }

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));

  const html = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- OpenGraph WhatsApp Meta Tags -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="News Arrow">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:secure_url" content="${escapeHtml(image)}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}">
  <script>window.location.href = "${redirectUrl}";</script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=60, s-maxage=300',
    },
  });
}
