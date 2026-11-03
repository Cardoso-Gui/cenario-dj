"""Dependency-free checks for the static site. Run: python3 -m unittest discover -s tests -v."""

from html.parser import HTMLParser
from pathlib import Path
import unittest
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]
SITE_URL = "https://cardoso-gui.github.io/flavinnho-site/"


class Document(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.elements = []
        self.feed(path.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))

    def meta(self, key):
        return [attrs.get("content") for tag, attrs in self.elements
                if tag == "meta" and (attrs.get("property") == key or attrs.get("name") == key)]


class SiteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pages = {path.name: Document(path) for path in ROOT.glob("*.html")}
        cls.home = cls.pages["index.html"]

    def test_booking_is_first_primary_button(self):
        buttons = [attrs for tag, attrs in self.home.elements
                   if tag == "a" and "button" in attrs.get("class", "").split()]
        self.assertEqual(buttons[0]["href"], "./contato.html")
        self.assertIn("primary", buttons[0]["class"].split())
        self.assertIn("open.spotify.com/", buttons[1]["href"])
        self.assertIn("outline", buttons[1]["class"].split())
        self.assertNotIn("primary", buttons[1]["class"].split())

    def test_home_share_metadata(self):
        self.assertEqual(self.home.meta("og:url"), [SITE_URL])
        canonical = [attrs["href"] for tag, attrs in self.home.elements
                     if tag == "link" and attrs.get("rel") == "canonical"]
        self.assertEqual(canonical, [SITE_URL])
        for key in ("og:type", "og:locale", "og:site_name", "og:title", "og:description",
                    "og:image", "og:image:alt", "og:image:type", "og:image:width",
                    "og:image:height", "twitter:card", "twitter:title", "twitter:description",
                    "twitter:image", "twitter:image:alt"):
            with self.subTest(key=key):
                values = self.home.meta(key)
                self.assertEqual(len(values), 1)
                self.assertTrue(values[0])
        image = self.home.meta("og:image")[0]
        self.assertTrue(image.startswith(SITE_URL))
        self.assertTrue((ROOT / image.removeprefix(SITE_URL)).is_file())
        self.assertEqual(self.home.meta("twitter:image"), [image])
        self.assertEqual(self.home.meta("og:image:secure_url"), [image])
        self.assertEqual(self.home.meta("twitter:card"), ["summary"])

    def test_local_resources_and_link_targets_exist(self):
        for filename, document in self.pages.items():
            for tag, attrs in document.elements:
                for key in ("href", "src", "poster"):
                    value = attrs.get(key, "")
                    if not value:
                        continue
                    url = urlsplit(value)
                    if url.scheme or url.netloc:
                        continue
                    with self.subTest(page=filename, tag=tag, url=value):
                        target = ROOT / (url.path or filename)
                        self.assertTrue(target.is_file(), str(target))
                        if url.fragment and target.suffix == ".html":
                            target_doc = self.pages[target.name]
                            ids = [data.get("id") for _, data in target_doc.elements]
                            self.assertIn(url.fragment, ids)

    def test_current_page_and_stylesheet_order(self):
        for filename, document in self.pages.items():
            with self.subTest(page=filename):
                current = [attrs["href"] for tag, attrs in document.elements
                           if tag == "a" and attrs.get("aria-current") == "page"]
                self.assertEqual(current, ["./" + filename])
                styles = [urlsplit(attrs["href"]).path for tag, attrs in document.elements
                          if tag == "link" and attrs.get("rel") == "stylesheet"]
                self.assertEqual(styles[:2], ["./css/styles.css", "./css/theme.css"])
                self.assertEqual(document.meta("viewport"), ["width=device-width, initial-scale=1"])

    def test_new_tab_links_remain_safe(self):
        for filename, document in self.pages.items():
            for tag, attrs in document.elements:
                if tag == "a" and attrs.get("target") == "_blank":
                    with self.subTest(page=filename, href=attrs.get("href")):
                        self.assertTrue({"noopener", "noreferrer"}.issubset(attrs.get("rel", "").split()))


if __name__ == "__main__":
    unittest.main()
