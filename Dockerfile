FROM ubuntu:trusty


ADD lti /lti
RUN apt-get install puppetserver -y
RUN service puppetserver start
CMD ["/sbin/my_init"]
