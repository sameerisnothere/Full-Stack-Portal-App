from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging

from deleteserv.mixins import PayloadValidationMixin, AuthorizationMixin, DeletionMixin
from .throttles import XUserRateThrottle

logger = logging.getLogger("myproject")  # Custom logger


class DeleteDataAPIView(PayloadValidationMixin, AuthorizationMixin, DeletionMixin, APIView):
    """
    DRF APIView for deleting resources.
    """
    throttle_classes = [XUserRateThrottle]

    def delete(self, request, id=None):
        body = request.data
        type_ = body.get("type")
        ids = body.get("ids")
        token = request.headers.get("Authorization")
        user = getattr(request, "user_data", None)

        if not user:
            logger.info(f"Unauthorized delete attempt for type '{type_}'")
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        user_id = user.get("id")
        payload = {"type": type_, "ids": ids, "id": id}

        # Validate payload
        try:
            self.validate_payload(payload)
            logger.info(f"Payload validated for delete request on type '{type_}' by user {user_id}")
        except Exception as e:
            logger.error(f"Payload validation failed for user {user_id}: {e}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Prepare ID list
        id_list = [id] if id else ids
        if not id_list:
            logger.warning(f"No IDs provided for deletion by user {user_id} on type '{type_}'")
            return Response({"error": "No IDs provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Check authorization
        try:
            self.check_authorization(token, user, type_, id_list)
        except PermissionError as e:
            logger.info(f"Delete denied for {type_} IDs {id_list} by user {user_id}: {e}")
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)

        # Perform deletion
        try:
            deleted_count = self.perform_deletion(type_, id_list)
            logger.info(f"Deleted {deleted_count} {type_}(s) by user {user_id}")
        except Exception as e:
            logger.error(f"Deletion failed for {type_} IDs {id_list} by user {user_id}: {e}", exc_info=True)
            return Response({"error": "Deletion failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": f"{type_}(s) deleted successfully"}, status=status.HTTP_200_OK)
