#!/usr/bin/env python3
"""Train fraud detection model. Run from ml-backend directory: python scripts/train_fraud.py"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
from app.ml.fraud_detector import FraudDetector
from app.utils.loan_data_generator import generate_dataset

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "synthetic")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models", "trained")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

def main():
    print("Generating synthetic loan data...")
    df = generate_dataset()
    df.to_csv(os.path.join(DATA_DIR, "loan_requests.csv"), index=False)
    print(f"Generated {len(df)} loan records")
    X = df.drop(["is_fraud"], axis=1)
    y = df["is_fraud"]
    print("Training Random Forest fraud detector...")
    detector = FraudDetector()
    detector.train(X, y)
    path = os.path.join(MODEL_DIR, "fraud_detector.pkl")
    detector.save(path)
    print(f"Model saved to {path}")

if __name__ == "__main__":
    main()
