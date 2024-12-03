from django.urls import path
from login import views

urlpatterns = [
    #este seria el index
    path('', views.login, name="index"),
    path('login/', views.login_view, name='login'),
    path('correo_recuperacion/', views.recuperar_contraseña, name='correo_recuperacion'),
    path('cambiar_contraseña/<str:uidb64>/<str:token_payload>/', views.cambiar_contraseña, name='cambiar_contraseña'),
    
    ]
