import numpy as np
import pandas as pd
import os

PURPOSES_NORMAL = [
    "Education expenses for university",
    "Medical treatment and hospital bills",
    "Business expansion and inventory",
    "Home renovation and repairs",
    "Emergency funds for family",
]

PURPOSES_FRAUD = [
    "urgent need fast",
    "investment opportunity guaranteed returns",
    "quick cash needed",
    "temporary loan will repay soon",
    "test purpose",
]


def generate_normal_loans(n=700):
    data = []
    for i in range(n):
        wallet_age = np.random.uniform(30, 365)
        wallet_balance = np.random.lognormal(1, 1)
        loan_amount = np.random.uniform(0.1, min(10, wallet_balance * 0.8))
        purpose = np.random.choice(PURPOSES_NORMAL)
        data.append({
            "amount": loan_amount,
            "purpose_length": len(purpose),
            "wallet_age_days": wallet_age,
            "wallet_balance": max(0.01, wallet_balance),
            "previous_loans": np.random.poisson(1),
            "avg_tx_amount": np.random.lognormal(0, 0.5),
            "tx_count": int(np.random.poisson(20)),
            "is_fraud": 0,
        })
    return pd.DataFrame(data)


def generate_fraudulent_loans(n=300):
    data = []
    for i in range(n):
        wallet_age = np.random.uniform(1, 30)
        wallet_balance = np.random.uniform(0, 0.5)
        loan_amount = np.random.uniform(5, 100)
        purpose = np.random.choice(PURPOSES_FRAUD)
        data.append({
            "amount": loan_amount,
            "purpose_length": len(purpose),
            "wallet_age_days": wallet_age,
            "wallet_balance": max(0.01, wallet_balance),
            "previous_loans": np.random.poisson(5),
            "avg_tx_amount": np.random.uniform(0, 0.01),
            "tx_count": int(np.random.poisson(2)),
            "is_fraud": 1,
        })
    return pd.DataFrame(data)


def generate_dataset():
    normal = generate_normal_loans()
    fraud = generate_fraudulent_loans()
    df = pd.concat([normal, fraud], ignore_index=True)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    return df
