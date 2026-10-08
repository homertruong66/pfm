import logging

from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def api_exception_handler(exc, context):
    """DRF's default handling, plus a WARN line for every 401/403 with the acting User id (if any)."""
    response = exception_handler(exc, context)
    if response is not None and response.status_code in (401, 403):
        request = context.get('request')
        user = getattr(request, 'user', None)
        user_id = user.id if user is not None and user.is_authenticated else None
        logger.warning('%s %s %s user_id=%s', response.status_code, request.method, request.path, user_id)
    return response
