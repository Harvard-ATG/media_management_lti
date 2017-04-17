# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  # All Vagrant configuration is done here. The most common configuration
  # options are documented and commented below. For a complete reference,
  # please see the online documentation at vagrantup.com.

  # Our EC2 instances run ubuntu 14.04 (trusty)
  config.vm.provider "docker" do |d|
    d.build_dir = "."
    d.has_ssh = true
    d.ports = [ '127.0.0.1:8888:8080' ]
  end
  config.ssh.username = 'root'
  config.ssh.private_key_path = 'insecure_key'
##  config.puppet_install.puppet_version = :latest

  # Provisioning
  # -------------
  # Add stdlib so we can use file_line module
# config.vm.provision 'shell' do |shell|
#   shell.inline = "mkdir -p /etc/puppet/modules;
#                   puppet module install puppetlabs-stdlib --force;"
# end
#
# config.vm.provision :puppet, :options => ["--debug --trace --verbose"] do |puppet|
#   puppet.manifests_path = "vagrant/manifests"
# end
end
