import React, { useState } from "react";
import { 
  Volume2, 
  PenTool, 
  HelpCircle, 
  Mic, 
  AlertCircle, 
  Heart,
  Grid,
  Info,
  Layers,
  Sparkles,
  Award,
  BookOpen
} from "lucide-react";
import { VOICES, ACCENTS, LANGUAGES, Voice, Accent, Language } from "./types";
import { AudioPlayer } from "./components/AudioPlayer";

const MAX_CHAR_LIMIT = 10000;

export default function App() {
  const [text, setText] = useState(
    "[serious] [emphasis] Senhoras e senhores, bem-vindos ao Tablero Vox! [pause 2] \n\n[confident] Esta é uma tecnologia de ponta projetada para narrar seus documentários geopolíticos com máxima intensidade e tom solene. [pause] [slow] Experimente mudar as vozes disponíveis na barra lateral [neutral] ou adicione as tags de controle como [serious] ou [emphasis] para personalizar a cadência e sentimento da narração."
  );
  
  // Custom TTS settings
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(VOICES[0]); // Pedro (Grave e Profundo Charon)
  const [selectedAccent, setSelectedAccent] = useState<Accent>(ACCENTS[0]);

  // Audio output state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= MAX_CHAR_LIMIT) {
      setText(val);
      if (errorMessage && val.length < MAX_CHAR_LIMIT) {
        setErrorMessage(null);
      }
    }
  };

  // Triggers immediate synthesis for the drafted text
  const handleGenerateAudio = async () => {
    if (!text.trim()) return;

    if (text.length > MAX_CHAR_LIMIT) {
      setErrorMessage(`O texto excede o limite estrito de ${MAX_CHAR_LIMIT.toLocaleString()} caracteres definido para o estúdio.`);
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          voice: selectedVoice.prebuiltVoiceName,
          language: selectedLanguage.name,
          accent: selectedAccent.name,
          toneInstruction: selectedVoice.promptGuidance
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ocorreu um erro desconhecido durante a síntese de áudio.");
      }

      const data = await response.json();
      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
      } else {
        throw new Error("Resposta bem-sucedida, mas nenhum arquivo de áudio foi fornecido pela inteligência artificial.");
      }

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Erro de conexão ao tentar gerar a locução de voz.");
    } finally {
      setIsGenerating(false);
    }
  };

  const textLengthPercentage = (text.length / MAX_CHAR_LIMIT) * 100;

  return (
    <div className="min-h-screen bg-[#0b071a] text-slate-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-violet-100 pb-16">
      
      {/* Top Electrifying Soft Violet Accent Bar */}
      <div className="h-2 bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 w-full shadow-lg shadow-violet-500/20" />

      {/* Main Container Header */}
      <header className="max-w-7xl mx-auto w-full px-4 md:px-6 py-8 flex flex-col md:flex-row items-center justify-between border-b border-violet-950/40 gap-4">
        <div className="flex items-center gap-4.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-500 flex items-center justify-center text-white shadow-xl shadow-violet-600/30 transition hover:scale-105 duration-350">
            <Mic className="stroke-[2.5]" size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[10px] font-bold tracking-widest bg-violet-500/10 text-violet-300 px-2 py-0.5 rounded border border-violet-500/20">
                PRO ENGINE 3.1
              </span>
              <span className="text-slate-700 text-xs">|</span>
              <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                <Layers size={11} className="text-violet-400" />
                Estúdio de Voz de Alta Fidelidade
              </span>
            </div>
            <h1 className="font-display font-black text-3xl tracking-tight text-white mt-1">
              Tablero <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-300 bg-clip-text text-transparent">Vox</span>
            </h1>
          </div>
        </div>
        
        {/* Simple status badge */}
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-500 font-mono tracking-wider">PROCESSAMENTO ACÚSTICO</p>
            <p className="text-xs text-slate-350 font-medium">Gemini 3.1 Flash TTS Preview</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md border border-violet-950/50 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-lg hover:border-violet-500/30 transition duration-300">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-555 bg-violet-500"></span>
            </div>
            <span className="text-xs font-medium text-slate-200">Painel Operacional Ativo</span>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column - Workspace TTS: 7 columns */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <div className="bg-slate-900/30 backdrop-blur-xl border border-violet-950/40 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
            
            <div className="flex items-center justify-between border-b border-violet-950/35 pb-4">
              <div className="flex items-center gap-2.5">
                <PenTool className="text-violet-400" size={19} />
                <h2 className="font-display font-bold text-lg text-slate-100">Área de Roteirização e Narração</h2>
              </div>
              <span className="text-xs font-mono text-slate-350 bg-slate-950/50 px-3 py-1.5 rounded-xl border border-violet-950/20">
                {text.length.toLocaleString()} / <span className="text-violet-455 text-violet-400 font-semibold">{MAX_CHAR_LIMIT.toLocaleString()}</span> carac.
              </span>
            </div>

            {/* Micro progress bar for character budget */}
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-violet-950/20">
              <div 
                style={{ width: `${textLengthPercentage}%` }}
                className={`h-full rounded-full transition-all duration-300 ${
                  textLengthPercentage > 90 
                    ? "bg-rose-500" 
                    : textLengthPercentage > 75 
                    ? "bg-purple-550 bg-purple-500" 
                    : "bg-gradient-to-r from-violet-500 to-pink-400"
                }`}
              />
            </div>

            {/* Light guidance element indicating tags can be manually typed */}
            <div className="bg-gradient-to-r from-violet-950/40 to-slate-950/80 p-4.5 rounded-2xl border border-violet-900/20 text-xs text-slate-300 leading-relaxed flex flex-col gap-2 shadow-inner">
              <div className="flex items-center gap-2 font-black text-violet-300 text-xs uppercase tracking-wider">
                <Sparkles size={14} className="text-violet-400 animate-pulse" />
                <span>Instruções de Sintonia Avançada</span>
              </div>
              <p className="font-light text-slate-300 text-xs">
                Você pode comandar a inteligência de voz escrevendo tags no próprio texto. Digite <strong className="text-violet-300 font-mono">[pause]</strong> para paradas breves, <strong className="text-violet-300 font-mono">[pause 2]</strong> dramáticas, <strong className="text-violet-300 font-mono">[slow]</strong> para reduzir a cadence, ou sentimentos como <strong className="text-violet-300 font-mono">[serious]</strong>, <strong className="text-violet-300 font-mono">[confident]</strong>, <strong className="text-violet-300 font-mono">[whispers]</strong> ou <strong className="text-violet-300 font-mono">[emphasis]</strong>.
              </p>
            </div>

            {/* Textarea Editor */}
            <div className="flex flex-col relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl blur opacity-15 group-focus-within:opacity-30 transition duration-300" />
              <textarea
                id="tts-textarea"
                value={text}
                onChange={handleTextChange}
                placeholder="Insira o texto que você deseja que a inteligência artificial narre aqui. O estúdio suporta até 10.000 caracteres por lote..."
                rows={11}
                className="relative w-full bg-slate-950/90 border border-violet-950/40 rounded-2xl p-5 text-slate-100 text-sm leading-relaxed focus:outline-none focus:border-violet-400/80 placeholder:text-slate-600 font-light resize-y min-h-[280px] transition-all"
              />
              {text.length === MAX_CHAR_LIMIT && (
                <div className="absolute bottom-3 right-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded">
                  Limite de 10k Alcançado
                </div>
              )}
            </div>

            {/* Actions Panel */}
            <div className="flex flex-col gap-3.5 pt-4 border-t border-violet-950/30">
              {errorMessage && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl text-xs flex gap-2.5 items-start">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{errorMessage}</p>
                </div>
              )}

              <button
                onClick={handleGenerateAudio}
                disabled={isGenerating || !text.trim()}
                className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 hover:from-violet-500 hover:via-purple-400 hover:to-pink-400 disabled:from-slate-900 disabled:to-slate-900 disabled:text-slate-600 text-white font-black tracking-widest text-xs uppercase transition-all shadow-xl shadow-violet-500/10 hover:scale-[1.005] active:scale-100 flex items-center justify-center gap-2.5 cursor-pointer border-t border-white/15"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>PROCESSANDO REPRODUÇÃO AUDIOFÔNICA...</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={18} className="stroke-[2.5]" />
                    <span>Iniciar Síntese de Voz Imediata</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Connected audio player module */}
          <AudioPlayer audioUrl={audioUrl} textToNarrate={text} />

        </div>

        {/* Right column - TTS Settings & Voice Catalog: 5 columns */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Section 1: Locutor Configs */}
          <div className="bg-slate-900/30 backdrop-blur-xl border border-violet-950/40 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
            
            <div className="flex items-center gap-2.5 border-b border-violet-950/35 pb-4">
              <Grid className="text-violet-400" size={19} />
              <h2 className="font-display font-bold text-base text-slate-100">Parâmetros de Ajuste Vocal</h2>
            </div>

            {/* Language & Accent Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Language Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Idioma Nacional</label>
                <div className="flex flex-col gap-1.5">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs transition border cursor-pointer ${
                        selectedLanguage.id === lang.id
                          ? "bg-violet-550/10 bg-violet-500/10 border-violet-500/40 text-violet-300 font-bold"
                          : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-300 hover:border-violet-950"
                      }`}
                    >
                      <span>{lang.name}</span>
                      <span className="text-base" role="img" aria-label={lang.name}>{lang.flag}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Regional Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Sotaque Regional (BR)</label>
                <select
                  value={selectedAccent.id}
                  onChange={(e) => {
                    const acc = ACCENTS.find((a) => a.id === e.target.value);
                    if (acc) setSelectedAccent(acc);
                  }}
                  className="bg-slate-950 border border-slate-900 rounded-xl px-3 py-3 text-xs text-slate-200 focus:outline-none focus:border-violet-400 font-medium h-[90px] overflow-hidden transition-colors"
                  disabled={selectedLanguage.id !== "pt-BR"}
                >
                  {ACCENTS.map((acc) => (
                    <option key={acc.id} value={acc.id} className="p-1">
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Print active Accent detail */}
            {selectedLanguage.id === "pt-BR" && (
              <div className="text-[11px] bg-slate-950/80 px-4 py-3 rounded-xl border border-violet-950/20 text-slate-300 leading-relaxed font-light">
                <span className="font-semibold text-violet-300">Sotaque Ativo: </span>
                {selectedAccent.description}
              </div>
            )}

            {/* Voices selection catalog - At least 10 voices */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 tracking-wide flex items-center gap-1.5">
                  <Award size={13} className="text-violet-400" />
                  Catálogo de Locutores ({VOICES.length})
                </label>
                <span className="text-[10px] text-violet-350 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase">Padrão Pedro</span>
              </div>

              {/* Scrollable list for voices */}
              <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1 select-none">
                {VOICES.map((v) => {
                  const isSelected = selectedVoice.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVoice(v)}
                      className={`flex flex-col text-left p-3.5 rounded-2xl border transition cursor-pointer gap-2 relative ${
                        isSelected 
                          ? "bg-violet-500/10 border-violet-500/50 text-slate-100 shadow-lg shadow-violet-500/5" 
                          : "bg-slate-950 border-slate-900/60 hover:bg-slate-900/90 hover:border-violet-950 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                            v.gender === "masculine" 
                              ? "bg-violet-500/10 text-violet-300 border border-violet-500/20" 
                              : "bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20"
                          }`}>
                            {v.gender === "masculine" ? "Masculino" : "Feminino"}
                          </span>
                          <span className="font-display font-extrabold text-xs text-slate-200">
                            {v.name}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400"></span>
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-400 font-light line-clamp-2">
                        {v.description}
                      </p>
                      <div className="text-[10px] font-mono text-violet-300 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-violet-950/30">
                        <span className="text-slate-500 font-semibold uppercase mr-1">TOM GERAL:</span> {v.tone}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Prompting guidelines of advanced control */}
          <div className="bg-slate-900/30 border border-violet-950/40 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-violet-950/35 pb-3.5">
              <BookOpen className="text-violet-400" size={16} />
              <h3 className="font-display font-bold text-xs text-slate-300 uppercase tracking-wider">Biblioteca de Comandos Vocais</h3>
            </div>
            
            <ul className="text-xs text-slate-400 flex flex-col gap-2.5 list-none p-0">
              <li className="flex items-start gap-2.5 bg-slate-950/50 p-3 rounded-xl border border-violet-950/10">
                <span className="text-violet-300 font-bold font-mono px-1.5 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded shrink-0">[pause]</span>
                <span>Insere uma parada natural de respiração de exatamente 1 segundo.</span>
              </li>
              <li className="flex items-start gap-2.5 bg-slate-950/50 p-3 rounded-xl border border-violet-950/10">
                <span className="text-violet-300 font-bold font-mono px-1.5 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded shrink-0">[pause 2]</span>
                <span>Insere uma pausa de reflexão ou suspense mais longa de 2 segundos.</span>
              </li>
              <li className="flex items-start gap-2.5 bg-slate-950/50 p-3 rounded-xl border border-violet-950/10">
                <span className="text-violet-300 font-bold font-mono px-1.5 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded shrink-0">[slow]</span>
                <span>O locutor reduz a velocidade para proferir com mais foco e peso solene.</span>
              </li>
              <li className="flex items-start gap-2.5 bg-slate-950/50 p-3 rounded-xl border border-violet-950/10">
                <span className="text-violet-300 font-bold font-mono px-1.5 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded shrink-0">[emphasis]</span>
                <span>Foca a atenção e adiciona ênfase vocal marcante sobre a expressão seguinte.</span>
              </li>
              <li className="flex items-start gap-2.5 bg-slate-950/50 p-3 rounded-xl border border-violet-950/10">
                <span className="text-violet-300 font-bold font-mono px-1.5 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded shrink-0">[serious]</span>
                <span>Garante um clima sério, maduro e imersivo para a leitura sequente.</span>
              </li>
            </ul>
          </div>

        </div>

      </main>

      {/* Footer credits and details */}
      <footer className="max-w-7xl mx-auto w-full px-4 md:px-6 pt-8 mt-4 border-t border-violet-950/30 text-center flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500 font-medium">
          Tablero Vox &copy; 2026. Estúdio de locução profissional por inteligência artificial em Português do Brasil.
        </p>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>Sintonização de timbre inteligente</span>
          <span>•</span>
          <span className="flex items-center gap-1.5 bg-violet-500/5 px-2.5 py-1 rounded-lg border border-violet-500/10">
            Produzido com <Heart size={10} className="fill-rose-500 text-rose-500 animate-pulse" /> usando Gemini Flash TTS
          </span>
        </div>
      </footer>

    </div>
  );
}
