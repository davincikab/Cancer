from django.db import models
from django.contrib.auth.models import User
from PIL import Image

class UserProfile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	profession = models.TextField(default='Doctor by Profession')
	phone_number = models.CharField(max_length=18, default='+254740368934')
	image = models.ImageField(default='download.jpg', upload_to ='profile_pictures')

	def __str__(self):
		return f'{self.user.username} Profile'

	def save(self,*args, **kwargs):
		super().save(*args, **kwargs)

		img = Image.open(self.image.path)
		if img.height >300 or img.width >300:
			output_size = (300,300)
			img.thumbnail(output_size)
			img.save(self.image.path)
