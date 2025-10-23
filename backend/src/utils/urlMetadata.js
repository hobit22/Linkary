import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Extract metadata from a URL
 * @param {string} url - The URL to extract metadata from
 * @returns {Object} Metadata object containing title, description, image, and favicon
 */
export const extractMetadata = async (url) => {
  try {
    // Fetch the HTML content
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract title
    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      '';

    // Extract description
    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    // Extract image
    let image =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      '';

    // Convert relative image URL to absolute
    if (image && !image.startsWith('http')) {
      const urlObj = new URL(url);
      image = `${urlObj.protocol}//${urlObj.host}${image.startsWith('/') ? '' : '/'}${image}`;
    }

    // Extract favicon
    let favicon =
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      '';

    // Convert relative favicon URL to absolute
    if (favicon && !favicon.startsWith('http')) {
      const urlObj = new URL(url);
      favicon = `${urlObj.protocol}//${urlObj.host}${favicon.startsWith('/') ? '' : '/'}${favicon}`;
    } else if (!favicon) {
      // Default to /favicon.ico
      const urlObj = new URL(url);
      favicon = `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
    }

    return {
      title: title.trim(),
      description: description.trim(),
      image,
      favicon,
    };
  } catch (error) {
    console.error('Error extracting metadata:', error.message);

    // Return basic metadata if extraction fails
    try {
      const urlObj = new URL(url);
      return {
        title: urlObj.hostname,
        description: '',
        image: '',
        favicon: `${urlObj.protocol}//${urlObj.host}/favicon.ico`,
      };
    } catch (urlError) {
      return {
        title: url,
        description: '',
        image: '',
        favicon: '',
      };
    }
  }
};
