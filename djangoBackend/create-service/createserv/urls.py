# createserv/urls.py
from django.urls import path
from .views import GenericCreateView

urlpatterns = [
    # POST /api/insert/
    path('insert', GenericCreateView.as_view(), name='generic_insert'),
]