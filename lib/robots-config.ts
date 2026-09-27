export function getRobotsRules() {
  const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING !== 'false';

  if (!allowIndexing) {
    return {
      userAgent: '*',
      disallow: '/',
    };
  }

  return {
    userAgent: '*',
    allow: '/',
  };
}
