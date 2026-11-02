#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Sintesis musik & SFX KeKe Run -> assets/audio/*.wav (22050 Hz, mono, 16-bit).

Semua suara dibuat dari osilator + noise sederhana, tanpa sampel pihak ketiga.
Musik ditulis dengan teknik wrap-around (tail ditambahkan ke awal buffer) supaya
loop-nya mulus tanpa klik.
"""
import math, os, struct, wave
import numpy as np

SR = 22050
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "audio")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(20261101)

A4 = 440.0
def hz(note):
    """note: 'C4', 'F#3', 'Bb5' -> frekuensi."""
    names = {"C":0,"D":2,"E":4,"F":5,"G":7,"A":9,"B":11}
    n = note[0].upper(); i = 1; acc = 0
    while i < len(note) and note[i] in "#b":
        acc += 1 if note[i] == "#" else -1; i += 1
    octv = int(note[i:])
    semi = names[n] + acc + (octv + 1) * 12
    return A4 * 2 ** ((semi - 69) / 12.0)

def env(n, a=0.004, d=0.12, s=0.0, r=0.06, sus=1.0):
    """ADSR sederhana; a/d/r dalam detik."""
    t = np.arange(n) / SR
    dur = n / SR
    e = np.ones(n)
    ai = max(1, int(a * SR)); di = max(1, int(d * SR)); ri = max(1, int(r * SR))
    e[:ai] = np.linspace(0, 1, ai)
    end_d = min(n, ai + di)
    e[ai:end_d] = np.linspace(1, sus, end_d - ai)
    if end_d < n:
        e[end_d:] = sus
    if n > ri:
        e[-ri:] *= np.linspace(1, 0, ri)
    return e

def fade(x, ms=6):
    k = max(2, int(SR * ms / 1000))
    if len(x) < 2 * k:
        return x
    x = x.copy()
    x[:k] *= np.linspace(0, 1, k)
    x[-k:] *= np.linspace(1, 0, k)
    return x

def marimba(f, dur=0.42, amp=0.55, bright=0.22):
    n = int(dur * SR)
    t = np.arange(n) / SR
    w = (np.sin(2*np.pi*f*t) * 1.0 +
         np.sin(2*np.pi*f*4.02*t) * bright * np.exp(-t*26) +
         np.sin(2*np.pi*f*2*t) * 0.16 * np.exp(-t*14))
    w *= np.exp(-t * (5.0 + 6.0 / (dur + 0.15)))
    return w * env(n, 0.002, 0.05, r=0.05) * amp

def pluck(f, dur=0.30, amp=0.32):
    """Karplus-Strong ringan."""
    n = int(dur * SR)
    N = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, N)
    out = np.zeros(n)
    idx = 0
    for i in range(n):
        nxt = (buf[idx] + buf[(idx + 1) % N]) * 0.4985
        out[i] = buf[idx]
        buf[idx] = nxt
        idx = (idx + 1) % N
    out *= np.exp(-np.arange(n) / SR * 6.5)
    return out * env(n, 0.001, 0.03, r=0.03) * amp

def bass(f, dur=0.5, amp=0.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    w = np.sin(2*np.pi*f*t) + 0.22*np.sin(2*np.pi*f*2*t) + 0.07*np.sin(2*np.pi*f*3*t)
    w *= np.exp(-t * 3.2)
    return w * env(n, 0.004, 0.08, r=0.06) * amp

def pad(f, dur, amp=0.10):
    n = int(dur * SR)
    t = np.arange(n) / SR
    w = np.zeros(n)
    for k, det in ((1.0, 0.0), (1.0, 0.6), (2.0, -0.4), (3.0, 0.8)):
        w += np.sin(2*np.pi*(f*k + det)*t) / (k * 1.6)
    w *= env(n, 0.18, 0.4, sus=0.7, r=0.35)
    return w * amp

def shaker(dur=0.075, amp=0.16, bright=1.0):
    n = int(dur * SR)
    noise = rng.normal(0, 1, n)
    noise = np.diff(np.concatenate([[0], noise]))  # highpass kasar
    e = np.exp(-np.arange(n) / SR * 55)
    return noise * e * amp * bright

def kick(dur=0.18, amp=0.45):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 120 * np.exp(-t * 26) + 46
    w = np.sin(2*np.pi*np.cumsum(f)/SR)
    return w * np.exp(-t * 12) * amp

def add(buf, sig, start):
    """Tambahkan sinyal ke buffer dengan wrap-around (loop mulus)."""
    n = len(buf); i = int(start * SR)
    idx = (np.arange(len(sig)) + i) % n
    np.add.at(buf, idx, sig)

def normalize(x, peak=0.86):
    m = np.max(np.abs(x)) or 1.0
    return x * (peak / m)

def write(name, x):
    x = fade(normalize(np.asarray(x, dtype=np.float64)))
    pcm = np.clip(x, -1, 1)
    pcm = (pcm * 32767).astype("<i2")
    path = os.path.join(OUT, name)
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    rms = float(np.sqrt(np.mean(pcm.astype(np.float64) ** 2)) / 32767)
    print(f"{name:22s} {len(pcm)/SR:6.2f}s  peak {np.max(np.abs(pcm))/32767:.2f}  rms {rms:.3f}  {os.path.getsize(path)//1024} KB")

# ---------------------------------------------------------------- MUSIK UTAMA
def make_music():
    bpm = 112.0
    beat = 60.0 / bpm
    bar = beat * 4
    bars = 8
    total = bar * bars
    n = int(total * SR)
    buf = np.zeros(n)

    # C  G  Am  F   (2 bar masing-masing pada 8 bar? -> 1 bar per akor, diulang 2x)
    prog = [
        (["C3", "E4", "G4", "C5"], ["C4", "E4", "G4"]),
        (["G2", "D4", "G4", "B4"], ["B3", "D4", "G4"]),
        (["A2", "C4", "E4", "A4"], ["A3", "C4", "E4"]),
        (["F2", "C4", "F4", "A4"], ["A3", "C4", "F4"]),
    ]
    for b in range(bars):
        root, chord = prog[b % 4]
        t0 = b * bar
        # bass: ketukan 1 dan 3.5
        add(buf, bass(hz(root[0].replace("3", "2") if root[0].endswith("3") else root[0])), t0)
        add(buf, bass(hz(root[0]), 0.42, 0.34), t0 + beat * 2.5)
        # pad akor
        for note in chord:
            add(buf, pad(hz(note), bar * 0.95, 0.055), t0)
        # arpeggio marimba 8 not
        seq = [root[1], root[2], root[3], root[2], root[1], root[3], root[2], root[3]]
        for k, note in enumerate(seq):
            add(buf, marimba(hz(note), 0.36, 0.34 if k % 2 == 0 else 0.24), t0 + k * beat * 0.5)
        # melodi tinggi di paruh kedua
        if b >= 4:
            mel = [chord[2], chord[1], chord[2], chord[0]]
            for k, note in enumerate(mel):
                add(buf, pluck(hz(note) * 2, 0.28, 0.13), t0 + beat * (0.5 + k * 0.8))
        # ritme
        add(buf, kick(0.2, 0.5), t0)
        add(buf, kick(0.18, 0.38), t0 + beat * 2)
        for k in range(8):
            add(buf, shaker(0.07, 0.10 if k % 2 else 0.16), t0 + k * beat * 0.5)
            if k in (2, 6):
                add(buf, shaker(0.12, 0.09, 0.7), t0 + k * beat * 0.5)
    write("music-main.wav", buf)

# ---------------------------------------------------------------- MUSIK TRAILER
def make_trailer_music():
    bpm = 84.0; beat = 60.0 / bpm; bar = beat * 4; bars = 8
    n = int(bar * bars * SR); buf = np.zeros(n)
    prog = [["F3", "A3", "C4", "E4"], ["C3", "E3", "G3", "B3"],
            ["D3", "F3", "A3", "C4"], ["Bb2", "D3", "F3", "A3"]]
    for b in range(bars):
        ch = prog[b % 4]; t0 = b * bar
        for note in ch:
            add(buf, pad(hz(note), bar * 1.02, 0.075), t0)
        add(buf, bass(hz(ch[0]) / 2, 1.1, 0.30), t0)
        for k, note in enumerate([ch[2] * 0 + ch[2], ch[3], ch[2]]):
            add(buf, marimba(hz(note) * 1, 0.9, 0.16, 0.1), t0 + beat * (0.5 + k * 1.0))
        add(buf, marimba(hz(ch[1]) * 2, 0.7, 0.10, 0.08), t0 + beat * 2.5)
    write("music-trailer.wav", buf)

# ---------------------------------------------------------------- SFX
def sweep(f0, f1, dur, amp=0.5, kind="sine"):
    n = int(dur * SR); t = np.arange(n) / SR
    f = np.linspace(f0, f1, n)
    ph = 2*np.pi*np.cumsum(f)/SR
    if kind == "sine":   w = np.sin(ph)
    elif kind == "tri":  w = 2/np.pi*np.arcsin(np.sin(ph))
    else:                w = np.sign(np.sin(ph)) * 0.6
    w *= np.exp(-t * (2.5 / max(dur, .05)))
    return w * env(n, 0.003, 0.02, r=0.02) * amp

def noise_sweep(dur=0.3, amp=0.3, up=True):
    n = int(dur * SR); t = np.arange(n)/SR
    x = rng.normal(0, 1, n)
    # lowpass satu kutub dengan cutoff bergerak
    y = np.zeros(n); acc = 0.0
    cutoff = np.linspace(0.06, 0.55, n) if up else np.linspace(0.55, 0.06, n)
    for i in range(n):
        acc += cutoff[i] * (x[i] - acc)
        y[i] = acc
    return y * np.exp(-t * 7) * amp

def sfx():
    # klik UI
    n = int(0.09*SR); t = np.arange(n)/SR
    click = (np.sin(2*np.pi*1180*t) + 0.4*np.sin(2*np.pi*1760*t)) * np.exp(-t*55)
    write("sfx-click.wav", click * 0.5)

    # benar: arpeggio ceria C5-E5-G5-C6
    n = int(0.62*SR); buf = np.zeros(n)
    for k, note in enumerate(["C5", "E5", "G5", "C6"]):
        add(buf, marimba(hz(note), 0.5, 0.42, 0.28), k*0.055)
    write("sfx-correct.wav", buf)

    # salah: turun + thud
    n = int(0.75*SR); buf = np.zeros(n)
    add(buf, sweep(420, 120, 0.42, 0.5, "tri"), 0)
    add(buf, kick(0.22, 0.6), 0.02)
    add(buf, noise_sweep(0.3, 0.18, False), 0.0)
    write("sfx-wrong.wav", buf)

    # lompat
    n = int(0.36*SR); buf = np.zeros(n)
    add(buf, sweep(430, 900, 0.22, 0.30), 0)
    add(buf, noise_sweep(0.22, 0.14, True), 0)
    write("sfx-jump.wav", buf)

    # mendarat
    n = int(0.28*SR); buf = np.zeros(n)
    add(buf, sweep(200, 80, 0.16, 0.40), 0)
    add(buf, noise_sweep(0.12, 0.12, False), 0)
    write("sfx-land.wav", buf)

    # koin
    n = int(0.26*SR); buf = np.zeros(n)
    add(buf, marimba(hz("B5"), 0.16, 0.35, 0.4), 0)
    add(buf, marimba(hz("E6"), 0.2, 0.32, 0.4), 0.07)
    write("sfx-coin.wav", buf)

    # naik level / finis
    n = int(1.5*SR); buf = np.zeros(n)
    for k, note in enumerate(["C5", "E5", "G5", "C6", "E6"]):
        add(buf, marimba(hz(note), 0.7, 0.4, 0.3), k*0.09)
    for k, note in enumerate(["C4", "G4", "E5"]):
        add(buf, pad(hz(note), 0.9, 0.09), 0.36)
    write("sfx-levelup.wav", buf)

    # nyawa habis
    n = int(1.4*SR); buf = np.zeros(n)
    for k, note in enumerate(["A4", "F4", "D4", "A3"]):
        add(buf, marimba(hz(note), 0.75, 0.36, 0.16), k*0.16)
    add(buf, pad(hz("D3"), 1.1, 0.12), 0.2)
    write("sfx-lose.wav", buf)

    # hitung mundur
    write("sfx-count.wav", sweep(760, 760, 0.16, 0.35))
    n = int(0.5*SR); buf = np.zeros(n)
    add(buf, sweep(1180, 1180, 0.3, 0.35), 0)
    add(buf, marimba(hz("C6"), 0.4, 0.3, 0.3), 0.05)
    write("sfx-go.wav", buf)

    # geser lajur
    write("sfx-whoosh.wav", noise_sweep(0.2, 0.20, True))
    # tersandung / jatuh
    n = int(0.6*SR); buf = np.zeros(n)
    add(buf, noise_sweep(0.4, 0.30, False), 0)
    add(buf, kick(0.25, 0.5), 0.05)
    add(buf, sweep(300, 90, 0.3, 0.3, "tri"), 0.05)
    write("sfx-fall.wav", buf)

if __name__ == "__main__":
    make_music()
    make_trailer_music()
    sfx()
    print("\nselesai ->", OUT)
