
from urllib.parse import urlparse
import re

class YouTubeValidator:
    def __init__(self):
        self._allowed_domains = {
            'youtube.com', 
            'youtu.be', 
            'www.youtube.com', 
            'm.youtube.com'
        }
        self._id_pattern = re.compile(
            r'(?:v=|be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})'  # Regex aprimorada
        )


    def is_valid(self, url: str) -> bool:
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.replace('www.', '').replace('m.', '')

            
            # Verifica domínio e extrai ID do vídeo
            if domain in self._allowed_domains:
                match = self._id_pattern.search(url)
                return bool(match)
            return False
        except:
            return False

    def extract_video_id(self, url: str) -> str:
        match = self._id_pattern.search(url)
        if match:
            return match.group(1)
        raise ValueError("ID do vídeo não encontrado na URL")
