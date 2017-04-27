from media_manager.lti import LTILaunch
from functools import wraps

def require_permission(permission):
    def perm_decorator(func):
        @wraps(func)
        def func_wrapper(request, *args, **kwargs):
            LTILaunch(request).require_perm(permission)
            return func(request, *args, **kwargs)
        return func_wrapper
    return perm_decorator
