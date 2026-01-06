from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.utils import timezone
import jwt, bcrypt
from datetime import datetime
from authenticationserv.models import Token, Student, Teacher, Admin
from authenticationserv.validation import LoginSchema, RegisterSchema
from authenticationserv.throttling import check_throttle, add_failed_attempt, reset_attempts
from authenticationserv.utils import find_user_by_email, generate_token
from django.conf import settings
import logging

logger = logging.getLogger("myproject")

JWT_SECRET = settings.SECRET_KEY


@api_view(["POST"])
def login(request):

    # raise Exception("Testing email logging")
    
    schema = LoginSchema(data=request.data.get("payload"))
    schema.is_valid(raise_exception=True)
    data = schema.validated_data

    email = data["email"]
    password = data["password"]

    if not check_throttle(email):
        logger.info("Too many failed attempts. Try again in 5 minutes.")
        return Response({"message": "Too many failed attempts. Try again in 5 minutes."}, status=429)

    user, user_type = find_user_by_email(email)
    if not user:
        add_failed_attempt(email)
        logger.info("Email not registered.")
        return Response({"message": "Email not registered."}, status=407)

    if user.status == "inactive":
        logger.info("Inactive users cannot login.")
        return Response({"message": "Inactive users cannot login."}, status=407)

    if not bcrypt.checkpw(password.encode(), user.password.encode()):
        add_failed_attempt(email)
        logger.info("Invalid password.")
        return Response({"message": "Invalid password."}, status=407)

    reset_attempts(email)

    Token.objects.filter(user_id=user.id, user_type=user_type).delete()

    payload = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "type": user_type,
    }

    token = generate_token(payload)
    decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    expiry = datetime.fromtimestamp(decoded["exp"])

    Token.objects.create(
        user_id=user.id,
        user_type=user_type,
        token=token,
        expires_at=expiry
    )

    logger.info("Logged in successfully")
    return Response({"message": "Logged in successfully", "token": token, "user": payload})


@api_view(["POST"])
def logout(request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        logger.info("No token provided")
        return Response({"message": "No token provided"}, status=400)

    token = auth.split(" ")[1]
    Token.objects.filter(token=token).delete()

    logger.info("Logged out successfully")
    return Response({"message": "Logged out successfully"})


@api_view(["GET"])
def me(request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        logger.info("Not authenticated")
        return Response({"message": "Not authenticated"}, status=401)

    token = auth.split(" ")[1]

    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if not Token.objects.filter(token=token).exists():
            logger.info("Session expired or invalid")
            return Response({"message": "Session expired or invalid"}, status=401)

        logger.info(f"User: {decoded}")
        return Response({"user": decoded})
    except Exception:
        logger.error("JWT decode failed", exc_info=True)
        return Response({"message": "Invalid or expired token"}, status=401)


@api_view(["POST"])
def register(request):
    schema = RegisterSchema(data=request.data)
    schema.is_valid(raise_exception=True)
    data = schema.validated_data

    user_type = data["type"]
    name = data["name"]
    email = data["email"]
    password = data["password"]

    exists = (
        Student.objects.filter(email=email).exists() or
        Teacher.objects.filter(email=email).exists() or
        Admin.objects.filter(email=email).exists()
    )

    if exists:
        logger.info("Email already exists")
        return Response({"error": "Email already exists"}, status=400)

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    model = {"student": Student, "teacher": Teacher, "admin": Admin}[user_type]
    model.objects.create(name=name, email=email, password=hashed)

    logger.info("registered successfully")
    return Response({"message": f"{user_type} registered successfully"})
