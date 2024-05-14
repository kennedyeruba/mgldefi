const dotenv = require('dotenv');
const mysql2 = require('mysql2/promise');

dotenv.config();

class DBConnection {
    constructor(config) {
        this.pool = mysql2.createPool(config);
        this.query = this.query.bind(this);
        this.addListeners();
    }

    addListeners() {
        this.pool.on('connection', () => {
            console.log('Database connected!');
        });

        this.pool.on('error', (err) => {
            const customErrorMessages = {
                'PROTOCOL_CONNECTION_LOST': 'Database connection was closed.',
                'ER_CON_COUNT_ERROR': 'Database has too many connections.',
                'ECONNREFUSED': 'Database connection was refused.'
            };
            
            console.error('Database connection error:', customErrorMessages[err.code] || err.message);
        });
    }

    async query(sql, values) {
        try {
            const [rows, fields] = await this.pool.execute(sql, values);
            return rows;
        } catch (error) {
            const mysqlErrorList = Object.keys(HttpStatusCodes);
            // convert mysql errors which in the mysqlErrorList list to http status code
            error.status = mysqlErrorList.includes(error.code) ? HttpStatusCodes[error.code] : error.status;
            throw error;
        }
    }

    async close() {
        try {
            // Close the database connection pool
            await this.pool.end();
            console.log('[Database connection] pool closed.');
        } catch (error) {
            console.error('Error closing database connection pool:', error);
            throw error;
        }
    }
}

// like ENUM
const HttpStatusCodes = Object.freeze({
    ER_TRUNCATED_WRONG_VALUE_FOR_FIELD: 422,
    ER_DUP_ENTRY: 409
});

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
}

module.exports = new DBConnection(config);