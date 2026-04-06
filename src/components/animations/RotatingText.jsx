import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RotatingText = ({
    texts,
    rotationInterval = 2000,
    className = '',
    splitBy = 'characters',
    staggerDuration = 0.03,
    transition = { type: 'spring', damping: 25, stiffness: 300 },
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % texts.length);
        }, rotationInterval);
        return () => clearInterval(interval);
    }, [texts.length, rotationInterval]);

    const currentText = texts[currentIndex];
    const chars = splitBy === 'words' ? currentText.split(' ') : currentText.split('');

    return (
        <span className={`inline-flex flex-wrap overflow-hidden ${className}`}>
            <span className="sr-only">{currentText}</span>
            <AnimatePresence mode="wait">
                <motion.span
                    key={currentIndex}
                    className="inline-flex flex-wrap"
                    aria-hidden="true"
                >
                    {chars.map((char, i) => (
                        <motion.span
                            key={i}
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '-120%', opacity: 0 }}
                            transition={{ ...transition, delay: i * staggerDuration }}
                            className="inline-block"
                        >
                            {char === ' ' ? '\u00A0' : char}
                            {splitBy === 'words' && i < chars.length - 1 ? '\u00A0' : ''}
                        </motion.span>
                    ))}
                </motion.span>
            </AnimatePresence>
        </span>
    );
};

export default RotatingText;
