from dotenv import load_dotenv
from client import create_calle_client
load_dotenv()


try:
    create_calle_client()
    print("CALL-E client created successfully!")
except Exception as error:
    print(f"CALL-E client check: {error}")