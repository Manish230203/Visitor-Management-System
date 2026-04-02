<<<<<<< HEAD
# utils/token_utils.py

import jwt
import datetime
from config import SECRET_KEY

def generate_token(user):
    token = jwt.encode({
        "user_id": user["user_id"],
        "email": user["email"],
        "role": user["role"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }, SECRET_KEY, algorithm="HS256")

=======
# utils/token_utils.py

import jwt
import datetime
from config import SECRET_KEY

def generate_token(user):
    token = jwt.encode({
        "user_id": user["user_id"],
        "email": user["email"],
        "role": user["role"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }, SECRET_KEY, algorithm="HS256")

>>>>>>> 08ef6cc1453d6ea4244a647f389ddbdb18b9b7d1
    return token