/** @type {import('next-sitemap').IConfig} */

module.exports = {
  siteUrl: process.env.SITE_URL || 'https://omshub.org',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/api/*', '/user/*'],
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://omshub.org/sitemap-courses.xml',
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/user/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
    ],
  },
  transform: async (config, path) => {
    // Higher priority for individual course pages
    if (path.startsWith('/course/') && path !== '/course') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      };
    }

    // Course catalog page - high priority
    if (path === '/course') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      };
    }

    // Home page highest priority
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      };
    }

    // Default transform
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    };
  },
  additionalPaths: async (config) => {
    // Fetch courses from the data repo and add them to sitemap
    const result = [];
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/omshub/data/main/static/courses.json'
      );
      const courses = await response.json();

      for (const courseId of Object.keys(courses)) {
        result.push({
          loc: `/course/${courseId}`,
          changefreq: 'daily',
          priority: 0.9,
          lastmod: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to fetch courses for sitemap:', error);
    }

    return result;
  },
};
