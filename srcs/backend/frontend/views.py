from django.shortcuts import render

def home_page(request):
    return render(request, 'base.html')

def login(request):
    return render(request, 'login.html')

def profile(request):
    return render(request, 'profile.html')

def signup(request):
    return render(request, 'signup.html')