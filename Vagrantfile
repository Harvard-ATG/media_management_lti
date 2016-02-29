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
    d.cmd = ["/sbin/my_init", "--enable-insecure-key"]
    d.image = 'phusion/baseimage'
    d.has_ssh = true
  end
  config.ssh.username = 'root'
  config.ssh.private_key_path = 'phusion.key'
  


  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  # config.vm.network :forwarded_port, guest: 80, host: 8080

  config.vm.network :forwarded_port, guest: 8080, host: 8888, auto_correct: false

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  # config.vm.network :private_network, ip: "192.168.33.10"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  # config.vm.network :public_network

  # If true, then any SSH connections made will enable agent forwarding.
  # Default value: false

 # config.ssh.forward_agent = true

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../data", "/vagrant_data"

  # Provisioning
  # -------------
  # Add stdlib so we can use file_line module
  config.vm.provision 'shell' do |shell|
    shell.inline = "mkdir -p /etc/puppet/modules;
                    puppet module install puppetlabs-stdlib --force;"
  end

  config.vm.provision 'puppet' do |puppet|
    puppet.manifests_path = "vagrant/manifests"
  end

end
