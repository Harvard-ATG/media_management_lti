# Image Media Manager (IMM)
A media management application for collecting and maintaining media in online course environments. This application supports the IIIF standard for image management, and seamlessly integrates with other applications such as Mirador and LTI-compliant learning management systems like Canvas and edX.


[![Build Status](https://travis-ci.org/Harvard-ATG/media_management_lti.svg)](https://travis-ci.org/Harvard-ATG/media_management_lti)

![alt text](https://github.com/Harvard-ATG/media_management_lti/blob/master/docs/IMM_HAM2.gif "IIIF Demo")

### Quickstart

**Prerequisites:**

- Ensure [docker](https://www.docker.com/) is installed.
- Ensure [media_management_api](https://github.com/Harvard-ATG/media_management_api) docker services are up and running.

**Configure django:**

```
$ cp media_management_lti/settings/secure.py.example media_management_lti/settings/secure.py
```

**Start docker services:**

```
$ docker-compose up
$ docker-compose exec web python manage.py migrate
$ docker-compose exec web python manage.py createsuperuser
$ open http://localhost:8080
```

Note that the _web_ service talks to the [media_management_api](https://github.com/Harvard-ATG/media_management_api) 
_web_ service on the same network. 

**Building angularjus using gulp:**

[Gulp](https://gulpjs.com/) is a tool to build the angularjs code in the `app/` directory. A docker container can be used
to install NodeJS and its associated dependencies and then execute gulp commands. The result of the gulp command (e.g. the build), 
can be saved by means of mounting the app directory as a volume. See example below:

```
$ cd app
$ docker build -t gulp .
$ docker run --rm -v `pwd`:/code gulp npm install
$ docker run --rm -v `pwd`:/code gulp gulp build
$ docker run --rm -v `pwd`:/code gulp gulp watch
```

Note that the `--rm` flag is used to remove the container after the command is executed since the result of the command is saved
to the volume that was mounted (e.g. current directory).

**Other tasks:**

- Access the database: `docker-compose exec db psql -U media_management_lti`
- Run unit tests: `docker-compose exec web python manage.py test`

