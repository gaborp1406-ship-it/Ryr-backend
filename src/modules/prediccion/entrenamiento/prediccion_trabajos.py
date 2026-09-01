
import sys
import joblib
import numpy as np
import pandas as pd
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.multiclass import OneVsRestClassifier
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.metrics.pairwise import cosine_similarity

# ------------------------------------------------------------------

CARPETA = Path(__file__).parent
RUTA_EXCEL = CARPETA / "entrenamientoML.xlsx"
RUTA_MODELO = CARPETA / "modelo_entrenado.joblib"
MIN_FRECUENCIA_MATERIAL = 2
MIN_FRECUENCIA_RIESGO = 2


def cargar_datos(ruta_excel: Path):
    print(f"Leyendo {ruta_excel} ...")
    descripciones = pd.read_excel(ruta_excel, sheet_name="Descripciones")
    materiales = pd.read_excel(ruta_excel, sheet_name="Materiales")
    riesgos = pd.read_excel(ruta_excel, sheet_name="Riesgos")
    return descripciones, materiales, riesgos


def agrupar_por_trabajo(descripciones, materiales, riesgos):
    """Devuelve un DataFrame con 1 fila por trabajo:
    descripcion_id, descripcion, mano_obra, materiales (lista), riesgos (lista)
    """
    mat_por_id = (
        materiales.groupby("descripcion_id")["material"]
        .apply(lambda s: sorted(set(s.dropna().astype(str))))
        .rename("materiales")
    )
    riesgo_por_id = (
        riesgos.groupby("descripcion_id")["riesgo"]
        .apply(lambda s: sorted(set(s.dropna().astype(str))))
        .rename("riesgos")
    )

    df = descripciones.set_index("descripcion_id").join(mat_por_id).join(riesgo_por_id)
    df["materiales"] = df["materiales"].apply(lambda x: x if isinstance(x, list) else [])
    df["riesgos"] = df["riesgos"].apply(lambda x: x if isinstance(x, list) else [])
    df = df.reset_index()
    return df


def filtrar_etiquetas_raras(lista_de_listas, min_frecuencia):
    """Cuenta cuántas veces aparece cada etiqueta y descarta las que
    aparecen menos de min_frecuencia veces (para que el clasificador
    tenga suficientes ejemplos por clase)."""
    conteo = {}
    for etiquetas in lista_de_listas:
        for e in etiquetas:
            conteo[e] = conteo.get(e, 0) + 1
    validas = {e for e, c in conteo.items() if c >= min_frecuencia}
    filtrado = [[e for e in etiquetas if e in validas] for etiquetas in lista_de_listas]
    return filtrado, sorted(validas)


def entrenar():
    if not RUTA_EXCEL.exists():
        sys.exit(f"No encuentro el archivo: {RUTA_EXCEL}")

    descripciones, materiales, riesgos = cargar_datos(RUTA_EXCEL)
    df = agrupar_por_trabajo(descripciones, materiales, riesgos)
    print(f"Trabajos históricos encontrados: {len(df)}")

    textos = df["descripcion"].astype(str).tolist()

    # ---------------- Vectorización de texto ----------------
    vectorizador = TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2),
        min_df=1,
        max_df=0.95,
    )
    X = vectorizador.fit_transform(textos)

    # ---------------- 1) Mano de obra (regresión) ----------------
    y_mano_obra = df["mano_obra"].astype(float).values
    modelo_mano_obra = RandomForestRegressor(
        n_estimators=300, random_state=42, max_depth=None
    )
    modelo_mano_obra.fit(X, y_mano_obra)

    # ---------------- 2) Materiales (multi-etiqueta) ----------------
    materiales_filtrados, clases_materiales = filtrar_etiquetas_raras(
        df["materiales"].tolist(), MIN_FRECUENCIA_MATERIAL
    )
    mlb_materiales = MultiLabelBinarizer(classes=clases_materiales)
    Y_materiales = mlb_materiales.fit_transform(materiales_filtrados)

    if Y_materiales.shape[1] > 0:
        modelo_materiales = OneVsRestClassifier(
            LogisticRegression(max_iter=1000)
        )
        modelo_materiales.fit(X, Y_materiales)
    else:
        modelo_materiales = None
        print("Aviso: no hay suficientes materiales repetidos para entrenar el clasificador.")

    # ---------------- 3) Riesgos (multi-etiqueta) ----------------
    riesgos_filtrados, clases_riesgos = filtrar_etiquetas_raras(
        df["riesgos"].tolist(), MIN_FRECUENCIA_RIESGO
    )
    mlb_riesgos = MultiLabelBinarizer(classes=clases_riesgos)
    Y_riesgos = mlb_riesgos.fit_transform(riesgos_filtrados)

    if Y_riesgos.shape[1] > 0:
        modelo_riesgos = OneVsRestClassifier(
            LogisticRegression(max_iter=1000)
        )
        modelo_riesgos.fit(X, Y_riesgos)
    else:
        modelo_riesgos = None
        print("Aviso: no hay suficientes riesgos repetidos para entrenar el clasificador.")

    # ---------------- Guardar todo en un solo archivo ----------------
    paquete = {
        "vectorizador": vectorizador,
        "modelo_mano_obra": modelo_mano_obra,
        "modelo_materiales": modelo_materiales,
        "mlb_materiales": mlb_materiales,
        "modelo_riesgos": modelo_riesgos,
        "mlb_riesgos": mlb_riesgos,
        # Guardamos también el histórico + su matriz TF-IDF para poder
        # buscar "trabajos similares" (vecino más cercano) como apoyo
        # a la predicción, muy útil cuando hay pocos datos.
        "historico_df": df[["descripcion_id", "descripcion", "mano_obra", "materiales", "riesgos"]],
        "historico_X": X,
    }
    joblib.dump(paquete, RUTA_MODELO)
    print(f"\n✅ Modelo entrenado y guardado en: {RUTA_MODELO}")
    print(f"   Materiales aprendidos: {len(clases_materiales)}")
    print(f"   Riesgos aprendidos: {len(clases_riesgos)}")


if __name__ == "__main__":
    entrenar()
