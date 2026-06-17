export interface Voice {
  id: string;
  name: string;
  gender: "masculine" | "feminine";
  tone: string;
  prebuiltVoiceName: "Charon" | "Fenrir" | "Puck" | "Zephyr" | "Kore";
  description: string;
  promptGuidance: string;
}

export interface Accent {
  id: string;
  name: string;
  description: string;
}

export interface Language {
  id: string;
  name: string;
  flag: string;
}

export const VOICES: Voice[] = [
  {
    id: "pedro",
    name: "Pedro (Voz Padrão)",
    gender: "masculine",
    tone: "Grave e Profundo - Tradicional de Documentário",
    prebuiltVoiceName: "Charon",
    description: "Voz masculina madura, solene e com grande peso acústico, ideal para documentários geopolíticos.",
    promptGuidance: "narração profunda, madura, solene, ritmo de documentário sério e pausas conscientes."
  },
  {
    id: "carlos",
    name: "Carlos (Sério e Corporativo)",
    gender: "masculine",
    tone: "Firme e Profissional",
    prebuiltVoiceName: "Fenrir",
    description: "Tom corporativo sério, maduro, impecável para apresentações de negócios, finanças ou relatórios formais.",
    promptGuidance: "fala pausada, segura, dicção corporativa e tom sóbrio profissional."
  },
  {
    id: "gustavo",
    name: "Gustavo (Pausado e Reflexivo)",
    gender: "masculine",
    tone: "Médio-baixo, Pensativo e Introspectivo",
    prebuiltVoiceName: "Puck",
    description: "Adequado para histórias lentas, vídeos poéticos, discursos reflexivos ou introspeção.",
    promptGuidance: "entonação calma, poética, compassada com ênfase expressiva e tom reflexivo."
  },
  {
    id: "roberto",
    name: "Roberto (Noticiarista / Rádio)",
    gender: "masculine",
    tone: "Voz Dinâmica de Locutor",
    prebuiltVoiceName: "Zephyr",
    description: "Estilo rádio de notícias, tom firme, rápido, confiante e extremamente neutro.",
    promptGuidance: "locução rápida, informativa, confiante, dicção de âncora jornalístico."
  },
  {
    id: "andre",
    name: "André (Professor e Didático)",
    gender: "masculine",
    tone: "Calmo, Claro e Explicativo",
    prebuiltVoiceName: "Charon",
    description: "Perfeito para tutoriais, videoaulas, explicações com clareza máxima e paciência.",
    promptGuidance: "tom didático, articulado, amigável mas formal, ritmo estável de aula."
  },
  {
    id: "felipe",
    name: "Felipe (Sussurrado e Enigmático)",
    gender: "masculine",
    tone: "Grave Confidencial",
    prebuiltVoiceName: "Fenrir",
    description: "Tom muito sussurrado, íntimo, quase conspiratório, ideal para suspense e mistérios.",
    promptGuidance: "fala sussurrada, volume baixo, conspiratória, repleta de mistério."
  },
  {
    id: "marcos",
    name: "Marcos (Jovem Dinâmico)",
    gender: "masculine",
    tone: "Moderno e Entusiasmado",
    prebuiltVoiceName: "Zephyr",
    description: "Tom jovem, ágil, sutilmente energético, ideal para publicidade moderna e mídias sociais.",
    promptGuidance: "fala ágil, tom amigável, entusiasmado, moderno e descontraído."
  },
  {
    id: "mariana",
    name: "Mariana (Clara e Elegante)",
    gender: "feminine",
    tone: "Profissional e Articulada",
    prebuiltVoiceName: "Kore",
    description: "Voz feminina brilhante, confiante e fluida, ideal para marcas premium, corporativo e tutoriais.",
    promptGuidance: "voz articulada clara, dicção limpa, tom feminino maduro e profissional."
  },
  {
    id: "camila",
    name: "Camila (Narradora Suave e Calma)",
    gender: "feminine",
    tone: "Calorosa e Suave",
    prebuiltVoiceName: "Kore",
    description: "Tom feminino reconfortante, amigável, caloroso, perfeito para meditação e audiolivros calmos.",
    promptGuidance: "fala pausada, voz doce, compassiva, relaxante e com cadência suave."
  },
  {
    id: "beatriz",
    name: "Beatriz (Firme e Executiva)",
    gender: "feminine",
    tone: "Voz de Comando / Liderança",
    prebuiltVoiceName: "Kore",
    description: "Voz feminina direta, assertiva, ideal para manifestos de marca ou liderança corporativa.",
    promptGuidance: "entonação firme, confiante, ritmo assertivo e presença de liderança."
  }
];

