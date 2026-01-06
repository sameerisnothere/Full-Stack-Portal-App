# updateserv/mixins/payload_mixin.py

import logging
from django.http import JsonResponse

logger = logging.getLogger("myproject")

class PayloadMixin:
    """Extracts and validates base payload values."""

    def extract_payload(self, request):
        payload = request.data

        if not payload:
            logger.error("Missing payload wrapper in request")
            return None, JsonResponse({"error": "Missing payload wrapper"}, status=400)

        type_ = payload.get("type")
        data = payload.get("data")
        token = request.headers.get("Authorization", "")
        user = getattr(request, "user_data", None)

        return (payload, type_, data, token, user), None
