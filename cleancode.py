import pandas as pd
df = pd.read_csv(r"C:\Users\rajiv\Downloads\DATASPHERE\fraud_network_transactions.csv")
print(f"Original Dataset Shape: {df.shape}")
df = df.drop_duplicates()
if "transaction_id" in df.columns:
    df = df.drop_duplicates(subset="transaction_id")
df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
df = df[df["transaction_amount"] > 0]
numeric_columns = [
    "receiver_account_age_days",
    "sender_avg_amount_30d",
    "amount_deviation_ratio",
    "time_since_last_sender_txn_min"
]
for column in numeric_columns:
    if column in df.columns:
        df[column] = df[column].fillna(df[column].median())
df["receiver_country"] = df["receiver_country"].fillna("Unknown")
df["sender_device_id"] = df["sender_device_id"].fillna("UNKNOWN_DEVICE")
df["sender_ip_address"] = df["sender_ip_address"].fillna("UNKNOWN_IP")
df["fraud_type"] = df["fraud_type"].fillna("No Fraud")
df = df.dropna(subset=["sender_account_id", "receiver_account_id"])
text_columns = [
    "sender_account_id",
    "receiver_account_id",
    "sender_country",
    "receiver_country",
    "transaction_type"
]

for column in text_columns:
    df[column] = (
        df[column]
        .astype(str)
        .str.strip() # type: ignore
        .str.upper()
    )

df["year"] = df["timestamp"].dt.year
df["month"] = df["timestamp"].dt.month
df["day"] = df["timestamp"].dt.day
df["hour"] = df["timestamp"].dt.hour
df["weekday"] = df["timestamp"].dt.day_name()

df = df.sort_values("timestamp").reset_index(drop=True)

df.to_csv("cleaned_transactions.csv", index=False)

print("\nData Cleaning Summary")
print("-" * 30)
print(f"Rows          : {len(df)}")
print(f"Columns       : {len(df.columns)}")
print(f"Missing Values: {df.isnull().sum().sum()}")

if "is_fraud" in df.columns:
    print(f"Fraud Cases   : {df['is_fraud'].sum()}")
    print(f"Normal Cases  : {(~df['is_fraud']).sum()}")

print("\nCleaned dataset saved as 'cleaned_transactions.csv'")