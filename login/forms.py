# forms.py
from django import forms

class FormularioRecuperar(forms.Form):
    email = forms.CharField(label="Email", required=True)