#!/bin/bash
# Set up virtualenv and migrate project
export HOME=/home/vagrant
export WORKON_HOME=$HOME/.virtualenvs
source /usr/local/bin/virtualenvwrapper.sh
mkvirtualenv -a /home/vagrant/media_management_lti -r /home/vagrant/media_management_lti/media_management_lti/requirements/local.txt media_management_lti 
workon media_management_lti
python manage.py migrate
