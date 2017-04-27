# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('media_manager', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='CourseModule',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('lti_resource_link_id', models.CharField(max_length=1024)),
                ('lti_resource_link_title', models.CharField(default=b'', max_length=4096, blank=True)),
                ('api_collection_id', models.IntegerField(null=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('course', models.ForeignKey(to='media_manager.Course')),
            ],
            options={
                'verbose_name': 'module',
                'verbose_name_plural': 'module',
            },
        ),
    ]
