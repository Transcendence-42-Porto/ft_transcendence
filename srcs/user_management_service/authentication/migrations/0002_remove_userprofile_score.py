# Generated by Django 5.1.3 on 2024-12-07 16:08

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userprofile',
            name='score',
        ),
    ]
