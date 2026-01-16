"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Package, Plus, Edit, Trash2, Search, Box } from 'lucide-react';
import ProductForm from '@/components/forms/ProductForm';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

const buildBackendUrl = (path: string): string => {
  return path.startsWith('/') ? `/api${path}` : `/api/${path}`;
};

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  isActive: boolean;
  schoolId: number;
}

export default function SchoolInventoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch(buildBackendUrl('/users/profile'), { headers });
      if (res.ok) {
        const data = await res.json();
        // A School Admin should have an instructor record with schoolId
        if (data.instructor?.schoolId) {
          setSchoolId(data.instructor.schoolId);
        } else if (data.role === 'ADMIN') {
           // Admin can see everything, but for this page we might need a default or redirect
           // Actually School admins use this page.
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [session]);

  const fetchProducts = useCallback(async (sid: number) => {
    try {
      setLoading(true);
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(buildBackendUrl(`/products/school/${sid}`), { headers });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [session, status, fetchProfile, router]);

  useEffect(() => {
    if (schoolId) {
      fetchProducts(schoolId);
    }
  }, [schoolId, fetchProducts]);

  const handleCreateProduct = async (formData: FormData) => {
    if (!schoolId) return;

    try {
      setIsCreating(true);
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      formData.append('schoolId', schoolId.toString());

      const res = await fetch(buildBackendUrl('/products'), {
        method: 'POST',
        headers,
        body: formData
      });
      
      if (!res.ok) {
        throw new Error('No se pudo crear el producto');
      }
      
      await fetchProducts(schoolId);
      setShowCreateModal(false);
    } catch (error) {
        console.error(error);
        alert('Error al crear producto');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateProduct = async (formData: FormData) => {
    if (!selectedProduct || !schoolId) return;
    try {
      setIsUpdating(true);
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(buildBackendUrl(`/products/${selectedProduct.id}`), {
        method: 'PUT',
        headers,
        body: formData
      });
      
      if (!res.ok) {
        throw new Error('No se pudo actualizar el producto');
      }
      
      await fetchProducts(schoolId);
      setShowEditModal(false);
      setSelectedProduct(null);
    } catch (error) {
       console.error(error);
       alert('Error al actualizar producto');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDeleteProduct = async () => {
    if (!deleteTarget || !schoolId) return;
    try {
      setIsDeleting(true);
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(buildBackendUrl(`/products/${deleteTarget.id}`), {
        method: 'DELETE',
        headers
      });
      
      if (!res.ok) {
        throw new Error('No se pudo eliminar el producto');
      }
      
      await fetchProducts(schoolId);
      setDeleteTarget(null);
    } catch (error) {
         console.error(error);
         alert('Error al eliminar producto');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryLabel = (cat: string) => {
     switch(cat) {
         case 'EQUIPMENT': return 'Equipamiento';
         case 'MERCH': return 'Merch';
         case 'FOOD': return 'Comida';
         default: return 'Otro';
     }
  };

  const getCategoryColor = (cat: string) => {
     switch(cat) {
         case 'EQUIPMENT': return 'bg-blue-100 text-blue-800';
         case 'MERCH': return 'bg-purple-100 text-purple-800';
         case 'FOOD': return 'bg-orange-100 text-orange-800';
         default: return 'bg-gray-100 text-gray-800';
     }
  };

  if (status === 'loading' || (session && !schoolId && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventario de la Escuela</h1>
            <p className="mt-1 text-sm text-gray-500">Gestiona los productos adicionales que tus alumnos pueden adquirir.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Producto
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 max-w-md">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Loading */}
        {loading ? (
             <div className="p-12 text-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                 <p className="text-gray-500">Cargando inventario...</p>
             </div>
        ) : (
            /* Products Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow ${!product.isActive ? 'opacity-75 bg-gray-50' : ''}`}>
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative h-48 w-full">
                    {product.image ? (
                       <ImageWithFallback 
                         src={product.image} 
                         alt={product.name}
                         fill
                         className="object-cover"
                       />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                       </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(product.category)} mb-2`}>
                            {getCategoryLabel(product.category)}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                       </div>
                       <span className="text-lg font-bold text-blue-600">S/{product.price}</span>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">{product.description}</p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                       <div className="text-xs text-gray-400">
                          {product.isActive ? 'Activo' : 'Inactivo'}
                       </div>
                       <div className="flex gap-2">
                          <button 
                            onClick={() => { setSelectedProduct(product); setShowEditModal(true); }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          >
                             <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteTarget(product)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Empty State */}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
                   <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                   <h3 className="text-lg font-medium text-gray-900">No hay productos</h3>
                   <p className="text-gray-500">Agrega productos para que tus alumnos puedan verlos al reservar.</p>
                </div>
              )}
            </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Nuevo Producto</h2>
                <ProductForm 
                  onSubmit={handleCreateProduct}
                  onCancel={() => setShowCreateModal(false)}
                  isLoading={isCreating}
                />
             </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Editar Producto</h2>
                <ProductForm 
                  product={selectedProduct}
                  onSubmit={handleUpdateProduct}
                  onCancel={() => setShowEditModal(false)}
                  isLoading={isUpdating}
                />
             </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteTarget && (
           <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Desactivar producto</h3>
                <p className="text-gray-600 mb-6">¿Estás seguro de que quieres eliminar <span className="font-bold">{deleteTarget.name}</span>? Dejará de estar visible para los estudiantes.</p>
                <div className="flex justify-end gap-3">
                   <button 
                     onClick={() => setDeleteTarget(null)}
                     className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                   >
                     Cancelar
                   </button>
                   <button 
                     onClick={handleDeleteProduct}
                     className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                   >
                     {isDeleting ? 'Eliminando...' : 'Eliminar'}
                   </button>
                </div>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}
