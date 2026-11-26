// Only public routes addressed by the indexing audit. Protected routes are excluded.
export function publicCanonicalPath(path: string): string | undefined {
  if (path === '/tools/search' || path === '/tools/4d-search') return '/tools/4d-search';
  if (path === '/results/singapore') return '/results/cambodia';
  if (/^\/results\/(west-malaysia|east-malaysia|cambodia)$/.test(path)) return path;
  if (/^\/ai\/(west-malaysia|east-malaysia|cambodia|singapore)$/.test(path)) return path;
  if (path === '/history/cambodia' || path === '/history/singapore') return '/history/international';
  if (/^\/history\/(west-malaysia|east-malaysia|international)$/.test(path)) return path;
  if (/^\/history\/east-malaysia\/(sabah88|sandakan)\/(archive|\d{4}-\d{2}-\d{2})$/.test(path)) return path;
  return undefined;
}
