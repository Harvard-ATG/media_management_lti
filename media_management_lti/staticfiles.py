from django.contrib.staticfiles import storage
from django.conf import settings
import logging
import os
import subprocess
import shutil

logger = logging.getLogger(__name__)

class StaticFilesStorage(storage.StaticFilesStorage):
    def __init__(self, *args, **kwargs):
        super(StaticFilesStorage, self).__init__(*args, **kwargs)

    def post_process(self, paths, dry_run=False, **options):
        """
        Post process the given OrderedDict of files (called from collectstatic).
        Processing is actually two separate operations:
        1. Install required dependencies for build.
        2. Build the JS and CSS and copy to their destinations
        """
        if dry_run:
            return []

        # Setup commands to run
        NPM_INSTALL = 'npm install --production'
        BOWER_INSTALL = 'bower install'
        GULP_BUILD = 'gulp build'
        COMMANDS = (NPM_INSTALL, BOWER_INSTALL, GULP_BUILD)

        # Setup directory paths
        NODE_MODULES_DIR = os.path.join(settings.BASE_DIR, 'app', 'node_modules')
        NODE_MODULES_BIN_DIR = os.path.join(NODE_MODULES_DIR, '.bin')
        APP_BASE_DIR = os.path.join(settings.BASE_DIR, 'app')
        BUILD_SRC = os.path.join(settings.BASE_DIR, 'app', 'build')
        BUILD_DST = os.path.join(settings.STATIC_ROOT, 'app', 'build')
        
        # Setup args to pass to the commands
        popen_args = { 
            'cwd': APP_BASE_DIR, 
            'shell': True,
            'env': {
                'PATH': os.environ['PATH'] +':{0}'.format(NODE_MODULES_BIN_DIR) # so the shell can find the "bower" command
            }
        }
        print "popen_args=%s" % popen_args
        
        # Run the commands.
        for cmd in COMMANDS:
            print "Running cmd [%s] with args [%s]" % (cmd, popen_args)
            child = subprocess.Popen([cmd], **popen_args)
            child.wait()
            if child.returncode != 0:
                raise Exception("Command failed [%s] with return code [%s]" % (cmd, child.returncode))

        # Copy the build file artifacts to the STATIC_ROOT so that django can serve them up
        if os.path.exists(BUILD_DST):
            shutil.rmtree(BUILD_DST)
        shutil.copytree(BUILD_SRC, BUILD_DST)

        return []