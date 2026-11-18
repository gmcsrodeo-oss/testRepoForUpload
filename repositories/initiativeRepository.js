import { createClient } from "@/lib/supabase/client";
import { InitiativeStatusByName, InitiativeStatus } from './../enums/status';

export async function getAllInitiatives()
{
    const supabase = new createClient();

    const { data:initiatives, error } = await supabase.from("initiative").select(`*, milestones (*)`).eq("isDeleted", false).eq("milestones.isDeleted", false);

    if(error)
    {
        throw error;
    }

    return initiatives;
}

export async function getAllInitiativesByStatus(status)
{
    const supabase = new createClient();

    const { data: initiatives, error } = await supabase.from("initiative").select().eq("status", InitiativeStatusByName[status]);

    if(error)
    {
        throw error;
    }

    return initiatives;
}

export async function getAllInitiativesForUser(userId) {
    const supabase = createClient();

    const { data: initiatives, error } = await supabase
        .from("initiative")
        .select("*, milestones (*)")
        .eq("ownerId", userId)
        .eq("isDeleted", false)
        .eq("milestones.isDeleted", false);

    if (error) {
        throw error;
    }

    return initiatives || [];
}

export async function createNewInitiative(initiativeData) {
    const supabase = new createClient();

    const { data:initiative, error } = await supabase.from('initiative').insert(initiativeData).select().single();

    if(error)
    {
        throw error;
    }

    return initiative;
}

export async function getInitiativeById(initiativeId)
{
    const supabase = new createClient();

    const { data: initiative, error } = await supabase.from("initiative").select(`*, milestones (*)`).eq("id", initiativeId).eq("milestones.isDeleted", false);

    if(error)
    {
        throw error;
    }

    return initiative;
}

export async function updateInitiative(initiativeId, initiativeData)
{
    const supabase = new createClient();

    const { data: initiative, error } = await supabase.from("initiative").update(initiativeData).eq("id", initiativeId).select().single();

    if(error)
    {
        throw error;
    }

    return initiative;
}

export async function deleteInitiative(initiativeId)
{
    const supabase = new createClient();

    const { data: initiative, error } = await supabase.from("initiative").update({"isDeleted": true}).eq("id", initiativeId).select().single();

    if(error)
    {
        throw error;
    }
    
    return initiative;
}

export async function getProposedInitiativeById(initiativeId) {
    const supabase = createClient();

    const { data: initiative, error } = await supabase
        .from("initiative")
        .select()
        .eq("id", initiativeId)
        .eq("status", InitiativeStatus.PROPOSED)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return null;
        }

        throw error;
    }

    return initiative;
}

export async function acceptInitiative(initiativeId, approvedBy) {
    const supabase = createClient();
    const now = new Date().toISOString();

    const { data: initiative, error } = await supabase
        .from("initiative")
        .update({
            status: InitiativeStatus.NOTSTARTED,
            approvedBy: approvedBy,
            approvedAt: now,
            updatedAt: now,
        })
        .eq("id", initiativeId)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return initiative;
}

export async function rejectInitiative(initiativeId, rejectionReason) {
    const supabase = createClient();
    const now = new Date().toISOString();

    const { data: initiative, error } = await supabase
        .from("initiative")
        .update({
            rejectionReason: rejectionReason,
            updatedAt: now
        })
        .eq("id", initiativeId)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return initiative;
}