from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Resource
from .serializers import ResourceSerializer
import os
from django.conf import settings


# Anyone can view and download resources
@api_view(['GET'])
@permission_classes([AllowAny])
def get_resources(request):
    resources = Resource.objects.all().order_by('-uploaded_at')
    serializer = ResourceSerializer(resources, many=True)
    return Response(serializer.data)


# Only admin/faculty can upload
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_resource(request):
    title = request.data.get('title')
    file = request.FILES.get('file')

    # Validation
    if not title:
        return Response(
            {"error": "Title is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not file:
        return Response(
            {"error": "File is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate file type
    if not file.name.endswith('.pdf'):
        return Response(
            {"error": "Only PDF files are allowed"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate file size (10MB max)
    max_size = 10 * 1024 * 1024  # 10MB in bytes
    if file.size > max_size:
        return Response(
            {"error": "File size must be less than 10MB"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Ensure the media directory exists
        os.makedirs(settings.MEDIA_ROOT, exist_ok=True)

        # Create resource - file will be automatically renamed and saved
        resource = Resource.objects.create(
            title=title,
            file=file
        )

        # The file_path is automatically saved in the model's save method
        serializer = ResourceSerializer(resource)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {"error": f"Failed to upload resource: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Only admin/faculty can delete
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_resource(request, pk):
    try:
        resource = Resource.objects.get(id=pk)

        # Delete file from filesystem
        if resource.file:
            file_path = resource.file.path
            if os.path.exists(file_path):
                os.remove(file_path)

        # Delete database record
        resource.delete()

        return Response(
            {"message": "Resource deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )

    except Resource.DoesNotExist:
        return Response(
            {"error": "Resource not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    except Exception as e:
        return Response(
            {"error": f"Failed to delete resource: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )cl