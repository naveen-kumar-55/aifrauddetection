from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import hashlib

app = Flask(__name__)
CORS(app)

graph_features = pd.read_csv(
    r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\graph_features.csv"
)

try:
    advanced_features = pd.read_csv(
        r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\advanced_features.csv"
    )
except Exception as e:
    advanced_features = pd.DataFrame(columns=["account_id", "fii", "nes", "ips", "bds"])

communities = pd.read_csv(
    r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\community_results.csv"
)

cycles = pd.read_csv(
    r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\cycle_results.csv"
)

risk_scores = pd.read_csv(
    r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\risk_scores.csv"
)

transactions = pd.read_csv(
    r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\cleaned_transactions.csv"
)

# Merge all into a master dataset
merged_features = pd.merge(graph_features, advanced_features, on="account_id", how="left")
merged_features = pd.merge(merged_features, communities[["account_id", "community_id"]], on="account_id", how="left")
merged_features = pd.merge(merged_features, risk_scores[["account_id", "graph_risk_score"]], on="account_id", how="left")
merged_features.fillna(0, inplace=True)


@app.route("/")
def home():
    return jsonify({
        "message": "Fraud Network Discovery API is running"
    })


@app.route("/summary")
def summary():
    total_txns = len(transactions)
    total_accs = pd.concat([transactions["sender_account_id"], transactions["receiver_account_id"]]).nunique()
    fraud_txns = int(transactions["is_fraud"].sum())
    fraud_rate_pct = round((fraud_txns / total_txns * 100), 2) if total_txns > 0 else 0
    high_risk_cnt = len(risk_scores[risk_scores["graph_risk_score"] > 50]) if "graph_risk_score" in risk_scores.columns else len(risk_scores)
    avg_risk = round(float(risk_scores["graph_risk_score"].mean()), 2) if "graph_risk_score" in risk_scores.columns else 0.0

    return jsonify({
        "total_transactions": total_txns,
        "total_accounts": total_accs,
        "fraud_transactions": fraud_txns,
        "fraud_rate_pct": fraud_rate_pct,
        "high_risk_accounts": high_risk_cnt,
        "communities": int(communities["community_id"].nunique()),
        "cycles": len(cycles),
        "avg_risk_score": avg_risk
    })


@app.route("/analytics")
def analytics():
    # 1. Trend by day / hour
    if "day" in transactions.columns:
        trend_df = transactions.groupby("day").agg(
            total_volume=("transaction_amount", "sum"),
            tx_count=("transaction_id", "count"),
            fraud_count=("is_fraud", lambda x: int(x.sum()))
        ).reset_index()
        trend_df["fraud_rate"] = (trend_df["fraud_count"] / trend_df["tx_count"] * 100).round(2)
        trend = trend_df.head(30).to_dict(orient="records")
    else:
        trend = []

    # 2. Fraud Distribution
    fraud_counts = transactions["is_fraud"].value_counts().to_dict()
    normal_cnt = int(fraud_counts.get(False, 0) or fraud_counts.get(0, 0))
    fraud_cnt = int(fraud_counts.get(True, 0) or fraud_counts.get(1, 0))
    
    fraud_dist = [
        {"name": "Normal Transactions", "value": normal_cnt, "color": "#10B981"},
        {"name": "Fraud Transactions", "value": fraud_cnt, "color": "#EF4444"}
    ]

    # 3. By Transaction Type
    type_group = transactions.groupby("transaction_type").agg(
        volume=("transaction_id", "count"),
        fraud_count=("is_fraud", lambda x: int(x.sum())),
        total_amount=("transaction_amount", "sum")
    ).reset_index()
    type_group["fraud_rate"] = (type_group["fraud_count"] / type_group["volume"] * 100).round(2)
    type_dist = type_group.sort_values(by="volume", ascending=False).to_dict(orient="records")

    # 4. By Channel
    channel_group = transactions.groupby("channel").agg(
        volume=("transaction_id", "count"),
        fraud_count=("is_fraud", lambda x: int(x.sum()))
    ).reset_index()
    channel_group["fraud_rate"] = (channel_group["fraud_count"] / channel_group["volume"] * 100).round(2)
    channel_dist = channel_group.sort_values(by="volume", ascending=False).to_dict(orient="records")

    # 5. By Country (Sender Country)
    if "sender_country" in transactions.columns:
        country_group = transactions.groupby("sender_country").agg(
            volume=("transaction_id", "count"),
            fraud_count=("is_fraud", lambda x: int(x.sum()))
        ).reset_index()
        country_group["fraud_rate"] = (country_group["fraud_count"] / country_group["volume"] * 100).round(2)
        country_dist = country_group.sort_values(by="volume", ascending=False).head(8).to_dict(orient="records")
    else:
        country_dist = []

    return jsonify({
        "trend": trend,
        "fraud_distribution": fraud_dist,
        "type_distribution": type_dist,
        "channel_distribution": channel_dist,
        "country_distribution": country_dist
    })


