"""
================================================================================
FraudLens AI — Flask Backend API Server
================================================================================
Serves all endpoints required by the React frontend on http://localhost:5000

Endpoints:
  GET /summary                           -> KPI summary stats
  GET /analytics                         -> Charts data (fraud trend, tx types, etc.)
  GET /graph-data?limit=N               -> Network graph nodes + edges
  GET /graph-features                    -> Raw graph feature table
  GET /communities                       -> Community cluster data
  GET /cycles                            -> Fraud ring / cycle data
  GET /risk-scores                       -> Per-account risk scores
  GET /advanced-features                 -> FII, BDS, NES, IPS features
  GET /high-risk-accounts                -> Top high-risk accounts
  GET /fraud-trend                       -> Fraud trend over time
  GET /transaction-types                 -> Distribution by type
  GET /channels                          -> Distribution by device/channel
  GET /countries                         -> Distribution by location
  GET /account-transactions/<id>         -> All transactions for an account
  GET /ai-investigation/<id>             -> AI investigation report for an account
  GET /simulate-intervention/<id>        -> Simulate freezing an account

Usage:
  python server.py
"""

import os
import sys
import json
import math
import pandas as pd
import numpy as np
import networkx as nx
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime

# ──────────────────────────────────────────────────────────────────────────────
# Setup
# ──────────────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

app = Flask(__name__)
CORS(app)  # Allow React dev server to call this API


# ──────────────────────────────────────────────────────────────────────────────
# Data Loading  (loaded once at startup)
# ──────────────────────────────────────────────────────────────────────────────
def _load_csv(fname):
    """Load a CSV from the data/ directory. Returns empty DataFrame on failure."""
    path = os.path.join(DATA_DIR, fname)
    if not os.path.exists(path):
        print(f"  [WARN] Missing file: {path}")
        return pd.DataFrame()
    df = pd.read_csv(path)
    print(f"  [OK]   Loaded {fname}: {len(df)} rows, columns={list(df.columns)}")
    return df


print("=" * 60)
print("  FraudLens AI — Flask Backend Loading Data...")
print("=" * 60)

# Load cleaned_transactions.csv first (it has account IDs matching graph features),
# fall back to transactions.csv if not present
_tx_path = os.path.join(DATA_DIR, "cleaned_transactions.csv")
if not os.path.exists(_tx_path):
    _tx_path = os.path.join(DATA_DIR, "transactions.csv")

df_tx       = _load_csv(os.path.basename(_tx_path))
df_graph    = _load_csv("graph_features.csv")
df_adv      = _load_csv("advanced_features.csv")
df_comm     = _load_csv("community_results.csv")
df_risk     = _load_csv("risk_scores.csv")
df_cycle    = _load_csv("cycle_results.csv")

# Normalize column names for transactions
_col_map = {"sender": "sender_account_id", "receiver": "receiver_account_id",
             "amount": "transaction_amount", "isFraud": "is_fraud"}
for old, new in _col_map.items():
    if old in df_tx.columns and new not in df_tx.columns:
        df_tx.rename(columns={old: new}, inplace=True)

# Parse timestamp
if "timestamp" in df_tx.columns:
    df_tx["timestamp"] = pd.to_datetime(df_tx["timestamp"], errors="coerce")

# Merge graph features, advanced features, community, and risk onto transactions
def _merge_node_data():
    """Build a per-account lookup with all graph + community + risk features."""
    node_df = df_graph.copy() if not df_graph.empty else pd.DataFrame(columns=["account_id"])

    if not df_adv.empty and "account_id" in df_adv.columns:
        node_df = pd.merge(node_df, df_adv, on="account_id", how="outer")
    if not df_comm.empty and "account_id" in df_comm.columns:
        node_df = pd.merge(node_df, df_comm[["account_id", "community_id"]], on="account_id", how="outer")
    if not df_risk.empty and "account_id" in df_risk.columns:
        risk_cols = ["account_id", "graph_risk_score"] + \
                    [c for c in df_risk.columns if c not in ("account_id", "graph_risk_score")]
        node_df = pd.merge(node_df, df_risk[risk_cols], on="account_id", how="outer")

    node_df.fillna(0, inplace=True)
    node_df.drop_duplicates(subset=["account_id"], inplace=True)
    return node_df

