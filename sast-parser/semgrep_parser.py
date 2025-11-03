import os
import time
import logging
import shutil
from pathlib import Path
from typing import Optional

import requests

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s - %(message)s')

API_BASE_URL = os.getenv('API_BASE_URL', 'http://backend:4000/api').rstrip('/')
IMPORT_EMAIL = os.getenv('IMPORT_EMAIL')
IMPORT_PASSWORD = os.getenv('IMPORT_PASSWORD')
DATA_DIR = Path(os.getenv('DATA_DIR', '/data'))
POLL_INTERVAL = int(os.getenv('POLL_INTERVAL', '30'))

session = requests.Session()
session.headers.update({'User-Agent': 'AppSec-SAST-Parser/1.0'})

def login() -> bool:
  if not IMPORT_EMAIL or not IMPORT_PASSWORD:
    logging.error('IMPORT_EMAIL e IMPORT_PASSWORD precisam estar configurados para autenticação automática.')
    return False
  try:
    response = session.post(
      f"{API_BASE_URL}/auth/login",
      json={'email': IMPORT_EMAIL, 'password': IMPORT_PASSWORD},
      timeout=30,
    )
    response.raise_for_status()
    logging.info('Autenticado com sucesso no backend.')
    return True
  except requests.RequestException as exc:
    logging.error('Falha ao autenticar no backend: %s', exc)
    return False

def ensure_directories():
  DATA_DIR.mkdir(parents=True, exist_ok=True)
  (DATA_DIR / 'processed').mkdir(parents=True, exist_ok=True)
  (DATA_DIR / 'failed').mkdir(parents=True, exist_ok=True)


def determine_endpoint(file_name: str) -> str:
  lowered = file_name.lower()
  if 'sca' in lowered or 'supply' in lowered or 'dependency' in lowered:
    return 'sca'
  return 'sast'


def upload_file(path: Path) -> bool:
  endpoint = determine_endpoint(path.name)
  url = f"{API_BASE_URL}/import/{endpoint}"
  logging.info('Enviando %s para %s', path.name, endpoint.upper())
  try:
    with path.open('rb') as handle:
      response = session.post(url, files={'file': (path.name, handle, 'text/csv')}, timeout=120)
    if response.status_code == 401:
      logging.warning('Token expirado, tentando autenticar novamente...')
      if login():
        with path.open('rb') as handle:
          response = session.post(url, files={'file': (path.name, handle, 'text/csv')}, timeout=120)
    response.raise_for_status()
    try:
      payload = response.json()
    except ValueError:
      payload = response.text
    logging.info('Arquivo %s importado com sucesso (%s).', path.name, payload)
    return True
  except requests.RequestException as exc:
    logging.error('Falha ao enviar %s: %s', path.name, exc)
    return False

def process_pending_files():
  files = list(DATA_DIR.glob('*.csv')) + list(DATA_DIR.glob('*.CSV'))
  for csv_file in sorted(files):
    target_dir: Optional[Path] = None
    if upload_file(csv_file):
      target_dir = DATA_DIR / 'processed'
    else:
      target_dir = DATA_DIR / 'failed'
    try:
      shutil.move(str(csv_file), target_dir / csv_file.name)
    except Exception as exc:  # noqa: BLE001
      logging.error('Não foi possível mover %s para %s: %s', csv_file.name, target_dir, exc)


def main():
  ensure_directories()
  if not login():
    logging.warning('Continuando em modo de espera; tentaremos novamente em cada ciclo.')
  while True:
    process_pending_files()
    time.sleep(POLL_INTERVAL)


if __name__ == '__main__':
  main()