@app.route("/account-transactions/<account_id>")
def account_transactions(account_id):
    acc_txns = transactions[(transactions["sender_account_id"] == account_id) | (transactions["receiver_account_id"] == account_id)]
    recent = acc_txns.sort_values(by="timestamp", ascending=False).head(15)
    records = recent.to_dict(orient="records")
    return jsonify(records)


@app.route("/graph-features")
def graph():
    return jsonify(graph_features.to_dict(orient="records"))


@app.route("/communities")
def community():
    return jsonify(communities.to_dict(orient="records"))


@app.route("/cycles")
def cycle():
    return jsonify(cycles.to_dict(orient="records"))


@app.route("/risk-scores")
def risk():
    return jsonify(risk_scores.to_dict(orient="records"))


@app.route("/advanced-features")
def advanced():
    cols = ["account_id", "fii", "bds", "nes", "ips", "graph_risk_score", "community_id", "degree", "pagerank"]
    available_cols = [c for c in cols if c in merged_features.columns]
    return jsonify(merged_features[available_cols].to_dict(orient="records"))


@app.route("/ai-investigation/<account_id>")
def ai_investigation(account_id):
    acc_data = merged_features[merged_features["account_id"] == account_id]
    if acc_data.empty:
        return jsonify({"error": "Account not found"}), 404
        
    acc = acc_data.iloc[0]
    
    ips = float(acc.get("ips", 0))
    fii = float(acc.get("fii", 0))
    nes = float(acc.get("nes", 0))
    bds = float(acc.get("bds", 0))

    reasons = []
    if fii > 80:
        reasons.append("High Fraud Influence Index (FII > 80%)")
    if nes >= 80:
        reasons.append("Directly connected to known high-risk fraud cluster (High NES)")
    elif nes >= 40:
        reasons.append("Proximity to flagged fraudulent accounts (Med NES)")
    if bds > 80:
        reasons.append("Extreme Behavior Drift (Sudden velocity & volume burst)")
    if ips > 75:
        reasons.append("Critical bridge node in money laundering network (High IPS)")
        
    # Check if in a cycle
    in_cycle = len(cycles[(cycles["Account_A"] == account_id) | (cycles["Account_B"] == account_id)]) > 0
    if in_cycle:
        reasons.append("Involved in circular transaction ring pattern")
        
    if len(reasons) == 0:
        reasons.append("Standard transaction velocity and normal graph connectivity")
        recommendation = "Low Risk - Maintain Standard Monitoring"
    elif len(reasons) >= 3:
        recommendation = "CRITICAL RISK - Freeze Account & Launch Immediate Investigation"
    else:
        recommendation = "ELEVATED RISK - Flag Account for Compliance Review"
        
    if ips <= 0:
        reduction = 0.0
    else:
        reduction = min(95.0, max(5.0, ips * 0.85))
        
    return jsonify({
        "account_id": account_id,
        "fii": fii,
        "nes": nes,
        "ips": ips,
        "bds": bds,
        "graph_risk_score": float(acc.get("graph_risk_score", 0)),
        "community_id": int(acc.get("community_id", 0)),
        "reasons": reasons,
        "recommendation": recommendation,
        "simulated_reduction_percent": round(reduction, 2)
    })


@app.route("/next-target")
def next_target():
    if "nes" not in merged_features.columns:
        return jsonify([])
        
    targets = merged_features[(merged_features["nes"] > 0) & (merged_features["fii"] < 0.0001)]
    targets = targets.sort_values(by="nes", ascending=False).head(5)
    
    return jsonify(targets[["account_id", "nes", "bds"]].to_dict(orient="records"))