print("  Building node lookup...")
node_lookup = _merge_node_data()
node_index = node_lookup.set_index("account_id") if not node_lookup.empty else pd.DataFrame()
print(f"  Node lookup: {len(node_lookup)} accounts")
print("=" * 60)


# ──────────────────────────────────────────────────────────────────────────────
# Helper: safe JSON conversion (handle NaN, Inf, numpy types)
# ──────────────────────────────────────────────────────────────────────────────
def _safe(val, default=0):
    """Convert numpy/NaN values to JSON-safe Python types."""
    if val is None:
        return default
    if isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
        return default
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        return float(val)
    if isinstance(val, (np.bool_,)):
        return bool(val)
    return val


def _node_info(account_id):
    """Look up graph features for an account, return a safe dict."""
    if node_index.empty or account_id not in node_index.index:
        return {}
    row = node_index.loc[account_id]
    return {k: _safe(v) for k, v in row.items()}


def _risk_score_pct(account_id):
    """Return risk score as 0-100 percentage for an account."""
    info = _node_info(account_id)
    raw = info.get("graph_risk_score", 0)
    return round(float(raw) * 100, 1) if raw <= 1.0 else round(float(raw), 1)


# ──────────────────────────────────────────────────────────────────────────────
# CORS preflight
# ──────────────────────────────────────────────────────────────────────────────
@app.after_request
def add_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


# ──────────────────────────────────────────────────────────────────────────────
# /summary — KPI cards for Dashboard
# ──────────────────────────────────────────────────────────────────────────────
@app.route("/summary")
def summary():
    total_tx = len(df_tx)
    total_accounts = len(node_lookup)

    fraud_col = "is_fraud" if "is_fraud" in df_tx.columns else "isFraud"
    fraud_tx = int(df_tx[fraud_col].sum()) if fraud_col in df_tx.columns else 0
    fraud_rate = round((fraud_tx / max(1, total_tx)) * 100, 2)

    high_risk = 0
    if not df_risk.empty and "graph_risk_score" in df_risk.columns:
        high_risk = int((df_risk["graph_risk_score"] > 0.5).sum())

    communities = len(df_comm["community_id"].unique()) if not df_comm.empty and "community_id" in df_comm.columns else 0
    cycles = len(df_cycle["ring_id"].unique()) if not df_cycle.empty and "ring_id" in df_cycle.columns else 0

    avg_risk = 0.0
    if not df_risk.empty and "graph_risk_score" in df_risk.columns:
        avg_risk = round(float(df_risk["graph_risk_score"].mean()) * 100, 1)

    return jsonify({
        "total_transactions": total_tx,
        "total_accounts": total_accounts,
        "fraud_transactions": fraud_tx,
        "fraud_rate_pct": fraud_rate,
        "high_risk_accounts": high_risk,
        "communities": communities,
        "cycles": cycles,
        "avg_risk_score": avg_risk,
    })


# ──────────────────────────────────────────────────────────────────────────────
# /analytics — charts data
# ──────────────────────────────────────────────────────────────────────────────
@app.route("/analytics")
def analytics():
    fraud_trend = []
    tx_types = []
    channels = []
    locations = []

    if not df_tx.empty and "timestamp" in df_tx.columns:
        df_t = df_tx.copy()
        df_t["date"] = df_t["timestamp"].dt.date
        fraud_col = "is_fraud" if "is_fraud" in df_t.columns else "isFraud"
        daily = df_t.groupby("date").agg(
            total=("transaction_id", "count"),
            fraud=(fraud_col, "sum")
        ).reset_index()
        daily["date"] = daily["date"].astype(str)
        fraud_trend = daily.tail(30).to_dict("records")

    if "transaction_type" in df_tx.columns:
        vc = df_tx["transaction_type"].value_counts().head(10)
        tx_types = [{"type": k, "count": int(v)} for k, v in vc.items()]

    if "device" in df_tx.columns:
        vc = df_tx["device"].value_counts()
        channels = [{"channel": k, "count": int(v)} for k, v in vc.items()]

    if "location" in df_tx.columns:
        vc = df_tx["location"].value_counts().head(10)
        locations = [{"location": k, "count": int(v)} for k, v in vc.items()]

    return jsonify({
        "fraud_trend": fraud_trend,
        "transaction_types": tx_types,
        "channels": channels,
        "locations": locations,
    })


