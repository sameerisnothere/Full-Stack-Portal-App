# throttles.py
import json
from rest_framework.throttling import SimpleRateThrottle

class XUserRateThrottle(SimpleRateThrottle):
    scope = "xuser"

    def get_cache_key(self, request, view):
        """
        Use X-User header instead of request.user
        """
        user_header = request.headers.get("X-User")
        if not user_header:
            return None  # fallback to anon throttle or no throttle

        try:
            user_data = json.loads(user_header)
        except json.JSONDecodeError:
            return None

        user_id = user_data.get("id")
        user_type = user_data.get("type")

        if not user_id:
            return None

        # Key format: throttle_xuser_<user_id>
        return self.cache_format % {
            "scope": self.scope,
            "ident": f"{user_type}:{user_id}",
        }
