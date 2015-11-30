# The secure.py file stores environment specific settings and secrets.  It is 
# generated during deployment to AWS based on settings stored in s3.  Using the
# below secure settings in combination with project defaults should be 
# sufficient to get you started.  Make sure you copy this file over as is to
# secure.py before running `vagrant up`.

SECURE_SETTINGS = {
    'enable_debug': True,
    'django_secret_key': 'secret',
    'db_default_name': 'media_management_lti',
    'db_default_user': 'media_management_lti',
    'db_default_password': 'media_management_lti',
}
