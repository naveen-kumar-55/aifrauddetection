"""
================================================================================
FraudLens AI — Graph Utility Functions
================================================================================
Reusable NetworkX graph construction, metric computation, and topology helpers
for the Financial Fraud Intelligence Platform.
"""

import pandas as pd
import numpy as np
import networkx as nx


def build_transaction_graph(df_tx):
    """
    Constructs a directed NetworkX graph from a transactions DataFrame.
    
    Args:
        df_tx: DataFrame with sender_account_id, receiver_account_id, 
               transaction_amount, and fraud indicator columns.
    
    Returns:
        nx.DiGraph with amount and is_fraud edge attributes.
    """
    G = nx.DiGraph()

    sender_col = "sender_account_id" if "sender_account_id" in df_tx.columns else "sender"
    receiver_col = "receiver_account_id" if "receiver_account_id" in df_tx.columns else "receiver"
    amount_col = "transaction_amount" if "transaction_amount" in df_tx.columns else "amount"
    fraud_col = "is_fraud" if "is_fraud" in df_tx.columns else "isFraud"

    for _, r in df_tx.iterrows():
        s = str(r[sender_col]).strip()
        t = str(r[receiver_col]).strip()
        amt = float(r.get(amount_col, 0))
        is_f = bool(r.get(fraud_col, False))
        G.add_edge(s, t, amount=amt, is_fraud=is_f)

    return G


def compute_graph_metrics(G):
    """
    Computes comprehensive graph-level metrics for a NetworkX DiGraph.
    
    Returns:
        dict with node_count, edge_count, density, avg_degree,
        communities, largest_component_size, weakly_connected_components,
        strongly_connected_components, avg_clustering, and diameter estimate.
    """
    metrics = {}

    metrics["node_count"] = G.number_of_nodes()
    metrics["edge_count"] = G.number_of_edges()
    metrics["density"] = round(nx.density(G), 6) if G.number_of_nodes() > 0 else 0.0

    if G.number_of_nodes() > 0:
        degrees = [d for _, d in G.degree()]
        metrics["avg_degree"] = round(np.mean(degrees), 2)
    else:
        metrics["avg_degree"] = 0.0

    # Weakly and strongly connected components
    wcc = list(nx.weakly_connected_components(G))
    scc = list(nx.strongly_connected_components(G))
    metrics["weakly_connected_components"] = len(wcc)
    metrics["strongly_connected_components"] = len(scc)
    metrics["largest_component_size"] = max(len(c) for c in wcc) if wcc else 0

    # Louvain community detection
    try:
        communities = nx.community.louvain_communities(G.to_undirected())
        metrics["communities"] = len(communities)
    except Exception:
        metrics["communities"] = 1

    # Average clustering coefficient (undirected)
    try:
        metrics["avg_clustering"] = round(nx.average_clustering(G.to_undirected()), 4)
    except Exception:
        metrics["avg_clustering"] = 0.0

    # Diameter estimate (on largest weakly connected component)
    if wcc:
        largest_cc = max(wcc, key=len)
        sub = G.subgraph(largest_cc).to_undirected()
        try:
            metrics["diameter"] = nx.diameter(sub)
        except Exception:
            metrics["diameter"] = -1
    else:
        metrics["diameter"] = 0

    return metrics


def compute_node_centralities(G, top_n=20):
    """
    Computes PageRank and betweenness centrality for all nodes.
    
    Returns:
        pagerank_dict, betweenness_dict
    """
    try:
        pr = nx.pagerank(G, max_iter=100)
    except Exception:
        pr = {n: 0.0 for n in G.nodes()}

    try:
        bc = nx.betweenness_centrality(G, k=min(200, G.number_of_nodes()))
    except Exception:
        bc = {n: 0.0 for n in G.nodes()}

    return pr, bc


def count_fraud_paths(G):
    """
    Counts the number of edges in the graph that are marked as fraudulent.
    """
    return sum(1 for _, _, d in G.edges(data=True) if d.get("is_fraud", False))


def get_fraud_nodes(G):
    """
    Returns set of nodes connected to at least one fraud edge.
    """
    fraud_nodes = set()
    for u, v, d in G.edges(data=True):
        if d.get("is_fraud", False):
            fraud_nodes.add(u)
            fraud_nodes.add(v)
    return fraud_nodes
