"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";

export type SensorReading = {
  id: string;
  deviceId?: string | null;
  soilTemperature: number;
  soilMoisture: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  ec: number;
  measuredAt: string | Date;
};

export type Device = {
  id: string;
  name: string;
  deviceCode: string;
  status: string;
  location: string;
};

type Props = {
  initialDevices: Device[];
  initialReadings: SensorReading[];
  canManage?: boolean;
};

export default function IotDashboardView({ initialDevices, initialReadings, canManage = false }: Props) {
  const [devices] = useState<Device[]>(initialDevices);
  const [selectedDevice, setSelectedDevice] = useState<string>(devices[0]?.deviceCode ?? "");
  const [readings, setReadings] = useState<SensorReading[]>(initialReadings);
  const [isReading, setIsReading] = useState(false);

  const latest = readings[0] ?? {
    soilTemperature: 27.4,
    soilMoisture: 68.5,
    nitrogen: 45.2,
    phosphorus: 32.1,
    potassium: 84.7,
    ph: 6.8,
    ec: 1.45,
    measuredAt: new Date(),
  };

  async function handleTakeReading() {
    setIsReading(true);
    try {
      const res = await fetch("/api/iot/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceCode: selectedDevice }),
      });
      const data = await res.json();
      if (data.success && data.reading) {
        setReadings((prev) => [data.reading, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReading(false);
    }
  }

  // Evaluasi kondisi kesuburan
  const isPhOptimal = latest.ph >= 6.0 && latest.ph <= 7.2;
  const isMoistureOptimal = latest.soilMoisture >= 60 && latest.soilMoisture <= 80;
  const isNpkOptimal = latest.nitrogen >= 40 && latest.phosphorus >= 25 && latest.potassium >= 70;

  return (
    <div className="space-y-8">
      {/* Status Bar */}
      <div className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex items-center gap-4">
          <div className="relative flex size-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-4 rounded-full bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-black uppercase tracking-wider md:text-base">
                Node ESP8266 Terhubung
              </h2>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                MQTT Online
              </span>
              {canManage && (
                <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                  Kontrol Administrator
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-gray-400">
              Sinkronisasi data telemetri otomatis setiap 10 detik ke broker cloud.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-black outline-none focus:border-black"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.deviceCode}>
                {d.name} ({d.deviceCode})
              </option>
            ))}
          </select>

          <button
            onClick={handleTakeReading}
            disabled={isReading}
            className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white transition-all hover:bg-black/80 active:scale-95 disabled:opacity-60"
          >
            <Icon name="sync" className={isReading ? "animate-spin" : ""} size={16} />
            <span>{isReading ? "Mengambil Data..." : "Ambil Sampel Baru"}</span>
          </button>
        </div>
      </div>

      {/* Sensor Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 md:gap-6">
        {/* Suhu */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-black">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Suhu Tanah</span>
            <span className="material-symbols-outlined text-amber-500">thermostat</span>
          </div>
          <div className="mt-4 text-3xl font-black text-black md:text-4xl">
            {latest.soilTemperature}°C
          </div>
          <p className="mt-1 text-xs text-emerald-600 font-medium">Rentang Normal (22-30°C)</p>
        </div>

        {/* Kelembaban */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-black">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Kelembaban</span>
            <span className="material-symbols-outlined text-blue-500">water_drop</span>
          </div>
          <div className="mt-4 text-3xl font-black text-black md:text-4xl">
            {latest.soilMoisture}%
          </div>
          <p className="mt-1 text-xs text-emerald-600 font-medium">
            {isMoistureOptimal ? "Kadar Air Optimal" : "Perlu Penyesuaian"}
          </p>
        </div>

        {/* pH Tanah */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-black">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Tingkat pH</span>
            <span className="material-symbols-outlined text-purple-500">science</span>
          </div>
          <div className="mt-4 text-3xl font-black text-black md:text-4xl">
            {latest.ph}
          </div>
          <p className="mt-1 text-xs text-emerald-600 font-medium">
            {isPhOptimal ? "Netral Ideal (6.0-7.2)" : "Perlu Pengapuran"}
          </p>
        </div>

        {/* Konduktivitas Listrik */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-black">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Konduktivitas (EC)</span>
            <span className="material-symbols-outlined text-indigo-500">bolt</span>
          </div>
          <div className="mt-4 text-3xl font-black text-black md:text-4xl">
            {latest.ec} <span className="text-sm font-bold text-gray-400">mS/cm</span>
          </div>
          <p className="mt-1 text-xs text-gray-400 font-medium">Salinitas Tanah Aman</p>
        </div>
      </div>

      {/* NPK Nitrogen, Fosfor, Kalium Panel */}
      <div className="rounded-3xl border border-black bg-black p-6 text-white md:p-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Sensor Spektrometri 3-in-1
            </span>
            <h3 className="text-xl font-black uppercase tracking-tight md:text-2xl">
              Unsur Hara Makro Tanah (NPK)
            </h3>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold">
            <span className="size-2 rounded-full bg-emerald-400" />
            <span>{isNpkOptimal ? "Status Nutrisi: Sangat Subur" : "Status Nutrisi: Cukup"}</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Nitrogen */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase">
              <span>Nitrogen (N)</span>
              <span className="text-emerald-400">Target: 40-60</span>
            </div>
            <div className="mt-3 text-4xl font-black">{latest.nitrogen}</div>
            <div className="mt-1 text-xs text-gray-400">mg/kg (ppm)</div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: `${Math.min(100, (latest.nitrogen / 60) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fosfor */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase">
              <span>Fosfor (P)</span>
              <span className="text-emerald-400">Target: 25-45</span>
            </div>
            <div className="mt-3 text-4xl font-black">{latest.phosphorus}</div>
            <div className="mt-1 text-xs text-gray-400">mg/kg (ppm)</div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-blue-400 rounded-full"
                style={{ width: `${Math.min(100, (latest.phosphorus / 45) * 100)}%` }}
              />
            </div>
          </div>

          {/* Kalium */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase">
              <span>Kalium (K)</span>
              <span className="text-emerald-400">Target: 70-100</span>
            </div>
            <div className="mt-3 text-4xl font-black">{latest.potassium}</div>
            <div className="mt-1 text-xs text-gray-400">mg/kg (ppm)</div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${Math.min(100, (latest.potassium / 100) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Historical Telemetry Table */}
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-6 md:p-8">
          <div>
            <h3 className="text-base font-extrabold uppercase tracking-tight text-black md:text-lg">
              Riwayat Telemetri Sensor Lapangan
            </h3>
            <p className="mt-0.5 text-xs text-gray-400">
              Data log pengukuran sensor terbaru yang direkam oleh sistem Terrawise.
            </p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
            {readings.length} Rekaman
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-100 bg-gray-50/60 font-bold text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Waktu Pengukuran</th>
                <th className="px-6 py-4">Suhu (°C)</th>
                <th className="px-6 py-4">Kelembaban (%)</th>
                <th className="px-6 py-4">N (mg/kg)</th>
                <th className="px-6 py-4">P (mg/kg)</th>
                <th className="px-6 py-4">K (mg/kg)</th>
                <th className="px-6 py-4">pH</th>
                <th className="px-6 py-4">EC (mS/cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {readings.map((r, i) => (
                <tr key={r.id ?? i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-black font-semibold" suppressHydrationWarning>
                    {new Date(r.measuredAt).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-6 py-4">{r.soilTemperature}°C</td>
                  <td className="px-6 py-4">{r.soilMoisture}%</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{r.nitrogen}</td>
                  <td className="px-6 py-4 font-bold text-blue-600">{r.phosphorus}</td>
                  <td className="px-6 py-4 font-bold text-amber-600">{r.potassium}</td>
                  <td className="px-6 py-4 font-bold">{r.ph}</td>
                  <td className="px-6 py-4">{r.ec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
