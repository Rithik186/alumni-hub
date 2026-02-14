import React from 'react';
import { useUser } from '../context/UserContext';
import Navbar from '../components/landing/Navbar';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import AlumniDashboard from '../components/dashboard/AlumniDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user } = useUser();

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#fcfdfe] selection:bg-blue-100 selection:text-blue-900">
            {/* Dynamic Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <Navbar />

            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="relative z-10 pt-24"
            >
                {user.role === 'student' && <StudentDashboard />}
                {user.role === 'alumni' && <AlumniDashboard />}
                {user.role === 'admin' && <AdminDashboard />}
            </motion.main>
        </div>
    );
};

export default Dashboard;
