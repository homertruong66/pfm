import logging

from django.db import IntegrityError, transaction

from roles.models import Role

from .exceptions import UserAlreadyExists
from .models import User

logger = logging.getLogger(__name__)


@transaction.atomic
def create_user(*, full_name, email, password, actor=None):
    """UM-US-01: create an active User account holding the USER role.

    One atomic operation (AR-05): if any step fails, no User is left behind (EC-09).
    The email is compared case-insensitively (EC-07); a database uniqueness violation caused by
    a simultaneous request is reported the same way as an ordinary duplicate (AC-03).
    """
    actor_id = getattr(actor, 'id', None)

    if User.objects.filter(email__iexact=email).exists():
        logger.warning('create_user rejected: account already exists (actor_id=%s)', actor_id)
        raise UserAlreadyExists()

    try:
        with transaction.atomic():
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                full_name=full_name,
            )
    except IntegrityError:
        logger.warning('create_user rejected: account already exists (actor_id=%s)', actor_id)
        raise UserAlreadyExists()

    user.roles.add(Role.objects.get(code=Role.Code.USER))

    logger.info('create_user succeeded: user_id=%s (actor_id=%s)', user.id, actor_id)
    return user
