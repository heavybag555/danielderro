#!/bin/sh
# Encode the hero background loop for web delivery.
#
#   sh scripts/encode-hero-media.sh [source-video] [source-poster]
#
# Defaults to the files currently shipping. When a higher-resolution master
# arrives, point the first argument at it and rerun — nothing else changes.
#
# Quality rules for this site (visual artist portfolio):
#   - H.264 at CRF 18 is the visually-lossless band. Do not raise it.
#   - Source frame rate is preserved. The hero decodes to 172 frames over
#     9.56s; the container's `nb_frames=225` is an edit-list artifact, not
#     dropped motion. Verify with `ffmpeg -i FILE -f null -`, not ffprobe.
#   - Audio is stripped: the hero is `muted` at all times and can never play it.
#   - `+faststart` moves the moov atom up so playback starts before full download.
#
# Deliberately H.264-only. An SVT-AV1 WebM was measured at 391KB (84% smaller)
# but scored PSNR 27.7dB / SSIM 0.96 against the source and flattened the
# shadow grain and the sky gradient that the shot is built on — a decoded frame
# re-encoded to PNG dropped from 397KB to 225KB of detail. The H.264 below
# measures PSNR 52.6dB / SSIM 0.996 and holds that detail. On a portfolio the
# gradient matters more than the bytes.

set -e

# Masters live outside public/ so they are versioned but never deployed.
SRC_VIDEO="${1:-assets/masters/dd-intro-master.mp4}"
SRC_POSTER="${2:-assets/masters/daniel-hero-master.jpg}"

OUT_MP4="public/videos/dd-intro-hero.mp4"
OUT_POSTER="public/images/daniel-hero-poster.webp"

if [ ! -f "$SRC_VIDEO" ]; then
  echo "Source video not found: $SRC_VIDEO" >&2
  exit 1
fi

echo "Source: $SRC_VIDEO"
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate \
  -of default=noprint_wrappers=1 "$SRC_VIDEO"

echo "Encoding H.264 (CRF 18, veryslow)…"
ffmpeg -hide_banner -loglevel error -y -i "$SRC_VIDEO" \
  -an \
  -c:v libx264 -crf 18 -preset veryslow \
  -pix_fmt yuv420p \
  -profile:v high \
  -movflags +faststart \
  "$OUT_MP4"

if [ -f "$SRC_POSTER" ]; then
  echo "Encoding poster WebP (q90)…"
  node -e "
    const sharp = require('sharp');
    sharp('$SRC_POSTER')
      .webp({ quality: 90, effort: 6 })
      .toFile('$OUT_POSTER')
      .then(({ width, height, size }) =>
        console.log('  ' + width + 'x' + height + '  ' + size + ' bytes'))
      .catch((err) => { console.error(err); process.exit(1); });
  "
fi

echo "Verifying against source…"
ffmpeg -hide_banner -i "$OUT_MP4" -i "$SRC_VIDEO" \
  -lavfi "[0:v][1:v]psnr" -f null - 2>&1 | grep PSNR || true
ffmpeg -hide_banner -i "$OUT_MP4" -i "$SRC_VIDEO" \
  -lavfi "[0:v][1:v]ssim" -f null - 2>&1 | grep SSIM || true

echo "Results:"
ls -la "$SRC_VIDEO" "$OUT_MP4" "$SRC_POSTER" "$OUT_POSTER" 2>/dev/null |
  awk '{printf "  %10s  %s\n", $5, $9}'
