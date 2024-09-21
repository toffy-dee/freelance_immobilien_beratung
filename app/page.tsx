'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from 'recharts'

function calculateLoanData(netLoanAmount: number, interestRate: number, initialRepayment: number, propertyValue: number, annualAppreciation: number) {
  const monthlyInterestRate = interestRate / 100 / 12
  const monthlyRepaymentRate = (interestRate + initialRepayment) / 100 / 12
  const monthlyPayment = netLoanAmount * monthlyRepaymentRate

  let remainingBalance = netLoanAmount
  let currentPropertyValue = propertyValue
  const yearlyData = []
  const monthlyData = []
  let year = 0
  let month = 0

  while (remainingBalance > 0) {
    let yearlyInterest = 0
    let yearlyRepayment = 0

    for (let i = 0; i < 12 && remainingBalance > 0; i++) {
      const interestPayment = remainingBalance * monthlyInterestRate
      const repaymentAmount = Math.min(monthlyPayment - interestPayment, remainingBalance)
      remainingBalance = Math.max(0, remainingBalance - repaymentAmount)

      yearlyInterest += interestPayment
      yearlyRepayment += repaymentAmount

      monthlyData.push({
        month,
        interestPayment,
        repaymentAmount,
        totalPayment: interestPayment + repaymentAmount
      })

      month++
    }

    yearlyData.push({
      year,
      remainingDebt: Math.max(0, remainingBalance),
      propertyValue: currentPropertyValue
    })

    currentPropertyValue *= (1 + annualAppreciation / 100)
    year++
  }

  // Add final points
  yearlyData.push({
    year,
    remainingDebt: 0,
    propertyValue: currentPropertyValue
  })

  return { yearlyData, monthlyData }
}

export default function Home() {
  const [loanData, setLoanData] = useState({
    netLoanAmount: 201000,
    interestRate: 1.35,
    initialRepayment: 2.00,
    propertyValue: 161000,
    annualAppreciation: 2.0,
  })

  const { yearlyData, monthlyData } = calculateLoanData(
    loanData.netLoanAmount,
    loanData.interestRate,
    loanData.initialRepayment,
    loanData.propertyValue,
    loanData.annualAppreciation
  )

  const loanDuration = yearlyData.length - 1

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Real Estate Loan Analysis</h1>
      <p className="mb-4">Loan Duration: {loanDuration} years</p>
      
      <h2 className="text-xl font-bold mb-2">Grafik Gesamtentwicklung</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={yearlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="remainingDebt" stroke="#8884d8" name="Restschulden" />
          <Line type="monotone" dataKey="propertyValue" stroke="#82ca9d" name="Immobilienwert" />
        </LineChart>
      </ResponsiveContainer>

      <h2 className="text-xl font-bold mt-8 mb-2">Grafik Monatliche Raten</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyData.slice(0, 60)} // Showing first 60 months for better visibility
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="interestPayment" stackId="a" fill="#8884d8" name="Interest" />
          <Bar dataKey="repaymentAmount" stackId="a" fill="#82ca9d" name="Repayment" />
        </BarChart>
      </ResponsiveContainer>
    </main>
  )
}
