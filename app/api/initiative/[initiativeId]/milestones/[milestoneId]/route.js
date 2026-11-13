import { deleteMilestoneById } from "@/services/milestoneService";
import { NextResponse } from "next/server";
import { authenticateUser } from "../../../../../auth/authenticate-user/authenticate-user";

export async function DELETE(request, { params }) {
    try {
        const isUserAuthenticated = await authenticateUser();

        if(!isUserAuthenticated)
        {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized. Please sign in.",
                },
                { 
                    status: 401 
                }
            );
        }

        const { initiativeId, milestoneId } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        const result = await deleteMilestoneById(
            initiativeId,
            milestoneId,
            userId
        );

        if (!result || result.success === false) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    message: result?.message || "Unable to delete milestone."
                },
                { status: result?.code === "MILESTONE_NOT_FOUND" ? 404 : 400 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: result.data ?? result,
                message: "Milestone deleted successfully."
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                data: null,
                message: error.message
            },
            { status: 500 }
        );
    }
}