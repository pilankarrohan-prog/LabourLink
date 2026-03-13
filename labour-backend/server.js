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

function formatBookingDate(date) {
  if (!date || typeof date !== 'string') return null;

  const formatted = date.trim().replace('T', ' ');
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(formatted)) {
    return null;
  }

  return formatted.length === 16 ? `${formatted}:00` : formatted;
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

// ================= USER BOOKINGS & REVIEWS =================
app.get('/user-bookings', verifyToken, (req, res) => {
  const sql = `
    SELECT b.*, u.name as labourer_name, u.contact as labourer_contact 
    FROM bookings b 
    JOIN labourers l ON b.labourer_id = l.user_id 
    JOIN users u ON l.user_id = u.id 
    WHERE b.user_id = ? ORDER BY b.id DESC
  `;
  db.query(sql,[req.user.id], (err, results) => res.json(results ||[]));
});

app.post('/add-review', verifyToken, (req, res) => {
  const { labourerId, rating, comment } = req.body;
  db.query(`INSERT INTO reviews (user_id, labourer_id, rating, comment, created_at) VALUES (?, ?, ?, ?, NOW())`,[req.user.id, labourerId, rating, comment], 
    (err) => {
      if (err) return res.status(500).json(err);
      db.query(`UPDATE labourers SET rating = (SELECT AVG(rating) FROM reviews WHERE labourer_id = ?) WHERE user_id = ?`,[labourerId, labourerId]);
      res.json({ message: "Review added successfully!" });
    }
  );
});

app.get('/labourer-reviews', verifyToken, (req, res) => {
  const sql = `SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.labourer_id = ? ORDER BY r.created_at DESC`;
  db.query(sql, [req.user.id], (err, results) => res.json(results ||[]));
});

// ================= USER PROFILE SETTINGS =================
app.get('/user-profile', verifyToken, (req, res) => {
  db.query(`SELECT name, email, address, contact FROM users WHERE id = ?`, [req.user.id], (err, results) => res.json(results[0]));
});

app.post('/save-user-profile', verifyToken, async (req, res) => {
  const { name, address, contact, password } = req.body;
  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    db.query(`UPDATE users SET name=?, address=?, contact=?, password=? WHERE id=?`, [name, address, contact, hashed, req.user.id]);
  } else {
    db.query(`UPDATE users SET name=?, address=?, contact=? WHERE id=?`,[name, address, contact, req.user.id]);
  }
  res.json({ message: "Profile updated successfully" });
});

// ================= SEARCH & BOOKING =================
app.post('/search-workers', verifyToken, (req, res) => {
  const { category, location, date } = req.body;
  const trimmedLocation = location?.trim();

  if (!category || !trimmedLocation) {
    return res.status(400).json({ message: "Category and location are required" });
  }

  const formattedDate = date ? formatBookingDate(date) : null;
  if (date && !formattedDate) {
    return res.status(400).json({ message: "Invalid date format" });
  }

  let sql = `
    SELECT u.id as id, u.id as user_id, u.name, u.address, u.contact, l.skill, l.experience, l.rating, l.age, l.gender
    FROM users u JOIN labourers l ON u.id = l.user_id
    WHERE u.is_active = true
      AND l.skill = ?
      AND LOWER(TRIM(u.address)) LIKE LOWER(?)
      AND l.is_available = true
  `;

  const params = [category, `%${trimmedLocation}%`];

  if (formattedDate) {
    sql += `
      AND NOT EXISTS (
        SELECT 1
        FROM bookings b
        WHERE b.labourer_id = u.id
          AND b.booking_date = ?
          AND b.status IN ('pending', 'confirmed')
      )
    `;
    params.push(formattedDate);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Search Error", error: err.message });
    res.json(results);
  });
});

