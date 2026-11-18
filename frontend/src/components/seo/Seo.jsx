import { Helmet } from 'react-helmet-async';
import { useT } from '../../i18n/useT.js';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://kharna.in';

export default function Seo({
  title,
  description,
  image = '/og-image.svg',
  type = 'website',
  path,
  noIndex = false,
  jsonLd,
}) {
  const { t, lang } = useT();
  const siteTitle = t('common.siteTitle');
  const fullTitle = title ? `${title} · KHARNA` : siteTitle;
  const url = path ? `${SITE_URL}${path}` : SITE_URL;

  return (
    <Helmet htmlAttributes={{ lang }}>
      <title>{fullTitle}</title>
      <meta name="description" content={description || t('common.siteDescription')} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || t('common.siteDescription')} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${SITE_URL}${image}`} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || t('common.siteDescription')} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
