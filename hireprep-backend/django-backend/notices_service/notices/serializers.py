from rest_framework import serializers
from .models import Notice, CustomUser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role']


class NoticeSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Notice
        fields = ['id', 'title', 'description', 'priority', 'author', 'author_name', 'created_at', 'expires_at']
        read_only_fields = ['author', 'created_at']