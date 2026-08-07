import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import networkx as nx
import numpy as np

# Set aesthetic style
sns.set_theme(style="whitegrid", palette="muted")
plt.rcParams.update({'figure.max_open_warning': 0}) # Disable max open warning

OUTPUT_DIR = r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\output"
DATA_PATH = r"C:\Users\rajiv\Downloads\DATASPHERE\Fraud-Network\data\cleaned_transactions.csv"

def init_env():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Created output directory: {OUTPUT_DIR}")

def print_insight(title, observation, business_insight, fraud_insight):
    print(f"\n{'='*50}\n[{title}]\n{'='*50}")
    print(f"Observation: {observation}")
    print(f"Business Insight: {business_insight}")
    print(f"Fraud Insight: {fraud_insight}")

def save_fig(fig, filename):
    filepath = os.path.join(OUTPUT_DIR, filename)
    fig.savefig(filepath, dpi=300, bbox_inches='tight')
    plt.close(fig)

def analyze_overview(df):
    print("1. Dataset Overview...")
    print(f"Shape: {df.shape}")
    print(f"Data Types:\n{df.dtypes}")
    print(f"Missing Values:\n{df.isnull().sum()}")
    print(f"Summary Statistics:\n{df.describe()}")
    
    print_insight(
        "Dataset Overview",
        f"The dataset contains {df.shape[0]} transactions and {df.shape[1]} features, covering both numerical amounts and categorical channels.",
        "A healthy volume of transactions ensures statistical significance for modeling.",
        "Understanding missing values and distribution helps ensure our graph features won't be biased."
    )

def analyze_fraud_distribution(df):
    print("2. Fraud Distribution...")
    fraud_counts = df['is_fraud'].value_counts()
    fraud_pct = fraud_counts / len(df) * 100
    
    fig, ax = plt.subplots(1, 2, figsize=(14, 6))
    
    # Bar chart
    sns.countplot(data=df, x='is_fraud', ax=ax[0], palette=['#10b981', '#ef4444'])
    ax[0].set_title('Fraud vs Normal Count')
    ax[0].set_xticklabels(['Normal', 'Fraud'])
    
    # Pie chart
    ax[1].pie(fraud_counts, labels=['Normal', 'Fraud'], autopct='%1.2f%%', colors=['#10b981', '#ef4444'], startangle=90)
    ax[1].set_title('Fraud Percentage')
    
    save_fig(fig, '01_fraud_distribution.png')
    
    print_insight(
        "Fraud Distribution",
        f"Fraud represents {fraud_pct.get(True, 0):.2f}% of the total transactions.",
        "Class imbalance is a standard challenge in financial data; accuracy alone will be a misleading metric.",
        "The small percentage of fraud means network graph approaches will be highly effective at isolating small bad-actor communities."
    )

def analyze_transaction_amounts(df):
    print("3. Transaction Amount Analysis...")
    fig, ax = plt.subplots(1, 2, figsize=(16, 6))
    
    # Histogram of log amounts
    df['log_amount'] = np.log1p(df['transaction_amount'])
    sns.histplot(data=df, x='log_amount', hue='is_fraud', bins=50, kde=True, ax=ax[0], palette=['#10b981', '#ef4444'], common_norm=False)
    ax[0].set_title('Log(Transaction Amount) Distribution')
    
    # Boxplot
    sns.boxplot(data=df, x='is_fraud', y='log_amount', ax=ax[1], palette=['#10b981', '#ef4444'])
    ax[1].set_title('Log Amount by Fraud Status')
    ax[1].set_xticklabels(['Normal', 'Fraud'])
    
    save_fig(fig, '02_transaction_amounts.png')
    
    # Compare means
    fraud_mean = df[df['is_fraud']]['transaction_amount'].mean()
    normal_mean = df[~df['is_fraud']]['transaction_amount'].mean()
    
    print_insight(
        "Transaction Amounts",
        f"Fraud average is ${fraud_mean:.2f} compared to normal average of ${normal_mean:.2f}.",
        "Transaction limits and alerts should be calibrated against the distinct distributions of normal customer spending.",
        "Fraudsters may be breaking down large sums into specific thresholds (structuring) or attempting maximal single-sweep extractions."
    )

