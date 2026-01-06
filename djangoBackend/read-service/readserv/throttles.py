import json
from rest_framework.throttling import SimpleRateThrottle
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import Throttled

class XUserRateThrottle(SimpleRateThrottle):
    scope = "xuser"
    # Custom error message

    def throttle_failure(self):
        """
        Raise the Throttled exception with a custom message.
        """
        # Get the standard wait time calculated by SimpleRateThrottle
        wait = self.wait()
        
        # Define your custom message
        custom_message = f"too many requests. Calm down. Try again in a few seconds."
        
        raise Throttled(detail=custom_message, wait=wait)

    def get_cache_key(self, request, view):
        """
        Use X-User header instead of request.user
        """
        user_header = request.headers.get("X-User")
        if not user_header:
            return None 

        try:
            user_data = json.loads(user_header)
        except json.JSONDecodeError:
            return None

        user_id = user_data.get("id")
        user_type = user_data.get("type")

        if not user_id:
            return None

        return self.cache_format % {
            "scope": self.scope,
            "ident": f"{user_type}:{user_id}",
        }