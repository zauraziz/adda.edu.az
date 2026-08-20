'use client';

// F4.9b — admin bəzəkləri (boş bloklar, «redaktə» keçidləri, status zolağı)
// artıq build-time bayrağına (`NEXT_PUBLIC_ADMIN_EDIT_LINKS`) bağlı deyil —
// hamı görürdü ya da heç kim. Səhifə `revalidate=300` ilə STATİK qalmalıdır,
// ona görə kimlik yoxlaması serverdə DEYİL, bu klient adasında baş verir:
// hidrasiyadan sonra `/api/identity/is-admin` bir dəfə çağırılır (bax
// AdminProvider), nəticə Context vasitəsilə `<AdminOnly>` overuşqlarına
// ötürülür. Sessiya yoxdursa/admin deyilsə: heç nə göstərilmir — server HTML-i
// bütün ziyarətçilər üçün eynidir, admin məzmunu ancaq klientdə əlavə olunur.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const AdminContext = createContext(false);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch('/api/identity/is-admin', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d: { isAdmin?: boolean }) => {
        if (alive) setIsAdmin(Boolean(d.isAdmin));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return <AdminContext.Provider value={isAdmin}>{children}</AdminContext.Provider>;
}

export function useIsAdmin(): boolean {
  return useContext(AdminContext);
}

/** Uşaqları YALNIZ təsdiqlənmiş admin sessiyasında render edir. */
export function AdminOnly({ children }: { children: ReactNode }) {
  const isAdmin = useIsAdmin();
  if (!isAdmin) return null;
  return <>{children}</>;
}
