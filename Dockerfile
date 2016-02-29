FROM phusion/baseimage
ADD vagrant/manifests /tmp/puppet
RUN rm -f /etc/service/sshd/down
RUN /usr/sbin/enable_insecure_key
RUN if [ ! -f /deb-get ]; then curl -O https://apt.puppetlabs.com/puppetlabs-release-trusty.deb  && sudo touch /deb-get; fi
RUN if [ ! -f /deb-run ]; then sudo dpkg -i puppetlabs-release-trusty.deb  && sudo touch /deb-run; fi
RUN if [ ! -f /apt-get-run ]; then sudo apt-get update && sudo touch /apt-get-run; fi
RUN if [ ! -f /apt-get-puppet ]; then sudo apt-get install --yes --force-yes puppet && sudo touch /apt-get-puppet; fi
RUN puppet module install puppetlabs-stdlib --force
RUN puppet apply -l /tmp/puppet/default.pp
CMD ["/sbin/my_init", "--enable-insecure-key"]
