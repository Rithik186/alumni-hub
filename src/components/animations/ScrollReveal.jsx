import React, { useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

const ScrollReveal = ({
    children,
    width = 'fit-content',
    baseOpacity = 0.1,
    enableBlur = true,
    blurStrength = 10,
    containerClassName = '',
    textClassName = '',
    delay = 0,
    duration = 1,
}) => {
    const mainRef = useRef(null);
    const isInView = useInView(mainRef, { once: true, margin: '-10%' });
    const mainControls = useAnimation();

    useEffect(() => {
        if (isInView) {
            mainControls.start('visible');
        }
    }, [isInView, mainControls]);

    return (
        <div ref={mainRef} className={`relative overflow-hidden ${containerClassName}`} style={{ width }}>
            <motion.div
                variants={{
                    hidden: { opacity: baseOpacity, y: 75, filter: enableBlur ? `blur(${blurStrength}px)` : 'none' },
                    visible: { opacity: 1, y: 0, filter: 'blur(0px)' }
                }}
                initial="hidden"
                animate={mainControls}
                transition={{ duration, ease: 'easeOut', delay }}
                className={textClassName}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default ScrollReveal;
