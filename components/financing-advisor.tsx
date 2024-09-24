'use client'

import { useState } from 'react';
import { Kundeneingaben } from './Kundeneingaben';
import { KostenAufstellung } from './KostenAufstellung';
import { Finanzvarianten } from './Finanzvarianten';
import FinanzBeraterAI from './chatBot/FinanzBeraterAI';
import OpenAITest from './chatBot/OpenAITest';

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

  .accordion {
    cursor: pointer;
    padding: 18px;
    width: 100%;
    text-align: left;
    border: none;
    outline: none;
    transition: 0.4s;
  }

  .panel {
    padding: 0 18px;
    display: none;
    overflow: hidden;
    background-color: white;
  }

  .panel.show {
    display: block;
  }
`;

export function FinancingAdvisorComponent() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      <style>{customStyles}</style>
      <div className="min-h-screen custom-bg p-4 custom-font">
        <button className="accordion" onClick={toggleChat}>
          Open Chat Bot
        </button>
        <div className={`panel ${isChatOpen ? 'show' : ''}`}>
          <FinanzBeraterAI />
        </div>
        <OpenAITest />
        {/* <div className="container mx-auto space-y-8">
          <Kundeneingaben />
          <KostenAufstellung />
          <Finanzvarianten />
        </div> */}
      </div>
    </>
  );
}