"use client";
import { UserRoles } from "@/enums/userRole";
import { useState } from "react";
import Avatar from "../avatar";
import { FUNCTIONS, ROLE_CONFIG } from '@/constants/constants';
import { RoleBadge } from "../badge";

export default function AdminPanel({users, currentUser, onUpdateUser, onInviteUser, onRemoveUser})
{
    const [showInvite, setShowInvite] = useState(false);
    const [sendingInvite, setSendingInvite] = useState(false);
    const [inviteMessage, setInviteMessage] = useState("");
    const [inviteError, setInviteError] = useState("");
    const [inv, setInv] = useState({
        name: "",
        email: "",
        role: "",
        appRole: UserRoles.MEMBER,
        functions: [],
    });
    const isAdmin = currentUser.appRole === UserRoles.ADMIN;

    const toggleFunc = async (userId, func) => {
        const u = users.find((x) => x.id === userId);
        if (!u || u.appRole === UserRoles.ADMIN || u.appRole === UserRoles.EXECUTIVE) return;

        const currentFunctions = Array.isArray(u.functions) ? u.functions : [];
        const isCurrentlyAssigned = currentFunctions.some(
            (assigned) => String(assigned).trim().toLowerCase() === String(func).trim().toLowerCase()
        );
        const updated = isCurrentlyAssigned
            ? currentFunctions.filter((assigned) => String(assigned).trim().toLowerCase() !== String(func).trim().toLowerCase())
            : [...currentFunctions, func];

        // onUpdateUser persists the complete updated list to Supabase. The
        // other function buttons retain their own independent assigned state.
        await onUpdateUser(userId, { functions: updated });
    };
    const changeRole = async (userId, newRole) => {
        const updates = { appRole: newRole };
        if (newRole === UserRoles.ADMIN || newRole === UserRoles.EXECUTIVE) {
            updates.functions = FUNCTIONS;
        }
        await onUpdateUser(userId, updates);
    };
    const handleSendInviteClick = async () => {
        if (!inv.name.trim() || !inv.email.trim() || sendingInvite) return;
        setSendingInvite(true);
        setInviteMessage("");
        setInviteError("");
        try {
            await onInviteUser({
                name: inv.name.trim(),
                email: inv.email.trim().toLowerCase(),
                role: inv.role.trim() || "Team Member",
                appRole: inv.appRole,
                functions: inv.appRole === UserRoles.ADMIN || inv.appRole === UserRoles.EXECUTIVE
                    ? FUNCTIONS
                    : inv.functions,
            });
            setInviteMessage(`Invitation email sent to ${inv.email.trim()}.`);
            setInv({ name: "", email: "", role: "", appRole: UserRoles.MEMBER, functions: [] });
            setShowInvite(false);
        } catch (error) {
            setInviteError(error?.message || "Unable to send invitation.");
        } finally {
            setSendingInvite(false);
        }
    };
    if (!isAdmin)
        return (
        <div className="max-w-3xl mx-auto text-center py-16">
            <p className="text-gray-400 text-lg">
            Only admins can manage users and permissions.
            </p>
        </div>
        );

    return (
        <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage team access and initiative visibility
                </p>
            </div>
            <button
                type="button"
                onClick={() => setShowInvite((visible) => !visible)}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Invite User
            </button>
        </div>

        {inviteMessage && <p role="status" className="mb-3 text-sm text-green-700">{inviteMessage}</p>}
        {inviteError && <p role="alert" className="mb-3 text-sm text-red-700">{inviteError}</p>}
        {showInvite && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Invite New User</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
                    <input
                        type="text"
                        placeholder="Full name"
                        value={inv.name}
                        onChange={(e) => setInv((state) => ({ ...state, name: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <input
                        type="email"
                        placeholder="Email address"
                        value={inv.email}
                        onChange={(e) => setInv((state) => ({ ...state, email: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <input
                        type="text"
                        placeholder="Job title"
                        value={inv.role}
                        onChange={(e) => setInv((state) => ({ ...state, role: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <select
                        value={inv.appRole}
                        onChange={(e) => setInv((state) => ({ ...state, appRole: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                    >
                        <option value="member">Member</option>
                        <option value="executive">Executive</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                {inv.appRole === UserRoles.MEMBER && (
                    <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-2">Function visibility (the functions this member can access):</p>
                        <div className="flex flex-wrap gap-1.5">
                            {FUNCTIONS.map((func) => {
                                const selected = inv.functions.includes(func);
                                return (
                                    <button
                                        type="button"
                                        key={func}
                                        onClick={() => setInv((state) => ({
                                            ...state,
                                            functions: selected
                                                ? state.functions.filter((item) => item !== func)
                                                : [...state.functions, func],
                                        }))}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${selected ? "bg-red-100 text-red-700 border-red-200" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}
                                    >
                                        {func}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleSendInviteClick}
                        disabled={!inv.name.trim() || !inv.email.trim() || sendingInvite}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-40"
                    >
                        {sendingInvite ? "Sending..." : "Send Invite"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowInvite(false)}
                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-black uppercase tracking-wide">
            <div className="col-span-3">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-6">Function Access</div>
            <div className="col-span-1"></div>
            </div>
            {users.map((u) => (
            <div
                key={u.id}
                className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-gray-100 last:border-0 items-center"
            >
                <div className="col-span-3 flex items-center gap-3">
                <Avatar name={u.name} size="w-8 h-8 text-xs" />
                <div>
                    <div className="text-sm font-medium text-gray-900">
                    {u.name}
                    </div>
                    <div className="text-xs text-black">{u.email}</div>
                </div>
                </div>
                <div className="col-span-2">
                <select
                    value={String(u.appRole || UserRoles.MEMBER).toLowerCase()}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    disabled={u.id === currentUser.id}
                    className="text-xs text-black px-2 py-1 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-100"
                >
                    <option value="member">Member</option>
                    <option value="executive">Executive</option>
                    <option value="admin">Admin</option>
                </select>
                </div>
                <div className="col-span-6">
                {u.appRole === "admin" || u.appRole === "executive" ? (
                    <span className="text-xs text-black italic">
                    All functions (via {u.appRole} role)
                    </span>
                ) : (
                    <div className="flex flex-wrap gap-1">
                    {FUNCTIONS.map((f) => {
                        const assignedFunctions = Array.isArray(u.functions) ? u.functions : [];
                        const isAssigned = assignedFunctions.some(
                            (assigned) => String(assigned).trim().toLowerCase() === String(f).trim().toLowerCase()
                        );
                        return (
                            <button
                                key={f}
                                onClick={() => toggleFunc(u.id, f)}
                                aria-pressed={isAssigned}
                                title={isAssigned ? "Assigned to this user" : "Not assigned to this user"}
                                className={`px-2 py-0.5 text-xs rounded-full border transition-all ${
                                    isAssigned
                                        ? "bg-red-100 text-red-700 border-red-200 font-medium"
                                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                }`}
                            >
                                {f}
                            </button>
                        );
                    })}
                    </div>
                )}
                </div>
                <div className="col-span-1 text-right">
                {u.id !== currentUser.id && (
                    <button
                    onClick={() => onRemoveUser(u.id)}
                    className="text-xs text-black hover:text-red-600"
                    >
                    Remove
                    </button>
                )}
                </div>
            </div>
            ))}
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-amber-800 mb-2">
            Role Reference
            </h3>
            <div className="space-y-1.5">
            {Object.entries(ROLE_CONFIG).map(([k, v]) => (
                <div key={k} className="flex items-start gap-2">
                <RoleBadge role={k} />
                <span className="text-xs text-amber-700">{v.desc}</span>
                </div>
            ))}
            </div>
        </div>
        </div>
    );
}