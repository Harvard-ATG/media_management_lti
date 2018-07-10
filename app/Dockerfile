FROM ubuntu:16.04

WORKDIR /code

ADD docker/setup_6.x /tmp/setup_6.x
RUN bash /tmp/setup_6.x

RUN apt-get update
RUN apt-get install -y build-essential nodejs git
RUN /usr/bin/npm install -g gulp
RUN /usr/bin/npm install -g bower

VOLUME ["/code"]
CMD ["gulp", "watch"]
