#!/usr/bin/env python3
"""
Create a new blog post from blog-template.html.

Usage:
    python new_post.py

You'll be asked for a title, description, date and image. The URL, slug and
human-readable date are derived automatically, and every {{PLACEHOLDER}} in the
template is filled in.
"""

import html
import re
import sys
from datetime import date
from pathlib import Path

# --- Configuration: adjust these to your repo layout -------------------------
SITE_ROOT = "https://pitergroot.github.io/portfolio-2026/"
BLOG_URL = SITE_ROOT + "blog/"
DEFAULT_IMAGE = SITE_ROOT + "media/logo.png"

SCRIPT_DIR = Path(__file__).resolve().parent
TEMPLATE_PATH = SCRIPT_DIR / "blog/blog-template.html"
OUTPUT_DIR = SCRIPT_DIR / "blog"
# -----------------------------------------------------------------------------


def ask(prompt, default=None):
    """Prompt for input, falling back to a default when left empty."""
    suffix = f" [{default}]" if default else ""
    while True:
        value = input(f"{prompt}{suffix}: ").strip()
        if value:
            return value
        if default is not None:
            return default
        print("  This one is required.")


def slugify(text):
    """'Building Avalanche: A C++ Engine' -> 'building-avalanche-a-c-engine'"""
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def absolute_url(path_or_url):
    """Turn 'media/foo.png' into a full URL; leave full URLs untouched."""
    if path_or_url.startswith(("http://", "https://")):
        return path_or_url
    return SITE_ROOT + path_or_url.lstrip("/")


def parse_date(text):
    try:
        return date.fromisoformat(text)
    except ValueError:
        sys.exit(f"Invalid date '{text}', expected YYYY-MM-DD.")


def main():
    if not TEMPLATE_PATH.exists():
        sys.exit(f"Template not found: {TEMPLATE_PATH}")

    title = ask("Title")
    description = ask("Description")
    slug = slugify(ask("Slug (file name)", slugify(title)))
    published = parse_date(ask("Publish date (YYYY-MM-DD)", date.today().isoformat()))
    image = absolute_url(ask("Preview image (URL or path from site root)", DEFAULT_IMAGE))

    values = {
        "TITLE": html.escape(title),
        "DESCRIPTION": html.escape(description),
        "URL": f"{BLOG_URL}{slug}.html",
        "IMAGE": image,
        "DATE": published.isoformat(),
        # Built by hand because %-d (no leading zero) doesn't work on Windows
        "DATE_HUMAN": f"{published:%B} {published.day}, {published.year}",
    }

    content = TEMPLATE_PATH.read_text(encoding="utf-8")

    # Drop the placeholder documentation comment so it doesn't end up in the post
    content = re.sub(r"\s*<!--\s*Placeholders.*?-->", "", content, count=1, flags=re.DOTALL)

    for key, value in values.items():
        content = content.replace("{{" + key + "}}", value)

    leftover = sorted(set(re.findall(r"\{\{[A-Z_]+\}\}", content)))
    if leftover:
        print(f"Warning: unfilled placeholders: {', '.join(leftover)}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / f"{slug}.html"
    if out_path.exists():
        answer = input(f"{out_path.name} already exists. Overwrite? [y/N]: ").strip().lower()
        if answer != "y":
            sys.exit("Aborted, nothing written.")

    out_path.write_text(content, encoding="utf-8")
    print(f"\nCreated {out_path}")
    print(f"URL: {values['URL']}")


if __name__ == "__main__":
    main()