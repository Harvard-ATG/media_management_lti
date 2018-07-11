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

Note that you need to create API credentials on the [media_management_api](https://github.com/Harvard-ATG/media_management_api) 
admin interface and then update the `secure.py` with the `client_id/client_secret`. This is used by the LTI tool to obtain
API tokens for end-users.

**Start docker services:**

```
$ docker-compose up
$ docker-compose exec web python manage.py migrate
$ docker-compose exec web python manage.py createsuperuser
$ open http://localhost:8080
```

Note that the _web_ service talks to the [media_management_api](https://github.com/Harvard-ATG/media_management_api) 
_web_ service on the same network. 

**Build javascript (e.g. angularjs):**

The final step is to build the [angularjs](https://angularjs.org/) client code stored in the `app/` directory. 

In order to do this, it's necessary to use [gulp](https://gulpjs.com/), a NodeJS build tool, and run the `gulp build`
command in the `app/` directory. Rather than installing a gulp locally, the commands below build a docker container
expressly for that purpose and then execute the necessary command(s).

```
$ cd app
$ docker build -t gulp .
$ docker run --rm -v `pwd`:/code gulp npm install
$ docker run --rm -v `pwd`:/code gulp gulp build
$ docker run --rm -v `pwd`:/code gulp gulp watch
```

Notes:

- The `--rm` flag is used to remove the container after the command is executed since the result of the command is saved
to the volume that was mounted (e.g. current directory).
- The `-v` flag mounts the app directory so that the build is saved outside of the container.

**Other tasks:**

- Access the database: `docker-compose exec db psql -U media_management_lti`
- Run unit tests: `docker-compose exec web python manage.py test`

