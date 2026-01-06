# readserv/serializers.py
from rest_framework import serializers
# Import all your models
from .models import Admin, Teacher, Student, Course, Enrollment, Token 

# --- Dynamic Serializer Factory ---
def create_dynamic_serializer(model_class, fields):
    """
    Dynamically creates a ModelSerializer class for a given model and list of fields.
    This uses type() to overcome the NameError in the nested Meta class.
    """
    # 1. Define the Meta class attributes dynamically
    meta_attributes = {
        'model': model_class,
        'fields': fields, # Now we can pass the argument 'fields' here
    }

    # 2. Create the Meta class using type()
    # type(name, bases, dict) -> type(name, tuple of base classes, dictionary of attributes)
    DynamicMeta = type('Meta', (object,), meta_attributes)

    # 3. Create the DynamicSerializer class
    serializer_attributes = {
        'Meta': DynamicMeta
    }
    
    # Create the final Serializer class dynamically, inheriting from ModelSerializer
    DynamicSerializer = type(
        f'{model_class.__name__}DynamicSerializer', 
        (serializers.ModelSerializer,), 
        serializer_attributes
    )
    
    return DynamicSerializer


# --- Custom Course Serializer for Post-Processing ---
class CourseSerializer(serializers.ModelSerializer):
    """
    Specific serializer for Course model to include the related teacher's name.
    """
    # This field fetches the related teacher's name.
    teacherName = serializers.CharField(source='teacherId.name', read_only=True)

    class Meta:
        model = Course
        # Ensure all required fields are included here, including the custom one
        fields = ['id', 'name', 'teacherId', 'credit_hours', 'isDeleted', 'created_at', 'teacherName'] 
        extra_kwargs = {
            'teacherId': {'read_only': True},
            'teacherName': {'read_only': True}
        }