import sys
from pathlib import Path

# Ensure root is in python path
root = Path(__file__).resolve().parent.parent
if str(root) not in sys.path:
    sys.path.insert(0, str(root))
