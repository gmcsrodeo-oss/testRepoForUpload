import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { getProposedInitiativeById } from "../../../../services/initiativeService";
import { InitiativeStatus } from "../../../../../enums/status";

export async function PUT(request, { params }){
    const supabase = new createClient();

    const { initiativeId } = await params;

    const response = await getProposedInitiativeById(supabase, initiativeId);

    const initiativeData = await response.json();

    if(initiativeData.success == false)
    {
        return NextResponse.json({
            success: false,
            message: "The initiative does not exists."
        });
    }

    const { updateInitiative, error } = await supabase.from('initiative').update({"status":InitiativeStatus.REJECTED, "rejectionReason": "Update the initaitive"}).eq("id", initiativeId).select().single();

    if(error) {
        return NextResponse.json({
            success: false,
            message: error.message
        });
    }

    return NextResponse.json({
        success: true,
        updateInitiative,
        message: "The initiative has been rejected by Admin/Executive. Please reply by making modifications"
    });
}