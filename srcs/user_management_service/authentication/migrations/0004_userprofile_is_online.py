# Generated by Django 5.1.3 on 2025-02-07 10:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0003_alter_userprofile_avatar'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='is_online',
            field=models.BooleanField(default=False),
        ),
    ]
