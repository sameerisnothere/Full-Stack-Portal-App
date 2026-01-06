from django.urls import path
from updateserv.controllers.update_controller import UpdateOne

urlpatterns = [
    path("update-one/<int:id>", UpdateOne.as_view())
]
