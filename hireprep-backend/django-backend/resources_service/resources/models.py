from django.db import models
import os


def resource_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1]
    return f"{instance.title}{ext}"


class Resource(models.Model):
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to=resource_upload_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title