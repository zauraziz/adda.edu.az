#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# tools/rectors/emit.py — data.py -> generasiya olunan TS.
#
# Uc dilli metn IKI yerde lazimdir: Strapi seed (ilk doldurma) ve Next
# fallback (Strapi cavab vermeyende). Elle saxlasaq bir gun ayrilacaqlar,
# ona gore hər ikisi bu skriptden cixir.
#
# Isletme (repo kokunden):  python tools/rectors/emit.py
#   -> adda-nextjs/lib/rectors.ts        (birbasa yazilir)
#   -> tools/rectors/seed-const.ts       (index.ts-e yapisdirilacaq blok)
import io, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from data import RECTORS, LOCALES, validate

validate()
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
NEXT_LIB = os.path.join(REPO, 'adda-nextjs', 'lib')


def ts(s):
    """TS tek-dirnaqli sabit — JSON escape sonra dirnaq duzelisi."""
    return "'" + json.dumps(s, ensure_ascii=False)[1:-1].replace("\\\"", '"').replace("'", "\\'") + "'"


def bio_md(paras):
    return '\n\n'.join(paras)


# ── 1. Next fallback modulu ───────────────────────────────────────────
L = []
L.append("// K27b — sabiq rektorlar: EHTIYAT (fallback) məlumat.")
L.append("//")
L.append("// ƏSAS MƏNBƏ ARTIQ STRAPI-DİR (`api::rector.rector`) — redaktə admin")
L.append("// panelindən gedir. Bu modul yalnız Strapi cavab vermədikdə işə düşür.")
L.append("//")
L.append("// NİYƏ SAXLANILIR: Render pulsuz tarifdə yuxuya gedir, soyuq start 30-60 s")
L.append("// çəkir. Fallback olmasaydı səhifə həmin anda BOŞ görünərdi — statik")
L.append("// fayldan işləyən indiki vəziyyətə nisbətən geriləmə olardı.")
L.append("//")
L.append("// Bu fayl `tools/rectors/data.py`-dan generasiya olunur; Strapi seed bloku")
L.append("// da eyni mənbədəndir. Ona görə ƏLLƏ REDAKTƏ ETMƏ — məzmun dəyişikliyi")
L.append("// Strapi admin panelində edilir, bu surət isə növbəti paketdə yenilənir.")
L.append("import type { Rector } from './strapi';")
L.append("import type { Locale } from './i18n';")
L.append("")
L.append("/** Səhifə lid cümləsi — `tr()` lüğətindən keçir. */")
L.append("export const RECTORS_LEAD =")
L.append("  " + ts(RECTORS[0] and __import__('data').LEAD['az']) + ";")
L.append("")
L.append("/**")
L.append(" * Ad → monoqram. Portret arxivi hazır olana qədər lövhədə bu göstərilir.")
L.append(" * `toUpperCase()` İŞLƏDİLMİR: Azərbaycan dilində `I`/`ı` və `İ`/`i`")
L.append(" * cütləri JS-in defolt qaydası ilə korlanır. Adlar onsuz da baş hərflə")
L.append(" * başlayır, ona görə sadəcə ilk hərflər götürülür.")
L.append(" */")
L.append("export function monogram(name: string): string {")
L.append("  const parts = name.trim().split(/\\s+/).filter(Boolean);")
L.append("  return parts.slice(0, 2).map((p) => Array.from(p)[0] ?? '').join('');")
L.append("}")
L.append("")
L.append("export const RECTORS_FALLBACK: Record<Locale, Rector[]> = {")
for loc in LOCALES:
    L.append("  %s: [" % loc)
    for r in RECTORS:
        L.append("    {")
        L.append("      slug: %s," % ts(r['slug']))
        L.append("      name: %s," % ts(r['name'][loc]))
        L.append("      termFrom: %d," % r['termFrom'])
        L.append("      termTo: %s," % (str(r['termTo']) if r['termTo'] else 'null'))
        L.append("      degree: %s," % ts(r['degree'][loc]))
        L.append("      summary: %s," % ts(r['summary'][loc]))
        L.append("      bio: %s," % ts(bio_md(r['bio'][loc])))
        L.append("      died: %s," % (ts(r['died']) if r['died'] else 'null'))
        L.append("      sortOrder: %d," % r['sortOrder'])
        L.append("      locale: '%s'," % loc)
        L.append("    },")
    L.append("  ],")
L.append("};")
L.append("")
dest = os.path.join(NEXT_LIB, 'rectors.ts')
io.open(dest, 'w', encoding='utf-8', newline='\n').write('\n'.join(L))
print('rectors.ts:', os.path.getsize(dest), 'bayt ->', dest)


# ── 2. Strapi seed bloku ──────────────────────────────────────────────
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
