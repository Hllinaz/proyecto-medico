
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed

from .models import Usuario


class UsuarioJWTAuthentication(JWTAuthentication):
    """
    Autenticación JWT usando el modelo agenda.Usuario
    en lugar del auth.User por defecto de Django.
    """

    def get_user(self, validated_token):
        try:
            user_id = validated_token[api_settings.USER_ID_CLAIM]
        except KeyError as e:
            raise InvalidToken("Token contained no recognizable user identification") from e

        try:
            user = Usuario.objects.get(id_usuario=user_id)
        except Usuario.DoesNotExist:
            raise AuthenticationFailed("User not found", code="user_not_found")

        return user
