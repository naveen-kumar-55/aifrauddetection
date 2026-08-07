"""
================================================================================
Production-Ready XGBoost Fraud Detection Training & Graph AI Pipeline
================================================================================
Author: Senior Machine Learning Engineer & Graph AI Specialist
System: Financial Transaction Anomaly & Fraud Discovery System
"""

import os
import joblib
import warnings
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    classification_report,
    roc_curve,
    precision_recall_curve
)

from xgboost import XGBClassifier

# Handle optional SHAP explainability
try:
    import shap
    HAS_SHAP = True
except ImportError:
    HAS_SHAP = False

warnings.filterwarnings("ignore")


# ------------------------------------------------------------------------------
# STEP 1, 2, 3: Load & Merge Datasets (Preventing Data Leakage)
# ------------------------------------------------------------------------------
def load_and_merge_data(script_dir):
    """
    Loads transactions and auxiliary graph features, cleanly merging node-level
    graph metrics onto sender and receiver account identifiers.
    Strictly avoids target leakage columns.
    """
    print("\n[Step 1-3/15] Loading Primary & Auxiliary Graph Datasets...")

    # Locate primary transaction file
    candidate_paths = [
        os.path.join(script_dir, "data", "cleaned_transactions.csv"),
        os.path.join(script_dir, "data", "transactions.csv"),
        os.path.join(script_dir, "transactions.csv"),
        os.path.join(os.path.dirname(script_dir), "data", "transactions.csv"),
    ]
    tx_path = None
    for p in candidate_paths:
        if os.path.exists(p):
            tx_path = p
            break
            
    if not tx_path:
        raise FileNotFoundError("Could not find transactions.csv or cleaned_transactions.csv.")

    print(f"Loaded primary transactions from: {tx_path}")
    df_tx = pd.read_csv(tx_path)

    # Normalize transaction columns
    col_remap = {
        "isFraud": "is_fraud",
        "sender": "sender_account_id",
        "receiver": "receiver_account_id",
        "amount": "transaction_amount"
    }
    for old_c, new_c in col_remap.items():
        if old_c in df_tx.columns and new_c not in df_tx.columns:
            df_tx.rename(columns={old_c: new_c}, inplace=True)

    # Load graph feature files
    def load_aux_file(fname):
        p1 = os.path.join(script_dir, "data", fname)
        p2 = os.path.join(script_dir, fname)
        for p in [p1, p2]:
            if os.path.exists(p):
                return pd.read_csv(p)
        return pd.DataFrame()

    graph_df = load_aux_file("graph_features.csv")
    comm_df = load_aux_file("community_results.csv")
    risk_df = load_aux_file("risk_scores.csv")
    cycle_df = load_aux_file("cycle_results.csv")

    # Build node-level graph features dictionary/dataframe
    node_features = pd.DataFrame(columns=["account_id"])
    if not graph_df.empty and "account_id" in graph_df.columns:
        node_features = graph_df.copy()

    if not comm_df.empty and "account_id" in comm_df.columns:
        comm_cols = [c for c in comm_df.columns if c in ["account_id", "community_id"]]
        node_features = pd.merge(node_features, comm_df[comm_cols], on="account_id", how="outer")

    if not risk_df.empty and "account_id" in risk_df.columns:
        risk_cols = [c for c in risk_df.columns if c in ["account_id", "graph_risk_score"]]
        node_features = pd.merge(node_features, risk_df[risk_cols], on="account_id", how="outer")

    node_features = node_features.drop_duplicates(subset=["account_id"])

    # Merge graph features onto Sender
    sender_features = node_features.add_prefix("sender_")
    merged_df = pd.merge(
        df_tx,
        sender_features,
        left_on="sender_account_id",
        right_on="sender_account_id",
        how="left"
    )

    # Merge graph features onto Receiver
    receiver_features = node_features.add_prefix("receiver_")
    merged_df = pd.merge(
        merged_df,
        receiver_features,
        left_on="receiver_account_id",
        right_on="receiver_account_id",
        how="left"
    )

    return merged_df


