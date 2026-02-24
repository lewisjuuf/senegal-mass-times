"""Initialize database with Senegal dioceses"""
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from backend_api import SessionLocal, Diocese

def init_dioceses():
    db = SessionLocal()
    
    dioceses = [
        {"name": "Archdiocese of Dakar", "bishop": "Archbishop Benjamin Ndiaye"},
        {"name": "Diocese of Kolda", "bishop": "Bishop Jean-Pierre Bassène"},
        {"name": "Diocese of Kaolack", "bishop": "Bishop Martin Boucar Cissé Bassène"},
        {"name": "Diocese of Saint-Louis", "bishop": "Bishop Ernest Sambou"},
        {"name": "Diocese of Tambacounda", "bishop": "Bishop Pascal Kouma"},
        {"name": "Diocese of Thiès", "bishop": "Bishop André Guèye"},
        {"name": "Diocese of Ziguinchor", "bishop": "Bishop Paul Abel Mamba"}
    ]
    
    for diocese_data in dioceses:
        existing = db.query(Diocese).filter(Diocese.name == diocese_data["name"]).first()
        if not existing:
            diocese = Diocese(**diocese_data)
            db.add(diocese)
    
    db.commit()
    db.close()
    print("✅ Dioceses initialized successfully!")

if __name__ == "__main__":
    init_dioceses()