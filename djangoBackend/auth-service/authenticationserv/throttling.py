from datetime import datetime

failed_logins = {}   # {email: {count, last_attempt}}
MAX_ATTEMPTS = 3
LOCK_TIME = 5 * 60   # seconds

def check_throttle(email):
    record = failed_logins.get(email, {"count": 0, "last_attempt": None})
    if record["count"] >= MAX_ATTEMPTS:
        if (datetime.now().timestamp() - record["last_attempt"]) < LOCK_TIME:
            return False
    return True

def add_failed_attempt(email):
    record = failed_logins.get(email, {"count": 0, "last_attempt": None})
    record["count"] += 1
    record["last_attempt"] = datetime.now().timestamp()
    failed_logins[email] = record

def reset_attempts(email):
    if email in failed_logins:
        del failed_logins[email]
