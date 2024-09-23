'use client'

import { Kundeneingaben } from './Kundeneingaben'
import { KostenAufstellung } from './KostenAufstellung'
import { Finanzvarianten } from './Finanzvarianten'

const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=Alegreya+SC:wght@700&display=swap');

  .custom-bg {
    background-color: #85B0CA;
  }

  .custom-headline {
    color: #163C5A;
    font-family: 'Alegreya SC', serif;
    font-weight: 700;
    text-transform: uppercase;
  }

  .custom-font {
    font-family: 'Alegreya', serif;
    font-size: 21px;
    color: #003c5D;
  }

  .section-card {
    background-color: #FFF8DC;
    margin-bottom: 20px;
  }
`

export function FinancingAdvisorComponent() {
  return (
    <>
      <style>{customStyles}</style>
      <div className="min-h-screen custom-bg p-4 custom-font">
        <div className="container mx-auto space-y-8">
          <Kundeneingaben />
          <KostenAufstellung />
          <Finanzvarianten />
        </div>
      </div>
    </>
  )
}