# ------------------------------------------------------------------------------
# STEP 4: Create Timestamp Features
# ------------------------------------------------------------------------------
def add_timestamp_features(df):
    """Generates Hour, Day, Weekday, Month from timestamp."""
    print("\n[Step 4/15] Engineering Timestamp Features (Hour, Day, Weekday, Month)...")
    if "timestamp" in df.columns:
        ts = pd.to_datetime(df["timestamp"], errors="coerce")
        df["hour"] = ts.dt.hour
        df["day"] = ts.dt.day
        df["weekday"] = ts.dt.weekday
        df["month"] = ts.dt.month
    return df


# ------------------------------------------------------------------------------
# STEP 5 & 7: Categorical Encoding & Strict Leakage Prevention
# ------------------------------------------------------------------------------
def preprocess_and_encode(df, models_dir):
    """
    Prevents target leakage, encodes categorical columns using LabelEncoder,
    and returns feature matrix X and target vector y.
    """
    print("\n[Step 5 & 7/15] Preventing Target Leakage & Encoding Categorical Features...")

    # Columns that represent direct target leakage or non-predictive IDs
    leakage_and_id_cols = [
        "is_fraud", "isFraud", "fraud_type", "transaction_id", "timestamp",
        "sender_account_id", "receiver_account_id", "sender_device_id",
        "sender_ip_address", "account_cluster_id"
    ]
    
    # Filter feature columns
    feature_cols = [c for c in df.columns if c not in leakage_and_id_cols]

    X = df[feature_cols].copy()
    y = df["is_fraud"].astype(int)

    # Impute missing values safely
    num_cols = X.select_dtypes(include=[np.number]).columns
    X[num_cols] = X[num_cols].fillna(0)

    obj_cols = X.select_dtypes(include=["object", "string"]).columns
    X[obj_cols] = X[obj_cols].fillna("Unknown")

    label_encoders = {}
    target_encode_cols = [
        "sender", "receiver", "merchant", "device", "location",
        "transaction_type", "channel", "currency", "sender_account_type",
        "receiver_account_type", "sender_country", "receiver_country", "day_of_week"
    ]
    
    for col in X.columns:
        if col in obj_cols or col in target_encode_cols:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            label_encoders[col] = le

    joblib.dump(label_encoders, os.path.join(models_dir, "label_encoders.pkl"))
    print(f"Saved {len(label_encoders)} label encoders to models/label_encoders.pkl")

    return X, y, df


# ------------------------------------------------------------------------------
# STEP 8, 9, 10: Stratified Train-Test Split & XGBoost Training
# ------------------------------------------------------------------------------
def train_xgboost(X, y):
    """Splits data 80/20 stratified, calculates scale_pos_weight, trains XGBoost."""
    print("\n[Step 8-10/15] Performing Stratified 80/20 Split & Training XGBoost...")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    neg_cnt = (y_train == 0).sum()
    pos_cnt = (y_train == 1).sum()
    scale_pos_weight = float(neg_cnt / max(1, pos_cnt))

    print(f"Training set: {X_train.shape[0]} samples | Test set: {X_test.shape[0]} samples")
    print(f"Imbalance ratio (scale_pos_weight): {scale_pos_weight:.4f}")

    model = XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=scale_pos_weight,
        objective="binary:logistic",
        eval_metric="auc",
        random_state=42,
        n_jobs=-1
    )

    model.fit(X_train, y_train)
    print("XGBoost Classifier Training Complete!")

    return model, X_train, X_test, y_train, y_test


