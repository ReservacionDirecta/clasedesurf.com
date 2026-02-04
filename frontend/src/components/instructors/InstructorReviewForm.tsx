'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { StarIcon } from '@/components/ui/Icons';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface InstructorReviewFormProps {
  instructorId: number;
  onReviewAdded: () => void;
}

export function InstructorReviewForm({ instructorId, onReviewAdded }: InstructorReviewFormProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!session) {
    return (
      <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-2">¿Tomas clases con este instructor?</h3>
        <p className="text-slate-600 mb-4 text-sm">
          Inicia sesión para dejar tu opinión y ayudar a otros estudiantes.
        </p>
        <Link href="/auth/login">
          <Button variant="outline" className="text-sm">
            Iniciar Sesión
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/instructors/${instructorId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          comment,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al enviar la reseña');
      }

      setSuccess(true);
      setComment('');
      setRating(0);
      onReviewAdded();

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h3 className="font-bold text-slate-900 mb-4">Escribe una reseña</h3>

      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium animate-fadeIn">
          ¡Gracias! Tu reseña ha sido publicada.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium animate-fadeIn">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Calificación</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <StarIcon
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-2">
            Comentario <span className="text-slate-400 font-normal">(Opcional)</span>
          </label>
          <textarea
            id="comment"
            rows={4}
            className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm resize-none"
            placeholder="Comparte tu experiencia con este instructor..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publicando...
              </>
            ) : (
              'Publicar Reseña'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
