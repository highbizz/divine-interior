import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const DEFAULT_TITLE = "Office Furnisho | Luxury Ergonomic Chairs & Executive Furniture";
const DEFAULT_DESCRIPTION = "India's premier brand for luxury ergonomic office chairs, executive seating, and modern workspace furniture. Designed for comfort, health, and peak productivity.";
const DEFAULT_KEYWORDS = "office chairs, ergonomic chairs, executive seating, mesh chairs, office furniture India, Office Furnisho";
const DEFAULT_IMAGE = "/banner/office-furnisho-logo.png";
const DEFAULT_SITE_URL = typeof window !== 'undefined' ? window.location.origin : "https://officefurnisho.com";

export const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
}: SEOProps) => {
  const fullTitle = title ? `${title} | Office Furnisho` : DEFAULT_TITLE;
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const metaKeywords = keywords || DEFAULT_KEYWORDS;
  const metaImage = image || DEFAULT_IMAGE;
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : DEFAULT_SITE_URL);

  useEffect(() => {
    // Document Title
    document.title = fullTitle;

    // Helper function to set or create meta tags
    const setMetaTag = (selector: string, attrName: string, attrValue: string, contentValue: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    // Helper for link canonical
    const setCanonicalLink = (href: string) => {
      let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Standard Meta Tags
    setMetaTag('meta[name="description"]', 'name', 'description', metaDescription);
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', metaKeywords);
    setMetaTag('meta[name="author"]', 'name', 'author', 'Office Furnisho');

    // OpenGraph Meta Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', metaDescription);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', metaImage);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'Office Furnisho');

    // Twitter Card Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', metaDescription);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', metaImage);

    // Canonical link
    setCanonicalLink(canonicalUrl);

  }, [fullTitle, metaDescription, metaKeywords, metaImage, canonicalUrl, type]);

  return null;
};

export default SEO;