# ------------------------------------------------------------------------------
# STEP 11 & 12: Performance Evaluation & Curve Plotting
# ------------------------------------------------------------------------------
def evaluate_and_plot(model, X_test, y_test, output_dir):
    """Evaluates model performance and plots ROC, PR, and Feature Importance curves."""
    print("\n[Step 11-12/15] Evaluating Performance & Generating Diagnostic Curves...")

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    roc_auc = roc_auc_score(y_test, y_prob)
    pr_auc = average_precision_score(y_test, y_prob)
    cm = confusion_matrix(y_test, y_pred)

    print("\n=================== PERFORMANCE EVALUATION METRICS ===================")
    print(f"Accuracy               : {acc:.4f}")
    print(f"Precision              : {prec:.4f}")
    print(f"Recall                 : {rec:.4f}")
    print(f"F1 Score               : {f1:.4f}")
    print(f"ROC AUC                : {roc_auc:.4f}")
    print(f"PR AUC                 : {pr_auc:.4f}")
    print("\nConfusion Matrix:")
    print(cm)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    # 1. ROC Curve
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, color="#38bdf8", lw=2, label=f"XGBoost (AUC = {roc_auc:.4f})")
    plt.plot([0, 1], [0, 1], color="#94a3b8", linestyle="--")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("Receiver Operating Characteristic (ROC) Curve")
    plt.legend(loc="lower right")
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "roc_curve.png"), dpi=300)
    plt.close()

    # 2. Precision-Recall Curve
    precision_vals, recall_vals, _ = precision_recall_curve(y_test, y_prob)
    plt.figure(figsize=(8, 6))
    plt.plot(recall_vals, precision_vals, color="#ef4444", lw=2, label=f"XGBoost (PR-AUC = {pr_auc:.4f})")
    plt.xlabel("Recall")
    plt.ylabel("Precision")
    plt.title("Precision-Recall Curve")
    plt.legend(loc="lower left")
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "pr_curve.png"), dpi=300)
    plt.close()

    # 3. Feature Importance
    importance_df = pd.DataFrame({
        "Feature": X_test.columns,
        "Importance": model.feature_importances_
    }).sort_values(by="Importance", ascending=False)

    importance_df.to_csv(os.path.join(output_dir, "feature_importance.csv"), index=False)

    plt.figure(figsize=(10, 8))
    sns.barplot(x="Importance", y="Feature", data=importance_df.head(20), palette="magma", hue="Feature", legend=False)
    plt.title("Top 20 XGBoost Feature Importances (Graph & Transaction Attributes)")
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "feature_importance.png"), dpi=300)
    plt.close()

    print(f"Diagnostic plots exported to {output_dir}/ (roc_curve.png, pr_curve.png, feature_importance.png)")
    return y_pred, y_prob, importance_df


