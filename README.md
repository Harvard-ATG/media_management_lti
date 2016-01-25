### Quickstart

```sh
$ cp settings/media_management_lti/secure.py.example settings/media_management_lti/secure.py
$ vagrant up
$ vagrant ssh -- -R 8000:localhost:8000
$ python manage.py runserver 0.0.0.0:8080
```

Note: the port forwarding for vagrant ssh is assuming you have the [API component](https://github.com/Harvard-ATG/media_management_api) running on 8000
