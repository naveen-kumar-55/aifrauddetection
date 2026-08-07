import pandas as pd
import networkx as nx
import numpy as np

def normalize(series):
    s_min = series.min()
    s_max = series.max()
    if s_max == s_min:
        return pd.Series(0, index=series.index)
    return ((series - s_min) / (s_max - s_min)) * 100.0

print("Loading data...")
df = pd.read_csv(r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\cleaned_transactions.csv")
df['timestamp'] = pd.to_datetime(df['timestamp'])

# Load communities
communities_df = pd.read_csv(r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\community_results.csv")
community_map = dict(zip(communities_df['account_id'], communities_df['community_id']))

# Identify known fraud accounts
fraud_txns = df[df['is_fraud'] == True]
fraud_accounts = set(fraud_txns['sender_account_id']).union(set(fraud_txns['receiver_account_id']))

print(f"Found {len(fraud_accounts)} known fraud accounts.")

print("Building Graph...")
G = nx.DiGraph()
for _, row in df.iterrows():
    sender = row["sender_account_id"]
    receiver = row["receiver_account_id"]
    amt = row["transaction_amount"]
    if G.has_edge(sender, receiver):
        G[sender][receiver]['weight'] += amt
    else:
        G.add_edge(sender, receiver, weight=amt)

nodes = list(G.nodes())

# Calculate Community Risk (percentage of fraud in community)
print("Calculating Community Risk...")
community_risk = {}
community_nodes = {}
for n in nodes:
    c = community_map.get(n, "Unknown")
    if c not in community_nodes:
        community_nodes[c] = []
    community_nodes[c].append(n)

for c, c_nodes in community_nodes.items():
    fraud_count = sum(1 for n in c_nodes if n in fraud_accounts)
    risk = fraud_count / len(c_nodes) if len(c_nodes) > 0 else 0
    for n in c_nodes:
        community_risk[n] = risk

# Base Metrics
print("Calculating Base Graph Metrics...")
personalization = {n: (1 if n in fraud_accounts else 0) for n in nodes}
pr = nx.pagerank(G, personalization=personalization if sum(personalization.values()) > 0 else None, weight='weight')
dc = nx.degree_centrality(G)
# Approximate betweenness centrality for speed
bc = nx.betweenness_centrality(G, k=min(100, len(G.nodes())), seed=42)
vol = dict(G.degree(weight='weight'))

# Convert to Pandas Series for easy normalization
df_metrics = pd.DataFrame({
    'account_id': nodes,
    'pagerank': [pr[n] for n in nodes],
    'betweenness': [bc[n] for n in nodes],
    'degree_centrality': [dc[n] for n in nodes],
    'volume': [vol[n] for n in nodes]
}).set_index('account_id')

# Normalize metrics
df_metrics['pr_norm'] = normalize(df_metrics['pagerank'])
df_metrics['bc_norm'] = normalize(df_metrics['betweenness'])
df_metrics['dc_norm'] = normalize(df_metrics['degree_centrality'])
df_metrics['vol_norm'] = normalize(df_metrics['volume'])

# 1. Fraud Influence Index (FII)
print("Calculating Fraud Influence Index (FII)...")
df_metrics['fii'] = (
    0.40 * df_metrics['pr_norm'] +
    0.30 * df_metrics['bc_norm'] +
    0.20 * df_metrics['dc_norm'] +
    0.10 * df_metrics['vol_norm']
)

# 2. Network Exposure Score (NES)
print("Calculating Network Exposure Score (NES)...")
nes_raw = {}
for n in nodes:
    if n in fraud_accounts:
        nes_raw[n] = 100.0
        continue
        
    neighbors = set(G.successors(n)).union(set(G.predecessors(n)))
    fraud_neighbors = neighbors.intersection(fraud_accounts)
    
    fraud_neighbor_score = min(len(fraud_neighbors) * 20, 100) # 5+ neighbors = 100
    
    # Path distance (1-hop = 100, 2-hop = 50, 3-hop = 25, else 0)
    path_score = 0
    if len(fraud_neighbors) > 0:
        path_score = 100
    else:
        # Check 2-hop
        for neighbor in neighbors:
            hop2 = set(G.successors(neighbor)).union(set(G.predecessors(neighbor)))
            if len(hop2.intersection(fraud_accounts)) > 0:
                path_score = 50
                break
                
    comm_risk_score = community_risk.get(n, 0) * 100
    
    # Combine (Weights: 40% Neighbors, 40% Path, 20% Community)
    nes_raw[n] = (0.4 * fraud_neighbor_score) + (0.4 * path_score) + (0.2 * comm_risk_score)

df_metrics['nes_raw'] = pd.Series(nes_raw)
df_metrics['nes'] = normalize(df_metrics['nes_raw'])
# Ensure known fraud is still 100
for n in fraud_accounts:
    if n in df_metrics.index:
        df_metrics.at[n, 'nes'] = 100.0

# 3. Behavior Drift Score (BDS)
print("Calculating Behavior Drift Score (BDS)...")
sender_daily = df.groupby([df['timestamp'].dt.date, 'sender_account_id']).size().reset_index(name='count')
bds_raw = {}
for account in nodes:
    acc_days = sender_daily[sender_daily['sender_account_id'] == account]['count']
    if len(acc_days) > 1:
        drift = acc_days.max() / acc_days.mean()
        bds_raw[account] = drift
    else:
        bds_raw[account] = 1.0

# Normalize BDS to 0-100 (where a drift of 1.0 is 0%, and say drift of 5.0+ is 100%)
df_metrics['bds_raw'] = pd.Series(bds_raw)
# Custom normalization for drift: min is 1.0. Cap at 5.0 for 100%
df_metrics['bds'] = np.clip((df_metrics['bds_raw'] - 1.0) / 4.0 * 100.0, 0, 100)

# Load existing graph risk scores for IPS
print("Calculating Intervention Priority Score (IPS)...")
try:
    risk_df = pd.read_csv(r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\risk_scores.csv").set_index('account_id')
    df_metrics['risk_score'] = risk_df['graph_risk_score']
except:
    df_metrics['risk_score'] = 0

df_metrics['comm_risk'] = pd.Series(community_risk) * 100

# IPS Formula: 0.35 * FII + 0.30 * NES + 0.20 * Community Risk + 0.15 * Risk Score
df_metrics['ips'] = (
    0.35 * df_metrics['fii'] +
    0.30 * df_metrics['nes'] +
    0.20 * df_metrics['comm_risk'] +
    0.15 * df_metrics['risk_score'].fillna(0)
)
df_metrics['ips'] = normalize(df_metrics['ips'])

print("Saving advanced features...")
output_df = df_metrics[['fii', 'nes', 'ips', 'bds']].reset_index()
output_df.to_csv(r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\advanced_features.csv", index=False)
print("Saved to data/advanced_features.csv")
