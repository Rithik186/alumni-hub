
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Rocket, GraduationCap, Briefcase, ChevronRight, UserCheck } from "lucide-react";

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
                    ? "bg-white/80 backdrop-blur-md shadow-md py-3"
                    : "bg-transparent py-5"
                }`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                <motion.a
                    href="#"
                    className="text-2xl font-bold flex items-center gap-2 text-primary-600"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <GraduationCap className="w-8 h-8" />
                    <span>AlumniHub</span>
                </motion.a>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    {['Home', 'Mentorship', 'Jobs', 'Events', 'About Us'].map((item, index) => (
                        <motion.a
                            key={item}
                            href={`#${item.toLowerCase().replace(' ', '-')}`}
                            className="text-slate-600 hover:text-primary-600 font-medium transition-colors"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            {item}
                        </motion.a>
                    ))}
                    <motion.button
                        className="px-6 py-2 bg-primary-600 text-white rounded-full font-semibold shadow-lg hover:shadow-primary-500/50 hover:bg-primary-700 transition-all transform hover:-translate-y-0.5"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        Login / Join
                    </motion.button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-slate-700 focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-slate-100 py-4 px-6 flex flex-col space-y-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {['Home', 'Mentorship', 'Jobs', 'Events', 'About Us'].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="text-slate-600 font-medium hover:text-primary-600"
                                onClick={() => setIsOpen(false)}
                            >
                                {item}
                            </a>
                        ))}
                        <button className="w-full py-2 bg-primary-600 text-white rounded-lg font-semibold">
                            Login / Join
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
