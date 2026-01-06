from rest_framework import serializers

class StudentUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    cnic = serializers.RegexField(r"^[0-9]{5}-[0-9]{7}-[0-9]$", required=False)
    phone = serializers.RegexField(r"^03[0-9]{9}$", required=False, allow_null=True, allow_blank=True)
    status = serializers.CharField(required=False)
    gender = serializers.CharField(required=False)
    newPassword = serializers.CharField(min_length=6, required=False)
    currentPassword = serializers.CharField(required=False)


class TeacherUpdateSerializer(StudentUpdateSerializer):
    pass


class AdminUpdateSerializer(StudentUpdateSerializer):
    pass


class CourseUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(required=False)
    credit_hours = serializers.IntegerField(required=False)
    teacherId = serializers.IntegerField(required=False)


class EnrollmentUpdateSerializer(serializers.Serializer):
    def validate(self, attrs):
        raise serializers.ValidationError("Enrollments cannot be updated")


schemas = {
    "student": StudentUpdateSerializer,
    "teacher": TeacherUpdateSerializer,
    "admin": AdminUpdateSerializer,
    "course": CourseUpdateSerializer,
    "enrollment": EnrollmentUpdateSerializer
}
