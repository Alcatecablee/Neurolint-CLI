import { useEffect } from 'react';

interface MetaTags {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  twitterCard?: string;
  twitterCreator?: string;
  twitterImage?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
  articleSection?: string;
  articleTag?: string[];
}

export const useMetaTags = (tags: MetaTags) => {
  useEffect(() => {
    const updateMetaTag = (name: string, content: string, property: boolean = false) => {
      let element = document.querySelector(`meta[${property ? 'property' : 'name'}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(property ? 'property' : 'name', name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Update title
    document.title = tags.title;
    updateMetaTag('title', tags.title);

    // Update description
    updateMetaTag('description', tags.description);

    // Update keywords if provided
    if (tags.keywords) {
      updateMetaTag('keywords', tags.keywords);
    }

    // Update Open Graph tags
    if (tags.ogTitle) updateMetaTag('og:title', tags.ogTitle, true);
    if (tags.ogDescription) updateMetaTag('og:description', tags.ogDescription, true);
    if (tags.ogImage) updateMetaTag('og:image', tags.ogImage, true);
    if (tags.ogUrl) updateMetaTag('og:url', tags.ogUrl, true);

    // Update canonical
    if (tags.canonical) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      // Force HTTPS and strip query params/hashes for canonical
      const canonicalUrl = new URL(tags.canonical, 'https://www.neurolint.dev');
      canonicalUrl.protocol = 'https:';
      canonicalUrl.search = '';
      canonicalUrl.hash = '';
      canonical.href = canonicalUrl.toString();
    }

    // Update Twitter tags
    if (tags.twitterCard) updateMetaTag('twitter:card', tags.twitterCard);
    if (tags.twitterCreator) updateMetaTag('twitter:creator', tags.twitterCreator);
    if (tags.twitterImage) updateMetaTag('twitter:image', tags.twitterImage);

    // Update Article schema tags (for rich snippets)
    if (tags.articlePublishedTime) updateMetaTag('article:published_time', tags.articlePublishedTime, true);
    if (tags.articleModifiedTime) updateMetaTag('article:modified_time', tags.articleModifiedTime, true);
    if (tags.articleAuthor) updateMetaTag('article:author', tags.articleAuthor, true);
    if (tags.articleSection) updateMetaTag('article:section', tags.articleSection, true);
    
    // Clean up old article:tag meta elements
    const oldArticleTags = document.querySelectorAll('meta[property="article:tag"]');
    oldArticleTags.forEach((tag) => tag.remove());
    
    // Add new article:tag meta elements
    if (tags.articleTag && tags.articleTag.length > 0) {
      tags.articleTag.forEach((tag) => {
        const element = document.createElement('meta');
        element.setAttribute('property', 'article:tag');
        element.content = tag;
        document.head.appendChild(element);
      });
    }

    return () => {
      // Cleanup old article tags on unmount
      const tagElements = document.querySelectorAll('meta[property="article:tag"]');
      tagElements.forEach((el) => el.remove());
    };
  }, [tags]);
};
