import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib

print("Loading data...")
transactions = pd.read_csv(r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\cleaned_transactions.csv")
graph_features = pd.read_csv(r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\graph_features.csv")
advanced_features = pd.read_csv(r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\advanced_features.csv")

print("Merging features...")
df_features = pd.merge(graph_features, advanced_features, on="account_id", how="inner")

# Create Account-level labels
print("Creating labels...")
fraud_txns = transactions[transactions['is_fraud'] == True]
fraud_accounts = set(fraud_txns['sender_account_id']).union(set(fraud_txns['receiver_account_id']))

df_features['is_fraud'] = df_features['account_id'].apply(lambda x: 1 if x in fraud_accounts else 0)

# Features and target
X = df_features[['in_degree', 'out_degree', 'degree', 'degree_centrality', 'pagerank', 'fii', 'nes', 'ips', 'bds']]
y = df_features['is_fraud']

print(f"Dataset shape: {X.shape}. Fraud accounts: {y.sum()}")

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print("Training Random Forest...")
rf = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
rf.fit(X_train, y_train)

print("Evaluating...")
y_pred = rf.predict(X_test)
print(classification_report(y_test, y_pred))
print("Accuracy:", accuracy_score(y_test, y_pred))

print("Saving model to fraud_model.pkl...")
joblib.dump(rf, r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\fraud_model.pkl")
print("Model saved successfully.")
