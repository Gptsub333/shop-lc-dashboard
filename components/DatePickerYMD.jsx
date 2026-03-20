"use client"

import { useRef } from "react"
import { CalendarDays } from "lucide-react"

/**
 * A date input that always displays and accepts YYYY-MM-DD format,
 * with a calendar button that opens the native browser date picker.
 * The internal value sent to the API is always YYYY-MM-DD.
 */
export default function DatePickerYMD({ label, value, onChange }) {
    const hiddenRef = useRef(null)

    // Today's date in YYYY-MM-DD (local time) — used as the max allowed date
    const today = new Date()
    const maxDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-")

    function handleTextChange(e) {
        const raw = e.target.value
        // If a complete date is typed, block future dates
        if (/^\d{4}-\d{2}-\d{2}$/.test(raw) && raw > maxDate) return
        onChange(raw)
    }

    function handlePickerChange(e) {
        // Native date picker always gives YYYY-MM-DD; max attribute already blocks future
        onChange(e.target.value)
    }

    return (
        <div className="flex-1">
            {label && (
                <label className="text-sm font-medium text-foreground mb-2 block">{label}</label>
            )}
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={handleTextChange}
                    placeholder="YYYY-MM-DD"
                    maxLength={10}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
                />
                <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => hiddenRef.current?.showPicker?.()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Open calendar"
                >
                    <CalendarDays className="w-4 h-4" />
                </button>
                {/* Hidden native date input — provides the calendar picker UI */}
                <input
                    ref={hiddenRef}
                    type="date"
                    value={value}
                    max={maxDate}
                    onChange={handlePickerChange}
                    className="absolute inset-0 opacity-0 pointer-events-none"
                    tabIndex={-1}
                />
            </div>
        </div>
    )
}
