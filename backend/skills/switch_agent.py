# Skill: switch_agent
# Purpose: Hand off the conversation to another agent
import json

def run(args: str, context: object):
    # Args: name of the agent to switch to
    target_agent = args.strip()
    # In this simplified system, we'll just return a special instruction
    # The chat endpoint doesn't strictly support dynamic switching yet 
    # but we can return a message to the user or system
    print(f"SWITCH_TO_AGENT:{target_agent}")
