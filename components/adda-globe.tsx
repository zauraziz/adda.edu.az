"use client"

/* ═══════════════════════════════════════════════════════════════
   ADDA Globe — components/ui/adda-globe.tsx
   Next.js miqrasiyası üçün (Intl/Beynəlxalq bölməsi).
   Quraşdırma:  npm i cobe
   Qeyd: rəsmi cobe (0.6.x) yalnız marker dəstəkləyir; arcs/label
   parametrləri anchor-positioning dəstəkli fork tələb edir —
   dəstəklənməyəndə təhlükəsiz şəkildə nəzərə alınmır.
   Statik HTML versiyası: intlx-block.html (vanilla port, eyni cobe).
   ═══════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useCallback } from "react"
import createGlobe from "cobe"

interface Marker { id: string; location: [number, number]; label: string }
interface Arc { id: string; from: [number, number]; to: [number, number]; label?: string }

interface GlobeProps {
  markers?: Marker[]
  arcs?: Arc[]
  className?: string
  markerColor?: [number, number, number]
  baseColor?: [number, number, number]
  arcColor?: [number, number, number]
  glowColor?: [number, number, number]
  dark?: number
  mapBrightness?: number
  markerSize?: number
  arcWidth?: number
  arcHeight?: number
  speed?: number
  theta?: number
  diffuse?: number
  mapSamples?: number
}

/* ADDA brend defaultları: tünd navy kürə + qızıl markerlər */
export function AddaGlobe({
  markers = [],
  arcs = [],
  className = "",
  markerColor = [0.86, 0.72, 0.44],   /* gold #C9A961 */
  baseColor   = [0.16, 0.32, 0.46],   /* navy-600 tonu */
  arcColor    = [0.86, 0.72, 0.44],
  glowColor   = [0.05, 0.11, 0.17],   /* navy-900 parıltı */
  dark = 1,
  mapBrightness = 5.5,
  markerSize = 0.045,
  arcWidth = 0.5,
  arcHeight = 0.25,
  speed = 0.0032,
  theta = 0.24,
  diffuse = 1.6,
  mapSamples = 14000,
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointer = useRef<{ x: number; y: number } | null>(null)
  const last = useRef<{ x: number; y: number; t: number } | null>(null)
  const off = useRef({ phi: 0, theta: 0 })
  const vel = useRef({ phi: 0, theta: 0 })
  const basePhi = useRef(0)
  const baseTheta = useRef(0)

  const onDown = useCallback((e: React.PointerEvent) => {
    pointer.current = { x: e.clientX, y: e.clientY }
    last.current = { x: e.clientX, y: e.clientY, t: Date.now() }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
  }, [])

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!pointer.current || !last.current) return
      off.current = {
        phi: (e.clientX - pointer.current.x) / 280,
        theta: (e.clientY - pointer.current.y) / 900,
      }
      const now = Date.now(), dt = Math.max(now - last.current.t, 1), cap = 0.15
      vel.current = {
        phi: Math.max(-cap, Math.min(cap, ((e.clientX - last.current.x) / dt) * 0.3)),
        theta: Math.max(-cap, Math.min(cap, ((e.clientY - last.current.y) / dt) * 0.08)),
      }
      last.current = { x: e.clientX, y: e.clientY, t: now }
    }
    const up = () => {
      if (pointer.current) {
        basePhi.current += off.current.phi
        baseTheta.current += off.current.theta
        off.current = { phi: 0, theta: 0 }
      }
      pointer.current = null
      if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    }
    window.addEventListener("pointermove", move, { passive: true })
    window.addEventListener("pointerup", up, { passive: true })
    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let globe: ReturnType<typeof createGlobe> | null = null
    let raf = 0
    let phi = 0
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const spd = reduced ? 0 : speed

    const init = () => {
      const w = canvas.offsetWidth
      if (!w || globe) return
      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: w, height: w,
        phi: 0, theta, dark, diffuse, mapSamples, mapBrightness,
        baseColor, markerColor, glowColor, opacity: 0.85,
        markers: markers.map(m => ({ location: m.location, size: markerSize, id: m.id })),
        /* fork dəstəyi olduqda işləyir; rəsmi cobe bunları nəzərə almır */
        // @ts-expect-error optional fork props
        arcs: arcs.map(a => ({ from: a.from, to: a.to, id: a.id })),
        arcColor, arcWidth, arcHeight,
      })
      const loop = () => {
        if (!pointer.current) {
          phi += spd
          if (Math.abs(vel.current.phi) > 1e-4 || Math.abs(vel.current.theta) > 1e-4) {
            basePhi.current += vel.current.phi
            baseTheta.current += vel.current.theta
            vel.current.phi *= 0.94; vel.current.theta *= 0.94
          }
          if (baseTheta.current < -0.4) baseTheta.current += (-0.4 - baseTheta.current) * 0.1
          if (baseTheta.current >  0.4) baseTheta.current += ( 0.4 - baseTheta.current) * 0.1
        }
        globe!.update({ phi: phi + basePhi.current + off.current.phi,
                        theta: theta + baseTheta.current + off.current.theta })
        raf = requestAnimationFrame(loop)
      }
      loop()
      requestAnimationFrame(() => { canvas.style.opacity = "1" })
    }

    if (canvas.offsetWidth > 0) init()
    else {
      const ro = new ResizeObserver(en => {
        if (en[0]?.contentRect.width > 0) { ro.disconnect(); init() }
      })
      ro.observe(canvas)
    }
    return () => { cancelAnimationFrame(raf); globe?.destroy() }
  }, [markers, arcs, markerColor, baseColor, arcColor, glowColor, dark,
      mapBrightness, markerSize, arcWidth, arcHeight, speed, theta, diffuse, mapSamples])

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={onDown}
        aria-label="İnteraktiv qlobus — tərəfdaş şəhərlər"
        style={{ width: "100%", height: "100%", cursor: "grab", opacity: 0,
                 transition: "opacity 1.2s ease", borderRadius: "50%", touchAction: "none" }}
      />
    </div>
  )
}

