const functions = require("firebase-functions");
const { WebhookClient } = require("dialogflow-fulfillment");
const fetch = require("node-fetch");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const nodemailer = require("nodemailer");
require("dotenv").config();

const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(
  async (req, res) => {

    const queryText = req.body.queryResult && req.body.queryResult.queryText 
      ? req.body.queryResult.queryText.toLowerCase() : "";

    const generalKeywords = ["best", "top", "india", "world", "compare", "vs", "which is better", "rank"];
    if (generalKeywords.some(kw => queryText.includes(kw))) {
      return res.json({
        fulfillmentText: "[TRIGGER_AI]"
      });
    }

    const agent = new WebhookClient({
      request: req,
      response: res
    });

    /* ───────────────────────────── */
    /* 🎓 COURSE DETAILS */
    /* ───────────────────────────── */

    async function courseDetails(agent) {

      const spec = agent.parameters.specialization;

      if (!spec) {
        return aiResponse(agent);
      }

      const courseId = agent.parameters.course || "btech";
      const doc = await db
        .collection("courses")
        .doc(courseId.toLowerCase())
        .collection("specializations")
        .doc(spec.toLowerCase())
        .get();

      if (!doc.exists) {
        return aiResponse(agent);
      }

      const data = doc.data();

      agent.add(
        `📘 ${spec.toUpperCase()} Details\n\n` +
        `• ${data.description}`
      );
    }

    /* ───────────────────────────── */
    /* 📘 COURSE FOLLOWUP */
    /* ───────────────────────────── */

    async function courseFollowup(agent) {

      const spec = agent.parameters.specialization;

      if (!spec) {
        return aiResponse(agent);
      }

      const courseId = agent.parameters.course || "btech";
      const doc = await db
        .collection("courses")
        .doc(courseId.toLowerCase())
        .collection("specializations")
        .doc(spec.toLowerCase())
        .get();

      if (!doc.exists) {
        return aiResponse(agent);
      }

      const data = doc.data();

      agent.add(
        `📘 ${spec.toUpperCase()} Details\n\n` +
        `• ${data.description}`
      );
    }

    /* ───────────────────────────── */
    /* 📚 SPECIALIZATIONS */
    /* ───────────────────────────── */

    async function specialization(agent) {

      const course = agent.parameters.course || "btech";

      const snapshot = await db
        .collection("courses")
        .doc(course)
        .collection("specializations")
        .get();

      if (snapshot.empty) {
        agent.add("No specializations found.");
        return;
      }

      let specs = [];

      snapshot.forEach(doc => {
        specs.push(doc.id.toUpperCase());
      });

      agent.add(
        `🎓 ${course.toUpperCase()} offers these specializations:\n\n• ${specs.join("\n• ")}`
      );
    }

    /* ───────────────────────────── */
    /* 💰 FEES */
    /* ───────────────────────────── */

    async function askFees(agent) {

      const spec = agent.parameters.specialization;

      if (!spec) {
        return aiResponse(agent);
      }

      const courseId = agent.parameters.course || "btech";
      const doc = await db
        .collection("courses")
        .doc(courseId.toLowerCase())
        .collection("specializations")
        .doc(spec.toLowerCase())
        .get();

      if (!doc.exists) {
        return aiResponse(agent);
      }

      const data = doc.data();

      agent.add(
        `💰 ${spec.toUpperCase()} Fees\n\n` +
        `• Total Fees: ₹${data.fees}`
      );
    }

    /* ───────────────────────────── */
    /* 💰 FEES FOLLOWUP */
    /* ───────────────────────────── */

    async function feesFollowup(agent) {

      const spec = agent.parameters.specialization;

      if (!spec) {
        return aiResponse(agent);
      }

      const courseId = agent.parameters.course || "btech";
      const doc = await db
        .collection("courses")
        .doc(courseId.toLowerCase())
        .collection("specializations")
        .doc(spec.toLowerCase())
        .get();

      if (!doc.exists) {
        return aiResponse(agent);
      }

      const data = doc.data();

      agent.add(
        `💰 ${spec.toUpperCase()} Fees\n\n` +
        `• Total Fees: ₹${data.fees}`
      );
    }

    /* ───────────────────────────── */
    /* 🎯 PLACEMENTS */
    /* ───────────────────────────── */

    async function askPlacements(agent) {

      const spec = agent.parameters.specialization;

      if (!spec) {
        return aiResponse(agent);
      }

      const courseId = agent.parameters.course || "btech";
      const doc = await db
        .collection("courses")
        .doc(courseId.toLowerCase())
        .collection("specializations")
        .doc(spec.toLowerCase())
        .get();

      if (!doc.exists) {
        return aiResponse(agent);
      }

      const data = doc.data();

      agent.add(
        `🎯 ${spec.toUpperCase()} Placements\n\n` +
        `• 📊 Average Package: ${data.avgPackage}\n` +
        `• 🏆 Highest Package: ${data.highestPackage}\n` +
        `• 🏢 Recruiters: ${data.recruiters}\n` +
        `• 🚀 ${data.placements}`
      );
    }

    /* ───────────────────────────── */
    /* 🎯 PLACEMENT FOLLOWUP */
    /* ───────────────────────────── */

    async function placementFollowup(agent) {

      const spec = agent.parameters.specialization;

      if (!spec) {
        return aiResponse(agent);
      }

      const courseId = agent.parameters.course || "btech";
      const doc = await db
        .collection("courses")
        .doc(courseId.toLowerCase())
        .collection("specializations")
        .doc(spec.toLowerCase())
        .get();

      if (!doc.exists) {
        return aiResponse(agent);
      }

      const data = doc.data();

      agent.add(
        `🎯 ${spec.toUpperCase()} Placements\n\n` +
        `• 📊 Average Package: ${data.avgPackage}\n` +
        `• 🏆 Highest Package: ${data.highestPackage}\n` +
        `• 🏢 Recruiters: ${data.recruiters}\n` +
        `• 🚀 ${data.placements}`
      );
    }

    /* ───────────────────────────── */
    /* 🎓 ADMISSION */
    /* ───────────────────────────── */

    async function askAdmission(agent) {

      const course = agent.parameters.course;

      if (!course) {
        return aiResponse(agent);
      }

      const doc = await db
        .collection("courses")
        .doc(course.toLowerCase())
        .get();

      if (!doc.exists) {
        return aiResponse(agent);
      }

      const data = doc.data();

      agent.add(
        `🎓 Admission Process for ${data.name}\n\n` +
        `• ${data.admission}`
      );
    }

    /* ───────────────────────────── */
    /* 🎓 ADMISSION FOLLOWUP */
    /* ───────────────────────────── */

    async function admissionFollowup(agent) {

      const course = agent.parameters.course;

      if (!course) {
        return aiResponse(agent);
      }

      const doc = await db
        .collection("courses")
        .doc(course.toLowerCase())
        .get();

      if (!doc.exists) {
        return aiResponse(agent);
      }

      const data = doc.data();

      agent.add(
        `🎓 Admission Process for ${data.name}\n\n` +
        `• ${data.admission}`
      );
    }

    /* ───────────────────────────── */
    /* 🤖 AI FALLBACK */
    /* ───────────────────────────── */

    let cachedUniversityContext = null;
    let contextCacheTime = 0;

    async function getUniversityContext() {
        if (cachedUniversityContext && (Date.now() - contextCacheTime) < 1000 * 60 * 60) {
            return cachedUniversityContext;
        }

        let context = "University Context:\n";
        
        try {
            const coursesSnapshot = await db.collection("courses").get();
            if (!coursesSnapshot.empty) {
                for (const courseDoc of coursesSnapshot.docs) {
                    const courseData = courseDoc.data();
                    context += `Course: ${courseDoc.id.toUpperCase()}\n`;
                    if (courseData.admission) context += `Admission: ${courseData.admission}\n\n`;
                    
                    const specsSnapshot = await db.collection("courses").doc(courseDoc.id).collection("specializations").get();
                    if (!specsSnapshot.empty) {
                        context += "Available Specializations:\n";
                        specsSnapshot.forEach(specDoc => {
                            const specData = specDoc.data();
                            context += `- ${specDoc.id.toUpperCase()}: ${specData.description || ""}. Fees: ₹${specData.fees || "N/A"}. Placements: Avg ${specData.avgPackage || "N/A"}, Highest ${specData.highestPackage || "N/A"}. Recruiters: ${specData.recruiters || "N/A"}.\n`;
                        });
                    }
                    context += "\n";
                }
            }
            
            cachedUniversityContext = context;
            contextCacheTime = Date.now();
        } catch (err) {
            console.error("Error fetching context:", err);
        }

        return context;
    }

    async function aiResponse(agent) {
      agent.add("[TRIGGER_AI]");
    }

    /* ───────────────────────────── */
    /* 🎯 INTENT MAP */
    /* ───────────────────────────── */

    let intentMap = new Map();

    intentMap.set(
      "Course Details Intent",
      courseDetails
    );

    intentMap.set(
      "course-followup",
      courseFollowup
    );

    intentMap.set(
      "ask_specializations",
      specialization
    );

    intentMap.set(
      "ask_fees",
      askFees
    );

    intentMap.set(
      "fees-followup",
      feesFollowup
    );

    intentMap.set(
      "ask_placements",
      askPlacements
    );

    intentMap.set(
      "placement-followup",
      placementFollowup
    );

    intentMap.set(
      "ask_admission",
      askAdmission
    );

    intentMap.set(
      "admission-followup",
      admissionFollowup
    );

    intentMap.set(
      "Default Fallback Intent",
      aiResponse
    );

    intentMap.set(
      "Default Welcome Intent",
      (agent) => {
        agent.add(
          "👋 Welcome to UniversityBot!\n\nHow can I help you today?"
        );
      }
    );

    agent.handleRequest(intentMap);

  }
);
exports.askGemini = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'GET, POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
  }

  const userQuery = req.body.query;
  
  let context = "University Context:\n";
  try {
      const coursesSnapshot = await db.collection("courses").get();
      if (!coursesSnapshot.empty) {
          for (const courseDoc of coursesSnapshot.docs) {
              const courseData = courseDoc.data();
              context += `Course: ${courseDoc.id.toUpperCase()}\n`;
              if (courseData.admission) context += `Admission: ${courseData.admission}\n\n`;
              
              const specsSnapshot = await db.collection("courses").doc(courseDoc.id).collection("specializations").get();
              if (!specsSnapshot.empty) {
                  context += "Available Specializations:\n";
                  specsSnapshot.forEach(specDoc => {
                      const specData = specDoc.data();
                      context += `- ${specDoc.id.toUpperCase()}: ${specData.description || ""}. Fees: ₹${specData.fees || "N/A"}. Placements: Avg ${specData.avgPackage || "N/A"}, Highest ${specData.highestPackage || "N/A"}. Recruiters: ${specData.recruiters || "N/A"}.\n`;
                  });
              }
              context += "\n";
          }
      }
  } catch (err) {
      console.error("Error fetching context:", err);
  }

  try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: `You are UniHelp, a friendly and extremely versatile AI assistant for a university.\n\n[UNIVERSITY DATA]\n${context}\n[END UNIVERSITY DATA]\n\nINSTRUCTIONS:\n1. If the user asks about the university, use the [UNIVERSITY DATA] to answer accurately.\n2. If the user asks about ANYTHING ELSE, you MUST answer it normally and enthusiastically as a general AI. Do NOT refuse. Just answer the question!\n3. VERY IMPORTANT: If the user's prompt contains a hidden tag like "[Respond strictly in Kannada (ಕನ್ನಡ)]", you MUST translate all university data and your entire response into that exact language flawlessly.\n4. Always be helpful, friendly, and conversational.`
      });

      const result = await model.generateContent(userQuery);
      res.json({ reply: result.response.text() });
  } catch (error) {
      console.error("Gemini Error:", error);
      res.json({ reply: "Sorry, my AI brain failed to generate a response. Please try again." });
  }
});

