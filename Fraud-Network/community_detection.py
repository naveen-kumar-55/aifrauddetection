import pandas as pd
import networkx as nx
import community as community_louvain

df = pd.read_csv(r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\cleaned_transactions.csv")

G = nx.Graph()

for _, row in df.iterrows():
    G.add_edge(
        row["sender_account_id"],
        row["receiver_account_id"]
    )

print("Detecting Communities...")

communities = community_louvain.best_partition(G)

community_df = pd.DataFrame({
    "account_id": list(communities.keys()),
    "community_id": list(communities.values())
})

community_df.to_csv(
    r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\community_results.csv",
    index=False
)

print(community_df.head())

print("\nTotal Communities:", community_df["community_id"].nunique())
print("Community detection completed.")