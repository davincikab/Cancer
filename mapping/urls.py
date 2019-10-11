from django.contrib import admin
from django.urls import path
from .views import home, const_data, dashboard, patient_data,search, get_summary_stats,spatial_search
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', home, name='home'),
    path('constituency/',const_data, name='data'),
    path('patient/',patient_data, name='patient-data'),
    path('dash/', dashboard, name='dashboard'),
    path('search/',search,name='search'),
    path('summary/', get_summary_stats,name='stat'),
    path('spatial/',spatial_search, name='spatial')
]

if settings.DEBUG:
    urlpatterns+= static(settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)
