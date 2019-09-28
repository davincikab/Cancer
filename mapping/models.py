from django.contrib.gis.db import models as geo_models
from django.db import models
from django.contrib.postgres.fields import JSONField
from django.contrib.auth.models import User

class County(models.Model):
    gid = models.AutoField(primary_key=True)
    objectid = models.DecimalField(max_digits=65535, decimal_places=65535, blank=False, null=False)
    const_nam = models.CharField(max_length=50, blank=False, null=False)
    const_no = models.DecimalField(max_digits=65535, decimal_places=65535, blank=False, null=False)
    county_nam = models.CharField(max_length=50, blank=False, null=False)
    lukemia = JSONField(blank=False, null=False)
    cervical = JSONField(blank=False, null=False)
    lung = JSONField(blank=False, null=False)
    throat = JSONField(blank=False, null=False)
    prostate = JSONField(blank=False, null=False)
    total = models.IntegerField(blank=False, null=False)
    geom = geo_models.MultiPolygonField(blank=False, null=False)
    breast = JSONField(blank=False, null=False)

    class Meta:
        managed = False
        db_table = 'county'

class CareGiver(models.Model):
	user = models.ForeignKey(User, on_delete = models.CASCADE)
	phone_number = models.CharField(max_length = 12, blank = False)
    
	def __str__(self):
	  return self.user.username

class Patient(models.Model):
	status_choice = (
	   ('M','Medication'),
	   ('T','Breach')
	)

	referral_choice = (
	   ('HS','Hospital'),
	   ('DR','Doctor'),
	   ('S','Self')
	)

	death_choice = (
	   ('HM','Home'),
	   ('HS','Hospital')
	)

	cancer_stage = (
	 (1,'Stage 1'),
	 (2,'Stage 2'),
	 (3,'Stage 3'),
	 (4,'Stage 4'),
	)

	cancer_choices = (
	  ('B','Breat'),
	  ('C','Cervix'),
	  ('O','Oesophagus'),
	  ('P','Prostate'),
	  ('R','Rectum'),
	  ('L','Lung'),
	  ('OT','Others'),
	)

	gender_choice =(
	 ('M','Male'),
	 ('F','Female'),
	)


	user = models.ForeignKey(User, on_delete = models.CASCADE)
	status = models.CharField(max_length = 3, choices=status_choice)
	referral = models.CharField(max_length = 3, choices=referral_choice)
	gender = models.CharField(max_length = 3, choices=gender_choice)
	age = models.IntegerField(blank=False)
	cancer_type = models.CharField(max_length = 3, choices=cancer_choices)
	cancer_stage = models.PositiveSmallIntegerField(choices = cancer_stage)
	firstvisit = models.BooleanField(default=False)
	date = models.DateField(blank=False)
	chemotherapy = models.IntegerField(default = 0)
	numberofvisit = models.IntegerField(default=0, blank=False) #Home Visit
	nhif_number = models.CharField(max_length = 15, blank = False)
	location = geo_models.PointField(srid=4326)
	address = models.CharField(max_length = 30, blank=False )
	phone_number = models.CharField(max_length = 15,blank = True)
	under_care_of = models.ManyToManyField(CareGiver)

	def distance_to_user(self):
	  return route_distance

	def new_patients(self):
	   pass

	def __str__(self):
	  return self.user.username

class DoctorProfile(models.Model):
    user = models.ForeignKey(User, on_delete = models.CASCADE)
    image = models.ImageField(default='download.png', upload_to='profile_pictures')
    description = models.TextField()

    def __str__(self):
        return self.user.username

class Events(models.Model):
	event_choices = (
	  ('S','Seminars'),
	  ('A','Awareness Campaign')
	)

	name = models.TextField()
	date = models.DateTimeField()
	venue = models.CharField(max_length=30, blank=False)
	type = models.CharField(max_length = 2,choices=event_choices)

	def __str__(self):
	  return self.name

class Drugs(models.Model):
    cancer_stage = (
	 (1,'Stage 1'),
	 (2,'Stage 2'),
	 (3,'Stage 3'),
	 (4,'Stage 4'),
	)

    name = models.CharField(max_length=30, blank=False)
    stage = models.PositiveSmallIntegerField(choices=cancer_stage)
    hospital = models.CharField(max_length=150)

    def __str__(self):
        return self.name

	#Drugs according to cancer stage: table join on field stage
class Diet(models.Model):
    name = models.CharField(max_length=60,  blank=False)
    description = models.TextField()

    def __str__(self):
        return self.name