# ──────────────────────────────────────────────────────────────────────────────
# /graph-data — THE KEY ENDPOINT for the Network page
# ──────────────────────────────────────────────────────────────────────────────
@app.route("/graph-data")
def graph_data():
    limit = int(request.args.get("limit", 300))

    # -- Step 1: Build the directed transaction graph --
    sender_col = "sender_account_id"
    receiver_col = "receiver_account_id"
    amount_col = "transaction_amount"
    fraud_col = "is_fraud"

    if sender_col not in df_tx.columns:
        return jsonify({"error": "Missing sender column", "nodes": [], "edges": []}), 500

    # Use a sample of transactions to keep graph manageable
    df_sample = df_tx.head(min(limit * 5, 50000)).copy()

    # Build graph to get unique accounts and aggregated edges
    G = nx.DiGraph()
    for _, row in df_sample.iterrows():
        s = str(row[sender_col]).strip()
        t = str(row[receiver_col]).strip()
        amt = float(row.get(amount_col, 0))
        is_f = bool(row.get(fraud_col, False))

        if G.has_edge(s, t):
            G[s][t]["totalAmount"] += amt
            G[s][t]["count"] += 1
            if is_f:
                G[s][t]["isFraud"] = True
        else:
            G.add_edge(s, t, totalAmount=amt, count=1, isFraud=is_f)

    # -- Step 2: Limit nodes by degree (keep highest-degree accounts) --
    all_nodes = list(G.nodes())
    if len(all_nodes) > limit:
        # Sort by degree and take top `limit` nodes
        degree_sorted = sorted(G.degree(), key=lambda x: x[1], reverse=True)
        top_nodes = {n for n, _ in degree_sorted[:limit]}
        G = G.subgraph(top_nodes).copy()

    print(f"[/graph-data] Nodes: {G.number_of_nodes()}, Edges: {G.number_of_edges()}")

    # -- Step 3: Build nodes array --
    nodes = []
    for account_id in G.nodes():
        info = _node_info(account_id)
        risk_pct = _risk_score_pct(account_id)
        community_id = int(_safe(info.get("community_id", 0)))
        degree = int(_safe(info.get("degree", G.degree(account_id))))
        in_deg = int(_safe(info.get("in_degree", G.in_degree(account_id))))
        out_deg = int(_safe(info.get("out_degree", G.out_degree(account_id))))

        nodes.append({
            "id": account_id,
            "label": account_id,
            "accountName": account_id,          # display name
            "accountNumber": account_id,
            "accountType": "Business" if out_deg > 15 else "Individual",
            "customerName": account_id,
            "riskScore": risk_pct,
            "communityId": community_id,
            "community": community_id,
            "degree": degree,
            "inDegree": in_deg,
            "in_degree": in_deg,
            "outDegree": out_deg,
            "out_degree": out_deg,
            "fii": round(_safe(info.get("fii", 0)), 4),
            "bds": round(_safe(info.get("bds", 0)), 4),
            "nes": round(_safe(info.get("nes", 0)), 4),
            "ips": round(_safe(info.get("ips", 0)), 4),
            "pagerank": round(_safe(info.get("pagerank", 0)), 6),
            "isFraud": risk_pct >= 70,
        })

    # Build a fast lookup for cycle edges
    cycle_edges = set()
    if not df_cycle.empty:
        for _, row in df_cycle.iterrows():
            a = str(row.get("Account_A", "")).strip()
            b = str(row.get("Account_B", "")).strip()
            if a and b:
                cycle_edges.add((a, b))
                cycle_edges.add((b, a))
                
    # -- Step 4: Build edges array (only keep edges where BOTH endpoints exist) --
    node_ids = {n["id"] for n in nodes}
    
    # Pre-fetch node info for edges to avoid redundant lookups
    node_info_cache = {}
    for n in nodes:
        node_info_cache[n["id"]] = n
        
    edges = []
    for u, v, d in G.edges(data=True):
        if u not in node_ids or v not in node_ids:
            continue
            
        u_info = node_info_cache[u]
        v_info = node_info_cache[v]
        
        amt = round(_safe(d.get("totalAmount", 0)), 2)
        count = int(_safe(d.get("count", 1)))
        is_f = bool(d.get("isFraud", False))
        
        # Calculate Suspicious Connection Score (0-100)
        score = 0
        reasons = []
        
        if is_f:
            score += 20
            reasons.append("Historical fraud label on transaction")
            
        if amt > 10000:
            score += 15
            reasons.append(f"High transaction amount ({amt})")
            
        if count > 5:
            score += 15
            reasons.append(f"{count} repeated transfers")
            
        if u_info.get("communityId") == v_info.get("communityId") and u_info.get("communityId", 0) != 0:
            score += 10
            reasons.append(f"Both accounts belong to Community #{u_info['communityId']}")
            
        if (u, v) in cycle_edges:
            score += 30
            reasons.append("Circular transaction detected (Money Laundering Ring)")
            
        if u_info.get("riskScore", 0) > 80:
            score += 15
            reasons.append(f"Sender risk score is critical ({u_info['riskScore']})")
            
        if v_info.get("riskScore", 0) > 80:
            score += 15
            reasons.append(f"Receiver risk score is critical ({v_info['riskScore']})")
            
        # Normalize score to 0-100
        score = min(100, int(score))
        
        if score >= 81:
            confidence_label = "Critical Fraud Connection"
        elif score >= 61:
            confidence_label = "High Risk"
        elif score >= 31:
            confidence_label = "Medium Risk"
        else:
            confidence_label = "Normal"
            
        edges.append({
            "id": f"e-{u}-{v}",
            "source": u,
            "target": v,
            "totalAmount": amt,
            "amount": amt,
            "count": count,
            "isFraud": is_f,
            "transactionType": "Transfer",
            "confidenceScore": score,
            "confidenceLabel": confidence_label,
            "reasons": reasons
        })

    print(f"[/graph-data] Returning {len(nodes)} nodes, {len(edges)} edges")
    return jsonify({"nodes": nodes, "edges": edges})


