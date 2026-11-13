import { createClient } from "@/lib/supabase/client";

export async function getUserMilestones(userId) {
    const supabase = new createClient();

    const { data: user, error: userError } = await supabase
        .from("users")
        .select("appRole")
        .eq("id", userId)
        .single();

    if (userError) {
        throw new Error(userError.message);
    }

    console.log("USER ID:", userId);
    console.log("USER ROLE:", user.appRole);

    let query = supabase
        .from("milestones")
        .select("*")
        .eq("isDeleted", false)
        .order("created_at", { ascending: false });

    if (user.app_role === "member") {
        query = query.contains("assignees", [userId]);
    }

    const { data: userMilestones, error: milestonesError } = await query;

    if (milestonesError) {
        throw new Error(error.message);
    }

    return userMilestones;
}
// Initiatives milestone method
export async function getMilestonesByInitiative(initiativeId) {
    const supabase = await createClient();
    const { data: initiativeMilestones, error: initiativeMilestonesError } = await supabase
        .from("milestones")
        .select("*")
        .eq("initiative_id", initiativeId)
        .eq("isDeleted", false)
        .order("created_at", { ascending: true });

    if (initiativeMilestonesError) throw initiativeMilestonesError;

    return initiativeMilestones;
}

// Updating milestone status

export async function updateMilestoneStatus(milestoneId, done) {
    const supabase = await supabaseAdmin;
    const { data: updatedMilestone, error: updateMilestoneError } = await supabase
        .from("milestones")
        .update({
            done,
            updated_at: new Date().toISOString(),
        })
        .eq("id", milestoneId)
        .select();

    if (updateMilestoneError) {
        throw new Error(updateMilestoneError.message);
    }
    if (!updatedMilestone || updatedMilestone.length === 0) {
        throw new Error(
            `Milestone ${milestoneId} was not found or cannot be updated`
        );
    }

    return updatedMilestone;
}


// Insert Milestone
export async function createMilestone(initiativeId, milestoneData) {
    const supabase = await supabaseAdmin;

    const { title, done, due_date, assignees, } = milestoneData;

    const { data: newMilestone, error: createMilestoneError } = await supabase
        .from("milestones")
        .insert({
            initiative_id: initiativeId,
            title,
            done: done ?? false,
            due_date: due_date ?? null,
            assignees: assignees ?? null,
        })
        .select();

    if (createMilestoneError) {
        throw new Error(createMilestoneError.message);
    }

    return newMilestone;
}

// Soft delete milestone
export async function deleteMilestone(initiativeId, milestoneId) {
    const supabase = supabaseAdmin;

    const { deletedMilestone, error } = await supabase
        .from("milestones")
        .update({
            isDeleted: true,
            updated_at: new Date().toISOString(),
        })
        .eq("id", milestoneId)
        .eq("initiative_id", initiativeId)
        .eq("isDeleted", false)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return deletedMilestone;
}