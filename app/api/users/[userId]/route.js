import { NextResponse } from "next/server";
import { deleteUserById, getUserById, updateUserById } from "../../../../services/userService";

export async function GET(request, { params }) {
    try {
        const { userId } = await params;

        const userData = await getUserById(userId);

        if(!userData.success)
        {
            return NextResponse.json(
                {
                    success: false,
                    message: userData.message
                },
                {
                    status: 404
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
                userData
            }
        );
    }
    catch (error) {
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

export async function PUT(request, { params }) {
    try{
        const body = await request.json();

        const { userId } = await params;

        const userExists = await getUserById(userId);

        if(!userExists.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: userExists.message
                },
                {
                    status: 404
                }
            );
        }

        const updatedUser = await updateUserById(userId, body);

        if(!updatedUser.success)
        {
            return NextResponse.json({
                success: false,
                message: updatedUser.message
            }, {
                status: 400
            });
        }

        return NextResponse.json({
            success: true,
            updatedUser
        }, {
            status: 200
        });
    }
    catch(error)
    {
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
        const { userId } = await params;

        if(!userId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Please enter valid user id."
                },
                {
                    status: 400
                }
            );
        }

        const userExists = await getUserById(userId);

        if(!userExists.success)
        {
            return NextResponse.json(
                {
                    success: false,
                    message: userExists.message
                },
                {
                    status: 404
                }
            );
        }

        const deletedUser = await deleteUserById(userId);

        if(!deletedUser.success)
        {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message
                }, {
                    status: 400
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "The user with id " + userId + " has been deleted successfully."
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