# ──────────────────────────────────────────────────────────────────────────────
# /graph-features
# ──────────────────────────────────────────────────────────────────────────────
@app.route("/graph-features")
def graph_features():
    if df_graph.empty:
        return jsonify([])
    return jsonify(df_graph.head(500).fillna(0).to_dict("records"))


# ──────────────────────────────────────────────────────────────────────────────
# /communities
# ──────────────────────────────────────────────────────────────────────────────
@app.route("/communities")
def communities():
    if df_comm.empty:
        return jsonify([])
    result = []
    for cid, grp in df_comm.groupby("community_id"):
        members = grp["account_id"].tolist()
        result.append({
            "community_id": int(cid),
            "size": len(members),
            "members": members[:20],  # first 20 for display
        })
    return jsonify(result)


# ──────────────────────────────────────────────────────────────────────────────
# /cycles
# ──────────────────────────────────────────────────────────────────────────────
@app.route("/cycles")
def cycles():
    if df_cycle.empty:
        return jsonify([])
    result = []
    for ring_id, grp in df_cycle.groupby("ring_id"):
        members = []
        for col in ("Account_A", "Account_B"):
            if col in grp.columns:
                members += grp[col].dropna().tolist()
        members = list(dict.fromkeys(members))  # deduplicate, preserve order
        total_amt = float(grp["amount"].sum()) if "amount" in grp.columns else 0.0
        result.append({
            "ring_id": str(ring_id),
            "ring_type": str(grp["ring_type"].iloc[0]) if "ring_type" in grp.columns else "Cycle",
            "members": members,
            "member_count": len(members),
            "total_amount": round(total_amt, 2),
        })
    return jsonify(result)


# ──────────────────────────────────────────────────────────────────────────────
# /risk-scores
# ──────────────────────────────────────────────────────────────────────────────
@app.route("/risk-scores")
def risk_scores():
    if df_risk.empty:
        return jsonify([])
    df_out = df_risk.copy().fillna(0)
    df_out["risk_score_pct"] = (df_out["graph_risk_score"] * 100).round(1)
    return jsonify(df_out.head(500).to_dict("records"))


# ──────────────────────────────────────────────────────────────────────────────
# /advanced-features
# ──────────────────────────────────────────────────────────────────────────────
@app.route("/advanced-features")
def advanced_features():
    if df_adv.empty:
        return jsonify([])
    return jsonify(df_adv.head(500).fillna(0).to_dict("records"))


