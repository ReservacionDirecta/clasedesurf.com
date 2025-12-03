import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClassForm from '../ClassForm';
import { useSession } from 'next-auth/react';

// Mock de componentes y hooks externos
jest.mock('next-auth/react');

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

jest.mock('@/components/images/ImageLibrary', () => ({
  __esModule: true,
  default: ({ onSelect, onClose, selectedImages }: any) => (
    <div data-testid="image-library">
      <h2>Image Library</h2>
      <p>Selected: {selectedImages.length}</p>
      <button onClick={() => onSelect('https://example.com/library-image.jpg')}>
        Select Library Image
      </button>
      <button onClick={onClose}>Close Library</button>
    </div>
  ),
}));


describe('ClassForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    // Proporcionar un mock básico para useSession
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: '1', name: 'Test Admin', role: 'ADMIN' },
        backendToken: 'fake-token',
      },
      status: 'authenticated',
    });

    // Mock de la API fetch para instructores
    global.fetch = jest.fn((url) => {
      if (url === '/api/instructors') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 1, name: 'Instructor Uno', userId: 101 },
            { id: 2, name: 'Instructor Dos', userId: 102 },
          ]),
        });
      }
      if (url === '/api/images/upload') {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, url: 'https://example.com/uploaded-image.jpg' }),
        });
      }
      return Promise.resolve({ ok: false });
    }) as jest.Mock;

    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  it('debería renderizar el formulario en modo de creación', async () => {
    render(<ClassForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/Título de la Clase/i)).toBeInTheDocument();
    expect(screen.getByText(/Crear Clase/i)).toBeInTheDocument();
    
    // Espera a que los instructores se carguen
    await waitFor(() => {
        expect(screen.getByText('Instructor Uno')).toBeInTheDocument();
    });
  });

  it('debería rellenar el formulario con datos existentes en modo de edición', () => {
    const classData = {
      id: 1,
      title: 'Clase de Prueba',
      description: 'Descripción de prueba',
      date: '2025-12-25T10:00:00.000Z',
      duration: 90,
      capacity: 5,
      price: 100,
      level: 'INTERMEDIATE',
      instructorId: 1,
      images: ['https://example.com/image1.jpg'],
      schoolId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(<ClassForm classData={classData} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/Título de la Clase/i)).toHaveValue('Clase de Prueba');
    expect(screen.getByLabelText(/Nivel/i)).toHaveValue('INTERMEDIATE');
    expect(screen.getByText(/Actualizar/i)).toBeInTheDocument();
    expect(screen.getByAltText('Img 1')).toHaveAttribute('src', 'https://example.com/image1.jpg');
  });

  it('debería mostrar errores de validación', async () => {
    render(<ClassForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    fireEvent.click(screen.getByText(/Crear Clase/i));

    await waitFor(() => {
      expect(screen.getByText('El título es requerido')).toBeInTheDocument();
      expect(screen.getByText('La fecha es requerida')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('debería permitir agregar una imagen por URL', async () => {
    render(<ClassForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const urlInput = screen.getByPlaceholderText(/Pegar URL/i);
    fireEvent.change(urlInput, { target: { value: 'https://example.com/new-image.jpg' } });
    fireEvent.click(screen.getByText('Agregar'));

    await waitFor(() => {
      expect(screen.getByAltText('Img 1')).toBeInTheDocument();
      expect(screen.getByAltText('Img 1')).toHaveAttribute('src', 'https://example.com/new-image.jpg');
    });
  });

  it('debería permitir eliminar una imagen', async () => {
    const classData = {
        id: 1,
        schoolId: 1,
        title: 'Clase con Imagen',
        level: 'BEGINNER' as const,
        instructorId: 1,
        date: '2025-12-25T10:00:00.000Z',
        duration: 90, capacity: 5, price: 100, level: 'BEGINNER', schoolId: 1,
        images: ['https://example.com/image-to-remove.jpg'],
        createdAt: new Date(), updatedAt: new Date(),
    };

    render(<ClassForm classData={classData} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByAltText('Img 1')).toBeInTheDocument();

    const removeButton = screen.getByRole('button', { name: '' }); // El botón de eliminar no tiene texto
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByAltText('Img 1')).not.toBeInTheDocument();
    });
  });

  it('debería abrir la biblioteca de imágenes y permitir seleccionar una', async () => {
    render(<ClassForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    // 1. Abrir la biblioteca
    const libraryButton = screen.getByText(/Elegir de la Biblioteca/i);
    fireEvent.click(libraryButton);

    // 2. Verificar que la biblioteca esté visible
    await waitFor(() => {
      expect(screen.getByTestId('image-library')).toBeInTheDocument();
    });

    // 3. Simular la selección de una imagen desde la biblioteca
    const selectImageButton = screen.getByText('Select Library Image');
    fireEvent.click(selectImageButton);

    // 4. Verificar que la imagen se agregó al formulario
    await waitFor(() => {
      expect(screen.getByAltText('Img 1')).toBeInTheDocument();
      expect(screen.getByAltText('Img 1')).toHaveAttribute('src', 'https://example.com/library-image.jpg');
    });
  });

  it('debería llamar a onSubmit con los datos correctos', async () => {
    render(<ClassForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    // Rellenar el formulario
    fireEvent.change(screen.getByLabelText(/Título de la Clase/i), { target: { value: 'Clase Final' } });
    fireEvent.change(screen.getByLabelText(/Fecha y Hora/i), { target: { value: '2025-12-30T14:00' } });
    fireEvent.change(screen.getByLabelText(/Duración/i), { target: { value: '120' } });
    fireEvent.change(screen.getByLabelText(/Capacidad/i), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText(/Precio/i), { target: { value: '150' } });
    
    // Esperar a que los instructores se carguen y seleccionar uno
    await waitFor(() => {
        fireEvent.change(screen.getByLabelText(/Instructor/i), { target: { value: '2' } });
    });

    // Enviar el formulario
    fireEvent.click(screen.getByText(/Crear Clase/i));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Clase Final',
        duration: 120,
        price: 150,
        instructorId: 2,
        images: [],
      }));
    });
  });
});