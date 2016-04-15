[![Build Status](https://travis-ci.org/Harvard-ATG/media_management_lti.svg)](https://travis-ci.org/Harvard-ATG/media_management_lti)

### Quickstart

```sh
$ cp settings/media_management_lti/secure.py.example settings/media_management_lti/secure.py
$ vagrant up
$ vagrant ssh -- -R 8000:localhost:8000
$ workon media_management_lti
$ export DJANGO_SETTINGS_MODULE=media_management_lti.settings.local
$ python manage.py migrate
$ python manage.py runserver 0.0.0.0:8080
```

Note: the port forwarding for vagrant ssh is assuming you have the [API component](https://github.com/Harvard-ATG/media_management_api) running on 8000

Optional step: run `python manage.py collectstatic` before runserver to build the JS/CSS. You must have [nodejs](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) installed prior to running that command. If you're on an ubuntu machine, you can install these dependencies by running `apt-get install nodejs nodejs-legacy npm build-essentials`

