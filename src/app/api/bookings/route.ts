import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        fullName: data.fullName,
        pickUpDate: new Date(data.pickUpDate),
        pickUpTime: data.pickUpTime,
        fromAddress: data.fromAddress,
        toAddress: data.toAddress,
        additionalStops: data.additionalStops,
        fromCoords: data.fromCoords,
        toCoords: data.toCoords,
        stopCoords: data.stopCoords,
        passengers: data.passengers,
        checkedLuggage: data.checkedLuggage,
        handLuggage: data.handLuggage,
        preferredVehicle: data.preferredVehicle,
        email: data.email,
        phone: data.phone,
        specialRequests: data.specialRequests,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
