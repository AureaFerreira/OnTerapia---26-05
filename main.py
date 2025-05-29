# main.py
from fastapi import FastAPI, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
from deepface import DeepFace
import json
import os # Para verificar a existência do arquivo de vídeo

# Inicializa a aplicação FastAPI
app = FastAPI(
    title="API de Análise Emocional com DeepFace",
    description="API para analisar emoções em vídeos usando a biblioteca DeepFace."
)

# Configuração do CORS (Cross-Origin Resource Sharing)
# Isso permite que seu frontend (React Native) faça requisições para esta API,
# mesmo que estejam em domínios/portas diferentes.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite requisições de qualquer origem (para desenvolvimento)
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos HTTP (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos os cabeçalhos
)

@app.get("/")
async def home():
    """
    Endpoint de boas-vindas para verificar se a API está online.
    """
    return {"message": "API de Análise Emocional pronta para uso!"}

@app.get("/analyze-fixed-video")
async def analyze_fixed_video():
    """
    Endpoint para analisar emoções em um vídeo fixo.
    ATENÇÃO: Para uso em produção, você deveria permitir o upload do vídeo
    ou passar o caminho do vídeo como parâmetro, não hardcodar.
    """
    # --- CONFIGURAÇÃO DO VÍDEO FIXO ---
    # O vídeo a ser analisado será 'video_input.mp4'
    # CERTIFIQUE-SE DE QUE 'video_input.mp4' ESTÁ NA MESMA PASTA DESTE ARQUIVO main.py
    # OU AJUSTE O CAMINHO COMPLETO SE ESTIVER EM OUTRO LUGAR.
    video_path = "video_input.mp4" # <--- LINHA ALTERADA PARA SEU VÍDEO

    # Verifica se o arquivo de vídeo existe
    if not os.path.exists(video_path):
        raise HTTPException(
            status_code=404,
            detail=f"Arquivo de vídeo não encontrado no caminho: {video_path}. Por favor, coloque 'video_input.mp4' na mesma pasta do 'main.py' ou especifique o caminho completo."
        )

    cap = cv2.VideoCapture(video_path)

    # Verifica se o vídeo foi aberto corretamente
    if not cap.isOpened():
        raise HTTPException(
            status_code=500,
            detail=f"Não foi possível abrir o arquivo de vídeo: {video_path}. Verifique o caminho, o formato (MP4, AVI, etc.) e se o arquivo não está corrompido."
        )

    results = []
    
    # Tenta obter a taxa de quadros (FPS) do vídeo
    frame_rate = cap.get(cv2.CAP_PROP_FPS)
    if frame_rate == 0: # Caso não consiga obter o FPS, define um padrão
        frame_rate = 30 
    
    frame_count = 0
    
    print(f"Iniciando análise do vídeo: {video_path} (FPS: {frame_rate:.2f})")

    # Loop para ler e analisar os frames do vídeo
    while True:
        ret, frame = cap.read()
        if not ret: # Se não houver mais frames ou houver um erro na leitura
            break
        
        # Analisa a cada 1 segundo (aproximadamente, baseado no FPS)
        # Isso evita analisar todos os frames, o que seria muito lento para vídeos longos.
        if frame_count % int(frame_rate) == 0:
            current_second = frame_count // int(frame_rate)
            print(f"Analisando segundo: {current_second}")
            try:
                # Realiza a análise de emoções com DeepFace
                # enforce_detection=False: Tenta analisar mesmo se a detecção facial não for perfeita.
                # silent=True: Suprime as mensagens de log do DeepFace no console.
                analysis_results = DeepFace.analyze(
                    frame,
                    actions=['emotion'],
                    enforce_detection=False,
                    silent=True
                )
                
                # DeepFace.analyze retorna uma lista de dicionários (um para cada face detectada)
                # Assumimos a primeira face detectada para a análise principal.
                if analysis_results and len(analysis_results) > 0:
                    dominant_emotion = analysis_results[0].get("dominant_emotion", "unknown")
                    # Arredonda as porcentagens das emoções para duas casas decimais
                    emotions = {k: round(float(v), 2) for k, v in analysis_results[0]["emotion"].items()}
                    
                    results.append({
                        "second": current_second,
                        "dominant_emotion": dominant_emotion,
                        "emotions": emotions
                    })
                else:
                    # Caso nenhuma face seja detectada no frame
                    results.append({
                        "second": current_second,
                        "dominant_emotion": "no_face_detected",
                        "emotions": {} # Ou um dicionário de emoções zeradas
                    })

            except Exception as e:
                # Captura erros durante a análise de um frame específico
                print(f"Erro na análise do segundo {current_second}: {e}")
                results.append({
                    "second": current_second,
                    "error": f"Erro na análise: {str(e)}"
                })
        
        frame_count += 1

    # Libera o objeto VideoCapture
    cap.release()
    print("Análise do vídeo concluída.")

    # Retorna os resultados em um formato JSON
    return {
        "video": video_path,
        "output_json": "analysis_results.json", # Nome fictício para o arquivo de saída
        "analysis": results
    }

# Bloco para executar a aplicação com Uvicorn
# Para rodar, use no terminal: uvicorn main:app --reload --host 0.0.0.0 --port 8001
# --reload: reinicia o servidor a cada mudança de código
# --host 0.0.0.0: permite que a API seja acessível de outros dispositivos na rede local
# --port 8001: define a porta da API
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)