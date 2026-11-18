import { getMilestonesByUser, getMilestonesByInitiative, getMilestoneById, createMilestone, updateMilestone, deleteMilestoneById as deleteMilestoneFromRepository } from "../repositories/milestoneRepository";
import { getUserByUserId } from "../repositories/userRepository";
import { getInitiativeById } from "../repositories/initiativeRepository";
import { UserRoles } from "../enums/userRole";

// Admin / Executive / initiative owner
// const canManage = (user, initiative) =>
//     user.appRole === UserRoles.ADMIN ||
//     user.appRole === UserRoles.EXECUTIVE ||
//     initiative.ownerId === user.id;


const canManage = (user, initiative) => {
    const role = String(user?.appRole || "").trim().toLowerCase();

    return (
        role === "admin" ||
        role === "executive" ||
        initiative?.ownerId === user?.id
    );
};
export async function getUserMilestones(userId) {
    try {
        if (!userId) {
            return { 
                success: false, 
                data: null, 
                code: "USER_ID_REQUIRED", 
                message: "userId is required." };
        }

        const user = await getUserByUserId(userId);

        if (!user) {
            return { 
                success: false, 
                data: null, 
                code: "USER_NOT_FOUND", 
                message: "User not found." };
        }

        const milestones = await getMilestonesByUser(userId, user.appRole);

        return {
            success: true,
            data: milestones,
            code: null
        };
    }
    catch (error) {
        return {
            success: false,
            data: null,
            code: "MILESTONES_FETCH_BY_USER_FAILED",
            message: error.message
        };
    }
}

export async function getInitiativeMilestones(initiativeId) {
    try {
        if (!initiativeId) {
            return { 
                success: false, 
                data: null, 
                code: "INITIATIVE_ID_REQUIRED", 
                message: "initiativeId is required." };
        }

        const milestones = await getMilestonesByInitiative(initiativeId);

        return {
            success: true,
            data: milestones,
            code: null
        };
    }
    catch (error) {
        return {
            success: false,
            data: null,
            code: "MILESTONES_FETCH_BY_INITIATIVE_FAILED",
            message: error.message
        };
    }
}

export async function getMilestone(milestoneId) {
    try {
        if (!milestoneId) {
            return { 
                success: false, 
                data: null, 
                code: "MILESTONE_ID_REQUIRED", 
                message: "milestoneId is required." };
        }

        const milestone = await getMilestoneById(milestoneId);

        if (!milestone) {
            return { 
                success: false, 
                data: null, 
                code: "MILESTONE_NOT_FOUND", 
                message: "Milestone not found." };
        }

        return {
            success: true,
            data: milestone,
            code: null
        };
    }
    catch (error) {
        return {
            success: false,
            data: null,
            code: "MILESTONE_FETCH_FAILED",
            message: error.message
        };
    }
}

export async function createNewMilestone(initiativeId, milestoneData, userId) {
    try {
        if (!initiativeId) {
            return { 
                success: false, 
                data: null, 
                code: "INITIATIVE_ID_REQUIRED", 
                message: "initiativeId is required." };
        }

        if (!userId) {
            return { 
                success: false, 
                data: null, 
                code: "USER_ID_REQUIRED", 
                message: "userId is required." };
        }

        const user = await getUserByUserId(userId);

        if (!user) {
            return { 
                success: false, 
                data: null, 
                code: "USER_NOT_FOUND", 
                message: "User not found." };
        }

        const initiative = await getInitiativeById(initiativeId);

        if (!initiative) {
            return { 
                success: false, 
                data: null, 
                code: "INITIATIVE_NOT_FOUND", 
                message: "Initiative not found." };
        }

        if (!canManage(user, initiative)) {
            return { 
                success: false, 
                data: null, 
                code: "MILESTONE_CREATE_FORBIDDEN", 
                message: "You are not allowed to create a milestone for this initiative." };
        }

        if (!milestoneData?.title || milestoneData.title.trim() === "") {
            return { 
                success: false, 
                data: null, 
                code: "MILESTONE_TITLE_REQUIRED", 
                message: "title is required." };
        }

        const milestone = await createMilestone(initiativeId, {
            title: milestoneData.title.trim(),
            done: milestoneData.done,
            dueDate: milestoneData.dueDate || null, // UI sends "" when no date is picked
            assignees: milestoneData.assignees
        });

        return {
            success: true,
            data: milestone,
            code: null
        };
    }
    catch (error) {
        return {
            success: false,
            data: null,
            code: "MILESTONE_CREATION_FAILED",
            message: error.message
        };
    }
}

