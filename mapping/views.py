from django.shortcuts import render
from django.http import HttpResponse
from .models import County
from django.core.serializers import serialize
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.db.models.functions import AsGeoJSON, Centroid, Area

# Create your views here.
def home(request):
    return render(request, 'index.html')

def const_data(request):
    const = serialize('geojson',County.objects.all())

    return HttpResponse(const)

def constituency_centroid(request):
    const_centroids = County.objects.annotate(geometry = AsGeoJSON(Centroid('geom')))

    const_json = serialize('geojson',
                            County.objects.annotate(geometry = Centroid('geom')),
                            fields=('throat','lukemia', 'const_nam','cervical')
                            )
    da = const_centroids[0].geometry
    # for i in range(len(const_centroids)):
    #     data = dict(const_centroids[i].geometry)
    #     coord = data['coordinates']
    #     const_json.features[i].geometry = coord

    return HttpResponse(da['type'])

def get_summary_stats(request):
    # Sum, avg per county and year
    return HttpResponse()
def dashboard(request):
    return render(request, 'dashboard.html')
"""
Working with multindex data: update, analyse
Routing, Hospitals.
Diet and medication
add pie, bar, line graphs
"""
