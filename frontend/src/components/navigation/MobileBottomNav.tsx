"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    User,
    Calendar,
    BookOpen,
    Users,
    DollarSign,
    BarChart3,
    Settings,
    School,
    GraduationCap,
    Waves,
    CreditCard,
    FileText,
    MoreHorizontal,
    X
} from 'lucide-react';

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: string[];
}

const navigationItems: NavItem[] = [
    // Admin Navigation
    { name: 'Dashboard', href: '/dashboard/admin', icon: Home, roles: ['ADMIN'] },
    { name: 'Overview', href: '/dashboard/admin/overview', icon: BarChart3, roles: ['ADMIN'] },
    { name: 'Users', href: '/dashboard/admin/users', icon: Users, roles: ['ADMIN'] },
    { name: 'Schools', href: '/dashboard/admin/schools', icon: School, roles: ['ADMIN'] },
    { name: 'Classes', href: '/dashboard/admin/classes', icon: Waves, roles: ['ADMIN'] },
    { name: 'Reservations', href: '/dashboard/admin/reservations', icon: Calendar, roles: ['ADMIN'] },
    { name: 'Payments', href: '/dashboard/admin/payments', icon: CreditCard, roles: ['ADMIN'] },
    { name: 'Reports', href: '/dashboard/admin/reports', icon: FileText, roles: ['ADMIN'] },
    { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings, roles: ['ADMIN'] },

    // School Admin Navigation
    { name: 'Dashboard', href: '/dashboard/school', icon: Home, roles: ['SCHOOL_ADMIN'] },
    { name: 'Classes', href: '/dashboard/school/classes', icon: Waves, roles: ['SCHOOL_ADMIN'] },
    { name: 'Instructors', href: '/dashboard/school/instructors', icon: GraduationCap, roles: ['SCHOOL_ADMIN'] },
    { name: 'Students', href: '/dashboard/school/students', icon: Users, roles: ['SCHOOL_ADMIN'] },
    { name: 'Calendario', href: '/dashboard/school/calendar', icon: Calendar, roles: ['SCHOOL_ADMIN'] },
    { name: 'Bookings', href: '/dashboard/school/reservations', icon: Calendar, roles: ['SCHOOL_ADMIN'] },
    { name: 'Payments', href: '/dashboard/school/payments', icon: CreditCard, roles: ['SCHOOL_ADMIN'] },
    { name: 'Profile', href: '/dashboard/school/profile', icon: Settings, roles: ['SCHOOL_ADMIN'] },

    // Instructor Navigation
    { name: 'Dashboard', href: '/dashboard/instructor', icon: Home, roles: ['INSTRUCTOR'] },
    { name: 'Profile', href: '/dashboard/instructor/profile', icon: User, roles: ['INSTRUCTOR'] },
    { name: 'Classes', href: '/dashboard/instructor/classes', icon: BookOpen, roles: ['INSTRUCTOR'] },
    { name: 'Students', href: '/dashboard/instructor/students', icon: Users, roles: ['INSTRUCTOR'] },
    { name: 'Earnings', href: '/dashboard/instructor/earnings', icon: DollarSign, roles: ['INSTRUCTOR'] },

    // Student Navigation
    { name: 'Dashboard', href: '/dashboard/student', icon: Home, roles: ['STUDENT'] },
    { name: 'Perfil', href: '/dashboard/student/profile', icon: User, roles: ['STUDENT'] },
    { name: 'Clases', href: '/classes', icon: Waves, roles: ['STUDENT'] },
    { name: 'Reservas', href: '/reservations', icon: Calendar, roles: ['STUDENT'] },
];

