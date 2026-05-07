import subprocess
import os

def run(args: str, context: object) -> str:
    \"\"\"
    Executes a system terminal command.
    Args: The command to run.
    \"\"\"
    cmd = args.strip()
    if not cmd:
        return "ERROR: Command required."
        
    # Security/Safety basic checks
    dangerous = ["rm -rf /", "mkfs", "dd"]
    for d in dangerous:
        if d in cmd:
            return f"ERROR: Command '{cmd}' is blocked for safety."
            
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=15)
        out = result.stdout.strip()
        err = result.stderr.strip()
        
        response = f"Command: {cmd}\nExit Code: {result.returncode}"
        if out:
            # Truncate to prevent context blowing up
            if len(out) > 2000:
                response += f"\nSTDOUT (truncated):\n{out[:2000]}..."
            else:
                response += f"\nSTDOUT:\n{out}"
        if err:
            response += f"\nSTDERR:\n{err}"
            
        return response
    except subprocess.TimeoutExpired:
        return "ERROR: Command timed out after 15 seconds."
    except Exception as e:
        return f"ERROR: Execution failed: {e}"
