from datetime import datetime
from authenticationserv.models import Token
from threading import Timer

def cleanup_tokens():
    Token.objects.filter(expires_at__lt=datetime.now()).delete()
    Timer(60, cleanup_tokens).start()

cleanup_tokens()
