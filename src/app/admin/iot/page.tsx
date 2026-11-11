import { db } from "@/lib/db";
import { iotDevices, iotSensorData } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { PageHeader } from "@/components/ui";
import IotDashboardView from "@/components/iot/IotDashboardView";

export const instant = false;

export default async function AdminIotPage() {
  const [devices, readings] = await Promise.all([
    db.select().from(iotDevices),
    db.select().from(iotSensorData).orderBy(desc(iotSensorData.measuredAt)).limit(20),
  ]);

  return (
    <>
      <PageHeader
        title="Monitoring IoT & Sensor"
        description="Pengawasan terpusat perangkat telemetri IoT dan sensor tanah untuk lingkungan kelas dan laboratorium."
      />
      <IotDashboardView
        initialDevices={devices}
        initialReadings={readings.map((r) => ({
          ...r,
          measuredAt: r.measuredAt.toISOString(),
        }))}
        canManage
      />
    </>
  );
}
