import pandas as pd
features = pd.read_csv(r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\graph_features.csv")
features["graph_risk_score"] = (features["degree_centrality"] * 40 +features["pagerank"] * 40 +(features["degree"] / features["degree"].max()) * 20)
features.to_csv(r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\risk_scores.csv",index=False)
print(features.head())
print("\nRisk scores generated successfully.")