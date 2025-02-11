# Generated by Django 5.1.3 on 2025-02-08 11:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('scores', '0002_remove_score_score_score_opponent_score_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='score',
            name='game_type',
            field=models.CharField(default='single_player', max_length=255),
        ),
        migrations.AddField(
            model_name='score',
            name='tournament_name',
            field=models.CharField(default='none', max_length=255),
        ),
    ]
