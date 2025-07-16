const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db'); // Your sqlite3 database instance
const bcrypt = require('bcryptjs'); // Import bcryptjs for password hashing

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Register a new user
app.post('/users', (req, res) => {
    const { username, password } = req.body; // Now expecting password

    if (!username || typeof username !== 'string' || username.trim() === '') {
        return res.status(400).json({ message: "Username cannot be empty." });
    }
    if (!password || typeof password !== 'string' || password.length < 6) { // Basic password validation
        return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    // Hash the password
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.error("Error hashing password:", err);
            return res.status(500).json({ message: "Internal server error during registration." });
        }

        // First, check if the username already exists
        db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                console.error("Database error during username check:", err);
                return res.status(500).json({ message: "Internal server error." });
            }

            if (row) { // If a row is returned, username exists
                console.log(`Attempt to register existing username: ${username}`);
                return res.status(409).json({ message: "Username already taken. Please choose a different one." });
            }

            // If username is unique, proceed with insertion
            db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash], function (err) {
                if (err) {
                    console.error("Database error during user insertion:", err);
                    if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE constraint failed')) {
                        return res.status(409).json({ message: "Username already taken. Please choose a different one." });
                    }
                    return res.status(500).json({ message: "Internal server error during registration." });
                }
                res.status(201).json({ id: this.lastID, username: username }); // 201 Created for new resource
            });
        });
    });
});

// Login Route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || typeof username !== 'string' || username.trim() === '') {
        return res.status(400).json({ message: "Username cannot be empty." });
    }
    if (!password || typeof password !== 'string') {
        return res.status(400).json({ message: "Password is required." });
    }

    db.get('SELECT id, username, password_hash FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.error("Database error during login lookup:", err);
            return res.status(500).json({ message: "Internal server error." });
        }

        if (!row) {
            // User not found
            return res.status(401).json({ message: "Invalid username or password." });
        }

        // Compare provided password with hashed password
        bcrypt.compare(password, row.password_hash, (err, result) => {
            if (err) {
                console.error("Error comparing passwords:", err);
                return res.status(500).json({ message: "Internal server error during login." });
            }

            if (result) {
                // Passwords match, login successful
                res.status(200).json({ id: row.id, username: row.username });
            } else {
                // Passwords do not match
                res.status(401).json({ message: "Invalid username or password." });
            }
        });
    });
});


// Get user by username (for frontend login logic, if 409, fetch user ID)
app.get('/users', (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: "Username query parameter is required." });
  }

  db.get('SELECT id, username FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error("Database error during user lookup:", err);
      return res.status(500).json({ message: "Internal server error." });
    }
    if (!row) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(row); // Returns { id: ..., username: ... }
  });
});


// Add a new habit - now accepts category and description
app.post('/habits', (req, res) => {
  const { user_id, habit_name, category, description } = req.body; // Added category, description

  if (!user_id || !habit_name || typeof habit_name !== 'string' || habit_name.trim() === '') {
      return res.status(400).json({ message: "User ID and habit name are required." });
  }

  db.run(
    'INSERT INTO habits (user_id, habit_name, category, description) VALUES (?, ?, ?, ?)', // Updated SQL
    [user_id, habit_name, category || null, description || null], // Pass category and description, default to null
    function (err) {
      if (err) {
          console.error("Error adding habit:", err);
          return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, user_id, habit_name, category, description }); // Return new fields
    }
  );
});

// Update a habit
app.put('/habits/:id', (req, res) => {
    const { id } = req.params;
    const { habit_name, category, description, user_id } = req.body; // user_id for authorization check

    if (!habit_name || typeof habit_name !== 'string' || habit_name.trim() === '') {
        return res.status(400).json({ message: "Habit name is required." });
    }

    db.run(
        'UPDATE habits SET habit_name = ?, category = ?, description = ? WHERE id = ? AND user_id = ?',
        [habit_name, category || null, description || null, id, user_id],
        function (err) {
            if (err) {
                console.error("Error updating habit:", err);
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: "Habit not found or unauthorized." });
            }
            res.json({ message: "Habit updated successfully." });
        }
    );
});

// Delete a habit
app.delete('/habits/:id', (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body; // user_id for authorization check

    db.run(
        'DELETE FROM habits WHERE id = ? AND user_id = ?',
        [id, user_id],
        function (err) {
            if (err) {
                console.error("Error deleting habit:", err);
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: "Habit not found or unauthorized." });
            }
            res.json({ message: "Habit deleted successfully." });
        }
    );
});


// Get all habits for a user - now returns category and description
app.get('/habits', (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
      return res.status(400).json({ message: "User ID is required." });
  }

  db.all(
    'SELECT id, user_id, habit_name, category, description, created_at FROM habits WHERE user_id = ?', // Updated SELECT
    [user_id],
    (err, rows) => {
      if (err) {
          console.error("Error fetching habits:", err);
          return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Log habit progress
app.post('/progress', (req, res) => {
  const { habit_id, date, status } = req.body;

  // Basic validation
  if (!habit_id || !date || typeof status === 'undefined') {
      return res.status(400).json({ message: "Habit ID, date, and status are required." });
  }

  db.run(
    'INSERT INTO progress (habit_id, date, status) VALUES (?, ?, ?)',
    [habit_id, date, status],
    function (err) {
      if (err) {
          console.error("Error logging progress:", err);
          // Check for unique constraint violation on habit_id, date
          if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE constraint failed')) {
              return res.status(409).json({ message: "Progress for this habit already logged for this date." });
          }
          return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, habit_id, date, status }); // 201 Created
    }
  );
});

// Update a progress entry
app.put('/progress/:id', (req, res) => {
    const { id } = req.params;
    const { date, status, habit_id } = req.body; // habit_id for authorization/validation

    if (!date || typeof status === 'undefined') {
        return res.status(400).json({ message: "Date and status are required." });
    }

    db.run(
        'UPDATE progress SET date = ?, status = ? WHERE id = ? AND habit_id = ?',
        [date, status, id, habit_id],
        function (err) {
            if (err) {
                console.error("Error updating progress:", err);
                if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ message: "A progress entry for this habit already exists on this date." });
                }
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: "Progress entry not found or unauthorized." });
            }
            res.json({ message: "Progress updated successfully." });
        }
    );
});

// Delete a progress entry
app.delete('/progress/:id', (req, res) => {
    const { id } = req.params;
    const { habit_id } = req.body; // habit_id for authorization/validation

    db.run(
        'DELETE FROM progress WHERE id = ? AND habit_id = ?',
        [id, habit_id],
        function (err) {
            if (err) {
                console.error("Error deleting progress:", err);
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: "Progress entry not found or unauthorized." });
            }
            res.json({ message: "Progress deleted successfully." });
        }
    );
});


// Get all progress for a habit
app.get('/progress', (req, res) => {
  const { habit_id } = req.query;

  if (!habit_id) {
      return res.status(400).json({ message: "Habit ID is required." });
  }

  db.all(
    'SELECT * FROM progress WHERE habit_id = ?',
    [habit_id],
    (err, rows) => {
      if (err) {
          console.error("Error fetching progress:", err);
          return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});


const PORT = 3001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));