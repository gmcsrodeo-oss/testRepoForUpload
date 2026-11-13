import { createClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);

    //const userId = searchParams.get("userId");
    const initiativeId = searchParams.get("initiativeId");

    const supabase = new createClient();

    try {
        // User's Milestone list.
        // if (userId) {
        //     const { milestonesByUser, error } = await supabase.from("")
        // }

        // Initiative's milestones.
        if (initiativeId) {
            const { data: milestonesByInitiative, error } = await supabase.from("milestones").select().eq("initiativeId", initiativeId).eq("isDeleted", false);

            console.log("Initiative Id: " + initiativeId);
            console.log("Milestones: " + milestonesByInitiative);

            if(error) {
                return NextResponse.json({
                    success: false,
                    message: error.message
                }, {status: 500});
            }

            return NextResponse.json({
                success: true,
                milestonesByInitiative,
            }, { status: 200 });
        }

        return NextResponse.json(
            {
                success: false,
                message : "userId or initiativeId is required",
            },
            { status: 400 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message:error.message,
            },
            { status: 500 }
        );
    }
}