# ------------------------------------------------------------------------------
# STEP 13 & 14: SHAP Explainability & AI Investigation Reports
# ------------------------------------------------------------------------------
def generate_shap_and_investigation_reports(model, X_test, y_test, y_pred, y_prob, raw_df, output_dir):
    """
    Computes SHAP explanations for fraud predictions and generates actionable
    AI Investigation Reports for security analyst triage.
    """
    print("\n[Step 13-14/15] Computing SHAP Explanations & Generating AI Investigation Reports...")

    sample_size = min(300, len(X_test))
    X_sample = X_test.iloc[:sample_size].copy()

    if HAS_SHAP:
        try:
            explainer = shap.TreeExplainer(model)
            shap_values = explainer(X_sample)

            plt.figure(figsize=(10, 6))
            shap.summary_plot(shap_values, X_sample, show=False)
            plt.tight_layout()
            plt.savefig(os.path.join(output_dir, "shap_summary.png"), dpi=300)
            plt.close()
            print("Exported SHAP summary plot -> output/shap_summary.png")
        except Exception as e:
            print(f"SHAP explanation note: {e}")
    else:
        print("SHAP package not installed. Skipping SHAP plot creation.")

    # Build Investigation Report dataframe
    test_indices = X_test.index
    test_raw = raw_df.loc[test_indices].copy()

    test_raw["predicted_fraud"] = y_pred
    test_raw["fraud_probability"] = y_prob

    # Filter fraud predictions
    fraud_predictions = test_raw[test_raw["predicted_fraud"] == 1].copy()

    feature_cols = X_test.columns.tolist()
    importances = model.feature_importances_
    top_feature_indices = np.argsort(importances)[::-1][:5]
    top_5_features = [feature_cols[i] for i in top_feature_indices]

    reports = []
    for idx, row in fraud_predictions.iterrows():
        tx_id = row.get("transaction_id", f"TXN_{idx}")
        prob = round(float(row.get("fraud_probability", 0.0)) * 100, 2)
        
        risk = round(float(row.get("sender_graph_risk_score", row.get("risk_score", 0))), 2)
        pr = round(float(row.get("sender_pagerank", 0.0)), 6)
        degree = int(row.get("sender_degree", row.get("sender_graph_degree", 0)))
        comm = int(row.get("sender_community_id", row.get("community_id", 0)))

        # Explanation synthesis
        explanation = (
            f"High fraud probability ({prob}%). Account exhibits abnormal degree centrality ({degree}), "
            f"community ring association (Community {comm}), and elevated node risk score ({risk})."
        )

        action = "CRITICAL: Immediate Account Freeze & Manual Fraud Compliance Triage" if prob > 80 else "FLAGGED: High-Priority Fraud Investigation"

        reports.append({
            "Transaction_ID": tx_id,
            "Fraud_Probability_%": prob,
            "Sender_Account": row.get("sender_account_id", row.get("sender", "N/A")),
            "Receiver_Account": row.get("receiver_account_id", row.get("receiver", "N/A")),
            "Risk_Score": risk,
            "PageRank": pr,
            "Degree": degree,
            "Community_ID": comm,
            "Explanation_of_Prediction": explanation,
            "Top_5_Important_Features": ", ".join(top_5_features),
            "Suggested_Investigator_Action": action
        })

    investigation_df = pd.DataFrame(reports)
    if investigation_df.empty:
        # Fallback if no positive predicted in test slice
        investigation_df = pd.DataFrame(columns=[
            "Transaction_ID", "Fraud_Probability_%", "Sender_Account", "Receiver_Account",
            "Risk_Score", "PageRank", "Degree", "Community_ID",
            "Explanation_of_Prediction", "Top_5_Important_Features", "Suggested_Investigator_Action"
        ])

    investigation_df.to_csv(os.path.join(output_dir, "investigation_reports.csv"), index=False)
    print(f"Exported {len(investigation_df)} AI Investigation Reports -> output/investigation_reports.csv")

    # Export general predictions CSV
    predictions_df = X_test.copy()
    predictions_df["actual_is_fraud"] = y_test
    predictions_df["predicted_is_fraud"] = y_pred
    predictions_df["fraud_probability"] = y_prob
    predictions_df.to_csv(os.path.join(output_dir, "predictions.csv"), index=False)
    print("Exported full test predictions -> output/predictions.csv")

    return investigation_df


# ------------------------------------------------------------------------------
# STEP 15: Main Pipeline Execution & Artifact Preservation
# ------------------------------------------------------------------------------
def main():
    print("=" * 70)
    print("   PRODUCTION-READY XGBoost FRAUD DETECTION & GRAPH AI PIPELINE   ")
    print("=" * 70)

    script_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(script_dir, "models")
    output_dir = os.path.join(script_dir, "output")

    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)

    try:
        # 1. Load & Merge Data
        merged_df = load_and_merge_data(script_dir)

        # 2. Add Timestamp Features
        merged_df = add_timestamp_features(merged_df)

        # 3. Preprocess & Encode Features (Prevent Leakage)
        X, y, raw_df = preprocess_and_encode(merged_df, models_dir)

        # 4. Train Model
        model, X_train, X_test, y_train, y_test = train_xgboost(X, y)

        # 5. Evaluate Performance & Plot Curves
        y_pred, y_prob, importance_df = evaluate_and_plot(model, X_test, y_test, output_dir)

        # 6. SHAP & AI Investigation Report Generation
        generate_shap_and_investigation_reports(model, X_test, y_test, y_pred, y_prob, raw_df, output_dir)

        # 7. Save Models
        joblib.dump(model, os.path.join(models_dir, "fraud_model.pkl"))
        joblib.dump(model, os.path.join(script_dir, "fraud_model.pkl"))
        print(f"\nTrained XGBoost model saved to {models_dir}/fraud_model.pkl & fraud_model.pkl")

        print("\n[Step 15/15] Pipeline Execution Completed Successfully!")
        print("=" * 70)

    except Exception as e:
        print(f"\nPipeline Execution Failed: {e}")
        raise e


if __name__ == "__main__":
    main()
