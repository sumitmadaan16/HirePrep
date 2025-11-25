from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Notice
from .serializers import NoticeSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def get_notices(request):
    notices = Notice.objects.all().order_by('-created_at')
    serializer = NoticeSerializer(notices, many=True)
    return Response(serializer.data)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_notice(request):
    user = request.user

    if user.role not in ['admin', 'faculty']:
        return Response(
            {"error": "Permission denied. Only admin/faculty can create notices."},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = NoticeSerializer(data=request.data)
    if serializer.is_valid():
        # Save with author information
        serializer.save(author=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notice(request, pk):
    user = request.user

    if user.role not in ['admin', 'faculty']:
        return Response(
            {"error": "Permission denied. Only admin/faculty can delete notices."},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        notice = Notice.objects.get(id=pk)
        notice.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Notice.DoesNotExist:
        return Response({"error": "Notice not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role
    })