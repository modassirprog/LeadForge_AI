import re
import ipaddress
import socket
import httpx
from bs4 import BeautifulSoup
from typing import Set, Optional
from urllib.parse import urlparse, urljoin
from backend.app.core.config import settings

EMAIL_REGEX = re.compile(
    r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
)

BLOCKED_EXTENSIONS = (
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".css", ".js", ".woff", ".woff2"
)

BLOCKED_DOMAINS = {
    "example.com", "domain.com", "email.com", "sentry.io", "wixpress.com"
}

def is_safe_public_ip(host: str) -> bool:
    """
    SSRF Protection: Checks that host resolves strictly to a public, routable IP.
    Blocks private subnets (RFC 1918), loopback, and cloud instance metadata (169.254.169.254).
    """
    try:
        ip_str = socket.gethostbyname(host)
        ip = ipaddress.ip_address(ip_str)

        if (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_reserved
            or ip.is_multicast
            or str(ip).startswith("169.254.")
        ):
            return False
        return True
    except Exception:
        return False

class SSRFSafeCrawler:
    @classmethod
    async def extract_emails_from_site(cls, base_url: str) -> Set[str]:
        """
        Crawls public landing, contact, and about pages safely to find published business emails.
        """
        if not base_url or not base_url.startswith("http"):
            return set()

        parsed = urlparse(base_url)
        host = parsed.netloc.split(":")[0]

        if not is_safe_public_ip(host):
            return set()

        emails_found: Set[str] = set()
        pages_to_crawl = [
            base_url,
            urljoin(base_url, "/contact"),
            urljoin(base_url, "/contact-us"),
            urljoin(base_url, "/about"),
            urljoin(base_url, "/about-us"),
        ]

        headers = {
            "User-Agent": settings.CRAWLER_USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }

        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True, verify=False) as client:
            for page_url in pages_to_crawl[:3]: # Limit to max 3 pages
                try:
                    resp = await client.get(page_url, headers=headers)
                    if resp.status_code == 200:
                        cls._extract_emails_from_html(resp.text[:500000], emails_found)
                        if len(emails_found) >= 3:
                            break
                except Exception:
                    continue

        return emails_found

    @classmethod
    def _extract_emails_from_html(cls, html_text: str, result_set: Set[str]):
        soup = BeautifulSoup(html_text, "html.parser")

        # 1. Search for mailto: links
        for a in soup.find_all("a", href=True):
            href = a["href"].strip()
            if href.lower().startswith("mailto:"):
                clean_email = href[7:].split("?")[0].strip().lower()
                if cls._is_valid_business_email(clean_email):
                    result_set.add(clean_email)

        # 2. Regex scan for emails in text
        matches = EMAIL_REGEX.findall(html_text)
        for m in matches:
            clean_email = m.lower().strip()
            if cls._is_valid_business_email(clean_email):
                result_set.add(clean_email)

    @classmethod
    def _is_valid_business_email(cls, email: str) -> bool:
        if not email or "@" not in email:
            return False
        if any(email.endswith(ext) for ext in BLOCKED_EXTENSIONS):
            return False
        domain = email.split("@")[-1]
        if domain in BLOCKED_DOMAINS or "." not in domain:
            return False
        return True
