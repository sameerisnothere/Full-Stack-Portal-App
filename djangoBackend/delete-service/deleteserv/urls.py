# from django.urls import path
# from deleteserv.views import delete_data

# urlpatterns = [
#     path("delete", delete_data),
#     path("delete/<int:id>", delete_data),
# ]

# deleteserv/urls.py
from django.urls import path
from deleteserv.views import DeleteDataAPIView

urlpatterns = [
    path('delete/', DeleteDataAPIView.as_view()),
    path('delete/<int:id>/', DeleteDataAPIView.as_view()),
]
