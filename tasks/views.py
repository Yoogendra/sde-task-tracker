# tasks/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Task, TaskDependency
from .serializers import TaskSerializer, TaskDependencySerializer
from .services import detect_cycle, update_task_status # We will create this next

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    # API: POST /api/tasks/{id}/dependencies/
    @action(detail=True, methods=['post'])
    def dependencies(self, request, pk=None):
        task = self.get_object() # The task gaining a dependency (Task A)
        depends_on_id = request.data.get('depends_on_id')
        
        if not depends_on_id:
            return Response({"error": "depends_on_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_task = Task.objects.get(id=depends_on_id) # The dependency (Task B)
        except Task.DoesNotExist:
            return Response({"error": "Target task not found"}, status=status.HTTP_404_NOT_FOUND)

        # 1. Validation: Self-dependency
        if task.id == target_task.id:
             return Response({"error": "A task cannot depend on itself."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Validation: Check for Cycles (The Core Requirement)
        # Check if linking task -> target_task creates a loop
        is_cycle, path = detect_cycle(task, target_task) 
        if is_cycle:
            return Response({
                "error": "Circular dependency detected",
                "path": path
            }, status=status.HTTP_400_BAD_REQUEST)

        # 3. Save Dependency
        dependency, created = TaskDependency.objects.get_or_create(task=task, depends_on=target_task)
        
        # 4. Update Status (If Task B is blocked/pending, Task A might change)
        update_task_status(task)

        return Response(TaskDependencySerializer(dependency).data, status=status.HTTP_201_CREATED)