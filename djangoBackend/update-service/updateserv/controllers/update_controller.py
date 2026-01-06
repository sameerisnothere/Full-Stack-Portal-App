# updateserv/views.py

import logging
from django.http import JsonResponse
from rest_framework.views import APIView

from updateserv.models import Admin, Teacher, Student, Course, Enrollment

from updateserv.mixins.payload_mixin import PayloadMixin
from updateserv.mixins.validation_mixin import ValidationMixin
from updateserv.mixins.access_mixin import AccessMixin
from updateserv.mixins.update_mixin import UpdateMixin
from updateserv.throttles import XUserRateThrottle
from updateserv.exceptions import UniquenessError


logger = logging.getLogger("myproject")

MODEL_MAP = {
    "student": Student,
    "teacher": Teacher,
    "admin": Admin,
    "course": Course,
    "enrollment": Enrollment,
}

class UpdateOne(
    PayloadMixin,
    ValidationMixin,
    AccessMixin,
    UpdateMixin,
    APIView
):
    """Generic Update Handler using Mixins"""
    throttle_classes = [XUserRateThrottle]
    
    def put(self, request, id):

        # ---------- Extract Payload ----------
        (payload, type_, data, token, user), error = self.extract_payload(request)
        if error:
            return error

        if not user:
            logger.info(f"Unauthorized attempt to update {type_} id={id}")
            return JsonResponse({"error": "Unauthorized"}, status=401)

        user_id = user.get("id")

        if type_ not in MODEL_MAP:
            logger.error(f"Invalid type '{type_}' from user {user_id}")
            return JsonResponse({"error": "Invalid type"}, status=400)

        # ---------- Validation ----------
        validated, error = self.validate_data(type_, data, user_id)
        if error:
            return error

        # ---------- Pre-update access check ----------
        try:
            result, error = self.run_before_update(
                type_, token, user, id, validated
            )

        except UniquenessError as e:
            return JsonResponse(
                {"error": str(e)},
                status=409,
            )

        except Exception as e:
            logger.error(f"Pre-update failed: {e}", exc_info=True)
            return JsonResponse(
                {"error": str(e)},
                status=400,
            )
        if error:
            return error
        
        allowed, reason, modified = result

        if not allowed:
            return JsonResponse({"error": reason}, status=403)

        # ---------- Perform update ----------
        model = MODEL_MAP[type_]
        return self.perform_update(model, id, modified, type_, user_id)
