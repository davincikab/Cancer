from .models import Patient
from django_filters import FilterSet

class PatientFilter(FilterSet):
    class Meta:
        model = Patient
        fields = ['cancer_typ', 'age','year']

class PatientTableFilter(FilterSet):
    class Meta:
        model = Patient
        fields = ['cancer_typ', 'age', 'year','gender','cancer_sta','const_nam','county_nam']
