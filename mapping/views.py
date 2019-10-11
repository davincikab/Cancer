from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import County, Patient
from django.core.serializers import serialize
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.measure import D
from django.contrib.gis.db.models.functions import AsGeoJSON, Centroid, Area
from .filters import PatientFilter
from django.db.models import Count
from django.contrib.gis.db.models import Extent, Union,Collect
import json

# Create your views here.
def home(request):
    return render(request, 'index.html')

def dashboard(request):
    return render(request, 'dashboard.html')

def const_data(request):
    const = serialize('geojson',County.objects.all())

    return HttpResponse(const)

def patient_data(request):
    patient = Patient.objects.all()
    patient_filter = PatientFilter(request.GET, queryset = patient)
    patient = serialize('geojson',patient_filter.qs)

    # redire
    return HttpResponse(patient)

def search(request):
    patient = Patient.objects.values('const_nam','year')\
            .annotate(Cancer_type = Count('cancer_typ'))\
            .filter(year=2015)\
            .order_by('-Cancer_type')

    context = {'map_data':patient}

    return render(request, 'data.html',context)


def get_summary_stats(request):
    patient = [p for p in Patient.objects.values('const_nam','year')\
            .annotate(Cancer_type = Count('cancer_typ'))\
            .filter(year=2015)\
            .order_by('-Cancer_type')]

    patient_nhif =[p for p in Patient.objects.values('nhif','year')\
                .annotate(Nhif = Count('cancer_typ'))\
                .order_by('year')]

    patient_year = [ p for p in Patient.objects.values('year')\
            .annotate(Cancer_type = Count('cancer_typ')) ]
            # .order_by('-Cancer_type')

    response = {'patient':patient,'patient_year':patient_year,'nhif':patient_nhif}
    print(response)
    return HttpResponse(json.dumps(response))

def spatial_search(request):
    distance = request.GET.get('distance')
    pnt = GEOSGeometry('POINT(36.935971 -0.425414)', srid=4326)
    patient_within = Patient.objects.filter(geom__distance_lte=(pnt, D(km=float(distance))))

    return HttpResponse(serialize('geojson',patient_within))


"""
Working with multindex data: update, analyse
Routing, Hospitals.
Diet and medication
add pie, bar, line graphs
output = dict()
subcounty = ['Kieni','Mathira','Nyeri Town','Tetu','Othaya']
for sub in subcounty:
    patient = Patient.objects.filter(const_nam =sub).aggregate(Count('cancer_typ'))
    output[sub] = patient['cancer_typ__count']
    print ('{}: {}'.format(sub, patient['cancer_typ__count']))
# patient_filter = PatientFilter(request.GET, queryset = patient)
# 'data':patient_filter,
context = {'map_data':output}

"""
"""
patient = Patient.objects.values('const_nam','year')\
        .annotate(Cancer_type = Count('cancer_typ'))\
        .filter(year=2015)\
        .order_by('-Cancer_type')

"""

"""
import geopandas as gpd
import pandas as pd

polys = gpd.read_file(county)
points = gpd.read_file(patient)

dfsjoin = gpd.sjoin(polys,points) #Spatial join Points to polygons
dfpivot = pd.pivot_table(dfsjoin,index='PolyID',columns='Food',aggfunc={'Food':len})

dfpivot.columns = dfpivot.columns.droplevel()

dfpolynew = polys.merge(dfpivot, how='left',on='PolyID')

"""
