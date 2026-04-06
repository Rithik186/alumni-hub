
import React from "react";
import { motion } from "framer-motion";
import { Github, Twitter, Linkedin, Facebook } from "lucide-react";
import FadeContent from "../animations/FadeContent";
import ShinyText from "../animations/ShinyText";

export const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 py-16">
            <div className="container mx-auto px-6 grid md:grid-cols-4 gap-12">
                <FadeContent blur duration={600}>
                    <div className="col-span-1 md:col-span-1">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            <ShinyText text="Alumned In" speed={4} className="text-white" />
                        </h2>
                        <p className="text-sm leading-relaxed mb-6 opacity-75">
                            Connecting the past, present, and future of our institution. Join the network today.
                        </p>
                        <div className="flex space-x-4">
                            {[Github, Twitter, Linkedin, Facebook].map((Icon, idx) => (
                                <a key={idx} href="#" className="hover:text-primary-500 transition-colors p-2 hover:bg-white/5 rounded-lg">
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>
                </FadeContent>

                <FadeContent blur duration={600} delay={100}>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            {['Home', 'About Us', 'Events', 'Mentorship', 'Jobs'].map((link) => (
                                <li key={link}>
                                    <a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">{link}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </FadeContent>

                <FadeContent blur duration={600} delay={200}>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
                        <ul className="space-y-2 text-sm">
                            {['Help Center', 'Privacy Policy', 'Terms of Service', 'Contact Support'].map((link) => (
                                <li key={link}>
                                    <a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">{link}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </FadeContent>

                <FadeContent blur duration={600} delay={300}>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Stay Updated</h3>
                        <p className="text-sm mb-4 opacity-75">Subscribe to our newsletter for the latest updates.</p>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-slate-800 text-white px-4 py-2 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
                            />
                            <button className="bg-primary-600 px-4 py-2 rounded-r-lg hover:bg-primary-700 transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </FadeContent>
            </div>
            <FadeContent blur duration={800} delay={400}>
                <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm opacity-50">
                    &copy; {new Date().getFullYear()} Alumned In. All rights reserved.
                </div>
            </FadeContent>
        </footer>
    );
};
