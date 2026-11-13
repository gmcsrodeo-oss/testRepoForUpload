import { NextResponse } from "next/server";
import { createInitiative, getInitiatives, getInitiativesByStatus, getInitiativesForUser } from "../../../services/initiativeService";
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
        const status = searchParams.get("status");

        // Fetch all initiatives for a particular user
        if (userId) {
            const result = await getInitiativesForUser(userId);

            if (!result.success) {
                const statusCode =
                    result.code === "USER_NOT_FOUND" ? 404 :
                    result.code === "USER_ID_REQUIRED" ? 400 : 500;

                return NextResponse.json(
                    {
                        success: false,
                        message: result.message,
                        code: result.code
                    },
                    { status: statusCode }
                );
            }

            return NextResponse.json(
                {
                    success: true,
                    initiatives: result.data
                },
                { status: 200 }
            );
        }

        // Fetch all initiatives
        if (status === null) {
            const result = await getInitiatives();

            if (!result.success) {
                return NextResponse.json(
                    {
                        success: false,
                        message: result.message
                    },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                {
                    success: true,
                    initiatives: result.data
                },
                { status: 200 }
            );
        }

        // Fetch initiatives by status
        const result = await getInitiativesByStatus(status);

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: result.message
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                initiativesByStatus: result.data
            },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error.message
            },
            { status: 500 }
        );
    }
}

export async function POST(request){
    try{

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

        const body = await request.json();

        const initiative = await createInitiative(body);

        if(!initiative.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: initiative.message
                },
                {
                    status: 400
                }
            )
        }

        return NextResponse.json(
            {
                success: true,
                initiative
            }
        );
    }
    catch(error) {
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
}