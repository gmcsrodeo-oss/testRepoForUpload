import { createClient } from "@/lib/supabase/client";


export async function getMilestonesByUser(userId, appRole) {
    const supabase = createClient();

    const { data: milestones, error } = await supabase
        .from("milestones")
        .select()
        .eq("isDeleted", false)
        .contains("assignees", [userId]);

    if (error) {
        throw error;
    }

    const milestoneRows = milestones || [];

    if (milestoneRows.length === 0) {
        return [];
    }

    const initiativeIds = [
        ...new Set(
            milestoneRows
                .map((milestone) => milestone.initiativeId)
                .filter(Boolean)
        ),
    ];

    const { data: initiatives, error: initiativeError } =
        await supabase
            .from("initiative")
            .select("id, title, func, status, confidential")
            .in("id", initiativeIds);

    if (initiativeError) {
        throw initiativeError;
    }

    const initiativeById = new Map(
        (initiatives || []).map((initiative) => [
            initiative.id,
            initiative,
        ])
    );

    return milestoneRows.map((milestone) => {
        const initiative = initiativeById.get(milestone.initiativeId);

        return {
            ...milestone,
            initId: milestone.initiativeId,
            initTitle: initiative?.title ?? "",
            func: initiative?.func ?? null,
            status: initiative?.status ?? null,
            confidential: initiative?.confidential ?? false,
        };
    });
}

export async function getMilestonesByInitiative(initiativeId) {
    const supabase = createClient();

    const { data: milestones, error } = await supabase
        .from("milestones")
        .select()
        .eq("initiativeId", initiativeId)
        .eq("isDeleted", false);

    if (error) {
        throw error;
    }

    const milestoneRows = milestones || [];

    if (milestoneRows.length === 0) {
        return [];
    }

    const { data: initiative, error: initiativeError } =
        await supabase
            .from("initiative")
            .select("id, title, func, status, confidential")
            .eq("id", initiativeId)
            .maybeSingle();

    if (initiativeError) {
        throw initiativeError;
    }

    return milestoneRows.map((milestone) => ({
        ...milestone,
        initId: milestone.initiativeId,
        initTitle: initiative?.title ?? "",
        func: initiative?.func ?? null,
        status: initiative?.status ?? null,
        confidential: initiative?.confidential ?? false,
    }));
}

export async function getMilestoneById(milestoneId) {
    const supabase = createClient();

    const { data: milestone, error } = await supabase
        .from("milestones")
        .select()
        .eq("isDeleted", false)
        .eq("id", milestoneId)
        .single();

    if (error) {
        if (error.code == "PGRST116") {
            return null;
        }

        throw error;
    }

    return milestone;
}

export async function createMilestone(initiativeId, milestoneData) {
    const supabase = createClient();

    const { data: newMilestone, error } = await supabase
        .from("milestones")
        .insert([{
            initiativeId: initiativeId,
            title: milestoneData.title,
            done: milestoneData.done ?? false,
            dueDate: milestoneData.dueDate ?? null,
            assignees: milestoneData.assignees ?? [],
            isDeleted: false
        }])
        .select()
        .single();

    if (error) {
        throw error;
    }

    return newMilestone;
}

export async function updateMilestone(milestoneId, milestoneData) {
    const supabase = createClient();

    const updateData = {};

    // Update status only when done is provided
    if (milestoneData.done !== undefined) {
        updateData.done = milestoneData.done;
    }

    // Update assignees only when provided
    if (milestoneData.assignees !== undefined) {
        updateData.assignees = milestoneData.assignees;
    }

    // Do not execute an empty update
    if (Object.keys(updateData).length === 0) {
        throw new Error("No milestone fields provided for update.");
    }
    const { data: milestone, error } = await supabase
        .from("milestones")
        .update(updateData)
        .eq("id", milestoneId)
        .eq("isDeleted", false)
        .select()
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return null;
        }

        throw error;
    }

    return milestone;
}

export async function deleteMilestoneById(initiativeId, milestoneId, userId) {
    const supabase = createClient();

    const { data: milestone, error } = await supabase
        .from("milestones")
        .update({ isDeleted: true })
        .eq("id", milestoneId)
        .eq("initiativeId", initiativeId)
        .eq("isDeleted", false)
        .select()
        .single();

    if (error) {
        if (error.code == "PGRST116") {
            return null;
        }

        throw error;
    }

    return milestone;
}