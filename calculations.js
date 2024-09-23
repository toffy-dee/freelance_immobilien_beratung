const calculateMonthlyPayment = (netLoanAmount, interestRate, initialRepayment) => {
  const monthlyInterestRate = interestRate / 100 / 12;
  const monthlyRepaymentRate = (interestRate + initialRepayment) / 100 / 12;
  const monthlyPayment = netLoanAmount * monthlyRepaymentRate;
  return monthlyPayment;
};

const calculateRemainingDebt = (netLoanAmount, interestRate, initialRepayment, fixedInterestPeriodYears) => {
  const monthlyInterestRate = interestRate / 100 / 12;
  const monthlyPayment = calculateMonthlyPayment(netLoanAmount, interestRate, initialRepayment);
  
  let remainingDebt = netLoanAmount;
  for (let i = 0; i < fixedInterestPeriodYears * 12; i++) {
    const interestPayment = remainingDebt * monthlyInterestRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingDebt -= principalPayment;
  }
  
  return Math.max(0, remainingDebt);
};

const calculateLoanDuration = (netLoanAmount, interestRate, initialRepayment) => {
  const monthlyInterestRate = interestRate / 100 / 12;
  const monthlyPayment = calculateMonthlyPayment(netLoanAmount, interestRate, initialRepayment);
  
  let remainingDebt = netLoanAmount;
  let months = 0;
  const maxMonths = 12 * 100; // Set a maximum duration of 100 years to prevent infinite loops
  while (remainingDebt > 0 && months < maxMonths) {
    const interestPayment = remainingDebt * monthlyInterestRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingDebt -= principalPayment;
    months++;
  }
  
  return months < maxMonths ? months / 12 : null; // Return null if max duration is reached
};

// Test the functions
const testTranche = {
  netLoanAmount: 161000.00,
  interestRate: 1.35,  // Sollzins p.a.
  fixedInterestPeriodYears: 15,  // Zinslaufzeit in Jahren
  initialRepayment: 2.00  // Anfängliche Tilgung
};

const monthlyPayment = calculateMonthlyPayment(
  testTranche.netLoanAmount,
  testTranche.interestRate,
  testTranche.initialRepayment
);

const remainingDebt = calculateRemainingDebt(
  testTranche.netLoanAmount,
  testTranche.interestRate,
  testTranche.initialRepayment,
  testTranche.fixedInterestPeriodYears
);

const loanDuration = calculateLoanDuration(
  testTranche.netLoanAmount,
  testTranche.interestRate,
  testTranche.initialRepayment
);

console.log(`Monatliche Abzahlung: ${monthlyPayment}`);
console.log(`Restschuld nach Zinsbindung: ${remainingDebt}`);
console.log(loanDuration !== null 
  ? `Voraussichtliche Laufzeit: ${loanDuration.toFixed(1)} Jahre`
  : "Laufzeit konnte nicht berechnet werden (überschreitet 100 Jahre)");

// Export the functions for use in other files
module.exports = {
  calculateMonthlyPayment,
  calculateRemainingDebt,
  calculateLoanDuration
};