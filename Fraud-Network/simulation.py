"""
================================================================================
FraudLens AI — Intervention Impact Simulator Engine
================================================================================
Simulates the effect of freezing accounts, communities, or fraud rings
on the transaction network topology. Computes before/after graph metrics
and generates AI Impact Reports.

Supports:
    Option 1: Freeze One Account
    Option 2: Freeze Multiple Accounts
    Option 3: Freeze Entire Community
    Option 4: Remove Fraud Ring
    Option 5: Monitor Without Freeze (baseline only)
"""

import copy
import numpy as np
import networkx as nx
from graph_utils import (
    compute_graph_metrics,
    compute_node_centralities,
    count_fraud_paths,
    get_fraud_nodes,
)


# --------------------------------------------------------------------------
# Core Simulation Engine
# --------------------------------------------------------------------------
def simulate_freeze(G, accounts_to_freeze):
    """
    Creates a deep copy of G, removes the specified accounts (nodes),
    and returns the modified graph.

    Args:
        G: Original NetworkX DiGraph.
        accounts_to_freeze: list of account_id strings to remove.

    Returns:
        G_after: Modified graph with accounts removed.
    """
    G_after = G.copy()
    for acc in accounts_to_freeze:
        if G_after.has_node(acc):
            G_after.remove_node(acc)
    return G_after


def simulate_community_freeze(G, community_map, community_id):
    """
    Freezes all accounts belonging to the specified community.

    Args:
        G: Original DiGraph.
        community_map: dict mapping account_id -> community_id.
        community_id: int community to freeze.

    Returns:
        G_after, list of frozen accounts.
    """
    accounts = [acc for acc, cid in community_map.items() if cid == community_id]
    G_after = simulate_freeze(G, accounts)
    return G_after, accounts


def simulate_fraud_ring_removal(G):
    """
    Removes all nodes that are connected to fraud-labeled edges.

    Returns:
        G_after, list of removed fraud nodes.
    """
    fraud_nodes = list(get_fraud_nodes(G))
    G_after = simulate_freeze(G, fraud_nodes)
    return G_after, fraud_nodes


# --------------------------------------------------------------------------
# Impact Comparison & Novel Metric Computation
# --------------------------------------------------------------------------
def compute_impact(G_before, G_after, frozen_accounts):
    """
    Computes the full before-vs-after impact report.

    Args:
        G_before: Original graph.
        G_after:  Graph after intervention.
        frozen_accounts: list of account IDs that were removed.

    Returns:
        dict with all before/after metrics, delta values,
        and novel intervention scores (NDI, FSS, CCR, IES).
    """
    metrics_before = compute_graph_metrics(G_before)
    metrics_after = compute_graph_metrics(G_after)

    # Fraud path counts
    fraud_paths_before = count_fraud_paths(G_before)
    fraud_paths_after = count_fraud_paths(G_after)
    fraud_paths_removed = fraud_paths_before - fraud_paths_after

    # Community change
    communities_before = metrics_before["communities"]
    communities_after = metrics_after["communities"]
    communities_split = max(0, communities_after - communities_before)

    # Density reduction
    density_before = metrics_before["density"]
    density_after = metrics_after["density"]
    density_reduction_pct = round(
        ((density_before - density_after) / max(density_before, 1e-9)) * 100, 2
    )

    # Node/Edge reduction
    nodes_removed = metrics_before["node_count"] - metrics_after["node_count"]
    edges_removed = metrics_before["edge_count"] - metrics_after["edge_count"]

    # Component change
    wcc_before = metrics_before["weakly_connected_components"]
    wcc_after = metrics_after["weakly_connected_components"]
    component_increase = max(0, wcc_after - wcc_before)

    # Largest component shrinkage
    lcc_before = metrics_before["largest_component_size"]
    lcc_after = metrics_after["largest_component_size"]

    # PageRank change for top affected nodes
    pr_before, _ = compute_node_centralities(G_before)
    pr_after, _ = compute_node_centralities(G_after)

    # Top affected accounts by PageRank drop
    top_affected = []
    for node in G_before.nodes():
        if node not in frozen_accounts and node in pr_before:
            pr_b = pr_before.get(node, 0)
            pr_a = pr_after.get(node, 0)
            delta = pr_b - pr_a
            if delta > 0:
                top_affected.append({
                    "account_id": node,
                    "pagerank_before": round(pr_b, 6),
                    "pagerank_after": round(pr_a, 6),
                    "pagerank_drop": round(delta, 6),
                })
    top_affected.sort(key=lambda x: x["pagerank_drop"], reverse=True)
    top_affected = top_affected[:10]

    # ─── Novel Metrics ───────────────────────────────────────────────────────

    # Network Disruption Index (NDI): % of network disconnected
    ndi = round(
        (edges_removed / max(metrics_before["edge_count"], 1)) * 100, 2
    )

    # Fraud Suppression Score (FSS): % reduction of fraud paths
    fss = round(
        (fraud_paths_removed / max(fraud_paths_before, 1)) * 100, 2
    )

    # Community Collapse Ratio (CCR): shrinkage of largest community component
    ccr = round(
        ((lcc_before - lcc_after) / max(lcc_before, 1)) * 100, 2
    )

    # Intervention Effectiveness Score (IES): weighted composite
    ies = round(0.35 * ndi + 0.40 * fss + 0.25 * ccr, 2)

    # Risk reduction estimate
    risk_reduction_pct = round(min(99.0, max(0.0, ies * 0.85)), 1)

    # Generate recommendation
    if ies >= 60:
        recommendation = "FREEZE IMMEDIATELY — Critical network bridge node."
        reason = ("This account acts as a bridge between multiple fraud communities. "
                  "Removing it significantly disrupts money flow and isolates fraud clusters.")
    elif ies >= 30:
        recommendation = "FREEZE RECOMMENDED — Elevated network impact."
        reason = ("This account has substantial network connectivity to flagged clusters. "
                  "Freezing would reduce fraud path availability and split suspicious communities.")
    else:
        recommendation = "MONITOR — Limited network disruption impact."
        reason = ("This account has moderate network influence. Freezing would have "
                  "limited impact on overall fraud topology. Recommend continued monitoring.")

    return {
        # Before metrics
        "before": metrics_before,
        # After metrics
        "after": metrics_after,
        # Delta values
        "frozen_accounts": frozen_accounts,
        "frozen_count": len(frozen_accounts),
        "nodes_removed": nodes_removed,
        "edges_removed": edges_removed,
        "fraud_paths_before": fraud_paths_before,
        "fraud_paths_after": fraud_paths_after,
        "fraud_paths_removed": fraud_paths_removed,
        "communities_before": communities_before,
        "communities_after": communities_after,
        "communities_split": communities_split,
        "density_reduction_pct": density_reduction_pct,
        "component_increase": component_increase,
        "largest_component_before": lcc_before,
        "largest_component_after": lcc_after,
        # Novel scores
        "ndi": ndi,
        "fss": fss,
        "ccr": ccr,
        "ies": ies,
        "risk_reduction_pct": risk_reduction_pct,
        # AI Report
        "recommendation": recommendation,
        "reason": reason,
        "top_affected_accounts": top_affected,
    }
