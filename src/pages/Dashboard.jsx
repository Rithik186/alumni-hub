import React from 'react';
import { useUser } from '../context/UserContext';
import Navbar from '../components/landing/Navbar';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import AlumniDashboard from '../components/dashboard/AlumniDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';

const Dashboard = () => {
    const { user } = useUser();

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-100">
            <Navbar />
            <main className="pt-16">
                {user.role === 'student' && <StudentDashboard />}
                {user.role === 'alumni' && <AlumniDashboard />}
                {user.role === 'admin' && <AdminDashboard />}
            </main>
        </div>
    );
};

export default Dashboard;
