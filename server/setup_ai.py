import os
import requests
import zipfile
import sys

def download_vosk_model():
    model_url = "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip"
    model_zip = "vosk-model-small-en-us.zip"
    model_dir = "vosk-model-small-en-us"
    
    if not os.path.exists(model_dir):
        print("Downloading Vosk model...")
        response = requests.get(model_url, stream=True)
        with open(model_zip, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                
        print("Extracting model...")
        with zipfile.ZipFile(model_zip, 'r') as zip_ref:
            zip_ref.extractall('.')
            
        os.remove(model_zip)
        print("Model setup complete!")
    else:
        print("Model already exists!")

if __name__ == "__main__":
    download_vosk_model()
