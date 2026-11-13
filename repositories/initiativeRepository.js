import { createClient } from "@/lib/supabase/client";
import { InitiativeStatusByName } from './../enums/status';

export async function getAllInitiatives()
{
    const supabase = new createClient();

    const { data:initiatives, error } = await supabase.from("initiative").select(`*, milestones (*)`);

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

export async function createNewInitiative(initiativeData)
{
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

    const { data: initiative, error } = await supabase.from("initiative").select(`*, milestones (*)`).eq("id", initiativeId);

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