export function MobileBottomNav() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const userRole = session?.user?.role;
    const userNavItems = userRole ? navigationItems.filter(item => item.roles.includes(userRole)) : [];
    
    // Mostrar las primeras 4 opciones principales, el resto va en "Más"
    const primaryItems = userNavItems.slice(0, 4);
    const moreItems = userNavItems.slice(4);

    const getRoleName = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'Admin';
            case 'SCHOOL_ADMIN':
                return 'School';
            case 'INSTRUCTOR':
                return 'Instructor';
            case 'STUDENT':
                return 'Student';
            default:
                return 'User';
        }
    };

    const isActive = (href: string) => {
        if (href === '/' || href === '/dashboard/admin' || href === '/dashboard/school' ||
            href === '/dashboard/instructor' || href === '/dashboard/student/profile' || href === '/dashboard/student') {
            return pathname === href;
        }
        return pathname?.startsWith(href);
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'text-purple-600';
            case 'SCHOOL_ADMIN':
                return 'text-blue-600';
            case 'INSTRUCTOR':
                return 'text-green-600';
            case 'STUDENT':
                return 'text-orange-600';
            default:
                return 'text-gray-600';
        }
    };

    const getRoleActiveColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-purple-50 text-purple-700';
            case 'SCHOOL_ADMIN':
                return 'bg-blue-50 text-blue-700';
            case 'INSTRUCTOR':
                return 'bg-green-50 text-green-700';
            case 'STUDENT':
                return 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700';
            default:
                return 'bg-gray-50 text-gray-700';
        }
    };
    
    const getRoleActiveGradient = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'from-purple-500 to-purple-600';
            case 'SCHOOL_ADMIN':
                return 'from-blue-500 to-blue-600';
            case 'INSTRUCTOR':
                return 'from-green-500 to-green-600';
            case 'STUDENT':
                return 'from-blue-500 to-cyan-500';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMoreMenuOpen(false);
            }
        };

        if (moreMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [moreMenuOpen]);

    // Cerrar menú al cambiar de ruta
    useEffect(() => {
        setMoreMenuOpen(false);
    }, [pathname]);

    // Early return después de todos los hooks
    if (!session?.user || !userRole) return null;

    return (
        <>
            {/* Spacer to prevent content from being hidden behind fixed navbar */}
            <div className="h-20 lg:hidden"></div>

            {/* Mobile Bottom Navigation - solo en pantallas < 1024px */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 z-50 shadow-2xl backdrop-blur-xl">
                {/* Background gradient based on role */}
                <div className={`absolute inset-0 opacity-5 bg-gradient-to-r ${getRoleActiveGradient(userRole)}`}></div>

                {/* Role indicator - Only show for non-students */}
                {userRole !== 'STUDENT' && (
                    <div className="absolute top-1 right-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${userRole === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                            userRole === 'SCHOOL_ADMIN' ? 'bg-blue-100 text-blue-700' :
                                'bg-green-100 text-green-700'
                            }`}>
                            {getRoleName(userRole)}
                        </span>
                    </div>
                )}

                <div className={`relative flex justify-around items-center h-20 px-2 ${userRole === 'STUDENT' ? 'pt-4' : 'pt-6'}`}>
                    {/* Primary Items - First 4 */}
                    {primaryItems.map((item) => {
                        const IconComponent = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex flex-col items-center justify-center px-2 py-2 rounded-2xl transition-all duration-300 min-w-0 flex-1 relative active:scale-95 ${active
                                    ? getRoleActiveColor(userRole) + ' shadow-lg'
                                    : 'text-gray-500 hover:text-gray-700 active:bg-gray-50'
                                    }`}
                            >
                                {/* Active indicator - Top bar */}
                                {active && (
                                    <div className={`absolute -top-2 left-1/2 transform -translate-x-1/2 w-10 h-1 rounded-full shadow-lg bg-gradient-to-r ${getRoleActiveGradient(userRole)}`}></div>
                                )}

                                {/* Icon container */}
                                <div className={`p-2 rounded-xl transition-all duration-300 ${active
                                    ? `transform scale-110 bg-gradient-to-br ${getRoleActiveGradient(userRole)} shadow-lg`
                                    : 'bg-transparent group-hover:scale-110 group-hover:bg-gray-100'
                                    }`}>
                                    <IconComponent
                                        className={`w-5 h-5 transition-all duration-300 ${
                                            active 
                                                ? 'text-white drop-shadow-md' 
                                                : 'group-hover:scale-110'
                                        }`}
                                    />
                                </div>

                                {/* Label */}
                                <span className={`text-[10px] font-medium truncate w-full text-center leading-tight mt-1 transition-all duration-300 ${
                                    active 
                                        ? 'font-bold tracking-wide' 
                                        : 'group-hover:font-semibold'
                                    }`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}

                    {/* More Menu Button - Solo si hay más opciones */}
                    {moreItems.length > 0 && (
                        <div className="relative flex-1" ref={menuRef}>
                            <button
                                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                                className={`group flex flex-col items-center justify-center px-2 py-2 rounded-2xl transition-all duration-300 min-w-0 w-full relative active:scale-95 ${
                                    moreMenuOpen
                                        ? getRoleActiveColor(userRole) + ' shadow-lg'
                                        : 'text-gray-500 hover:text-gray-700 active:bg-gray-50'
                                }`}
                            >
                                {/* Icon container */}
                                <div className={`p-2 rounded-xl transition-all duration-300 ${
                                    moreMenuOpen
                                        ? `transform scale-110 bg-gradient-to-br ${getRoleActiveGradient(userRole)} shadow-lg`
                                        : 'bg-transparent group-hover:scale-110 group-hover:bg-gray-100'
                                }`}>
                                    {moreMenuOpen ? (
                                        <X className="w-5 h-5 text-white drop-shadow-md" />
                                    ) : (
                                        <MoreHorizontal className="w-5 h-5 group-hover:scale-110" />
                                    )}
                                </div>

                                {/* Label */}
                                <span className={`text-[10px] font-medium truncate w-full text-center leading-tight mt-1 transition-all duration-300 ${
                                    moreMenuOpen 
                                        ? 'font-bold tracking-wide' 
                                        : 'group-hover:font-semibold'
                                }`}>
                                    Más
                                </span>
                            </button>

                            {/* Dropdown Menu - Aparece arriba del navbar */}
                            {moreMenuOpen && (
                                <>
                                    {/* Backdrop */}
                                    <div 
                                        className="fixed inset-0 bg-black/20 z-40"
                                        onClick={() => setMoreMenuOpen(false)}
                                    />
                                    
                                    {/* Menu - Posicionado para no salirse de la pantalla */}
                                    <div className="fixed bottom-20 left-0 right-0 mx-2 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[60vh] overflow-y-auto animate-slide-up">
                                        <div className="p-2">
                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 py-2 mb-1">
                                                Más opciones
                                            </div>
                                            {moreItems.map((item) => {
                                                const IconComponent = item.icon;
                                                const active = isActive(item.href);

                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        onClick={() => setMoreMenuOpen(false)}
                                                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                                            active
                                                                ? getRoleActiveColor(userRole) + ' shadow-sm'
                                                                : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <IconComponent className={`w-5 h-5 ${active ? getRoleColor(userRole) : 'text-gray-500'}`} />
                                                        <span className="font-medium">{item.name}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Bottom safe area for devices with home indicator */}
                <div className="h-2 bg-transparent"></div>
            </nav>
        </>
    );
}