@app.route("/simulate-intervention/<account_id>")
def simulate_intervention(account_id):
    acc_data = merged_features[merged_features["account_id"] == account_id]
    if acc_data.empty:
        return jsonify({"error": "Account not found"}), 404
        
    acc = acc_data.iloc[0]
    ips = float(acc.get("ips", 0))
    
    if ips <= 0:
        reduction = 0.0
    else:
        reduction = min(95.0, max(5.0, ips * 0.85))
        
@app.route("/high-risk-accounts")
def high_risk_accounts():
    top20 = merged_features.sort_values(by="graph_risk_score", ascending=False).head(20)
    records = []
    for _, row in top20.iterrows():
        aid = row["account_id"]
        atype = "Business" if "Business" in str(row.get("account_type", "")) else "Individual"
        records.append({
            "account_id": aid,
            "graph_risk_score": round(float(row.get("graph_risk_score", 0)) * 100, 1),
            "community_id": int(row.get("community_id", 0)),
            "degree": int(row.get("degree", 0)),
            "fii": round(float(row.get("fii", 0)), 1),
            "bds": round(float(row.get("bds", 0)), 1),
            "nes": round(float(row.get("nes", 0)), 1),
            "ips": round(float(row.get("ips", 0)), 1)
        })
    return jsonify(records)


@app.route("/fraud-trend")
def fraud_trend():
    if "day" in transactions.columns:
        trend_df = transactions.groupby("day").agg(
            transaction_count=("transaction_id", "count"),
            fraud_count=("is_fraud", lambda x: int(x.sum()))
        ).reset_index()
        return jsonify(trend_df.to_dict(orient="records"))
    return jsonify([])


@app.route("/transaction-types")
def transaction_types():
    type_group = transactions.groupby("transaction_type").agg(
        count=("transaction_id", "count"),
        fraud_count=("is_fraud", lambda x: int(x.sum()))
    ).reset_index()
    type_group["fraud_pct"] = (type_group["fraud_count"] / type_group["count"] * 100).round(2)
    return jsonify(type_group.to_dict(orient="records"))


@app.route("/channels")
def channel_list():
    channel_group = transactions.groupby("channel").agg(
        count=("transaction_id", "count"),
        fraud_count=("is_fraud", lambda x: int(x.sum()))
    ).reset_index()
    return jsonify(channel_group.to_dict(orient="records"))


@app.route("/countries")
def country_list():
    if "sender_country" in transactions.columns:
        country_group = transactions.groupby("sender_country").agg(
            count=("transaction_id", "count"),
            fraud_count=("is_fraud", lambda x: int(x.sum()))
        ).reset_index()
        return jsonify(country_group.to_dict(orient="records"))
    return jsonify([])


@app.route("/graph")
def graph_summary():
    return graph_data()


@app.route("/investigation/<account_id>")
def investigation_report(account_id):
    return ai_investigation(account_id)


@app.route("/intervention/<account_id>")
def intervention_summary(account_id):
    return simulate_intervention(account_id)