/* ── İstifadə nümunəsi: Beynəlxalq bölmə (app/…/IntlSection.tsx) ── */
export const ADDA_MARKERS: Marker[] = [
  { id: "baku",        location: [40.4093, 49.8671],  label: "Bakı" },
  { id: "istanbul",    location: [41.0082, 28.9784],  label: "İstanbul" },
  { id: "varna",       location: [43.2141, 27.9147],  label: "Varna" },
  { id: "gdynia",      location: [54.5189, 18.5305],  label: "Gdynia" },
  { id: "rotterdam",   location: [51.9244, 4.4777],   label: "Rotterdam" },
  { id: "southampton", location: [50.9097, -1.4044],  label: "Sautgempton" },
  { id: "tokyo",       location: [35.6762, 139.6503], label: "Tokio (IAMU)" },
  { id: "shanghai",    location: [31.2304, 121.4737], label: "Şanxay" },
  { id: "alexandria",  location: [31.2001, 29.9187],  label: "İsgəndəriyyə" },
  { id: "constanta",   location: [44.1598, 28.6348],  label: "Konstansa" },
]

export const ADDA_ARCS: Arc[] = [
  { id: "baku-tokyo",     from: [40.4093, 49.8671], to: [35.6762, 139.6503], label: "IAMU" },
  { id: "baku-istanbul",  from: [40.4093, 49.8671], to: [41.0082, 28.9784],  label: "TURMARIN" },
  { id: "baku-rotterdam", from: [40.4093, 49.8671], to: [51.9244, 4.4777],   label: "Erasmus+" },
]

export default function AddaGlobeDemo() {
  return (
    <div className="flex w-full items-center justify-center bg-[#071E2E] p-8">
      <div className="w-full max-w-lg">
        <AddaGlobe markers={ADDA_MARKERS} arcs={ADDA_ARCS} />
      </div>
    </div>
  )
}
