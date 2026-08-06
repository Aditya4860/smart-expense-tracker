import pytest
from app.core.sanitization import sanitize_string, sanitize_dict_strings, escape_like_pattern


def test_sanitize_string_none():
    assert sanitize_string(None) is None


def test_sanitize_string_non_str():
    assert sanitize_string(123) == 123
    assert sanitize_string(45.67) == 45.67


def test_sanitize_string_clean_text():
    assert sanitize_string("Grocery Shopping at Trader Joe's") == "Grocery Shopping at Trader Joe's"


def test_sanitize_string_strips_scripts():
    payload = "Movie night <script>alert('xss')</script> with friends"
    assert sanitize_string(payload) == "Movie night  with friends"


def test_sanitize_string_strips_nested_html():
    payload = "<b>Important</b> <i>Expense</i> <div>Note</div>"
    assert sanitize_string(payload) == "Important Expense Note"


def test_sanitize_string_strips_event_handlers():
    payload = '<img src="x" onerror="alert(1)"> Dinner'
    assert sanitize_string(payload) == "Dinner"


def test_sanitize_string_strips_javascript_url():
    payload = '<a href="javascript:alert(1)">Click here</a>'
    assert sanitize_string(payload) == "Click here"


def test_sanitize_string_removes_null_bytes_and_control_chars():
    payload = "Secret\x00Note\x07Text\x1f"
    assert sanitize_string(payload) == "SecretNoteText"


def test_sanitize_string_escape_html_mode():
    payload = "<b>Important</b>"
    assert sanitize_string(payload, strip_tags=False) == "&lt;b&gt;Important&lt;/b&gt;"


def test_sanitize_dict_strings_recursive():
    nested_data = {
        "merchant": "Target <script>alert(1)</script>",
        "amount": 100.5,
        "details": {
            "notes": "Gift for friend <img src=x onerror=alert(2)>",
            "items": ["Item 1", "<b>Item 2</b>"]
        }
    }
    cleaned = sanitize_dict_strings(nested_data)
    assert cleaned["merchant"] == "Target"
    assert cleaned["amount"] == 100.5
    assert cleaned["details"]["notes"] == "Gift for friend"
    assert cleaned["details"]["items"] == ["Item 1", "Item 2"]


def test_escape_like_pattern_empty():
    assert escape_like_pattern("") == ""
    assert escape_like_pattern(None) == ""


def test_escape_like_pattern_wildcards():
    assert escape_like_pattern("100% discount") == "100\\% discount"
    assert escape_like_pattern("user_name") == "user\\_name"
    assert escape_like_pattern("path\\to\\file") == "path\\\\to\\\\file"
    assert escape_like_pattern("%_\\%") == "\\%\\_\\\\\\%"
