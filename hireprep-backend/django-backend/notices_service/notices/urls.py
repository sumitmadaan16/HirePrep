from django.urls import path
from . import views

urlpatterns = [
    path('api/notices/', views.get_notices, name='get_notices'),
    path('api/notices/create/', views.create_notice, name='create_notice'),
    path('api/notices/<int:pk>/delete/', views.delete_notice, name='delete_notice'),
    path('api/user/', views.get_current_user, name='get_current_user'),
]