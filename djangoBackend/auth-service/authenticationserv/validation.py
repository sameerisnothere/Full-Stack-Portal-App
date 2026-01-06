from rest_framework import serializers

class LoginSchema(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6)

class RegisterSchema(serializers.Serializer):
    type = serializers.ChoiceField(choices=["student", "teacher", "admin"])
    name = serializers.CharField(min_length=2, max_length=50)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6)
