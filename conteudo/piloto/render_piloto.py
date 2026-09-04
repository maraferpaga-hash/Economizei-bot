#!/usr/bin/env python3
"""
render_piloto.py — Fase 0 da Máquina de Conteúdo (prova de conceito MANUAL).

Renderiza a peça-piloto "cafe-cenoura" em 9:16 (1080x1920, 30fps, H.264) usando
só o que o sandbox do Cowork tem: Python + PIL + ffmpeg. Sem Chromium, sem Remotion
(decisão do Gabriel em 2026-09-03: "híbrido — ffmpeg agora, Remotion depois").

NÃO é a esteira. É o script que prova que o fluxo fecha antes de automatizar.
A Fase 1 transforma isto em `scripts/conteudo/render.mjs` parametrizado por JSON.

Uso:
  python3 conteudo/piloto/render_piloto.py <pasta-da-peca> [--audio narracao.m4a] [--fps 30]
  ex.: python3 conteudo/piloto/render_piloto.py estoque_conteudo/0001_2026-09-03/peca-1-cafe-cenoura

Saída: <pasta-da-peca>/video.mp4 (mudo se não houver --audio; com a voz se houver).
"""
import argparse, json, math, os, shutil, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FONTS = os.path.join(RAIZ, "conteudo", "assets", "fonts")
W, H = 1080, 1920

# Paleta oficial (Plano_Redes_Sociais.md §2)
PRIM = (0x1A, 0x6B, 0x3C)    # verde-escuro
ACENTO = (0x72, 0xC4, 0x42)  # verde-limão
TEXTO = (0x0F, 0x1F, 0x14)   # quase-preto
FUNDO = (0xF4, 0xF7, 0xF4)   # cinza-claro
ALERTA = (0xC9, 0x40, 0x40)  # vermelho
BRANCO = (255, 255, 255)

_fc = {}
def font(nome, tam):
    k = (nome, tam)
    if k not in _fc:
        _fc[k] = ImageFont.truetype(os.path.join(FONTS, nome + ".ttf"), tam)
    return _fc[k]

def ease_out(t):  # cúbico
    t = max(0.0, min(1.0, t)); return 1 - (1 - t) ** 3

def pct(v):  # 1 casa decimal, vírgula, sinal explícito
    s = f"{v:+.1f}".replace(".", ",")
    return s.replace("+", "+").replace("-", "−") + "%"

def text_w(d, txt, f):
    b = d.textbbox((0, 0), txt, font=f); return b[2] - b[0]

def center(d, txt, f, y, fill, x=W / 2):
    d.text((x - text_w(d, txt, f) / 2, y), txt, font=f, fill=fill)

def wrap(d, txt, f, maxw):
    out, linha = [], ""
    for p in txt.split():
        t = (linha + " " + p).strip()
        if text_w(d, t, f) <= maxw: linha = t
        else: out.append(linha); linha = p
    if linha: out.append(linha)
    return out

# ---------------------------------------------------------------- conteúdo da peça
# Toda string/número abaixo tem linha correspondente em fontes.md da peça.
FALAS = [  # (inicio, fim, legenda queimada)
    (0.0, 3.0, "Café moído caiu 17%. Cenoura subiu 75%. No mesmo ano."),
    (3.0, 9.0, "O IBGE fala que a comida em casa subiu 2,6% em 12 meses. Só que isso é média. E ninguém compra a média."),
    (9.0, 14.0, "Olha o que caiu: arroz, −12. Açúcar, −17. Azeite, −18."),
    (14.0, 19.0, "E o que subiu: batata, +45. Feijão carioca, +48. Cebola, +55."),
    (19.0, 25.0, "Se o seu carrinho é cebola, feijão e batata, a sua inflação não foi 2,6. Foi bem mais. E só o seu cupom sabe disso."),
    (25.0, 30.0, "Manda a foto do cupom pro Economizei no WhatsApp. É grátis. Ele te mostra o que subiu e o que caiu no seu carrinho."),
]
RODAPE = "fonte: IBGE · IPCA julho/2026 · acumulado 12 meses"
CAIU = [("Arroz", -12.41), ("Açúcar", -17.06), ("Azeite", -17.96)]
SUBIU = [("Batata", 45.34), ("Feijão carioca", 47.98), ("Cebola", 54.92)]
DURACAO = 30.0

