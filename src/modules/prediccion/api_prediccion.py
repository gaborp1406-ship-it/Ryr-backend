

from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sklearn.metrics.pairwise import cosine_similarity

RUTA_MODELO = Path(__file__).parent / "modelo_entrenado.joblib"

app = FastAPI(title="API de Predicción de Trabajos")

paquete = None

@app.on_event("startup")
def cargar_modelo():
    global paquete
    if not RUTA_MODELO.exists():
        raise RuntimeError(
            f"No encuentro {RUTA_MODELO}. Corre primero: python3 prediccion_trabajos.py"
        )
    paquete = joblib.load(RUTA_MODELO)
    print("Modelo cargado correctamente.")


class ConsultaTrabajo(BaseModel):
    descripcion: str
    top_n_materiales: int = 5
    top_n_riesgos: int = 3
    umbral_probabilidad: float = 0.35  # a partir de qué probabilidad se sugiere


@app.post("/predecir")
def predecir(consulta: ConsultaTrabajo):
    if paquete is None:
        raise HTTPException(500, "El modelo no está cargado.")

    texto = consulta.descripcion.strip()
    if not texto:
        raise HTTPException(400, "La descripción no puede estar vacía.")

    vectorizador = paquete["vectorizador"]
    X_nuevo = vectorizador.transform([texto])

    # 1) Mano de obra estimada
    mano_obra_estimada = float(paquete["modelo_mano_obra"].predict(X_nuevo)[0])

    # 2) Materiales sugeridos
    materiales_sugeridos = []
    if paquete["modelo_materiales"] is not None:
        probs = paquete["modelo_materiales"].predict_proba(X_nuevo)[0]
        clases = paquete["mlb_materiales"].classes_
        pares = sorted(zip(clases, probs), key=lambda p: p[1], reverse=True)
        materiales_sugeridos = [
            {"material": m, "probabilidad": round(float(p), 3)}
            for m, p in pares
            if p >= consulta.umbral_probabilidad
        ][: consulta.top_n_materiales]

    # 3) Riesgos sugeridos
    riesgos_sugeridos = []
    if paquete["modelo_riesgos"] is not None:
        probs = paquete["modelo_riesgos"].predict_proba(X_nuevo)[0]
        clases = paquete["mlb_riesgos"].classes_
        pares = sorted(zip(clases, probs), key=lambda p: p[1], reverse=True)
        riesgos_sugeridos = [
            {"riesgo": r, "probabilidad": round(float(p), 3)}
            for r, p in pares
            if p >= consulta.umbral_probabilidad
        ][: consulta.top_n_riesgos]

    # 4) Trabajos históricos más parecidos (contexto/explicabilidad)
    hist_X = paquete["historico_X"]
    hist_df = paquete["historico_df"]
    similitudes = cosine_similarity(X_nuevo, hist_X)[0]
    top_idx = similitudes.argsort()[::-1][:3]
    trabajos_similares = [
        {
            "descripcion": hist_df.iloc[i]["descripcion"],
            "similitud": round(float(similitudes[i]), 3),
            "mano_obra_real": float(hist_df.iloc[i]["mano_obra"]),
            "materiales_usados": hist_df.iloc[i]["materiales"],
            "riesgos_registrados": hist_df.iloc[i]["riesgos"],
        }
        for i in top_idx
    ]

    return {
        "descripcion_consultada": texto,
        "mano_obra_estimada": round(mano_obra_estimada, 1),
        "materiales_sugeridos": materiales_sugeridos,
        "riesgos_sugeridos": riesgos_sugeridos,
        "trabajos_similares": trabajos_similares,
    }


@app.get("/salud")
def salud():
    return {"status": "ok", "modelo_cargado": paquete is not None}
