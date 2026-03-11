const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',   // Make sure your DB password is correct
  database: 'labour_app'
});

db.connect((err) => {
  if (err) console.error('❌ DATABASE Error:', err.message);
  else console.log('✅ DATABASE Connected');
});

// ================= TOKEN MIDDLEWARE =================
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: "Token required" });

  jwt.verify(token, "secretkey", (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
}

// ================= AUTH =================
app.post('/register', async (req, res) => {
  const { role, name, email, password, address, contact } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const insertData =[role, name, email, hashed, address, contact];

    db.query(
      `INSERT INTO users (role, name, email, password, address, contact, is_active) VALUES (?, ?, ?, ?, ?, ?, true)`,
      insertData,
      (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        
        if (role === 'labourer') {
          db.query(`INSERT INTO labourers (user_id, skill, experience, rating, age, gender, is_available) VALUES (?, 'General', 0, 5, 18, 'Any', true)`, 
            [result.insertId], 
            () => res.json({ message: "Registration successful" })
          );
        } else {
          res.json({ message: "Registration successful" });
        }
      }
    );
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post('/login', (req, res) => {
  db.query("SELECT * FROM users WHERE email = ?", [req.body.email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ message: "User not found" });
    const user = results[0];
    if (!user.is_active) return res.status(403).json({ message: "Account banned" });

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id, role: user.role }, "secretkey", { expiresIn: "24h" });
    res.json({ message: "Login successful", token, role: user.role, name: user.name });
  });
});


// ================= SEARCH & BOOKING =================
app.post('/search-workers', verifyToken, (req, res) => {
  const { category, location } = req.body;
  // LOWER() guarantees that 'pune', 'Pune', and 'PUN' all match correctly
  const sql = `
    SELECT u.id as id, u.id as user_id, u.name, u.address, u.contact, l.skill, l.experience, l.rating, l.age, l.gender
    FROM users u JOIN labourers l ON u.id = l.user_id
    WHERE l.skill = ? AND LOWER(u.address) LIKE LOWER(?) AND l.is_available = true
  `;
  db.query(sql,[category, `%${location}%`], (err, results) => {
    if (err) return res.status(500).json({ message: "Search Error", error: err.message });
    res.json(results);
  });
});

app.post('/book-worker', verifyToken, (req, res) => {
  const { labourerId, serviceType, date, address } = req.body;
  
  if (!labourerId) return res.status(400).json({ message: "Worker ID is missing in database!" });
  if (!date) return res.status(400).json({ message: "Date is missing!" });

  const formattedDate = date.replace('T', ' ') + ':00';
  const sql = `INSERT INTO bookings (user_id, labourer_id, service_type, booking_date, address, status) VALUES (?, ?, ?, ?, ?, 'pending')`;
  
  db.query(sql, [req.user.id, labourerId, serviceType, formattedDate, address], (err, result) => {
    if (err) return res.status(500).json({ message: "Database Error", error: err.message });
    res.json({ message: "Request sent successfully" });
  });
});

// ================= LABOURER REQUESTS =================
app.get('/labourer-requests', verifyToken, (req, res) => {
  if (req.user.role !== 'labourer') {
    return res.status(403).json({ message: "⚠️ You are logged in as a User/Hirer! Please log in as the Worker." });
  }

  const sql = `
    SELECT b.*, COALESCE(u.name, 'Unknown User') as user_name 
    FROM bookings b 
    LEFT JOIN users u ON b.user_id = u.id 
    WHERE b.labourer_id = ? 
    ORDER BY b.id DESC
  `;
  
  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.post('/respond-booking', verifyToken, (req, res) => {
  db.query(`UPDATE bookings SET status = ? WHERE id = ?`,[req.body.status, req.body.bookingId], () => res.json({ message: "Updated" }));
});

app.post('/toggle-availability', verifyToken, (req, res) => {
  db.query(`UPDATE labourers SET is_available = ? WHERE user_id = ?`,[req.body.status, req.user.id], () => res.json({ message: "Availability updated" }));
});

app.post('/save-labourer-profile', verifyToken, (req, res) => {
  const { name, address, contact, skill, experience, age, gender } = req.body;
  db.query(`UPDATE users SET name=?, address=?, contact=? WHERE id=?`, [name, address, contact, req.user.id], () => {
    db.query(`UPDATE labourers SET skill=?, experience=?, age=?, gender=? WHERE user_id=?`, [skill, experience, age, gender, req.user.id], () => res.json({ message: "Saved" }));
  });
});

app.listen(3000, () => console.log('🚀 Server running on port 3000'));