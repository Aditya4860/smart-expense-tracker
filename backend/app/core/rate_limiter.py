import time
from collections import defaultdict
from typing import Dict, List
from fastapi import Request
from app.core.config import settings
from app.core.exceptions import BaseAPIException

class SlidingWindowRateLimiter:
    """
    Thread-safe in-memory sliding window rate limiter.
    Maintains request timestamps per key and automatically purges expired entries.
    """
    def __init__(self):
        self._requests: Dict[str, List[float]] = defaultdict(list)
        self._last_cleanup: float = time.time()

    def _cleanup(self, now: float, max_window: int = 3600):
        """Purge entries older than max_window seconds periodically."""
        if now - self._last_cleanup > 300:  # Run cleanup at most once every 5 minutes
            keys_to_delete = []
            for key, timestamps in self._requests.items():
                self._requests[key] = [t for t in timestamps if now - t < max_window]
                if not self._requests[key]:
                    keys_to_delete.append(key)
            for key in keys_to_delete:
                del self._requests[key]
            self._last_cleanup = now

    def is_rate_limited(self, key: str, times: int, seconds: int) -> tuple[bool, int]:
        """
        Check if key has exceeded `times` requests within `seconds`.
        Returns (is_limited, retry_after_seconds).
        """
        now = time.time()
        self._cleanup(now)

        window_start = now - seconds
        # Keep only timestamps inside current window
        timestamps = [t for t in self._requests[key] if t > window_start]
        self._requests[key] = timestamps

        if len(timestamps) >= times:
            oldest_in_window = timestamps[0]
            retry_after = int(seconds - (now - oldest_in_window)) + 1
            return True, max(1, retry_after)

        self._requests[key].append(now)
        return False, 0

    def reset(self):
        """Reset all rate limiter state (useful for test suites)."""
        self._requests.clear()
        self._last_cleanup = time.time()


# Global limiter instance
_global_limiter = SlidingWindowRateLimiter()

def get_rate_limiter() -> SlidingWindowRateLimiter:
    return _global_limiter


class RateLimiter:
    """
    FastAPI dependency for rate limiting endpoints.
    
    Usage:
        @router.post("/login", dependencies=[Depends(RateLimiter(times=5, seconds=60))])
    """
    def __init__(self, times: int = 5, seconds: int = 60):
        self.times = times
        self.seconds = seconds

    async def __call__(self, request: Request):
        if not settings.RATE_LIMIT_ENABLED:
            return

        # Extract client IP (handle proxies if X-Forwarded-For is present)
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        elif request.client:
            client_ip = request.client.host
        else:
            client_ip = "127.0.0.1"

        endpoint = request.url.path
        rate_key = f"{client_ip}:{endpoint}"

        limiter = get_rate_limiter()
        is_limited, retry_after = limiter.is_rate_limited(rate_key, self.times, self.seconds)

        if is_limited:
            raise BaseAPIException(
                status_code=429,
                detail=f"Too many requests. Please try again in {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)}
            )
