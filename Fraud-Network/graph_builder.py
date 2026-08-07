import pandas as pd
import networkx as nx

df = pd.read_csv(r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\cleaned_transactions.csv")

G = nx.MultiDiGraph()

for _, row in df.iterrows():
    G.add_edge(
        row["sender_account_id"],
        row["receiver_account_id"],
        transaction_id=row["transaction_id"],
        amount=row["transaction_amount"],
        timestamp=row["timestamp"],
        transaction_type=row["transaction_type"],
        channel=row["channel"],
        risk_score=row["risk_score"],
        fraud=row["is_fraud"]
    )

print("=" * 50)
print("Transaction Graph Created")
print("=" * 50)
print("Accounts :", G.number_of_nodes())
print("Transactions :", G.number_of_edges())

print("\nSample Accounts")
print(list(G.nodes())[:10])

print("\nSample Transactions")
for edge in list(G.edges(data=True))[:5]:
    print(edge)