import { createClient } from "@/lib/supabase/client";

export async function getAllUsers() {
    const supabase = new createClient();

    const { data: userData, error } = await supabase.from("users").select().eq("isDeleted", false);

    if(error)
    {
        throw error;
    }

    return userData;
}

export async function createNewUser(userData) {
    const supabase = new createClient();

    const { data: newUser, error } = await supabase.from("users").insert([userData]).select().single();

    if(error)
    {
        throw error;
    }

    return newUser;
}

export async function getUserByUserId(userId) {
    const supabase = new createClient();

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
    const supabase = new createClient();

    const { data: user, error } = await supabase.from("users").update(userData).eq("id", userId).select().single();

    if(error) 
    {
        throw error;
    }

    return user;
}

export async function deleteUser(userId) {
    const supabase = new createClient();

    const { data: user, error } = await supabase.from("users").update({"isDeleted": true}).eq("id", userId).select().single();

    if(error)
    {
        throw error;
    }

    return user;
}