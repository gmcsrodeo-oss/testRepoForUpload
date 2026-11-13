import { NextResponse } from "next/server";
import { createInitiative, getInitiatives, getInitiativesByStatus } from "../../../services/initiativeService";

export async function GET(request) {
    try{
        const status = request.nextUrl.searchParams.get("status");

        if(status == null)
        {
            const initiatives = await getInitiatives();

            if(!initiatives.success) {
                return NextResponse.json({
                    success: false,
                    message: initiatives.message
                }, {
                    status: 400
                });
            }

            return NextResponse.json({
                success: true,
                initiatives
            });
        }
        else {
            const initiativesByStatus = await getInitiativesByStatus(status);
        
            if(!initiativesByStatus.success) {
                return NextResponse.json({
                    success: false,
                    message: initiativesByStatus.message
                }, {
                    status: 400
                });
            }

            return NextResponse.json({
                success: true,
                initiativesByStatus
            });
        }
    }
    catch(error) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, {
            status: 500
        });
    }
}

export async function POST(request){
    try{
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