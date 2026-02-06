from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Crypto World Bank AI/ML API",
    description="ML-powered fraud detection and risk analysis",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "AI/ML Backend Running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}


from app.api.fraud import router as fraud_router
app.include_router(fraud_router)
