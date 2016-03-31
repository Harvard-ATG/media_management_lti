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

        NPM_INSTALL = 'npm install --production'
        BOWER_INSTALL = 'bower install'
        GULP_BUILD = 'gulp build'
        APP_CWD = os.path.join(settings.BASE_DIR, 'app')
        BUILD_SRC = os.path.join(settings.BASE_DIR, 'app', 'build')
        BUILD_DST = os.path.join(settings.STATIC_ROOT, 'app', 'build')

        popen_args = { 
            'cwd': APP_CWD, 
            'shell': True, 
        } 

        # Install the dependencies and build the JS
        for cmd in (NPM_INSTALL, BOWER_INSTALL, GULP_BUILD):
            print "Running cmd [%s] with args [%s]" % (cmd, popen_args)
            child = subprocess.Popen([cmd], **popen_args)
            child.wait()
            if child.returncode != 0:
                raise Exception("Command failed [%s] with return code [%s]" % (cmd, child.returncode))

        # Copy the build files to the STATIC_ROOT 
        if os.path.exists(BUILD_DST):
            shutil.rmtree(BUILD_DST)
        shutil.copytree(BUILD_SRC, BUILD_DST)

        return []