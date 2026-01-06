# createserv/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from asgiref.sync import async_to_sync
import logging

from .config import TABLE_ACCESS
from .serializers import CreateInputSerializer, DATA_SERIALIZER_MAPPING
from .mixins import HeaderUserMixin, RBACMixin, ValidationMixin, InsertMixin
from .throttles import XUserRateThrottle
from createserv.exceptions import UniquenessError

logger = logging.getLogger("myproject")


class GenericCreateView(
    APIView,
    HeaderUserMixin,
    RBACMixin,
    ValidationMixin,
    InsertMixin
):
    authentication_classes = []
    permission_classes = []
    throttle_classes = [XUserRateThrottle]

    TABLE_ACCESS = TABLE_ACCESS
    DATA_SERIALIZER_MAPPING = DATA_SERIALIZER_MAPPING
    CreateInputSerializer = CreateInputSerializer

    def post(self, request, *args, **kwargs):
        async def async_post_logic():
            # Authentication
            user = self.get_user_from_header(request)
            if not user or 'id' not in user or 'type' not in user:
                return Response({"error": "Unauthorized or invalid X-User header"}, status=status.HTTP_401_UNAUTHORIZED)

            token = request.headers.get('Authorization', '')
            request_data = request.data.get('payload', request.data)

            # Validation
            try:
                table, validated_data = await self.validate_input(request_data)
            except Exception as e:
                logger.error(f"Validation failed: {e}", exc_info=True)
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            logger.info(f"Validated input for table '{table}' by user '{user.get('id')}'")

            # RBAC
            table_config, error = self.check_role_access(table, user.get('type'))
            if error:
                return Response({"error": error}, status=status.HTTP_403_FORBIDDEN)

            # Insertion
            try:
                inserted = await self.insert_records(table_config, validated_data, user, token, pre_process=table_config.get('pre_process'))
            except UniquenessError as e:
                # clean, user-facing error
                return Response(
                    {"error": str(e)},
                    status=409,
                )
            except Exception as e:
                logger.error(f"Insertion failed: {e}", exc_info=True)
                return Response({"error": f"Database insertion failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

            if not inserted:
                return Response({"error": "Failed to insert record(s)"}, status=status.HTTP_400_BAD_REQUEST)

            message = f"{len(inserted)} {table} records inserted successfully" if len(inserted) > 1 else f"{table} record inserted successfully"
            logger.info(message)
            return Response({"message": message}, status=status.HTTP_201_CREATED)

        return async_to_sync(async_post_logic)()
