import { InitiativeStatus } from "@/enums/status";
import { UserRoles } from "@/enums/userRole";
import { emptyFinancials } from "@/utils/finantial-utils";
import { FUNCTIONS_ENUM } from './../../enums/functions';
import { useState, useEffect } from "react";
import { fmtDollar } from "../tooltip";
import { HELP, FUNCTIONS, STATUS_LIST, HEALTH_LIST, HEALTH_CONFIG, MONTHS } from "@/constants/constants";
import Avatar from "../avatar";
import { formatDate } from './../../utils/datetime-utils';

function MonthlyBreakdownEditor({ breakdown, onChange }) {
    const [startMonth, setStartMonth] = useState(new Date().getMonth());
    const [startYear, setStartYear] = useState(new Date().getFullYear());
    const [rows, setRows] = useState(breakdown.length > 0 ? breakdown : []);

    const gen = () => {
        const nr = [];
        for (let i = 0; i < 12; i++) {
        const mIdx = (startMonth + i) % 12;
        const yr = startYear + Math.floor((startMonth + i) / 12);
        nr.push({ month: `${MONTHS[mIdx]} ${yr}`, value: rows[i]?.value || 0 });
        }
        setRows(nr);
        onChange(nr);
    };

    const upd = (i, v) => {
        const u = rows.map((r, idx) => (idx === i ? { ...r, value: v } : r));
        setRows(u);
        onChange(u);
    };

    const total = rows.reduce((s, r) => s + (r.value || 0), 0);

    return (
        <div className="space-y-3">
        <div className="flex items-end gap-3">
            <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">
                Start month
            </label>
            <select
                value={startMonth}
                onChange={(e) => setStartMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
                {MONTHS.map((m, i) => (
                <option key={i} value={i}>
                    {m}
                </option>
                ))}
            </select>
            </div>
            <div className="w-24">
            <label className="block text-xs text-gray-500 mb-1">Year</label>
            <select
                value={startYear}
                onChange={(e) => setStartYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
                {[2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                    {y}
                </option>
                ))}
            </select>
            </div>
            <button
            onClick={gen}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 whitespace-nowrap"
            >
            {rows.length > 0 ? "Regenerate" : "Generate 12 Months"}
            </button>
        </div>
        {rows.length > 0 ? (
            <div>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-2 divide-y divide-gray-100">
                {rows.map((r, i) => (
                    <div
                    key={i}
                    className="flex items-center justify-between px-4 py-2 border-r border-gray-100 last:border-r-0"
                    >
                    <span className="text-sm text-gray-600 w-20">{r.month}</span>
                    <DollarInput
                        value={r.value}
                        onChange={(v) => upd(i, v)}
                        placeholder="$0"
                        className="w-28 text-right text-sm"
                    />
                    </div>
                ))}
                </div>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
                <button
                onClick={() => {
                    const c = rows.map((r) => ({ ...r, value: 0 }));
                    setRows(c);
                    onChange(c);
                }}
                className="text-xs text-gray-400 hover:text-red-500"
                >
                Clear all
                </button>
                <div className="text-sm text-gray-600">
                12-month total:{" "}
                <span className="font-bold text-gray-900">
                    {fmtDollar(total)}
                </span>
                </div>
            </div>
            </div>
        ) : (
            <p className="text-sm text-gray-400 italic text-center py-4">
            Select a start month and click Generate.
            </p>
        )}
        </div>
    );
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function InfoTip({ text }) {
    const [show, setShow] = useState(false);
    return (
        <span className="relative inline-flex ml-1.5 align-middle">
        <button
            type="button"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            onClick={(e) => {
            e.preventDefault();
            setShow(!show);
            }}
            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 hover:bg-amber-100 text-gray-400 hover:text-amber-600 transition-colors cursor-help text-xs font-bold leading-none"
        >
            ?
        </button>
        {show && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs leading-relaxed rounded-lg shadow-xl z-50 pointer-events-none">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 rotate-45" />
            </div>
        )}
        </span>
    );
}

function parseDollar(str) {
    if (!str) 
    {
        return 0;
    }

    return parseFloat(String(str).replace(/[^0-9.\-]/g, "")) || 0;
}

function DollarInput({ value, onChange, placeholder, className = "" }) {
    const [display, setDisplay] = useState(value ? fmtDollar(value) : "");

    useEffect(() => {
        if (value === 0 && display === "") return;
        if (parseDollar(display) !== value)
        setDisplay(value ? fmtDollar(value) : "");
    }, [value]);

    return (
        <input
        type="text"
        inputMode="numeric"
        placeholder={placeholder || "$0"}
        value={display}
        onChange={(e) => setDisplay(e.target.value)}
        onBlur={() => {
            const n = parseDollar(display);
            onChange(n);
            setDisplay(n ? fmtDollar(n) : "");
        }}
        onFocus={() => {
            const n = parseDollar(display);
            setDisplay(n ? String(n) : "");
        }}
        className={`w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white ${className}`}
        />
    );
}

export default function InitiativeForm({ initiative, users, currentUser, onSave, onCancel }) {
    const isPrivileged =
        currentUser?.appRole === UserRoles.ADMIN || currentUser?.appRole === UserRoles.EXECUTIVE;
    const [form, setForm] = useState(() =>
        initiative
        ? {
            ...initiative,
            financials: initiative.financials || emptyFinancials(),
            }
        : {
            title: "",
            description: "",
            ownerId: currentUser?.id || users[0]?.id || "",
            status: isPrivileged ? InitiativeStatus.NOTSTARTED : InitiativeStatus.PROPOSED,
            func: FUNCTIONS_ENUM.OPERATIONS,
            confidential: false,
            health: null,
            healthNote: "",
            milestones: [],
            financials: emptyFinancials(),
            activity: [
                {
                userId: currentUser?.id,
                action: isPrivileged
                    ? "Created initiative"
                    : "Proposed initiative",
                timestamp: new Date().toISOString(),
                },
            ],
            },
    );
    const [newMs, setNewMs] = useState({ title: "", dueDate: "", assignees: [] });
    const [showFin, setShowFin] = useState(
        initiative
        ? initiative.financials?.initialCost > 0 ||
            initiative.financials?.annualizedImpact > 0
        : false,
    );
    const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const updFin = (k, v) =>
        setForm((f) => ({ ...f, financials: { ...f.financials, [k]: v } }));
    const addMs = () => {
        if (!newMs.title.trim()) return;
        upd("milestones", [
        ...form.milestones,
        {
            id: generateId(),
            title: newMs.title.trim(),
            done: false,
            dueDate: newMs.dueDate,
            assignees: newMs.assignees,
        },
        ]);
        setNewMs({ title: "", dueDate: "", assignees: [] });
    };
    const toggleMsAssignee = (msId, userId) => {
        upd(
        "milestones",
        form.milestones.map((m) =>
            m.id !== msId
            ? m
            : {
                ...m,
                assignees: (m.assignees || []).includes(userId)
                    ? (m.assignees || []).filter((id) => id !== userId)
                    : [...(m.assignees || []), userId],
                },
        ),
        );
    };
    const [expandedMs, setExpandedMs] = useState(null);
    const L =
        "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";
    const I =
        "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-red-500 bg-white";
    const fin = form.financials;
    return (
        <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
            {initiative ? "Edit Initiative" : "New Initiative"}
            </h2>
            <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1"
            >
            <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
                />
            </svg>
            </button>
        </div>
        {!isPrivileged && !initiative && (
            <div className="mb-5 p-3 bg-violet-50 text-violet-700 text-sm rounded-lg">
            New initiatives are submitted as{" "}
            <span className="font-semibold">Proposed</span> and go to an admin or
            executive for approval before work begins.
            </div>
        )}
        {form.rejectionReason && (
            <div className="mb-5 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            <span className="font-semibold">Rejected:</span>{" "}
            {form.rejectionReason}. Update and re-save to resubmit for approval.
            </div>
        )}
        <div className="space-y-5">
            <div>
            <label className={L}>
                Initiative Title
                <InfoTip text={HELP.title} />
            </label>
            <input
                type="text"
                value={form.title}
                onChange={(e) => upd("title", e.target.value)}
                placeholder="e.g., Central Procurement Platform"
                className={I}
            />
            </div>
            <div>
            <label className={L}>
                Description — what and why
                <InfoTip text={HELP.description} />
            </label>
            <textarea
                value={form.description}
                onChange={(e) => upd("description", e.target.value)}
                rows={3}
                placeholder="What is this initiative and why does it matter?"
                className={I + " resize-none"}
            />
            </div>
            <div className="grid grid-cols-3 gap-4">
            <div>
                <label className={L}>
                Owner
                <InfoTip text={HELP.owner} />
                </label>
                <select
                value={form.ownerId}
                onChange={(e) => upd("ownerId", e.target.value)}
                className={I}
                >
                {users.map((u) => (
                    <option key={u.id} value={u.id}>
                    {u.name}
                    </option>
                ))}
                </select>
            </div>
            <div>
                <label className={L}>
                Function
                <InfoTip text={HELP.func} />
                </label>
                <select
                value={form.func}
                onChange={(e) => upd("func", e.target.value)}
                className={I}
                >
                {FUNCTIONS.map((f) => (
                    <option key={f}>{f}</option>
                ))}
                </select>
            </div>
            <div>
                <label className={L}>
                Status
                <InfoTip text={HELP.status} />
                </label>
                <select
                value={form.status}
                onChange={(e) => upd("status", e.target.value)}
                disabled={!isPrivileged && form.status === "Proposed"}
                className={
                    I +
                    (!isPrivileged && form.status === "Proposed"
                    ? " opacity-60 cursor-not-allowed"
                    : "")
                }
                >
                {STATUS_LIST.map((s) => (
                    <option key={s}>{s}</option>
                ))}
                </select>
                {!isPrivileged && form.status === "Proposed" && (
                <p className="text-xs text-gray-400 mt-1">
                    Locked until an admin or executive approves.
                </p>
                )}
            </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className={L}>
                Health / RAG
                <InfoTip text={HELP.health} />
                </label>
                <div className="flex gap-2">
                {HEALTH_LIST.map((h) => {
                    const c = HEALTH_CONFIG[h];
                    return (
                    <button
                        key={h}
                        type="button"
                        onClick={() => upd("health", form.health === h ? null : h)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${form.health === h ? c.color + " border-transparent" : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50"}`}
                    >
                        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                        {h}
                    </button>
                    );
                })}
                </div>
            </div>
            <div className="flex items-end">
                <label className="flex items-center gap-2.5 px-3 py-2.5 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 w-full">
                <input
                    type="checkbox"
                    checked={!!form.confidential}
                    onChange={(e) => upd("confidential", e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700 font-medium">
                    Confidential
                    <InfoTip text={HELP.confidential} />
                </span>
                </label>
            </div>
            </div>
            {form.health && (
            <div>
                <label className={L}>Health Note</label>
                <input
                type="text"
                value={form.healthNote || ""}
                onChange={(e) => upd("healthNote", e.target.value)}
                placeholder="Why is this initiative at this status? What's the risk or blocker?"
                className={I}
                />
            </div>
            )}
            <div className="border-t border-gray-100 pt-5">
            <button
                onClick={() => setShowFin(!showFin)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-red-600 mb-4"
            >
                <svg
                className={`w-4 h-4 transition-transform ${showFin ? "rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                />
                </svg>
                Financial Details
                {!showFin && fin.initialCost > 0 && (
                <span className="text-xs font-normal text-gray-400 ml-2">
                    {fmtDollar(fin.initialCost, true)} cost ·{" "}
                    {fmtDollar(fin.annualizedImpact, true)} impact
                </span>
                )}
            </button>
            {showFin && (
                <div className="space-y-4 pl-1">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                    <label className={L}>
                        Initial Cost
                        <InfoTip text={HELP.initialCost} />
                    </label>
                    <DollarInput
                        value={fin.initialCost}
                        onChange={(v) => updFin("initialCost", v)}
                    />
                    </div>
                    <div>
                    <label className={L}>
                        Annualized Impact
                        <InfoTip text={HELP.annualizedImpact} />
                    </label>
                    <DollarInput
                        value={fin.annualizedImpact}
                        onChange={(v) => updFin("annualizedImpact", v)}
                    />
                    </div>
                    <div>
                    <label className={L}>
                        Impact Type
                        <InfoTip text={HELP.impactType} />
                    </label>
                    <select
                        value={fin.impactType}
                        onChange={(e) => updFin("impactType", e.target.value)}
                        className={I}
                    >
                        <option value="savings">Cost Savings</option>
                        <option value="revenue">Revenue Growth</option>
                        <option value="avoidance">Cost Avoidance</option>
                        <option value="other">Other</option>
                    </select>
                    </div>
                </div>
                {fin.annualizedImpact > 0 && fin.initialCost > 0 && (
                    <div className="bg-gray-50 rounded-lg px-4 py-2.5 flex items-center gap-6 text-sm">
                    <span className="text-gray-500">
                        ROI:{" "}
                        <span className="font-bold text-gray-900">
                        {Math.round(
                            ((fin.annualizedImpact - fin.initialCost) /
                            fin.initialCost) *
                            100,
                        )}
                        %
                        </span>
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500">
                        Net:{" "}
                        <span className="font-bold text-gray-900">
                        {fmtDollar(fin.annualizedImpact - fin.initialCost, true)}
                        </span>
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500">
                        Payback:{" "}
                        <span className="font-bold text-gray-900">
                        {(fin.initialCost / (fin.annualizedImpact / 12)).toFixed(
                            1,
                        )}{" "}
                        mo
                        </span>
                    </span>
                    </div>
                )}
                <div>
                    <label className={L}>
                    Monthly Value Delivery
                    <InfoTip text={HELP.monthlyBreakdown} />
                    </label>
                    <p className="text-xs text-gray-400 mb-3">
                    Map out how value ramps over time month by month.
                    </p>
                    <MonthlyBreakdownEditor
                    breakdown={fin.monthlyBreakdown}
                    onChange={(rows) => updFin("monthlyBreakdown", rows)}
                    />
                </div>
                </div>
            )}
            </div>
            <div className="border-t border-gray-100 pt-5">
            <label className={L}>
                Milestones
                <InfoTip text={HELP.milestones} />
            </label>
            <div className="bg-gray-50 rounded-xl p-4">
                {form.milestones.length > 0 && (
                <div className="space-y-2 mb-4">
                    {form.milestones.map((m) => {
                    const msAssignees = (m.assignees || [])
                        .map((id) => users.find((u) => u.id === id))
                        .filter(Boolean);
                    return (
                        <div
                        key={m.id}
                        className="bg-white rounded-lg border border-gray-100"
                        >
                        <div className="flex items-center gap-3 px-3 py-2">
                            <button
                            onClick={() =>
                                upd(
                                "milestones",
                                form.milestones.map((x) =>
                                    x.id === m.id ? { ...x, done: !x.done } : x,
                                ),
                                )
                            }
                            className="shrink-0"
                            >
                            {m.done ? (
                                <svg
                                className="w-5 h-5 text-emerald-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                                </svg>
                            ) : (
                                <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                            )}
                            </button>
                            <span
                            className={`flex-1 text-sm ${m.done ? "text-gray-400 line-through" : "text-gray-700"}`}
                            >
                            {m.title}
                            </span>
                            {msAssignees.length > 0 && (
                            <div className="flex -space-x-1.5">
                                {msAssignees.map((u) => (
                                <div key={u.id} title={u.name}>
                                    <Avatar
                                    name={u.name}
                                    size="w-5 h-5 text-xs ring-2 ring-white"
                                    />
                                </div>
                                ))}
                            </div>
                            )}
                            <button
                            onClick={() =>
                                setExpandedMs(expandedMs === m.id ? null : m.id)
                            }
                            className={`text-xs px-1.5 py-0.5 rounded transition-colors ${expandedMs === m.id ? "bg-red-100 text-red-600" : "text-gray-400 hover:text-red-500"}`}
                            title="Tag people"
                            >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                            </button>
                            {m.dueDate && (
                            <span className="text-xs text-gray-400">
                                {formatDate(m.dueDate)}
                            </span>
                            )}
                            <button
                            onClick={() =>
                                upd(
                                "milestones",
                                form.milestones.filter((x) => x.id !== m.id),
                                )
                            }
                            className="text-gray-300 hover:text-red-400 shrink-0"
                            >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                            </button>
                        </div>
                        {expandedMs === m.id && (
                            <div className="px-3 pb-2 pt-1 border-t border-gray-50">
                            <p className="text-xs text-gray-500 mb-1.5">
                                Tag people whose support is needed:
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {users.map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => toggleMsAssignee(m.id, u.id)}
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all ${(m.assignees || []).includes(u.id) ? "bg-red-100 text-red-700 font-medium" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                                >
                                    <Avatar name={u.name} size="w-4 h-4 text-xs" />
                                    {u.name.split(" ")[0]}
                                </button>
                                ))}
                            </div>
                            </div>
                        )}
                        </div>
                    );
                    })}
                </div>
                )}
                <div className="space-y-2">
                <div className="flex gap-2">
                    <input
                    type="text"
                    placeholder="Add a milestone..."
                    value={newMs.title}
                    onChange={(e) =>
                        setNewMs((s) => ({ ...s, title: e.target.value }))
                    }
                    onKeyDown={(e) => e.key === "Enter" && addMs()}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                    />
                    <input
                    type="date"
                    value={newMs.dueDate}
                    onChange={(e) =>
                        setNewMs((s) => ({ ...s, dueDate: e.target.value }))
                    }
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                    />
                    <button
                    onClick={addMs}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                    >
                    Add
                    </button>
                </div>
                {newMs.title.trim() && (
                    <div className="px-1">
                    <p className="text-xs text-gray-400 mb-1">
                        Tag people (optional):
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {users.map((u) => (
                        <button
                            key={u.id}
                            onClick={() =>
                            setNewMs((s) => ({
                                ...s,
                                assignees: s.assignees.includes(u.id)
                                ? s.assignees.filter((id) => id !== u.id)
                                : [...s.assignees, u.id],
                            }))
                            }
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all ${newMs.assignees.includes(u.id) ? "bg-red-100 text-red-700 font-medium" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                        >
                            <Avatar name={u.name} size="w-4 h-4 text-xs" />
                            {u.name.split(" ")[0]}
                        </button>
                        ))}
                    </div>
                    </div>
                )}
                </div>
            </div>
            </div>
            <div className="border-t border-gray-100 pt-5">
            <label className={L}>
                Attachments
                <InfoTip text="Upload supporting documents like business cases, spreadsheets, vendor proposals, or project plans. Files are stored as references and can be viewed by anyone with access to the initiative." />
            </label>
            <div className="bg-gray-50 rounded-xl p-4">
                {(form.attachments || []).length > 0 && (
                <div className="space-y-2 mb-4">
                    {(form.attachments || []).map((att) => (
                    <div
                        key={att.id}
                        className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-gray-100"
                    >
                        <svg
                        className="w-5 h-5 text-gray-400 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                        />
                        </svg>
                        <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-700 truncate">
                            {att.name}
                        </div>
                        <div className="text-xs text-gray-400">{att.size}</div>
                        </div>
                        <button
                        onClick={() =>
                            upd(
                            "attachments",
                            (form.attachments || []).filter(
                                (a) => a.id !== att.id,
                            ),
                            )
                        }
                        className="text-gray-300 hover:text-red-400 shrink-0"
                        >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                        </button>
                    </div>
                    ))}
                </div>
                )}
                <label className="flex items-center gap-2 px-3 py-2 bg-white border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-red-400 hover:text-red-600 cursor-pointer transition-colors">
                <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                    />
                </svg>
                Add file
                <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const newAtts = files.map((f) => ({
                        id: generateId(),
                        name: f.name,
                        size:
                        f.size > 1048576
                            ? (f.size / 1048576).toFixed(1) + "MB"
                            : Math.round(f.size / 1024) + "KB",
                        type: f.type,
                        addedAt: new Date().toISOString(),
                    }));
                    upd("attachments", [...(form.attachments || []), ...newAtts]);
                    e.target.value = "";
                    }}
                />
                </label>
            </div>
            </div>
            <div className="flex gap-3 pt-2">
            <button
                onClick={() => {
                if (form.title.trim()) onSave(form);
                }}
                disabled={!form.title.trim()}
                className="flex-1 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {initiative ? "Save Changes" : "Create Initiative"}
            </button>
            <button
                onClick={onCancel}
                className="px-6 py-2.5 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 text-gray-600"
            >
                Cancel
            </button>
            </div>
        </div>
        </div>
    );
}