exports.adminManageData = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
  }

  const { password, action, data } = req.body;

  if (password !== 'admin123') {
      res.status(403).json({ error: 'Unauthorized' });
      return;
  }

  try {
      if (action === 'addCourse') {
          const courseId = data.courseId.toLowerCase();
          await db.collection("courses").doc(courseId).set({
              name: data.name,
              admission: data.admission
          }, { merge: true });
          res.json({ success: true, message: 'Course updated successfully!' });
      } 
      else if (action === 'addSpecialization') {
          const courseId = data.courseId.toLowerCase();
          const specId = data.specId.toLowerCase();
          
          await db.collection("courses").doc(courseId).collection("specializations").doc(specId).set({
              description: data.description,
              fees: data.fees,
              avgPackage: data.avgPackage,
              highestPackage: data.highestPackage,
              recruiters: data.recruiters,
              placements: data.placements || "Excellent placement opportunities available."
          }, { merge: true });
          res.json({ success: true, message: 'Specialization updated successfully!' });
      } else {
          res.status(400).json({ error: 'Invalid action' });
      }
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
  }
});

exports.sendOtp = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
  }

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  try {
      await db.collection('otps').doc(email.toLowerCase()).set({ otp, expiresAt });

      const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
          }
      });

      const mailOptions = {
          from: `"UniHelp Admin" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Your UniHelp Login OTP',
          html: `<h3>Your One-Time Password is: <b style="color:#6366f1;">${otp}</b></h3><p>This code will expire in 5 minutes.</p>`
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ error: 'Failed to send email. Check credentials.' });
  }
});

exports.verifyOtp = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
  }

  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  try {
      const docRef = db.collection('otps').doc(email.toLowerCase());
      const doc = await docRef.get();

      if (!doc.exists) {
          return res.status(400).json({ error: 'No OTP found. Request a new one.' });
      }

      const data = doc.data();
      if (Date.now() > data.expiresAt) {
          return res.status(400).json({ error: 'OTP has expired. Request a new one.' });
      }

      if (data.otp === otp.toString().trim()) {
          await docRef.delete();
          return res.json({ success: true, message: 'OTP verified successfully' });
      } else {
          return res.status(400).json({ error: 'Invalid OTP. Try again.' });
      }
  } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ error: 'Internal server error' });
  }
});
