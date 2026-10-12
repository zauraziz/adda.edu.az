// F5.49 — əlçatanlıq ayarları (şrift ölçüsü, yüksək kontrast): ortaq sabitlər.
// Vəziyyət <html data-fs="1.2" data-contrast="high"> və CSS dəyişəni
// --fs-scale-dədir; localStorage açarı A11Y_KEY. Səhifə boyanmadan əvvəl
// tətbiq edən skript: A11Y_INIT_SCRIPT (app/layout.tsx), düymələr:
// HeaderIsland. CSS: 01-base.css (--fs-scale), 43-a11y.css (kontrast).

export const A11Y_KEY = 'adda-a11y';
/** Şrift pillələri: 90% … 130%. */
export const FS_STEPS = [0.9, 1, 1.1, 1.2, 1.3];

export interface A11yState {
  fs: number;
  contrast: boolean;
}

/** <html>-in cari vəziyyəti (init skripti artıq tətbiq edib). */
export function readA11y(root: HTMLElement): A11yState {
  const fs = Number(root.getAttribute('data-fs') || '1');
  return { fs: FS_STEPS.includes(fs) ? fs : 1, contrast: root.getAttribute('data-contrast') === 'high' };
}

/**
 * Boyanmadan əvvəl işləyən kiçik skript (beforeInteractive): saxlanmış ayarı və
 * <html lang>-ı (yol prefiksindən) tətbiq edir. Kök layout dili bilmir —
 * bu olmadan en/ru səhifələri `lang="az"` qalırdı (ekran oxuyucusu və böyük
 * hərflə yazılan mətn «İ» ilə).
 */
export const A11Y_INIT_SCRIPT = `(function(){try{var d=document.documentElement;var m=location.pathname.match(/^\\/(az|en|ru)(\\/|$)/);if(m)d.lang=m[1];var s=JSON.parse(localStorage.getItem('${A11Y_KEY}')||'{}');var f=Number(s.fs);if([0.9,1.1,1.2,1.3].indexOf(f)>-1){d.style.setProperty('--fs-scale',String(f));d.setAttribute('data-fs',String(f));}if(s.contrast===true)d.setAttribute('data-contrast','high');}catch(e){}})();`;
