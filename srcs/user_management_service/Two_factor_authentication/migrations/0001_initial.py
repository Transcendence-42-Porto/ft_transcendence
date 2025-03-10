# Generated by Django 5.1.6 on 2025-03-10 09:23

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='UserLoginAttempt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254, null=True, unique=True)),
                ('attempts', models.PositiveIntegerField(default=0)),
                ('last_failed_attempt', models.DateTimeField(blank=True, null=True)),
                ('last_successful_attempt', models.DateTimeField(blank=True, null=True)),
                ('secret_key', models.CharField(blank=True, max_length=32, null=True)),
            ],
            options={
                'db_table': 'user_login',
            },
        ),
    ]
