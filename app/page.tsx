"use client"

import dynamic from 'next/dynamic'
import { FinancingAdvisorComponent } from '@/components/financing-advisor'

export default function Home() {
  return (
    <main>
      <FinancingAdvisorComponent />
    </main>
  )
}
