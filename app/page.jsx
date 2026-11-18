"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import LoginScreen from "./../components/loginScreen/loginScreen";
import ExecutiveSummary from "./../components/dashboard/dashboard";
import { LOGO_SRC } from "@/constants/constants";
import Avatar from "./../components/avatar";
import HelpPage from "./../components/help/helpPage";
import { UserRoles } from './../enums/userRole';
import AdminPanel from './../components/AdminPanel/admin-panel';
import { useRouter } from "next/navigation";
import { InitiativesList } from './../components/InitiativeList/initiative-list';
import { InitiativeStatus } from "@/enums/status";
import InitiativeDetail from "./../components/InitiativeDetail/initiative-detail";
import MyMilestone from "./../components/MyMilestone/my-milestone";
import InitiativeForm from './../components/InitiativeForm/initiative-form';
import { logActivity, getActivityLogsByInitiative } from "./../repositories/activityRepository";
import Approvals from "./../components/Approvals/approvals";

export default function Home() {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("summary");
    const [initiatives, setInitiatives] = useState([]);
    const [users, setUsers] = useState([]);
    const [editingInit, setEditingInit] = useState(null);
    const [returnView, setReturnView] = useState("initiatives");
    const [selectedInit, setSelectedInit] = useState(null);
    const [myMilestones, setMyMilestones] = useState([]);
    const [milestoneLoading, setMilestoneLoading] = useState(false);
    const [milestoneError, setMilestoneError] = useState("");
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const supabase = createClient();

            const { error } = await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            setCurrentUser(null);
            setInitiatives([]);

            router.refresh();
        }
        catch (error) {
            console.log("Sign-Out Failed:", error);
        }
        setCurrentUser(null);
        // setView("summary");
        // setSelectedInit(null);
        // await saveData("session", null);
    };

    const handleUpdateUser = async (userId, updates) => {
        try {
            const response = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to update user.");
            }
            const updated = result.updatedUser?.data || result.updatedUser?.updatedUser?.data || result.updatedUser;
            const normalizedUpdated = {
                ...(updated || updates),
                ...(updated?.appRole ? { appRole: String(updated.appRole).toLowerCase() } : {}),
                ...(Array.isArray(updated?.functions) ? { functions: updated.functions } : {}),
            };
            setUsers((previous) => previous.map((user) =>
                user.id === userId ? { ...user, ...normalizedUpdated } : user
            ));
            if (currentUser?.id === userId) {
                setCurrentUser((previous) => ({ ...previous, ...normalizedUpdated }));
            }
            return normalizedUpdated;
        } catch (error) {
            console.error("Update user failed:", error);
            window.alert(error.message || "Unable to update user.");
            throw error;
        }
    };

    const handleInviteUser = async (userData) => {
        const response = await fetch("/api/users/invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to send invitation.");
        }
        const created = result.data;
        setUsers((previous) => [...previous, {
            ...created,
            appRole: String(created.appRole || "member").toLowerCase(),
            functions: Array.isArray(created.functions) ? created.functions : [],
        }]);
        return created;
    };

    const handleRemoveUser = async (userId) => {
        if (!window.confirm("Remove this user from Initiative Tracker?")) return;
        try {
            const response = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
                method: "DELETE",
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to remove user.");
            }
            setUsers((previous) => previous.filter((user) => user.id !== userId));
        } catch (error) {
            console.error("Remove user failed:", error);
            window.alert(error.message || "Unable to remove user.");
        }
    };

    const handleToggleMs = async (initiativeId, milestoneId) => {
        if (!currentUser?.id) {
            console.error("Current user not found.");
            return;
        }

        const initiative =
            initiatives?.find((item) => item.id === initiativeId) ||
            (selectedInit?.id === initiativeId ? selectedInit : null);

        const milestone = initiative?.milestones?.find(
            (item) => item.id === milestoneId
        );

        if (!milestone) {
            console.error("Milestone not found.");
            return;
        }

        const newDoneStatus = !milestone.done;

        try {
            const response = await fetch(`/api/milestones/${milestoneId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    done: newDoneStatus,
                    userId: currentUser.id,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                if (response.status === 403) {
                    alert("You cannot edit this milestone.");
                    return;
                }

                throw new Error(
                    result.message || "Unable to update milestone status."
                );
            }

            // Update the initiative list using the API response.
            setInitiatives((previous) =>
                (previous || []).map((item) =>
                    item.id !== initiativeId
                        ? item
                        : {
                            ...item,
                            milestones: (item.milestones || []).map((ms) =>
                                ms.id === milestoneId
                                    ? { ...ms, done: result.data.done }
                                    : ms
                            ),
                        }
                )
            );

            // Keep the selected initiative details in sync.
            setSelectedInit((previous) =>
                !previous || previous.id !== initiativeId
                    ? previous
                    : {
                        ...previous,
                        milestones: (previous.milestones || []).map((ms) =>
                            ms.id === milestoneId
                                ? { ...ms, done: result.data.done }
                                : ms
                        ),
                    }
            );
            // Refresh My Milestones after updating the status.
            await loadMyMilestones(currentUser.id);

        } catch (error) {
            console.error("Error updating milestone:", error);
        }
    };

    const handleSave = async (form) => {
        const now = new Date().toISOString();

        try {
            let response;
            let result;

            const isPrivilegedUser =
                currentUser?.appRole === UserRoles.ADMIN ||
                currentUser?.appRole === UserRoles.EXECUTIVE;

            // Check whether this initiative was previously rejected.
            const wasRejected =
                editingInit?.status === InitiativeStatus.PROPOSED &&
                !!editingInit?.rejectionReason;

            const resubmitted = !!editingInit && wasRejected;

            // Members must always submit initiatives as Proposed.
            // Admins and Executives can select the status.
            const finalStatus =
                !editingInit && !isPrivilegedUser
                    ? InitiativeStatus.PROPOSED
                    : form.status;

            // Prepare initiative data.
            const initiativeData = {
                title: form.title,
                description: form.description,
                ownerId: form.ownerId,
                func: form.func,
                status: finalStatus,
                confidential: form.confidential,
                health: form.health,
                healthNote: form.healthNote,
                financials: form.financials,

                // Clear rejection reason when resubmitting or
                // when the initiative moves away from Proposed.
                rejectionReason:
                    resubmitted || finalStatus !== InitiativeStatus.PROPOSED
                        ? null
                        : editingInit?.rejectionReason ?? null,

                isDeleted: false,
            };

            if (editingInit) {
                // Update existing initiative
                response = await fetch(`/api/initiative/${editingInit.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...initiativeData,
                        id: editingInit.id,
                        updatedAt: now,
                    }),
                });
            } else {
                // Create new initiative
                response = await fetch("/api/initiative", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...initiativeData,
                        createdAt: now,
                        updatedAt: now,
                    }),
                });
            }

            result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to save initiative");
            }

            const initiativeId = result.initiative.data.id;

            const activity = {
                initiativeId,
                userId: currentUser.id,
                action: editingInit
                    ? resubmitted
                        ? "Resubmitted after rejection"
                        : "Edited Initiative"
                    : isPrivilegedUser
                        ? "Created initiative"
                        : "Proposed initiative",
                timestamp: now,
            };

            await logActivity(activity);

            const existingMilestones = (
                editingInit?.milestones || []
            ).filter((milestone) => !milestone.isDeleted);

            const existingMilestoneMap = new Map(
                existingMilestones.map((milestone) => [
                    milestone.id,
                    milestone,
                ])
            );

            const formMilestones = form.milestones || [];

            // IDs of milestones still present in the form.
            const currentMilestoneIds = new Set(
                formMilestones
                    .filter((milestone) => milestone.id)
                    .map((milestone) => milestone.id)
            );


            // Include existing milestones that remain in the form.
            const duplicateKeys = new Set();

            for (const milestone of existingMilestones) {
                if (!currentMilestoneIds.has(milestone.id)) {
                    continue;
                }

                const key = `${(milestone.title || "")
                    .trim()
                    .toLowerCase()}|${milestone.dueDate || ""}`;

                duplicateKeys.add(key);
            }


            for (const milestone of formMilestones) {
                const assignees = [
                    ...new Set(
                        Array.isArray(milestone.assignees)
                            ? milestone.assignees
                            : []
                    ),
                ];

                //if (milestone.id) {
                if (
                    milestone.id &&
                    existingMilestoneMap.has(milestone.id)
                ) {
                    const existingMilestone =
                        existingMilestoneMap.get(milestone.id);

                    if (!existingMilestone) {
                        throw new Error(
                            `Milestone "${milestone.title}" was not found in the original initiative.`
                        );
                    }

                    // Compare old and new assignees.
                    const oldAssignees = [
                        ...(existingMilestone.assignees || []),
                    ].sort();

                    const newAssignees = [...assignees].sort();

                    const assigneesChanged =
                        JSON.stringify(oldAssignees) !==
                        JSON.stringify(newAssignees);

                    const doneChanged =
                        (existingMilestone.done ?? false) !==
                        (milestone.done ?? false);

                    // No changes required for this milestone.
                    if (!assigneesChanged && !doneChanged) {
                        continue;
                    }

                    const milestoneData = {
                        done: milestone.done ?? false,
                        assignees,
                        userId: currentUser.id,
                    };

                    const milestoneResponse = await fetch(
                        `/api/milestones/${milestone.id}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(milestoneData),
                        }
                    );

                    const milestoneResult =
                        await milestoneResponse.json();

                    if (
                        !milestoneResponse.ok ||
                        !milestoneResult.success
                    ) {
                        throw new Error(
                            milestoneResult.message ||
                            `Failed to update milestone "${milestone.title}".`
                        );
                    }

                    continue;
                }

                const title = (milestone.title || "").trim();
                const dueDate = milestone.dueDate || null;

                if (!title) {
                    throw new Error(
                        "Milestone title cannot be empty."
                    );
                }

                const duplicateKey =
                    `${title.toLowerCase()}|${dueDate || ""}`;

                if (duplicateKeys.has(duplicateKey)) {
                    throw new Error(
                        `Duplicate milestone "${title}" with the same due date is not allowed.`
                    );
                }

                duplicateKeys.add(duplicateKey);

                const milestoneData = {
                    title,
                    done: milestone.done ?? false,
                    dueDate,
                    assignees,
                    initiativeId,
                    isDeleted: false,
                };

                const milestoneResponse = await fetch(
                    `/api/initiative/${initiativeId}/milestones`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(milestoneData),
                    }
                );

                        const milestoneResult = await milestoneResponse.json();

                if (
                    !milestoneResponse.ok ||
                    !milestoneResult.success
                ) {
                    throw new Error(
                        milestoneResult.message ||
                        `Failed to create milestone "${title}".`
                    );
                }
            }

            // --------------------------------------------------
            // 6. SOFT-DELETE REMOVED MILESTONES
            // --------------------------------------------------

            if (editingInit) {
                for (const milestone of existingMilestones) {
                    // If the original milestone is no longer in
                    // the form, mark it as deleted.
                    if (!currentMilestoneIds.has(milestone.id)) {
                        const deleteResponse = await fetch(
                            `/api/initiative/${initiativeId}/milestones/${milestone.id}?userId=${encodeURIComponent(currentUser.id)}`,
                            {
                                method: "DELETE",
                            }
                        );

                        const deleteResult =
                            await deleteResponse.json();

                        const deleteSucceeded =
                            deleteResponse.ok &&
                            (
                                deleteResult.success === true ||
                                !!deleteResult.deletedMilestone
                            );

                        if (!deleteSucceeded) {
                            throw new Error(
                                deleteResult.message ||
                                deleteResult.error ||
                                `Failed to delete milestone "${milestone.title}".`
                            );
                        }
                    }
                }
            }

            //  REFRESH MY MILESTONES
            await loadMyMilestones(currentUser.id);

            // REFRESH INITIATIVES
            await loadInitiatives(currentUser);

            // FETCH UPDATED INITIATIVE DETAILS
            const init = await fetch(
                `/api/initiative/${initiativeId}`
            );

            const detailResult = await init.json();

            if (!init.ok || !detailResult.success) {
                throw new Error(
                    detailResult.message || "Failed to load initiative details"
                );
            }

            const updatedInitiative =
                detailResult.initiative?.data?.[0];

            if (!updatedInitiative) {
                throw new Error(
                    "Updated initiative details were not returned."
                );
            }

            // UPDATE SELECTED INITIATIVE AND NAVIGATE
            setSelectedInit(updatedInitiative);

            setEditingInit(null);
            setView("detail");
            
        } catch (error) {
            console.error("Error saving initiative:", error);
            //alert(error.message);
        }
    }

     const selectInit = async (init) => {
    const obj =
        typeof init === "string"
            ? initiatives.find((i) => i.id === init)
            : init;

    if (!obj) return;

    setReturnView(view);
    setSelectedInit({
        ...obj,
        activity: [],
    });
    setView("detail");

    try {
        const activities = await getActivityLogsByInitiative(obj.id);

        setSelectedInit((previous) =>
            previous?.id === obj.id
                ? {
                    ...previous,
                    activity: activities,
                }
                : previous
        );
    } catch (error) {
        console.error("Error fetching activity logs:", error);
    }
    };

    const visibleInits = useMemo(
        () => initiatives.filter((i) => canSeeInit(currentUser, i)),
        [initiatives, currentUser],
    );

    function isMilestoneAssignee(user, init) {
        if (!user) return false;
        return (init.milestones || []).some((m) =>
            (m.assignees || []).includes(user.id),
        );
    }

    function canSeeInit(user, init) {
        if (!user) {
            return false;
        }
        if (isMilestoneAssignee(user, init)) {
            return true; // being tagged on a milestone is an explicit grant of visibility
        }
        if (init.confidential) {
            // Confidential: owner + admins + executives only, regardless of function match.
            return (
                init.ownerId === user.id ||
                user.appRole === UserRoles.ADMIN ||
                user.appRole === UserRoles.EXECUTIVE
            );
        }
        if (user.appRole === UserRoles.ADMIN || user.appRole === UserRoles.EXECUTIVE) {
            return true;
        }
        if (init.ownerId === user.id) {
            return true;
        }
        return (user.functions || []).includes(init.func);
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
                const profile = {
                    ...userResult.userData.data,
                    appRole: String(userResult.userData.data.appRole || "member").toLowerCase(),
                    functions: Array.isArray(userResult.userData.data.functions)
                        ? userResult.userData.data.functions
                        : [],
                };
                setCurrentUser(profile);
                return profile;
            }
        } catch (error) {
            console.error(error);
            setCurrentUser(null);
        } finally {
            setLoading(false);
        }
    }

    async function loadInitiatives(user) {
        try {
            if (user != undefined) {
                setLoading(true);
                let response;
                if(user.appRole === UserRoles.MEMBER)
                {
                    response = await fetch(`/api/initiative?userId=${user.id}`);
                }
                else{
                    response = await fetch(`/api/initiative`);
                }
                
                const result = await response.json();
                console.log(result);
                if (result != null) {
                    setInitiatives(result.initiatives);
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
        try {
            setLoading(true);
            const response = await fetch(`/api/users`);
            const result = await response.json();

            if (result != null) {
                setUsers((result.data || []).map((user) => ({
                    ...user,
                    appRole: String(user.appRole || "member").toLowerCase(),
                    functions: Array.isArray(user.functions) ? user.functions : [],
                })));
            }
        }
        catch (error) {
            console.log(error);
            setUsers([]);
            setLoading(false);
        }
        finally {
            setLoading(false);
        }
    }

    const loadMyMilestones = async (userId) => {
        if (!userId) return;

        setMilestoneLoading(true);
        setMilestoneError("");

        try {
            const response = await fetch(
                `/api/milestones?userId=${encodeURIComponent(userId)}`
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    result.error ||
                    "Failed to load milestones."
                );
            }

            setMyMilestones(
                Array.isArray(result.milestones)
                    ? result.milestones
                    : []
            );
        } catch (error) {
            console.error("Failed to load milestones:", error);
            setMilestoneError(error.message);
        } finally {
            setMilestoneLoading(false);
        }
    };

    const myMilestoneBadge = useMemo(() => {
        if (!currentUser?.id) return 0;

        const cutoff = new Date(Date.now() + 14 * 86400000);

        return myMilestones.filter((milestone) => {
            if (milestone.done || !milestone.dueDate) return false;

            if (!(milestone.assignees || []).includes(currentUser.id)) {
                return false;
            }

            const dueDate = new Date(milestone.dueDate);

            return (
                !Number.isNaN(dueDate.getTime()) &&
                dueDate <= cutoff
            );
        }).length;
    }, [myMilestones, currentUser?.id]);


    const handleApprove = async (initiativeId) => {
        try {
            if (!currentUser?.id) {
                throw new Error("Logged-in user ID is missing.");
            }

            const response = await fetch(
                `/api/initiative/${initiativeId}/accept`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        approvedBy: currentUser.id,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.error || "Failed to approve initiative."
                );
            }

            // Record approval activity
            try {
                await logActivity({
                    initiativeId: initiativeId,
                    userId: currentUser.id,
                    action: "Approved initiative",
                    timestamp: new Date().toISOString(),
                });
            } catch (activityError) {
                console.error("Failed to save approval activity:", activityError);
            }

            await loadInitiatives(currentUser);
        } catch (error) {
            console.error("Approve initiative failed:", error);
            alert(error.message);
        }
    };


    const handleReject = async (initiativeId, reason) => {
        try {
            const response = await fetch(
                `/api/initiative/${initiativeId}/reject`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        rejectionReason: reason,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Failed to reject initiative.");
            }

            // Record rejection activity
            try {
                await logActivity({
                    initiativeId,
                    userId: currentUser.id,
                    action: `Rejected: ${reason.trim()}`,
                    timestamp: new Date().toISOString(),
                });
            } catch (activityError) {
                console.error("Failed to save rejection activity:", activityError);
            }

            await loadInitiatives(currentUser);
            return true;
        } catch (error) {
            console.error("Reject initiative failed:", error);
            alert(error.message);
            return false;
        }
    };

    const hiddenCount = useMemo( () => 
        initiatives.filter((i) => i.confidential && !canSeeInit(currentUser, i))
            .length,
        [initiatives, currentUser],
    );

    useEffect(() => {
        if (!currentUser?.id) return;

        const userId = currentUser.id;

        loadMyMilestones(userId);

        const intervalId = setInterval(() => {
            loadMyMilestones(userId);
        }, 60000);

        return () => {
            clearInterval(intervalId);
        };
    }, [currentUser?.id]);



    useEffect(() => {
        async function getAllDetails() {
            const user = await loadUser();
            if (user) {
                await loadInitiatives(user);
            }
            await loadUsers();
        }

        getAllDetails();
    }, []);

    useEffect(() => {
        if (view === "approvals" && currentUser?.id) {
            loadInitiatives(currentUser);
        }
    }, [view, currentUser?.id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!currentUser) {
        return <LoginScreen />;
    }

    const isAdmin = currentUser.appRole === UserRoles.ADMIN;
    const isPrivileged = currentUser.appRole === UserRoles.ADMIN || currentUser.appRole === UserRoles.EXECUTIVE;
    const pendingCount = isPrivileged ? initiatives.filter((i) => i.status === InitiativeStatus.PROPOSED).length : 0;

    const navItems = [
        { key: "summary", label: "Summary" },
        { key: "initiatives", label: "Initiatives" },
        {
            key: "mymilestones",
            label: "My Milestones",
            badge: myMilestoneBadge
        },
    ];
    if (isPrivileged)
        navItems.push({
            key: "approvals",
            label: "Approvals",
            badge: pendingCount,
        });

    navItems.push({ key: "help", label: "Help" });

    if (isAdmin) {
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
                                        setSelectedInit(null);
                                        setEditingInit(null);
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
                        onSelectInitiative={selectInit}
                        hiddenCount={hiddenCount}
                    />
                )}
                {view === "initiatives" && (
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
                    <MyMilestone
                        milestones={myMilestones}
                        currentUser={currentUser}
                        loading={milestoneLoading}
                        error={milestoneError}
                        onRefresh={() => loadMyMilestones(currentUser.id)}
                        onSelectInitiative={async (initiativeId) => {
                            const initiative = initiatives?.find(
                                (item) => item.id === initiativeId
                            );

                            if (initiative) {
                                selectInit(initiative);
                                return;
                            }

                            try {
                                const response = await fetch(
                                    `/api/initiative/${initiativeId}`
                                );

                                const result = await response.json();

                                if (!response.ok) {
                                    throw new Error(
                                        result.message || "Unable to load initiative."
                                    );
                                }

                                const selectedInitiative =
                                    result.initiative?.data?.[0] ||
                                    result.data?.[0] ||
                                    result.data ||
                                    result.initiative;

                                if (!selectedInitiative) {
                                    throw new Error("Initiative not found.");
                                }

                                setReturnView("mymilestones");
                                setSelectedInit(selectedInitiative);
                                setView("detail");

                            } catch (error) {
                                console.error("Error opening initiative:", error);
                                alert(error.message || "Unable to open initiative.");
                            }
                        }}
                    />
                )}
                
                {view === "approvals" && isPrivileged && (
                    <Approvals
                        initiatives={initiatives}
                        users={users}
                        currentUser={currentUser}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onSelect={selectInit}
                    />
                )}
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
                {view === "detail" && selectedInit && (
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
            )}
            </main>
        </div>
    );
}
