from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import numpy as np
import os

FEATURE_NAMES = [
    "amount",
    "purpose_length",
    "wallet_age_days",
    "wallet_balance",
    "previous_loans",
    "avg_tx_amount",
    "tx_count",
]


class FraudDetector:
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight="balanced",
        )
        self.feature_names = FEATURE_NAMES

    def train(self, X, y):
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        self.model.fit(X_train_scaled, y_train)
        return self

    def predict(self, X):
        X_scaled = self.scaler.transform(X)
        probabilities = self.model.predict_proba(X_scaled)[:, 1]
        predictions = (probabilities > 0.5).astype(int)
        return predictions, probabilities

    def explain(self, X):
        try:
            import shap
            explainer = shap.TreeExplainer(self.model)
            X_scaled = self.scaler.transform(X)
            shap_values = explainer.shap_values(X_scaled)
            if isinstance(shap_values, list):
                shap_values = shap_values[1]
            features = []
            for i, name in enumerate(self.feature_names):
                features.append({
                    "name": name,
                    "value": float(X.iloc[0, i]) if hasattr(X, "iloc") else float(X[0, i]),
                    "impact": float(shap_values[0][i]),
                })
            features.sort(key=lambda x: abs(x["impact"]), reverse=True)
            return features[:5]
        except Exception:
            return []

    def save(self, path="models/trained/fraud_detector.pkl"):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump({"model": self.model, "scaler": self.scaler}, path)

    def load(self, path="models/trained/fraud_detector.pkl"):
        data = joblib.load(path)
        self.model = data["model"]
        self.scaler = data["scaler"]
        return self
