import React from 'react';
import { useUser } from '../context/UserContext';
import { Navbar } from '../components/landing/Navbar';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import AlumniDashboard from '../components/dashboard/AlumniDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';

const Dashboard = () => {
    const { user, loading } = useUser();

    if (loading) return null;

    return (
        <div className="min-h-screen gradient-mesh">
            <Navbar />
            <div className="pt-28 px-6 pb-20">
                <div className="container mx-auto">
                    {user?.role === 'student' && <StudentDashboard />}
                    {user?.role === 'alumni' && <AlumniDashboard />}
                    {user?.role === 'admin' && <AdminDashboard />}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
