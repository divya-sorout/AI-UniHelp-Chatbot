const fs = require('fs');

let content = fs.readFileSync('index.js', 'utf8');

// Replace aiResponse implementation
const oldAiResponse = /async function aiResponse\(agent\) \{[\s\S]*?agent\.add\("AI error\. Try again\."\);\n\s*\}\n\s*\}/;
content = content.replace(oldAiResponse, `async function aiResponse(agent) {
      agent.add("[TRIGGER_AI]");
    }`);

// Append askGemini at the end
const newFunction = `
exports.askGemini = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'GET, POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
  }

  const userQuery = req.body.query;
  
  let context = "University Context:\\n";
  try {
      const coursesSnapshot = await db.collection("courses").get();
      if (!coursesSnapshot.empty) {
          for (const courseDoc of coursesSnapshot.docs) {
              const courseData = courseDoc.data();
              context += \`Course: \${courseDoc.id.toUpperCase()}\\n\`;
              if (courseData.admission) context += \`Admission: \${courseData.admission}\\n\\n\`;
              
              const specsSnapshot = await db.collection("courses").doc(courseDoc.id).collection("specializations").get();
              if (!specsSnapshot.empty) {
                  context += "Available Specializations:\\n";
                  specsSnapshot.forEach(specDoc => {
                      const specData = specDoc.data();
                      context += \`- \${specDoc.id.toUpperCase()}: \${specData.description || ""}. Fees: ₹\${specData.fees || "N/A"}. Placements: Avg \${specData.avgPackage || "N/A"}, Highest \${specData.highestPackage || "N/A"}. Recruiters: \${specData.recruiters || "N/A"}.\\n\`;
                  });
              }
              context += "\\n";
          }
      }
  } catch (err) {
      console.error("Error fetching context:", err);
  }

  try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: \`You are UniHelp, a friendly and extremely versatile AI assistant for a university.\\n\\n[UNIVERSITY DATA]\\n\${context}\\n[END UNIVERSITY DATA]\\n\\nINSTRUCTIONS:\\n1. If the user asks about the university, use the [UNIVERSITY DATA] to answer accurately.\\n2. If the user asks about ANYTHING ELSE, you MUST answer it normally and enthusiastically as a general AI. Do NOT refuse. Just answer the question!\\n3. VERY IMPORTANT: If the user's prompt contains a hidden tag like "[Respond strictly in Kannada (ಕನ್ನಡ)]", you MUST translate all university data and your entire response into that exact language flawlessly.\\n4. Always be helpful, friendly, and conversational.\`
      });

      const result = await model.generateContent(userQuery);
      res.json({ reply: result.response.text() });
  } catch (error) {
      console.error("Gemini Error:", error);
      res.json({ reply: "Sorry, my AI brain failed to generate a response. Please try again." });
  }
});
`;

if (!content.includes('exports.askGemini')) {
    content += newFunction;
}

fs.writeFileSync('index.js', content);
console.log('Successfully updated index.js with askGemini!');
