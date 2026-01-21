# Design Decisions

## Circular Dependency Detection

To prevent infinite loops (e.g., A -> B -> A), I implemented a **Depth-First Search (DFS)** algorithm.

### The Algorithm

1. When adding a dependency (`A depends on B`), we start a DFS traversal from `B`.
2. We track visited nodes in the current recursion stack.
3. If we encounter `A` during the traversal, a cycle exists, and we block the request.

### Time Complexity

- **Time:** O(V + E) - Efficient for the expected dataset.
- **Space:** O(V) - For the recursion stack.

## Database Choice

I used **MySQL** as required.

- **Task Table:** Stores title, status, description.
- **TaskDependency Table:** Stores the relationships (Many-to-Many).
