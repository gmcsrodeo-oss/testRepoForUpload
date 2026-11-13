import { NextResponse } from "next/server";
import { rejectInitiativeById } from "@/services/initiativeService";
import { authenticateUser } from "../../../../auth/authenticate-user/authenticate-user";

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

        const { initiativeId } = await params;
        const body = await request.json();
        const rejectionReason = body.rejectionReason?.trim();

        if (!rejectionReason) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Rejection reason is required.",
                },
                { status: 400 }
            );
        }

        const initiative = await rejectInitiativeById(initiativeId, rejectionReason);

        if (!initiative.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: initiative.message
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                initiative: initiative.data,
                message: initiative.message
            },
            { status: 200 }
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