app.post('/book-worker', verifyToken, (req, res) => {
  const { labourerId, serviceType, date, address } = req.body;
  
  if (!labourerId) return res.status(400).json({ message: "Worker ID is missing in database!" });
  if (!date) return res.status(400).json({ message: "Date is missing!" });

  const formattedDate = formatBookingDate(date);
  if (!formattedDate) return res.status(400).json({ message: "Invalid date format" });

  const availabilitySql = `
    SELECT u.id
    FROM users u JOIN labourers l ON u.id = l.user_id
    WHERE u.id = ?
      AND u.is_active = true
      AND l.is_available = true
      AND NOT EXISTS (
        SELECT 1
        FROM bookings b
        WHERE b.labourer_id = u.id
          AND b.booking_date = ?
          AND b.status IN ('pending', 'confirmed')
      )
  `;

  db.query(availabilitySql, [labourerId, formattedDate], (availabilityErr, workers) => {
    if (availabilityErr) {
      return res.status(500).json({ message: "Availability check failed", error: availabilityErr.message });
    }

    if (workers.length === 0) {
      return res.status(409).json({ message: "This worker is no longer available for the selected time." });
    }

    const sql = `INSERT INTO bookings (user_id, labourer_id, service_type, booking_date, address, status) VALUES (?, ?, ?, ?, ?, 'pending')`;

    db.query(sql, [req.user.id, labourerId, serviceType, formattedDate, address], (err) => {
      if (err) return res.status(500).json({ message: "Database Error", error: err.message });
      res.json({ message: "Request sent successfully" });
    });
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

app.get('/labourer-profile', verifyToken, (req, res) => {
  if (req.user.role !== 'labourer') {
    return res.status(403).json({ message: "Worker access only" });
  }

  const sql = `
    SELECT u.name, u.address, u.contact, l.skill, l.experience, l.rating, l.age, l.gender, l.is_available
    FROM users u JOIN labourers l ON u.id = l.user_id
    WHERE u.id = ?
    LIMIT 1
  `;

  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Profile load failed", error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Worker profile not found" });
    res.json(results[0]);
  });
});

app.post('/save-labourer-profile', verifyToken, (req, res) => {
  const { name, address, contact, skill, experience, age, gender } = req.body;
  db.query(`UPDATE users SET name=?, address=?, contact=? WHERE id=?`, [name, address, contact, req.user.id], () => {
    db.query(`UPDATE labourers SET skill=?, experience=?, age=?, gender=? WHERE user_id=?`, [skill, experience, age, gender, req.user.id], () => res.json({ message: "Saved" }));
  });
});

app.listen(3000, () => console.log('🚀 Server running on port 3000'));

// ==========================================
//             ADMIN ROUTES
// ==========================================

// Get Dashboard Statistics
app.get('/admin/stats', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access only" });

  const stats = { total_users: 0, total_labourers: 0, active_bookings: 0, total_revenue: 0 };

  db.query("SELECT COUNT(*) as count FROM users WHERE role = 'user'", (err, results) => {
    if (!err) stats.total_users = results[0].count;

    db.query("SELECT COUNT(*) as count FROM labourers", (err, results) => {
      if (!err) stats.total_labourers = results[0].count;

      db.query("SELECT COUNT(*) as count FROM bookings WHERE status IN ('pending', 'confirmed')", (err, results) => {
        if (!err) stats.active_bookings = results[0].count;
        
        // Mock revenue calculation based on active bookings
        stats.total_revenue = stats.active_bookings * 550; 
        res.json(stats);
      });
    });
  });
});

// Get All Users
app.get('/admin/users', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access only" });
  
  db.query("SELECT id, name, email, role, is_active FROM users ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json(results ||[]);
  });
});

// Get All Bookings
app.get('/admin/bookings', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access only" });
  
  const sql = `
    SELECT b.id, b.service_type, b.booking_date, b.status, 
           u1.name as user_name, u2.name as labourer_name
    FROM bookings b
    LEFT JOIN users u1 ON b.user_id = u1.id
    LEFT JOIN labourers l ON b.labourer_id = l.user_id
    LEFT JOIN users u2 ON l.user_id = u2.id
    ORDER BY b.id DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json(results ||[]);
  });
});

// Toggle User Ban/Active Status
app.post('/admin/toggle-status', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access only" });
  
  db.query("UPDATE users SET is_active = ? WHERE id = ?",[req.body.isActive, req.body.userId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User status updated successfully" });
  });
});

// Delete User completely (safely clearing child tables to prevent foreign key crashes)
app.post('/admin/delete-user', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access only" });
  
  const uid = req.body.userId;
  // Nested queries to delete foreign-key constraints safely
  db.query("DELETE FROM reviews WHERE user_id = ? OR labourer_id = ?", [uid, uid], () => {
    db.query("DELETE FROM bookings WHERE user_id = ? OR labourer_id = ?", [uid, uid], () => {
      db.query("DELETE FROM labourers WHERE user_id = ?",[uid], () => {
        db.query("DELETE FROM users WHERE id = ?", [uid], (err) => {
          if (err) return res.status(500).json(err);
          res.json({ message: "User permanently deleted" });
        });
      });
    });
  });
});

// Update Booking Status manually
app.post('/admin/update-booking', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access only" });
  
  db.query("UPDATE bookings SET status = ? WHERE id = ?", [req.body.status, req.body.bookingId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Booking status updated" });
  });
});