"use client"

import { useEffect, useRef, useCallback, useState } from "react"

const TAU = Math.PI * 2
const EXPLODE_DIST = 14

function hexShade(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgb(${Math.floor(r * factor)},${Math.floor(g * factor)},${Math.floor(b * factor)})`
}

function hexBrighten(hex, factor) {
    const r = Math.min(255, Math.floor(parseInt(hex.slice(1, 3), 16) * factor))
    const g = Math.min(255, Math.floor(parseInt(hex.slice(3, 5), 16) * factor))
    const b = Math.min(255, Math.floor(parseInt(hex.slice(5, 7), 16) * factor))
    return `rgb(${r},${g},${b})`
}

function buildSlices(data, total) {
    let angle = -Math.PI / 2
    return data.map((d) => {
        const sweep = (d.value / total) * TAU
        const mid = angle + sweep / 2
        const pct = (d.value / total) * 100
        const sl = { ...d, start: angle, end: angle + sweep, mid, pct }
        angle += sweep
        return sl
    })
}

function hitTest(mx, my, cx, cy, rx, ry, slices) {
    const dx = mx - cx
    const dy = my - cy
    const normX = dx / rx
    const normY = dy / ry
    if (normX * normX + normY * normY > 1.15) return -1

    let angle = Math.atan2(dy / ry, dx / rx)
    if (angle < -Math.PI / 2) angle += TAU

    for (let i = 0; i < slices.length; i++) {
        let start = slices[i].start
        let end = slices[i].end
        if (start < -Math.PI / 2) start += TAU
        if (end < -Math.PI / 2) end += TAU
        if (angle >= start && angle < end) return i
    }
    return -1
}

function sliceOffset(slice, hoveredIndex, idx) {
    if (idx !== hoveredIndex) return { ox: 0, oy: 0 }
    return {
        ox: EXPLODE_DIST * Math.cos(slice.mid),
        oy: EXPLODE_DIST * Math.sin(slice.mid) * 0.40,
    }
}

function drawChart(ctx, W, H, slices, hoveredIndex, rx, ry, cx, cy, depth) {
    ctx.clearRect(0, 0, W, H)
    if (slices.length === 0) return

    function drawSide(slice, idx) {
        const vs = Math.max(slice.start, 0)
        const ve = Math.min(slice.end, Math.PI)
        if (vs >= ve) return

        const { ox, oy } = sliceOffset(slice, hoveredIndex, idx)
        const scx = cx + ox
        const scy = cy + oy
        const isHov = idx === hoveredIndex

        const baseColor = isHov ? hexShade(slice.fill, 0.60) : hexShade(slice.fill, 0.50)
        ctx.beginPath()
        ctx.ellipse(scx, scy, rx, ry, 0, vs, ve)
        ctx.lineTo(scx + rx * Math.cos(ve), scy + ry * Math.sin(ve) + depth)
        ctx.ellipse(scx, scy + depth, rx, ry, 0, ve, vs, true)
        ctx.lineTo(scx + rx * Math.cos(vs), scy + ry * Math.sin(vs))
        ctx.closePath()
        ctx.fillStyle = baseColor
        ctx.fill()
    }

    function drawTop(slice, idx) {
        const { ox, oy } = sliceOffset(slice, hoveredIndex, idx)
        const scx = cx + ox
        const scy = cy + oy
        const isHov = idx === hoveredIndex

        if (isHov) {
            ctx.save()
            ctx.shadowColor = "rgba(0,0,0,0.30)"
            ctx.shadowBlur = 18
            ctx.shadowOffsetX = ox * 0.3
            ctx.shadowOffsetY = 6
        }

        const fillColor = isHov ? hexBrighten(slice.fill, 1.18) : slice.fill
        ctx.beginPath()
        ctx.moveTo(scx, scy)
        ctx.ellipse(scx, scy, rx, ry, 0, slice.start, slice.end)
        ctx.closePath()
        ctx.fillStyle = fillColor
        ctx.fill()

        ctx.strokeStyle = isHov ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.10)"
        ctx.lineWidth = isHov ? 2.5 : 1
        ctx.stroke()

        if (isHov) ctx.restore()
    }

    // Side walls back-to-front, but skip hovered (drawn last)
    const sideOrder = slices
        .map((s, i) => ({ s, i }))
        .filter(({ i }) => i !== hoveredIndex)
        .sort((a, b) => Math.sin(b.s.mid) - Math.sin(a.s.mid))
    sideOrder.forEach(({ s, i }) => drawSide(s, i))

    // Top faces — non-hovered first
    slices.forEach((s, i) => { if (i !== hoveredIndex) drawTop(s, i) })

    // Hovered slice drawn last (sides then top) so it renders on top
    if (hoveredIndex >= 0 && hoveredIndex < slices.length) {
        drawSide(slices[hoveredIndex], hoveredIndex)
        drawTop(slices[hoveredIndex], hoveredIndex)
    }

    // Percentage labels
    const fontSize = Math.max(12, Math.round(rx * 0.092))
    ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    slices.forEach((s, i) => {
        if (s.pct < 3) return
        const { ox, oy } = sliceOffset(s, hoveredIndex, i)
        const lr = rx * 0.57
        const lx = cx + ox + lr * Math.cos(s.mid)
        const ly = cy + oy + ry * Math.sin(s.mid) * 0.57
        ctx.shadowColor = "rgba(0,0,0,0.35)"
        ctx.shadowBlur = 3
        ctx.fillStyle = "rgba(255,255,255,0.95)"
        ctx.fillText(`${s.pct.toFixed(1)}%`, lx, ly)
        ctx.shadowBlur = 0
    })
}

export default function Pie3DChart({ data, height = 260 }) {
    const wrapRef = useRef(null)
    const canvasRef = useRef(null)
    const geoRef = useRef(null)
    const slicesRef = useRef([])
    const [hovered, setHovered] = useState(-1)
    const [tooltip, setTooltip] = useState(null)

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

        const total = data.reduce((s, d) => s + d.value, 0)
        if (total === 0) return

        const cx = W / 2
        const cy = H * 0.41
        const rx = Math.min(W * 0.37, H * 0.50)
        const ry = rx * 0.40
        const depth = rx * 0.26

        const slices = buildSlices(data, total)
        slicesRef.current = slices
        geoRef.current = { cx, cy, rx, ry, depth, W, H, dpr }

        const ctx = canvas.getContext("2d")
        ctx.scale(dpr, dpr)
        drawChart(ctx, W, H, slices, -1, rx, ry, cx, cy, depth)
    }, [data, height])

    useEffect(() => {
        const canvas = canvasRef.current
        const geo = geoRef.current
        if (!canvas || !geo) return
        const ctx = canvas.getContext("2d")
        ctx.setTransform(geo.dpr, 0, 0, geo.dpr, 0, 0)
        drawChart(ctx, geo.W, geo.H, slicesRef.current, hovered, geo.rx, geo.ry, geo.cx, geo.cy, geo.depth)
    }, [hovered])

    const handleMouseMove = useCallback((e) => {
        const canvas = canvasRef.current
        const geo = geoRef.current
        if (!canvas || !geo) return

        const rect = canvas.getBoundingClientRect()
        const mx = e.clientX - rect.left
        const my = e.clientY - rect.top

        const idx = hitTest(mx, my, geo.cx, geo.cy, geo.rx, geo.ry, slicesRef.current)
        setHovered(idx)

        if (idx >= 0) {
            canvas.style.cursor = "pointer"
            const sl = slicesRef.current[idx]
            setTooltip({ x: mx, y: my, name: sl.name, value: sl.value, pct: sl.pct, fill: sl.fill })
        } else {
            canvas.style.cursor = "default"
            setTooltip(null)
        }
    }, [])

    const handleMouseLeave = useCallback(() => {
        setHovered(-1)
        setTooltip(null)
        if (canvasRef.current) canvasRef.current.style.cursor = "default"
    }, [])

    return (
        <div ref={wrapRef} style={{ width: "100%", height, position: "relative" }}>
            <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            />
            {tooltip && (
                <div
                    className="pointer-events-none absolute z-50 rounded-xl border border-border/60 bg-background/95 backdrop-blur-sm px-4 py-2.5 shadow-2xl"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y - 68,
                        transform: "translateX(-50%)",
                    }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            className="inline-block w-3 h-3 rounded-full ring-2 ring-white/30"
                            style={{ backgroundColor: tooltip.fill }}
                        />
                        <span className="text-sm font-semibold text-foreground">{tooltip.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        <span className="font-bold text-foreground text-sm">{tooltip.value.toLocaleString()}</span>
                        <span className="ml-1.5 text-muted-foreground">({tooltip.pct.toFixed(1)}%)</span>
                    </div>
                </div>
            )}
        </div>
    )
}
