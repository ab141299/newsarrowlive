export default async function handler(req, res) {
  const { id } = req.query;
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();

  // WhatsApp aur baki bots ko detect karna
  const isBot = /facebookexternalhit|whatsapp|meta-externalagent|twitterbot|slackbot|telegrambot|linkedinbot/i.test(userAgent);

  const siteUrl = 'https://newsarrow.in';
  const redirectUrl = id ? `${siteUrl}/?id=${encodeURIComponent(id)}` : siteUrl;

  // Real user ko seedhe website par redirect karein
  if (!isBot) {
    return res.redirect(302, redirectUrl);
  }

  // Fallback defaults
  let title = 'News Arrow - सच की बेबाक आवाज';
  let description = 'सटीक और निष्पक्ष खबर सिर्फ News Arrow पर।';
  let image = 'https://newsarrow.in/bhu.jpg';

  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/ab141299/newsarrowlive/main/news.json',
      { headers: { 'User-Agent': 'NewsArrow-Bot' } }
    );

    if (response.ok) {
      const newsList = await response.json();
      const article = newsList.find((item) => String(item.id) === String(id));

      if (article) {
        title = article.title || title;
        description = article.metaDescription || article.title || description;
        if (article.image) {
          image = article.image.trim();
        }
      }
    }
  } catch (err) {}

  const escapeHtml = (val) =>
    String(val).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[c]));

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  return res.status(200).send(`<!DOCTYPE html>
<html lang="hi" prefix="og: http://ogp.me/ns#">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">

  <meta property="og:site_name" content="News Arrow">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:secure_url" content="${escapeHtml(image)}">
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
  <script>window.location.replace("${redirectUrl}");</script>
</body>
</html>`);
}
