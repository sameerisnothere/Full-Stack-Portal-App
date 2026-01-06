# updateserv/mixins/update_mixin.py

import logging
from django.http import JsonResponse

logger = logging.getLogger("myproject")

class UpdateMixin:
    """Performs the actual DB update operation."""

    def perform_update(self, model, id, modified, type_, user_id):
        try:
            updated = model.objects.filter(id=id).update(**modified)

            if updated == 0:
                logger.warning(
                    f"{type_} id={id} not found for update by user {user_id}"
                )
                return JsonResponse({"error": f"{type_} not found"}, status=404)

        except Exception as e:
            logger.error(
                f"Database update failed for {type_} id={id} by user {user_id}: {e}",
                exc_info=True
            )
            return JsonResponse({"error": "Database update failed"}, status=500)

        logger.info(f"{type_} id={id} updated successfully by user {user_id}")
        return JsonResponse({"message": f"{type_} updated successfully"})
