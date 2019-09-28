from django.contrib import admin
from django.urls import path
from .views import home, const_data, constituency_centroid, dashboard

urlpatterns = [
    path('', home, name='home'),
    path('constituency/',const_data, name='data'),
    path('centroid/',constituency_centroid, name='centroid'),
    path('dash/', dashboard, name='dashboard')
]
