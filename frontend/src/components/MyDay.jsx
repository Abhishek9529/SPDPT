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

// Productive category names (case-insensitive partial match)
const PRODUCTIVE_NAMES = [
    "study", "skills", "college", "coding", "code", "dsa", "programming",
    "project", "homework", "assignment", "lecture", "class", "lab",
    "reading", "research", "practice", "learn", "course", "tutorial",
    "exam", "test", "revision", "competitive", "development", "dev",
    "internship", "work", "training", "workshop", "seminar"
];

// --- Recommendation rules ---
function getRecommendations(categories) {
    const tips = [];
    const getHours = (keyword) => {
        return categories
            .filter(c => (c.name || "").toLowerCase().includes(keyword))
            .reduce((s, c) => s + (Number(c.hours) || 0), 0);
    };

    if (getHours("skills") < 2) tips.push("Try to spend more time on skills tomorrow.");
    if (getHours("study") < 3) tips.push("Increase study hours for better academic progress.");
    if (getHours("health") < 1 && getHours("gym") < 1 && getHours("exercise") < 1) tips.push("Take care of your health – add exercise or gym time.");
    if (getHours("sleep") < 6) tips.push("Proper sleep improves productivity. Aim for 7+ hours.");

    return tips;
}

function MyDay({ onSave }) {
    // Dynamic rows: student types everything
    const [rows, setRows] = useState([
        { name: "", hours: "", note: "" }
    ]);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [productivityScore, setProductivityScore] = useState(null);
    const [recommendations, setRecommendations] = useState([]);

    // Total hours
    const totalHours = rows.reduce((sum, r) => sum + (Number(r.hours) || 0), 0);
    const remainingHours = 24 - totalHours;

    // Calculate productivity score from current rows
    const calcScore = (cats, total) => {
        if (!total || total === 0) return 0;
        const productive = cats
            .filter(c => PRODUCTIVE_NAMES.some(p => (c.name || "").toLowerCase().includes(p)))
            .reduce((s, c) => s + (Number(c.hours) || 0), 0);
        return Math.round((productive / total) * 100);
    };

    // Fetch today's MyDay on mount
    useEffect(() => {
        const student = JSON.parse(localStorage.getItem("student"));
        if (!student) return;

        API.get(`/myday/${student._id}`)
            .then(res => {
                console.log("MyDay API response:", res.data);
                if (res.data && res.data.categories && res.data.categories.length > 0) {
                    const cats = res.data.categories.map(c => ({
                        name: c.name || "",
                        hours: c.hours || "",
                        note: c.note || ""
                    }));
                    setRows(cats);
                    setSaved(true);

                    // Set productivity score
                    const score = res.data.productivityScore ?? calcScore(cats, res.data.totalHours);
                    setProductivityScore(score);

                    // Generate recommendations
                    setRecommendations(getRecommendations(cats));
                }
            })
            .catch(err => console.log("MyDay fetch:", err));
    }, []);

    // Update a row field
    const updateRow = (index, field, value) => {
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

    const addRow = () => {
        if (totalHours >= 24) {
            setError("Already at 24 hours — no more categories!");
            return;
        }
        setRows(prev => [...prev, { name: "", hours: "", note: "" }]);
    };

    const removeRow = (index) => {
        if (rows.length <= 1) return;
        setRows(prev => prev.filter((_, i) => i !== index));
        setError("");
    };

    // Submit handler
    const handleSubmit = async () => {
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
            const cats = validRows.map(r => ({
                name: r.name.trim(),
                hours: Number(r.hours),
                note: r.note || ""
            }));

            const payload = {
                studentId: student._id,
                categories: cats
            };

            const res = await API.post("/myday", payload);
            console.log("MyDay saved:", res.data);
            setSaved(true);

            // Update productivity score
            const score = res.data.productivityScore ?? calcScore(cats, total);
            setProductivityScore(score);

            // Generate recommendations
            setRecommendations(getRecommendations(cats));

            // Notify parent (Dashboard) to refresh weekly chart
            if (onSave) onSave();
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

    const makePieOptions = (withNotes = false) => ({
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: "bottom",
                labels: { color: "#e2e8f0", font: { size: 12 }, padding: 10 }
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

    // Productivity score color
    const scoreColor = productivityScore >= 60 ? "#22c55e"
        : productivityScore >= 40 ? "#f59e0b" : "#ef4444";

    return (
        <div className="myday-section">
            <h3>📊 My Day Tracker</h3>

            {/* ===== Productivity Score Badge ===== */}
            {productivityScore !== null && (
                <div className="myday-score-card">
                    <div className="myday-score-header">
                        <span className="myday-score-icon">🔥</span>
                        <span className="myday-score-label">Productivity Score</span>
                        <span className="myday-score-value" style={{ color: scoreColor }}>
                            {productivityScore}%
                        </span>
                    </div>
                    <div className="myday-score-bar-track">
                        <div
                            className="myday-score-bar-fill"
                            style={{ width: `${productivityScore}%`, backgroundColor: scoreColor }}
                        ></div>
                    </div>
                    <p className="myday-score-hint">
                        Based on Study + Skills + College hours
                    </p>
                </div>
            )}

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

                <button className="myday-add-btn" onClick={addRow} disabled={totalHours >= 24}>
                    + Add Activity
                </button>

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

            {/* ===== Recommendations ===== */}
            {recommendations.length > 0 && (
                <div className="myday-reco-card">
                    <h4>📌 Recommendations</h4>
                    <ul className="myday-reco-list">
                        {recommendations.map((tip, i) => (
                            <li key={i} className="myday-reco-item">{tip}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default MyDay;
