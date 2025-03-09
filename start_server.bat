
@echo off
echo Iniciando o servidor NarrateNexus com Gunicorn e suporte a WebSockets...
echo Certifique-se de ter instalado as dependencias necessarias:
echo pip install gunicorn gevent gevent-websocket flask-socketio

REM Inicia o servidor Gunicorn com as configurações do arquivo
gunicorn --config gunicorn_config.py wsgi:application

REM Para iniciar manualmente sem o arquivo de configuração, use:
REM gunicorn -k gevent --worker-class geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1 wsgi:application --bind 0.0.0.0:5000

pause
