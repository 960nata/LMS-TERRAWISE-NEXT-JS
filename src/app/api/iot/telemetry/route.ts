import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { iotDevices, iotSensorData } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const deviceCode = searchParams.get("device");

  try {
    const devices = await db.select().from(iotDevices);

    let readings: (typeof iotSensorData.$inferSelect)[] = [];
    if (deviceCode) {
      const [target] = await db
        .select()
        .from(iotDevices)
        .where(eq(iotDevices.deviceCode, deviceCode))
        .limit(1);
      if (target) {
        readings = await db
          .select()
          .from(iotSensorData)
          .where(eq(iotSensorData.deviceId, target.id))
          .orderBy(desc(iotSensorData.measuredAt))
          .limit(20);
      } else {
        readings = [];
      }
    } else {
      readings = await db
        .select()
        .from(iotSensorData)
        .orderBy(desc(iotSensorData.measuredAt))
        .limit(20);
    }

    return NextResponse.json({
      success: true,
      devices,
      latest: readings[0] ?? null,
      history: readings,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deviceCode, soilTemperature, soilMoisture, nitrogen, phosphorus, potassium, ph, ec } = body;

    let deviceId: string | undefined;
    if (deviceCode) {
      const [d] = await db
        .select()
        .from(iotDevices)
        .where(eq(iotDevices.deviceCode, deviceCode))
        .limit(1);
      deviceId = d?.id;
    }

    if (!deviceId) {
      const [first] = await db.select().from(iotDevices).limit(1);
      deviceId = first?.id;
    }

    const [inserted] = await db
      .insert(iotSensorData)
      .values({
        deviceId,
        soilTemperature: soilTemperature ?? Number((25 + Math.random() * 5).toFixed(1)),
        soilMoisture: soilMoisture ?? Number((60 + Math.random() * 15).toFixed(1)),
        nitrogen: nitrogen ?? Number((40 + Math.random() * 10).toFixed(1)),
        phosphorus: phosphorus ?? Number((28 + Math.random() * 8).toFixed(1)),
        potassium: potassium ?? Number((75 + Math.random() * 15).toFixed(1)),
        ph: ph ?? Number((6.3 + Math.random() * 0.8).toFixed(2)),
        ec: ec ?? Number((1.2 + Math.random() * 0.5).toFixed(2)),
      })
      .returning();

    return NextResponse.json({ success: true, reading: inserted });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
