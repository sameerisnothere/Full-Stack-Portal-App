from django.core.exceptions import ValidationError

VALID_TYPES = ["student", "teacher", "course", "enrollment", "admin"]

def validate_delete_payload(data):
    type_ = data.get("type")
    ids = data.get("ids")
    id_ = data.get("id")

    if type_ not in VALID_TYPES:
        raise ValidationError("Invalid type")

    if ids:
        if not isinstance(ids, list) or not all(isinstance(x, int) and x > 0 for x in ids):
            raise ValidationError("Invalid ids array")

    if id_:
        if not isinstance(id_, int) or id_ <= 0:
            raise ValidationError("Invalid id")

    if not ids and not id_:
        raise ValidationError("Provide either ids list or id param")
