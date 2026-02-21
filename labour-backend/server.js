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
  password: 'root',
  database: 'labour_app'
});

db.connect((err) => {
  if (err) console.error('❌ DB Error:', err.message);
  else console.log('✅ DB Connected');
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

// ====================================================
// 🔐 AUTH
// ====================================================

app.post('/register', async (req, res) => {
  const { role, name, email, password, address, contact } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    const insertData = [role, name, email, hashed, address, contact];

    db.query(
      `INSERT INTO users (role, name, email, password, address, contact, is_active)
       VALUES (?, ?, ?, ?, ?, ?, true)`,
      insertData,
      (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: "Registration successful" });
      }
    );

  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const loginData = [email];

  db.query("SELECT * FROM users WHERE email = ?", loginData, async (err, results) => {

    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(401).json({ message: "User not found" });

    const user = results[0];

    if (!user.is_active)
      return res.status(403).json({ message: "Account banned" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      "secretkey",
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      name: user.name
    });
  });
});

// ====================================================
// 👑 ADMIN
// ====================================================

app.get('/admin/users', verifyToken, (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: "Forbidden" });

  db.query(
    "SELECT id, name, email, role, is_active FROM users WHERE role != 'admin'",
    (err, results) => res.json(results)
  );
});

app.post('/admin/toggle-status', verifyToken, (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: "Forbidden" });

  const { userId, isActive } = req.body;
  const updateData = [isActive, userId];

  db.query(
    "UPDATE users SET is_active = ? WHERE id = ?",
    updateData,
    () => res.json({ message: "Status updated" })
  );
});

// ====================================================
// 🔎 SEARCH WORKERS
// ====================================================

app.post('/search-workers', verifyToken, (req, res) => {
  const { category, location } = req.body;
  const searchData = [category];

  const sql = `
    SELECT u.id as user_id, u.name, u.address, u.contact,
           l.skill, l.experience, l.rating, l.age, l.gender, l.is_available
    FROM users u
    JOIN labourers l ON u.id = l.user_id
    WHERE l.skill = ? AND l.is_available = true
  `;

  db.query(sql, searchData, (err, results) => {
    if (err) return res.status(500).json({ message: "Search error" });
    res.json(results);
  });
});

// ====================================================
// 📅 BOOKINGS
// ====================================================

app.post('/book-worker', verifyToken, (req, res) => {
  const { labourerId, serviceType, date, address } = req.body;
  const bookData = [req.user.id, labourerId, serviceType, date, address];

  const sql = `
    INSERT INTO bookings (user_id, labourer_id, service_type, booking_date, address, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `;

  db.query(sql, bookData, () => res.json({ message: "Request sent" }));
});

app.get('/user-bookings', verifyToken, (req, res) => {
  const queryData = [req.user.id];

  const sql = `
    SELECT b.*, u.name as labourer_name
    FROM bookings b
    JOIN users u ON b.labourer_id = u.id
    WHERE b.user_id = ?
    ORDER BY b.id DESC
  `;

  db.query(sql, queryData, (err, results) => res.json(results));
});

// ====================================================
// 🛠 LABOURER
// ====================================================

app.post('/toggle-availability', verifyToken, (req, res) => {
  const { status } = req.body;
  const toggleData = [status, req.user.id];

  db.query(
    `UPDATE labourers SET is_available = ? WHERE user_id = ?`,
    toggleData,
    () => res.json({ message: "Availability updated" })
  );
});

app.get('/labourer-requests', verifyToken, (req, res) => {
  const queryData = [req.user.id];

  const sql = `
    SELECT b.*, u.name as user_name
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    WHERE b.labourer_id = ?
    ORDER BY b.id DESC
  `;

  db.query(sql, queryData, (err, results) => res.json(results));
});

app.post('/respond-booking', verifyToken, (req, res) => {
  const { bookingId, status } = req.body;
  const respondData = [status, bookingId];

  db.query(
    `UPDATE bookings SET status = ? WHERE id = ?`,
    respondData,
    () => res.json({ message: "Updated" })
  );
});

app.listen(3000, () =>
  console.log('🚀 Server running on port 3000')
);

// --- NEW PRO ADMIN FEATURES ---

// 1. Get Dashboard Stats
app.get('/admin/stats', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Forbidden" });
  
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM users WHERE role='user') as total_users,
      (SELECT COUNT(*) FROM users WHERE role='labourer') as total_labourers,
      (SELECT COUNT(*) FROM bookings WHERE status='pending' OR status='confirmed') as active_bookings,
      (SELECT COUNT(*) * 500 FROM bookings WHERE status='confirmed') as total_revenue
  `;
  db.query(sql, (err, results) => {
    if(err) return res.status(500).json({message: "Error fetching stats"});
    res.json(results[0]);
  });
});

// 2. Delete User
app.post('/admin/delete-user', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Forbidden" });
  db.query("DELETE FROM users WHERE id = ?", [req.body.userId], (err) => {
    if(err) return res.status(500).json({message: "Error deleting user"});
    res.json({message: "User deleted"});
  });
});

// 3. Get All Bookings
app.get('/admin/bookings', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Forbidden" });
  const sql = `
    SELECT b.id, b.service_type, b.status, b.booking_date, b.address, 
           u1.name as user_name, u2.name as labourer_name 
    FROM bookings b 
    JOIN users u1 ON b.user_id = u1.id 
    JOIN users u2 ON b.labourer_id = u2.id
    ORDER BY b.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if(err) return res.status(500).json({message: "Error fetching bookings"});
    res.json(results);
  });
});

// 4. Admin Update Booking Status
app.post('/admin/update-booking', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Forbidden" });
  db.query("UPDATE bookings SET status = ? WHERE id = ?", [req.body.status, req.body.bookingId], (err) => {
    if(err) return res.status(500).json({message: "Error updating booking"});
    res.json({message: "Booking updated"});
  });
});