import json
from django.http import JsonResponse

class AttachUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user_header = request.headers.get("x-user")
        if user_header:
            try:
                request.user_data = json.loads(user_header)
            except Exception:
                return JsonResponse({"error": "Invalid user header"}, status=400)
        else:
            request.user_data = None

        return self.get_response(request)
