#!/bin/bash
set -euo pipefail

# Generate Jekyll tag pages under tags/ for every tag used in _posts.
# Usage: ./scripts/generate-tags.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SCRIPT_DIR/.." && pwd)"
POSTS_DIR="$REPO/_posts"
TAGS_DIR="$REPO/tags"

mkdir -p "$TAGS_DIR"

python3 - <<'PY' "$POSTS_DIR" "$TAGS_DIR"
import re
import sys
from pathlib import Path

posts_dir = Path(sys.argv[1])
tags_dir = Path(sys.argv[2])

def parse_tags(text: str):
    if not text.startswith('---'):
        return []
    parts = text.split('---', 2)
    if len(parts) < 3:
        return []
    fm = parts[1]
    tags = []
    lines = fm.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        if re.match(r'^tags:\s*\[', line):
            inside = line.split('[', 1)[1].rsplit(']', 1)[0]
            tags.extend(t.strip().strip('"\'') for t in inside.split(',') if t.strip())
        elif line.strip() == 'tags:':
            i += 1
            while i < len(lines) and re.match(r'^\s+-\s+', lines[i]):
                tags.append(re.sub(r'^\s+-\s+', '', lines[i]).strip().strip('"\''))
                i += 1
            continue
        i += 1
    return [t for t in tags if t]

all_tags = set()
for post in posts_dir.glob('*.md'):
    all_tags.update(parse_tags(post.read_text(encoding='utf-8')))

for tag in sorted(all_tags):
    slug = tag.strip()
    path = tags_dir / f'{slug}.md'
    if path.exists():
        continue
    title = slug.replace('-', ' ').title()
    path.write_text(f'''---
layout: tag
tag: {slug}
title: "{title}"
description: "Posts tagged {slug}."
permalink: /tags/{slug}/
---
''', encoding='utf-8')
    print(f'created {path.relative_to(tags_dir.parent)}')

missing = [t for t in sorted(all_tags) if not (tags_dir / f'{t}.md').exists()]
if missing:
    raise SystemExit(f'missing tag pages: {missing}')
print(f'ok: {len(all_tags)} tags have pages')
PY
