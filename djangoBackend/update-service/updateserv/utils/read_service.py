import httpx
import json
from django.conf import settings

# This must be the correct URL, with NO space at the end of the string.
READ_SERVICE_URL = "http://localhost:4000/read/api/get-data" 
#                                         ^ NO SPACE HERE

async def fetch_record(table, id, include_password, user, token):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                READ_SERVICE_URL,
                params={"tableName": table, "id": id, "includePassword": include_password},
                headers={
                    "x-user": json.dumps(user),
                    "Authorization": token
                }
            )
        data = response.json()
        return data.get("data", [])
    except Exception as e:
        print("READ-SERVICE ERROR:", e)
        return None
