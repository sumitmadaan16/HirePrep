from django.db import models
from django.contrib.auth.models import User

class Review(models.Model):
    company_name = models.CharField(max_length=255)
    rating = models.IntegerField()  # 1–5
    review_text = models.TextField()
    position = models.CharField(max_length=255)
    placement_type = models.CharField(max_length=50)  # Intern/Full-time
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Student user

    def str(self):
        return f"{self.company_name} ({self.rating}/5)"