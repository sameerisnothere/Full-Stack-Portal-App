# update config
import httpx
import json
import bcrypt
from updateserv.utils.read_service import fetch_record
from updateserv.utils.uniqueness import check_global_uniqueness_on_update
from updateserv.exceptions import UniquenessError


READ_SERVICE_URL = "http://localhost:4000/read/api/get-data" 

class TableAccess:
    async def student_before_update(self, token, user, record_id, data):
        is_admin = user["type"] == "admin"
        is_self = user["type"] == "student" and user["id"] == int(record_id)

        if not token:
            return False, "Missing authorization token", None
        if not is_admin and not is_self:
            return False, "Forbidden", None
        
        await check_global_uniqueness_on_update(
        user=user,
        token=token,
        data=data,
        record_id=record_id,
        current_table="student",
        )

        # password logic
        if "newPassword" in data:
            # admin updates without current password
            if is_admin:
                rows = await fetch_record("student", record_id, False, user, token)
                if not rows:
                    return False, "Student not found", None

            # self update = verify current password
            if is_self:
                if "currentPassword" not in data:
                    return False, "Current password required", None

                rows = await fetch_record("student", record_id, True, user, token)
                if not rows:
                    return False, "Student not found", None

                current_hash = rows[0]["password"]
                if not bcrypt.checkpw(data["currentPassword"].encode(), current_hash.encode()):
                    return False, "Current password is incorrect", None

            # hash new password
            hashed = bcrypt.hashpw(data["newPassword"].encode('utf-8'), bcrypt.gensalt(rounds=10)).decode('utf-8')
            data["password"] = hashed
            data.pop("newPassword", None)
            data.pop("currentPassword", None)

        return True, None, data

    async def teacher_before_update(self, token, user, record_id, data):
        is_admin = user["type"] == "admin"
        is_self = user["type"] == "teacher" and user["id"] == int(record_id)

        if not token:
            return False, "Missing authorization token", None
        if not is_admin and not is_self:
            return False, "Forbidden", None
        
        await check_global_uniqueness_on_update(
        user=user,
        token=token,
        data=data,
        record_id=record_id,
        current_table="teacher",
        )

        if "newPassword" in data:
            if is_admin:
                rows = await fetch_record("teacher", record_id, False, user, token)
                if not rows:
                    return False, "Teacher not found", None

            if is_self:
                if "currentPassword" not in data:
                    return False, "Current password required", None

                rows = await fetch_record("teacher", record_id, True, user, token)
                if not rows:
                    return False, "Teacher not found", None

                current_hash = rows[0]["password"]
                if not bcrypt.checkpw(data["currentPassword"].encode(), current_hash.encode()):
                    return False, "Current password is incorrect", None

            hashed = bcrypt.hashpw(data["newPassword"].encode(), bcrypt.gensalt()).decode()
            data["password"] = hashed
            data.pop("newPassword", None)
            data.pop("currentPassword", None)

        return True, None, data


    async def admin_before_update(self, token, user, record_id, data):
        if not token:
            return False, "Missing authorization token", None

        if user["id"] != int(record_id):
            return False, "Admins can only update their own account", None

        #  FORCE uniqueness check (admin was skipping this)
        await check_global_uniqueness_on_update(
            user=user,
            token=token,
            data=data,
            record_id=record_id,
            current_table="admin",
        )

        #  Password logic (unchanged)
        if "newPassword" in data:
            if "currentPassword" not in data:
                return False, "Current password required", None

            rows = await fetch_record("admin", record_id, True, user, token)
            if not rows:
                return False, "Admin not found", None

            current_hash = rows[0]["password"]
            if not bcrypt.checkpw(
                data["currentPassword"].encode(),
                current_hash.encode()
            ):
                return False, "Current password incorrect", None

            hashed = bcrypt.hashpw(
                data["newPassword"].encode(),
                bcrypt.gensalt()
            ).decode()

            data["password"] = hashed
            data.pop("newPassword", None)
            data.pop("currentPassword", None)

        return True, None, data


    async def course_before_update(self, token, user, record_id, data):
        if user["type"] != "admin":
            return False, "Only admins can update courses", None

        rows = await fetch_record("course", record_id, False, user, token)
        if not rows:
            return False, "Course not found", None
        
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

                for obj in existing:
                    if obj.get("isDeleted") is not False:
                        continue

                    if obj.get("id") == int(record_id):
                        continue

                    if obj.get('name') == data.get('name') and obj.get('isDeleted') is False:
                        raise UniquenessError(f"Another course with the name '{data.get('name')}' already exists")

            except httpx.HTTPError:
                raise Exception("Failed to communicate with Read Service during course validation.")


        allowed = ["name", "teacherId", "credit_hours"]
        filtered = {k: v for k, v in data.items() if k in allowed}

        if not filtered:
            return False, "No valid fields to update", None

        return True, None, filtered

    async def enrollment_before_update(self, token, user, record_id, data):
        return False, "Enrollments cannot be updated", None


table_access = TableAccess()
