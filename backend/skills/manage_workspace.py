# Skill: manage_workspace
# Purpose: Advanced management of tasks and subtasks in the workspace

import warnings
import json
import time

warnings.filterwarnings("ignore")


def generate_uid(cursor, company_id):
    """
    Generate unique task UID.
    Example: UNIT-01-001
    """
    count = cursor.execute(
        "SELECT COUNT(*) FROM workspace_tasks WHERE company_id = ?",
        (company_id,)
    ).fetchone()[0]

    return f"UNIT-{int(company_id):02d}-{count + 1:03d}"


def print_usage():
    print("\nUSAGE HELP:")
    print("- list")
    print("    Show all tasks and subtasks")
    print("- create:TITLE")
    print("    Create a new main task")
    print("- subtask:PARENT_UID_OR_ID:TITLE")
    print("    Create a subtask")
    print("- status:UID_OR_ID:STATUS")
    print("    Update task status")
    print("    Status: tasks, pending, completed, blocked")
    print("- delete:UID_OR_ID")
    print("    Delete task and its subtasks\n")


def run(args: str, context: object):
    try:
        args_clean = str(args).strip()

        if not args_clean:
            print_usage()
            return

        cursor = context.db.cursor()

        # =========================================================
        # LIST TASKS
        # =========================================================
        if args_clean.startswith("list"):

            rows = cursor.execute(
                """
                SELECT id, title, status, parent_id, uid
                FROM workspace_tasks
                WHERE company_id = ?
                ORDER BY id ASC
                """,
                (context.company_id,)
            ).fetchall()

            tasks = [r for r in rows if r[3] is None]
            subtasks = [r for r in rows if r[3] is not None]

            print(f"\n--- Operational Hierarchy (Company: {context.company_id}) ---\n")

            if not tasks:
                print("No tasks found.")
                return

            for task in tasks:
                task_id, title, status, parent_id, uid = task

                print(f"[{uid}] [{status.upper()}] {title}")

                children = [st for st in subtasks if st[3] == task_id]

                for child in children:
                    _, c_title, c_status, _, c_uid = child
                    print(f"   └── [{c_uid}] [{c_status.upper()}] {c_title}")

        # =========================================================
        # CREATE MAIN TASK
        # =========================================================
        elif args_clean.startswith("create:"):

            title = args_clean.replace("create:", "", 1).strip()

            if not title:
                print("ERROR: Task title cannot be empty.")
                return

            uid = generate_uid(cursor, context.company_id)

            cursor.execute(
                """
                INSERT INTO workspace_tasks
                (company_id, page_id, title, status, uid, ts)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    context.company_id,
                    1,
                    title,
                    "pending",
                    uid,
                    int(time.time())
                )
            )

            context.db.commit()

            print(f"SUCCESS: Created task {uid} -> {title}")

        # =========================================================
        # CREATE SUBTASK
        # =========================================================
        elif args_clean.startswith("subtask:"):

            # Format:
            # subtask:PARENT_UID_OR_ID:TITLE

            parts = args_clean.split(":", 2)

            if len(parts) != 3:
                print("ERROR: Usage -> subtask:PARENT_UID_OR_ID:TITLE")
                return

            parent_ref = parts[1].strip()
            title = parts[2].strip()

            if not title:
                print("ERROR: Subtask title cannot be empty.")
                return

            parent = cursor.execute(
                """
                SELECT id
                FROM workspace_tasks
                WHERE (uid = ? OR CAST(id AS TEXT) = ?)
                AND company_id = ?
                """,
                (parent_ref, parent_ref, context.company_id)
            ).fetchone()

            if not parent:
                print(f"ERROR: Parent task '{parent_ref}' not found.")
                return

            parent_id = parent[0]

            uid = generate_uid(cursor, context.company_id)

            cursor.execute(
                """
                INSERT INTO workspace_tasks
                (
                    company_id,
                    page_id,
                    title,
                    status,
                    parent_id,
                    uid,
                    ts
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    context.company_id,
                    1,
                    title,
                    "pending",
                    parent_id,
                    uid,
                    int(time.time())
                )
            )

            context.db.commit()

            print(f"SUCCESS: Created subtask {uid} under {parent_ref}")

        # =========================================================
        # UPDATE STATUS
        # =========================================================
        elif args_clean.startswith("status:"):

            # Format:
            # status:UID_OR_ID:NEW_STATUS

            parts = args_clean.split(":", 2)

            if len(parts) != 3:
                print("ERROR: Usage -> status:UID_OR_ID:NEW_STATUS")
                return

            ref = parts[1].strip()
            status = parts[2].strip().lower()

            valid_statuses = {
                "tasks",
                "pending",
                "completed",
                "blocked"
            }

            if status not in valid_statuses:
                print(f"ERROR: Invalid status '{status}'")
                print(f"Allowed: {', '.join(valid_statuses)}")
                return

            result = cursor.execute(
                """
                UPDATE workspace_tasks
                SET status = ?
                WHERE (uid = ? OR CAST(id AS TEXT) = ?)
                AND company_id = ?
                """,
                (
                    status,
                    ref,
                    ref,
                    context.company_id
                )
            )

            context.db.commit()

            if result.rowcount == 0:
                print(f"ERROR: Task '{ref}' not found.")
                return

            print(f"SUCCESS: Updated {ref} -> {status}")

        # =========================================================
        # DELETE TASK
        # =========================================================
        elif args_clean.startswith("delete:"):

            ref = args_clean.replace("delete:", "", 1).strip()

            target = cursor.execute(
                """
                SELECT id
                FROM workspace_tasks
                WHERE (uid = ? OR CAST(id AS TEXT) = ?)
                AND company_id = ?
                """,
                (ref, ref, context.company_id)
            ).fetchone()

            if not target:
                print(f"ERROR: Task '{ref}' not found.")
                return

            task_id = target[0]

            cursor.execute(
                """
                DELETE FROM workspace_tasks
                WHERE (id = ? OR parent_id = ?)
                AND company_id = ?
                """,
                (
                    task_id,
                    task_id,
                    context.company_id
                )
            )

            context.db.commit()

            print(f"SUCCESS: Deleted task {ref} and its subtasks.")

        # =========================================================
        # UNKNOWN COMMAND
        # =========================================================
        else:
            print("ERROR: Unknown command.")
            print_usage()

    except Exception as e:
        print(f"ERROR in manage_workspace: {str(e)}")