from django.urls import path, include
from .views import register, profile
from django.contrib.auth.views import LoginView, LogoutView


urlpatterns = [
    path('register/', register, name= 'register'),
    path('login/', LoginView.as_view(template_name = 'user/login.html'), name= 'login'),
    path('logout/', LogoutView.as_view(template_name = 'user/logout.html'), name= 'logout'),
    path('profile/', profile, name= 'profile'),

]
