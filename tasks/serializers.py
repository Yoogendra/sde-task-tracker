# backend/tasks/serializers.py
from rest_framework import serializers
from .models import Task, TaskDependency

class TaskDependencySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskDependency
        fields = ['id', 'task', 'depends_on', 'created_at']

class TaskSerializer(serializers.ModelSerializer):
    # This tells Django to include the list of dependencies for every task
    dependencies = TaskDependencySerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'dependencies', 'created_at']