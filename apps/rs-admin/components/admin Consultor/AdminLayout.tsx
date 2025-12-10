import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
// import Topbar from '../consultant/components/Topbar';
// import { useUser } from '../consultant/ConsultantLayout';
import { IconUserCog, IconEdit } from '../icons';

const adminNavItems = [
  { name: 'Dados Pessoais', path: '/admin/personal-data', icon: IconUserCog },
  { name: 'Dashboard/Editor', path: '/admin/dashboard-editor', icon: IconEdit },
];

interface AdminSidebarProps {
    isCollapsed: boolean;
    closeSidebar?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isCollapsed, closeSidebar }) => {
    const handleNavLinkClick = () => {
        if (closeSidebar) {
            closeSidebar();
        }
    };

    const navLinkClasses = (isActive: boolean) =>
        `flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} ${
        isActive
            ? 'bg-brand-gold text-brand-dark font-semibold shadow-lg shadow-brand-gold/20'
            : 'text-brand-text-dim hover:bg-brand-gray-light hover:text-brand-gold'
        }`;

    return (
        <aside className="w-full h-full bg-brand-gray border-r border-brand-gray-light flex-shrink-0 p-3 flex flex-col">
            <div className={`py-4 text-center transition-all duration-300 ${isCollapsed ? 'mb-2' : 'mb-4'}`}>
                <h1 className={`text-brand-gold text-xl font-bold ${isCollapsed ? 'hidden' : 'block'}`}>Painel Admin</h1>
                <h1 className={`text-brand-gold text-xl font-bold ${isCollapsed ? 'block' : 'hidden'}`}>AD</h1>
            </div>
            <nav className="flex flex-col space-y-2">
                {adminNavItems.map(item => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={handleNavLinkClick}
                        className={({ isActive }) => navLinkClasses(isActive)}
                    >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span>{item.name}</span>}
                    </NavLink>
                ))}
            </nav>
            <div className="mt-auto p-4 text-center text-xs text-gray-400">
                {!isCollapsed && <span>&copy; {new Date().getFullYear()} RS Prólipsi.</span>}
            </div>
        </aside>
    );
};

const AdminLayout: React.FC = () => {
    const { user } = useUser();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-brand-dark font-sans overflow-hidden">
            {/* Desktop Sidebar */}
            <div className={`hidden md:flex md:flex-shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
                <AdminSidebar isCollapsed={isSidebarCollapsed} />
            </div>

            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
            ></div>
            <div className={`fixed inset-y-0 left-0 w-64 z-40 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <AdminSidebar isCollapsed={false} closeSidebar={() => setIsMobileMenuOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar 
                    user={user} 
                    onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                    onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                    isSidebarCollapsed={isSidebarCollapsed} 
                />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
