import { db } from "@/lib/db";
import { iotDevices, iotSensorData, kelas } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import {
  ActionModal,
  Badge,
  DataTable,
  Icon,
  Label,
  PageHeader,
  SectionTitle,
  inputClass,
  primaryButtonClass,
  tdClass,
} from "@/components/ui";
import IotDashboardView from "@/components/iot/IotDashboardView";
import { registerDevice, deleteDevice } from "@/app/actions/iot";

export const instant = false;

export default async function SuperadminIotPage() {
  const [devices, readings, classList] = await Promise.all([
    db.select().from(iotDevices),
    db.select().from(iotSensorData).orderBy(desc(iotSensorData.measuredAt)).limit(20),
    db.select({ id: kelas.id, name: kelas.name }).from(kelas),
  ]);

  return (
    <>
      <PageHeader
        title="Manajemen Infrastruktur Perangkat &amp; Sensor"
        description="Pantau seluruh ekosistem node mikrokontroler ESP8266/ESP32, registrasi probe sensor baru, dan validasi integritas telemetri tanah."
        action={
          <ActionModal
            triggerText="Registrasi Node Sensor"
            triggerIcon="memory"
            title="Registrasi Node Sensor Baru"
            description="Tambahkan perangkat probe mikrokontroler ESP8266/ESP32 ke jaringan telemetri."
          >
            <form action={registerDevice} className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Perangkat / Sensor</Label>
                <input
                  id="name"
                  name="name"
                  required
                  placeholder="cth: Terra-NPK-04 (Sensor Lahan C)"
                  className={inputClass}
                />
              </div>
              <div>
                <Label htmlFor="deviceCode">Kode Perangkat (Unik)</Label>
                <input
                  id="deviceCode"
                  name="deviceCode"
                  required
                  placeholder="cth: TW-NPK-004"
                  className={inputClass}
                />
              </div>
              <div>
                <Label htmlFor="location">Lokasi Pemasangan</Label>
                <input
                  id="location"
                  name="location"
                  required
                  placeholder="cth: Greenhouse Riset B2"
                  className={inputClass}
                />
              </div>
              <div>
                <Label htmlFor="kelasId">Alokasi Kelas (Opsional)</Label>
                <select id="kelasId" name="kelasId" className={inputClass} defaultValue="">
                  <option value="">Umum / Tidak Terikat Kelas</option>
                  {classList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-2">
                <button type="submit" className={`${primaryButtonClass} w-full`}>
                  <Icon name="memory" size={18} /> Simpan &amp; Aktifkan Perangkat
                </button>
              </div>
            </form>
          </ActionModal>
        }
      />

      {/* Tabel Perangkat */}
      <section className="mt-8">
        <SectionTitle icon="devices" title="Daftar Node Sensor Terhubung" />
        <DataTable
          columns={[
            { label: "Nama Node" },
            { label: "Kode Unik" },
            { label: "Lokasi Pemasangan" },
            { label: "Status Jaringan" },
            { label: "Aksi", className: "text-right" },
          ]}
        >
          {devices.map((d) => (
            <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
              <td className={tdClass}>
                <span className="font-bold text-black">{d.name}</span>
              </td>
              <td className={`${tdClass} font-mono text-xs font-bold text-gray-500`}>
                {d.deviceCode}
              </td>
              <td className={`${tdClass} text-gray-600`}>{d.location}</td>
              <td className={tdClass}>
                <Badge tone={d.status === "ONLINE" ? "green" : "gray"}>
                  {d.status}
                </Badge>
              </td>
              <td className={`${tdClass} text-right`}>
                <form action={deleteDevice}>
                  <input type="hidden" name="deviceId" value={d.id} />
                  <button
                    type="submit"
                    className="text-xs font-bold text-red-600 hover:text-red-800 underline"
                  >
                    Hapus
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </DataTable>
      </section>

      {/* Real-time Telemetry Monitor */}
      <div className="mt-12">
        <SectionTitle icon="speed" title="Live Telemetri &amp; Diagnostik Real-Time" />
        <IotDashboardView
          initialDevices={devices}
          initialReadings={readings.map((r) => ({
            ...r,
            measuredAt: r.measuredAt.toISOString(),
          }))}
          canManage
        />
      </div>
    </>
  );
}
