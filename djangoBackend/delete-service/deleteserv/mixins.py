from asgiref.sync import async_to_sync
from deleteserv.models import Admin, Teacher, Student, Course, Enrollment
from deleteserv.validation import validate_delete_payload
from deleteserv.access import access_rules

MODEL_MAP = {
    "student": Student,
    "teacher": Teacher,
    "course": Course,
    "enrollment": Enrollment,
    "admin": Admin,
}


class PayloadValidationMixin:
    """Mixin to validate delete payloads."""

    def validate_payload(self, payload):
        try:
            validate_delete_payload(payload)
        except Exception as e:
            raise ValueError(str(e))


class AuthorizationMixin:
    """Mixin to check user authorization for deletion."""

    def check_authorization(self, token, user, type_, id_list):
        before_hook = access_rules[type_]["before"]
        try:
            allowed, msg = async_to_sync(before_hook)(token, user, id_list)
        except Exception as e:
            raise PermissionError(f"Authorization hook failed: {e}")
        if not allowed:
            raise PermissionError(msg)


class DeletionMixin:
    """Mixin to perform soft or hard deletion."""

    def perform_deletion(self, type_, id_list):
        model = MODEL_MAP.get(type_)
        if not model:
            raise ValueError("Invalid type")

        if type_ == "enrollment":
            # HARD DELETE
            deleted_count, _ = model.objects.filter(id__in=id_list).delete()
            return deleted_count
        else:
            # SOFT DELETE
            objs = model.objects.filter(id__in=id_list)
            for obj in objs:
                obj.isDeleted = True
                if hasattr(obj, "status"):
                    obj.status = "inactive"
                obj.save()
            return objs.count()
