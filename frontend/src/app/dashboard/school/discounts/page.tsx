'use client';

import DiscountCodeManager from '@/components/discounts/DiscountCodeManager';

export default function SchoolDiscountsPage() {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Mis Códigos de Descuento</h1>
                    <p className="text-gray-500">
                        Crea códigos promocionales para tus clases.
                        El descuento máximo permitido para escuelas es del 50%.
                    </p>
                </div>

                <DiscountCodeManager userRole="SCHOOL_ADMIN" />
            </div>
        </div>
    );
}
