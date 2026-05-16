#!/bin/bash
# Install LaTeX packages required by acmart (TeX Live Basic).
# Run once: bash tools/install_acmart_deps.sh

set -e
sudo tlmgr install \
  xstring totpages hyperxmp manyfoot newtx zi4 \
  draftwatermark pbalance algorithms environ trimspaces \
  refcount ncctools comment zref savepos balance preprint \
  2>&1 | tail -25

echo "Done. Verify: kpsewhich acmart.cls xstring.sty newtxmath.sty"
