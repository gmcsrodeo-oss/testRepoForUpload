import { createNewUser, deleteUser, getAllUsers, getUserByUserId, updateUser } from "../repositories/userRepository";

export async function getUsers()
{
    try{
        const users = await getAllUsers();

        return {
            success: true,
            data: users,
            code: null
        };
    }
    catch(error){
        return {
            success: false,
            data: null,
            code: "USERS_FETCH_FAILED",
            message: error.message
        };
    }
}

export async function createUser(userData)
{
    try{
        const newUser = createNewUser(userData);

        return {
            success: true,
            data: newUser,
            code: null
        };
    }
    catch(error){
        return {
            success: false,
            data: null,
            code: "USER_CREATION_FAILED",
            message: error.message
        };
    }
}

export async function getUserById(userId) 
{
    try{
        const userDatabyId = await getUserByUserId(userId);

        if(!userDatabyId)
        {
            return {
                success: false,
                message: "User not found."
            }
        }

        return {
            success: true,
            data: userDatabyId,
            code: null
        };
    }
    catch(error) {
        return {
            success: false,
            data: null,
            code: "USER_FETCH_BY_ID_FAILED",
            message: error.message
        };
    }
}

export async function updateUserById(userId, userData)
{
    try{
        const user = await updateUser(userId, userData);

        return {
            success: true,
            data: user,
            code: null
        };
    }
    catch(error) {
        return {
            success: false,
            data: null,
            code: "USER_UPDATION_FAILED",
            message: error.message
        };
    }
}

export async function deleteUserById(userId)
{
    try{
        const user = await deleteUser(userId);

        return {
            success: true,
            data: user,
            code: null
        };

    }
    catch(error) {
        return {
            success: false,
            data: null,
            code: "USER_DELETION_FAILED",
            message: error.message
        };
    }
}