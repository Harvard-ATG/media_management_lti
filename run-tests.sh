#!/bin/sh
set -e  # Configure shell so that if one command fails, it exits
docker-compose exec web coverage erase
docker-compose exec web coverage run manage.py test
docker-compose exec web coverage report
docker-compose exec web coverage html