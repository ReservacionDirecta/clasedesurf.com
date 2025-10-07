'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Mail, Phone, Star, Award, BookOpen, Calendar } from 'lucide-react';

export default function InstructorProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [instructorData, setInstructorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'INSTRUCTOR') {
      router.push('/dashboard/student/profile');
      return;
    }

    fetchInstructorProfile();
  }, [session, status, router]);

  const fetchInstructorProfile = async () => {
    try {
      // Aquí harías la llamada real a la API
      // Por ahora usamos datos del instructor Gabriel
      setInstructorData({
        name: 'Gabriel Barrera',
        email: 'gbarrera@clasedesurf.com',
        phone: '+51 987 654 321',
        age: 29,
        bio: 'Instructor profesional de surf con más de 8 años de experiencia. Especialista en enseñanza para principiantes y técnicas avanzadas. Apasionado por el océano y comprometido con la seguridad de sus estudiantes.',
        yearsExperience: 8,
        rating: 4.9,
        totalReviews: 47,
        specialties: [
          'Surf para principiantes',
          'Técnicas avanzadas',
          'Longboard',
          'Seguridad en el agua',
          'Competición'
        ],
        certifications: [
          'ISA Level 2 Instructor',
          'Primeros Auxilios Certificado',
          'RCP Avanzado',
          'Salvavidas Profesional'
        ],
        school: 'Escuela de Surf Lima'
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching instructor profile:', error);
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/instructor')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Volver al Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil de Instructor</h1>
          <p className="text-gray-600 mt-2">Gestiona tu información profesional</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{instructorData?.name}</h2>
                <p className="text-gray-600">{instructorData?.school}</p>
                
                <div className="flex items-center justify-center mt-4">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-lg font-semibold">{instructorData?.rating}</span>
                  <span className="ml-1 text-gray-600">({instructorData?.totalReviews} reseñas)</span>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-blue-900 font-medium">
                      {instructorData?.yearsExperience} años de experiencia
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{instructorData?.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium">{instructorData?.phone}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Edad</p>
                    <p className="font-medium">{instructorData?.age} años</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Biografía</h3>
              <p className="text-gray-700 leading-relaxed">{instructorData?.bio}</p>
            </div>

            {/* Specialties */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Especialidades
              </h3>
              <div className="flex flex-wrap gap-2">
                {instructorData?.specialties?.map((specialty: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Certificaciones
              </h3>
              <div className="space-y-2">
                {instructorData?.certifications?.map((cert: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <Award className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-gray-700">{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Editar Perfil
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Ver Mis Clases
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Mis Estudiantes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}