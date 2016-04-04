from django.contrib.staticfiles import storage
from django.core.files.base import File
from django.conf import settings
import os
import re
import subprocess
import shutil
import json
import hashlib
import logging

logger = logging.getLogger(__name__)

# Setup commands to run
NPM_INSTALL = 'npm install --production'
BOWER_INSTALL = 'bower install'
GULP_BUILD = 'gulp build'

# Setup directory paths
NODE_MODULES_DIR = os.path.join(settings.BASE_DIR, 'app', 'node_modules')
NODE_MODULES_BIN_DIR = os.path.join(NODE_MODULES_DIR, '.bin')
APP_BASE_DIR = os.path.join(settings.BASE_DIR, 'app')
BUILD_SRC = os.path.join(settings.BASE_DIR, 'app', 'build')
BUILD_DST = os.path.join(settings.STATIC_ROOT, 'app', 'build')


class StaticFilesStorage(storage.StaticFilesStorage):
    def __init__(self, *args, **kwargs):
        super(StaticFilesStorage, self).__init__(*args, **kwargs)

    def post_process(self, paths, dry_run=False, **options):
        """
        Post process the given OrderedDict of files (called from collectstatic).
        Processing is actually two separate operations:
            1. Build the source files.
            2. Copy the build files to the static root.
        """
        if dry_run:
            return []
        
        # Build the source files
        self.build_src_files()
        
        # Hash the built artifacts (cache-busting tactic)
        hashed_files = self.hash_build_files()
        
        # Write the manifest file that maps the original built artifacts to the hashed files
        self.save_build_manifest(hashed_files)

        # Copy the build file artifacts to the STATIC_ROOT so that django can serve them up
        if os.path.exists(BUILD_DST):
            shutil.rmtree(BUILD_DST)
        shutil.copytree(BUILD_SRC, BUILD_DST)

        return []

    def build_src_files(self):
        """
        Building the source files is two steps:
            1. Install required dependencies for build.
            2. Build the JS and CSS and copy to their destinations
        """
        # Setup args to pass to the commands
        popen_args = { 
            'cwd': APP_BASE_DIR, 
            'shell': True,
            'env': {
                'PATH': os.environ['PATH'] +':{0}'.format(NODE_MODULES_BIN_DIR) # so the shell can find the "bower" command
            }
        }
        logger.info("popen_args=%s" % popen_args)
        
        # Run the commands.
        for cmd in (NPM_INSTALL, BOWER_INSTALL, GULP_BUILD):
            logger.info("Running cmd [%s] with args [%s]" % (cmd, popen_args))
            child = subprocess.Popen([cmd], **popen_args)
            child.wait()
            if child.returncode != 0:
                raise Exception("Command failed [%s] with return code [%s]" % (cmd, child.returncode))

    def hash_build_files(self):
        """
        Renames each build file to include a hash of the file contents.
        """
        js_dir = os.path.join(BUILD_SRC, 'app', 'js')
        css_dir = os.path.join(BUILD_SRC, 'app', 'css')
        file_pattern = r'^.+(?:-[a-zA-Z0-9]{12})\.(?:js|css)$'
        
        hashed_files = {}
        for target_dir in (js_dir, css_dir):
            for name in os.listdir(target_dir):
                can_hash_file = (name.endswith('.js') or name.endswith('.css')) and re.match(file_pattern, name) is None
                if can_hash_file:
                    orig_file_path = os.path.join(target_dir, name)
                    logger.info("Hashing file: %s" % orig_file_path)
                    with open(orig_file_path, 'rb') as f:
                        hash_result = self.file_hash(File(f))
                        (file_name, file_extension) = os.path.splitext(name)
                        new_file_path = os.path.join(target_dir, "%s-%s%s" % (file_name, hash_result, file_extension))
                        hashed_files[orig_file_path] = new_file_path
                        logger.info("Copying file %s to %s" % (orig_file_path, new_file_path))
                        shutil.copyfile(orig_file_path, new_file_path)

        return hashed_files

    def save_build_manifest(self, hashed_files):
        """
        Writes the build manfiest which contains a JSON object mapping the
        original file names to the hashed file names.
        """
        
        # Make the paths relative instead of absolute in the same way that they
        # are in the application (i.e. "app/js/vendor.js").
        build_manifest = {}
        strip_src_path = BUILD_SRC + "/"
        strip_dst_path = settings.BASE_DIR + "/"
        for original_path, hashed_path in hashed_files.iteritems():
            src = original_path.replace(strip_src_path, '')
            dst = hashed_path.replace(strip_dst_path, '')
            build_manifest[src] = dst
        
        # Write the JSON file with the mappings
        manifest_file = os.path.join(BUILD_SRC, 'build.json')
        manifest_json = json.dumps(build_manifest)
        logger.info("Build manifest: %s" % manifest_json)
        logger.info("Writing build manifest: %s" % manifest_file)
        with open(manifest_file, 'w') as f:
            f.write(manifest_json)

        return manifest_file

    def file_hash(self, content=None):
        """
        Return a hash of the file with the given name and optional content.
        """
        if content is None:
            return None
        md5 = hashlib.md5()
        for chunk in content.chunks():
            md5.update(chunk)
        return md5.hexdigest()[:12]