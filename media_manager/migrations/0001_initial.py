# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Course',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('lti_context_id', models.CharField(max_length=128, null=True)),
                ('lti_tool_consumer_instance_guid', models.CharField(max_length=1024, null=True)),
                ('api_course_id', models.IntegerField(null=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'course',
                'verbose_name_plural': 'courses',
            },
        ),
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
        migrations.AlterUniqueTogether(
            name='course',
            unique_together=set([('lti_context_id', 'lti_tool_consumer_instance_guid')]),
        ),
    ]
