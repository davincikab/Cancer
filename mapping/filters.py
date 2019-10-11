from .models import Patient
from django_filters import FilterSet

class PatientFilter(FilterSet):
    class Meta:
        model = Patient
        fields = ['cancer_typ', 'age','year']
