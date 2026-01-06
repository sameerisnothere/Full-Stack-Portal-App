# createserv/config.py
import json
import httpx # Use httpx for asynchronous HTTP requests
from asgiref.sync import sync_to_async
from createserv.exceptions import UniquenessError

# !!! IMPORTANT: SET YOUR READ SERVICE URL HERE !!!
# In a real setup, this would come from settings.py or environment variables.
# createserv/config.py

# This must be the correct URL, with NO space at the end of the string.
READ_SERVICE_URL = "http://localhost:4000/read/api/get-data"
#                                         ^ NO SPACE HERE

async def check_global_uniqueness(user, token, data):
    tables = ["student", "teacher", "admin"]

    async with httpx.AsyncClient(timeout=10.0) as client:
        for table in tables:
            try:
                response = await client.get(
                    READ_SERVICE_URL,
                    params={"tableName": table},
                    headers={
                        "X-User": json.dumps(user),
                        "Authorization": token,
                    },
                )
                response.raise_for_status()

                rows = response.json().get("data", [])

                exists = next((
                    obj for obj in rows
                    if obj.get("isDeleted") is False and (
                        (data.get("email") and obj.get("email") == data["email"]) or
                        (data.get("cnic") and obj.get("cnic") == data["cnic"]) or
                        (data.get("phone") and obj.get("phone") == data["phone"])
                    )
                ), None)

                if exists:
                    raise UniquenessError(
                        f"User with same email, CNIC, or phone already exists"
                    )

            except httpx.HTTPError:
                raise Exception("Failed to communicate with Read Service during uniqueness check.")

# --- Pre-processing Functions ---

async def user_pre_process(user, token, data):
    """Preprocess for student, teacher, admin."""
    # This function is async and will be awaited in the view.
    await check_global_uniqueness(user, token, data)
    return data

async def course_pre_process(user, token, data):
    """Preprocess for course: Checks for duplicate course names."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(
                READ_SERVICE_URL,
                params={"tableName": "course"},
                headers={
                    "X-User": json.dumps(user),
                    "Authorization": token,
                },
            )
            response.raise_for_status()
            existing = response.json().get('data', [])

            # Check for conflict: same name AND not soft-deleted
            conflict = next((
                s for s in existing 
                if s.get('name') == data.get('name') and s.get('isDeleted') is False
            ), None)

            if conflict:
                # Raise a domain-specific error
                raise UniquenessError(f"A course with the name '{data.get('name')}' already exists")

        except httpx.HTTPError:
            raise Exception("Failed to communicate with Read Service during course validation.")

    return data

# createserv/config.py
# ... (rest of imports and functions)

async def enrollment_pre_process(user, token, data):
    """Preprocess for enrollment: auto-assigns studentId, validates course, prevents duplicates."""
    
    if not user:
        raise Exception("Unauthorized")

    # --- New Fix Start: Normalize data to a list of records ---
    # Ensure we are iterating over a list, even if only one record was passed.
    records = data if isinstance(data, list) else [data]
    # --- New Fix End ---
    
    # The final list of records ready for insertion
    final_records = []
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Iterate over the list of individual enrollment records
        for record in records:
            
            # 1. Auto-assign studentId if the user is a student
            if user.get('type') == "student":
                record['studentId'] = user.get('id')
            
            student_id = record.get('studentId')
            course_id = record.get('courseId')

            if not student_id or not course_id:
                # Should be caught by serializer, but good safety check
                continue 

            try:
                print("user: ", user)
                print("token: ", token)
                # 2. Validate course existence
                course_response = await client.get(
                    READ_SERVICE_URL,
                    params={"tableName": "course", "id": course_id},
                    headers={"X-User": json.dumps(user), "Authorization": token},
                )
                print("course response: ", course_response)
                print("course_response.json()", course_response.json())
                course_response.raise_for_status()
                courses = course_response.json().get('data', [])
                
                if not courses:
                    raise Exception(f"Invalid courseId {course_id} — course does not exist")

                # 3. Check for duplicate enrollment
                enrollment_response = await client.get(
                    READ_SERVICE_URL,
                    params={"tableName": "enrollment"},
                    headers={"X-User": json.dumps(user), "Authorization": token},
                )
                enrollment_response.raise_for_status()
                existing_enrollments = enrollment_response.json().get('data', [])
                
                already_enrolled = next((
                    e for e in existing_enrollments 
                    if e.get('studentId') == student_id and e.get('courseId') == course_id
                ), None)

                if already_enrolled:
                    print(f"Skipping duplicate enrollment: courseId {course_id}")
                    continue

                courses_response = await client.get(
                    READ_SERVICE_URL,
                    params={"tableName": "course"},
                    headers={"X-User": json.dumps(user), "Authorization": token},
                )
                courses_response.raise_for_status()
                allCourses = courses_response.json().get('data', [])

                enrolled_course_ids = [
                    e.get("courseId")
                    for e in existing_enrollments
                    if e.get("studentId") == student_id
                ]

                enrolled_courses = []

                for course in allCourses:
                    if course.get("id") in enrolled_course_ids:
                        enrollment = next(
                            (
                                e for e in existing_enrollments
                                if e.get("studentId") == student_id
                                and e.get("courseId") == course.get("id")
                            ),
                            None,
                        )

                        enrolled_courses.append({
                            **course,
                            "enrollmentId": enrollment.get("id") if enrollment else None,
                        })
                
                total_credit_hours = sum(
                    int(course.get("credit_hours") or 0)
                    for course in enrolled_courses
                )

                current_course = courses[0]
                current_course_credits = int(current_course.get("credit_hours") or 0)

                if total_credit_hours + current_course_credits > 15:
                    print("Max credit hours exceeded.")
                    continue


                # Append the processed record to the final list
                final_records.append({"studentId": student_id, "courseId": course_id})
                
            except httpx.HTTPError:
                raise Exception("Failed to communicate with Read Service during enrollment validation.")
            except Exception as e:
                raise Exception(e.args[0] if e.args else "Failed to validate courses")

    return final_records



# --- TABLE_ACCESS Configuration ---

TABLE_ACCESS = {
    "student": {
        "model_name": "Student",
        "allowed_roles": ["admin"],
        "fields": ["name", "email", "password", "phone", "gender", "cnic", "status"],
        "pre_process": user_pre_process,
    },
    "teacher": {
        "model_name": "Teacher",
        "allowed_roles": ["admin"],
        "fields": ["name", "email", "password", "phone", "gender", "cnic", "status"],
        "pre_process": user_pre_process,
    },
    "admin": {
        "model_name": "Admin",
        "allowed_roles": ["admin"],
        "fields": ["name", "email", "password", "phone", "gender", "cnic", "status"],
        "pre_process": user_pre_process,
    },
    "course": {
        "model_name": "Course",
        "allowed_roles": ["admin"],
        "fields": ["name", "teacherId", "credit_hours", "isDeleted"],
        "pre_process": course_pre_process,
    },
    "enrollment": {
        "model_name": "Enrollment",
        "allowed_roles": ["student", "admin"],
        "fields": ["studentId", "courseId"],
        "pre_process": enrollment_pre_process,
    },
}