# ── Deterministic customer name generator ──────────────────────────────
_FIRST_NAMES = [
    "James","Mary","Robert","Patricia","John","Jennifer","Michael","Linda",
    "David","Elizabeth","William","Barbara","Richard","Susan","Joseph","Jessica",
    "Thomas","Sarah","Charles","Karen","Daniel","Lisa","Matthew","Nancy",
    "Anthony","Betty","Mark","Margaret","Donald","Sandra","Steven","Ashley",
    "Andrew","Dorothy","Paul","Kimberly","Joshua","Emily","Kenneth","Donna",
    "Kevin","Michelle","Brian","Carol","George","Amanda","Timothy","Melissa",
    "Ronald","Deborah","Jason","Stephanie","Edward","Rebecca","Ryan","Sharon",
    "Jacob","Laura","Gary","Cynthia","Nicholas","Kathleen","Eric","Amy",
    "Jonathan","Angela","Stephen","Shirley","Larry","Brenda","Justin","Emma",
    "Scott","Anna","Brandon","Pamela","Benjamin","Nicole","Samuel","Helen",
    "Raymond","Samantha","Gregory","Katherine","Frank","Christine","Alexander","Debra",
    "Patrick","Rachel","Jack","Carolyn","Dennis","Janet","Jerry","Catherine"
]
_LAST_NAMES = [
    "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis",
    "Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson",
    "Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson",
    "White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker",
    "Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores",
    "Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter",
    "Roberts","Gomez","Phillips","Evans","Turner","Diaz","Parker","Cruz","Edwards",
    "Collins","Reyes","Stewart","Morris","Morales","Murphy","Cook","Rogers","Gutierrez",
    "Ortiz","Morgan","Cooper","Peterson","Bailey","Reed","Kelly","Howard","Ramos",
    "Kim","Cox","Ward","Richardson","Watson","Brooks","Chavez","Wood","James",
    "Bennett","Gray","Mendoza","Ruiz","Hughes","Price","Alvarez","Castillo","Sanders",
    "Patel","Myers","Long","Ross","Foster","Jimenez","Powell"
]
_BIZ_NAMES = [
    "Apex","Vertex","Summit","Titan","Nova","Pulse","Forge","Atlas","Orbit","Pinnacle",
    "Nexus","Horizon","Vanguard","Eclipse","Zenith","Quantum","Falcon","Phoenix","Spark","Raven",
    "Sterling","Cobalt","Crimson","Iron","Cedar","Onyx","Obsidian","Granite","Azure","Emerald",
    "Dragon","Sapphire","Coral","Prism","Solaris","Tempest","Thunder","Blaze","Arctic","Harbor"
]
_BIZ_SUFFIXES = [
    "Holdings","Capital","Industries","Enterprises","Group","Corp","Solutions","Partners",
    "Ventures","Trading","Logistics","Financial","Associates","International","Services",
    "Global","Technologies","Dynamics","Investments","Consulting"
]

def _generate_customer_name(account_id, account_type):
    h = int(hashlib.md5(account_id.encode()).hexdigest(), 16)
    if account_type == "Business":
        bi = h % len(_BIZ_NAMES)
        si = (h >> 8) % len(_BIZ_SUFFIXES)
        return f"{_BIZ_NAMES[bi]} {_BIZ_SUFFIXES[si]}"
    else:
        fi = h % len(_FIRST_NAMES)
        li = (h >> 8) % len(_LAST_NAMES)
        return f"{_FIRST_NAMES[fi]} {_LAST_NAMES[li]}"


