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
        1. renaming files to include a hash of their content for cache-busting,
           and copying those files to the target storage.
        2. adjusting files which contain references to other files so they
           refer to the cache-busting filenames.
        If either of these are performed on a file, then that file is considered
        post-processed.
        """
        if dry_run:
            yield

        NPM_INSTALL = 'npm install --production'
        BOWER_INSTALL = 'bower install'
        GULP_BUILD = 'gulp build'

        APP_CWD = os.path.join(settings.BASE_DIR, 'app')
        print APP_CWD

        popen_args = {
            'cwd': APP_CWD,
            'shell': True,
        }
        for cmd in (NPM_INSTALL, BOWER_INSTALL, GULP_BUILD):
            print "running cmd %s with args %s" % (cmd, popen_args)
            child = subprocess.Popen([cmd], **popen_args)
            child.wait()
            if child.returncode != 0:
                raise Exception("Command failed [%s] with return code [%s]" % (cmd, child.returncode))

        # sort the files by the directory level
        def path_level(name):
            return len(name.split(os.sep))

        for name in sorted(paths.keys(), key=path_level, reverse=True):
            print name
            yield name, name, False

        build_dst = os.path.join(settings.STATIC_ROOT, 'app', 'build')
        build_src = os.path.join(settings.BASE_DIR, 'app', 'build')
        if os.path.exists(build_dst):
            shutil.rmtree(build_dst)
        shutil.copytree(build_src, build_dst)