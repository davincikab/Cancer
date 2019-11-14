from django.contrib import admin
from .models import *
# from

class PatientAdmin(admin.ModelAdmin):
    list_display = ['cancer_typ','gender','age','year']
    ordering = ['-year']

class EventsAdmin(admin.ModelAdmin):
    list_display = ['name','venue', 'type']
    ordering = ['date']

class DrugsAdmin(admin.ModelAdmin):
    list_display = ['name','stage', 'hospital']
    ordering = ['stage']

class CareGiverAdmin(admin.ModelAdmin):
    list_display = ['user','phone_number']


class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ['user','description']

class DietAdmin(admin.ModelAdmin):
    list_display = ['name']

class CountyAdmin(admin.ModelAdmin):
    list_display = ['const_nam','county_nam']

admin.site.register(CareGiver,CareGiverAdmin)
admin.site.register(Patient,PatientAdmin)
admin.site.register(DoctorProfile,DoctorProfileAdmin)
admin.site.register(Events,EventsAdmin)
admin.site.register(Drugs,DrugsAdmin)
admin.site.register(Diet,DietAdmin)
admin.site.register(County,CountyAdmin)
