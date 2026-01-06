# createserv/serializers.py
from rest_framework import serializers

# === COMMON REGEX ===
CNIC_REGEX = r'^[0-9]{5}-[0-9]{7}-[0-9]$' # e.g. 42101-1234567-9
PHONE_REGEX = r'^03[0-9]{9}$' # e.g. 03331234567

# --- Base Validation Serializer (Maps to Yup.object data fields) ---

class UserDataSerializer(serializers.Serializer):
    """Common fields for Student, Teacher, Admin."""
    name = serializers.CharField(max_length=100, required=True)
    email = serializers.EmailField(required=True)
    cnic = serializers.RegexField(
        regex=CNIC_REGEX,
        max_length=15,
        required=True,
        error_messages={'invalid': "Invalid CNIC format (e.g. 42101-1234567-9)"}
    )
    phone = serializers.RegexField(
        regex=PHONE_REGEX,
        max_length=11,
        required=False,
        allow_null=True,
        allow_blank=True,
        error_messages={'invalid': "Invalid phone number (e.g. 03331234567)"}
    )
    gender = serializers.CharField(max_length=10, required=False, allow_null=True, allow_blank=True)
    status = serializers.CharField(max_length=20, required=True)
    password = serializers.CharField(min_length=6, required=True)

class CourseDataSerializer(serializers.Serializer):
    name = serializers.CharField(min_length=3, max_length=50, required=True)
    teacherId = serializers.IntegerField(required=True)
    credit_hours = serializers.ChoiceField(choices=[1, 2, 3], required=True)

class EnrollmentDataSerializer(serializers.Serializer):
    studentId = serializers.IntegerField(required=False, allow_null=True) # Optional/auto-filled
    courseId = serializers.IntegerField(required=True)

# --- Top-Level Input Serializers (Maps to the outer Yup schema) ---

# We use the generic serializer to validate the structure: {table: "...", data: {...}}

class CreateInputSerializer(serializers.Serializer):
    """Top-level serializer to validate the `table` and `data` structure."""
    
    table = serializers.CharField(required=True)
    data = serializers.JSONField(required=True)

    def validate_table(self, value):
        if value not in ["student", "teacher", "admin", "course", "enrollment"]:
            raise serializers.ValidationError("Invalid table name.")
        return value

# Mapping the table name to its data-level serializer
DATA_SERIALIZER_MAPPING = {
    "student": UserDataSerializer,
    "teacher": UserDataSerializer,
    "admin": UserDataSerializer,
    "course": CourseDataSerializer,
    "enrollment": EnrollmentDataSerializer,
}

# No ModelSerializers are needed here, as we are only validating the input.