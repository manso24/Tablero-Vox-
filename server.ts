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

interface AudioSegment {
  type: "text" | "silence";
  text?: string;
  duration?: number;
  stylePrefix?: string;
}

// Function to split raw text on bracketed tags and associate styles and silences
function parseTextToSegments(text: string, defaultStyle: string): AudioSegment[] {
  const regex = /(\[pause\]|\[pause 2\]|\[slow\]|\[emphasis\]|\[serious\]|\[thoughtful\]|\[confident\]|\[whispers\]|\[calm\]|\[neutral\])/g;
  const parts = text.split(regex);
  
  const segments: AudioSegment[] = [];
  let currentStyle = defaultStyle || "natural voice";

  for (const part of parts) {
    if (!part) continue;

    const trimmed = part.trim();
    if (trimmed === "[pause]") {
      segments.push({ type: "silence", duration: 1.0 });
    } else if (trimmed === "[pause 2]") {
      segments.push({ type: "silence", duration: 2.0 });
    } else if (trimmed === "[slow]") {
      currentStyle = "a slow, paced, and deliberate narration style";
    } else if (trimmed === "[emphasis]") {
      currentStyle = "strong emphasis, highlighted focus, and emotional stress";
    } else if (trimmed === "[serious]") {
      currentStyle = "a very serious, sober, and formal documentary delivery";
    } else if (trimmed === "[thoughtful]") {
      currentStyle = "a thoughtful, reflective, wise, and calm delivery";
    } else if (trimmed === "[confident]") {
      currentStyle = "a highly confident, authoritative, energetic, and firm tone";
    } else if (trimmed === "[whispers]") {
      currentStyle = "a very soft, whispered, intimate low-intensity tone";
    } else if (trimmed === "[calm]") {
      currentStyle = "a calm, peaceful, serene, and relaxing delivery";
    } else if (trimmed === "[neutral]") {
      currentStyle = defaultStyle || "natural voice";
    } else {
      // It's raw text. We can cleanup extra whitespace.
      const rawText = part.trim();
      if (rawText) {
        // Group sentences up to ~800 characters to prevent API rate-limiting and maximize compilation speed.
        const sentences = rawText.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [rawText];
        let currentGroup = "";
        
        for (const sentence of sentences) {
          const trimmedSentence = sentence.trim();
          if (!trimmedSentence) continue;

          if ((currentGroup + " " + trimmedSentence).length > 800) {
            if (currentGroup.trim()) {
              segments.push({
                type: "text",
                text: currentGroup.trim(),
                stylePrefix: currentStyle
              });
            }
            currentGroup = trimmedSentence;
          } else {
            currentGroup = currentGroup ? currentGroup + " " + trimmedSentence : trimmedSentence;
          }
        }
        if (currentGroup.trim()) {
          segments.push({
            type: "text",
            text: currentGroup.trim(),
            stylePrefix: currentStyle
          });
        }
      }
    }
  }

  return segments;
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
    const selectedTone = toneInstruction || "professional narrator";

    // Build segments dynamically by parsing tags
    const segments = parseTextToSegments(text, selectedTone);
    console.log(`Iniciei o processador acústico de alta fidelidade: ${segments.length} blocos identificados.`);

    // Map each segment to its promise or silent buffer
    const segmentPromises = segments.map(async (segment, index) => {
      if (segment.type === "silence") {
        // Generate precise digital silent PCM buffer: 24kHz, 16-bit Mono (2 bytes per sample)
        const durationSec = segment.duration || 1.0;
        const totalBytes = Math.floor(durationSec * 24000 * 2);
        return Buffer.alloc(totalBytes);
      }

      // Clean prompt that strictly triggers natural narration with precise vocal qualities
      const targetLangName = selectedLang.includes("Espanhol") ? "Spanish" : "Portuguese";
      
      // Amplify the deep/bass voice characteristics for masculine voices (Charon, Fenrir, Puck)
      let voiceModifier = "";
      if (selectedVoice === "Charon") {
        voiceModifier = ", using an extremely deep, low-pitched, heavy-bassy, resonant and majestic documentary voice with thick lower harmonics";
      } else if (selectedVoice === "Fenrir" || selectedVoice === "Puck") {
        voiceModifier = ", using a deep, serious, low-pitched, solid masculine voice with calm delivery";
      }

      const prompt = `Say in ${targetLangName} with ${segment.stylePrefix}${voiceModifier}: "${segment.text}"`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-tts-preview",
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: selectedVoice },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
          console.warn(`Aviso: O Gemini retornou áudio vazio para o fragmento ${index + 1}.`);
          return null;
        }

        return Buffer.from(base64Audio, "base64");
      } catch (err: any) {
        console.error(`Falha ao processar fragmento de texto ${index + 1}:`, err);
        // Fallback: return a subtle blank spacing rather than failing the whole audio chain
        return Buffer.alloc(Math.floor(0.2 * 24000 * 2));
      }
    });

    const buffersWithNulls = await Promise.all(segmentPromises);
    // Filter out potential failures
    const validBuffers = buffersWithNulls.filter((b): b is Buffer => b !== null);

    if (validBuffers.length === 0) {
      throw new Error("Não foi possível gerar nenhum conteúdo de voz válido para os blocos informados.");
    }

    // Merge sequential PCM streams together
    const finalPcmBuffer = Buffer.concat(validBuffers);

    // Dynamic WAV generation matching mono channel and 24,000Hz frequency
    const wavBuffer = pcmToWav(finalPcmBuffer, 24000);
    const finalBase64Wav = wavBuffer.toString("base64");

    return res.json({
      audioUrl: `data:audio/wav;base64,${finalBase64Wav}`,
      accentUsed: selectedAccent,
      voiceUsed: selectedVoice,
      segmentsCount: segments.length
    });

  } catch (error: any) {
    console.error("Erro na rota /api/tts:", error);
    return res.status(500).json({
      error: error.message || "Erro no processamento acústico de sintetização de áudio premium."
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
