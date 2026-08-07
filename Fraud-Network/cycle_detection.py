import pandas as pd
import networkx as nx

df = pd.read_csv(r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\cleaned_transactions.csv")

G = nx.DiGraph()

for _, row in df.iterrows():
    G.add_edge(
        row["sender_account_id"],
        row["receiver_account_id"]
    )

print("Searching for suspicious two-node cycles...")

cycles = []

for u, v in G.edges():
    if G.has_edge(v, u):
        cycles.append((u, v))

cycle_df = pd.DataFrame(cycles, columns=["Account_A", "Account_B"])
cycle_df = cycle_df.drop_duplicates()

cycle_df.to_csv(
    r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\cycle_results.csv",
    index=False
)
print(f"Suspicious two-node cycles found: {len(cycle_df)}")
print(cycle_df.head())
print("Cycle detection completed.")