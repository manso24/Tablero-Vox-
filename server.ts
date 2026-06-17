import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "15mb" }));

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

/**
 * Utility to convert raw 24kHz 16-bit Mono PCM buffer to a valid WAV buffer
 */
function pcmToWav(pcmBuffer: Buffer, sampleRate: number = 24000): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const chunkSize = 36 + dataSize;

  const header = Buffer.alloc(44);

  // RIFF identifier
  header.write("RIFF", 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // AudioFormat PCM = 1
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// REST API for Text-to-Speech
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voice, language, accent, toneInstruction } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "O texto a ser sintetizado é obrigatório." });
    }

    // Default parameters
    const selectedVoice = voice || "Charon";
    const selectedLang = language || "Português do Brasil";
    const selectedAccent = accent || "Nenhum/Geral";
    const selectedTone = toneInstruction || "";

    // Build the systemInstruction for high fidelity guidance
    const systemInstruction = `Você é um narrador profissional de altíssima qualidade técnica e interpretativa.
Você fala fluentemente o idioma "${selectedLang}" com o sotaque regional "${selectedAccent}".
Estilo de voz atual do narrador: ${selectedTone}

O texto do usuário contém algumas marcações especiais de respiração, pausa e ênfase expressas entre colchetes [].
Por favor, siga rigorosamente as seguintes instruções de interpretação dramática e ritmo:
- [pause]: Insira uma pausa de respiração natural e silêncio de 1 segundo antes de continuar a fala.
- [pause 2]: Insira uma pausa dramática mais longa de 2 segundos antes de continuar a fala.
- [slow]: Diminua o ritmo de fala (fale mais devagar) e acrescente mais peso emocional/solene nas próximas palavras.
- [emphasis]: Destaque a frase ou palavra com maior intensidade vocal, estresse e importância.
- [serious]: Adote instantaneamente um tom mais sério, compenetrado e dramático.
- [thoughtful]: Fale de modo reflexivo, como se estivesse ponderando um grande mistério ou pensamento.
- [confident]: Fale de modo enérgico, seguro de si, firme e convincente.
- [whispers]: Fale em tom sussurrado, confidencial e num volume baixo.
- [calm]: Use um tom calmo, sereno, acolhedor e com volume suave.
- [neutral]: Retorne ao padrão neutro de narração limpa e profissional.

ATENÇÃO CRÍTICA:
1. NUNCA fale em voz alta os nomes das marcações que estão dentro de colchetes (por exemplo, não diga "colchete pause colchete" ou "pause" ou "slow"). Converta as instruções diretamente em efeitos reais de entonação, silêncio e velocidade acústica em sua fala.
2. Mantenha a clareza perfeita das palavras, respiração natural e o tom de voz especificado nas configurações para este projeto de documentário sério.`;

    // Make content call using Gemini 3.1 TTS model
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text }] }],
      config: {
        // Modality.AUDIO is exported by the SDK
        responseModalities: [Modality.AUDIO],
        systemInstruction: systemInstruction,
        speechConfig: {
          voiceConfig: {
            // Options: Puck, Charon, Kore, Fenrir, Zephyr
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    // Extract base64 encoded audio
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      console.error("Gemini TTS API returned successful response, but without audio parts.", JSON.stringify(response.candidates));
      return res.status(500).json({ error: "O modelo Gemini não retornou nenhum dado de áudio." });
    }

    // Raw PCM from Gemini TTS is 24000Hz, 16-bit, Mono LE
    const pcmBuffer = Buffer.from(base64Audio, "base64");
    const wavBuffer = pcmToWav(pcmBuffer, 24000);

    // Return custom base64 encoded wav
    const finalBase64Wav = wavBuffer.toString("base64");

    return res.json({
      audioUrl: `data:audio/wav;base64,${finalBase64Wav}`,
      accentUsed: selectedAccent,
      voiceUsed: selectedVoice
    });

  } catch (error: any) {
    console.error("Erro na rota /api/tts:", error);
    return res.status(500).json({
      error: error.message || "Erro interno ao processar a síntese de voz usando Gemini TTS."
    });
  }
});

// Configure Vite or production static file server
async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== "production") {
    console.log("Iniciando em modo de DESENVOLVIMENTO...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Iniciando em modo de PRODUÇÃO...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${PORT} (Acessível externamente via nginx)`);
  });
}

startServer();
