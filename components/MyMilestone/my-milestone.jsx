"use client";

import { useMemo } from "react";
import { FUNCTION_COLORS, STATUS_CONFIG } from "@/constants/constants";

export default function MyMilestone({
    milestones = [],
    error = "",
    loading = false,
    onSelectInitiative,
}) {
    const safeMilestones = Array.isArray(milestones) ? milestones : [];

    const sortedMilestones = useMemo(() => {
        const today = new Date();

        return safeMilestones
            .map((milestone) => {
                const dueDate = milestone.dueDate
                    ? new Date(
                        `${String(milestone.dueDate).slice(0, 10)}T00:00:00`
                    )
                    : null;

                const overdue =
                    !milestone.done &&
                    dueDate !== null &&
                    !Number.isNaN(dueDate.getTime()) &&
                    dueDate < today;

                return {
                    ...milestone,
                    initId: milestone.initId ?? milestone.initiativeId,
                    initTitle:
                        milestone.initTitle ??
                        milestone.initiativeTitle ??
                        milestone.initiative?.title,
                    func:
                        milestone.func ??
                        milestone.initiativeFunc ??
                        milestone.initiative?.func,
                    status:
                        milestone.status ??
                        milestone.initiativeStatus ??
                        milestone.initiative?.status,
                    confidential:
                        milestone.confidential ??
                        milestone.initiativeConfidential ??
                        milestone.initiative?.confidential ??
                        false,
                    overdue,
                };
            })
            .sort((a, b) => {
                if (Boolean(a.done) !== Boolean(b.done)) {
                    return a.done ? 1 : -1;
                }

                if (a.overdue !== b.overdue) {
                    return a.overdue ? -1 : 1;
                }

                return (
                    new Date(a.dueDate || "9999-12-31") -
                    new Date(b.dueDate || "9999-12-31")
                );
            });
    }, [safeMilestones]);

    const openMilestones = sortedMilestones.filter(
        (milestone) => !milestone.done
    );

    const completedMilestones = sortedMilestones.filter(
        (milestone) => milestone.done
    );

    function StatusBadge({ status }) {
        if (!status) return null;

        const config = STATUS_CONFIG[status];
        const hex = config?.hex || "#9ca3af";

        return (
            <span
                style={{
                    backgroundColor: `${hex}20`,
                    color: hex,
                }}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium"
            >
                <span
                    style={{ backgroundColor: hex }}
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                />
                {status}
            </span>
        );
    }

    function FunctionBadge({ func }) {
        if (!func) return null;

        const config = FUNCTION_COLORS[func];

        console.log("Function badge debug:", {
            func,
            config,
        });

        if (!config) {
            return (
                <span className="inline-flex items-center whitespace-nowrap rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700">
                    {func}
                </span>
            );
        }
        return (
            <span
                style={{
                    backgroundColor: config.hex + "20",
                    color: config.hex,
                }}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium"
            >
                <span
                    style={{ backgroundColor: config.hex }}
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                />
                {func}
            </span>
        );
    }

    function ConfidentialBadge({ size = "text-xs" }) {
        return (
            <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-900 text-white ${size} font-medium`}
            >
                <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 0 0-6 0V9h6Z"
                        clipRule="evenodd"
                    />
                </svg>
                Confidential
            </span>
        );
    }

    function formatDate(date) {
        if (!date) return "No date";

        const parsedDate = new Date(
            `${String(date).slice(0, 10)}T00:00:00`
        );

        if (Number.isNaN(parsedDate.getTime())) {
            return "No date";
        }

        return parsedDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    function handleSelectInitiative(milestone) {
        if (milestone.initId && onSelectInitiative) {
            onSelectInitiative(milestone.initId);
        }
    }

    function renderOpenMilestone(ms) {
        return (
            <button
                key={ms.id}
                type="button"
                onClick={() => handleSelectInitiative(ms)}
                disabled={!ms.initId}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border text-left transition-colors ${ms.overdue
                    ? "border-red-200 bg-red-50/40 hover:bg-red-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                    } ${ms.initId ? "cursor-pointer" : "cursor-default"}`}
            >
                <div
                    className={`w-2 h-2 rounded-full shrink-0 ${ms.overdue ? "bg-red-500" : "bg-gray-300"
                        }`}
                />

                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                        {ms.title}
                    </div>

                    <div className="text-xs text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
                        {ms.initTitle || "Initiative"}

                        {ms.confidential && (
                            <ConfidentialBadge size="text-[10px]" />
                        )}
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <FunctionBadge func={ms.func} />
                    <StatusBadge status={ms.status} />
                </div>

                <span
                    className={`text-xs font-medium shrink-0 ${ms.overdue ? "text-red-600" : "text-gray-500"
                        }`}
                >
                    {ms.overdue ? "Overdue · " : ""}
                    {formatDate(ms.dueDate)}
                </span>
            </button>
        );
    }

    function renderCompletedMilestone(ms) {
        return (
            <button
                key={ms.id}
                type="button"
                onClick={() => handleSelectInitiative(ms)}
                disabled={!ms.initId}
                className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-left hover:bg-gray-50 transition-colors opacity-60 disabled:cursor-default"
            >
                <svg
                    className="w-4 h-4 text-emerald-500 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                    />
                </svg>

                <div className="flex-1 min-w-0 text-sm text-gray-500 truncate">
                    {ms.title}
                    <span className="text-gray-300">
                        {" — "}{ms.initTitle || "Initiative"}
                    </span>
                </div>
            </button>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    My Milestones
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                    Every milestone across every initiative where
                    you&apos;re tagged, regardless of function.
                </p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div
                        className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"
                        role="status"
                        aria-label="Loading milestones"
                    />
                    <p className="mt-4 text-sm text-gray-500">
                        Loading milestones...
                    </p>
                </div>
            ) : error ? (
                <div
                    role="alert"
                    className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3"
                >
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            ) : (
                <>
                    {openMilestones.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <p className="text-lg">
                                Nothing tagged to you right now.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2 mb-8">
                            {openMilestones.map(renderOpenMilestone)}
                        </div>
                    )}

                    {completedMilestones.length > 0 && (
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                                Completed ({completedMilestones.length})
                            </h3>

                            <div className="space-y-1.5">
                                {completedMilestones.map(
                                    renderCompletedMilestone
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}