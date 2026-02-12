'use client'

import dynamic from 'next/dynamic'

const Hyperspeed = dynamic(() => import('@/components/Hyperspeed'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-black" />
})

export default function HyperspeedBackground() {
  return (
    <div className="-z-10">
      <Hyperspeed 
        
      />
    </div>
  )
}