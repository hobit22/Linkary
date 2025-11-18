"""Service for extracting metadata from URLs."""

import requests
from bs4 import BeautifulSoup
from typing import Dict
from urllib.parse import urljoin, urlparse

from app.core.constants import USER_AGENT, DEFAULT_REQUEST_TIMEOUT


class MetadataExtractor:
    """Extract metadata from URLs."""

    def __init__(self):
        self.headers = {
            'User-Agent': USER_AGENT
        }

    def extract(self, url: str) -> Dict[str, str]:
        """
        Extract metadata from a URL.

        Args:
            url: The URL to extract metadata from

        Returns:
            Dictionary containing title, description, favicon, and image
        """
        try:
            response = requests.get(
                url, headers=self.headers, timeout=DEFAULT_REQUEST_TIMEOUT
            )
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')

            metadata = {
                'title': self._extract_title(soup, url),
                'description': self._extract_description(soup),
                'favicon': self._extract_favicon(soup, url),
                'image': self._extract_image(soup, url),
            }

            return metadata

        except Exception as e:
            print(f"Error extracting metadata from {url}: {str(e)}")
            return {
                'title': url,
                'description': '',
                'favicon': '',
                'image': '',
            }

    def _extract_title(self, soup: BeautifulSoup, url: str) -> str:
        """Extract page title."""
        # Try OpenGraph title
        og_title = soup.find('meta', property='og:title')
        if og_title and og_title.get('content'):
            return og_title['content']

        # Try Twitter title
        twitter_title = soup.find('meta', attrs={'name': 'twitter:title'})
        if twitter_title and twitter_title.get('content'):
            return twitter_title['content']

        # Try regular title tag
        title = soup.find('title')
        if title and title.string:
            return title.string.strip()

        # Fallback to URL
        return url

    def _extract_description(self, soup: BeautifulSoup) -> str:
        """Extract page description."""
        # Try OpenGraph description
        og_desc = soup.find('meta', property='og:description')
        if og_desc and og_desc.get('content'):
            return og_desc['content']

        # Try Twitter description
        twitter_desc = soup.find('meta', attrs={'name': 'twitter:description'})
        if twitter_desc and twitter_desc.get('content'):
            return twitter_desc['content']

        # Try meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            return meta_desc['content']

        return ''

    def _extract_favicon(self, soup: BeautifulSoup, url: str) -> str:
        """Extract favicon URL."""
        # Try standard favicon link
        favicon = soup.find('link', rel=lambda x: x and 'icon' in x.lower())
        if favicon and favicon.get('href'):
            return self._make_absolute_url(favicon['href'], url)

        # Fallback to /favicon.ico
        parsed = urlparse(url)
        return f"{parsed.scheme}://{parsed.netloc}/favicon.ico"

    def _extract_image(self, soup: BeautifulSoup, url: str) -> str:
        """Extract preview image."""
        # Try OpenGraph image
        og_image = soup.find('meta', property='og:image')
        if og_image and og_image.get('content'):
            return self._make_absolute_url(og_image['content'], url)

        # Try Twitter image
        twitter_image = soup.find('meta', attrs={'name': 'twitter:image'})
        if twitter_image and twitter_image.get('content'):
            return self._make_absolute_url(twitter_image['content'], url)

        # Try first image in content
        first_img = soup.find('img', src=True)
        if first_img:
            return self._make_absolute_url(first_img['src'], url)

        return ''

    def _make_absolute_url(self, link: str, base_url: str) -> str:
        """Convert relative URL to absolute URL."""
        return urljoin(base_url, link)


# Singleton instance
metadata_extractor = MetadataExtractor()
