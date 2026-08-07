import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# -----------------------------
# Configuration
# -----------------------------
NUM_TRANSACTIONS = 200000
NUM_ACCOUNTS = 5000

random.seed(42)
np.random.seed(42)

# -----------------------------
# Generate Account IDs
# -----------------------------
accounts = [f"ACC{str(i).zfill(6)}" for i in range(1, NUM_ACCOUNTS + 1)]

# -----------------------------
# Generate Transactions
# -----------------------------
data = []

start_time = datetime(2025, 1, 1)

for i in range(NUM_TRANSACTIONS):

    sender = random.choice(accounts)

    receiver = random.choice(accounts)

    while receiver == sender:
        receiver = random.choice(accounts)

    amount = round(np.random.exponential(5000), 2)

    timestamp = start_time + timedelta(seconds=i * 15)

    transaction_type = random.choice([
        "Transfer",
        "UPI",
        "NEFT",
        "RTGS",
        "IMPS"
    ])

    device = random.choice([
        "Mobile",
        "Web",
        "ATM"
    ])

    location = random.choice([
        "Chennai",
        "Bangalore",
        "Mumbai",
        "Delhi",
        "Hyderabad"
    ])

    merchant = random.choice([
        "Amazon",
        "Flipkart",
        "Paytm",
        "PhonePe",
        "GooglePay",
        "Bank"
    ])

    # 3.5% fraud
    fraud = np.random.choice(
        [0, 1],
        p=[0.965, 0.035]
    )

    data.append([
        f"TXN{str(i+1).zfill(8)}",
        timestamp,
        sender,
        receiver,
        amount,
        transaction_type,
        device,
        location,
        merchant,
        fraud
    ])

# -----------------------------
# Create DataFrame
# -----------------------------
transactions = pd.DataFrame(data, columns=[
    "transaction_id",
    "timestamp",
    "sender",
    "receiver",
    "amount",
    "transaction_type",
    "device",
    "location",
    "merchant",
    "isFraud"
])

# -----------------------------
# Save
# -----------------------------
transactions.to_csv("transactions.csv", index=False)

print("transactions.csv created successfully!")

print(transactions.head())

print(transactions.shape)