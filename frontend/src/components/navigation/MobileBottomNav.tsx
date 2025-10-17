"use client";

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
    UserCheck,
    TrendingUp
} from 'lucide-react';

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: string[];
}

const navigationItems: NavItem[] = [
    // Admin Navigation - Most important 5 items
    { name: 'Dashboard', href: '/dashboard/admin', icon: Home, roles: ['ADMIN'] },
    { name: 'Users', href: '/dashboard/admin/users', icon: Users, roles: ['ADMIN'] },
    { name: 'Schools', href: '/dashboard/admin/schools', icon: School, roles: ['ADMIN'] },
    { name: 'Classes', href: '/dashboard/admin/classes', icon: Waves, roles: ['ADMIN'] },
    { name: 'Reports', href: '/dashboard/admin/reports', icon: BarChart3, roles: ['ADMIN'] },

    // School Admin Navigation - Most important 5 items
    { name: 'Dashboard', href: '/dashboard/school', icon: Home, roles: ['SCHOOL_ADMIN'] },
    { name: 'Classes', href: '/dashboard/school/classes', icon: Waves, roles: ['SCHOOL_ADMIN'] },
    { name: 'Students', href: '/dashboard/school/students', icon: Users, roles: ['SCHOOL_ADMIN'] },
    { name: 'Bookings', href: '/dashboard/school/reservations', icon: Calendar, roles: ['SCHOOL_ADMIN'] },
    { name: 'Payments', href: '/dashboard/school/payments', icon: CreditCard, roles: ['SCHOOL_ADMIN'] },

    // Instructor Navigation - Most important 5 items
    { name: 'Dashboard', href: '/dashboard/instructor', icon: Home, roles: ['INSTRUCTOR'] },
    { name: 'Profile', href: '/dashboard/instructor/profile', icon: User, roles: ['INSTRUCTOR'] },
    { name: 'Classes', href: '/dashboard/instructor/classes', icon: BookOpen, roles: ['INSTRUCTOR'] },
    { name: 'Students', href: '/dashboard/instructor/students', icon: Users, roles: ['INSTRUCTOR'] },
    { name: 'Earnings', href: '/dashboard/instructor/earnings', icon: DollarSign, roles: ['INSTRUCTOR'] },

    // Student Navigation - Most important 4 items
    { name: 'Profile', href: '/dashboard/student/profile', icon: User, roles: ['STUDENT'] },
    { name: 'Classes', href: '/classes', icon: Waves, roles: ['STUDENT'] },
    { name: 'Bookings', href: '/reservations', icon: Calendar, roles: ['STUDENT'] },
    { name: 'Home', href: '/', icon: Home, roles: ['STUDENT'] },
];

export function MobileBottomNav() {
    const { data: session } = useSession();
    const pathname = usePathname();

    if (!session?.user) return null;

    const userRole = session.user.role;
    const userNavItems = navigationItems.filter(item => item.roles.includes(userRole));

    // Limit to 5 items for mobile bottom nav
    const displayItems = userNavItems.slice(0, 5);

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
            href === '/dashboard/instructor' || href === '/dashboard/student/profile') {
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
                return 'bg-orange-50 text-orange-700';
            default:
                return 'bg-gray-50 text-gray-700';
        }
    };

    return (
        <>
            {/* Spacer to prevent content from being hidden behind fixed navbar */}
            <div className="h-20 md:hidden"></div>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-2xl">
                {/* Background gradient based on role */}
                <div className={`absolute inset-0 opacity-5 ${userRole === 'ADMIN' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                    userRole === 'SCHOOL_ADMIN' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                        userRole === 'INSTRUCTOR' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                            'bg-gradient-to-r from-orange-500 to-orange-600'
                    }`}></div>

                {/* Role indicator */}
                <div className="absolute top-1 right-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${userRole === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        userRole === 'SCHOOL_ADMIN' ? 'bg-blue-100 text-blue-700' :
                            userRole === 'INSTRUCTOR' ? 'bg-green-100 text-green-700' :
                                'bg-orange-100 text-orange-700'
                        }`}>
                        {getRoleName(userRole)}
                    </span>
                </div>

                <div className="relative flex justify-around items-center h-20 px-1 pt-6">
                    {displayItems.map((item) => {
                        const IconComponent = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex flex-col items-center justify-center px-1 py-2 rounded-xl transition-all duration-300 min-w-0 flex-1 relative ${active
                                    ? getRoleActiveColor(userRole) + ' shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {/* Active indicator */}
                                {active && (
                                    <div className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full ${userRole === 'ADMIN' ? 'bg-purple-600' :
                                        userRole === 'SCHOOL_ADMIN' ? 'bg-blue-600' :
                                            userRole === 'INSTRUCTOR' ? 'bg-green-600' :
                                                'bg-orange-600'
                                        }`}></div>
                                )}

                                <div className={`p-1.5 rounded-lg transition-all duration-300 ${active
                                    ? 'transform scale-110'
                                    : 'group-hover:scale-105 group-hover:bg-white group-hover:shadow-sm'
                                    }`}>
                                    <IconComponent
                                        className={`w-5 h-5 transition-all duration-300 ${active ? 'drop-shadow-sm' : 'group-hover:scale-110'
                                            }`}
                                    />
                                </div>

                                <span className={`text-xs font-medium truncate w-full text-center leading-tight mt-0.5 transition-all duration-300 ${active ? 'font-semibold' : 'group-hover:font-medium'
                                    }`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom safe area for devices with home indicator */}
                <div className="h-1 bg-transparent"></div>
            </nav>
        </>
    );
}