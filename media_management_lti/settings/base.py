"""
Django settings for media_management_lti project.
Generated by 'django-admin startproject' using Django {{ django_version }} of TLT template.
For more information on this file, see
https://docs.djangoproject.com/en/{{ docs_version }}/topics/settings/
For the full list of settings and their values, see
https://docs.djangoproject.com/en/{{ docs_version }}/ref/settings/
"""

import os
import json
import logging
from .secure import SECURE_SETTINGS

# Ensure this middleware is imported early in the bootstrap process because we need django_auth_lti.patch_reverse
# to monkey patch the django reverse() function, which automatically includes the resource_link_id in requests.
import django_auth_lti.middleware_patched

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
# NOTE: Since we have a settings module, we have to go one more directory up to get to
# the project root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = SECURE_SETTINGS.get('django_secret_key', 'changeme')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = SECURE_SETTINGS.get('enable_debug', False)

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_auth_lti',
    'media_manager',
]

MIDDLEWARE_CLASSES = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django_auth_lti.middleware_patched.MultiLTILaunchAuthMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'media_management_lti.middleware.LtiExceptionMiddleware',
]

# Authentication

# Django defaults are below, but will need to be customized if using something
# other than the built-in Django auth, such as PIN, LTI, etc.
# AUTHENTICATION_BACKENDS = ('django.contrib.auth.backends.ModelBackend',)
# LOGIN_URL = '/accounts/login'
AUTHENTICATION_BACKENDS = (
    #'libs.auth.GoogleBackend',
    #'django_openid_auth.auth.OpenIDBackend',
    'django.contrib.auth.backends.ModelBackend',
    'django_auth_lti.backends.LTIAuthBackend',
)


ROOT_URLCONF = 'media_management_lti.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            #os.path.join(BASE_DIR, 'app/build')
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
            'debug': DEBUG,
        },
    },
]

WSGI_APPLICATION = 'media_management_lti.wsgi.application'

# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': SECURE_SETTINGS.get('db_default_name', 'media_management_lti'),
        'USER': SECURE_SETTINGS.get('db_default_user', 'postgres'),
        'PASSWORD': SECURE_SETTINGS.get('db_default_password'),
        'HOST': SECURE_SETTINGS.get('db_default_host', '127.0.0.1'),
        'PORT': SECURE_SETTINGS.get('db_default_port', 5432),  # Default postgres port
    },
}

# Sessions
# https://docs.djangoproject.com/en/1.8/topics/http/sessions/#module-django.contrib.sessions

# Store sessions in default cache defined below
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_COOKIE_NAME = 'media_management_lti_sid'
# NOTE: This setting only affects the session cookie, not the expiration of the session
# being stored in the cache.  The session keys will expire according to the value of
# SESSION_COOKIE_AGE which defaults to 2 weeks.
SESSION_EXPIRE_AT_BROWSER_CLOSE = True


# Cache
# https://docs.djangoproject.com/en/1.8/ref/settings/#std:setting-CACHES

REDIS_HOST = SECURE_SETTINGS.get('redis_host', '127.0.0.1')
REDIS_PORT = SECURE_SETTINGS.get('redis_port', 6379)

CACHES = {
    'default': {
        'BACKEND': 'redis_cache.RedisCache',
        'LOCATION': "redis://%s:%s/0" % (REDIS_HOST, REDIS_PORT),
        'OPTIONS': {
            'PARSER_CLASS': 'redis.connection.HiredisParser'
        },
        'KEY_PREFIX': 'media_management_lti',  # Provide a unique value for shared cache
        # See following for default timeout (5 minutes as of 1.7):
        # https://docs.djangoproject.com/en/1.8/ref/settings/#std:setting-CACHES-TIMEOUT
        'TIMEOUT': SECURE_SETTINGS.get('default_cache_timeout_secs', 300),
    },
}

# Internationalization
# https://docs.djangoproject.com/en/1.8/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'
# A boolean that specifies whether Django's translation system should be enabled. This provides
# an easy way to turn it off, for performance. If this is set to False, Django will make some
# optimizations so as not to load the translation machinery.
USE_I18N = False
# A boolean that specifies if localized formatting of data will be enabled by default or not.
# If this is set to True, e.g. Django will display numbers and dates using the format of the
# current locale.  NOTE: this would only really come into play if your locale was outside of the
# US
USE_L10N = False
# A boolean that specifies if datetimes will be timezone-aware by default or not. If this is set to
# True, Django will use timezone-aware datetimes internally. Otherwise, Django will use naive
# datetimes in local time.
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/

