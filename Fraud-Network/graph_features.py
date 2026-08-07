import pandas as pd
import networkx as nx

df = pd.read_csv(r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\cleaned_transactions.csv")

G = nx.MultiDiGraph()

for _, row in df.iterrows():
    G.add_edge(
        row["sender_account_id"],
        row["receiver_account_id"],
        amount=row["transaction_amount"]
    )

DG = nx.DiGraph(G)

print("Calculating graph features...")

in_degree = dict(DG.in_degree())
out_degree = dict(DG.out_degree())
degree = dict(DG.degree())

degree_centrality = nx.degree_centrality(DG)
pagerank = nx.pagerank(DG)

features = pd.DataFrame({
    "account_id": list(DG.nodes()),
    "in_degree": [in_degree.get(n, 0) for n in DG.nodes()],
    "out_degree": [out_degree.get(n, 0) for n in DG.nodes()],
    "degree": [degree.get(n, 0) for n in DG.nodes()],
    "degree_centrality": [degree_centrality.get(n, 0) for n in DG.nodes()],
    "pagerank": [pagerank.get(n, 0) for n in DG.nodes()]
})

features.to_csv("graph_features.csv", index=False)

print(features.head())

print("\nGraph features saved successfully.")