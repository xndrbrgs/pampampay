import { NextResponse } from "next/server"
 import { getCharge } from "@/lib/coinbase"
 
 export async function GET(req: Request, { params }: { params: { id: string } }) {
   try {
     const id = params.id
 
     if (!id) {
       return NextResponse.json({ error: "Charge ID is required" }, { status: 400 })
     }
 
     console.log("Retrieving Coinbase charge details for:", id)
 
     // Get charge details from Coinbase
     const charge = await getCharge(id)
 
     return NextResponse.json({ success: true, charge })
   } catch (error: any) {
     console.error("Error retrieving Coinbase charge:", error.message)
     return NextResponse.json(
       { success: false, message: `Failed to retrieve charge details: ${error.message}` },
       { status: 500 },
     )
   }
 }