# ──────────────────────────────────────────────────────────────────────────────
# /high-risk-accounts
# ──────────────────────────────────────────────────────────────────────────────
@app.route("/high-risk-accounts")
def high_risk_accounts():
    if df_risk.empty:
        return jsonify([])
    df_hi = df_risk.sort_values("graph_risk_score", ascending=False).head(50).copy()
    df_hi["risk_score_pct"] = (df_hi["graph_risk_score"] * 100).round(1)
    df_hi.fillna(0, inplace=True)
    return jsonify(df_hi.to_dict("records"))


# ──────────────────────────────────────────────────────────────────────────────
# /fraud-trend
# ──────────────────────────────────────────────────────────────────────────────
@app.route("/fraud-trend")
def fraud_trend():
    if df_tx.empty or "timestamp" not in df_tx.columns:
        return jsonify([])
    fraud_col = "is_fraud" if "is_fraud" in df_tx.columns else "isFraud"
    df_t = df_tx.copy()
    df_t["date"] = df_t["timestamp"].dt.date
    daily = df_t.groupby("date").agg(
        total=("transaction_id", "count"),
        fraud=(fraud_col, "sum")
    ).reset_index()
    daily["date"] = daily["date"].astype(str)
    daily["fraud_rate"] = (daily["fraud"] / daily["total"].clip(1) * 100).round(2)
    return jsonify(daily.tail(30).to_dict("records"))


# ──────────────────────────────────────────────────────────────────────────────
# /transaction-types
# ──────────────────────────────────────────────────────────────────────────────
@app.route("/transaction-types")
def transaction_types():
    if df_tx.empty or "transaction_type" not in df_tx.columns:
        return jsonify([])
    vc = df_tx["transaction_type"].value_counts()
    return jsonify([{"type": k, "count": int(v)} for k, v in vc.items()])


# ──────────────────────────────────────────────────────────────────────────────
# /channels
# ──────────────────────────────────────────────────────────────────────────────
@app.route("/channels")
def channels():
    if df_tx.empty or "device" not in df_tx.columns:
        return jsonify([])
    vc = df_tx["device"].value_counts()
    return jsonify([{"channel": k, "count": int(v)} for k, v in vc.items()])


# ──────────────────────────────────────────────────────────────────────────────
# /countries
# ──────────────────────────────────────────────────────────────────────────────
@app.route("/countries")
def countries():
    if df_tx.empty or "location" not in df_tx.columns:
        return jsonify([])
    vc = df_tx["location"].value_counts()
    return jsonify([{"location": k, "count": int(v)} for k, v in vc.items()])


# ──────────────────────────────────────────────────────────────────────────────
# /account-transactions/<account_id>
# ──────────────────────────────────────────────────────────────────────────────
@app.route("/account-transactions/<account_id>")
def account_transactions(account_id):
    sender_col = "sender_account_id"
    receiver_col = "receiver_account_id"
    if sender_col not in df_tx.columns:
        return jsonify([])

    mask = (df_tx[sender_col] == account_id) | (df_tx[receiver_col] == account_id)
    df_acct = df_tx[mask].head(50).copy()

    df_acct.fillna("", inplace=True)
    if "timestamp" in df_acct.columns:
        df_acct["timestamp"] = df_acct["timestamp"].astype(str)

    return jsonify(df_acct.to_dict("records"))