@app.route("/graph-data")
def graph_data():
    limit = request.args.get("limit", 500, type=int)
    community_filter = request.args.get("community", None, type=int)
    fraud_only = request.args.get("fraud_only", "false").lower() == "true"
    min_risk = request.args.get("min_risk", 0, type=float)
    max_risk = request.args.get("max_risk", 100, type=float)
    min_amount = request.args.get("min_amount", 0, type=float)
    max_amount = request.args.get("max_amount", 100000, type=float)
    search_q = request.args.get("search", "").strip()

    # ── Build account-level metadata ────────────────────────────────
    sender_types = transactions.drop_duplicates("sender_account_id").set_index("sender_account_id")["sender_account_type"].to_dict()
    receiver_types = transactions.drop_duplicates("receiver_account_id").set_index("receiver_account_id")["receiver_account_type"].to_dict()
    acct_types = {**receiver_types, **sender_types}

    # Fraud involvement per account
    fraud_txns = transactions[transactions["is_fraud"] == True]
    fraud_accounts = set(fraud_txns["sender_account_id"]).union(set(fraud_txns["receiver_account_id"]))

    fraud_type_map = {}
    for _, row in fraud_txns.iterrows():
        for aid in [row["sender_account_id"], row["receiver_account_id"]]:
            fraud_type_map.setdefault(aid, set()).add(row.get("fraud_type", "Fraud"))

    # Cycle involvement
    cycle_accounts = set(cycles["Account_A"]).union(set(cycles["Account_B"]))

    # ── Filter merged_features ──────────────────────────────────────
    nodes_df = merged_features.copy()
    nodes_df["is_fraud_account"] = nodes_df["account_id"].isin(fraud_accounts)

    if fraud_only:
        nodes_df = nodes_df[nodes_df["is_fraud_account"]]

    if community_filter is not None:
        nodes_df = nodes_df[nodes_df["community_id"] == community_filter]

    nodes_df = nodes_df[(nodes_df["graph_risk_score"] >= min_risk / 100.0) & (nodes_df["graph_risk_score"] <= max_risk / 100.0)]

    # Search filter
    if search_q:
        def _matches(row):
            aid = str(row["account_id"]).lower()
            atype = acct_types.get(row["account_id"], "Individual")
            cname = _generate_customer_name(row["account_id"], atype).lower()
            q = search_q.lower()
            return q in aid or q in cname
        mask = nodes_df.apply(_matches, axis=1)
        nodes_df = nodes_df[mask]

    # Sort by risk and limit
    nodes_df = nodes_df.sort_values("graph_risk_score", ascending=False).head(limit)
    active_ids = set(nodes_df["account_id"])

    # ── Build node list ─────────────────────────────────────────────
    nodes = []
    for _, row in nodes_df.iterrows():
        aid = row["account_id"]
        atype = acct_types.get(aid, "Individual")
        risk = float(row.get("graph_risk_score", 0))
        cname = _generate_customer_name(aid, atype)
        acct_num = aid.replace("ACC", "")

        nodes.append({
            "id": aid,
            "customerName": cname,
            "accountType": atype,
            "accountNumber": acct_num,
            "riskScore": round(risk * 100, 1),
            "degree": int(row.get("degree", 0)),
            "inDegree": int(row.get("in_degree", 0)),
            "outDegree": int(row.get("out_degree", 0)),
            "communityId": int(row.get("community_id", 0)),
            "pagerank": float(row.get("pagerank", 0)),
            "fii": round(float(row.get("fii", 0)), 1),
            "bds": round(float(row.get("bds", 0)), 1),
            "nes": round(float(row.get("nes", 0)), 1),
            "ips": round(float(row.get("ips", 0)), 1),
            "isFraud": aid in fraud_accounts,
            "fraudTypes": list(fraud_type_map.get(aid, [])),
            "inCycle": aid in cycle_accounts
        })

    # ── Build edge list ─────────────────────────────────────────────
    edge_txns = transactions[
        (transactions["sender_account_id"].isin(active_ids)) &
        (transactions["receiver_account_id"].isin(active_ids))
    ]

    if min_amount > 0 or max_amount < 100000:
        edge_txns = edge_txns[(edge_txns["transaction_amount"] >= min_amount) & (edge_txns["transaction_amount"] <= max_amount)]

    # Aggregate per sender→receiver pair for performance
    agg = edge_txns.groupby(["sender_account_id", "receiver_account_id"]).agg(
        total_amount=("transaction_amount", "sum"),
        tx_count=("transaction_id", "count"),
        max_amount=("transaction_amount", "max"),
        avg_risk=("risk_score", "mean"),
        fraud_count=("is_fraud", "sum"),
        fraud_types=("fraud_type", lambda x: list(set(x.dropna()) - {"No Fraud"})),
        tx_types=("transaction_type", lambda x: list(set(x))),
        channels=("channel", lambda x: list(set(x)))
    ).reset_index()

    edges = []
    for _, row in agg.iterrows():
        is_fraud_edge = int(row["fraud_count"]) > 0
        ft = row["fraud_types"] if isinstance(row["fraud_types"], list) else []
        ft = [f for f in ft if f]

        alert = None
        if "Circular Transaction" in ft:
            alert = "Circular Transaction"
        elif "Mule Account" in ft:
            alert = "Mule Account"
        elif "Account Takeover" in ft:
            alert = "Account Takeover"
        elif "Smurfing" in ft:
            alert = "Suspicious Transfer"
        elif float(row["avg_risk"]) > 70:
            alert = "High Risk"

        edges.append({
            "source": row["sender_account_id"],
            "target": row["receiver_account_id"],
            "totalAmount": round(float(row["total_amount"]), 2),
            "maxAmount": round(float(row["max_amount"]), 2),
            "txCount": int(row["tx_count"]),
            "isFraud": is_fraud_edge,
            "fraudTypes": ft,
            "alert": alert,
            "avgRisk": round(float(row["avg_risk"]), 1)
        })

    return jsonify({
        "nodes": nodes,
        "edges": edges,
        "totalAccounts": len(merged_features),
        "totalEdges": len(transactions)
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)