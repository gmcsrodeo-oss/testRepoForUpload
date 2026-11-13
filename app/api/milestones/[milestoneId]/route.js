import { updateMilestoneById } from "@/services/milestoneService";
import { NextResponse } from "next/server";
import { authenticateUser } from "../../../auth/authenticate-user/authenticate-user";

export async function PUT(request, { params }) {
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

        const { milestoneId } = await params;
        const { done, assignees, userId } = await request.json();
        //const supabase = new createClient();

        const milestoneData = {};

        if (done !== undefined) {
            milestoneData.done = done;
        }

        if (assignees !== undefined) {
            milestoneData.assignees = assignees;
        }

        const result = await updateMilestoneById(
            milestoneId,
            milestoneData,
            userId
        );

        if (!result.success) {
            const status =
                result.code === "USER_ID_REQUIRED" ||
                result.code === "MILESTONE_UPDATE_DATA_REQUIRED" ||
                result.code === "INVALID_MILESTONE_STATUS" ||
                result.code === "INVALID_MILESTONE_ASSIGNEES"
                    ? 400
                    : result.code === "USER_NOT_FOUND" ||
                      result.code === "MILESTONE_NOT_FOUND" ||
                      result.code === "INITIATIVE_NOT_FOUND"
                    ? 404
                    : result.code === "MILESTONE_UPDATE_FORBIDDEN"
                    ? 403
                    : 500;

            return NextResponse.json(result, { status });
        }

        return NextResponse.json(result, { status: 200 });

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