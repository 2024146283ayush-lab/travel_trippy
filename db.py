import sqlite3
import os

DB_FILE = 'travel_trippy.db'

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database and creates the conversations table if it doesn't exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prompt TEXT NOT NULL,
            response TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()
    print("Database and 'conversations' table initialized successfully.")

def save_conversation(prompt, response):
    """Saves a conversation turn into the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO conversations (prompt, response) VALUES (?, ?)',
        (prompt, response)
    )
    conn.commit()
    row_id = cursor.lastrowid
    conn.close()
    return row_id

def load_conversations():
    """Loads all saved conversation turns from the database ordered by timestamp desc."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT id, prompt, response, timestamp FROM conversations ORDER BY timestamp DESC')
    rows = cursor.fetchall()
    conn.close()
    
    conversations = []
    for row in rows:
        conversations.append({
            'id': row['id'],
            'prompt': row['prompt'],
            'response': row['response'],
            'timestamp': row['timestamp']
        })
    return conversations

if __name__ == '__main__':
    init_db()
