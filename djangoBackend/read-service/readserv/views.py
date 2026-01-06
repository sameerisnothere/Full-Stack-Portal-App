from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from asgiref.sync import async_to_sync
from asgiref.sync import sync_to_async
import logging

from .config import TABLE_ACCESS
from .mixins import HeaderUserMixin, RBACMixin, QueryMixin, SerializerMixin
from .throttles import XUserRateThrottle

logger = logging.getLogger("myproject")


class GenericReadView(APIView, HeaderUserMixin, RBACMixin, QueryMixin, SerializerMixin):
    """
    Generic API View to handle dynamic table read requests with RBAC using mixins.
    """
    authentication_classes = []
    permission_classes = []
    throttle_classes = [XUserRateThrottle]

    TABLE_ACCESS = TABLE_ACCESS

    def get(self, request, *args, **kwargs):
        async def async_get_logic():
            
            # Extract user
            user = self.get_user_from_header(request)
            if not user or 'id' not in user or 'type' not in user:
                return Response({"error": "Unauthorized or invalid X-User header"}, status=status.HTTP_401_UNAUTHORIZED)

            user_id = user.get('id')
            source = request.query_params.dict()
            table_name = source.pop('tableName', None)

            if not table_name:
                return Response({"error": "Missing tableName"}, status=status.HTTP_400_BAD_REQUEST)

            # RBAC check
            config, error = self.check_access(table_name, user)
            if error:
                return Response({"error": error}, status=status.HTTP_403_FORBIDDEN if error == "Access denied" else status.HTTP_400_BAD_REQUEST)

            # Filters & password handling
            filters = {k: v for k, v in source.items() if k not in ['includePassword']}
            include_password = source.get('includePassword', 'false').lower() in ['true', '1']
            select_fields = list(config['select_fields'])
            if not include_password and 'password' in select_fields:
                select_fields.remove('password')

            # Query execution
            try:
                queryset = await self.get_queryset(config['model_name'], filters, config.get('pre_process'), config.get('post_process'), user)
            except Exception as e:
                logger.error(f"Query failed: {e}", exc_info=True)
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

            # Serialization
            try:
                data = await sync_to_async(self.serialize_queryset)(queryset, config['model_name'], select_fields)
            except Exception as e:
                logger.error(f"Serialization failed: {e}", exc_info=True)
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({"data": data}, status=status.HTTP_200_OK)

        return async_to_sync(async_get_logic)()
