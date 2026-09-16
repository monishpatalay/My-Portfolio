# Neural Doodle

The network is 784 → 128 → 64 → 10, ReLU hidden layers and softmax output.
Run `python -m venv .venv`, install `numpy scikit-learn`, then
`OPENBLAS_NUM_THREADS=4 .venv/bin/python ml/train_mnist.py`.

The script downloads original MNIST from the Google-hosted dataset mirror,
trains deterministically (seed 42), evaluates the quantized network on the
10,000-image held-out test set, and exports per-layer int8 weights and scales.
The manifest records measured accuracy; no benchmark is invented.

Weights include biases (109,386 bytes). Browser inference uses plain TypeScript.
The 50-example fixture compares every probability against Python inference.
Drawings are cropped, scaled to 20 pixels, padded to 28, and centered by mass.
Canvas-doodle accuracy still requires the PRD's three-person manual evaluation.
Training was executed through this script during implementation; it must not be
represented as a historical personal accomplishment by Monish.
