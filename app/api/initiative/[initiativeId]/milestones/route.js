import { createClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
    try {
        const { initiativeId } = await params;
        const supabase = new createClient();

        if (!initiativeId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "initiativeId is required",
                },
                { status: 400 }
            );
        }

        var body = await request.json();
        body.initiativeId = initiativeId;


        if (!body.title || body.title.trim() === "") {
            return NextResponse.json(
                {
                    success: false,
                    message: "title is required",
                },
                { status: 400 }
            );
        }

        if (
            body.done !== undefined &&
            typeof body.done !== "boolean"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "done must be true or false",
                },
                { status: 400 }
            );
        }

        if (
            body.assignees !== undefined &&
            !Array.isArray(body.assignees)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "assignees must be an array",
                },
                { status: 400 }
            );
        }

        const { data: milestone, error } = await supabase.from("milestones").insert([body]).select();

        if(error) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message
                },
                {
                    status: 500
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
                milestone
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("POST milestone error:", error);

        return NextResponse.json(
            {
                success: false,
                message: error.message
            },
            { status: 500 }
        );
    }
}