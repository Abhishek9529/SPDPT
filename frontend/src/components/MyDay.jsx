import { useEffect, useState } from "react";
import API from "../services/api";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./MyDay.css";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Color palette for pie chart slices
const COLORS = [
    "#6366f1", "#3b82f6", "#06b6d4", "#22c55e",
    "#ec4899", "#ef4444", "#f59e0b", "#a78bfa",
    "#14b8a6", "#f97316"
];

// Static ideal day data
const IDEAL_DAY = [
    { name: "Sleep", hours: 7 },
    { name: "College", hours: 6 },
    { name: "Study", hours: 2 },
    { name: "Skills", hours: 2 },
    { name: "Family", hours: 2 },
    { name: "Health", hours: 2 },
    { name: "Misc", hours: 3 }
];

function MyDay() {
    // Dynamic rows: student types everything
    const [rows, setRows] = useState([
        { name: "", hours: "", note: "" }
    ]);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Total hours
    const totalHours = rows.reduce((sum, r) => sum + (Number(r.hours) || 0), 0);
    const remainingHours = 24 - totalHours;

    // Fetch today's MyDay on mount
    useEffect(() => {
        const student = JSON.parse(localStorage.getItem("student"));
        if (!student) return;

        API.get(`/myday/${student._id}`)
            .then(res => {
                console.log("MyDay API response:", res.data);
                if (res.data && res.data.categories && res.data.categories.length > 0) {
                    setRows(res.data.categories.map(c => ({
                        name: c.name || "",
                        hours: c.hours || "",
                        note: c.note || ""
                    })));
                    setSaved(true);
                }
            })
            .catch(err => console.log("MyDay fetch:", err));
    }, []);

    // Update a row field
    const updateRow = (index, field, value) => {
        // If updating hours, check 24hr limit
        if (field === "hours") {
            const num = Number(value) || 0;
            const othersTotal = rows.reduce(
                (sum, r, i) => i === index ? sum : sum + (Number(r.hours) || 0), 0
            );
            if (num < 0) return;
            if (othersTotal + num > 24) {
                setError("Total cannot exceed 24 hours!");
                return;
            }
            setError("");
        }

        setRows(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
        setError("");
    };

    // Add a new row
    const addRow = () => {
        if (totalHours >= 24) {
            setError("Already at 24 hours — no more categories!");
            return;
        }
        setRows(prev => [...prev, { name: "", hours: "", note: "" }]);
    };

    // Remove a row
    const removeRow = (index) => {
        if (rows.length <= 1) return;
        setRows(prev => prev.filter((_, i) => i !== index));
        setError("");
    };

    // Submit handler
    const handleSubmit = async () => {
        // Filter out empty rows
        const validRows = rows.filter(r => r.name.trim() && Number(r.hours) > 0);

        if (validRows.length === 0) {
            setError("Add at least one category with hours.");
            return;
        }

        const total = validRows.reduce((s, r) => s + Number(r.hours), 0);
        if (total > 24) {
            setError("Total hours cannot exceed 24!");
            return;
        }

        const student = JSON.parse(localStorage.getItem("student"));
        if (!student) return;

        setSaving(true);
        setError("");

        try {
            const payload = {
                studentId: student._id,
                categories: validRows.map(r => ({
                    name: r.name.trim(),
                    hours: Number(r.hours),
                    note: r.note || ""
                }))
            };

            const res = await API.post("/myday", payload);
            console.log("MyDay saved:", res.data);
            setSaved(true);
        } catch (err) {
            console.error("MyDay save error:", err);
            setError("Failed to save. Try again.");
        } finally {
            setSaving(false);
        }
    };

    // ---- Ideal Day Pie ----
    const idealPieData = {
        labels: IDEAL_DAY.map(d => `${d.name} (${d.hours}h)`),
        datasets: [{
            data: IDEAL_DAY.map(d => d.hours),
            backgroundColor: COLORS.slice(0, IDEAL_DAY.length),
            borderColor: "#0f172a",
            borderWidth: 2
        }]
    };

    // ---- Actual Day Pie ----
    const filledRows = rows.filter(r => r.name.trim() && Number(r.hours) > 0);
    const actualPieData = {
        labels: filledRows.map(r => `${r.name} (${r.hours}h)`),
        datasets: [{
            data: filledRows.map(r => Number(r.hours)),
            backgroundColor: filledRows.map((_, i) => COLORS[i % COLORS.length]),
            borderColor: "#0f172a",
            borderWidth: 2
        }]
    };

    // Pie options
    const makePieOptions = (withNotes = false) => ({
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: "#e2e8f0",
                    font: { size: 12 },
                    padding: 10
                }
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const hours = ctx.parsed;
                        const pct = Math.round((hours / 24) * 100);
                        if (withNotes) {
                            const row = filledRows[ctx.dataIndex];
                            const note = row?.note ? ` – Note: ${row.note}` : "";
                            return ` ${row?.name} – ${hours} hrs (${pct}%)${note}`;
                        }
                        return ` ${ctx.label}: ${pct}%`;
                    }
                }
            }
        }
    });

    return (
        <div className="myday-section">
            <h3>📊 My Day Tracker</h3>

            {/* ===== Dual Pie Charts ===== */}
            <div className="myday-charts-grid">
                <div className="myday-chart-card">
                    <h4>🎯 Ideal Day</h4>
                    <div className="myday-chart-wrapper">
                        <Pie data={idealPieData} options={makePieOptions(false)} />
                    </div>
                </div>

                <div className="myday-chart-card">
                    <h4>📋 My Actual Day</h4>
                    {saved && filledRows.length > 0 ? (
                        <div className="myday-chart-wrapper">
                            <Pie data={actualPieData} options={makePieOptions(true)} />
                        </div>
                    ) : (
                        <p className="myday-placeholder-text">
                            Fill in your activities below to see your actual day chart.
                        </p>
                    )}
                </div>
            </div>

            {/* ===== Dynamic Input Form ===== */}
            <div className="myday-form-card">
                <h4>⏱️ Log Today's Hours</h4>

                {/* Column headers */}
                <div className="myday-form-header">
                    <span>Activity</span>
                    <span>Hours</span>
                    <span>Note</span>
                    <span></span>
                </div>

                <div className="myday-form-grid">
                    {rows.map((row, i) => (
                        <div key={i} className="myday-form-row">
                            <input
                                type="text"
                                placeholder="e.g. Sleep, Study, Gym..."
                                value={row.name}
                                onChange={(e) => updateRow(i, "name", e.target.value)}
                                className="myday-name-input"
                            />
                            <input
                                type="number"
                                min="0"
                                max={Number(row.hours || 0) + remainingHours}
                                step="0.5"
                                placeholder="Hrs"
                                value={row.hours}
                                onChange={(e) => updateRow(i, "hours", e.target.value)}
                                className="myday-hours-input"
                            />
                            <input
                                type="text"
                                placeholder="Optional note"
                                value={row.note}
                                onChange={(e) => updateRow(i, "note", e.target.value)}
                                className="myday-note-input"
                            />
                            <button
                                className="myday-remove-btn"
                                onClick={() => removeRow(i)}
                                disabled={rows.length <= 1}
                                title="Remove row"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add row button */}
                <button className="myday-add-btn" onClick={addRow} disabled={totalHours >= 24}>
                    + Add Activity
                </button>

                {/* Footer: total + save */}
                <div className="myday-form-footer">
                    <span className={`myday-total ${totalHours > 24 ? "myday-total-error" : ""}`}>
                        Total: {totalHours} / 24 hrs
                        {remainingHours > 0 && totalHours > 0 && (
                            <span className="myday-remaining"> ({remainingHours}h remaining)</span>
                        )}
                    </span>

                    {error && <span className="myday-error">{error}</span>}

                    <button
                        className="myday-save-btn"
                        onClick={handleSubmit}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : saved ? "✅ Update My Day" : "Save My Day"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MyDay;
