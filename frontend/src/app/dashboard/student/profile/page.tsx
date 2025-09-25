"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User } from "@/types";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  type ClassAttendance = {
    classId: number;
    title: string;
    count: number;
    lastAttended?: string;
  };

  const [userProfile, setUserProfile] = useState<Partial<User>>({
    name: "",
    email: "",
    age: undefined,
    weight: undefined,
    height: undefined,
    canSwim: false,
    injuries: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // additional student stats
  const [attendances, setAttendances] = useState<ClassAttendance[]>([]);
  const [totalClasses, setTotalClasses] = useState(0);
  const [bestDay, setBestDay] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null); // data url preview

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    // Fetch user profile data from API
    const fetchProfile = async () => {
      try {
        const token = (session as any)?.backendToken;
        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        const res = await fetch(`${BACKEND}/users/profile`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await res.json();
        setUserProfile({
          name: data.name || "",
          email: data.email || "",
          age: data.age || undefined,
          weight: data.weight || undefined,
          height: data.height || undefined,
          canSwim: data.canSwim || false,
          injuries: data.injuries || "",
          phone: data.phone || "",
        });

        // also fetch reservations to compute stats
        try {
          const res2 = await fetch(`${BACKEND}/reservations`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          if (res2.ok) {
            const reservations = await res2.json();
            // compute per-class attendance and best day
            const byClass: Record<string, ClassAttendance> = {};
            const dayCount: Record<string, number> = {};
            reservations.forEach((r: any) => {
              const cls = r.class;
              const title = cls?.title || "Clase";
              const id = cls?.id || 0;
              const date = cls?.date ? new Date(cls.date) : null;
              const weekday = date ? date.toLocaleDateString(undefined, { weekday: "long" }) : "Desconocido";
              dayCount[weekday] = (dayCount[weekday] || 0) + 1;
              const key = String(id);
              if (!byClass[key]) {
                byClass[key] = { classId: id, title, count: 0, lastAttended: date ? date.toISOString() : undefined };
              }
              byClass[key].count += 1;
              if (date && (!byClass[key].lastAttended || new Date(byClass[key].lastAttended!) < date)) {
                byClass[key].lastAttended = date.toISOString();
              }
            });
            const attendanceList = Object.values(byClass).sort((a, b) => b.count - a.count);
            setAttendances(attendanceList);
            const total = reservations.length;
            setTotalClasses(total);
            // best day
            let best = null;
            let bestNum = 0;
            for (const d in dayCount) {
              if (dayCount[d] > bestNum) {
                bestNum = dayCount[d];
                best = d;
              }
            }
            setBestDay(best);
          }
        } catch (_e) {
          // ignore stats errors
        }
      } catch (err: any) {
        setError(err.message || "Error loading profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session, status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type, checked } = e.target as HTMLInputElement;
    setUserProfile((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfilePhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const token = (session as any)?.backendToken;
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${BACKEND}/users/profile`, {
        method: "PUT",
        headers,
        body: JSON.stringify(userProfile),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      // Optionally update the session if the name changed
      await update({ name: userProfile.name });
    } catch (err: any) {
      setError(err.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  // compute level (1-5) based on totalClasses
  function computeLevel(total: number) {
    // thresholds: 0-2 -> 1, 3-5 ->2, 6-9 ->3, 10-14 ->4, 15+ ->5
    if (total >= 15) return { level: 5, percent: 100 };
    if (total >= 10) return { level: 4, percent: Math.round(((total - 10) / 5) * 100) };
    if (total >= 6) return { level: 3, percent: Math.round(((total - 6) / 4) * 100) };
    if (total >= 3) return { level: 2, percent: Math.round(((total - 3) / 3) * 100) };
    return { level: 1, percent: Math.round((total / 3) * 100) };
  }

  // Generate simple teacher recommendations heuristically
  function teacherRecommendations() {
    const recs: string[] = [];
    if (!userProfile.canSwim) recs.push('Recomiendo tomar una clase de natación básica antes de próximas sesiones en el mar.');
    if (userProfile.injuries) recs.push('Tener cuidado con ejercicios que involucren:' + userProfile.injuries);
    if (totalClasses < 3) recs.push('Practicar pop-up en la arena 10 minutos por día.');
    if (totalClasses >= 3) recs.push('Excelente avance — trabajar en la postura trasera para mantener la dirección.');
    if (recs.length === 0) recs.push('Buen trabajo — mantener consistencia y asistir a clases regularmente.');
    return recs;
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="bg-white dark:bg-card text-gray-900 dark:text-white shadow-lg rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: photo & basic info */}
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="w-40 h-40 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                {profilePhoto ? (
                  // preview uploaded photo
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : userProfile.name ? (
                  <span className="text-3xl font-bold text-gray-700">{(userProfile.name || '').split(' ').map(n=>n[0]).join('').toUpperCase()}</span>
                ) : (
                  <span className="text-3xl font-bold text-gray-700">U</span>
                )}
              </div>
              <label htmlFor="photo" className="mt-3 text-sm">Change photo</label>
              <input id="photo" aria-label="Change photo" type="file" accept="image/*" onChange={handlePhoto} className="mt-2" />
              <h3 className="text-xl font-bold mt-4">{userProfile.name}</h3>
              <p className="text-sm text-gray-500">{userProfile.email}</p>
              <div className="mt-4 w-full">
                <div className="text-sm font-medium">Level Progress</div>
                <LevelProgress total={totalClasses} />
                <div className="mt-2 text-sm text-gray-600">Total clases: <strong>{totalClasses}</strong></div>
                <div className="mt-1 text-sm text-gray-600">Mejor día: <strong>{bestDay || '—'}</strong></div>
              </div>
            </div>

            {/* Right: editable profile and stats */}
            <div className="w-full md:w-2/3">
              <h3 className="text-2xl font-bold">Your Profile</h3>
              <form onSubmit={handleSubmit}>
                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div>
                    <label className="block" htmlFor="name">Name</label>
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                      id="name"
                      value={userProfile.name || ''}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block" htmlFor="email">Email</label>
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full px-4 py-2 mt-2 border rounded-md bg-gray-100 cursor-not-allowed"
                      id="email"
                      value={userProfile.email || ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block" htmlFor="age">Age</label>
                    <input
                      type="number"
                      placeholder="Age"
                      className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                      id="age"
                      value={userProfile.age || ''}
                      onChange={handleChange}
                      min="10"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block" htmlFor="weight">Weight (kg)</label>
                    <input
                      type="number"
                      placeholder="Weight in kg"
                      className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                      id="weight"
                      value={userProfile.weight || ''}
                      onChange={handleChange}
                      min="30"
                      max="200"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block" htmlFor="height">Height (cm)</label>
                    <input
                      type="number"
                      placeholder="Height in cm"
                      className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                      id="height"
                      value={userProfile.height || ''}
                      onChange={handleChange}
                      min="100"
                      max="250"
                      step="0.1"
                    />
                  </div>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600 rounded"
                      id="canSwim"
                      checked={userProfile.canSwim || false}
                      onChange={handleChange}
                    />
                    <label className="ml-2 block text-gray-900" htmlFor="canSwim">Can Swim?</label>
                  </div>
                  <div>
                    <label className="block" htmlFor="injuries">Past Injuries/Medical Conditions</label>
                    <textarea
                      placeholder="Any past injuries or medical conditions?"
                      className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                      id="injuries"
                      value={userProfile.injuries || ''}
                      onChange={handleChange}
                      rows={3}
                    ></textarea>
                  </div>
                  <div>
                    <label className="block" htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g., +1234567890"
                      className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                      id="phone"
                      value={userProfile.phone || ''}
                      onChange={handleChange}
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                  {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
                  <div className="flex items-baseline justify-between">
                    <button
                      type="submit"
                      className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-6">
                <h4 className="text-lg font-semibold">Class attendance</h4>
                <div className="mt-3 grid grid-cols-1 gap-3">
                  {attendances.length === 0 ? (
                    <p className="text-sm text-gray-600">No classes attended yet.</p>
                  ) : (
                    attendances.map((a) => (
                      <div key={a.classId} className="p-3 bg-gray-50 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{a.title}</div>
                            <div className="text-sm text-gray-500">Última asistencia: {a.lastAttended ? new Date(a.lastAttended).toLocaleDateString() : '—'}</div>
                          </div>
                          <div className="text-sm font-semibold">Asistencias: {a.count}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold">Recomendaciones del profe</h4>
                  <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
                    {teacherRecommendations().map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// LevelProgress component
function LevelProgress({ total }: { total: number }) {
  const { level, percent } = (function computeLevel(total: number) {
    if (total >= 15) return { level: 5, percent: 100 };
    if (total >= 10) return { level: 4, percent: Math.round(((total - 10) / 5) * 100) };
    if (total >= 6) return { level: 3, percent: Math.round(((total - 6) / 4) * 100) };
    if (total >= 3) return { level: 2, percent: Math.round(((total - 3) / 3) * 100) };
    return { level: 1, percent: Math.round((total / 3) * 100) };
  })(total);

  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        <div className="text-sm font-semibold">Nivel {level}</div>
        <div className="flex-1">
          <div className="w-full">
            <progress value={percent} max={100} className="w-full h-3 appearance-none" />
          </div>
        </div>
        <div className="text-sm w-12 text-right">{percent}%</div>
      </div>
    </div>
  );
}
