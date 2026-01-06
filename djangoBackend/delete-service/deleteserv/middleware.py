# deleteserv/middleware.py
import json
from rest_framework.response import Response

class AttachUserMiddleware:
    """
    Async-compatible middleware to attach `user_data` from 'x-user' header.
    Works with async views and async middleware chain.
    """
    def __init__(self, get_response):
        self.get_response = get_response
        self.is_async = callable(get_response) and hasattr(get_response, "__await__")

    def __call__(self, request):
        if self.is_async:
            return self._async_call(request)
        return self._sync_call(request)

    def _sync_call(self, request):
        header = request.headers.get("x-user")
        if header:
            try:
                request.user_data = json.loads(header)
            except json.JSONDecodeError:
                return Response({"error": "Invalid user header"}, status=400)
        else:
            request.user_data = None

        return self.get_response(request)

    async def _async_call(self, request):
        header = request.headers.get("x-user")
        if header:
            try:
                request.user_data = json.loads(header)
            except json.JSONDecodeError:
                return Response({"error": "Invalid user header"}, status=400)
        else:
            request.user_data = None

        response = self.get_response(request)
        if hasattr(response, "__await__"):
            response = await response
        return response
