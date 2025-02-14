from transformers import T5ForConditionalGeneration, T5Tokenizer
import torch
from vosk import Model, KaldiRecognizer
import wave
import json
import os
import base64
import sys

# Lazy loading of models
_t5_tokenizer = None
_t5_model = None
_vosk_model = None

def _load_t5():
    global _t5_tokenizer, _t5_model
    if _t5_tokenizer is None:
        print("Loading T5 model...", file=sys.stderr)
        _t5_tokenizer = T5Tokenizer.from_pretrained("t5-base")
        _t5_model = T5ForConditionalGeneration.from_pretrained("t5-base")
    return _t5_tokenizer, _t5_model

def _load_vosk():
    global _vosk_model
    if _vosk_model is None:
        if not os.path.exists("vosk-model-small-en-us"):
            raise RuntimeError("Please download the model from https://alphacephei.com/vosk/models and unpack as 'vosk-model-small-en-us'")
        print("Loading Vosk model...", file=sys.stderr)
        _vosk_model = Model("vosk-model-small-en-us")
    return _vosk_model

def generate_note_content(topic: str, context: str = None) -> str:
    try:
        tokenizer, model = _load_t5()

        # Prepare prompt
        prompt = f"summarize: Generate comprehensive study notes about {topic}"
        if context:
            prompt += f" with context: {context}"

        # Generate notes
        inputs = tokenizer.encode(prompt, return_tensors="pt", max_length=512, truncation=True)
        outputs = model.generate(inputs, max_length=500, num_return_sequences=1, num_beams=4)
        notes = tokenizer.decode(outputs[0], skip_special_tokens=True)

        return notes
    except Exception as e:
        print(f"Note generation error: {str(e)}", file=sys.stderr)
        raise Exception(f"Failed to generate notes: {str(e)}")

def transcribe_audio(audio_base64: str) -> str:
    try:
        vosk_model = _load_vosk()

        # Decode base64 audio
        audio_data = base64.b64decode(audio_base64)

        # Save to temporary file
        temp_path = f"/tmp/audio-{os.getpid()}.wav"
        with wave.open(temp_path, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(16000)
            wf.writeframes(audio_data)

        try:
            # Create recognizer
            rec = KaldiRecognizer(vosk_model, 16000)

            # Process audio
            with wave.open(temp_path, "rb") as wf:
                while True:
                    data = wf.readframes(4000)
                    if len(data) == 0:
                        break
                    rec.AcceptWaveform(data)

            # Get result
            result = json.loads(rec.FinalResult())
            return result["text"]

        finally:
            # Cleanup
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        print(f"Transcription error: {str(e)}", file=sys.stderr)
        raise Exception(f"Failed to transcribe audio: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: No command provided", file=sys.stderr)
        sys.exit(1)

    command = sys.argv[1]

    try:
        if command == "generate":
            if len(sys.argv) < 3:
                print("Error: No topic provided for note generation", file=sys.stderr)
                sys.exit(1)
            topic = sys.argv[2]
            context = sys.argv[3] if len(sys.argv) > 3 else None
            result = generate_note_content(topic, context)
            print(result)
        elif command == "transcribe":
            if len(sys.argv) < 3:
                print("Error: No audio data provided", file=sys.stderr)
                sys.exit(1)
            audio_base64 = sys.argv[2]
            result = transcribe_audio(audio_base64)
            print(result)
        else:
            print(f"Error: Unknown command {command}", file=sys.stderr)
            sys.exit(1)
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)