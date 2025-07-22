const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
    constructor() {
        this.dbPath = process.env.DATABASE_PATH || './database/dig-brasil.db';
        this.ensureDirectoryExists();
        this.db = new sqlite3.Database(this.dbPath, (err) => {
            if (err) {
                console.error('❌ Erro ao conectar com o banco de dados:', err.message);
            } else {
                console.log('✅ Conectado ao banco de dados SQLite');
                this.initializeTables();
            }
        });
    }

    ensureDirectoryExists() {
        const dir = path.dirname(this.dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    initializeTables() {
        const tables = [
            // Configurações do servidor
            `CREATE TABLE IF NOT EXISTS guild_configs (
                guild_id TEXT PRIMARY KEY,
                verification_channel TEXT,
                verification_role TEXT,
                ticket_category TEXT,
                ticket_logs TEXT,
                logs_channel TEXT,
                automod_enabled INTEGER DEFAULT 0,
                antiraid_enabled INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Sistema de verificação
            `CREATE TABLE IF NOT EXISTS verifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                verified_by TEXT
            )`,

            // Sistema de tickets
            `CREATE TABLE IF NOT EXISTS tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                channel_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                category TEXT NOT NULL,
                status TEXT DEFAULT 'open',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                closed_at DATETIME,
                closed_by TEXT
            )`,

            // Sistema de ponto
            `CREATE TABLE IF NOT EXISTS time_cards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                action TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                session_id TEXT
            )`,

            // Sistema de moderação
            `CREATE TABLE IF NOT EXISTS moderation_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                moderator_id TEXT NOT NULL,
                action TEXT NOT NULL,
                reason TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME
            )`,

            // Sistema de avisos
            `CREATE TABLE IF NOT EXISTS warnings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                moderator_id TEXT NOT NULL,
                reason TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Sistema de sugestões
            `CREATE TABLE IF NOT EXISTS suggestions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                content TEXT NOT NULL,
                message_id TEXT,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Logs gerais
            `CREATE TABLE IF NOT EXISTS bot_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT,
                user_id TEXT,
                action TEXT NOT NULL,
                details TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        tables.forEach(table => {
            this.db.run(table, (err) => {
                if (err) {
                    console.error('❌ Erro ao criar tabela:', err.message);
                }
            });
        });
    }

    // Métodos para configurações
    async getGuildConfig(guildId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM guild_configs WHERE guild_id = ?',
                [guildId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row || {});
                }
            );
        });
    }

    async setGuildConfig(guildId, config) {
        return new Promise((resolve, reject) => {
            const keys = Object.keys(config);
            const values = Object.values(config);
            const placeholders = keys.map(() => '?').join(', ');
            const updates = keys.map(key => `${key} = ?`).join(', ');

            this.db.run(
                `INSERT OR REPLACE INTO guild_configs (guild_id, ${keys.join(', ')}) 
                 VALUES (?, ${placeholders})`,
                [guildId, ...values],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }

    // Métodos para verificação
    async addVerification(guildId, userId, verifiedBy = null) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO verifications (guild_id, user_id, verified_by) VALUES (?, ?, ?)',
                [guildId, userId, verifiedBy],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    // Métodos para tickets
    async createTicket(guildId, channelId, userId, category) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO tickets (guild_id, channel_id, user_id, category) VALUES (?, ?, ?, ?)',
                [guildId, channelId, userId, category],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    async closeTicket(channelId, closedBy) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE tickets SET status = "closed", closed_at = CURRENT_TIMESTAMP, closed_by = ? WHERE channel_id = ?',
                [closedBy, channelId],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }

    // Métodos para ponto
    async addTimeCard(guildId, userId, action, sessionId = null) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO time_cards (guild_id, user_id, action, session_id) VALUES (?, ?, ?, ?)',
                [guildId, userId, action, sessionId],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    async getTimeCards(guildId, userId, limit = 50) {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM time_cards WHERE guild_id = ? AND user_id = ? ORDER BY timestamp DESC LIMIT ?',
                [guildId, userId, limit],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                }
            );
        });
    }

    // Métodos para avisos
    async addWarning(guildId, userId, moderatorId, reason) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)',
                [guildId, userId, moderatorId, reason],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    async getWarnings(guildId, userId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC',
                [guildId, userId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                }
            );
        });
    }

    async removeWarning(warningId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'DELETE FROM warnings WHERE id = ?',
                [warningId],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }

    // Método para logs
    async addLog(guildId, userId, action, details = null) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO bot_logs (guild_id, user_id, action, details) VALUES (?, ?, ?, ?)',
                [guildId, userId, action, details],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    close() {
        this.db.close((err) => {
            if (err) {
                console.error('❌ Erro ao fechar banco de dados:', err.message);
            } else {
                console.log('✅ Conexão com banco de dados fechada');
            }
        });
    }
}

module.exports = new Database();