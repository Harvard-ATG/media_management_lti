# Image Media Manager (IMM)
A media management application for collecting and maintaining media in online course environments. This application supports the IIIF standard for image management, and seamlessly integrates with other applications such as Mirador and LTI-compliant learning management systems like Canvas and edX.


[![Build Status](https://travis-ci.org/Harvard-ATG/media_management_lti.svg)](https://travis-ci.org/Harvard-ATG/media_management_lti)

![alt text](https://github.com/Harvard-ATG/media_management_lti/blob/master/docs/IMM_HAM2.gif "IIIF Demo")

### Quickstart

Prerequisites:

- Docker 
- [Media Management API service](https://github.com/Harvard-ATG/media_management_api) 

Setup environment settings:

```
$ cp media_management_lti/settings/secure.py.example media_management_lti/settings/secure.py
```

Start the docker containers and run initial setup tasks:

```
$ docker-compose up
$ docker-compose exec web python manage.py migrate
$ docker-compose exec web python manage.py createsuperuser
$ docker-compose exec node gulp build
$ open http://localhost:8080
```

To access the postgres database directly:

```
docker-compose exec db psql -U media_management_api
```

