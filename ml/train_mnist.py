"""Train the PRD's 784 → 128 → 64 → 10 MNIST network and export int8 weights.
Run: OPENBLAS_NUM_THREADS=4 .venv/bin/python ml/train_mnist.py
The exported fixture uses held-out MNIST samples, never training examples.
"""
import gzip
import json
import struct
import urllib.request
from pathlib import Path
import numpy as np
from sklearn.neural_network import MLPClassifier

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / 'ml' / '.cache'
OUT = ROOT / 'public' / 'models'
CACHE.mkdir(exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)

def load(name):
    path = CACHE / name
    if not path.exists():
        urllib.request.urlretrieve('https://storage.googleapis.com/cvdf-datasets/mnist/' + name, path)
    with gzip.open(path, 'rb') as source:
        magic, count = struct.unpack('>II', source.read(8))
        if magic == 2051:
            rows, cols = struct.unpack('>II', source.read(8))
            return np.frombuffer(source.read(), dtype=np.uint8).reshape(count, rows * cols)
        return np.frombuffer(source.read(), dtype=np.uint8)

def main():
    x = load('train-images-idx3-ubyte.gz').astype(np.float32) / 255
    y = load('train-labels-idx1-ubyte.gz')
    test = load('t10k-images-idx3-ubyte.gz').astype(np.float32) / 255
    labels = load('t10k-labels-idx1-ubyte.gz')
    model = MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=18, batch_size=256,
                          early_stopping=True, random_state=42, verbose=True)
    model.fit(x, y)
    arrays, layers = [], []
    for weights, bias in zip(model.coefs_, model.intercepts_):
        values = np.concatenate([weights.T.ravel(), bias])
        scale = float(np.max(np.abs(values)) / 127)
        quantized = np.rint(values / scale).clip(-127, 127).astype(np.int8)
        arrays.append(quantized)
        layers.append({'input': weights.shape[0], 'output': weights.shape[1], 'scale': scale})
    blob = np.concatenate(arrays)
    (OUT / 'mlp-weights.bin').write_bytes(blob.tobytes())
    def infer(inputs):
        activation = inputs
        for index, (raw, layer) in enumerate(zip(arrays, layers)):
            split = layer['input'] * layer['output']
            w = raw[:split].astype(np.float32).reshape(layer['output'], layer['input']) * layer['scale']
            b = raw[split:].astype(np.float32) * layer['scale']
            activation = activation @ w.T + b
            if index < len(layers) - 1:
                activation = np.maximum(activation, 0)
        exps = np.exp(activation - activation.max(axis=-1, keepdims=True))
        return exps / exps.sum(axis=-1, keepdims=True)
    probabilities = infer(test)
    accuracy = float(np.mean(probabilities.argmax(axis=1) == labels))
    manifest = {'architecture': [784, 128, 64, 10], 'layers': layers, 'bytes': len(blob),
                'testAccuracy': accuracy, 'seed': 42, 'dataset': 'MNIST',
                'training': 'scikit-learn MLPClassifier; 18 epochs max; early stopping',
                'provenance': 'Trained locally by the portfolio build script; not a claim of owner-authored training.'}
    (OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2))
    fixtures = [{'pixels': (test[i] * 255).astype(int).tolist(), 'label': int(labels[i]),
                 'probabilities': probabilities[i].tolist()} for i in range(100)]
    (ROOT / 'tests' / 'fixtures').mkdir(exist_ok=True)
    (ROOT / 'tests' / 'fixtures' / 'mnist.json').write_text(json.dumps(fixtures))
    samples = [next(f for f in fixtures if f['label'] == digit) for digit in range(10)]
    (OUT / 'samples.json').write_text(json.dumps(samples))
    print(json.dumps(manifest, indent=2), flush=True)
    assert len(blob) == 109386
    assert accuracy >= .95, f'Test accuracy below release floor: {accuracy}'

if __name__ == '__main__':
    main()
