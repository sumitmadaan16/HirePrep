from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Review
from .serializers import ReviewSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def get_reviews(request):
    reviews = Review.objects.all().order_by('-created_at')
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_review(request):
    user = request.user

    # Only students allowed
    if hasattr(user, 'role') and user.role != "student":
        return Response(
            {"error": "Only students can add reviews."},
            status=status.HTTP_403_FORBIDDEN
        )

    data = request.data.copy()
    data['user'] = user.id

    serializer = ReviewSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)

    return Response(serializer.errors, status=400)