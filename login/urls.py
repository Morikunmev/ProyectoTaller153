from django.urls import path
from login import views
urlpatterns = [
    path('',views.login,name="login"),
    path('correo_recuperacion/', views.recuperar_contraseña, name='correo_recuperacion'),

    
]
