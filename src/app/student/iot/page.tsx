import { db } from "@/lib/db";
import { iotDevices, iotSensorData } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { PageHeader } from "@/components/ui";
import IotDashboardView from "@/components/iot/IotDashboardView";

export const instant = false;

export default async function StudentIotPage() {
  const [devices, readings] = await Promise.all([
    db.select().from(iotDevices),
    db.select().from(iotSensorData).orderBy(desc(iotSensorData.measuredAt)).limit(20),
  ]);

  return (
    <>
      <PageHeader
        title="Telemetri & Riset IoT"
        description="Pantau pembacaan sensor tanah (NPK, Suhu, Kelembaban, pH, EC) secara real-time untuk penelitian Anda."
      />
      <IotDashboardView
        initialDevices={devices}
        initialReadings={readings.map((r) => ({
          ...r,
          measuredAt: r.measuredAt.toISOString(),
        }))}
      />
    </>
  );
}