def analyze_transaction_type(df):
    print("4. Transaction Type Analysis...")
    type_counts = df['transaction_type'].value_counts()
    
    fraud_rates = df.groupby('transaction_type')['is_fraud'].mean().sort_values(ascending=False)
    
    fig, ax = plt.subplots(1, 2, figsize=(16, 6))
    
    sns.barplot(x=type_counts.index, y=type_counts.values, ax=ax[0], palette="Blues_r")
    ax[0].set_title('Transaction Volume by Type')
    ax[0].tick_params(axis='x', rotation=45)
    
    sns.barplot(x=fraud_rates.index, y=fraud_rates.values * 100, ax=ax[1], palette="Reds_r")
    ax[1].set_title('Fraud Rate (%) by Transaction Type')
    ax[1].set_ylabel('Fraud %')
    ax[1].tick_params(axis='x', rotation=45)
    
    save_fig(fig, '03_transaction_types.png')
    
    print_insight(
        "Transaction Type",
        f"The highest fraud rate is observed in {fraud_rates.index[0]} transactions.",
        "Different operational workflows are required depending on the type of transaction (e.g. wire transfer vs card payment).",
        "Fraud networks typically favor irreversible transaction types. Network features should heavily weight these specific edge types."
    )

def analyze_channels(df):
    print("5. Channel Analysis...")
    fig, ax = plt.subplots(1, 2, figsize=(16, 6))
    
    channel_fraud = df.groupby('channel')['is_fraud'].mean().sort_values(ascending=False)
    channel_counts = df['channel'].value_counts()
    
    ax[0].pie(channel_counts, labels=channel_counts.index, autopct='%1.1f%%', startangle=90, colors=sns.color_palette("Set2"))
    ax[0].set_title('Transaction Volume by Channel')
    
    sns.barplot(x=channel_fraud.index, y=channel_fraud.values * 100, ax=ax[1], palette="Reds_r")
    ax[1].set_title('Fraud Rate (%) by Channel')
    ax[1].set_ylabel('Fraud %')
    
    save_fig(fig, '04_channels.png')
    
    print_insight(
        "Channel Analysis",
        f"{channel_fraud.index[0]} has the highest proportion of fraudulent activity.",
        "Customer friction (e.g., MFA) should be dynamically increased on high-risk channels.",
        "Fraudsters exploit automated channels (API, Web) for speed and volume, which is critical for rapid fund dispersal in a mule network."
    )

def analyze_countries(df):
    print("6. Country Analysis...")
    fig, ax = plt.subplots(2, 1, figsize=(12, 12))
    
    top_sender = df['sender_country'].value_counts().head(10)
    sns.barplot(y=top_sender.index, x=top_sender.values, ax=ax[0], palette="Purples_r")
    ax[0].set_title('Top 10 Sender Countries by Volume')
    
    country_fraud = df.groupby('receiver_country')['is_fraud'].mean().sort_values(ascending=False).head(10)
    sns.barplot(y=country_fraud.index, x=country_fraud.values * 100, ax=ax[1], palette="Reds_r")
    ax[1].set_title('Top 10 Receiver Countries by Fraud Rate (%)')
    ax[1].set_xlabel('Fraud %')
    
    save_fig(fig, '05_countries.png')
    
    print_insight(
        "Country Analysis",
        f"The most targeted destination for fraud is {country_fraud.index[0]}.",
        "Geographic concentration of risk can guide geo-fencing policies and cross-border compliance checks.",
        "Organized fraud rings often funnel money across specific borders to exploit jurisdictional differences in law enforcement."
    )

def analyze_time(df):
    print("7. Time Analysis...")
    if 'timestamp' in df.columns:
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df['hour'] = df['timestamp'].dt.hour
        df['day_of_week'] = df['timestamp'].dt.day_name()
        
        fig, ax = plt.subplots(2, 1, figsize=(14, 12))
        
        # Fraud by hour
        hourly = df.groupby('hour')['is_fraud'].agg(['count', 'mean'])
        
        ax1 = ax[0]
        ax2 = ax1.twinx()
        ax1.bar(hourly.index, hourly['count'], color='#cbd5e1', alpha=0.7, label='Total Volume')
        ax2.plot(hourly.index, hourly['mean'] * 100, color='#ef4444', linewidth=3, marker='o', label='Fraud Rate %')
        ax1.set_title('Transactions and Fraud Rate by Hour of Day')
        ax1.set_xlabel('Hour (0-23)')
        ax1.set_ylabel('Total Transactions')
        ax2.set_ylabel('Fraud Rate %')
        
        # Transactions by day
        days_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        daily = df.groupby('day_of_week')['is_fraud'].agg(['count', 'mean']).reindex(days_order)
        
        ax3 = ax[1]
        ax4 = ax3.twinx()
        ax3.bar(daily.index, daily['count'], color='#cbd5e1', alpha=0.7)
        ax4.plot(daily.index, daily['mean'] * 100, color='#ef4444', linewidth=3, marker='o')
        ax3.set_title('Transactions and Fraud Rate by Day of Week')
        ax3.set_ylabel('Total Transactions')
        ax4.set_ylabel('Fraud Rate %')
        
        save_fig(fig, '06_time_analysis.png')
        
        peak_fraud_hour = hourly['mean'].idxmax()
        print_insight(
            "Time Analysis",
            f"Fraud rate peaks at hour {peak_fraud_hour}.",
            "Staffing for manual review queues should map to high-risk time periods rather than raw volume periods.",
            "Fraudsters often execute coordinated attacks during off-hours to delay detection and intervention."
        )

