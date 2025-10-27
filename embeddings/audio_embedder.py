import numpy as np
import soundfile as sf
import librosa

class AudioEmbedder:
    """
    Converts audio files into numeric embeddings that represent
    timbre, rhythm, and spectral structure.
    Gracefully falls back to random embeddings if audio loading fails.
    """

    def __init__(self, dim: int = 128, sr: int = 22050):
        self.dim = dim
        self.sr = sr

    def embed(self, filepath: str) -> np.ndarray:
        """
        Generate a 128-D embedding for an audio file, with safe fallbacks.
        """
        try:
            # 1️⃣ Try loading normally
            y, sr = librosa.load(filepath, sr=self.sr, mono=True, duration=60)
            if len(y) == 0:
                raise ValueError("Empty audio file")

            # 2️⃣ Extract spectral features
            mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
            chroma = librosa.feature.chroma_stft(y=y, sr=sr)
            spec_contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
            tonnetz = librosa.feature.tonnetz(y=librosa.effects.harmonic(y), sr=sr)

            # 3️⃣ Combine mean + std pooling
            features = np.concatenate([
                mfcc.mean(axis=1), mfcc.std(axis=1),
                chroma.mean(axis=1), chroma.std(axis=1),
                spec_contrast.mean(axis=1), spec_contrast.std(axis=1),
                tonnetz.mean(axis=1), tonnetz.std(axis=1)
            ])

            # 4️⃣ Normalize to fixed length
            vec = np.zeros((self.dim,), dtype=np.float32)
            length = min(self.dim, len(features))
            vec[:length] = features[:length]
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec /= norm
            return vec

        except Exception as e:
            # 🧩 Graceful fallback
            print(f"[WARN] AudioEmbedder fallback used due to error: {e}")
            np.random.seed(abs(hash(filepath)) % (2**32))
            return np.random.rand(self.dim).astype(np.float32)

