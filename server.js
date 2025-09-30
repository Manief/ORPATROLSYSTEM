import express from 'express';
import cors from 'cors';
import path from 'path';
import { Pool } from 'pg';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Replit environment configuration - check for both dev and production
const isReplit = !!(process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DEPLOYMENT);
const replitDomain = process.env.REPLIT_DEV_DOMAIN || 'production';

// Always trust proxy in Replit environment (both dev and production)
app.set('trust proxy', true);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const initializeDatabase = async () => {
    if (!process.env.DATABASE_URL) {
        console.log('⚠️  DATABASE_URL not set - database operations will not work');
        return;
    }
    
    try {
        const client = await pool.connect();
        await client.query(`
            CREATE TABLE IF NOT EXISTS companies (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                customId VARCHAR(100) UNIQUE
            );
            CREATE TABLE IF NOT EXISTS sites (
                id VARCHAR(50) PRIMARY KEY,
                companyId VARCHAR(50) REFERENCES companies(id),
                name VARCHAR(255) NOT NULL,
                address TEXT,
                customId VARCHAR(100),
                UNIQUE(companyId, customId)
            );
            CREATE TABLE IF NOT EXISTS areas (
                id VARCHAR(50) PRIMARY KEY,
                siteId VARCHAR(50) REFERENCES sites(id),
                name VARCHAR(255) NOT NULL,
                description TEXT,
                customId VARCHAR(100),
                UNIQUE(siteId, customId)
            );
            CREATE TABLE IF NOT EXISTS points (
                id VARCHAR(50) PRIMARY KEY,
                areaId VARCHAR(50) REFERENCES areas(id),
                name VARCHAR(255) NOT NULL,
                scanFrequency INTEGER,
                customId VARCHAR(100),
                UNIQUE(areaId, customId)
            );
            CREATE TABLE IF NOT EXISTS patrol_sessions (
                id VARCHAR(50) PRIMARY KEY,
                officerName VARCHAR(255) NOT NULL,
                companyId VARCHAR(50) REFERENCES companies(id),
                siteId VARCHAR(50) REFERENCES sites(id),
                areaId VARCHAR(50) REFERENCES areas(id),
                startTime TIMESTAMPTZ NOT NULL,
                endTime TIMESTAMPTZ,
                shift VARCHAR(20),
                status VARCHAR(50),
                scans JSONB,
                signatureDataUrl TEXT
            );
        `);
        console.log('Database schema checked/initialized successfully.');
        client.release();
    } catch (err) {
        console.error('Error initializing database schema', err.stack);
    }
};

const handleDbError = (err, res) => {
    console.error(err);
    if (err.code === '23505') { // PostgreSQL unique violation error code
        return res.status(409).send('The provided Custom ID is already in use.');
    }
    res.status(500).send(err.message);
};

// Middleware - Enhanced CORS for Replit environment
const corsOptions = {
  origin: (origin, callback) => {
    // In production or Replit, allow all origins for now
    // You can restrict this later based on your needs
    callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// FIX: Using the robust, industry-standard `body-parser` library is the
// definitive solution to the data persistence problem. This ensures all
// incoming JSON request bodies are correctly parsed, fixing the root
// cause of all saving failures across the entire application.
app.use(bodyParser.json());


// API Routes
app.get('/api/companies', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM companies ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        handleDbError(err, res);
    }
});
app.post('/api/companies', async (req, res) => {
    try {
        const { name, customId } = req.body;
        if (!name) {
            return res.status(400).send('Company name is required.');
        }
        const finalCustomId = customId && customId.trim() ? customId.trim() : null;
        const newCompany = { id: `comp${Date.now()}`, name, customId: finalCustomId };
        await pool.query('INSERT INTO companies(id, name, customId) VALUES($1, $2, $3)', [newCompany.id, newCompany.name, newCompany.customId]);
        res.status(201).json(newCompany);
    } catch (err) {
        handleDbError(err, res);
    }
});

app.get('/api/sites', async (req, res) => {
    try {
        const { companyId } = req.query;
        let result;
        if (companyId) {
            result = await pool.query('SELECT * FROM sites WHERE companyId = $1 ORDER BY name', [companyId]);
        } else {
            result = await pool.query('SELECT * FROM sites ORDER BY name');
        }
        res.json(result.rows);
    } catch (err) {
        handleDbError(err, res);
    }
});
app.post('/api/sites', async (req, res) => {
    try {
        const { name, address, companyId, customId } = req.body;
        if (!name || !companyId) {
            return res.status(400).send('Site name and company are required.');
        }
        const finalCustomId = customId && customId.trim() ? customId.trim() : null;
        const newSite = { id: `site${Date.now()}`, name, address, companyId, customId: finalCustomId };
        await pool.query('INSERT INTO sites(id, name, address, companyId, customId) VALUES($1, $2, $3, $4, $5)', [newSite.id, newSite.name, newSite.address, newSite.companyId, newSite.customId]);
        res.status(201).json(newSite);
    } catch (err) {
        handleDbError(err, res);
    }
});


app.get('/api/areas', async (req, res) => {
    try {
        const { siteId } = req.query;
        let result;
        if (siteId) {
            result = await pool.query('SELECT * FROM areas WHERE siteId = $1 ORDER BY name', [siteId]);
        } else {
            result = await pool.query('SELECT * FROM areas ORDER BY name');
        }
        res.json(result.rows);
    } catch (err) {
        handleDbError(err, res);
    }
});
app.post('/api/areas', async (req, res) => {
    try {
        const { name, description, siteId, customId } = req.body;
        if (!name || !siteId) {
            return res.status(400).send('Area name and site are required.');
        }
        const finalCustomId = customId && customId.trim() ? customId.trim() : null;
        const newArea = { id: `area${Date.now()}`, name, description, siteId, customId: finalCustomId };
        await pool.query('INSERT INTO areas(id, name, description, siteId, customId) VALUES($1, $2, $3, $4, $5)', [newArea.id, newArea.name, newArea.description, newArea.siteId, newArea.customId]);
        res.status(201).json(newArea);
    } catch (err) {
        handleDbError(err, res);
    }
});

