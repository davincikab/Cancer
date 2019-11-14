from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import County, Patient
from django.core.serializers import serialize
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.measure import D
from django.contrib.gis.db.models.functions import AsGeoJSON, Centroid, Area
from .filters import PatientFilter, PatientTableFilter
from django.db.models import Count
from django.contrib.gis.db.models import Extent, Union,Collect
from django.views.generic import ListView, DetailView
import json
from django.contrib.auth.decorators import login_required

@login_required(login_url='login',redirect_field_name='home')
def home(request):
    return render(request, 'index.html')
@login_required(login_url='login',redirect_field_name='home')
def about(request):
    return render(request,'about.html')

@login_required(login_url='login',redirect_field_name='choropleth')
def choropleth(request):
    return render(request,'choropleth.html')

@login_required(login_url='login',redirect_field_name='home')
def dashboard(request):
    return render(request, 'dashboard.html')

@login_required(login_url='login',redirect_field_name='home')
def patient_list_view(request):
    patients = Patient.objects.all()
    patient_filter = PatientTableFilter(request.GET, queryset = patients)

    return render(request,'patient_list.html',{'data':patient_filter})

class PatientDetailView(DetailView):
    model = Patient
    context_object_name = 'patient_detail'
    template_name = 'patient_detail.html'

def const_data(request):
    const = serialize('geojson',County.objects.all())

    return HttpResponse(const)

def patient_data(request):
    patients = Patient.objects.all()
    patient_filter = PatientFilter(request.GET, queryset = patients)
    patient = serialize('geojson', patient_filter.qs)

    # redire
    return HttpResponse(patient)

def search(request):
    # year = request.GET.get('year')
    patient = Patient.objects.values('nhif','cancer_typ')\
            .annotate(Cancer_type = Count('cancer_typ'))\
            .order_by('-Cancer_type')

    context = {'map_data':patient}

    return render(request, 'data.html',context)


def get_summary_stats(request):
    # year = request.GET.get('year')
    patient_table = [p for p in Patient.objects.values('cancer_typ','nhif')\
            .annotate(Cancer_type = Count('cancer_typ'))\
            .order_by('-Cancer_type')]

    patient_all =  [p for p in Patient.objects.values('status')\
            .annotate(Cancer_type = Count('status'))\
            # .filter(year=year)\
            .order_by('-Cancer_type')]

    patient_cancer =  [p for p in Patient.objects.values('cancer_typ','year')\
            .annotate(Cancer_type = Count('cancer_typ'))\
            # .filter(year=year)\
            .order_by('year')]

    patient = [p for p in Patient.objects.values('const_nam','year')\
            .annotate(Cancer_type = Count('cancer_typ'))\
            # .filter(year=year)\
            .order_by('-Cancer_type')]

    patient_nhif =[p for p in Patient.objects.values('nhif','year')\
                .annotate(Nhif = Count('cancer_typ'))\
                .order_by('year')]

    patient_year = [ p for p in Patient.objects.values('year')\
            .annotate(Cancer_type = Count('cancer_typ')) ]
            # .order_by('-Cancer_type')
    patient_pop = [p for p in Patient.objects.values('age','gender')]
    patient_gender = [p for p in Patient.objects.values('gender','year')\
                    .annotate(genderC = Count('gender'))\
                    .order_by('year')]

    response = {'table':patient_table,'patient_cancer':patient_cancer,'patient_all':patient_all,\
                'patient':patient,'patient_year':patient_year,'nhif':patient_nhif,'gender':patient_gender,'pop':patient_pop}
    #print(response)
    return HttpResponse(json.dumps(response))

def spatial_search(request):
    distance = request.GET.get('distance')
    pnt = GEOSGeometry('POINT(36.935971 -0.425414)', srid=4326)

    if distance  != '':
        patient_within = Patient.objects.filter(geom__distance_lte=(pnt, D(km=float(distance))))
    else:
        patient_within = Patient.objects.all()

    return HttpResponse(serialize('geojson',patient_within))


def updateDb(request):
    data_all = dict()
    patient = Patient.objects.values('cancer_typ','const_nam', 'year')\
            .annotate(Cancer_type = Count('cancer_typ'))\
            .order_by('year')
    data_list = []
    years = [2015, 2016, 2017, 2018, 2019]
    const_names = [const.const_nam for const in County.objects.all()]
    cancers = ["others", "oesophagus", "stomach", "prostate", "cervix", "breast", "rectum", "lung", "pancreas", "ovary"]

    for const in const_names:
        data_dict = dict()
        data = []
        data_kieni = [d for d in patient if d['const_nam'] == const ]
        for cancer in cancers:
            data_li = [d for d in data_kieni if d['cancer_typ'] == cancer]
            for entry in data_li:
                data_dict[str(entry.get('year'))] = entry.get('Cancer_type')
            data.append({cancer:data_dict})

        data_list.append({const: data})
    #
    const = County.objects.all()
    for i in range(0, len(const_names)):
         constituency =  County.objects.get(const_nam = const_names[i])
         print(data_list[i].get(const_names[i]))
         constituency.lung = data_list[i].get(const_names[i])
         # print(constituency.const_nam, constituency.lung)
         constituency.save()

    #TODO: clean update the model with the json object
    return HttpResponse(json.dumps(data_list))
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
    #print ('{}: {}'.format(sub, patient['cancer_typ__count']))
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
