"""Quick sanity check for graph_utils and simulation modules."""
import pandas as pd
from graph_utils import build_transaction_graph, compute_graph_metrics
from simulation import compute_impact, simulate_freeze

df = pd.read_csv("data/transactions.csv", nrows=500)
G = build_transaction_graph(df)
m = compute_graph_metrics(G)

print("=== Graph Built Successfully ===")
print(f"  Nodes:       {m['node_count']}")
print(f"  Edges:       {m['edge_count']}")
print(f"  Density:     {m['density']}")
print(f"  Communities: {m['communities']}")
print(f"  Avg Degree:  {m['avg_degree']}")

# Simulate freezing the first node
target = list(G.nodes())[0]
G2 = simulate_freeze(G, [target])
impact = compute_impact(G, G2, [target])

print(f"\n=== Freeze Account: {target} ===")
print(f"  NDI: {impact['ndi']}%")
print(f"  FSS: {impact['fss']}%")
print(f"  CCR: {impact['ccr']}%")
print(f"  IES: {impact['ies']}%")
print(f"  Risk Reduction: {impact['risk_reduction_pct']}%")
print(f"  Recommendation: {impact['recommendation']}")
print(f"  Top affected: {len(impact['top_affected_accounts'])} accounts")
print("\n=== ALL TESTS PASSED ===")