# ──────────────────────────────────────────────────────────────────────────────
# /ai-investigation/<account_id>
# ──────────────────────────────────────────────────────────────────────────────
@app.route("/ai-investigation/<account_id>")
def ai_investigation(account_id):
    info = _node_info(account_id)
    risk_pct = _risk_score_pct(account_id)
    community_id = int(_safe(info.get("community_id", 0)))
    degree = int(_safe(info.get("degree", 0)))
    in_deg = int(_safe(info.get("in_degree", 0)))
    out_deg = int(_safe(info.get("out_degree", 0)))
    pagerank = round(_safe(info.get("pagerank", 0)), 6)
    fii = round(_safe(info.get("fii", 0)), 4)
    bds = round(_safe(info.get("bds", 0)), 4)
    nes = round(_safe(info.get("nes", 0)), 4)
    ips = round(_safe(info.get("ips", 0)), 4)

    # Transaction stats
    sender_col = "sender_account_id"
    receiver_col = "receiver_account_id"
    amount_col = "transaction_amount"
    fraud_col = "is_fraud"

    sent_df = df_tx[df_tx[sender_col] == account_id] if sender_col in df_tx.columns else pd.DataFrame()
    recv_df = df_tx[df_tx[receiver_col] == account_id] if receiver_col in df_tx.columns else pd.DataFrame()

    total_sent = float(sent_df[amount_col].sum()) if not sent_df.empty and amount_col in sent_df.columns else 0
    total_recv = float(recv_df[amount_col].sum()) if not recv_df.empty and amount_col in recv_df.columns else 0
    fraud_count = int(sent_df[fraud_col].sum()) if not sent_df.empty and fraud_col in sent_df.columns else 0

    # Risk tier
    if risk_pct >= 80:
        risk_label = "Critical"
        recommendation = "FREEZE IMMEDIATELY — Suspected money laundering hub."
        flags = ["Unusually high degree centrality", "Multiple fraud-labeled transactions", "High community risk"]
    elif risk_pct >= 50:
        risk_label = "High"
        recommendation = "ESCALATE FOR REVIEW — Suspicious network position."
        flags = ["Elevated transaction velocity", "Connected to suspicious community"]
    elif risk_pct >= 20:
        risk_label = "Medium"
        recommendation = "MONITOR — Borderline risk profile."
        flags = ["Moderate network exposure"]
    else:
        risk_label = "Normal"
        recommendation = "CLEAR — No action required."
        flags = ["Normal transaction pattern"]

    return jsonify({
        "account_id": account_id,
        "risk_score": risk_pct,
        "risk_label": risk_label,
        "community_id": community_id,
        "degree": degree,
        "in_degree": in_deg,
        "out_degree": out_deg,
        "pagerank": pagerank,
        "fii": fii,
        "bds": bds,
        "nes": nes,
        "ips": ips,
        "total_sent": round(total_sent, 2),
        "total_received": round(total_recv, 2),
        "fraud_transactions": fraud_count,
        "recommendation": recommendation,
        "flags": flags,
    })


# ──────────────────────────────────────────────────────────────────────────────
# /simulate-intervention/<account_id>
# ──────────────────────────────────────────────────────────────────────────────
@app.route("/simulate-intervention/<account_id>")
def simulate_intervention(account_id):
    """Quick single-account intervention impact using simulation module."""
    try:
        from simulation import simulate_freeze, compute_impact
        from graph_utils import build_transaction_graph

        df_sub = df_tx.head(10000)
        G = build_transaction_graph(df_sub)

        if not G.has_node(account_id):
            return jsonify({
                "account_id": account_id,
                "error": f"Account {account_id} not found in current graph slice",
                "ndi": 0, "fss": 0, "ccr": 0, "ies": 0,
                "nodes_removed": 0, "edges_removed": 0,
                "recommendation": "MONITOR — Account not in graph slice.",
            })

        G_after = simulate_freeze(G, [account_id])
        impact = compute_impact(G, G_after, [account_id])
        return jsonify({
            "account_id": account_id,
            "ndi": impact["ndi"],
            "fss": impact["fss"],
            "ccr": impact["ccr"],
            "ies": impact["ies"],
            "nodes_removed": impact["nodes_removed"],
            "edges_removed": impact["edges_removed"],
            "fraud_paths_removed": impact["fraud_paths_removed"],
            "recommendation": impact["recommendation"],
            "risk_reduction_pct": impact["risk_reduction_pct"],
        })
    except Exception as e:
        return jsonify({"account_id": account_id, "error": str(e)}), 500


# ──────────────────────────────────────────────────────────────────────────────
# Health check
# ──────────────────────────────────────────────────────────────────────────────
@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "transactions": len(df_tx),
        "accounts": len(node_lookup),
        "timestamp": datetime.now().isoformat(),
    })


# ──────────────────────────────────────────────────────────────────────────────
# Run
# ──────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n  Starting Flask server on http://localhost:5000 ...")
    print("  Press Ctrl+C to stop.\n")
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
