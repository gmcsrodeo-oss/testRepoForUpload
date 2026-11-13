import { NextResponse } from "next/server";
import { createNewInitiative, deleteInitiative, getAllInitiatives, getAllInitiativesByStatus, getInitiativeById, updateInitiative } from "../repositories/initiativeRepository";
import { InitiativeStatus } from "../enums/status";

export async function getProposedInitiativeById(supabase, initiativeId) {
    const { data: initiativeData, error } = await supabase.from("initiative").select().eq("id", initiativeId).eq("status", InitiativeStatus.PROPOSED);

    if(error) {
        if(error.code == "PGRST116")
        {
            return NextResponse.json({
                success: false,
                message: "Initiative not found."
            },{
                status: 404
            });
        }

        return NextResponse.json({
            success: false,
            message: error.message
        },{
            status: 500
        });
    }
    
    return NextResponse.json({
        success: true,
        initiativeData: initiativeData[0]
    });
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

export async function createInitiative(initiativeData)
{
    try{
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