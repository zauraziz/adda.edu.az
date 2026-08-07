#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# tools/rectors/emit.py — data.py -> generasiya olunan TS.
#
# Rektorlarin ilk uc dilli metni burada versiyalanir; bu skript ondan
# Strapi seed blokunu duzeldir. Seed YALNIZ ilk doldurmadir - sonraki
# heqiqet Strapi-dedir.
#
# Isletme (repo kokunden):  python tools/rectors/emit.py
#   -> tools/rectors/seed-const.ts       (index.ts-e yapisdirilacaq blok)
#
# QEYD: bu skript artiq adda-nextjs/lib/rectors-fallback.ts YAZMIR.
# Ehtiyat suret canli Strapi-den gelir: `node tools/rectors/sync.mjs`.
# Sebeb: admin paneldə elave olunan rektor bu fayla dusmurdu - seed
# yalniz ILK doldurma menbeyidir, canli hequiqet deyil.
import io, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from data import RECTORS, LOCALES, validate

validate()
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))


def ts(s):
    """TS tek-dirnaqli sabit — JSON escape sonra dirnaq duzelisi."""
    return "'" + json.dumps(s, ensure_ascii=False)[1:-1].replace("\\\"", '"').replace("'", "\\'") + "'"


def bio_md(paras):
    return '\n\n'.join(paras)


# ── Strapi seed bloku ─────────────────────────────────────────────────
S = []
S.append("")
S.append("// ── K27b · Sabiq rektorlar ──")
S.append("// Redaktə admin panelindən gedir; bu blok yalnız İLK doldurmadır.")
S.append("// `slug` uyğunluq açarıdır: mövcud qeyd varsa toxunulmur.")
S.append("// RECTOR_RESEED=true bir dəfəlik üzərinə yazmağa icazə verir (MENU_RESEED")
S.append("// ilə eyni rəqs: qoy → deploy → logu yoxla → SİL). Əks halda editorun")
S.append("// admin-dəki düzəlişləri hər deploy-da geri qayıdardı.")
S.append("interface RectorSeedText { name: string; degree: string; summary: string; bio: string }")
S.append("interface RectorSeed {")
S.append("  slug: string;")
S.append("  termFrom: number;")
S.append("  termTo: number | null;")
S.append("  died: string | null;")
S.append("  sortOrder: number;")
S.append("  az: RectorSeedText;")
S.append("  ru: RectorSeedText;")
S.append("  en: RectorSeedText;")
S.append("}")
S.append("")
S.append("const RECTOR_SEED: RectorSeed[] = [")
for r in RECTORS:
    S.append("  {")
    S.append("    slug: %s," % ts(r['slug']))
    S.append("    termFrom: %d," % r['termFrom'])
    S.append("    termTo: %s," % (str(r['termTo']) if r['termTo'] else 'null'))
    S.append("    died: %s," % (ts(r['died']) if r['died'] else 'null'))
    S.append("    sortOrder: %d," % r['sortOrder'])
    for loc in LOCALES:
        S.append("    %s: {" % loc)
        S.append("      name: %s," % ts(r['name'][loc]))
        S.append("      degree: %s," % ts(r['degree'][loc]))
        S.append("      summary: %s," % ts(r['summary'][loc]))
        S.append("      bio: %s," % ts(bio_md(r['bio'][loc])))
        S.append("    },")
    S.append("  },")
S.append("];")
S.append("")
dest2 = os.path.join(HERE, 'seed-const.ts')
io.open(dest2, 'w', encoding='utf-8', newline='\n').write('\n'.join(S))
print('seed-const.ts:', os.path.getsize(dest2), 'bayt ->', dest2)
