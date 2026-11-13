import { useState, useMemo } from "react";
import { fmtDollar } from './../tooltip';
import { StatusBadge, FunctionBadge } from './../badge';
import Avatar from './../avatar';
import { STATUS_LIST, FUNCTIONS, HEALTH_CONFIG } from './../../constants/constants';

export function InitiativesList({initiatives,users,currentUser,onSelect,onCreate,}) 
{
    const [statusFilter, setStatusFilter] = useState("all");
    const [funcFilter, setFuncFilter] = useState("all");
    const [ownerFilter, setOwnerFilter] = useState("all");
    const [sort, setSort] = useState("updated");
    const [groupByFunc, setGroupByFunc] = useState(false);
    const filtered = useMemo(() => 
    {
        let list = [...initiatives];
        if (statusFilter !== "all")
        list = list.filter((i) => i.status === statusFilter);
        if (funcFilter !== "all") list = list.filter((i) => i.func === funcFilter);
        if (ownerFilter === "mine")
        list = list.filter((i) => i.ownerId === currentUser?.id);
        list.sort((a, b) => {
        if (sort === "updated")
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        if (sort === "impact")
            return (
            (b.financials?.annualizedImpact || 0) -
            (a.financials?.annualizedImpact || 0)
            );
        if (sort === "function")
            return FUNCTIONS.indexOf(a.func) - FUNCTIONS.indexOf(b.func);
        return 0;
        });
        return list;
    }, [initiatives, statusFilter, funcFilter, ownerFilter, sort, currentUser]);
    const grouped = useMemo(() => {
        if (!groupByFunc) return null;
        const g = {};
        filtered.forEach((i) => {
        const k = i.func || "Other";
        if (!g[k]) g[k] = [];
        g[k].push(i);
        });
        return FUNCTIONS.filter((f) => g[f]).map((f) => ({ func: f, items: g[f] }));
    }, [filtered, groupByFunc]);
    const statusCounts = useMemo(() => {
        const c = { all: initiatives.length };
        initiatives.forEach((i) => {
        c[i.status] = (c[i.status] || 0) + 1;
        });
        return c;
    }, [initiatives]);
    const funcCounts = useMemo(() => {
        const c = {};
        initiatives.forEach((i) => {
        c[i.func] = (c[i.func] || 0) + 1;
        });
        return c;
    }, [initiatives]);
    const totalCost = filtered.reduce(
        (s, i) => s + (i.financials?.initialCost || 0),
        0,
    );
    const totalImpact = filtered.reduce(
        (s, i) => s + (i.financials?.annualizedImpact || 0),
        0,
    );
    const totalNet = totalImpact - totalCost;

    const renderCard = (init) => {
        const owner = users.find((u) => u.id === init.ownerId);
        const fin = init.financials || {};
        const hasFin =
        (fin.initialCost || 0) > 0 || (fin.annualizedImpact || 0) > 0;
        const net = (fin.annualizedImpact || 0) - (fin.initialCost || 0);
        const roiPct =
        (fin.initialCost || 0) > 0
            ? Math.round(
                ((fin.annualizedImpact - fin.initialCost) / fin.initialCost) * 100,
            )
            : null;
        return (
        <button
            key={init.id}
            onClick={() => onSelect(init)}
            className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all group"
        >
            <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <FunctionBadge func={init.func} />
                {init.health && (
                    <span
                    className={`w-2 h-2 rounded-full ${HEALTH_CONFIG[init.health].dot}`}
                    title={init.health + " status"}
                    />
                )}
                {init.confidential && (
                    <svg
                    className="w-3.5 h-3.5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    title="Confidential"
                    >
                    <path
                        fillRule="evenodd"
                        d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                        clipRule="evenodd"
                    />
                    </svg>
                )}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors mb-1">
                {init.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                {owner && <Avatar name={owner.name} size="w-5 h-5 text-xs" />}
                <span className="text-xs text-gray-500">{owner?.name}</span>
                </div>
            </div>
            <div className="shrink-0 text-right flex items-center gap-6">
                <div className="w-32">
                {hasFin ? (
                    <div>
                    <div
                        className={`text-lg font-bold ${net >= 0 ? "text-emerald-600" : "text-red-600"}`}
                    >
                        {net >= 0 ? "+" : ""}
                        {fmtDollar(net, true)}
                    </div>
                    <div className="text-xs text-gray-400">
                        {roiPct != null ? roiPct + "% ROI" : "net impact"}
                    </div>
                    </div>
                ) : (
                    <div className="text-xs text-gray-300 italic">
                    No financials
                    </div>
                )}
                </div>
                <div className="w-28">
                <StatusBadge status={init.status} />
                </div>
            </div>
            </div>
        </button>
        );
    };

    return (
        <div>
        <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1">
                Status
                </span>
                {["all", ...STATUS_LIST].map((s) => (
                <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${statusFilter === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                    {s === "all" ? "All" : s}
                    {statusCounts[s] ? (
                    <span className="ml-1 opacity-60">{statusCounts[s]}</span>
                    ) : null}
                </button>
                ))}
            </div>
            <button
                onClick={onCreate}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
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
                    d="M12 4v16m8-8H4"
                />
                </svg>
                New
            </button>
            </div>
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1">
                Function
                </span>
                <button
                onClick={() => setFuncFilter("all")}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${funcFilter === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                All
                </button>
                {FUNCTIONS.map((f) => {
                const c = funcCounts[f] || 0;
                if (!c) return null;
                return (
                    <button
                    key={f}
                    onClick={() => setFuncFilter(funcFilter === f ? "all" : f)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${funcFilter === f ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                    >
                    {f}
                    <span className="ml-1 opacity-60">{c}</span>
                    </button>
                );
                })}
                <span className="text-gray-200 mx-1">|</span>
                <button
                onClick={() =>
                    setOwnerFilter(ownerFilter === "mine" ? "all" : "mine")
                }
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${ownerFilter === "mine" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                <span className="flex items-center gap-1.5">
                    {currentUser && (
                    <Avatar name={currentUser.name} size="w-4 h-4 text-xs" />
                    )}
                    My Initiatives
                </span>
                </button>
            </div>
            <div className="flex items-center gap-3">
                <button
                onClick={() => setGroupByFunc(!groupByFunc)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${groupByFunc ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                </svg>
                Group
                </button>
                <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-xs bg-transparent text-gray-500 border-0 focus:outline-none cursor-pointer"
                >
                <option value="updated">Recently updated</option>
                <option value="impact">By $ impact</option>
                <option value="function">By function</option>
                </select>
            </div>
            </div>
        </div>
        {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No initiatives match these filters.</p>
            {(statusFilter !== "all" ||
                funcFilter !== "all" ||
                ownerFilter !== "all") && (
                <button
                onClick={() => {
                    setStatusFilter("all");
                    setFuncFilter("all");
                    setOwnerFilter("all");
                }}
                className="mt-2 text-sm text-red-600 hover:underline"
                >
                Clear filters
                </button>
            )}
            </div>
        ) : groupByFunc && grouped ? (
            <div className="space-y-6">
            {grouped.map(({ func, items }) => {
                const gI = items.reduce(
                (s, i) => s + (i.financials?.annualizedImpact || 0),
                0,
                );
                const gC = items.reduce(
                (s, i) => s + (i.financials?.initialCost || 0),
                0,
                );
                return (
                <div key={func}>
                    <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2.5">
                        <FunctionBadge func={func} />
                        <span className="text-sm text-gray-400">
                        {items.length} initiative{items.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>
                        Cost:{" "}
                        <span className="font-semibold text-gray-600">
                            {fmtDollar(gC, true)}
                        </span>
                        </span>
                        <span>
                        Impact:{" "}
                        <span className="font-semibold text-emerald-600">
                            {fmtDollar(gI, true)}
                        </span>
                        </span>
                    </div>
                    </div>
                    <div className="space-y-2">{items.map(renderCard)}</div>
                </div>
                );
            })}
            </div>
        ) : (
            <div className="space-y-2">{filtered.map(renderCard)}</div>
        )}
        </div>
    );
}