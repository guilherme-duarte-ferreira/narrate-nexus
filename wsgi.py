
from app import app, socketio

# Esta variável será usada pelo Gunicorn
application = socketio.wsgi_app
