import { createClient } from "@/lib/supabase/server";

const ROLE_TO_DATABASE = Object.freeze({ admin: "Admin", executive: "Executive", member: "Member" });
const ROLE_FROM_DATABASE = Object.freeze({ Admin: "admin", Executive: "executive", Member: "member" });

function normalizeAppRole(role) {
    if (typeof role !== "string") return role;
    const trimmed = role.trim();
    return ROLE_FROM_DATABASE[trimmed] || trimmed.toLowerCase();
}

function normalizeAssignedFunctions(user) {
    // The assigned function list is stored on each profile in Supabase.
    const raw = user.functions ?? user.functionAccess ?? user.function_access ?? user.assignedFunctions ?? [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        } catch (_) {
            // Some existing schemas store the list as comma-separated text.
        }
        return raw.split(",").map((value) => value.trim()).filter(Boolean);
    }
    return [];
}

export async function getAllUsers() {
    const supabase = await createClient();

    const { data: userData, error } = await supabase.from("users").select().eq("isDeleted", false);

    if(error)
    {
        throw error;
    }

    return (userData || []).map((user) => ({
        ...user,
        appRole: normalizeAppRole(user.appRole),
        functions: normalizeAssignedFunctions(user),
    }));
}

export async function createNewUser(userData) {
    const supabase = await createClient();

    const { data: newUser, error } = await supabase.from("users").insert([userData]).select().single();

    if(error)
    {
        throw error;
    }

    return newUser;
}

export async function getUserByUserId(userId) {
    const supabase = await createClient();

    const { data: userDataById, error } = await supabase.from("users").select().eq("isDeleted", false).eq("id", userId).single();

    if(error){
        if(error.code == "PGRST116")
        {
            return null;
        }

        throw error;
    }

    return userDataById;
}

export async function updateUser(userId, userData) {
    const supabase = await createClient();
    const profileData = { ...userData };
    delete profileData.role;

    // Convert the UI role identifier to the exact PostgreSQL enum label.
    if (Object.prototype.hasOwnProperty.call(profileData, "appRole")) {
        const normalizedRole = normalizeAppRole(profileData.appRole);
        const databaseRole = ROLE_TO_DATABASE[normalizedRole];
        if (!databaseRole) throw new Error(`Unsupported application role: ${profileData.appRole}`);
        profileData.appRole = databaseRole;
    }

    // Persist function access as an independent profile field. Keep only strings
    // and remove duplicates so repeated clicks cannot create duplicate entries.
    if (Object.prototype.hasOwnProperty.call(profileData, "functions")) {
        if (!Array.isArray(profileData.functions)) throw new Error("Functions must be an array.");
        profileData.functions = [...new Set(profileData.functions.map((value) => String(value).trim()).filter(Boolean))];
    }

    const { data: user, error } = await supabase.from("users").update(profileData).eq("id", userId).select().single();

    if(error) 
    {
        throw error;
    }

    return { ...user, appRole: normalizeAppRole(user.appRole), functions: normalizeAssignedFunctions(user) };
}

export async function deleteUser(userId) {
    const supabase = await createClient();

    const { data: user, error } = await supabase.from("users").update({"isDeleted": true}).eq("id", userId).select().single();

    if(error)
    {
        throw error;
    }

    return user;
}