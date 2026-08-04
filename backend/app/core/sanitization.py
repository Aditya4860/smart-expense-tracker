import re
import html
from typing import Optional

# Regex pattern for malicious HTML/script tags and events
HTML_TAG_PATTERN = re.compile(r"<[^>]*?>", re.IGNORECASE)
SCRIPT_PATTERN = re.compile(r"<\s*script[^>]*?>.*?<\s*/\s*script\s*>", re.IGNORECASE | re.DOTALL)
EVENT_HANDLER_PATTERN = re.compile(r"on\w+\s*=\s*([\"'][^\"']*[\"']|[^\s>]+)", re.IGNORECASE)
JAVASCRIPT_URL_PATTERN = re.compile(r"javascript\s*:", re.IGNORECASE)
CONTROL_CHAR_PATTERN = re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]")

def sanitize_string(value: Optional[str], strip_tags: bool = True) -> Optional[str]:
    """
    Sanitize text input:
    - Removes ASCII control characters.
    - Strips script tags, HTML tags (if strip_tags is True), or escapes HTML.
    - Neutralizes javascript: pseudo-protocols and inline event handlers.
    - Trims excess whitespace.
    """
    if value is None:
        return None
    
    if not isinstance(value, str):
        return value

    # Remove non-printable control characters
    text = CONTROL_CHAR_PATTERN.sub("", value)

    # Strip script blocks completely
    text = SCRIPT_PATTERN.sub("", text)

    # Strip or neutralize dangerous javascript: pseudo-protocols
    text = JAVASCRIPT_URL_PATTERN.sub("", text)

    # Strip event handlers like onerror=, onclick=
    text = EVENT_HANDLER_PATTERN.sub("", text)

    if strip_tags:
        # Strip all HTML tags
        text = HTML_TAG_PATTERN.sub("", text)
    else:
        # Escape HTML entities
        text = html.escape(text)

    return text.strip()


def sanitize_dict_strings(data: dict) -> dict:
    """Recursively sanitize all string fields in a dictionary."""
    sanitized = {}
    for k, v in data.items():
        if isinstance(v, str):
            sanitized[k] = sanitize_string(v)
        elif isinstance(v, dict):
            sanitized[k] = sanitize_dict_strings(v)
        elif isinstance(v, list):
            sanitized[k] = [
                sanitize_string(item) if isinstance(item, str)
                else sanitize_dict_strings(item) if isinstance(item, dict)
                else item
                for item in v
            ]
        else:
            sanitized[k] = v
    return sanitized


def escape_like_pattern(query: str) -> str:
    """
    Escape SQL LIKE/ILIKE wildcards (%, _, \\) to prevent LIKE injection or unintended matching.
    """
    if not query:
        return ""
    # Escape backslashes first, then % and _
    escaped = query.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return escaped.strip()

