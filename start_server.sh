
#!/bin/bash
# Script para iniciar o servidor Gunicorn com gevent

echo "Iniciando o servidor NarrateNexus com Gunicorn e suporte a WebSockets..."
echo "Certifique-se de ter instalado as dependências necessárias:"
echo "pip install gunicorn gevent gevent-websocket flask-socketio"

# Inicia o servidor Gunicorn com as configurações do arquivo
gunicorn --config gunicorn_config.py wsgi:application

# Para iniciar manualmente sem o arquivo de configuração, use:
# gunicorn -k gevent --worker-class geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1 wsgi:application --bind 0.0.0.0:5000
