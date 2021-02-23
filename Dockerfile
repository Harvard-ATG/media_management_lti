FROM python:3.9-buster
ENV PYTHONUNBUFFERED 1
RUN mkdir /code
WORKDIR /code
ADD . /code/
RUN pip install -r media_management_lti/requirements/local.txt