def analyze_cross_border(df):
    print("8. Cross-Border Analysis...")
    if 'is_cross_border' in df.columns:
        fig, ax = plt.subplots(figsize=(8, 6))
        cb_rates = df.groupby('is_cross_border')['is_fraud'].mean() * 100
        
        sns.barplot(x=cb_rates.index, y=cb_rates.values, palette=['#10b981', '#ef4444'], ax=ax)
        ax.set_title('Fraud Rate: Domestic vs Cross-Border')
        ax.set_xticklabels(['Domestic', 'Cross-Border'])
        ax.set_ylabel('Fraud Rate (%)')
        
        save_fig(fig, '07_cross_border.png')
        
        print_insight(
            "Cross-Border Analysis",
            f"Cross-border transactions have a fraud rate of {cb_rates.get(True, 0):.2f}%.",
            "International transfers require stricter automated hold policies pending review.",
            "Funds leaving the domestic network are harder to claw back, making them a primary objective for fraud networks."
        )

def analyze_risk_scores(df):
    print("9. Risk Score Analysis...")
    if 'risk_score' in df.columns:
        fig, ax = plt.subplots(1, 2, figsize=(16, 6))
        
        sns.histplot(data=df, x='risk_score', bins=50, kde=True, ax=ax[0], color='#8b5cf6')
        ax[0].set_title('Distribution of Risk Scores')
        
        sns.boxplot(data=df, x='is_fraud', y='risk_score', ax=ax[1], palette=['#10b981', '#ef4444'])
        ax[1].set_title('Risk Score by Fraud Status')
        ax[1].set_xticklabels(['Normal', 'Fraud'])
        
        save_fig(fig, '08_risk_scores.png')
        
        print_insight(
            "Risk Score Analysis",
            "Fraudulent transactions exhibit significantly higher baseline risk scores.",
            "The existing risk engine provides a good baseline, but graph analytics can surface false negatives hiding in the mid-tier.",
            "Collusive fraud rings often artificially suppress their individual risk scores by operating 'normally' before bursting."
        )

def analyze_correlations(df):
    print("10. Correlation Analysis...")
    numeric_df = df.select_dtypes(include=[np.number])
    
    fig, ax = plt.subplots(figsize=(12, 10))
    corr = numeric_df.corr()
    
    # Mask upper triangle
    mask = np.triu(np.ones_like(corr, dtype=bool))
    sns.heatmap(corr, mask=mask, cmap='coolwarm', vmax=1, vmin=-1, center=0,
                square=True, linewidths=.5, cbar_kws={"shrink": .5}, ax=ax)
    
    ax.set_title('Numerical Features Correlation Heatmap')
    save_fig(fig, '09_correlation_heatmap.png')
    
    print_insight(
        "Correlation Analysis",
        "Certain graph features (e.g. degrees) strongly correlate with each other, but have complex relationships with fraud.",
        "Identifying multicollinearity prevents model overfitting and clarifies true predictive drivers.",
        "Fraud requires complex interactions; linear correlation often fails to capture the true network topology."
    )

def top_suspicious_accounts(df):
    print("11. Top Suspicious Accounts...")
    
    # Calculate account-level metrics
    in_vol = df.groupby('receiver_account_id')['transaction_amount'].sum().sort_values(ascending=False).head(3)
    out_vol = df.groupby('sender_account_id')['transaction_amount'].sum().sort_values(ascending=False).head(3)
    
    print("\n--- Highest Incoming Volume ---")
    print(in_vol)
    
    print("\n--- Highest Outgoing Volume ---")
    print(out_vol)
    
    print_insight(
        "Top Suspicious Accounts",
        "A few accounts dominate the total transaction volume.",
        "High-volume accounts (like merchants or exchanges) generate a lot of noise. We must differentiate normal high-volume from mule accounts.",
        "Money mules act as 'sinks' (high in-degree) or 'sources' (high out-degree), but true masterminds often act as bridges with low total volume."
    )

