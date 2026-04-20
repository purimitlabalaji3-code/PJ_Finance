// server/index.js — local development only, calls app.listen()
import app from './app.js';

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ PJ Finance API running on http://localhost:${PORT}`));
