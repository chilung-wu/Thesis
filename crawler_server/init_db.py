import sqlite3

def create_db():
    connection = sqlite3.connect('users.db')
    cursor = connection.cursor()
    
    # 建立一個新表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        personal_id TEXT PRIMARY KEY,
        wallet_address TEXT NOT NULL,
        client_contract_address TEXT NOT NULL
    )
    ''')
    
    # 保存更改並關閉資料庫連接
    connection.commit()
    connection.close()

if __name__ == '__main__':
    create_db()
    print('資料庫和表已成功建立。')
