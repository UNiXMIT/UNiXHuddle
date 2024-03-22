const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

const db = new sqlite3.Database('huddleData.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
    createTable();
    createUsersTable();
});

function createTable() {
    db.run(`CREATE TABLE IF NOT EXISTS huddleData (
        userName TEXT NOT NULL,
        date DATE NOT NULL,
        capacity INTEGER,
        wellbeing INTEGER,
        upskilling INTEGER,
        knowledgeTransfer INTEGER,
        goal1 TEXT,
        goal2 TEXT,
        goal3 TEXT,
        goal4 TEXT,
        goal5 TEXT,
        PRIMARY KEY (userName, date)
    )`, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Data Table created/loaded successfully.');
        }
    });
}

function createUsersTable() {
    db.run(`CREATE TABLE IF NOT EXISTS huddleUsers (
        userName TEXT PRIMARY KEY
    )`, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Users Table created/loaded successfully.');
        }
    });
}

app.post('/submit', (req, res) => {
    const { userName, date, capacity, wellbeing, upskilling, knowledgeTransfer, goal1, goal2, goal3, goal4, goal5 } = req.body;
    db.run('INSERT OR REPLACE INTO huddleData (userName, date, capacity, wellbeing, upskilling, knowledgeTransfer, goal1, goal2, goal3, goal4, goal5) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userName, date, capacity, wellbeing, upskilling, knowledgeTransfer, goal1, goal2, goal3, goal4, goal5],
        (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error saving data');
            } else {
                res.sendStatus(200);
            }
        }
    );
});

app.get('/load', (req, res) => {
    const { userName, date } = req.query;
    db.get('SELECT * FROM huddleData WHERE userName = ? AND date = ?', [userName, date], (err, row) => {
        if (err) {
            console.error(err.message);
            res.sendStatus(500);
        } else {
            if (row) {
                res.json(row);
            } else {
                res.sendStatus(204);
            }
        }
    });
});

app.use('/users', (req, res) => {
    if (req.method === 'POST') {
        const { userNames } = req.body;
        if (!Array.isArray(userNames) || userNames.length === 0) {
            return res.status(400).send('Invalid request format. Please provide an array of usernames.');
        }
        const placeholders = userNames.map(() => '(?)').join(', ');
        db.run(`INSERT OR REPLACE INTO huddleUsers (userName) VALUES ${placeholders}`, userNames,
            (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error adding user(s)');
                } else {
                    res.sendStatus(200);
                }
            }
        );
    } else if (req.method === 'DELETE') {
        const { userNames } = req.body;
        if (!Array.isArray(userNames) || userNames.length === 0) {
            return res.status(400).send('Invalid request format. Please provide an array of usernames.');
        }
        const placeholders = userNames.map(() => '?').join(', ');
        db.run(`DELETE FROM huddleUsers WHERE userName IN (${placeholders})`, userNames,
            (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error deleting user(s)');
                } else {
                    res.sendStatus(200);
                }
            }
        );
    } else if (req.method === 'GET') {
        db.all("SELECT * FROM huddleUsers ORDER BY userName ASC", (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            } else {
                res.json(rows);
            }
        });
    } else {
        res.status(405).send('Method Not Allowed');
    }
});

app.use('/metrics', (req, res) => {
    if (req.method === 'GET') {
        const { start, end } = req.query;
        db.all('SELECT * FROM huddleData WHERE date BETWEEN ? AND ?;', [start, end], (err, rows) => {
            if (err) {
                console.error(err.message);
                res.sendStatus(500);
            } else {
                if (rows) {
                    res.json(rows);
                } else {
                    res.sendStatus(204);
                }
            }
        });
    } else {
        res.status(405).send('Method Not Allowed');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
