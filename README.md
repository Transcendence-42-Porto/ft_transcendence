## Backend Structure Suggestion
```
.
├── backend
│   ├── backend
│   │   ├── asgi.py
│   │   ├── __init__.py
│   │   ├── settings
│   │   │   ├── base.py
│   │   │   ├── dev.py
│   │   │   └── prod.py
│   │   ├── static
│   │   │   └── css
│   │   │       └── main.css
│   │   ├── media
│   │   │   └── uploads
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps
│   │   ├── users
│   │   │   ├── admin.py
│   │   │   ├── models.py
│   │   │   ├── views.py
│   │   │   └── tests
│   │   │       ├── test_models.py
│   │   │       ├── test_views.py
│   │   │       └── test_urls.py
│   └── manage.py
├── docker-compose.yml
├── Dockerfile
├── LICENSE
├── Makefile
├── poetry.lock
├── pyproject.toml
└── README.md

```