STATIC_ROOT = os.path.normpath(os.path.join(BASE_DIR, 'http_static'))
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(BASE_DIR, 'app/build'),
]
STATICFILES_STORAGE = 'media_management_lti.staticfiles.StaticFilesStorage'

# Logging
# https://docs.djangoproject.com/en/1.8/topics/logging/#configuring-logging

# Turn off default Django logging
# https://docs.djangoproject.com/en/1.8/topics/logging/#disabling-logging-configuration
LOGGING_CONFIG = None

_DEFAULT_LOG_LEVEL = SECURE_SETTINGS.get('log_level', logging.DEBUG)
_LOG_ROOT = SECURE_SETTINGS.get('log_root', '')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s\t%(asctime)s.%(msecs)03dZ\t%(name)s:%(lineno)s\t%(message)s',
            'datefmt': '%Y-%m-%dT%H:%M:%S'
        },
        'simple': {
            'format': '%(levelname)s\t%(name)s:%(lineno)s\t%(message)s',
        },
    },
    'handlers': {
        # By default, log to a file
        'default': {
            'class': 'logging.handlers.WatchedFileHandler',
            'level': _DEFAULT_LOG_LEVEL,
            'formatter': 'verbose',
            'filename': os.path.join(_LOG_ROOT, 'django-media_management_lti.log'),
        },
    },
    # This is the default logger for any apps or libraries that use the logger
    # package, but are not represented in the `loggers` dict below.  A level
    # must be set and handlers defined.  Setting this logger is equivalent to
    # setting and empty string logger in the loggers dict below, but the separation
    # here is a bit more explicit.  See link for more details:
    # https://docs.python.org/2.7/library/logging.config.html#dictionary-schema-details
    'root': {
        'level': logging.DEBUG,
        'handlers': ['default'],
    },
    'loggers': {
        # Add app specific loggers here, should look something like this:
        # '{{ app_name }}': {
        #    'level': _DEFAULT_LOG_LEVEL,
        #    'handlers': ['default'],
        #    'propagate': False,
        # },
        # Make sure that propagate is False so that the root logger doesn't get involved
        # after an app logger handles a log message.
        'media_manager': {
            'level': _DEFAULT_LOG_LEVEL,
            'handlers': ['default'],
            'propagate': False,
        }
    },
}

# Add LTI configuration settings
LTI_SETUP = {
    "TOOL_TITLE": "Media Manager",
    "TOOL_DESCRIPTION": "Create and display image collections using Mirador.",
    "LAUNCH_URL": "media_manager:lti_launch",
    "LAUNCH_REDIRECT_URL": "media_manager:index",
    "EXTENSION_PARAMETERS": {
        "canvas.instructure.com": {
            "privacy_level": "public",
            "course_navigation": {
                "enabled": "true",
                "default": "disabled",
                "text": "Media Manager",
            }
        }
    }
}

# Loads the application build JSON file.
# This file maps JS/CSS build file names to their hashed version. For example:
#     app.js -> app-123efg.js
#     vendor.js -> app-456abc.js
#
# This is used by HTML templates/templatetags to generate the correct static URLs.
APP_BUILD_JSON = None
APP_BUILD_JSON_FILE = os.path.join(BASE_DIR, 'app', 'build', 'build.json')
if os.path.exists(APP_BUILD_JSON_FILE):
    with open(APP_BUILD_JSON_FILE, 'r') as f:
        APP_BUILD_JSON = json.loads(f.read())


# Add LTI oauth credentials (for django-auth-lti)
LTI_OAUTH_CREDENTIALS = SECURE_SETTINGS.get("lti_oauth_credentials", {"mykey":"mysecret"})

# Media Management API settings
MEDIA_MANAGEMENT_API_URL = SECURE_SETTINGS["media_management_api_url"]
MEDIA_MANAGEMENT_API_CREDENTIALS = SECURE_SETTINGS.get("media_management_api_credentials", {"client_id": None, "client_secret": None})

# Google analytics
GOOGLE_ANALYTICS_TRACKING_ID = None
