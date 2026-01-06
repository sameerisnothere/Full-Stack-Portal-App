import json
import httpx
from django.conf import settings

# This must be the correct URL, with NO space at the end of the string.
READ_SERVICE_URL = "http://localhost:4000/read/api/get-data" 
#                                         ^ NO SPACE HERE


async def fetch(table, params, token, user):
    async with httpx.AsyncClient() as client:
        res = await client.get(
            READ_SERVICE_URL,
            params={"tableName": table, **params},
            headers={
                "Authorization": token,
                "x-user": json.dumps(user)
            }
        )
        data = res.json()
        return data.get("data", [])


# ============================
# ACCESS RULES
# ============================
async def before_delete_teacher(token, user, ids):
    if user["type"] != "admin":
        return False, "Only admin can delete teachers"

    courses = await fetch(
        "course",
        {"teacherId": ",".join(map(str, ids))},
        token,
        user
    )

    if any(not c["isDeleted"] for c in courses):
        return False, "Cannot delete teacher with active courses"

    return True, None


async def before_delete_student(token, user, ids):
    if user["type"] != "admin":
        return False, "Only admin can delete students"

    rows = await fetch(
        "enrollment",
        {"studentId": ",".join(map(str, ids))},
        token,
        user
    )

    if rows:
        return False, "Cannot delete student with active enrollments"

    return True, None


async def before_delete_course(token, user, ids):
    if user["type"] not in ("admin", "teacher"):
        return False, "Only admins or teachers can delete courses"

    rows = await fetch(
        "enrollment",
        {"courseId": ",".join(map(str, ids))},
        token,
        user
    )

    if rows:
        return False, "Cannot delete course with enrolled students"

    return True, None


async def before_delete_enrollment(token, user, ids):
    # STUDENT
    if user["type"] == "student":
        rows = await fetch(
            "enrollment",
            {"id": ",".join(map(str, ids))},
            token,
            user
        )

        owned = [r for r in rows if r["studentId"] == user["id"]]

        if len(owned) != len(ids):
            return False, "Students can only delete their own enrollments"

    # TEACHER
    if user["type"] == "teacher":
        enrollments = await fetch(
            "enrollment",
            {"id": ",".join(map(str, ids))},
            token,
            user
        )

        if not enrollments:
            return False, "No enrollments found"

        course_ids = list({e["courseId"] for e in enrollments})

        courses = await fetch(
            "course",
            {"id": ",".join(map(str, course_ids))},
            token,
            user
        )

        owned_course_ids = [c["id"] for c in courses if c["teacherId"] == user["id"]]

        if any(e["courseId"] not in owned_course_ids for e in enrollments):
            return False, "Teachers can only delete enrollments in their own courses"

    return True, None


async def before_delete_admin(token, user, ids):
    if user["type"] != "admin":
        return False, "Only admins can delete admins"
    return True, None


# ============================
# FINAL ACCESS RULES DICT
# ============================

access_rules = {
    "teacher": {
        "before": before_delete_teacher
    },
    "student": {
        "before": before_delete_student
    },
    "course": {
        "before": before_delete_course
    },
    "enrollment": {
        "before": before_delete_enrollment
    },
    "admin": {
        "before": before_delete_admin
    },
}
