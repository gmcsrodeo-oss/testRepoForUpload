import { HealthStatus } from "@/enums/status";
import { UserRoles } from "@/enums/userRole";
import { FunctionBadge, StatusBadge, HealthBadge, ConfidentialBadge } from "../badge";
import Avatar from "../avatar";
import { fmtDollar } from "../tooltip";
import { formatDate, relativeTime } from '../../utils/datetime-utils';
import { emptyFinancials } from './../../utils/finantial-utils';
import { ResponsiveContainer, BarChart, Bar, Cell, Tooltip } from 'recharts';
import { DollarTooltip } from "../tooltip";

// Can this user edit this initiative (change fields, health, milestones)?
function canEditInit(user, init) {
  if (!user) return false;
  if (user.appRole === UserRoles.ADMIN || user.appRole === UserRoles.EXECUTIVE) return true;
  return init.ownerId === user.id;
}

function MonthlyChart({ breakdown, impactType }) {
    if (!breakdown || breakdown.length === 0) return null;
    const color = impactType === "revenue" ? "#38bdf8" : "#34d399";
    const total = breakdown.reduce((s, m) => s + m.value, 0);
    return (
        <div>
        <ResponsiveContainer width="100%" height={120}>
            <BarChart
            data={breakdown}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
            <Tooltip content={<DollarTooltip />} />
            <Bar dataKey="value" radius={[3, 3, 0, 0]} name="Value">
                {breakdown.map((_, i) => (
                <Cell key={i} fill={color} />
                ))}
            </Bar>
            </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-1 mt-1">
            {breakdown.map((m, i) => (
            <div
                key={i}
                className="flex-1 text-center text-xs text-gray-400 truncate"
            >
                {m.month.split(" ")[0]}
            </div>
            ))}
        </div>
        <div className="text-right mt-2 text-xs text-gray-500">
            Total projected:{" "}
            <span className="font-semibold text-gray-700">
            {fmtDollar(total, true)}
            </span>
        </div>
        </div>
    );
}

