def calculate_monthly_payment(net_loan_amount, interest_rate, initial_repayment):
    monthly_interest_rate = interest_rate / 100 / 12
    monthly_repayment_rate = (interest_rate + initial_repayment) / 100 / 12
    monthly_payment = net_loan_amount * monthly_repayment_rate
    return monthly_payment

def calculate_remaining_balance(net_loan_amount, interest_rate, initial_repayment, fixed_interest_period_years):
    monthly_interest_rate = interest_rate / 100 / 12
    monthly_payment = calculate_monthly_payment(net_loan_amount, interest_rate, initial_repayment)
    
    remaining_balance = net_loan_amount
    for _ in range(fixed_interest_period_years * 12):
        interest_payment = remaining_balance * monthly_interest_rate
        principal_payment = monthly_payment - interest_payment
        remaining_balance -= principal_payment
    
    return remaining_balance

def calculate_loan_duration(net_loan_amount, interest_rate, initial_repayment):
    monthly_interest_rate = interest_rate / 100 / 12
    monthly_payment = calculate_monthly_payment(net_loan_amount, interest_rate, initial_repayment)
    
    remaining_balance = net_loan_amount
    months = 0
    while remaining_balance > 0:
        interest_payment = remaining_balance * monthly_interest_rate
        principal_payment = monthly_payment - interest_payment
        remaining_balance -= principal_payment
        months += 1
    
    years = months / 12
    return years



# Example usage
tranche_input = {
    "net_loan_amount": 161000.00,
    "interest_rate": 1.35,  # Sollzins p.a.
    "fixed_interest_period_years": 15,  # Zinslaufzeit in Jahren
    "initial_repayment": 2.00  # Anfängliche Tilgung
}

monthly_payment = calculate_monthly_payment(
    tranche_input["net_loan_amount"],
    tranche_input["interest_rate"],
    tranche_input["initial_repayment"]
)

remaining_balance = calculate_remaining_balance(
    tranche_input["net_loan_amount"],
    tranche_input["interest_rate"],
    tranche_input["initial_repayment"],
    tranche_input["fixed_interest_period_years"]
)

loan_duration = calculate_loan_duration(
    tranche_input["net_loan_amount"],
    tranche_input["interest_rate"],
    tranche_input["initial_repayment"]
)

print(f"Monatliche Abzahlung: {monthly_payment:.2f}€")
print(f"Restschuld nach Zinsbindung: {remaining_balance:.2f}€")
print(f"Voraussichtliche Laufzeit: {loan_duration:.1f} Jahre")