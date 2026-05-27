import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

let aiClient: GoogleGenAI | null = null;

function getGenAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY environment variable is required. Please declare it in the Secrets panel."
      );
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. AI Tutor (Professor Chat bot)
app.post("/api/tutor", async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    const ai = getGenAI();

    const systemInstruction = 
      "너는 대학교 산업안전관리과 소속 'YUKWON' 교수이자 AI.DX전기안전 분야의 최고 권위 전문가이다.\n" +
      "대학생들을 진심으로 아끼고 가르치는 다정하면서도 학구적이고 위엄있는 교수님의 억양과 종결 어미(~란다, ~했습니다, ~구나, ~입니다)를 사용해라.\n" +
      "답변 중간에 친근한 노교수의 감탄사를 상황에 맞게 조금씩 넣어 위엄과 인자함을 보이거라.\n" +
      "답변은 전기에너지의 열역학적 거동(줄의 법칙 등)과 시스템 지능형 제어(스마트 ZCT 검출, 머신러닝 예지보전 등)에 기반하여 전문성 있게 하고, 줄바꿈을 활용하여 스캔하기 좋게 정리하여 답변해라.";

    const contents = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const turn of chatHistory) {
        contents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.text }]
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.8,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Tutor Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with the AI Tutor." });
  }
});

// 2. AI Quiz Generator
app.post("/api/quiz", async (req, res) => {
  try {
    const { topic } = req.body;
    const ai = getGenAI();

    const prompt = 
      `주제: [${topic}]\n` +
      `AI.DX 전기안전 교과목의 이 주제에 대하여 대학생 시험을 위한 깊이 있는 4지선다 객관식 문제 1개를 한국어로 생성해라.\n` +
      `답변은 반드시 아래 JSON 형식만을 따라야 한다. 절대 마크다운 블록(\`\`\`)을 달지 말고 오직 순수 JSON 자체만 출력해라.\n\n` +
      `{\n` +
      `  "question": "문제 제시문\\n① 보기1\\n② 보기2\\n③ 보기3\\n④ 보기4",\n` +
      `  "answer": "정답 번호 (예: ③)",\n` +
      `  "explanation": "해당 단원의 공학적 개념(예: 옴의 법칙, 줄의 법칙, 달지엘 수식 등)을 들어 자세하고 학술적으로 서술한 교수의 해설"\n` +
      `}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["question", "answer", "explanation"]
        }
      }
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Quiz Error:", error);
    res.status(500).json({ error: error.message || "Quiz generation failed." });
  }
});

// 3. AI Custom Inspection Checklist Generator
app.post("/api/checklist", async (req, res) => {
  try {
    const { scenario } = req.body;
    const ai = getGenAI();

    const prompt = 
      `산업현장 및 특별 시나리오: [${scenario}]\n` +
      `위 현장을 분석하여 전기설비 과열, 정전기 방전 불꽃, 누전, 감전 예방을 극대화하기 위해 AI.DX 스마트 안전관리 관점에서 5가지 고품질의 실무용 안전 점검 계획 체크리스트를 한국어로 상세히 작성해라.\n` +
      `각 항목은 구체적이고 바로 현장에 적용 가능해야 한다.\n` +
      `답변은 반드시 다음과 같은 JSON 자체만 출력해라. 마크다운 기호를 생략하고 오직 순수 JSON만 출력해라.\n\n` +
      `{\n` +
      `  "title": "점검 시나리오 명칭",\n` +
      `  "items": [\n` +
      `    "체크리스트 상세 정밀 점검 항목 1",\n` +
      `    "체크리스트 상세 정밀 점검 항목 2",\n` +
      `    "체크리스트 상세 정밀 점검 항목 3",\n` +
      `    "체크리스트 상세 정밀 점검 항목 4",\n` +
      `    "체크리스트 상세 정밀 점검 항목 5"\n` +
      `  ]\n` +
      `}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "items"]
        }
      }
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Checklist Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate checklist." });
  }
});

// 4. AI Vision Forensic Analysis
app.post("/api/vision", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Image data is required" });
    }
    const ai = getGenAI();

    const prompt = 
      "너는 수하 전기 화재 및 전기 감전 피해 조사 분야에서 30년 현장 경력을 보유한 국가공인 소방방재청 감식 수사관이자, " +
      "동원과학기술대학교 산업안전관리과의 명예 교수 'YUKWON'이다.\n" +
      "제공된 전기 설비, 전선, 콘센트 혹은 탄화 흔적 사진을 면밀히 판독하고, 이 사진이 지닌 잠재적 열공학적 결함이나 정전기 방전, " +
      "또는 과과전류에 의한 피복 탄화와 1차/2차 단락흔(용융 구리 구슬)의 특징을 분석해라.\n" +
      "감식 소견은 학구적이면서도 실무적인 어휘들(예: 주울열, 접촉저항 증가, 은화반응, 보이 스페이스 등)을 사용하여 총 4~5문장으로 깊이 있게 도출해주고, " +
      "이를 예방하기 위한 현실적인 스마트 센싱 및 시스템적 대책도 함께 한 문단 덧붙여 주거라.";

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: imageBase64
      }
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: {
        parts: [imagePart, textPart]
      }
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("Vision Error:", error);
    res.status(500).json({ error: error.message || "Forensic image analysis failed." });
  }
});

// 5. Setup Vite Middleware or Static Assets
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

start();
