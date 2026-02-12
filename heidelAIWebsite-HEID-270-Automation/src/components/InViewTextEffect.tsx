'use client'

import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { TextEffect } from '@/components/ui/text-effect';

interface InViewTextEffectProps {
  children: string
  preset?: string
  per?: 'char' | 'word'
  speedReveal?: number
  speedSegment?: number
}

export const InViewTextEffect = ({ 
  children, 
  preset = 'fade-in-blur',
  per = 'char',
  speedReveal = 2.5,
  speedSegment = 0.1
}: InViewTextEffectProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    margin: "0px 0px -100px 0px" // triggers slightly before the element comes into view
  })

  return (
    <div ref={ref}>
      <TextEffect 
        preset="fade-in-blur"
        per={per}
        speedReveal={speedReveal}
        speedSegment={speedSegment}
        trigger={isInView}
      >
        {children}
      </TextEffect>
    </div>
  )
}
