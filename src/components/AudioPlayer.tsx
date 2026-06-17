import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Download, Volume2, FastForward } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string | null;
  textToNarrate: string;
}

export function AudioPlayer({ audioUrl, textToNarrate }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [progress, setProgress] = useState(0);

  // Restart audio player if a new audioUrl arrives
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
      // Load new URL
      audioRef.current.load();
    }
  }, [audioUrl]);

  // Handle Playback rate change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const togglePlay = () => {
    if (!audioUrl || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = speed;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error("Erro ao reproduzir áudio:", e);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const dur = audioRef.current.duration || 0;
      setCurrentTime(current);
      setDuration(dur);
      setProgress(dur > 0 ? (current / dur) * 100 : 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setProgress(0);
  };

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current && duration > 0) {
      const pct = parseFloat(e.target.value);
      const targetTime = (pct / 100) * duration;
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
      setProgress(pct);
    }
  };

  const handleReload = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setProgress(0);
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Speed options
  const speedOptions = [0.7, 0.85, 1.0, 1.15, 1.3, 1.5];

  // Helper to download the generated File
  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement("a");
    link.href = audioUrl;
    // Build download name
    const snippet = textToNarrate.slice(0, 20).trim().replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_") || "narracao";
    link.download = `tablerovox_tts_${snippet || "audio"}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/30 backdrop-blur-xl border border-violet-950/40 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
      {/* Native invisible audio handler */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
          className="hidden"
        />
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-violet-950/35 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${audioUrl ? (isPlaying ? 'bg-violet-400' : 'bg-purple-400') : 'bg-slate-600'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${audioUrl ? (isPlaying ? 'bg-violet-500' : 'bg-purple-555 bg-purple-500') : 'bg-slate-600'}`} />
          </div>
          <span className="font-display font-bold text-sm text-slate-200">
            {audioUrl ? "Onda e áudio carregados" : "Pronto para sintetização acústica"}
          </span>
        </div>
        {audioUrl && (
          <button
            onClick={handleDownload}
            title="Download do Áudio WAV"
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 text-white font-semibold px-4.5 py-2.5 rounded-xl text-xs transition duration-250 shadow-md shadow-violet-500/10 cursor-pointer"
          >
            <Download size={14} className="stroke-[2.5]" />
            Baixar Áudio (.WAV)
          </button>
        )}
      </div>

      {!audioUrl ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-550 text-center gap-2">
          <Volume2 size={40} className="text-violet-500/40 stroke-[1.5]" />
          <p className="text-sm font-medium text-slate-300">Escreva seu roteiro de até 10.000 caracteres e faça a síntese!</p>
          <p className="text-xs text-slate-500 font-light">O reprodutor inteligente com os controles de audição surgirá aqui.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          
          {/* Spectrogram mockup / sound wave effect */}
          <div className="h-16 bg-slate-950/90 rounded-2xl border border-violet-950/15 overflow-hidden flex items-center justify-center gap-[3px] px-4">
            {Array.from({ length: 48 }).map((_, index) => {
              // Generate dynamic heights based on index and whether playing
              const random = Math.sin((index + 1) * 0.4) * 0.4 + 0.6;
              const heightMultiplier = isPlaying ? (Math.random() * 0.6 + 0.4) : 0.15;
              const heightVal = Math.max(8, Math.floor(random * 48 * heightMultiplier));
              
              return (
                <div
                  key={index}
                  style={{ height: `${heightVal}px` }}
                  className={`w-[3px] rounded-full transition-all duration-150 ${isPlaying ? 'bg-gradient-to-t from-violet-500 to-purple-400' : 'bg-slate-800'}`}
                />
              );
            })}
          </div>

          {/* Progress Bar Controller */}
          <div className="flex flex-col gap-1.5">
            <input
              type="range"
              min="0"
              max="100"
              step="0.05"
              value={progress}
              onChange={handleScrubChange}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-violet-500 hover:accent-purple-400"
            />
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mt-2 bg-slate-950 p-4 rounded-2xl border border-violet-950/10">
            {/* Playback controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 text-white transition rounded-full shadow-lg shadow-violet-500/15 hover:scale-105 active:scale-95 cursor-pointer"
                title={isPlaying ? "Pausar" : "Reproduzir"}
              >
                {isPlaying ? <Pause size={20} className="fill-white stroke-[2.5]" /> : <Play size={20} className="fill-white stroke-[2.5] translate-x-0.5" />}
              </button>
              
              <button
                onClick={handleReload}
                className="w-10 h-10 flex items-center justify-center bg-slate-900 border border-violet-950/20 text-slate-300 hover:bg-slate-800 hover:text-white transition rounded-full cursor-pointer"
                title="Reiniciar Reprodutor"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Speeds Selector */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <FastForward size={12} className="text-violet-400" />
                <span>Velocidade de Reprodução</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {speedOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSpeed(opt)}
                    className={`px-3 py-1.5 text-xs font-mono rounded-lg transition duration-200 cursor-pointer ${
                      Math.abs(speed - opt) < 0.05
                        ? "bg-violet-500/10 border border-violet-500/40 text-violet-300 font-bold"
                        : "bg-slate-900/60 hover:bg-slate-800 border border-slate-900/40 text-slate-400"
                    }`}
                  >
                    {opt === 1.0 ? "Padrão" : `${opt}x`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
