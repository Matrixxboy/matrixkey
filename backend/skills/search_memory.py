from app.services.memory import search_memory

def run(args: str, context: object) -> str:
    \"\"\"
    Searches the agent's long-term vector memory for past context.
    Args: The query string to search for.
    \"\"\"
    query = args.strip()
    if not query:
        return "ERROR: Query is required."
        
    try:
        memories = search_memory(context.agent, query, limit=5, company_id=context.company_id)
        if not memories:
            return "RESULT: No relevant memories found."
            
        results = []
        for i, m in enumerate(memories):
            if m['score'] > 0.3:  # Only include decent matches
                results.append(f"Memory {i+1} (Relevance {m['score']:.2f}):\n{m['content']}")
                
        if not results:
            return "RESULT: No highly relevant memories found."
            
        return "SUCCESS: Memory retrieved.\n\n" + "\n---\n".join(results)
    except Exception as e:
        return f"ERROR: Memory search failed: {e}"
