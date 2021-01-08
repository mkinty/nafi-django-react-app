from django.contrib import admin
from api.models import Task


# Register your models here.


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'completed', 'created')
    list_filter = ('title', 'created', 'completed')
    search_fields = ('title',)