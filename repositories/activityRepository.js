import { createClient } from "@/lib/supabase/client";

export async function logActivity(activityData) {
    const supabase = new createClient();

    const { data: activity, error} = await supabase.from("activitylog").insert([activityData]).select().single();

    if(error)
    {
        throw error;
    }

    return activity;
}

export async function getActivityLogsByInitiative(initiativeId) {
    const supabase = new createClient();

    const { data: activities, error } = await supabase
        .from("activitylog")
        .select("*")
        .eq("initiativeId", initiativeId)
        .order("timestamp", { ascending: true });

    if (error) {
        throw error;
    }

    return activities || [];
}