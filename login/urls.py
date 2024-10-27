from django.urls import path
from login import views
urlpatterns = [
    path('',views.login,name="login"),
    path('correo_recuperacion/', views.recuperar_contraseña, name='correo_recuperacion'),
    path('contraseña_recuperacion/', views.mostrar_template_recuperacion, name='contraseña_recuperacion')
]
