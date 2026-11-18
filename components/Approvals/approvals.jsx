"use client";

import { useState } from "react";
import { InitiativeStatus } from "@/enums/status";
import { FUNCTION_COLORS } from "@/constants/constants";
import Avatar from "./../avatar";

export default function Approvals({
    initiatives = [],
    users = [],
    currentUser,
    onApprove,
    onReject,
    onSelect,
}) {
    const [rejectingId, setRejectingId] = useState(null);
    const [reason, setReason] = useState("");

    // Only proposed initiatives should appear in the approval queue.
    const safeInitiatives = Array.isArray(initiatives) ? initiatives : [];
    const safeUsers = Array.isArray(users) ? users : [];

    const pending = safeInitiatives.filter(
        (initiative) => initiative.status === InitiativeStatus.PROPOSED
    );

    const submitReject = async (initiativeId) => {
        if (!reason.trim()) return;

        const success = await onReject(initiativeId, reason.trim());

        if (success) {
            setRejectingId(null);
            setReason("");
        }
    };

    const relativeTime = (dateValue) => {
        if (!dateValue) return "";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) return "";

        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

        if (seconds < 60) return "just now";
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

        return date.toLocaleDateString();
    };

    const fmtDollar = (value) => {
        const amount = Number(value) || 0;

        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            notation: amount >= 1000000 ? "compact" : "standard",
            maximumFractionDigits: 1,
        }).format(amount);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>

                <p className="text-sm text-gray-500 mt-1">
                    Proposed initiatives waiting for admin or executive sign-off.
                </p>
            </div>

            {pending.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-lg">
                        Nothing pending. You're all caught up.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {pending.map((init) => {
                        const owner = safeUsers.find(
                            (user) => user.id === init.ownerId
                        );

                        const financials = init.financials || {};
                        const rejecting = rejectingId === init.id;

                        const functionName =
                            typeof init.func === "string" ? init.func.trim() : "";

                        const functionColor = FUNCTION_COLORS[functionName];

                        console.log("Function:", JSON.stringify(init.func));
                        console.log("Normalized function:", functionName);
                        console.log("Matched color:", functionColor);

                        return (
                            <div
                                key={init.id}
                                className="bg-white border border-gray-200 rounded-xl p-4"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">

                                            <span
                                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium"
                                                style={
                                                    functionColor
                                                        ? {
                                                            backgroundColor: `${functionColor.hex}1A`,
                                                            color: functionColor.hex,
                                                        }
                                                        : {
                                                            backgroundColor: "#f3f4f6",
                                                            color: "#374151",
                                                        }
                                                }
                                            >
                                                <span
                                                    className="inline-block w-2 h-2 rounded-full"
                                                    style={{
                                                        backgroundColor: functionColor?.hex || "#9ca3af",
                                                    }}
                                                />
                                                {functionName || "Unassigned"}
                                            </span>


                                            {init.confidential && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700">
                                                    Confidential
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => onSelect?.(init)}
                                            className="font-semibold text-gray-900 hover:text-red-600 text-left"
                                        >
                                            {init.title}
                                        </button>

                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                            {init.description}
                                        </p>

                                        <div className="flex items-center gap-2 mt-2">
                                            {/* <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-medium">
                                                {(owner?.name || "U").charAt(0).toUpperCase()}
                                            </div> */}
                                            <Avatar
                                                name={owner?.name || "Unknown"}
                                                size="w-5 h-5 text-[10px]"
                                            />

                                            <span className="text-xs text-gray-500">
                                                Proposed by {owner?.name || "Unknown"}
                                            </span>

                                            {init.createdAt && (
                                                <span className="text-xs text-gray-300">
                                                    {init.createdAt &&
                                                        `· ${new Date(init.createdAt).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        })}`}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        {(Number(financials.initialCost) > 0 ||
                                            Number(financials.annualizedImpact) > 0) && (
                                                <div className="text-xs text-gray-400 mb-2">
                                                    {fmtDollar(financials.initialCost)} cost ·{" "}
                                                    {fmtDollar(financials.annualizedImpact)} impact
                                                </div>
                                            )}

                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => onApprove(init.id)}
                                                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700"
                                            >
                                                Approve
                                            </button>

                                            <button
                                                onClick={() =>
                                                    setRejectingId(rejectingId === init.id ? null : init.id)
                                                }
                                                className="px-3 py-1.5 bg-white border border-gray-200 text-xs font-medium rounded-lg hover:bg-gray-50 text-gray-600"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {rejecting && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                                        <input
                                            type="text"
                                            autoFocus
                                            value={reason}
                                            onChange={(event) => setReason(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    submitReject(init.id);
                                                }
                                            }}
                                            placeholder="Reason for rejection (visible to the proposer)"
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => submitReject(init.id)}
                                            disabled={!reason.trim()}
                                            className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-40"
                                        >
                                            Send
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
