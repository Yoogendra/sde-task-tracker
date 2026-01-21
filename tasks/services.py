# tasks/services.py
from .models import Task

def detect_cycle(source_task, target_task):
    """
    Checks if adding a dependency (source_task -> target_task) creates a cycle.
    Returns: (is_cyclic, path_list)
    """
    visited = set()
    stack = [(target_task, [target_task.id])]  # Start DFS from the target

    while stack:
        current_node, path = stack.pop()
        
        if current_node.id == source_task.id:
            # Cycle found! The path leads back to the source.
            path.append(source_task.id)
            return True, path
        
        if current_node.id in visited:
            continue
        visited.add(current_node.id)

        # Get all tasks that 'current_node' depends on
        # We look at existing dependencies in the DB
        dependencies = current_node.dependencies.all()
        for dep in dependencies:
            next_task = dep.depends_on
            stack.append((next_task, path + [next_task.id]))

    return False, []

def update_task_status(task):
    """
    Recalculates the status of a task based on its dependencies.
    """
    dependencies = task.dependencies.all()
    
    if not dependencies.exists():
        # No dependencies? It's open to work on (unless manually set otherwise)
        if task.status == 'blocked':
             task.status = 'pending'
             task.save()
        return

    all_completed = True
    any_blocked = False

    for dep in dependencies:
        dep_status = dep.depends_on.status
        if dep_status != 'completed':
            all_completed = False
        if dep_status == 'blocked':
            any_blocked = True
            
    # Determine new status
    new_status = task.status
    if any_blocked:
        new_status = 'blocked'
    elif all_completed:
        # If it was pending/blocked, it's now ready. 
        # Usually we set to 'pending' (ready to pick up) or 'in_progress'
        if task.status in ['blocked', 'pending']:
             new_status = 'pending' # Or 'in_progress' based on your preference
    else:
        # Dependencies exist but aren't done
        new_status = 'pending' # Or 'blocked' if you treat incomplete deps as blocks

    if new_status != task.status:
        task.status = new_status
        task.save()
        # Recursively update tasks that depend on *this* task
        for dependent_relation in task.dependents.all():
            update_task_status(dependent_relation.task)