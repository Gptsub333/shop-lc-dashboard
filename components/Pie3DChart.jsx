"use client"

import { useEffect, useRef } from "react"

const TAU = Math.PI * 2

function hexShade(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgb(${Math.floor(r * factor)},${Math.floor(g * factor)},${Math.floor(b * factor)})`
}

/**
 * Canvas-based 3D (extruded) pie chart.
 *
 * Each slice is rendered as a raised slab:
 *   - Top face  : filled elliptic sector (compressed vertically to simulate tilt)
 *   - Side face : darker extruded wall, only visible for arcs in the front half [0, π]
 *
 * Draw order (back-to-front):
 *   1. Side walls, sorted so centre-bottom slices draw last (closest to viewer)
 *   2. Top faces (all slices)
 *   3. Percentage labels on top faces
 *
 * @param {{ name: string, value: number, fill: string }[]} data
 * @param {number} height  – canvas display height in px (default 260)
 */
export default function Pie3DChart({ data, height = 260 }) {
    const wrapRef = useRef(null)
    const canvasRef = useRef(null)

    useEffect(() => {
        const wrap = wrapRef.current
        const canvas = canvasRef.current
        if (!wrap || !canvas) return

        const dpr = window.devicePixelRatio || 1
        const W = wrap.clientWidth || 400
        const H = height

        canvas.width = W * dpr
        canvas.height = H * dpr
        canvas.style.width = `${W}px`
        canvas.style.height = `${H}px`

        const ctx = canvas.getContext("2d")
        ctx.scale(dpr, dpr)
        ctx.clearRect(0, 0, W, H)

        const total = data.reduce((s, d) => s + d.value, 0)
        if (total === 0) return

        // ── Geometry ──────────────────────────────────────────────────────────
        const cx = W / 2
        const cy = H * 0.41          // shift up to leave room for the extruded depth below
        const rx = Math.min(W * 0.37, H * 0.50)
        const ry = rx * 0.40         // compression factor → ~65° tilt from horizontal
        const depth = rx * 0.26      // extrusion thickness
        const explode = 0            // no gap – whole pie (segments touch)

        // ── Build slice descriptors ───────────────────────────────────────────
        let angle = -Math.PI / 2     // start at 12 o'clock
        const slices = data.map((d) => {
            const sweep = (d.value / total) * TAU
            const mid = angle + sweep / 2
            const pct = (d.value / total) * 100
            const sl = { ...d, start: angle, end: angle + sweep, mid, pct }
            angle += sweep
            return sl
        })

        // Explode offset: push segment outward along its bisector
        function exp(slice) {
            return {
                dx: explode * Math.cos(slice.mid),
                dy: explode * Math.sin(slice.mid) * (ry / rx),
            }
        }

        // ── Draw side wall (visible portion: arcs in [0, π]) ─────────────────
        function drawSide(slice) {
            const vs = Math.max(slice.start, 0)
            const ve = Math.min(slice.end, Math.PI)
            if (vs >= ve) return                    // slice entirely in back half – skip

            const { dx, dy } = exp(slice)
            const sideColor = hexShade(slice.fill, 0.50)

            // Path: top-arc → right-edge-down → bottom-arc-reversed → left-edge-up
            ctx.beginPath()
            ctx.ellipse(cx + dx, cy + dy, rx, ry, 0, vs, ve)
            ctx.lineTo(
                cx + dx + rx * Math.cos(ve),
                cy + dy + ry * Math.sin(ve) + depth
            )
            ctx.ellipse(cx + dx, cy + dy + depth, rx, ry, 0, ve, vs, true)
            ctx.lineTo(
                cx + dx + rx * Math.cos(vs),
                cy + dy + ry * Math.sin(vs)
            )
            ctx.closePath()
            ctx.fillStyle = sideColor
            ctx.fill()
        }

        // ── Draw top face (filled elliptic sector) ────────────────────────────
        function drawTop(slice) {
            const { dx, dy } = exp(slice)
            ctx.beginPath()
            ctx.moveTo(cx + dx, cy + dy)
            ctx.ellipse(cx + dx, cy + dy, rx, ry, 0, slice.start, slice.end)
            ctx.closePath()
            ctx.fillStyle = slice.fill
            ctx.fill()
            ctx.strokeStyle = "rgba(0,0,0,0.10)"
            ctx.lineWidth = 1
            ctx.stroke()
        }

        // ── 1. Side walls – sorted back-to-front (largest sin(mid) last) ──────
        const sideOrder = [...slices].sort((a, b) => Math.sin(b.mid) - Math.sin(a.mid))
        sideOrder.forEach(drawSide)

        // ── 2. Top faces ──────────────────────────────────────────────────────
        slices.forEach(drawTop)

        // ── 3. Percentage labels ──────────────────────────────────────────────
        const fontSize = Math.max(12, Math.round(rx * 0.092))
        ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        slices.forEach((s) => {
            if (s.pct < 3) return
            const { dx, dy } = exp(s)
            const lr = rx * 0.57
            const lx = cx + dx + lr * Math.cos(s.mid)
            const ly = cy + dy + ry * Math.sin(s.mid) * 0.57

            // Subtle shadow for readability on both light and dark fills
            ctx.shadowColor = "rgba(0,0,0,0.35)"
            ctx.shadowBlur = 3
            ctx.fillStyle = "rgba(255,255,255,0.95)"
            ctx.fillText(`${s.pct.toFixed(1)}%`, lx, ly)
            ctx.shadowBlur = 0
        })
    }, [data, height])

    return (
        <div ref={wrapRef} style={{ width: "100%", height }}>
            <canvas ref={canvasRef} />
        </div>
    )
}
