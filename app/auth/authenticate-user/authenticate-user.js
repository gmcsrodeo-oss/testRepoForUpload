import { createClient } from "@/lib/supabase/server";

export async function authenticateUser()
{
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return false;
    }

    return true;
}