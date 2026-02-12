'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface AnimateInViewProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export const AnimateInView = ({ children, className = '', delay = 0 }: AnimateInViewProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref)

  return (
    <motion.div
      ref={ref}
      animate={isInView ? { opacity: 1, filter: "blur(0px)", y: 0 } : { opacity: 0, filter: "blur(10px)", y: 40 }}
      initial={{ opacity: 0, filter: "blur(10px)", y: -20 }}
      transition={{ duration: 0.6, delay, type: "ease" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
