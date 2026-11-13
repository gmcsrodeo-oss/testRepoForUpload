import { deleteMilestone } from "@/services/milestoneService";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
    try {
        const { initiativeId, milestoneId } = await params;

        const milestone = await deleteMilestone(
            initiativeId,
            milestoneId
        );

        return NextResponse.json(
            {
                deletedMilestone: milestone,
                error: null,
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                deletedMilestone: null,
                error: error.message,
            },
            { status: 500 }
        );
    }
}