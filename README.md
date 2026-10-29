# FraudLens AI: Intelligent Fraud Network Discovery & Intervention System (DATASPHERE)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Cytoscape.js](https://img.shields.io/badge/Cytoscape.js-3.34-000000)](https://js.cytoscape.org/)

An enterprise-grade, real-time financial fraud detection and network intelligence platform. **FraudLens AI** combines graph machine learning, community detection algorithms (Louvain/Leiden), cycle analysis, and dynamic visualization to expose complex laundering rings and multi-hop financial fraud networks.

---

## 📌 Features

- **Interactive Fraud Network Graph (Cytoscape.js)**:
  - Dynamically rendered SVG Account Cards with segmented circular risk rings.
  - Animated "money flow" directional transfer indicators on high-risk edges.
  - Multi-tiered node sizing and risk classification (Normal, Elevated, Critical).
  - Spotlight neighborhood tracing (auto-dims non-connected nodes on tap).
- **AI Intelligence & Diagnostic Indicators**:
  - **FII** (Fraud Influence Index)
  - **BDS** (Behavioral Drift Score)
  - **NES** (Network Exposure Score)
  - **IPS** (Intervention Priority Score)
- **Real-Time Intervention Simulator**:
  - Simulate account freezing and edge isolation dynamically.
- **Analytics & Intelligence Dashboard**:
  - Time-series fraud velocity charts, channel volume distribution, and country risk heatmaps.
- **Community & Cycle Ring Detection**:
  - Automatic identification of circular transaction loops and closely coupled fraud clusters.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS v4 (Dark Theme Design System)
- **Graph Engine**: Cytoscape.js (`cose-bilkent` layout)
- **Icons & Motion**: Lucide React, Framer Motion
- **Charts**: Recharts

### Backend & Machine Learning
- **Framework**: Python Flask
- **Data Engineering**: Pandas, NumPy
- **Graph & Network Analysis**: NetworkX
- **Machine Learning**: Scikit-Learn (Isolation Forest, Community Detection)

---

## 📁 Folder Structure

```
DATASPHERE/
├── .gitignore                          # Git ignore configuration
├── README.md                           # Project documentation
├── cleancode.py                        # Data preprocessing pipeline
└── Fraud-Network/
    ├── app.py                          # Flask REST API backend server
    ├── graph_builder.py                # NetworkX graph construction engine
    ├── graph_features.py               # Node & edge feature extractors
    ├── community_detection.py          # Louvain community detection algorithms
    ├── cycle_detection.py              # Ring & cycle transaction discovery
    ├── advanced_features.py            # AI score estimators (FII, BDS, NES, IPS)
    ├── eda.py                          # Exploratory Data Analysis & statistics
    ├── ml_pipeline.py                  # Anomaly detection & ML pipeline
    ├── risk_scoring.py                 # Multi-factor risk engine
    ├── requirements.txt                # Python backend dependencies
    ├── data/                           # Transaction CSV datasets
    ├── output/                         # Processed metrics & export logs
    └── frontend/                       # React Single Page Application (SPA)
        ├── package.json
        ├── vite.config.js
        ├── src/
        │   ├── components/             # Reusable UI cards, tables, charts, & graph components
        │   ├── pages/                  # Dashboard, Network, Analytics, Investigation, Communities
        │   ├── services/               # Axios API client layer
        │   ├── utils/                  # Formatters & risk helpers
        │   └── index.css               # Design system tokens & Tailwind imports
        └── public/
```

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.9+ installed
- Node.js 18+ and npm installed
- Git installed

### 1. Clone Repository
```bash
git clone https://github.com/rajanvenkat321-sudo/DATASPHERE.git
cd DATASPHERE/Fraud-Network
```

### 2. Backend Setup
```bash
# Create and activate virtual environment (optional)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run the Flask backend
python app.py
```
*Backend server will start at `http://localhost:5000`*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd DATASPHERE/Fraud-Network/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
*Frontend application will run at `http://localhost:5173`*

---

## 📸 Screenshots

| Interactive Fraud Graph | Analytics Dashboard |
| :---: | :---: |
| *Full-screen interactive graph view with custom SVG account cards and flow animation.* | *Real-time KPI metrics, fraud trend lines, and channel breakdown.* |

---

## 🔌 API Documentation

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/summary` | `GET` | Fetches system KPI summary metrics and high-level fraud stats. |
| `/graph-data` | `GET` | Returns graph nodes, edges, risk scores, and degree metrics. |
| `/ai-investigation/<account_id>` | `GET` | Generates diagnostic AI report & risk factors for a specific account. |
| `/simulate-intervention/<account_id>` | `POST` | Simulates account freezing and network isolation impact. |
| `/communities` | `GET` | Retrieves cluster analysis and detected communities. |
| `/cycles` | `GET` | Returns detected circular transaction patterns. |

---

## 🔮 Future Scope

1. **GNN Real-time Inference**: Integration of PyTorch Geometric Graph Neural Networks (GraphSAGE / GAT) for predictive fraud risk scores.
2. **Automated Interventions**: Webhooks for automated core-banking API triggers to freeze compromised nodes within milliseconds.
3. **Multi-Tenant RBAC**: Enterprise Role-Based Access Control for L1, L2, and L3 Fraud Analysts.

---

## 👥 Contributors

- **Rajan Venkat** - Lead Developer & Architect ([@rajanvenkat321-sudo](https://github.com/rajanvenkat321-sudo))

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
# aifrauddetection
