import os
from calle import CalleClient


def create_calle_client():
    api_key = os.environ.get("CALLE_API_KEY")

    if not api_key:
        raise RuntimeError("CALLE_API_KEY is not set.")

    return CalleClient(api_key=api_key)