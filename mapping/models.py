from django.contrib.gis.db import models
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
    geom = models.MultiPolygonField(blank=False, null=False)
    breast = JSONField(blank=False, null=False)

    class Meta:
        managed = False
        db_table = 'county'

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

class Events(models.Model):
    event_choices = (
    ('S','Seminars'),
    ('A','Awareness Campaign')
    )

    id = models.AutoField( primary_key=True)
    name = models.TextField()
    date = models.DateTimeField()
    venue = models.CharField(max_length=30, blank = True)
    type = models.CharField(max_length=2, choices= event_choices)

    class Meta:
        db_table = 'mapping_events'

    def __str__(self):
        return self.name

class CareGiver(models.Model):
	user = models.ForeignKey(User, on_delete = models.CASCADE)
	phone_number = models.CharField(max_length = 15, blank = False)

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
        ('B','Breast'),
        ('C','Cervix'),
        ('O','Oesophagus'),
        ('P','Prostate'),
        ('R','Rectum'),
        ('L','Lung'),
        ('OT','Others'),
        )

    # gender_choice =(
    #     ('M','Male'),
    #     ('F','Female'),
    #     )
    # NHIF number

    gid = models.AutoField(primary_key=True)
    location = models.CharField(max_length=254, blank=True, null=True)
    cancer_typ = models.CharField(max_length=254, blank=True, null=True)
    year = models.BigIntegerField(blank=True, null=True)
    const_nam = models.CharField(max_length=50, blank=True, null=True)
    county_nam = models.CharField(max_length=50, blank=True, null=True)
    nhif = models.CharField(max_length=254, blank=True, null=True)
    gender = models.CharField(max_length = 30)
    cancer_sta = models.BigIntegerField(blank=True, null=True)
    age = models.BigIntegerField(blank=True, null=True)
    status = models.CharField(max_length = 3, choices=status_choice)
    home_visit = models.BigIntegerField(blank=True, null=True)
    referral = models.CharField(max_length = 3, choices=referral_choice)
    chemothera = models.BigIntegerField(blank=True, null=True)
    firstvisit = models.DateField(blank=True, null=True)
    phone_numb = models.CharField(max_length=100, blank=True, null=True)
    geom = models.PointField(blank=True, null=True)


    class Meta:
        managed = False
        db_table = 'patient'

    def __str__(self):
        return self.location

class DoctorProfile(models.Model):
    user = models.ForeignKey(User, on_delete = models.CASCADE)
    image = models.ImageField(default='download.png', upload_to='profile_pictures')
    description = models.TextField()

    def __str__(self):
        return self.user.username


	#Drugs according to cancer stage: table join on field stage
class Diet(models.Model):
    name = models.CharField(max_length=60,  blank=False)
    description = models.TextField()

    def __str__(self):
        return self.name