export async function updateMilestoneById(milestoneId, milestoneData, userId) {
    try {
        if (!milestoneId) {
            return { 
                success: false, 
                data: null, 
                code: "MILESTONE_ID_REQUIRED", 
                message: "milestoneId is required." };
        }

        if (!userId) {
            return { 
                success: false, 
                data: null, 
                code: "USER_ID_REQUIRED", 
                message: "userId is required." };
        }

        const hasDone = milestoneData?.done !== undefined;
        const hasAssignees = milestoneData?.assignees !== undefined;

        if (!hasDone && !hasAssignees) {
            return {
                success: false,
                data: null,
                code: "MILESTONE_UPDATE_DATA_REQUIRED",
                message: "Provide done or assignees to update."
            };
        }

        if (hasDone && typeof milestoneData.done !== "boolean") {
            return {
                success: false,
                data: null,
                code: "INVALID_MILESTONE_STATUS",
                message: "done must be true or false."
            };
        }

        if (
            hasAssignees &&
            (!Array.isArray(milestoneData.assignees) ||
                !milestoneData.assignees.every(id => typeof id === "string"))
        ) {
            return {
                success: false,
                data: null,
                code: "INVALID_MILESTONE_ASSIGNEES",
                message: "assignees must be an array of user IDs."
            };
        }

        const user = await getUserByUserId(userId);

        if (!user) {
            return { 
                success: false, 
                data: null, 
                code: "USER_NOT_FOUND", 
                message: "User not found." };
        }

        const milestone = await getMilestoneById(milestoneId);

        if (!milestone) {
            return { 
                success: false, 
                data: null, 
                code: "MILESTONE_NOT_FOUND", 
                message: "Milestone not found." };
        }

        const initiativeResult = await getInitiativeById(milestone.initiativeId);

        const initiative = Array.isArray(initiativeResult)
            ? initiativeResult[0]
            : initiativeResult;

        if (!initiative) {
            return { 
                success: false, 
                data: null, 
                code: "INITIATIVE_NOT_FOUND", 
                message: "Initiative not found." };
        }

        const isAssigned = (milestone.assignees || []).includes(userId);

        if (!canManage(user, initiative) && !isAssigned) {
            return { 
                success: false, 
                data: null, 
                code: "MILESTONE_UPDATE_FORBIDDEN", 
                message: "You are not allowed to update this milestone." };
        }

        const updatedMilestone = await updateMilestone(milestoneId, milestoneData);

        if (!updatedMilestone) {
            return { 
                success: false, 
                data: null, 
                code: "MILESTONE_NOT_FOUND", 
                message: "Milestone not found or already deleted." };
        }

        return {
            success: true,
            data: updatedMilestone,
            code: null
        };
    }
    catch (error) {
        return {
            success: false,
            data: null,
            code: "MILESTONE_UPDATION_FAILED",
            message: error.message
        };
    }
}

export async function deleteMilestoneById(initiativeId, milestoneId, userId) {
    try {
        if (!initiativeId) {
            return { 
                success: false, 
                data: null, 
                code: "INITIATIVE_ID_REQUIRED", 
                message: "initiativeId is required." };
        }

        if (!milestoneId) {
            return { 
                success: false, 
                data: null, 
                code: "MILESTONE_ID_REQUIRED", 
                message: "milestoneId is required." };
        }

        if (!userId) {
            return { 
                success: false, 
                data: null, 
                code: "USER_ID_REQUIRED", 
                message: "userId is required." };
        }

        const user = await getUserByUserId(userId);

        if (!user) {
            return { 
                success: false, 
                data: null, 
                code: "USER_NOT_FOUND", 
                message: "User not found." };
        }

        const initiativeResult = await getInitiativeById(initiativeId);

        const initiative = Array.isArray(initiativeResult)
            ? initiativeResult[0]
            : initiativeResult;

        if (!initiative) {
            return { 
                success: false, 
                data: null, 
                code: "INITIATIVE_NOT_FOUND", 
                message: "Initiative not found." };
        }

        if (!canManage(user, initiative)) {
            return { 
                success: false, 
                data: null, 
                code: "MILESTONE_DELETE_FORBIDDEN", 
                message: "You are not allowed to delete milestones on this initiative." };
        }

        const deletedMilestone = await deleteMilestoneFromRepository(initiativeId, milestoneId, userId);

        if (!deletedMilestone) {
            return { 
                success: false, 
                data: null, 
                code: "MILESTONE_NOT_FOUND", 
                message: "Milestone not found or already deleted." };
        }

        return {
            success: true,
            data: deletedMilestone,
            code: null
        };
    }
    catch (error) {
        return {
            success: false,
            data: null,
            code: "MILESTONE_DELETION_FAILED",
            message: error.message
        };
    }
}