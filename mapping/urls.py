from django.contrib import admin
from django.urls import path
from .views import *
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', home, name='home'),
    path('about/',about, name='about'),
    path('choropleth/', choropleth, name='choropleth'),
    path('patient_list/',patient_list_view, name='list-view'),
    path('patient/<int:pk>',PatientDetailView.as_view(), name='detail-view'),
    path('constituency/',const_data, name='data'),
    path('patient/',patient_data, name='patient-data'),
    path('dash/', dashboard, name='dashboard'),
    path('search/',search,name='search'),
    path('summary/', get_summary_stats,name='stat'),
    path('spatial/',spatial_search, name='spatial'),
    path('updated/', updateDb, name='update')
]

if settings.DEBUG:
    urlpatterns+= static(settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)
