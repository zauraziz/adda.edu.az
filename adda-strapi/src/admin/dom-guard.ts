/**
 * F5.52 — admin brauzer tərcüməsinə və kənar DOM müdaxiləsinə qarşı.
 *
 * Səbəb: Chrome/Edge «Tərcümə et» (və tərcümə genişlənmələri) mətn düyünlərini
 * silib yerinə <font><font>mətn</font></font> qoyur. React öz düyününü silmək
 * və ya onun qabağına yeni düyün qoymaq istəyəndə düyün artıq orada olmur:
 * «Failed to execute 'removeChild' on 'Node': The node to be removed is not a
 * child of this node» — bütün ekran «Xəta baş verdi»-yə düşür, yadda
 * saxlanmamış forma itir. İnterfeys onsuz da Azərbaycancadır (translations/az.ts).
 *
 *   1. blockPageTranslation — <html translate="no" class="notranslate">,
 *      <meta name="google" content="notranslate">. Brauzer səhifənin dilini və
 *      tərcümə edib-etməməyi səhifə YÜKLƏNƏNDƏN SONRA təyin edir; bu modul isə
 *      admin paketi yüklənəndə (DOMContentLoaded-dan əvvəl) işləyir — vaxtında.
 *   2. keepHtmlLangAz — Strapi `<html lang>`-ı interfeys dilinə (`en`) bərabər
 *      qoyur. Mətnlər Azərbaycancadır: `lang="en"` ilə CSS böyük hərfə çevirəndə
 *      «i» → «I» olur («GÖZLƏYIR»), brauzer də səhifəni ingiliscə sayıb tərcümə
 *      təklif edir. `az` olanda «İ» düzgün çıxır. Yalnız `en` dəyişdirilir.
 *   3. guardForeignDomChanges — ehtiyat: translate="no"-ya baxmayan genişlənmə
 *      DOM-u dəyişibsə removeChild/insertBefore xəta atmır, işi görür və
 *      konsola xəbərdarlıq yazır (ilk 5 dəfə). Normal halda davranış eynidir:
 *      yoxlama yalnız brauzerin xəta atacağı vəziyyətdə işə düşür.
 */

function blockPageTranslation(): void {
  const html = document.documentElement;
  html.setAttribute('translate', 'no');
  html.classList.add('notranslate');
  const head = document.head;
  if (head && !head.querySelector('meta[name="google"]')) {
    const meta = document.createElement('meta');
    meta.name = 'google';
    meta.content = 'notranslate';
    head.appendChild(meta);
  }
}

function keepHtmlLangAz(): void {
  const el = document.documentElement;
  const fix = () => {
    if (el.lang === 'en') el.lang = 'az';
  };
  fix();
  new MutationObserver(fix).observe(el, { attributes: true, attributeFilter: ['lang'] });
}

const GUARD_FLAG = '__addaDomGuard';

function guardForeignDomChanges(): void {
  if (typeof Node !== 'function' || !Node.prototype) return;
  const proto = Node.prototype as Node & Record<string, unknown>;
  if (proto[GUARD_FLAG]) return;
  Object.defineProperty(proto, GUARD_FLAG, { value: true });

  const nativeRemove = proto.removeChild;
  const nativeInsert = proto.insertBefore;
  let warned = 0;
  const warn = (op: string, node: Node) => {
    if (warned >= 5) return;
    warned++;
    console.warn(
      `[adda] ${op}: düyün gözlənilən yerdə deyil (brauzer tərcüməsi və ya genişlənmə DOM-u dəyişib) — xəta atılmadı.`,
      node,
    );
  };

  proto.removeChild = function removeChild<T extends Node>(this: Node, child: T): T {
    if (child && child.parentNode !== this) {
      warn('removeChild', child);
      // Düyün başqasının qabına keçirilibsə (məs. <font>) oradan silinir — React də onu silmək istəyirdi.
      if (child.parentNode) nativeRemove.call(child.parentNode, child);
      return child;
    }
    return nativeRemove.call(this, child) as T;
  };

  proto.insertBefore = function insertBefore<T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) {
      warn('insertBefore', ref);
      // İstinad düyünü sarğının içindədirsə sarğının qabağına, ümumiyyətlə çıxarılıbsa sona.
      let anchor: Node | null = ref;
      while (anchor && anchor.parentNode !== this) anchor = anchor.parentNode;
      return nativeInsert.call(this, node, anchor) as T;
    }
    return nativeInsert.call(this, node, ref) as T;
  };
}

/** `app.tsx` modulu yüklənəndə BİR DƏFƏ çağırılır (register-dən əvvəl). */
export function protectAdminDom(): void {
  if (typeof document === 'undefined') return;
  blockPageTranslation();
  keepHtmlLangAz();
  guardForeignDomChanges();
}
