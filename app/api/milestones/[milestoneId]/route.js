import { createClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
    try {
        const { milestoneId } = await params;
        const { done } = await request.json();
        const supabase = new createClient();

        console.log(milestoneId);

        // Validation
        if (typeof done !== "boolean") {
            return NextResponse.json(
                {
                    updatedMilestone: null,
                    error: "done must be true or false",
                },
                { status: 400 }
            );
        }

        const { data: updateMilestone, error } = await supabase.from("milestones").update({ "done": done }).select().eq("id", milestoneId).single();

        if(error) {
            return NextResponse.json({
                success: false,
                error: error.message
            }, {status: 500});
        }

        return NextResponse.json({
            success: true,
            updateMilestone
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            { status: 500 }
        );
    }
}