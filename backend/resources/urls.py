from rest_framework.routers import DefaultRouter

from resources.views import ResourceViewSet

router = DefaultRouter()
router.register("", ResourceViewSet, basename="resource")

urlpatterns = router.urls
