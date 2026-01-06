# updateserv/utils/uniqueness.py
import json
import httpx
from updateserv.exceptions import UniquenessError

READ_SERVICE_URL = "http://localhost:4000/read/api/get-data"

async def check_global_uniqueness_on_update(
    *,
    user,
    token,
    data,
    record_id,
    current_table
):
    fields = ("email", "phone", "cnic")
    if not any(f in data for f in fields):
        return

    tables = ["student", "teacher", "admin"]

    async with httpx.AsyncClient(timeout=10.0) as client:
        for table in tables:
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

            for obj in rows:
                if obj.get("isDeleted") is not False:
                    continue

                # Skip self
                if table == current_table and obj.get("id") == int(record_id):
                    continue

                if (
                    (data.get("email") and obj.get("email") == data["email"]) or
                    (data.get("phone") and obj.get("phone") == data["phone"]) or
                    (data.get("cnic") and obj.get("cnic") == data["cnic"])
                ):
                    raise UniquenessError(
                        f"User with same email, phone, or CNIC already exists"
                    )
