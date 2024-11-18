from django.http import HttpResponseRedirect
from django.urls import reverse
from drf_spectacular.views import SpectacularAPIView
from rest_framework.schemas import get_schema_view
from rest_framework.permissions import AllowAny

def redirect_to_api(request):
    return HttpResponseRedirect(reverse('swagger-ui'))

schema_view = SpectacularAPIView.as_view(
    permission_classes=(AllowAny,),
)

