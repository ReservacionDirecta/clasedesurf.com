'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';
import { useSession } from 'next-auth/react';
import { MultiDatePicker } from '@/components/ui/MultiDatePicker';

interface Class {
  id: number;
  title: string;
  school?: { name: string };
}

interface Schedule {
  type: 'RECURRING' | 'SINGLE' | 'DATE_RANGE' | 'SPECIFIC_DATES';
  dayOfWeek?: number;
  startTime: string;
  endTime?: string;
  times: string[];
  specificDate?: string;
  rangeStart?: string;
  rangeEnd?: string;
  dates?: string[];
}

interface EditDatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DAYS = [
  { label: 'Lun', value: 1 },
  { label: 'Mar', value: 2 },
  { label: 'Mié', value: 3 },
  { label: 'Jue', value: 4 },
  { label: 'Vie', value: 5 },
  { label: 'Sáb', value: 6 },
  { label: 'Dom', value: 0 }
];

export function EditDatesModal({ isOpen, onClose, onSuccess }: EditDatesModalProps) {
  const { showSuccess, showError } = useToast();
  const { data: session } = useSession();

  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [currentSchedules, setCurrentSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<'select' | 'edit'>('select');

  // Load classes on modal open
  useEffect(() => {
    if (isOpen && session) {
      loadClasses();
    } else {
      resetModal();
    }
  }, [isOpen, session]);

  const resetModal = () => {
    setClasses([]);
    setSelectedClass(null);
    setCurrentSchedules([]);
    setStep('select');
  };

  const loadClasses = async () => {
    try {
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/classes?limit=50', { headers });
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (err) {
      console.error('Error loading classes:', err);
    }
  };

  const loadClassSchedules = async (classId: number) => {
    setLoading(true);
    try {
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/classes/${classId}`, { headers });
      if (res.ok) {
        const classData = await res.json();
        setCurrentSchedules(classData.schedules || []);
        setStep('edit');
      }
    } catch (err) {
      showError('Error', 'No se pudieron cargar los horarios de la clase');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedules = async () => {
    if (!selectedClass) return;

    setSaving(true);
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/classes/${selectedClass.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ schedules: currentSchedules })
      });

      if (res.ok) {
        showSuccess('Horarios actualizados', 'Los horarios de la clase han sido modificados exitosamente');
        onSuccess();
        onClose();
      } else {
        throw new Error('Error al actualizar horarios');
      }
    } catch (err: any) {
      showError('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const addSchedule = (type: Schedule['type']) => {
    const newSchedule: Schedule = {
      type,
      startTime: '',
      times: ['']
    };

    if (type === 'RECURRING') {
      newSchedule.dayOfWeek = 1; // Monday
    }

    setCurrentSchedules([...currentSchedules, newSchedule]);
  };

  const updateSchedule = (index: number, updates: Partial<Schedule>) => {
    const updated = [...currentSchedules];
    updated[index] = { ...updated[index], ...updates };
    setCurrentSchedules(updated);
  };

  const removeSchedule = (index: number) => {
    setCurrentSchedules(currentSchedules.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-indigo-600" />
            Editar Horarios de Clases
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {step === 'select' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Seleccionar Clase</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Elige la clase cuyos horarios deseas modificar. Solo podrás editar clases de tu escuela.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {classes.map(cls => (
                    <button
                      key={cls.id}
                      onClick={() => {
                        setSelectedClass(cls);
                        loadClassSchedules(cls.id);
                      }}
                      className="p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 text-left transition-all"
                    >
                      <h4 className="font-semibold text-slate-900">{cls.title}</h4>
                      <p className="text-sm text-slate-600">{cls.school?.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'edit' && selectedClass && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Editando: {selectedClass.title}</h3>
                  <p className="text-sm text-slate-600">{selectedClass.school?.name}</p>
                </div>
                <Button variant="outline" onClick={() => setStep('select')}>
                  Cambiar Clase
                </Button>
              </div>

              {/* Current Schedules */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-700">Horarios Actuales</h4>
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addSchedule('RECURRING')}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Recurrente
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addSchedule('SINGLE')}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Día Único
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addSchedule('DATE_RANGE')}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Rango
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addSchedule('SPECIFIC_DATES')}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Fechas Específicas
                    </Button>
                  </div>
                </div>

                {currentSchedules.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No hay horarios configurados. Agrega uno nuevo arriba.
                  </div>
                )}

                {currentSchedules.map((schedule, index) => (
                  <div key={index} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium text-slate-800 capitalize">
                        {schedule.type === 'RECURRING' && 'Horario Recurrente'}
                        {schedule.type === 'SINGLE' && 'Día Único'}
                        {schedule.type === 'DATE_RANGE' && 'Rango de Fechas'}
                        {schedule.type === 'SPECIFIC_DATES' && 'Fechas Específicas'}
                      </h5>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSchedule(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {schedule.type === 'RECURRING' && (
                        <div>
                          <label className="text-sm font-medium text-slate-600">Días de la semana</label>
                          <div className="flex gap-1 mt-1">
                            {DAYS.map(day => (
                              <button
                                key={day.value}
                                onClick={() => updateSchedule(index, { dayOfWeek: day.value })}
                                className={`px-3 py-1 text-xs rounded ${
                                  schedule.dayOfWeek === day.value
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                }`}
                              >
                                {day.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {schedule.type === 'SINGLE' && (
                        <div>
                          <label className="text-sm font-medium text-slate-600">Fecha</label>
                          <input
                            type="date"
                            value={schedule.specificDate || ''}
                            onChange={e => updateSchedule(index, { specificDate: e.target.value })}
                            className="mt-1 w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-2.5 text-sm transition-all shadow-sm border placeholder:text-slate-400"
                          />
                        </div>
                      )}

                      {schedule.type === 'DATE_RANGE' && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-slate-600">Fecha Inicio</label>
                            <input
                              type="date"
                              value={schedule.rangeStart || ''}
                              onChange={e => updateSchedule(index, { rangeStart: e.target.value })}
                              className="mt-1 w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-2.5 text-sm transition-all shadow-sm border placeholder:text-slate-400"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-600">Fecha Fin</label>
                            <input
                              type="date"
                              value={schedule.rangeEnd || ''}
                              onChange={e => updateSchedule(index, { rangeEnd: e.target.value })}
                              className="mt-1 w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-2.5 text-sm transition-all shadow-sm border placeholder:text-slate-400"
                            />
                          </div>
                        </>
                      )}

                      {schedule.type === 'SPECIFIC_DATES' && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-slate-600">Fechas Específicas</label>
                          <MultiDatePicker
                            selectedDates={schedule.dates || []}
                            onChange={dates => updateSchedule(index, { dates })}
                            className="mt-1"
                          />
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-slate-600">Horarios</label>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 mt-1">
                          {schedule.times.map((time, timeIndex) => (
                            <div key={timeIndex} className="flex gap-1 w-full sm:w-auto">
                              <input
                                type="time"
                                value={time}
                                onChange={e => {
                                  const newTimes = [...schedule.times];
                                  newTimes[timeIndex] = e.target.value;
                                  updateSchedule(index, { times: newTimes });
                                }}
                                className="flex-1 sm:w-32 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-2.5 text-sm transition-all shadow-sm border placeholder:text-slate-400"
                              />
                              {schedule.times.length > 1 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newTimes = schedule.times.filter((_, i) => i !== timeIndex);
                                    updateSchedule(index, { times: newTimes });
                                  }}
                                  className="shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newTimes = [...schedule.times, ''];
                              updateSchedule(index, { times: newTimes });
                            }}
                            className="w-full sm:w-auto"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Hora
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'edit' && (
          <div className="p-4 sm:p-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-slate-50/50">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSaveSchedules} disabled={saving} className="w-full sm:w-auto">
              {saving ? 'Guardando...' : 'Guardar Cambios'}
              {!saving && <Save className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}