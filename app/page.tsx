"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LoginScreen from "./../components/loginScreen/loginScreen";
import ExecutiveSummary from "./../components/dashboard/dashboard";
import { LOGO_SRC } from "@/constants/constants";
import Avatar from "./../components/avatar";
import HelpPage from "./../components/help/helpPage";
import { UserRoles } from './../enums/userRole';
import AdminPanel from './../components/AdminPanel/admin-panel';

export default function Home() {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("summary");
    const [initiatives, setInitiatives] = useState(null);
    const [users, setUsers] = useState([]);

    const handleLogout = async () => {
        setCurrentUser(null);
        // setView("summary");
        // setSelectedInit(null);
        // await saveData("session", null);
    };

    const handleUpdateUser = async () => {

    }

    const handleInviteUser = async () => {

    }

    const handleRemoveUser = async () => {
        
    }

    async function loadUser() {
        try {
        const supabase = createClient();

        // Get the currently authenticated Google user
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setCurrentUser(null);
            return;
        }

        // Call your GET /api/users/[userId]
        const userDetails = await fetch(`/api/users/${user.id}`);

        const userResult = await userDetails.json();

        if (!userDetails.ok || !userResult.success) {
            console.error(userResult.message);
            setCurrentUser(null);
            return;
        } else {
            setCurrentUser(userResult.userData.data);
        }
        return userResult.userData.data;
        } catch (error) {
        console.error(error);
        setCurrentUser(null);
        } finally {
        setLoading(false);
        }
    }

    async function loadIniatitives(user) {
        try {
        if (user != undefined) {
            setLoading(true);
            const response = await fetch(`/api/initiative`);
            const result = await response.json();
            if (result != null) {
            setInitiatives(result.initiatives.data);
            }
        } else {
            console.log("Current user is null");
        }
        } catch (error) {
        console.log(error);
        setInitiatives(null);
        setLoading(false);
        } finally {
        setLoading(false);
        }
    }

    async function loadUsers() {
        try 
        {
        setLoading(true);
        const response = await fetch(`/api/users`);
        const result = await response.json();

        if (result != null) {
            setUsers(result.data);
        }
        } 
        catch (error) 
        {
        console.log(error);
        setUsers([]);
        setLoading(false);
        } 
        finally 
        {
        setLoading(false);
        }
    }

    useEffect(() => {
        async function getAllDetails() 
        {
        const user = await loadUser();
        if (user) 
        {
            await loadIniatitives(user);
        }
        await loadUsers();
        }

        getAllDetails();
    }, []);

    if (loading) 
    {
        return <div>Loading...</div>;
    }

    if (!currentUser) {
        return <LoginScreen />;
    }

    const isAdmin = currentUser.appRole === UserRoles.ADMIN;
    const isPrivileged = currentUser.appRole === UserRoles.ADMIN || currentUser.appRole === UserRoles.EXECUTIVE;
    const pendingCount = isPrivileged ? initiatives.filter((i) => i.status === "Proposed").length : 0;

    const navItems = [
        { key: "summary", label: "Summary" },
        { key: "initiatives", label: "Initiatives" },
        {
        key: "mymilestones",
        label: "My Milestones" /*badge: myMilestoneBadge */,
        },
    ];
    if (isPrivileged)
        navItems.push({
        key: "approvals",
        label: "Approvals",
        badge: pendingCount,
        });

    navItems.push({ key: "help", label: "Help" });
    
    if(isAdmin)
    {
        navItems.push({ key: "admin", label: "Admin" });
    } 
        
    return (
        <div className="min-h-screen bg-gray-50">
        <div className="h-1 bg-gradient-to-r from-red-600 via-amber-400 to-red-600" />
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
            <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2.5">
                <img
                    src={LOGO_SRC}
                    alt="RD"
                    className="w-9 h-9 rounded-lg shadow-sm"
                />
                <div>
                    <button
                    onClick={() => {
                        setView("summary");
                        //setEditingInit(null);
                    }}
                    className="text-base font-bold text-gray-900 hover:text-red-600 transition-colors leading-tight block"
                    >
                    Initiative Tracker
                    </button>
                    <span className="text-xs text-gray-400 leading-tight">
                    Rodeo Dental & Orthodontics
                    </span>
                </div>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                {navItems.map((t) => (
                    <button
                    key={t.key}
                    onClick={() => {
                        setView(t.key);
                        //setSelectedInit(null);
                        //setEditingInit(null);
                    }}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${view === t.key || (t.key === "initiatives" && (view === "detail" || view === "create" || view === "edit")) ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                    >
                    {t.key === "admin" ? (
                        <span className="flex items-center gap-1">
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
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        {t.label}
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5">
                        {t.label}
                        {!!t.badge && (
                            <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full leading-none">
                            {t.badge}
                            </span>
                        )}
                        </span>
                    )}
                    </button>
                ))}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5">
                <Avatar name={currentUser.name} size="w-8 h-8 text-xs" />
                <div className="text-right">
                    <span className="text-sm font-medium text-gray-700 block leading-tight">
                    {currentUser.name.split(" ")[0]}
                    </span>
                    <span className="text-xs text-gray-400 leading-tight capitalize">
                    {currentUser.appRole === UserRoles.ADMIN
                        ? "Admin"
                        : currentUser.appRole === UserRoles.EXECUTIVE
                        ? "Executive"
                        : "Member"}
                    </span>
                </div>
                </div>
                <div className="w-px h-6 bg-gray-200" />
                <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                Sign out
                </button>
            </div>
            </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-8">
            {view === "summary" && (
            <ExecutiveSummary
                initiatives={initiatives}
                users={users}
                currentUser={currentUser}
                onSelectInitiative={null}
                hiddenCount={undefined}
            />
            )}
            {/* {view === "initiatives" && (
            <InitiativesList
                initiatives={visibleInits}
                users={users}
                currentUser={currentUser}
                onSelect={selectInit}
                onCreate={() => {
                setEditingInit(null);
                setView("create");
                }}
            />
            )}
            {view === "mymilestones" && (
            <MyMilestonesView
                initiatives={visibleInits}
                users={users}
                currentUser={currentUser}
                onSelect={selectInit}
            />
            )}
            {view === "approvals" && isPrivileged && (
            <ApprovalsQueue
                initiatives={initiatives}
                users={users}
                currentUser={currentUser}
                onApprove={handleApprove}
                onReject={handleReject}
                onSelect={selectInit}
            />
            )*/}
            {view === "help" && <HelpPage />}
            {view === "admin" && (
            <AdminPanel
                users={users}
                currentUser={currentUser}
                onUpdateUser={handleUpdateUser}
                onInviteUser={handleInviteUser}
                onRemoveUser={handleRemoveUser}
            />
            )}
            {/*view === "detail" && selectedInit && (
            <InitiativeDetail
                initiative={selectedInit}
                users={users}
                currentUser={currentUser}
                onBack={() => setView(returnView)}
                onEdit={(i) => {
                setEditingInit(i);
                setView("edit");
                }}
                onToggleMilestone={handleToggleMs}
            />
            )}
            {(view === "create" || view === "edit") && (
            <InitiativeForm
                initiative={view === "edit" ? editingInit : null}
                users={users}
                currentUser={currentUser}
                onSave={handleSave}
                onCancel={() => {
                if (editingInit && selectedInit) setView("detail");
                else setView("initiatives");
                setEditingInit(null);
                }}
            />
            )} */}
        </main>
        </div>
    );
    }
