const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

const db = new sqlite3.Database('huddleData.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the database.');
        createTable();
        createUsersTable();
        createTeamsTable();
    }
});

function createTable() {
    db.run(`CREATE TABLE IF NOT EXISTS huddleData (
        userName TEXT NOT NULL,
        date DATE NOT NULL,
        userTeam TEXT NOT NULL,
        capacity INTEGER,
        wellbeing INTEGER,
        upskilling INTEGER,
        knowledgeTransfer INTEGER,
        goal1 TEXT,
        goal2 TEXT,
        goal3 TEXT,
        goal4 TEXT,
        goal5 TEXT,
        PRIMARY KEY (userName, date, userTeam)
    )`, (err) => {
        if (err) {
            console.error('Error creating Data table:', err.message);
        } else {
            console.log('Data Table created/loaded successfully.');
        }
    });
}

function createUsersTable() {
    db.run(`CREATE TABLE IF NOT EXISTS huddleUsers (
        userName TEXT NOT NULL,
        userTeam TEXT NOT NULL,
        PRIMARY KEY (userName, userTeam)
    )`, (err) => {
        if (err) {
            console.error('Error creating Users table:', err.message);
        } else {
            console.log('Users Table created/loaded successfully.');
        }
    });
}

function createTeamsTable() {
    db.run(`CREATE TABLE IF NOT EXISTS huddleTeams (
        userTeam TEXT NOT NULL PRIMARY KEY,
		userTeamName TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Error creating Teams table:', err.message);
        } else {
            console.log('Teams Table created/loaded successfully.');
        }
    });
}

app.post('/submit', (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }
    const { userName, date, userTeam, capacity, wellbeing, upskilling, knowledgeTransfer, goal1, goal2, goal3, goal4, goal5 } = req.body;
    db.run('INSERT OR REPLACE INTO huddleData (userName, date, userTeam, capacity, wellbeing, upskilling, knowledgeTransfer, goal1, goal2, goal3, goal4, goal5) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userName, date, userTeam, capacity, wellbeing, upskilling, knowledgeTransfer, goal1, goal2, goal3, goal4, goal5],
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
    if (req.method !== 'GET') {
        return res.status(405).send('Method Not Allowed');
    }
    const { userName, date, userTeam } = req.query;
    db.get('SELECT * FROM huddleData WHERE userName = ? AND date = ? AND userTeam = ?', [userName, date, userTeam], (err, row) => {
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

app.use('/teams', async (req, res) => {
    if (req.method === 'GET') {
        db.all("SELECT * FROM huddleTeams ORDER BY userTeamName ASC", (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            } else {
                res.json(rows);
            }
        });
    } else if (req.method === 'POST') {
        const data = req.body;
        try {
            for (const obj of data) {
                await new Promise((resolve, reject) => {
                    db.run('INSERT OR REPLACE INTO huddleTeams (userTeam, userTeamName) VALUES (?, ?)', [obj.userTeam, obj.userTeamName], (err) => {
                        if (err) {
                            console.error(err);
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            }
            res.sendStatus(200);
        } catch (err) {
            res.status(500).send('Error adding team(s)');
        }
    } else if (req.method === 'DELETE') {
        const data = req.body;
        try {
            for (const obj of data) {
                await new Promise((resolve, reject) => {
                    db.run('DELETE FROM huddleTeams WHERE userTeam = ?', obj.userTeam, (err) => {
                        if (err) {
                            console.error(err);
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            }
            res.sendStatus(200);
        } catch (err) {
            res.status(500).send('Error deleting team(s)');
        }
    } else {
        res.status(405).send('Method Not Allowed');
    }
});

app.use('/users', (req, res) => {
    if (req.method === 'POST') {
        const { userNames, userTeam } = req.body;
        if (!Array.isArray(userNames) || userNames.length === 0) {
            return res.status(400).send('Invalid request format. Please provide an array of usernames.');
        }
        const placeholders = userNames.map(() => '(?, ?)').join(', ');
        const values = userNames.flatMap(name => [name.trim(), userTeam]);
        db.run(`INSERT OR REPLACE INTO huddleUsers (userName, userTeam) VALUES ${placeholders}`, values,
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
        const { userNames, userTeam } = req.body;
        if (!Array.isArray(userNames) || userNames.length === 0) {
            return res.status(400).send('Invalid request format. Please provide an array of usernames.');
        }
        const placeholders = userNames.map(() => '?').join(', ');
        db.run(`DELETE FROM huddleUsers WHERE userName IN (${placeholders}) AND userTeam = ?`, [...userNames, userTeam],
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
        const { userTeam } = req.query;
        db.all("SELECT * FROM huddleUsers WHERE userTeam = ? ORDER BY userName ASC", userTeam, (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            } else {
                const userNames = rows.map(row => row.userName);
                res.json({userNames: userNames});
            }
        });
    } else {
        res.status(405).send('Method Not Allowed');
    }
});

app.use('/metrics', (req, res) => {
    if (req.method === 'GET') {
        const { userTeam, start, end } = req.query;
        db.all('SELECT * FROM huddleData WHERE userTeam = ? AND date BETWEEN ? AND ?;', [userTeam, start, end], (err, rows) => {
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
