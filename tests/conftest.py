import os
import sys
from pathlib import Path

# Ensure root is in python path
root = Path(__file__).resolve().parent.parent
if str(root) not in sys.path:
    sys.path.insert(0, str(root))

# Set test environment flags
os.environ["USE_MOCK_LLM"] = "true"
os.environ["DATABASE_URL"] = "sqlite:///./test_wealify.db"

# Initialize DB tables for testing
from packages.db.session import init_db
from packages.db import models
init_db()
