# updateserv/mixins/access_mixin.py

import logging
from django.http import JsonResponse
from asgiref.sync import async_to_sync
from updateserv.config.table_access import table_access

logger = logging.getLogger("myproject")

class AccessMixin:
    """Runs before_update hooks and checks permission."""

    def run_before_update(self, type_, token, user, id, validated):
        before_fn = getattr(table_access, f"{type_}_before_update")

        try:
            allowed, error, modified = async_to_sync(before_fn)(token, user, id, validated)
            return (allowed, error, modified), None

        except Exception as e:
            logger.error(
                f"Pre-update check failed for {type_} id={id}: {e}",
                exc_info=True
            )
            return None, JsonResponse({"error": str(e)}, status=400)
