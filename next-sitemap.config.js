/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://witt-app.com',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
  exclude: ['/api/*', '/admin/*'],
  generateIndexSitemap: false,
  changefreq: 'weekly',
  priority: 0.7,
} 