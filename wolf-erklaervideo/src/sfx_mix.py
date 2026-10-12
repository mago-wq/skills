"""Synthetisiert dezente, nicht-musikalische Soundeffekte (keine Instrumente, keine Glocken)
und mischt sie unter das Voiceover.

Aufruf: python3 sfx_mix.py <sfx.json> <voiceover.wav> <out.wav>
"""
import json
import sys
import wave

import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / max(r, 1e-4))
    return e


def lowpass(x, cutoff):
    # einfacher 1-Pol-Tiefpass (zeitvariabel möglich)
    y = np.zeros_like(x)
    cut = np.broadcast_to(np.asarray(cutoff, dtype=np.float64), x.shape)
    acc = 0.0
    for i in range(len(x)):
        a = 1 - np.exp(-2 * np.pi * cut[i] / SR)
        acc += a * (x[i] - acc)
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def noise(n):
    return rng.standard_normal(n)


def make(kind):
    if kind == "whoosh":
        n = int(0.45 * SR)
        t = np.arange(n) / n
        cut = 300 + 3500 * np.sin(np.pi * t) ** 2
        x = lowpass(noise(n), cut) * np.sin(np.pi * t) ** 1.5
        return highpass(x, 150) * 1.6
    if kind == "pop":
        n = int(0.09 * SR)
        t = np.arange(n) / SR
        f = 700 * np.exp(-t * 30) + 220
        ph = 2 * np.pi * np.cumsum(f) / SR
        return np.sin(ph) * env(n, 0.002, 0.03) * 0.9
    if kind == "tick":
        n = int(0.035 * SR)
        return highpass(noise(n), 2500) * env(n, 0.001, 0.008) * 0.8
    if kind == "stamp":
        n = int(0.25 * SR)
        t = np.arange(n) / SR
        thump = np.sin(2 * np.pi * (70 + 60 * np.exp(-t * 25)) * t) * env(n, 0.002, 0.09)
        return thump * 1.1 + lowpass(noise(n), 2000) * env(n, 0.001, 0.03) * 0.6
    if kind == "squash":
        n = int(0.3 * SR)
        t = np.arange(n) / SR
        f = 500 * np.exp(-t * 9) + 80
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.005, 0.12) * 0.7 + lowpass(noise(n), 900) * env(n, 0.002, 0.08) * 0.4
    if kind == "buzz":
        n = int(0.9 * SR)
        t = np.arange(n) / SR
        gate = ((t % 0.42) < 0.28).astype(float)
        motor = np.sign(np.sin(2 * np.pi * 160 * t)) * 0.5 + np.sin(2 * np.pi * 160 * t) * 0.5
        return lowpass(motor * gate, 900) * 0.55
    if kind == "alarm":
        n = int(0.8 * SR)
        t = np.arange(n) / SR
        gate = ((t % 0.2) < 0.12).astype(float)
        saw = 2 * ((t * 190) % 1) - 1
        return lowpass(saw * gate, 1500) * 0.35
    if kind == "zap":
        n = int(0.6 * SR)
        t = np.arange(n) / n
        crackle = highpass(noise(n), 3000) * (rng.random(n) < 0.08)
        sweep = np.sin(2 * np.pi * np.cumsum(300 + 1800 * t) / SR) * 0.25
        return (crackle * 1.2 + sweep) * np.sin(np.pi * t) ** 0.7
    if kind == "boom":
        n = int(0.7 * SR)
        t = np.arange(n) / SR
        return np.sin(2 * np.pi * np.cumsum(45 + 70 * np.exp(-t * 12)) / SR) * env(n, 0.003, 0.25) * 1.2 + lowpass(noise(n), 600) * env(n, 0.002, 0.1) * 0.5
    if kind == "charge":
        n = int(1.2 * SR)
        t = np.arange(n) / n
        cut = 200 + 4000 * t ** 2
        return lowpass(noise(n), cut) * t ** 1.5 * (1 - np.clip((t - 0.92) / 0.08, 0, 1)) * 1.4
    if kind == "fire":
        n = int(1.0 * SR)
        t = np.arange(n) / n
        roar = lowpass(noise(n), 700) * np.minimum(1, t * 6) * np.exp(-t * 2.5) * 1.6
        crackle = highpass(noise(n), 2500) * (rng.random(n) < 0.02) * 1.5 * np.exp(-t * 2)
        return roar + crackle
    if kind == "sparkle":
        n = int(0.6 * SR)
        x = np.zeros(n)
        for _ in range(9):
            i = int(rng.random() * (n - 2000))
            m = 1500
            x[i:i + m] += highpass(noise(m), 5000) * env(m, 0.0005, 0.006) * 0.6
        return x
    raise ValueError(kind)


GAIN = {"whoosh": 0.10, "pop": 0.14, "tick": 0.10, "stamp": 0.22, "squash": 0.16, "buzz": 0.20, "alarm": 0.12,
        "zap": 0.12, "boom": 0.22, "charge": 0.12, "fire": 0.14, "sparkle": 0.10}


def read_wav(path):
    with wave.open(path) as f:
        assert f.getframerate() == SR, f.getframerate()
        x = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        if f.getnchannels() == 2:
            x = x.reshape(-1, 2).mean(axis=1)
    return x


def main():
    spec = json.load(open(sys.argv[1]))
    voice = read_wav(sys.argv[2])
    total = int((spec["duration"] + 0.5) * SR)
    mix = np.zeros(max(total, len(voice)), dtype=np.float64)
    mix[: len(voice)] += voice
    cache = {}
    for ev in spec["sfx"]:
        k = ev["kind"]
        if k not in cache:
            s = make(k)
            cache[k] = s / max(1e-6, np.abs(s).max())
        s = cache[k] * GAIN[k] * ev.get("vol", 1.0)
        i = int(ev["t"] * SR)
        j = min(len(mix), i + len(s))
        if i < len(mix):
            mix[i:j] += s[: j - i]
    peak = np.abs(mix).max()
    if peak > 0.98:
        mix *= 0.98 / peak
    with wave.open(sys.argv[3], "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes((mix * 32767).astype(np.int16).tobytes())
    print("sfx events:", len(spec["sfx"]), "duration %.1fs" % (len(mix) / SR))


if __name__ == "__main__":
    main()
