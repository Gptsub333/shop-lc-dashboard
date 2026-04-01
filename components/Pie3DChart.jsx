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

function drawChart(ctx, W, H, slices, hoveredIndex, rx, ry, cx, cy, depth, showPercentLabels) {
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

    if (showPercentLabels) {
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
}

export default function Pie3DChart({ data, height = 260, showPercentLabels = true }) {
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
        drawChart(ctx, W, H, slices, -1, rx, ry, cx, cy, depth, showPercentLabels)
    }, [data, height, showPercentLabels])

    useEffect(() => {
        const canvas = canvasRef.current
        const geo = geoRef.current
        if (!canvas || !geo) return
        const ctx = canvas.getContext("2d")
        ctx.setTransform(geo.dpr, 0, 0, geo.dpr, 0, 0)
        drawChart(ctx, geo.W, geo.H, slicesRef.current, hovered, geo.rx, geo.ry, geo.cx, geo.cy, geo.depth, showPercentLabels)
    }, [hovered, showPercentLabels])

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
            setTooltip({ x: mx, y: my, name: sl.name, value: sl.value, pct: sl.pct, fill: sl.fill, subs: sl.subs })
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
                tooltip.subs !== undefined ? (
                    /* ── Rich card: Calls Overview only (subs explicitly provided) ── */
                    <div
                        className="pointer-events-none absolute z-50"
                        style={{
                            left: tooltip.x,
                            top: tooltip.y - (tooltip.subs.length > 0 ? 40 + tooltip.subs.length * 48 + 72 : 72),
                            transform: "translateX(-50%)",
                            width: 320,
                            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.18))",
                        }}
                    >
                        <div
                            className="rounded-2xl overflow-hidden"
                            style={{
                                backgroundColor: "var(--background)",
                                border: `1.5px solid ${tooltip.fill}40`,
                                boxShadow: `0 0 0 1px ${tooltip.fill}18, 0 4px 32px ${tooltip.fill}22`,
                            }}
                        >
                            {/* Coloured top accent bar */}
                            <div style={{ height: 3, background: `linear-gradient(90deg, ${tooltip.fill}, ${tooltip.fill}88)` }} />

                            {/* Header */}
                            <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2.5">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span
                                        className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: tooltip.fill, boxShadow: `0 0 6px 2px ${tooltip.fill}66` }}
                                    />
                                    <span className="text-sm font-bold text-foreground leading-snug">
                                        {tooltip.name}
                                    </span>
                                </div>
                                <div
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0"
                                    style={{ backgroundColor: `${tooltip.fill}18` }}
                                >
                                    <span className="text-xs font-bold tabular-nums" style={{ color: tooltip.fill }}>
                                        {tooltip.value.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        · {tooltip.pct.toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            {/* Sub-concern rows */}
                            {tooltip.subs.length > 0 ? (() => {
                                const maxVal = tooltip.subs[0].value || 1
                                return (
                                    <>
                                        <div className="mx-4 mb-2" style={{ height: 1, backgroundColor: `${tooltip.fill}20` }} />
                                        <div className="px-4 pb-3 space-y-2.5">
                                            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                                                Breakdown by concern
                                            </p>
                                            {tooltip.subs.map((sub) => {
                                                const pct = Math.round((sub.value / maxVal) * 100)
                                                return (
                                                    <div key={sub.name} className="space-y-0.5">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-xs text-foreground/80 leading-snug">
                                                                {sub.name}
                                                            </span>
                                                            <span className="text-xs font-bold tabular-nums shrink-0 leading-none" style={{ color: tooltip.fill }}>
                                                                {sub.value}
                                                            </span>
                                                        </div>
                                                        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: `${tooltip.fill}15` }}>
                                                            <div
                                                                className="h-full rounded-full"
                                                                style={{
                                                                    width: `${pct}%`,
                                                                    background: `linear-gradient(90deg, ${tooltip.fill}, ${tooltip.fill}bb)`,
                                                                    transition: "width 0.3s ease",
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </>
                                )
                            })() : (
                                <div className="px-4 pb-3">
                                    <div className="mb-2" style={{ height: 1, backgroundColor: `${tooltip.fill}20` }} />
                                    <p className="text-[10px] text-muted-foreground/40 italic">No subconcern data</p>
                                </div>
                            )}
                        </div>
                        {/* Caret */}
                        <div
                            style={{
                                width: 0, height: 0,
                                borderLeft: "9px solid transparent",
                                borderRight: "9px solid transparent",
                                borderTop: `9px solid ${tooltip.fill}40`,
                                margin: "0 auto",
                            }}
                        />
                    </div>
                ) : (
                    /* ── Simple classic tooltip: all other pie charts ── */
                    <div
                        className="pointer-events-none absolute z-50 rounded-xl px-3 py-2.5"
                        style={{
                            left: tooltip.x,
                            top: tooltip.y - 64,
                            transform: "translateX(-50%)",
                            backgroundColor: "var(--background)",
                            border: "1px solid hsl(var(--border))",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                            minWidth: 160,
                        }}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: tooltip.fill }}
                            />
                            <span className="text-sm font-semibold text-foreground leading-none">
                                {tooltip.name}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground pl-[18px]">
                            <span className="font-bold text-foreground">{tooltip.value.toLocaleString()}</span>
                            {" "}({tooltip.pct.toFixed(1)}%)
                        </p>
                    </div>
                )
            )}
        </div>
    )
}
