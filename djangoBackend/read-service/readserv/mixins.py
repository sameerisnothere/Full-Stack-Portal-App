# readserv/mixins.py
import json
import logging
from django.apps import apps
from asgiref.sync import sync_to_async

logger = logging.getLogger("myproject")

class HeaderUserMixin:
    """Extracts and validates user from X-User header."""

    def get_user_from_header(self, request):
        user_header = request.headers.get('X-User')
        if not user_header:
            logger.info("Missing X-User header")
            return None
        try:
            user_data = json.loads(user_header)
            return user_data
        except json.JSONDecodeError:
            logger.error("Failed to decode X-User header", exc_info=True)
            return None


class RBACMixin:
    """Handles role-based access control based on TABLE_ACCESS."""

    TABLE_ACCESS = {}  # override this in your view

    def check_access(self, table_name, user):
        table = table_name.lower().strip()
        config = self.TABLE_ACCESS.get(table)
        if not config:
            return None, f"Invalid tableName '{table}'"
        if user.get('type') not in config['allowed_roles']:
            return None, "Access denied"
        return config, None


class QueryMixin:
    """Handles querying the database with filters, pre/post processing, and async execution."""

    async def get_queryset(self, model_name, filters, pre_process=None, post_process=None, user=None):
        try:
            model_class = apps.get_model('readserv', model_name)
        except LookupError:
            raise ValueError(f"Model '{model_name}' not found")

        # Pre-processing
        if pre_process:
            filters = await pre_process(filters, user)

        queryset = await sync_to_async(model_class.objects.filter)(**filters)

        # Post-processing
        if post_process:
            queryset = post_process(queryset, user)

        return queryset


class SerializerMixin:
    """Handles dynamic serialization of querysets."""

    def serialize_queryset(self, queryset, model_name, select_fields):
        from .serializers import create_dynamic_serializer, CourseSerializer

        SerializerClass = CourseSerializer if model_name.lower() == "course" else create_dynamic_serializer(
            apps.get_model('readserv', model_name),
            fields=select_fields
        )
        serializer = SerializerClass(queryset, many=True)
        return serializer.data
