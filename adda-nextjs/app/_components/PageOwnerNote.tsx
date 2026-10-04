'use client';
/**
 * F5.39 — səhifənin altında «Bu səhifənin məzmununa məsul: Ad Soyad, vəzifə».
 *
 * Footer-dən əvvəl, HƏR səhifədə render olunur, amma yalnız həmin səhifəyə
 * məsul təyin olunubsa görünür (boş blok render olunmur). Məlumat bir dəfə,
 * keşli /api/page-owners-dən gəlir — səhifələrin statik/ISR rejimi pozulmur.
 * E-poçt göstərilmir; əməkdaş profili varsa ada keçid verilir.
 */
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ownerKey, type PageOwnerInfo } from '@/lib/page-owner-key';

let cache: Promise<Record<string, PageOwnerInfo>> | null = null;
function loadOwners(): Promise<Record<string, PageOwnerInfo>> {
  if (!cache) {
    cache = fetch('/api/page-owners')
      .then((r) => (r.ok ? r.json() : { owners: {} }))
      .then((d: { owners?: Record<string, PageOwnerInfo> }) => d.owners ?? {})
      .catch(() => ({}));
  }
  return cache;
}

export default function PageOwnerNote({ locale, label }: { locale: 'az' | 'ru' | 'en'; label: string }) {
  const pathname = usePathname() || '/';
  const [owner, setOwner] = useState<PageOwnerInfo | null>(null);

  useEffect(() => {
    let alive = true;
    const key = ownerKey(pathname);
    if (!key) return;
    void loadOwners().then((all) => {
      if (alive) setOwner(all[key] ?? null);
    });
    return () => {
      alive = false;
    };
  }, [pathname]);

  if (!owner) return null;
  const position = (locale === 'ru' ? owner.positionRu : locale === 'en' ? owner.positionEn : null) || owner.position;
  return (
    <div className="pon">
      <div className="container pon-inner">
        <i className="ti ti-user-edit" aria-hidden="true" />
        <span className="pon-k">{label}:</span>
        <span className="pon-who">
          {owner.personSlug ? (
            <a className="pon-name" href={`/${locale}/emekdas/${owner.personSlug}`}>{owner.name}</a>
          ) : (
            <span className="pon-name">{owner.name}</span>
          )}
          {position ? <span className="pon-pos">, {position}</span> : null}
        </span>
      </div>
    </div>
  );
}
