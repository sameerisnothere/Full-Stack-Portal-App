import jwt
import bcrypt
from datetime import datetime, timedelta
from django.conf import settings
from authenticationserv.models import Student, Teacher, Admin

JWT_SECRET = settings.SECRET_KEY

def generate_token(user):
    payload = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "type": user["type"],
        "exp": datetime.utcnow() + timedelta(hours=1),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def find_user_by_email(email):
    for model, user_type in [
        (Student, "student"),
        (Teacher, "teacher"),
        (Admin, "admin")
    ]:
        try:
            obj = model.objects.get(email=email)
            return obj, user_type
        except model.DoesNotExist:
            continue
    return None, None
