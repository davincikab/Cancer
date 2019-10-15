from django.shortcuts import render, redirect
from .forms import UserRegistrationForm, UserUpdateForm, ProfileForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
"""

Determine the nature of request
Validate the data
Save the user
Message
Redirect

"""

def register(request):
	if request.method == 'POST':
		form = UserRegistrationForm(request.POST)
		if form.is_valid():
			form.save()
			username = form.cleaned_data.get('username')
			messages.success(request, f'Account created for {username}')
			return redirect ('login')

	else:
		form = UserRegistrationForm()

	return render(request,'user/register.html', {'form':form })

@login_required
def profile(request):
	print(request.user.userprofile.profession)
	form = ProfileForm(instance = request.user.userprofile)
	return render(request, 'user/profile.html',{'form':form})
