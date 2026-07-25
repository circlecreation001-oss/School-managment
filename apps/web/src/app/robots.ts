import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://schoolnex.in';

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard/', '/student/', '/teacher/', '/parent/', '/super-admin/', '/settings/', '/api/'] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
