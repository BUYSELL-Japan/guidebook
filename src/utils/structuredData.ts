import type { GuideItem } from './language';

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

export function generateWebPageSchema(
  title: string,
  description: string,
  url: string,
  imageUrl?: string,
  language?: string
) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": url
  };

  if (imageUrl) {
    schema.image = imageUrl;
  }

  if (language) {
    schema.inLanguage = language;
  }

  return schema;
}

export function generateTouristAttractionSchema(
  guideData: GuideItem,
  language: 'en' | 'zh-tw',
  url: string
) {
  const name = language === 'zh-tw'
    ? (guideData.name_zh_tw || guideData.name_ja)
    : (guideData.name_en || guideData.name_ja);

  const description = language === 'zh-tw'
    ? (guideData.summary_zh_tw || guideData.summary_ja)
    : (guideData.summary_en || guideData.summary_ja);

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "name": name,
    "description": description,
    "url": url
  };

  if (guideData.main_image_url) {
    schema.image = guideData.main_image_url;
  }

  if (guideData.address_en || guideData.address_zh_tw) {
    const address = language === 'zh-tw'
      ? (guideData.address_zh_tw || guideData.address_en)
      : (guideData.address_en || guideData.address_zh_tw);

    if (address) {
      schema.address = {
        "@type": "PostalAddress",
        "addressLocality": "Okinawa",
        "addressRegion": "Okinawa Prefecture",
        "addressCountry": "JP",
        "streetAddress": address
      };
    }
  }

  return schema;
}

export function generateHreflangTags(
  enUrl: string,
  zhTwUrl: string,
  currentUrl: string
) {
  return [
    { rel: 'alternate', hreflang: 'en', href: enUrl },
    { rel: 'alternate', hreflang: 'zh', href: zhTwUrl },
    { rel: 'alternate', hreflang: 'x-default', href: enUrl },
    { rel: 'canonical', href: currentUrl }
  ];
}
