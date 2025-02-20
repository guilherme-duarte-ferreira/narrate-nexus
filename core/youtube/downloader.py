
import yt_dlp
import tempfile
import traceback
from pathlib import Path
from .exceptions import SubtitleNotFoundError, InvalidVideoError

class YouTubeDownloader:
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp(prefix="yt_dl_")
        
    def _get_ydl_config(self) -> dict:
        return {
            'writesubtitles': True,
            'writeautomaticsub': True,  # Ativar legendas automáticas
            'subtitleslangs': ['pt', 'en', 'a.pt', 'a.en'],  # Incluir legendas automáticas
            'skip_download': True,
            'outtmpl': str(Path(self.temp_dir) / '%(id)s.%(ext)s'),
            'socket_timeout': 30,
            'quiet': True,
            'no_warnings': True
        }

    def fetch(self, url: str) -> str:
        try:
            print(f"[DEBUG] Iniciando download de legendas para: {url}")
            with yt_dlp.YoutubeDL(self._get_ydl_config()) as ydl:
                info = ydl.extract_info(url, download=True)
                video_id = info['id']
                print(f"[DEBUG] ID do vídeo extraído: {video_id}")
                return self._find_subtitle_file(video_id)
        except yt_dlp.utils.DownloadError as e:
            print(f"[ERRO] Falha no download: {str(e)}")
            raise InvalidVideoError(f"Falha no download: {str(e)}") from e
        except Exception as e:
            print(f"[ERRO] Exceção não esperada: {traceback.format_exc()}")
            raise

    def _find_subtitle_file(self, video_id: str) -> str:
        print(f"[DEBUG] Procurando arquivo de legendas para ID: {video_id}")
        # Procurar por múltiplos formatos
        patterns = [f"{video_id}*.vtt", f"{video_id}*.srt", f"{video_id}*.txt"]
        for pattern in patterns:
            print(f"[DEBUG] Procurando padrão: {pattern}")
            for f in Path(self.temp_dir).glob(pattern):
                print(f"[DEBUG] Arquivo encontrado: {f}")
                return str(f)
        raise SubtitleNotFoundError("Nenhum arquivo de legenda encontrado")
