FROM phusion/baseimage
RUN rm -f /etc/service/sshd/down
RUN /usr/sbin/enable_insecure_key
CMD ["/sbin/my_init", "--enable-insecure-key"]
