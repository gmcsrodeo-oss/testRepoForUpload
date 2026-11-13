
import { NextResponse } from "next/server";
import { getUserMilestones, getInitiativeMilestones } from "@/services/milestoneService";
import { authenticateUser } from "../../auth/authenticate-user/authenticate-user";

export async function GET(request) {
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

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const initiativeId = searchParams.get("initiativeId");

        // User's milestones
        if (userId) {
            const result = await getUserMilestones(userId);

            if (!result.success) {
                return NextResponse.json(
                    {
                        success: false,
                        error: result.message
                    },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                {
                    success: true,
                    milestones: result.data
                },
                { status: 200 }
            );
        }

        // Initiative's milestones
        if (initiativeId) {
            const result = await getInitiativeMilestones(initiativeId);

            if (!result.success) {
                return NextResponse.json(
                    {
                        success: false,
                        error: result.message
                    },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                {
                    success: true,
                    milestones: result.data
                },
                { status: 200 }
            );
        }

        // Neither ID was provided
        return NextResponse.json(
            {
                success: false,
                error: "userId or initiativeId is required."
            },
            { status: 400 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}
