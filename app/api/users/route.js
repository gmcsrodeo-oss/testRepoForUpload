/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { createUser, getUsers } from "../../../services/userService";

export async function GET() {
  try {
    const userData = await getUsers();

    if (!userData.success) {
      return NextResponse.json(
        {
          success: false,
          message: userData.message
        },
        {
          status: 500
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: userData.data
      },
      {
        status: 200
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

export async function POST(request) {
  try{
    const body = await request.json();

    const newUser = await createUser(body);

    if(!newUser.success) {
      return NextResponse.json({
        success: false,
        message: newUser.message
      },
      {
        status: 500
      });
    }

    return NextResponse.json({
      success: true,
      message: "New user has been added in Users table.",
      data: newUser
    }, {
      status: 201
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