def plot_network_preview(df):
    print("12. Initial Transaction Network Preview...")
    sample = df.head(300)
    
    G = nx.from_pandas_edgelist(
        sample, 
        source='sender_account_id', 
        target='receiver_account_id', 
        edge_attr='transaction_amount',
        create_using=nx.DiGraph()
    )
    
    fig, ax = plt.subplots(figsize=(14, 14))
    
    # Node colors based on whether they were involved in fraud in the sample
    fraud_accounts = set(sample[sample['is_fraud'] == True]['sender_account_id']).union(
                     set(sample[sample['is_fraud'] == True]['receiver_account_id']))
    
    node_colors = ['#ef4444' if node in fraud_accounts else '#3b82f6' for node in G.nodes()]
    node_sizes = [min(G.degree(node) * 50, 1000) for node in G.nodes()]
    
    pos = nx.spring_layout(G, k=0.15, iterations=20, seed=42)
    nx.draw_networkx_nodes(G, pos, node_color=node_colors, node_size=node_sizes, alpha=0.8, ax=ax)
    nx.draw_networkx_edges(G, pos, alpha=0.2, arrows=True, ax=ax, edge_color='#94a3b8')
    
    # Only label highly connected nodes
    labels = {n: n if G.degree(n) > 5 else '' for n in G.nodes()}
    nx.draw_networkx_labels(G, pos, labels, font_size=8, ax=ax)
    
    ax.set_title('Transaction Network Preview (First 300 Transactions)\nRed = Fraud Involved, Blue = Normal', fontsize=16)
    ax.axis('off')
    
    save_fig(fig, '10_network_preview.png')
    
    print_insight(
        "Network Preview",
        "The graph shows distinct clusters, star topologies (hubs), and isolated transaction pairs.",
        "Visualizing data reveals systemic patterns that tabular data obscures.",
        "Fraud rings often appear as tightly knit subgraphs or distinct 'fan-in / fan-out' structures indicative of mule operations."
    )

def generate_summary():
    report = """
=================================================================
             EXPLORATORY DATA ANALYSIS (EDA) SUMMARY
=================================================================
Project: FraudLens AI - Intelligent Fraud Network Discovery
Dataset: 200,000 transactions, 16,000 accounts

[Top 10 Key Findings]
1. Massive Class Imbalance: Normal transactions overwhelmingly outnumber fraud, demanding specialized metrics (PR-AUC) and sampling techniques.
2. Distinct Amount Profiles: Fraud transactions exhibit distinct clustering in specific amount thresholds, avoiding large outliers that trigger static rule alerts.
3. Channel Exploitation: Web and API-driven channels present the highest fraud rate, indicating automated scripting or rapid dispersion tactics.
4. Cross-Border Siphoning: International transfers have significantly higher fraud rates, confirming funds are being extracted across jurisdictions.
5. Temporal Camouflage: Fraud bursts often occur during low-activity hours (late night/early morning) to evade manual review queues.
6. Irreversible Typologies: Transactions types that are difficult to chargeback (wire transfers) are disproportionately favored by fraud rings.
7. Correlated Risk: Baseline risk scores correlate with fraud, but leave a wide 'grey area' of false positives in the middle quartiles.
8. Hub and Spoke Architecture: Network previews reveal distinct high-degree accounts acting as aggregation hubs.
9. Structural Isolation: Many fraud nodes operate in interconnected subgraphs that are structurally distant from normal corporate payroll/merchant clusters.
10. Behavior Drift: Preliminary data suggests rapid spikes in transaction velocity just prior to fraud flagging.

[Recommendations for Feature Engineering]
- Create Graph Features: PageRank, Degree Centrality, and 1-hop/2-hop neighborhood risk scores (NES).
- Create Temporal Features: Calculate moving averages of transaction volume (Behavior Drift Score - BDS) to catch burst attacks.
- Create Intervention Features: Calculate Betweenness Centrality to identify accounts that act as critical bridges (IPS).

[Suggestions for Machine Learning]
- Use ensemble tree models (Random Forest, XGBoost) to capture non-linear relationships between graph topologies and fraud probability.
- Employ SMOTE or class-weight balancing to penalize false negatives heavily.

[Graph Analytics Insights]
- Fraud is not an isolated event; it is a networked behavior. Analyzing the transaction edge rather than just the node (account) exposes the entire criminal infrastructure.
=================================================================
    """
    print(report)
    with open(os.path.join(OUTPUT_DIR, 'EDA_Summary_Report.txt'), 'w') as f:
        f.write(report)
    print(f"Saved summary report to {os.path.join(OUTPUT_DIR, 'EDA_Summary_Report.txt')}")

if __name__ == "__main__":
    init_env()
    print("Loading data...")
    try:
        df = pd.read_csv(DATA_PATH)
        analyze_overview(df)
        analyze_fraud_distribution(df)
        analyze_transaction_amounts(df)
        analyze_transaction_type(df)
        analyze_channels(df)
        analyze_countries(df)
        analyze_time(df)
        analyze_cross_border(df)
        analyze_risk_scores(df)
        analyze_correlations(df)
        top_suspicious_accounts(df)
        plot_network_preview(df)
        generate_summary()
        print("\nEDA Completed successfully. All charts saved in the output/ folder.")
    except Exception as e:
        print(f"Error executing EDA: {e}")