export const ACCENTS: Accent[] = [
  { id: "geral", name: "Neutro / Sem Sotaque Marcado", description: "Pronúncia limpa e padrão do idioma selecionado." },
  { id: "carioca", name: "Sotaque Carioca (Rio de Janeiro)", description: "Pronúncia com o 'S' chiado característico e vogais abertas." },
  { id: "paulistano", name: "Sotaque Paulistano (São Paulo)", description: "Ritmado e articulado com vogais e 'R' levemente r retroflexo nas pontas." },
  { id: "nordestino", name: "Sotaque Nordestino", description: "Rítmico, cantado, com a pronúncia característica das vogais médias nordestinas." },
  { id: "gaucho", name: "Sotaque Gaúcho (Rio Grande do Sul)", description: "Cadência forte, vogais fechadas e o dinamismo do pampa." },
  { id: "baiano", name: "Sotaque Baiano (Bahia)", description: "Cadência mais arrastada, melódica, musical e acolhedora." }
];

export const LANGUAGES: Language[] = [
  { id: "pt-BR", name: "Português do Brasil", flag: "🇧🇷" },
  { id: "es-ES", name: "Espanhol Neutro", flag: "🇪🇸" }
];

export interface TagDefinition {
  tag: string;
  label: string;
  color: string;
  description: string;
}

export const SUPPORTED_TAGS: TagDefinition[] = [
  { tag: "[pause]", label: "Pausa curta (1s)", color: "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700", description: "Insere pausa de 1s para respiração natural" },
  { tag: "[pause 2]", label: "Pausa longa (2s)", color: "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700", description: "Pausa dramática mais estendida de 2s" },
  { tag: "[slow]", label: "Lento/Ponderado", color: "bg-indigo-950/40 border-indigo-900/40 text-indigo-300 hover:bg-indigo-900/30 hover:border-indigo-600/40", description: "Fala de modo mais lento, compassado e com peso" },
  { tag: "[emphasis]", label: "Ênfase Vocal", color: "bg-cyan-950/40 border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/30 hover:border-cyan-500/40", description: "Adiciona estresse e destaque de ênfase na palavra" },
  { tag: "[serious]", label: "Tom Sério", color: "bg-rose-950/30 border-rose-900/40 text-rose-300 hover:bg-rose-900/20 hover:border-rose-500/30", description: "Adota um tom severo, direto e compenetrado" },
  { tag: "[thoughtful]", label: "Reflexivo", color: "bg-blue-950/30 border-blue-900/40 text-blue-300 hover:bg-blue-900/20 hover:border-blue-500/30", description: "Tom contemplativo de pensador ou analista" },
  { tag: "[confident]", label: "Tom Confiante", color: "bg-emerald-950/30 border-emerald-900/40 text-emerald-300 hover:bg-emerald-900/20 hover:border-emerald-500/30", description: "Mais assertividade, firmeza e poder" },
  { tag: "[whispers]", label: "Sussurro", color: "bg-purple-950/30 border-purple-900/40 text-purple-300 hover:bg-purple-900/20 hover:border-purple-500/30", description: "Falar sussurrado em segredo íntimo" },
  { tag: "[calm]", label: "Tom Calmo", color: "bg-teal-950/30 border-teal-900/40 text-teal-300 hover:bg-teal-900/20 hover:border-teal-500/30", description: "Suavidade, paz e tranquilidade reconfortante" },
  { tag: "[neutral]", label: "Restaurar Neutro", color: "bg-zinc-800/40 border-zinc-700/60 text-zinc-300 hover:bg-zinc-700", description: "Restaura o tom limpo da voz do narrador" }
];
