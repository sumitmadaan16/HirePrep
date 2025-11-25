from django.urls import path
from . import views

urlpatterns = [
    path('resources/', views.get_resources),
    path('resources/upload/', views.upload_resource),
    path('delete/<int:pk>/', views.delete_resource),
]
