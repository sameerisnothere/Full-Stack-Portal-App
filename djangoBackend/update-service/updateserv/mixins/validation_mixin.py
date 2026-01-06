# updateserv/mixins/validation_mixin.py

import logging
from django.http import JsonResponse
from updateserv.validation.update_validation import schemas

logger = logging.getLogger("myproject")

class ValidationMixin:
    """Handles validation of incoming data."""

    def validate_data(self, type_, data, user_id):
        serializer = schemas[type_](data=data)

        try:
            serializer.is_valid(raise_exception=True)
            validated = serializer.validated_data
            logger.info(f"Payload validated for {type_} by user {user_id}")
            return validated, None

        except Exception as e:
            logger.error(
                f"Validation failed for {type_} by user {user_id}: {e}",
                exc_info=True
            )
            return None, JsonResponse({"error": str(e)}, status=400)
