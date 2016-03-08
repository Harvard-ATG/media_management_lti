### Quickstart

[![Join the chat at https://gitter.im/Harvard-ATG/media_management_lti](https://badges.gitter.im/Harvard-ATG/media_management_lti.svg)](https://gitter.im/Harvard-ATG/media_management_lti?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

```sh
$ cp settings/media_management_lti/secure.py.example settings/media_management_lti/secure.py
$ vagrant up
$ vagrant ssh -- -R 8000:localhost:8000
$ python manage.py runserver 0.0.0.0:8080
```

Note: the port forwarding for vagrant ssh is assuming you have the [API component](https://github.com/Harvard-ATG/media_management_api) running on 8000
