import { NextResponse } from "next/server";
import { deleteInitiativeById, getInitiativeByID, updateInitiativeById } from "../../../../services/initiativeService";
import { authenticateUser } from "../../../auth/authenticate-user/authenticate-user";

export async function GET(request, { params }) {
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

        const { initiativeId } = await params;

        const initiative = await getInitiativeByID(initiativeId);

        if(!initiative.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: initiative.message
                }, {
                    status: 400
                }
            );
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
                error: error.message
            }, {
                status: 500
            }
        );
    }
}

export async function PUT(request, { params }) {
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

        const { initiativeId } = await params;

        const initiativeExists = await getInitiativeByID(initiativeId);

        if(!initiativeExists.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: initiativeExists.message
                }, {
                    status: 400
                }
            );
        }

        const initiative = await updateInitiativeById(initiativeId, body);

        if(!initiative.success) {
            return NextResponse.json({
                success: false,
                message: initiative.message
            }, {
                status: 400
            })
        }

        return NextResponse.json({
            success: true,
            initiative
        });
    }
    catch(error) {
        return NextResponse.json({
            success: false,
            message: error.message
        },
        {
            status: 500
        });
    }
}

export async function DELETE(request, { params }) {
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

        const { initiativeId } = await params;

        if(!initiativeId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This is not valid initiative."
                },
                {
                    status: 400
                }
            );
        }

        const initiativeExists = await getInitiativeByID(initiativeId);

        if(!initiativeExists.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: initiativeExists.message
                }, {
                    status: 400
                }
            );
        }

        const initiative = await deleteInitiativeById(initiativeId)

        if(!initiative.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: initiative.message
                }, {
                    status: 400
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "The initiative with id " + initiativeId + " has been deleted successfully.",
            }
        );
    }
    catch(error) {
        return NextResponse.json(
            {
                success: false,
                message: error.message
            }, {
                status: 500
            }
        );
    }
}