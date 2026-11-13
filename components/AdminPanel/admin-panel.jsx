import { UserRoles } from "@/enums/userRole";
import { useState } from "react";
import Avatar from "../avatar";
import { FUNCTIONS, ROLE_CONFIG } from '@/constants/constants';
import { RoleBadge } from "../badge";

export default function AdminPanel({users, currentUser, onUpdateUser, onInviteUser, onRemoveUser}) 
{
    const [showInvite, setShowInvite] = useState(false);
    const [inv, setInv] = useState({
        name: "",
        email: "",
        role: "",
        appRole: UserRoles.MEMBER,
        functions: [],
    });
    const isAdmin = currentUser.appRole === UserRoles.ADMIN;

    const toggleFunc = (userId, func) => {
        const u = users.find((x) => x.id === userId);
        if (!u) return;
        const fns = u.functions || [];
        const updated = fns.includes(func)
        ? fns.filter((f) => f !== func)
        : [...fns, func];
        onUpdateUser(userId, { functions: updated });
    };
    const changeRole = (userId, newRole) => {
        const updates = { appRole: newRole };
        if (newRole === UserRoles.ADMIN || newRole === UserRoles.EXECUTIVE)
        updates.functions = FUNCTIONS;
        onUpdateUser(userId, updates);
    };
    const handleInvite = () => {
        if (!inv.name.trim() || !inv.email.trim()) return;
        onInviteUser({
        id: generateId(),
        name: inv.name.trim(),
        email: inv.email.toLowerCase().trim(),
        role: inv.role.trim() || "Team Member",
        appRole: inv.appRole,
        functions:
            inv.appRole === UserRoles.ADMIN || inv.appRole === UserRoles.EXECUTIVE
            ? FUNCTIONS
            : inv.functions,
        });
        setInv({ name: "", email: "", role: "", appRole: UserRoles.MEMBER, functions: [] });
        setShowInvite(false);
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
            onClick={() => setShowInvite(!showInvite)}
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
            Invite User
            </button>
        </div>

        {showInvite && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Invite New User
            </h3>
            <div className="grid grid-cols-4 gap-3 mb-3">
                <input
                type="text"
                placeholder="Full name"
                value={inv.name}
                onChange={(e) => setInv((s) => ({ ...s, name: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                type="email"
                placeholder="email@rodeodental.com"
                value={inv.email}
                onChange={(e) => setInv((s) => ({ ...s, email: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                type="text"
                placeholder="Job title"
                value={inv.role}
                onChange={(e) => setInv((s) => ({ ...s, role: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <select
                value={inv.appRole}
                onChange={(e) =>
                    setInv((s) => ({ ...s, appRole: e.target.value }))
                }
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                >
                <option value="member">Member</option>
                <option value="executive">Executive</option>
                <option value="admin">Admin</option>
                </select>
            </div>
            {inv.appRole === "member" && (
                <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">
                    Function visibility (member can see initiatives in these
                    functions):
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {FUNCTIONS.map((f) => (
                    <button
                        key={f}
                        onClick={() =>
                        setInv((s) => ({
                            ...s,
                            functions: s.functions.includes(f)
                            ? s.functions.filter((x) => x !== f)
                            : [...s.functions, f],
                        }))
                        }
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${inv.functions.includes(f) ? "bg-red-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                    >
                        {f}
                    </button>
                    ))}
                </div>
                </div>
            )}
            <div className="flex gap-2">
                <button
                onClick={handleInvite}
                disabled={!inv.name.trim() || !inv.email.trim()}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-40"
                >
                Send Invite
                </button>
                <button
                onClick={() => setShowInvite(false)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                Cancel
                </button>
            </div>
            </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-400 uppercase tracking-wide">
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
                    <div className="text-xs text-gray-400">{u.email}</div>
                </div>
                </div>
                <div className="col-span-2">
                <select
                    value={u.appRole}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    disabled={u.id === currentUser.id}
                    className="text-xs px-2 py-1 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                    <option value="member">Member</option>
                    <option value="executive">Executive</option>
                    <option value="admin">Admin</option>
                </select>
                </div>
                <div className="col-span-6">
                {u.appRole === "admin" || u.appRole === "executive" ? (
                    <span className="text-xs text-gray-400 italic">
                    All functions (via {u.appRole} role)
                    </span>
                ) : (
                    <div className="flex flex-wrap gap-1">
                    {FUNCTIONS.map((f) => (
                        <button
                        key={f}
                        onClick={() => toggleFunc(u.id, f)}
                        className={`px-2 py-0.5 text-xs rounded-full transition-all ${(u.functions || []).includes(f) ? "bg-red-100 text-red-700 font-medium" : "bg-gray-50 text-gray-300 hover:bg-gray-100 hover:text-gray-500"}`}
                        >
                        {f}
                        </button>
                    ))}
                    </div>
                )}
                </div>
                <div className="col-span-1 text-right">
                {u.id !== currentUser.id && (
                    <button
                    onClick={() => onRemoveUser(u.id)}
                    className="text-xs text-gray-300 hover:text-red-500"
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