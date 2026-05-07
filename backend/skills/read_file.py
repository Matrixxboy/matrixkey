import os
from pathlib import Path

def run(args: str, context: object) -> str:
    \"\"\"
    Reads the content of a file.
    Args: Absolute or relative path to the file.
    \"\"\"
    path = args.strip()
    if not path:
        return "ERROR: Path is required."
    
    target = Path(path)
    if not target.is_absolute():
        target = Path(os.getcwd()) / target
        
    if not target.exists():
        return f"ERROR: File not found: {target}"
    if not target.is_file():
        return f"ERROR: Target is not a file: {target}"
        
    try:
        with open(target, 'r', encoding='utf-8') as f:
            content = f.read()
            # Truncate if too long to prevent context overflow
            if len(content) > 4000:
                return f"SUCCESS: File read (truncated).\n\n{content[:4000]}... [TRUNCATED]"
            return f"SUCCESS: File read.\n\n{content}"
    except Exception as e:
        return f"ERROR: Could not read file: {e}"
