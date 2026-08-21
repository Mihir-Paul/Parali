import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

interface CountUpProps {
  to: number;
  duration?: number; // duration in seconds
  decimals?: number;
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  useReducedMotion?: boolean;
}

export const CountUp: React.FC<CountUpProps> = ({
  to,
  duration = 2,
  decimals = 0,
  delay = 0,
  className,
  prefix = '',
  suffix = '',
  useReducedMotion = false
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Create a spring value that animates towards 'to'
  const springValue = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  // Transform the raw number into formatted string
  const displayValue = useTransform(springValue, (current) => {
    return prefix + current.toFixed(decimals) + suffix;
  });

  useEffect(() => {
    if (inView && !hasAnimated) {
      if (useReducedMotion) {
        springValue.set(to);
      } else {
        setTimeout(() => {
          springValue.set(to);
        }, delay * 1000);
      }
      setHasAnimated(true);
    }
  }, [inView, hasAnimated, springValue, to, delay, useReducedMotion]);

  return (
    <motion.span ref={ref} className={className}>
      {displayValue}
    </motion.span>
  );
};

export default CountUp;
