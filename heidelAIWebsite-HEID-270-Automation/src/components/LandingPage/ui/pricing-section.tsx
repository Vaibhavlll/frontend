"use client"

import * as React from "react"
import { PricingCard, type PricingTier } from "@/components/LandingPage/ui/pricing-card"
import { Tab } from "@/components/LandingPage/ui/pricing-tab"

interface PricingSectionProps {
  title: string
  subtitle: string
  tiers: PricingTier[]
  frequencies: string[]
}

export function PricingSection({
  title,
  subtitle,
  tiers,
  frequencies,
}: PricingSectionProps) {
  const [selectedFrequency, setSelectedFrequency] = React.useState(frequencies[0])

  return (
    <section className="flex flex-col items-center gap-10 py-10">
      <div className="space-y-7 text-center">
        <div className="flex flex-col items-center gap-4 px-4 mb-8 sm:gap-8 text-center">
          <h2 className=" text-3xl font-semibold leading-tight sm:text-5xl sm:leading-tight">{title}</h2>
          <span className="hidden sm:block">
          <p className="text-md max-w-[800px] mb-4 font-medium text-muted-foreground sm:text-xl">{subtitle}</p>
          </span>
          <span className="block sm:hidden">
            <p className="text-md max-w-[800px] mb-4 font-medium text-muted-foreground sm:text-xl">No hidden fees. No commitments!</p>
          </span>
        </div>
        <div className="mx-auto flex w-fit rounded-full bg-muted p-1">
          {frequencies.map((freq) => (
            <Tab
              key={freq}
              text={freq}
              selected={selectedFrequency === freq}
              setSelected={setSelectedFrequency}
              discount={freq === "yearly"}
            />
          ))}
        </div>
      </div>

      <div className="grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier) => (
          <PricingCard
            key={tier.name}
            tier={tier}
            paymentFrequency={selectedFrequency}
          />
        ))}
      </div>
    </section>
  )
}