# readserv/urls.py
from django.urls import path
from .views import GenericReadView

urlpatterns = [
    # Map the URL to the single GenericReadView
    path('get-data', GenericReadView.as_view(), name='generic_read'),
]