const config = require('./next-sitemap.config');

describe('next-sitemap robots config', () => {
  it('blocks crawler-heavy dynamic surfaces without blocking normal pages', () => {
    expect(config.exclude).toEqual(expect.arrayContaining(['/api/*', '/user/*']));
    expect(config.robotsTxtOptions.policies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userAgent: '*',
          allow: '/',
          disallow: expect.arrayContaining(['/api/', '/api/og/', '/user/']),
        }),
        expect.objectContaining({
          userAgent: 'Googlebot',
          allow: '/',
          disallow: expect.arrayContaining(['/api/', '/api/og/', '/user/']),
        }),
      ])
    );
  });
});