# ---------------------------------------------------------------- cenas
def cena_hook(d, t):  # 0–3s
    d.rectangle([0, 0, W, H], fill=FUNDO)
    def card(y, rotulo, valor, cor, t0):
        p = ease_out((t - t0) / 0.45)
        if p <= 0: return
        x = -W + p * W  # desliza da esquerda
        d.rounded_rectangle([x + 90, y, x + W - 90, y + 330], 28, fill=BRANCO, outline=cor, width=6)
        d.text((x + 140, y + 40), rotulo, font=font("sora-700", 56), fill=TEXTO)
        d.text((x + 140, y + 120), pct(valor), font=font("inter-900", 170), fill=cor)
    card(430, "CAFÉ MOÍDO", -17.20, PRIM, 0.0)
    card(830, "CENOURA", 75.14, ALERTA, 1.1)
    if t > 2.1:
        a = ease_out((t - 2.1) / 0.3)
        center(d, "no mesmo ano.", font("inter-700", 72), 1260, tuple(int(c * a + FUNDO[i] * (1 - a)) for i, c in enumerate(TEXTO)))

def cena_media(d, t):  # 3–9s
    d.rectangle([0, 0, W, H], fill=TEXTO)
    center(d, "comida em casa, 12 meses", font("inter-400", 54), 560, (180, 200, 185))
    s = 0.6 + 0.4 * ease_out((t - 3.0) / 0.5)
    tam = int(260 * s)
    center(d, "+2,6%", font("inter-900", tam), 640 + (260 - tam) // 2, BRANCO)
    if t > 5.5:
        a = ease_out((t - 5.5) / 0.35)
        f = font("sora-800", int(90 + 30 * a))
        center(d, "isso é MÉDIA", f, 1000, ACENTO)
    if t > 7.4:
        center(d, "e ninguém compra a média", font("inter-700", 64), 1180, BRANCO)

def cena_barras(d, t):  # 9–19s
    d.rectangle([0, 0, W, H], fill=FUNDO)
    center(d, "CAIU", font("sora-800", 64), 330, PRIM, x=W * 0.27)
    center(d, "SUBIU", font("sora-800", 64), 330, ALERTA, x=W * 0.73)
    d.line([W / 2, 320, W / 2, 1380], fill=(200, 210, 200), width=4)
    def bar(col_x, y, nome, valor, cor, t0):
        p = ease_out((t - t0) / 0.5)
        if p <= 0: return
        d.text((col_x, y), nome, font=font("inter-700", 46), fill=TEXTO)
        maxw = W * 0.40
        w = int(maxw * min(abs(valor), 60) / 60 * p)
        d.rounded_rectangle([col_x, y + 70, col_x + max(w, 12), y + 150], 16, fill=cor)
        d.text((col_x, y + 165), pct(valor), font=font("inter-900", 70), fill=cor)
    for i, (n, v) in enumerate(CAIU):
        bar(60, 450 + i * 300, n, v, PRIM, 9.4 + i * 1.5)
    for i, (n, v) in enumerate(SUBIU):
        bar(W / 2 + 40, 450 + i * 300, n, v, ALERTA, 14.2 + i * 1.5)

def cena_sua(d, t):  # 19–25s
    d.rectangle([0, 0, W, H], fill=TEXTO)
    a = ease_out((t - 19.0) / 0.4)
    center(d, "a SUA inflação", font("sora-800", 110), 620, tuple(int(c * a) for c in BRANCO))
    center(d, "não é a média", font("sora-800", 110), 760, tuple(int(c * a) for c in ACENTO))  # sem "≠": glifo fora do subset latin da Sora
    if t > 22.3:
        # cupom (ícone simples): retângulo com base em zigue-zague
        x0, y0, x1, y1 = 440, 960, 640, 1200
        d.rectangle([x0, y0, x1, y1 - 20], fill=BRANCO)
        pts = [(x0, y1 - 20)]
        for k in range(11):
            pts.append((x0 + k * 20 + 10, y1 if k % 2 == 0 else y1 - 20))
        pts.append((x1, y1 - 20))
        d.polygon(pts, fill=BRANCO)
        for k in range(4):
            d.line([x0 + 25, y0 + 40 + k * 40, x1 - 25 - (k * 20), y0 + 40 + k * 40], fill=(190, 200, 190), width=8)
        center(d, "só o seu cupom sabe disso", font("inter-700", 60), 1260, BRANCO)

def cena_cta(d, t):  # 25–30s
    d.rectangle([0, 0, W, H], fill=PRIM)
    center(d, "Manda a foto do cupom", font("sora-800", 84), 520, BRANCO)
    center(d, "pro Economizei no WhatsApp", font("inter-400", 52), 640, (215, 235, 220))
    p = ease_out((t - 25.6) / 0.4)
    if p > 0:
        d.rounded_rectangle([90, 780, W - 90, 980], 32, fill=BRANCO)
        center(d, "(17) 99644-0062", font("inter-900", 96), 812, TEXTO)
    if t > 26.8:
        center(d, "manda “oi” e testa", font("inter-700", 66), 1050, ACENTO)
        center(d, "É grátis.", font("inter-400", 52), 1150, BRANCO)
    center(d, "Economizei", font("sora-800", 56), 1270, ACENTO)

def frame(t):
    img = Image.new("RGB", (W, H), FUNDO)
    d = ImageDraw.Draw(img)
    if t < 3: cena_hook(d, t)
    elif t < 9: cena_media(d, t)
    elif t < 19: cena_barras(d, t)
    elif t < 25: cena_sua(d, t)
    else: cena_cta(d, t)
    escuro = (3 <= t < 9) or (19 <= t < 25) or t >= 25
    # rodapé de fonte (obrigatório em peça com número)
    center(d, RODAPE, font("inter-400", 30), 1700, (200, 215, 205) if escuro else (95, 110, 100))
    # legenda queimada (a maioria assiste sem som)
    for ini, fim, txt in FALAS:
        if ini <= t < fim:
            f = font("inter-700", 44)
            linhas = wrap(d, txt, f, W - 200)[:3]
            alt = 58 * len(linhas) + 36
            y = 1470 - alt // 2
            d.rounded_rectangle([70, y, W - 70, y + alt], 22, fill=(0, 0, 0))
            for i, l in enumerate(linhas):
                center(d, l, f, y + 18 + i * 58, BRANCO)
            break
    return img

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pasta")
    ap.add_argument("--audio", default=None)
    ap.add_argument("--fps", type=int, default=30)
    a = ap.parse_args()
    pasta = os.path.abspath(a.pasta)
    saida = os.path.join(pasta, "video.mp4")
    tmp = tempfile.mkdtemp(prefix="render_")
    n = int(DURACAO * a.fps)
    for i in range(n):
        frame(i / a.fps).save(os.path.join(tmp, f"f{i:05d}.png"), compress_level=1)
        if i % (a.fps * 5) == 0: print(f"  frame {i}/{n}", flush=True)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(a.fps), "-i", os.path.join(tmp, "f%05d.png")]
    if a.audio:
        cmd += ["-i", a.audio, "-map", "0:v", "-map", "1:a", "-c:a", "aac", "-b:a", "128k", "-shortest"]
    else:
        cmd += ["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-map", "0:v", "-map", "1:a", "-c:a", "aac", "-shortest"]
    cmd += ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "high", "-crf", "20", "-movflags", "+faststart", "-t", str(DURACAO), saida]
    subprocess.run(cmd, check=True)
    shutil.rmtree(tmp, ignore_errors=True)
    print("✅", saida, os.path.getsize(saida) // 1024, "KB")

if __name__ == "__main__":
    main()
