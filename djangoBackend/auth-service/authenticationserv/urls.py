from django.urls import path
from authenticationserv import views

urlpatterns = [
    path("login", views.login),
    path("logout", views.logout),
    path("me", views.me),
    path("register", views.register),
]
