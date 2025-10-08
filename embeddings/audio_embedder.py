import numpy as np
import librosa

class AudioEmbedder:
    """
    Converts audio files into numeric embeddings that represent
    their timbre, rhythm, and spectral structure.
    """

    def __init__(self, dim: int = 128, sr: int = 22050):
        self.dim = dim
        self.sr = sr

    def embed(self, filepath: str) -> np.ndarray:
        """
        Generate a 128-D embedding for an audio file.
        """
        # 1️⃣ Load audio
        y, sr = librosa.load(filepath, sr=self.sr, mono=True, duration=60)

        # 2️⃣ Feature extraction
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        spec_contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
        tonnetz = librosa.feature.tonnetz(y=librosa.effects.harmonic(y), sr=sr)

        # 3️⃣ Pool (mean & std) → flatten
        features = np.concatenate([
            mfcc.mean(axis=1), mfcc.std(axis=1),
            chroma.mean(axis=1), chroma.std(axis=1),
            spec_contrast.mean(axis=1), spec_contrast.std(axis=1),
            tonnetz.mean(axis=1), tonnetz.std(axis=1)
        ])

        # 4️⃣ Reduce / pad to fixed size
        vec = np.zeros((self.dim,), dtype=np.float32)
        length = min(self.dim, len(features))
        vec[:length] = features[:length]
        return vec / np.linalg.norm(vec)

