import { NextResponse } from "next/server";
import { acceptInitiativeById } from "@/services/initiativeService";
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
        const approvedBy = body?.approvedBy;
        const initiative = await acceptInitiativeById(initiativeId, approvedBy);

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