
import { NewsColumn } from './types';

export const COLORS = {
  dark1: "#0A0918",
  dark2: "#12102B",
  dark3: "#1C1940",
  accentYellow1: "#F5C518",
  accentYellow2: "#FFD93D",
  white: "#FFFFFF",
  gray: "#C0C0C0"
};

const generateItems = (source: string, country: string, count: number, baseTime: number) => {
  const titles = [
    "Tensions diplomatiques en hausse", "Nouvelle réforme économique annoncée", "Sommet international prévu",
    "Incident de sécurité signalé", "Accord commercial signé", "Manifestations dans plusieurs villes",
    "Découverte scientifique majeure", "Élections anticipées possibles", "Crise politique évitée de justesse",
    "Investissements étrangers en hausse", "Nouvelle infrastructure inaugurée", "Débat houleux au parlement",
    "Technologie de pointe déployée", "Mesures sanitaires renforcées", "Scandale financier révélé",
    "Alliance stratégique confirmée", "Grèves sectorielles annoncées", "Innovation industrielle primée",
    "Réformes sociales en discussion", "Tensions régionales apaisées"
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `${source}-${i}`,
    time: `${String(baseTime + Math.floor(i / 4)).padStart(2, '0')}:${String((i * 15) % 60).padStart(2, '0')}`,
    title: titles[i % titles.length],
    translation: `Translation ${i}`,
    source,
    priority: i % 7 === 0 ? "high" as const : "normal" as const,
    color: i % 7 === 0 ? "#F5C518" : "#FFFFFF",
    country,
    content: `Contenu détaillé de l'actualité ${i + 1}. Informations complètes et contextuelles sur l'événement.`,
    tags: ["Actualité", country]
  }));
};

