import { NextResponse } from "next/server";
import { createNewInitiative, deleteInitiative, getAllInitiatives, getAllInitiativesByStatus, getInitiativeById, updateInitiative, getProposedInitiativeById, acceptInitiative, rejectInitiative, getAllInitiativesForUser } from "../repositories/initiativeRepository";
import { getUserByUserId } from "../repositories/userRepository";

export async function getProposedInitiative(initiativeId) {
    try {

        if (!initiativeId) {
            return {
                success: false,
                data: null,
                code: "INITIATIVE_ID_REQUIRED",
                message: "initiativeId is required."
            };
        }

        const initiative = await getProposedInitiativeById(initiativeId);

        if (!initiative) {
            return {
                success: false,
                data: null,
                code: "INITIATIVE_NOT_FOUND",
                message: "The initiative does not exist."
            };
        }

        return {
            success: true,
            data: initiative,
            code: null
        };

    } catch (error) {

        return {
            success: false,
            data: null,
            code: "INITIATIVE_FETCH_FAILED",
            message: error.message
        };
    }
}

export async function getInitiatives()
{
    try{
        const initiatives = await getAllInitiatives();

        return {
            success: true,
            data: initiatives,
            code: null
        };

    }
    catch(error){
        return {
            success: false,
            data: null,
            code: "INITIATIVE_FETCH_FAILED",
            message: error.message
        };
    }
}

export async function getInitiativesByStatus(status)
{
    try{
        const initiativesByStatus = await getAllInitiativesByStatus(status);

        return {
            success: true,
            data: initiativesByStatus,
            code: null
        };
    }
    catch(error){
        return {
            success: false,
            data: null,
            code: "INITIATIVE_FETCH_FAILED",
            message: error.message
        };
    }
}


export async function getInitiativesForUser(userId) {
    try {
        if (!userId) {
            return {
                success: false,
                data: null,
                code: "USER_ID_REQUIRED",
                message: "userId is required."
            };
        }

        const user = await getUserByUserId(userId);

        if (!user) {
            return {
                success: false,
                data: null,
                code: "USER_NOT_FOUND",
                message: "User not found."
            };
        }

        const initiatives = await getAllInitiativesForUser(userId);

        return {
            success: true,
            data: initiatives,
            code: null
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            code: "INITIATIVES_FETCH_BY_USER_FAILED",
            message: error.message
        };
    }
}


export async function createInitiative(initiativeData) {
    try {
        const initiative = await createNewInitiative(initiativeData);

        return {
            success: true,
            data: initiative,
            code: null
        };
    }
    catch(error){
        return {
            success: false,
            data: null,
            code: "INITIATIVE_CREATION_FAILED",
            message: error.message
        };
    }
}

export async function getInitiativeByID(initiativeId)
{
    try{
        const initiative = await getInitiativeById(initiativeId);

        return {
            success: true,
            data: initiative,
            code: null
        };
    }
    catch(error){
        return {
            success: false,
            data: null,
            code: "INITIATIVE_FETCH_FAILED",
            message: error.message
        };
    }
}

export async function updateInitiativeById(initiativeId, initiativeData)
{
    try{
        const initiative = await updateInitiative(initiativeId, initiativeData);

        return {
            success: true,
            data: initiative,
            code: null
        };
    }
    catch(error){
        return {
            success: false,
            data: null,
            code: "INITIATIVE_UPDATION_FAILED",
            message: error.message
        };
    }
}

export async function deleteInitiativeById(initiativeId)
{
    try{
        const initiative = await deleteInitiative(initiativeId);

        return {
            success: true,
            data: initiative,
            code: null
        };
    }
    catch(error){
         return {
            success: false,
            data: null,
            code: "INITIATIVE_DELETION_FAILED",
            message: error.message
        };
    }
}

export async function acceptInitiativeById(initiativeId, approvedBy) {
    try {

        const proposed = await getProposedInitiative(initiativeId);

        if (!proposed.success) {
            return proposed;
        }

        if (!approvedBy) {
            return {
                success: false,
                data: null,
                code: "APPROVER_REQUIRED",
                message: "Approver user ID is required.",
            };
        }

        const initiative = await acceptInitiative(initiativeId, approvedBy);

        return {
            success: true,
            data: initiative,
            code: null,
            message: "The initiative has been accepted by Admin/Executive."
        };

    } catch (error) {

        return {
            success: false,
            data: null,
            code: "INITIATIVE_APPROVAL_FAILED",
            message: error.message
        };
    }
}

export async function rejectInitiativeById(initiativeId, rejectionReason) {
    try {
        if (!rejectionReason?.trim()) {
            return {
                success: false,
                data: null,
                code: "REJECTION_REASON_REQUIRED",
                message: "Rejection reason is required.",
            };
        }

        const proposed = await getProposedInitiative(initiativeId);

        if (!proposed.success) {
            return proposed;
        }

        const initiative = await rejectInitiative(initiativeId,  rejectionReason.trim());

        return {
            success: true,
            data: initiative,
            code: null,
            message: "The initiative has been rejected by Admin/Executive. Please reply by making modifications."
        };

    } catch (error) {

        return {
            success: false,
            data: null,
            code: "INITIATIVE_REJECTION_FAILED",
            message: error.message
        };
    }
}