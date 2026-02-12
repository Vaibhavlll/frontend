"use client"

import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/LandingPage/ui/badge"

interface TabProps {
  text: string
  selected: boolean
  setSelected: (text: string) => void
  discount?: boolean
}

export function Tab({
  text,
  selected,
  setSelected,
  discount = false,
}: TabProps) {
  return (
    <button
      onClick={() => setSelected(text)}
      className={cn(
        "relative w-fit px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold capitalize",
        "text-foreground transition-colors",
        discount && "flex items-center justify-center gap-2.5"
      )}
    >
      <span className="relative z-10">{text}</span>
      {selected && (
        <motion.span
          layoutId="tab"
          transition={{ type: "spring", duration: 0.4 }}
          className="absolute inset-0 z-0 rounded-full bg-background shadow-sm border border-gray-200"
        />
      )}
      {discount && (
        <Badge
          variant="secondary"
          className={cn(
            "relative z-10 whitespace-nowrap shadow-none bg-gray-900 text-white hover:bg-gray-800 text-xs sm:text-sm",
            selected && "bg-gray-800"
          )}
        >
          Save 20%
        </Badge>
      )}
    </button>
  )
}