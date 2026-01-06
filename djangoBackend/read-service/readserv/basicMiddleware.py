import time
from asgiref.sync import iscoroutinefunction
from django.utils.decorators import sync_and_async_middleware

@sync_and_async_middleware
def ReqCheckerMiddleware(get_response):
    if iscoroutinefunction(get_response):
        async def middleware(request):
            response = await get_response(request)
            print("read request madddeee")
            print(request)
            return response
    else:
        def middleware(request):
            response = get_response(request)
            print("read request madddeee")
            print(request)
            return response

    return middleware