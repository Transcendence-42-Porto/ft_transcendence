from django.urls import path
from .views import AddScoreView

urlpatterns = [
    path('add/', AddScoreView.as_view(), name='add_score'),
]
