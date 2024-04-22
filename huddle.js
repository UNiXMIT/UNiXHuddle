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
        createGroupsTable();
    }
});

function createTable() {
    db.run(`CREATE TABLE IF NOT EXISTS huddleData (
        userName TEXT NOT NULL,
        date DATE NOT NULL,
        userGroup TEXT NOT NULL,
        capacity INTEGER,
        wellbeing INTEGER,
        upskilling INTEGER,
        knowledgeTransfer INTEGER,
        goal1 TEXT,
        goal2 TEXT,
        goal3 TEXT,
        goal4 TEXT,
        goal5 TEXT,
        PRIMARY KEY (userName, date, userGroup)
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
        userGroup TEXT NOT NULL,
        PRIMARY KEY (userName, userGroup)
    )`, (err) => {
        if (err) {
            console.error('Error creating Users table:', err.message);
        } else {
            console.log('Users Table created/loaded successfully.');
        }
    });
}

function createGroupsTable() {
    db.run(`CREATE TABLE IF NOT EXISTS huddleGroups (
        userGroup TEXT NOT NULL PRIMARY KEY,
		userGroupName TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Error creating Groups table:', err.message);
        } else {
            console.log('Groups Table created/loaded successfully.');
        }
    });
}

app.post('/submit', (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }
    const { userName, date, userGroup, capacity, wellbeing, upskilling, knowledgeTransfer, goal1, goal2, goal3, goal4, goal5 } = req.body;
    db.run('INSERT OR REPLACE INTO huddleData (userName, date, userGroup, capacity, wellbeing, upskilling, knowledgeTransfer, goal1, goal2, goal3, goal4, goal5) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userName, date, userGroup, capacity, wellbeing, upskilling, knowledgeTransfer, goal1, goal2, goal3, goal4, goal5],
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
    const { userName, date, userGroup } = req.query;
    db.get('SELECT * FROM huddleData WHERE userName = ? AND date = ? AND userGroup = ?', [userName, date, userGroup], (err, row) => {
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

app.use('/groups', async (req, res) => {
    if (req.method === 'GET') {
        db.all("SELECT * FROM huddleGroups ORDER BY userGroupName ASC", (err, rows) => {
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
                    db.run('INSERT OR REPLACE INTO huddleGroups (userGroup, userGroupName) VALUES (?, ?)', [obj.userGroup, obj.userGroupName], (err) => {
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
            res.status(500).send('Error adding group(s)');
        }
    } else if (req.method === 'DELETE') {
        const data = req.body;
        try {
            for (const obj of data) {
                await new Promise((resolve, reject) => {
                    db.run('DELETE FROM huddleGroups WHERE userGroup = ?', obj.userGroup, (err) => {
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
            res.status(500).send('Error deleting group(s)');
        }
    } else {
        res.status(405).send('Method Not Allowed');
    }
});

app.use('/users', (req, res) => {
    if (req.method === 'POST') {
        const { userNames, userGroup } = req.body;
        if (!Array.isArray(userNames) || userNames.length === 0) {
            return res.status(400).send('Invalid request format. Please provide an array of usernames.');
        }
        const placeholders = userNames.map(() => '(?, ?)').join(', ');
        const values = userNames.flatMap(name => [name.trim(), userGroup]);
        db.run(`INSERT OR REPLACE INTO huddleUsers (userName, userGroup) VALUES ${placeholders}`, values,
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
        const { userNames, userGroup } = req.body;
        if (!Array.isArray(userNames) || userNames.length === 0) {
            return res.status(400).send('Invalid request format. Please provide an array of usernames.');
        }
        const placeholders = userNames.map(() => '?').join(', ');
        db.run(`DELETE FROM huddleUsers WHERE userName IN (${placeholders}) AND userGroup = ?`, [...userNames, userGroup],
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
        const { userGroup } = req.query;
        db.all("SELECT * FROM huddleUsers WHERE userGroup = ? ORDER BY userName ASC", userGroup, (err, rows) => {
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
        const { userGroup, start, end } = req.query;
        db.all('SELECT * FROM huddleData WHERE userGroup = ? AND date BETWEEN ? AND ?;', [userGroup, start, end], (err, rows) => {
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