export default function InitiativeDetail({initiative, users, currentUser, onBack, onEdit, onToggleMilestone}) 
{
    console.log(initiative);
    const owner = users.find((u) => u.id === initiative.ownerId);
    const doneMs = initiative.milestones.filter((m) => m.done).length;
    const totalMs = initiative.milestones.length;
    const fin = initiative.financials || emptyFinancials();
    const hasFin = fin.initialCost > 0 || fin.annualizedImpact > 0;
    const netImpact = fin.annualizedImpact - fin.initialCost;
    const roi =
        fin.initialCost > 0
        ? Math.round(
            ((fin.annualizedImpact - fin.initialCost) / fin.initialCost) * 100,
            )
        : null;
    const impLabels = {
        savings: "Cost Savings",
        revenue: "Revenue Growth",
        avoidance: "Cost Avoidance",
        other: "Other",
    };
    const canEdit = canEditInit(currentUser, initiative);
    return (
        <div className="max-w-2xl mx-auto">
        <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 -ml-1"
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
                d="M15 19l-7-7 7-7"
            />
            </svg>
            Back
        </button>
        {initiative.rejectionReason && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            <span className="font-semibold">Rejected:</span>{" "}
            {initiative.rejectionReason}
            </div>
        )}
        <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3 flex-wrap">
            <FunctionBadge func={initiative.func} />
            <StatusBadge status={initiative.status} />
            <HealthBadge health={initiative.health} />
            {initiative.confidential && <ConfidentialBadge />}
            </div>
            {canEdit && (
            <button
                onClick={() => onEdit(initiative)}
                className="px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg shrink-0"
            >
                Edit
            </button>
            )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {initiative.title}
        </h1>
        <p className="text-gray-600 leading-relaxed mb-6">
            {initiative.description}
        </p>
        {initiative.health === HealthStatus.RED || initiative.health === HealthStatus.AMBER ? (
            <div
            className={`mb-6 p-3 rounded-lg text-sm ${initiative.health === "Red" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}
            >
            <span className="font-semibold">{initiative.health} status:</span>{" "}
            {initiative.healthNote || "No note provided."}
            </div>
        ) : null}
        <div
            className={`grid ${hasFin ? "grid-cols-4" : "grid-cols-3"} gap-4 mb-6`}
        >
            <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Owner
            </div>
            <div className="flex items-center gap-2">
                {owner && <Avatar name={owner.name} size="w-6 h-6 text-xs" />}
                <div>
                <div className="text-sm font-medium text-gray-900">
                    {owner?.name || "Unassigned"}
                </div>
                <div className="text-xs text-gray-400">{owner?.role}</div>
                </div>
            </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Function
            </div>
            <FunctionBadge func={initiative.func} />
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Status
            </div>
            <StatusBadge status={initiative.status} />
            </div>
            {hasFin && (
            <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Net Impact
                </div>
                <div
                className={`text-lg font-bold ${netImpact >= 0 ? "text-emerald-600" : "text-red-600"}`}
                >
                {netImpact >= 0 ? "+" : ""}
                {fmtDollar(netImpact, true)}
                </div>
                {roi != null && (
                <div className="text-xs text-gray-400">{roi}% ROI</div>
                )}
            </div>
            )}
        </div>
        {hasFin && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Financial Summary
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-5">
                <div>
                <div className="text-xs text-gray-400 mb-1">Initial Cost</div>
                <div className="text-lg font-bold text-gray-900">
                    {fmtDollar(fin.initialCost, true)}
                </div>
                </div>
                <div>
                <div className="text-xs text-gray-400 mb-1">
                    Annualized Impact
                </div>
                <div className="text-lg font-bold text-emerald-600">
                    {fmtDollar(fin.annualizedImpact, true)}
                </div>
                </div>
                <div>
                <div className="text-xs text-gray-400 mb-1">Impact Type</div>
                <div className="text-sm font-medium text-gray-700 mt-1">
                    {impLabels[fin.impactType] || fin.impactType}
                </div>
                </div>
            </div>
            {fin.monthlyBreakdown?.length > 0 && (
                <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Monthly Value Delivery
                </div>
                <MonthlyChart
                    breakdown={fin.monthlyBreakdown}
                    impactType={fin.impactType}
                />
                </div>
            )}
            </div>
        )}
        <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Milestones
            {totalMs > 0 && (
                <span className="text-gray-400 font-normal ml-2">
                {doneMs} of {totalMs}
                </span>
            )}
            </h3>
            {totalMs === 0 ? (
            <p className="text-sm text-gray-400 italic">No milestones yet.</p>
            ) : (
            <div className="space-y-1">
                {initiative.milestones.map((m) => {
                const msAssignees = (m.assignees || [])
                    .map((id) => users.find((u) => u.id === id))
                    .filter(Boolean);
                const isMine = (m.assignees || []).includes(currentUser?.id);
                return (
                    <div
                    key={m.id}
                    className={`p-3 rounded-lg hover:bg-gray-50 transition-colors group ${isMine && !m.done ? "bg-amber-50/60" : ""}`}
                    >
                    <div className="flex items-center gap-3">
                        <button
                        onClick={() => onToggleMilestone(initiative.id, m.id)}
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
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full group-hover:border-red-400" />
                        )}
                        </button>
                        <span
                        className={`flex-1 text-sm ${m.done ? "text-gray-400 line-through" : "text-gray-700"}`}
                        >
                        {m.title}
                        {isMine && !m.done && (
                            <span className="ml-1.5 text-[10px] font-semibold text-amber-600 uppercase tracking-wide">
                            You
                            </span>
                        )}
                        </span>
                        {msAssignees.length > 0 && (
                        <div className="flex -space-x-1.5">
                            {msAssignees.map((u) => (
                            <div key={u.id} title={u.name + " — support needed"}>
                                <Avatar
                                name={u.name}
                                size="w-5 h-5 text-xs ring-2 ring-white"
                                />
                            </div>
                            ))}
                        </div>
                        )}
                        {m.dueDate && (
                        <span
                            className={`text-xs shrink-0 ${m.done ? "text-gray-300" : new Date(m.dueDate) < new Date() ? "text-red-500 font-medium" : "text-gray-400"}`}
                        >
                            {formatDate(m.dueDate)}
                        </span>
                        )}
                    </div>
                    {msAssignees.length > 0 && !m.done && (
                        <div className="ml-8 mt-1.5 flex items-center gap-1.5">
                        <svg
                            className="w-3.5 h-3.5 text-amber-500 shrink-0"
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
                        <span className="text-xs text-amber-600">
                            Needs support from{" "}
                            {msAssignees
                            .map((u) => u.name.split(" ")[0])
                            .join(", ")}
                        </span>
                        </div>
                    )}
                    </div>
                );
                })}
            </div>
            )}
        </div>
        {(initiative.attachments || []).length > 0 && (
            <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Attachments
                <span className="text-gray-400 font-normal ml-2">
                {initiative.attachments.length}
                </span>
            </h3>
            <div className="space-y-1.5">
                {initiative.attachments.map((att) => (
                <div
                    key={att.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
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
                    <div className="text-sm text-gray-700">{att.name}</div>
                    <div className="text-xs text-gray-400">
                        {att.size} · Added {formatDate(att.addedAt)}
                    </div>
                    </div>
                </div>
                ))}
            </div>
            </div>
        )}
        {(initiative.activity || []).length > 0 && (
            <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Activity</h3>
            <div className="space-y-2.5">
                {[...initiative.activity].reverse().map((a, i) => {
                const u = users.find((x) => x.id === a.userId);
                return (
                    <div key={i} className="flex items-center gap-3 text-sm">
                    <Avatar name={u?.name || "?"} size="w-6 h-6 text-xs" />
                    <span className="text-gray-700">{u?.name || "Unknown"}</span>
                    <span className="text-gray-400">{a.action}</span>
                    <span className="text-xs text-gray-300 ml-auto shrink-0">
                        {relativeTime(a.timestamp)}
                    </span>
                    </div>
                );
                })}
            </div>
            </div>
        )}
        <div className="text-xs text-gray-300 pt-4 border-t border-gray-100">
            Created {formatDate(initiative.createdAt)} · Updated{" "}
            {relativeTime(initiative.updatedAt)}
        </div>
        </div>
    );
}