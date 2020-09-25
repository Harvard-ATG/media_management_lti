"""media_manager URL Configuration
The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/{{ docs_version }}/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from __future__ import absolute_import
from django.urls import include, path
from django.contrib import admin
from . import views

app_name = "media_manager"

urlpatterns = [
    path('', views.app, name='index'),
    path('app', views.app, name='app'),
    path('mirador/<int:collection_id>', views.mirador, name="mirador"),
    path('endpoints/module', views.module_endpoint, name="module_endpoint"),
    path('lti/launch', views.LTILaunchView.as_view(), name="lti_launch"),
    path('lti/config', views.LTIToolConfigView.as_view(), name="lti_config"),
]
