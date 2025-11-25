from django.urls import path
from . import views

urlpatterns = [
    path('api/reviews/', views.get_reviews),
    path('add/reviews/', views.add_review),
]