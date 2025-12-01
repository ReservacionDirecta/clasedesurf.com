'use client';

import DiscountCodeManager from '@/components/discounts/DiscountCodeManager';

export default function AdminDiscountsPage() {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Gestión Global de Descuentos</h1>
                    <p className="text-gray-500">
                        Crea y administra códigos de descuento para todas las escuelas o específicos por escuela.
                        Como Super Admin, puedes crear descuentos de hasta el 100%.
                    </p>
                </div>

                <DiscountCodeManager userRole="ADMIN" />
            </div>
        </div>
    );
}