export const MOCK_COLUMNS: NewsColumn[] = [
  // ISRAËL
  {
    id: "israel-arutz7he",
    media: "Israel - Aroutz 7 HE",
    backgroundColor: "#1C1940",
    headerColor: "#E74C3C",
    items: []
  },
  {
    id: "israel-ynet",
    media: "Israel - Ynet",
    backgroundColor: "#1C1940",
    headerColor: "#F5C518",
    items: []
  },
  {
    id: "israel-arutz7-new",
    media: "Israel - Arutz 7",
    backgroundColor: "#1C1940",
    headerColor: "#8B4513",
    items: []
  },
  {
    id: "israel-arutz14",
    media: "Israel - Arutz 14",
    backgroundColor: "#1C1940",
    headerColor: "#4A90E2",
    items: []
  },
  {
    id: "israel-israelhayom",
    media: "Israel - Israel Hayom",
    backgroundColor: "#1C1940",
    headerColor: "#003399",
    items: []
  },
  {
    id: "israel-walla",
    media: "Israel - Walla",
    backgroundColor: "#1C1940",
    headerColor: "#FF1493",
    items: []
  },
  {
    id: "israel-haaretz",
    media: "Israel - Haaretz",
    backgroundColor: "#1C1940",
    headerColor: "#F5C518",
    items: []
  },
  {
    id: "israel-jpost",
    media: "Israel - Jerusalem Post",
    backgroundColor: "#1C1940",
    headerColor: "#F5C518",
    items: []
  },
  {
    id: "israel-times",
    media: "Israel - Times of Israel",
    backgroundColor: "#1C1940",
    headerColor: "#F5C518",
    items: []
  },
  {
    id: "israel-i24",
    media: "Israel - i24NEWS",
    backgroundColor: "#1C1940",
    headerColor: "#F5C518",
    items: []
  },
  {
    id: "israel-kan",
    media: "Israel - KAN News",
    backgroundColor: "#1C1940",
    headerColor: "#F5C518",
    items: []
  },
  {
    id: "israel-channel12",
    media: "Israel - Channel 12",
    backgroundColor: "#1C1940",
    headerColor: "#F5C518",
    items: []
  },
  {
    id: "israel-channel13",
    media: "Israel - Channel 13",
    backgroundColor: "#1C1940",
    headerColor: "#F5C518",
    items: []
  },
  {
    id: "israel-globes",
    media: "Israel - Globes",
    backgroundColor: "#1C1940",
    headerColor: "#F5C518",
    items: []
  },

  // FRANCE
  {
    id: "france-afp",
    media: "France - AFP",
    backgroundColor: "#1C1940",
    headerColor: "#FFD93D",
    items: []
  },
  {
    id: "france-lemonde",
    media: "France - Le Monde",
    backgroundColor: "#1C1940",
    headerColor: "#FFD93D",
    items: []
  },
  {
    id: "france-figaro",
    media: "France - Le Figaro",
    backgroundColor: "#1C1940",
    headerColor: "#FFD93D",
    items: []
  },
  {
    id: "france-liberation",
    media: "France - Libération",
    backgroundColor: "#1C1940",
    headerColor: "#FFD93D",
    items: []
  },
  {
    id: "france-franceinfo",
    media: "France - France Info",
    backgroundColor: "#1C1940",
    headerColor: "#FFD93D",
    items: []
  },
  {
    id: "france-bfmtv",
    media: "France - BFM TV",
    backgroundColor: "#1C1940",
    headerColor: "#FFD93D",
    items: []
  },
  {
    id: "france-tf1",
    media: "France - TF1 Info",
    backgroundColor: "#1C1940",
    headerColor: "#FFD93D",
    items: []
  },
  {
    id: "france-france24",
    media: "France - France 24",
    backgroundColor: "#1C1940",
    headerColor: "#FFD93D",
    items: []
  },
  {
    id: "france-leparisien",
    media: "France - Le Parisien",
    backgroundColor: "#1C1940",
    headerColor: "#FFD93D",
    items: []
  },
  {
    id: "france-lesechos",
    media: "France - Les Echos",
    backgroundColor: "#1C1940",
    headerColor: "#FFD93D",
    items: []
  },

  // MONDE
  {
    id: "monde-reuters",
    media: "Monde - Reuters",
    backgroundColor: "#1C1940",
    headerColor: "#FF6600",
    items: []
  },
  {
    id: "monde-anadolu",
    media: "Monde - ANADOLU (Agence de presse turque)",
    backgroundColor: "#1C1940",
    headerColor: "#E30613",
    items: []
  },
  {
    id: "monde-bbc-world",
    media: "Monde - BBC World",
    backgroundColor: "#1C1940",
    headerColor: "#BB1919",
    items: []
  },
  {
    id: "monde-bloomberg",
    media: "Monde - Bloomberg",
    backgroundColor: "#1C1940",
    headerColor: "#000000",
    items: []
  },
  {
    id: "monde-foxnews",
    media: "Monde - FOXNews",
    backgroundColor: "#1C1940",
    headerColor: "#003366",
    items: []
  },
  {
    id: "monde-nytimes",
    media: "Monde - New York Times",
    backgroundColor: "#1C1940",
    headerColor: "#000000",
    items: []
  },
  {
    id: "monde-politico",
    media: "Monde - POLITICO",
    backgroundColor: "#1C1940",
    headerColor: "#E30000",
    items: []
  },
  {
    id: "monde-rt",
    media: "Monde - RT - Russie",
    backgroundColor: "#1C1940",
    headerColor: "#009DDC",
    items: []
  },
  {
    id: "monde-tass",
    media: "Monde - TASS (Agence de presse russe)",
    backgroundColor: "#1C1940",
    headerColor: "#E30000",
    items: []
  },
  {
    id: "monde-ap",
    media: "Monde - Associated Press",
    backgroundColor: "#1C1940",
    headerColor: "#FFFFFF",
    items: []
  },
  {
    id: "monde-bbc",
    media: "Monde - BBC",
    backgroundColor: "#1C1940",
    headerColor: "#FFFFFF",
    items: []
  },
  {
    id: "monde-cnn",
    media: "Monde - CNN",
    backgroundColor: "#1C1940",
    headerColor: "#FFFFFF",
    items: []
  },
  {
    id: "monde-aljazeera",
    media: "Monde - Al Jazeera",
    backgroundColor: "#1C1940",
    headerColor: "#FFFFFF",
    items: []
  },
  {
    id: "monde-nytimes",
    media: "Monde - New York Times",
    backgroundColor: "#1C1940",
    headerColor: "#FFFFFF",
    items: []
  },
  {
    id: "monde-guardian",
    media: "Monde - The Guardian",
    backgroundColor: "#1C1940",
    headerColor: "#FFFFFF",
    items: []
  },
  {
    id: "monde-ft",
    media: "Monde - Financial Times",
    backgroundColor: "#1C1940",
    headerColor: "#FFFFFF",
    items: []
  },
  {
    id: "monde-bloomberg",
    media: "Monde - Bloomberg",
    backgroundColor: "#1C1940",
    headerColor: "#FFFFFF",
    items: []
  },
  {
    id: "monde-wsj",
    media: "Monde - Wall Street Journal",
    backgroundColor: "#1C1940",
    headerColor: "#FFFFFF",
    items: []
  }
];
