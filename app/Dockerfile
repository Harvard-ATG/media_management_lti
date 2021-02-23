FROM ubuntu:20.04

WORKDIR /code

RUN apt-get update -y && apt-get install -y build-essential nodejs git
RUN /usr/bin/npm install -g gulp && /usr/bin/install -g bower

VOLUME ["/code"]
CMD ["gulp", "watch"]
