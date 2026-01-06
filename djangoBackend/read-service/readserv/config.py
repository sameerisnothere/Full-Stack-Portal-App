# readserv/config.py
from django.db.models import Prefetch

# --- Post-processing functions ---

def course_post_process(queryset, user):
    """
    Enriches each course in the queryset with the teacher's name (sync version).
    """
    # Eagerly load the related 'teacher' data (equivalent to a JOIN)
    # The database operation is still deferred until the serializer runs.
    queryset = queryset.select_related('teacherId')

    # Return the modified queryset.
    return queryset


# --- Pre-processing functions ---

async def enrollment_pre_process(filters, user):
    """
    Ensures that students can only view their own enrollments.
    """
    if user and user.get('type') == 'student':
        # Apply filter to only show enrollments for the logged-in student's ID
        filters['studentId'] = user.get('id')
    return filters


# --- TABLE_ACCESS Configuration ---

# NOTE: Fields like 'password' are typically excluded at the Serializer level,
# but included here to support the special 'includePassword' logic.
# The `selectFields` define the fields exposed in the serializer.
TABLE_ACCESS = {
    'student': {
        'model_name': 'Student',
        'allowed_roles': ["admin", "teacher", "student"],
        'select_fields': ["id", "name", "email", "phone", "gender", "cnic", "status", "isDeleted", "password", "created_at"],
        'pre_process': None,
        'post_process': None,
    },

    'admin': {
        'model_name': 'Admin',
        'allowed_roles': ["admin", "teacher", "student"],
        'select_fields': ["id", "name", "email", "phone", "gender", "cnic", "status", "isDeleted", "password", "created_at"],
        'pre_process': None,
        'post_process': None,
    },

    'teacher': {
        'model_name': 'Teacher',
        'allowed_roles': ["admin", "teacher", "student"],
        'select_fields': ["id", "name", "email", "phone", "gender", "cnic", "status", "isDeleted", "password", "created_at"],
        'pre_process': None,
        'post_process': None,
    },

    'course': {
        'model_name': 'Course',
        'allowed_roles': ["admin", "teacher", "student"],
        'select_fields': ["id", "name", "teacherId", "credit_hours", "isDeleted", "created_at"],
        # The serializer will use the teacherName property defined there.
        'pre_process': None,
        'post_process': course_post_process,
    },

    'enrollment': {
        'model_name': 'Enrollment',
        'allowed_roles': ["admin", "student", "teacher"],
        'select_fields': ["id", "studentId", "courseId", "created_at"],
        'pre_process': enrollment_pre_process,
        'post_process': None,
    },
}