const fs = require('fs');
let content = fs.readFileSync('index.js', 'utf8');

const newFunction = `
exports.adminManageData = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'GET, POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
  }

  try {
      const { password, action, courseId, courseData, specId, specData } = req.body;

      if (password !== 'admin123') {
          return res.status(401).json({ error: 'Unauthorized. Invalid admin password.' });
      }

      if (action === 'addCourse') {
          if (!courseId || !courseData) return res.status(400).json({ error: 'Missing course data' });
          await db.collection("courses").doc(courseId.toLowerCase()).set(courseData, { merge: true });
          return res.json({ success: true, message: 'Course added/updated successfully!' });
      } 
      else if (action === 'addSpecialization') {
          if (!courseId || !specId || !specData) return res.status(400).json({ error: 'Missing specialization data' });
          await db.collection("courses").doc(courseId.toLowerCase())
            .collection("specializations").doc(specId.toLowerCase())
            .set(specData, { merge: true });
          return res.json({ success: true, message: 'Specialization added/updated successfully!' });
      } 
      else {
          return res.status(400).json({ error: 'Invalid action specified.' });
      }
  } catch (error) {
      console.error("Admin Manage Data Error:", error);
      res.status(500).json({ error: 'Internal server error.' });
  }
});
`;

if (!content.includes('exports.adminManageData')) {
    content += newFunction;
    fs.writeFileSync('index.js', content);
    console.log('Successfully appended adminManageData');
} else {
    console.log('Already exists');
}
