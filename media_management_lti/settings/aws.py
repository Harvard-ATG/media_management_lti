from .base import *
from logging.config import dictConfig

# tlt hostnames
ALLOWED_HOSTS = ['.tlt.harvard.edu']

# SSL is terminated at the ELB so look for this header to know that we should be in ssl mode
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True

# AWS Email Settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'email-smtp.us-east-1.amazonaws.com'
EMAIL_USE_TLS = True
EMAIL_PORT = 587  # Use 587 or 2587 to avoid timeouts when sending mail via Amazon SES
EMAIL_HOST_USER = SECURE_SETTINGS.get('email_host_user', '')
EMAIL_HOST_PASSWORD = SECURE_SETTINGS.get('email_host_password', '')

# Configure logging
dictConfig(LOGGING)
