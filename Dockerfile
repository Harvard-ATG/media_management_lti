FROM phusion/baseimage
RUN rm -f /etc/service/sshd/down
RUN /usr/sbin/enable_insecure_key
ADD ~/.ssh/id_rsa.pub /tmp/your_key.pub
RUN cat /tmp/your_key.pub >> /root/.ssh/authorized_keys && rm -f /tmp/your_key.pub
CMD ["/sbin/my_init", "--enable-insecure-key"]