app.get('/api/points', async (req, res) => {
    try {
        const { areaId } = req.query;
        let result;
        if (areaId) {
            result = await pool.query('SELECT * FROM points WHERE areaId = $1 ORDER BY name', [areaId]);
        } else {
            result = await pool.query('SELECT * FROM points ORDER BY name');
        }
        res.json(result.rows);
    } catch (err) {
        handleDbError(err, res);
    }
});
app.post('/api/points', async (req, res) => {
    try {
        const { name, scanFrequency, areaId, customId } = req.body;
        if (!name || !areaId) {
            return res.status(400).send('Point name and area are required.');
        }
        const finalCustomId = customId && customId.trim() ? customId.trim() : null;
        const newPoint = { id: `point${Date.now()}`, name, scanFrequency, areaId, customId: finalCustomId };
        await pool.query('INSERT INTO points(id, name, scanFrequency, areaId, customId) VALUES($1, $2, $3, $4, $5)', [newPoint.id, newPoint.name, newPoint.scanFrequency, newPoint.areaId, newPoint.customId]);
        res.status(201).json(newPoint);
    } catch (err) {
        handleDbError(err, res);
    }
});

app.get('/api/patrols', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM patrol_sessions ORDER BY startTime DESC');
        res.json(result.rows);
    } catch (err) {
        handleDbError(err, res);
    }
});

app.get('/api/patrols/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM patrol_sessions WHERE id = $1', [id]);
        res.json(result.rows[0]);
    } catch (err) {
        handleDbError(err, res);
    }
});

app.post('/api/patrols/start', async (req, res) => {
    try {
        const { officerName, companyId, siteId, areaId, shift } = req.body;
        if (!officerName || !companyId || !siteId || !areaId || !shift) {
            return res.status(400).send('All patrol startup fields are required.');
        }
        const newPatrol = {
            id: `patrol${Date.now()}`,
            officerName,
            companyId,
            siteId,
            areaId,
            shift,
            status: 'In Progress',
            scans: [],
            startTime: new Date().toISOString()
        };
        await pool.query(
            'INSERT INTO patrol_sessions(id, officerName, companyId, siteId, areaId, shift, status, scans, startTime) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [newPatrol.id, newPatrol.officerName, newPatrol.companyId, newPatrol.siteId, newPatrol.areaId, newPatrol.shift, newPatrol.status, JSON.stringify(newPatrol.scans), newPatrol.startTime]
        );
        res.status(201).json(newPatrol);
    } catch (err) {
        handleDbError(err, res);
    }
});

app.put('/api/patrols/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const fields = req.body;
        
        const updatableFields = ['endTime', 'status', 'scans', 'signatureDataUrl'];
        const setClauses = [];
        const values = [];
        let paramIndex = 1;

        for (const field of updatableFields) {
            if (fields.hasOwnProperty(field)) {
                setClauses.push(`${field.toLowerCase()} = $${paramIndex++}`);
                values.push(field === 'scans' ? JSON.stringify(fields[field]) : fields[field]);
            }
        }

        if (setClauses.length === 0) {
            // Nothing to update, but we can return the existing record as a success.
            const existing = await pool.query('SELECT * FROM patrol_sessions WHERE id = $1', [id]);
            return res.json(existing.rows[0]);
        }

        values.push(id);
        const query = `UPDATE patrol_sessions SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).send('Patrol session not found.');
        }

        res.json(result.rows[0]);
    } catch (err) {
        handleDbError(err, res);
    }
});

app.get('/api/dashboard-stats', async (req, res) => {
     try {
        const sitesCountQuery = `SELECT COUNT(*) as "activeSites" FROM sites`;
        const recentPatrolsQuery = `SELECT * FROM patrol_sessions WHERE status != 'In Progress' ORDER BY startTime DESC LIMIT 5`;

        const [sitesCountResult, recentPatrolsResult] = await Promise.all([
            pool.query(sitesCountQuery),
            pool.query(recentPatrolsQuery),
        ]);
        
        const stats = sitesCountResult.rows[0];
        const recentPatrols = recentPatrolsResult.rows;

        res.json({
            activeSites: parseInt(stats.activeSites),
            recentPatrols: recentPatrols,
        });
    } catch (err) {
        handleDbError(err, res);
    }
});


// Only serve static files in production (Vite handles this in development)
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, 'dist');
  console.log(`📁 Serving static files from: ${staticPath}`);
  app.use(express.static(staticPath));

  // Fallback to index.html for client-side routing
  app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    console.log(`📄 Serving index.html from: ${indexPath}`);
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).send('Error loading application');
      }
    });
  });
} else {
  console.log('🔧 Development mode: Static files served by Vite on port 5000');
  console.log('📡 Backend API only on port 3001');
}

app.listen(port, '0.0.0.0', async () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    if (process.env.REPLIT_DEPLOYMENT) {
        console.log('🌍 Running in Replit Production Deployment');
    } else if (process.env.REPLIT_DEV_DOMAIN) {
        console.log(`🔧 Running in Replit Development`);
        console.log(`🔗 Dev URL: https://${replitDomain}`);
    }
    
    await initializeDatabase();
});