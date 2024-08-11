from flask import Flask, request, jsonify
from web3 import Web3
from web3.middleware import geth_poa_middleware
from dotenv import load_dotenv
import pchome
import logging
import os
import json
import sqlite3
from flask import g
DATABASE = 'users.db'
load_dotenv(dotenv_path='../.env')

app = Flask(__name__)

# logging.basicConfig(filename='app.log', level=logging.DEBUG)

# test data
orders = [
  {'訂單編號': '20171111116972', '日期': '2017/11/11', '訂單狀態': '訂單成立', '總價': '$128', '付款': '信用卡一次付清', '配送狀態': '配送狀態', '產品名稱': 'ZMI 紫米 Type-C 傳輸充電線-100cm (AL701) 二入組', '物流資訊': '郵局 39323124205318'},
  {'訂單編號': '20170703537133', '日期': '2017/07/03', '訂單狀態': '訂單成立', '總價': '$727', '付款': '貨到付款', '配送狀態': '配送狀態', '產品名稱': 'USBX3 6A車用快充器-黑', '物流資訊': '郵局 48350510021554'},
  {'訂單編號': '20160212013687', '日期': '2016/02/12', '訂單狀態': '訂單成立', '總價': '$788', '付款': '7-11 ibon付款', '配送狀態': '配送狀態', '產品名稱': 'BUFFALO巴比祿 WHR-1166D 866+300Mbps 11ac 無線基地台', '物流資訊': '黑貓 9077491996'}
]

alchemy_api_key = os.getenv("ALCHEMY_API_KEY")
manager_private_key = os.getenv("MANAGER_PRIVATE_KEY")

# Load contract ABI 
with open('../src/abis/Management_OZ.json') as file:
    management_contract_abi = json.load(file)
with open('../src/abis/Client_OZ.json') as file:
    client_contract_abi = json.load(file)

alchemy_url = f"https://eth-sepolia.g.alchemy.com/v2/{alchemy_api_key}"

# Connect to your Ethereum node
w3 = Web3(Web3.HTTPProvider(alchemy_url))

# Inject the poa compatibility middleware to the innermost layer
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

# Check connection
if w3.is_connected():
    print("Connected to Sepolia Testnet")
else:
    print("Failed to connect")

management_contract_address = os.getenv("MANAGER_CONTRACT_ADDRESS_OZ")
management_contract_address = Web3.to_checksum_address(management_contract_address)

# contract instance
management_contract = w3.eth.contract(address=management_contract_address, abi=management_contract_abi)

manager_account = w3.eth.account.from_key(manager_private_key)
print(f'Manager account address: {manager_account.address}')
print(f'Manager contract address: {management_contract_address}')

# # Basic in-memory 'database' for the demo
# users = {}

# 定義一個函式來獲取資料庫連接
def get_db():
    # 嘗試從 Flask 的全局變數 g 中獲取一個資料庫連接
    db = getattr(g, '_database', None)
    if db is None:
        # 如果沒有可用的連接，則創建一個新的連接到指定的資料庫文件
        db = g._database = sqlite3.connect(DATABASE)
    return db

# 定義一個函式，當應用程式上下文結束時關閉資料庫連接
@app.teardown_appcontext
def close_connection(exception):
    # 從 Flask 的全局變數 g 中獲取資料庫連接
    db = getattr(g, '_database', None)
    if db is not None:
        # 如果連接存在，則關閉它
        db.close()

# 資料庫查詢example
"""
def query_db(query, args=(), one=False):
    # 通過 get_db 函式獲取資料庫連接，並執行 SQL 查詢
    cur = get_db().execute(query, args)
    # 獲取所有查詢結果
    rv = cur.fetchall()
    # 關閉查詢游標
    cur.close()
    # 如果 one 為真，則只返回一個結果；否則返回所有結果
    return (rv[0] if rv else None) if one else rv
"""

# 修改 query_db 函式返回字典而不是元組
def query_db(query, args=(), one=False, dict_result=False):
    cur = get_db().execute(query, args)
    if dict_result:
        rv = [dict((cur.description[i][0], value) 
                   for i, value in enumerate(row)) for row in cur.fetchall()]
    else:
        rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    personal_id = data['personal_id']
    client_wallet_address = data['wallet_address']

    # Check if the user already exists in the database
    user = query_db('SELECT * FROM users WHERE personal_id = ?', [personal_id], one=True)
    if user is not None:
        # 如果用戶已存在，返回錯誤訊息
        return jsonify({'error': 'User already registered'}), 400

    # Interact with the smart contract to create a new client contract
    nonce = w3.eth.get_transaction_count(manager_account.address)
    txn = management_contract.functions.createClientContract(client_wallet_address).build_transaction({
        'chainId': 11155111,  # sepolia testnet chain ID
        'gas': 2000000,
        'gasPrice': w3.to_wei('50', 'gwei'),
        'nonce': nonce,
    })
    # Sign the transaction
    signed_txn = w3.eth.account.sign_transaction(txn, private_key=manager_private_key)

    # Send the transaction
    txn_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    txn_receipt = w3.eth.wait_for_transaction_receipt(txn_hash)

    print(f'Transaction receipt: {txn_receipt}')

    for log in txn_receipt.logs:
        print(f'Log: {log}')

    # Assume the client contract address is emitted in an event
    client_contract_address = txn_receipt.logs[0]['address']

    # Store the new user with their personal ID and contract address
    db = get_db()
    db.execute('INSERT INTO users (personal_id, wallet_address, client_contract_address) VALUES (?, ?, ?)',
               [personal_id, client_wallet_address, client_contract_address])
    db.commit()

    return jsonify({'client_contract_address': client_contract_address}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    personal_id = data['personal_id']
    client_wallet_address = data['wallet_address']

    user = query_db('SELECT * FROM users WHERE personal_id = ? AND wallet_address = ?',
                    [personal_id, client_wallet_address], one=True, dict_result=True)
    if user is None:
        return jsonify({'error': 'Invalid login credentials'}), 401
    
    return jsonify({'client_contract_address': user['client_contract_address']}), 200

@app.route('/fetch_orders', methods=['POST'])
def fetch_orders():
    credentials_list = request.json
    orders = []
    for credentials in credentials_list:
        username = credentials.get('username')
        password = credentials.get('decryptedPassword')
        # print(f'username: {username}, password: {password}') 

        driver = pchome.init_webdriver()

        try:
            pchome.login(driver, pchome.login_url, username, password, pchome.home_url)
            pchome.navigate_to_orders(driver, pchome.order_url)
            orders += pchome.fetch_orders(driver)
        except Exception as e:
            print("An error occurred:", e)
        finally:
            driver.quit()
    return jsonify(orders), 200

# test request
@app.route('/getOrders', methods=['GET'])
def get_orders():
    print('\n***********Return Orders*********\n')
    return jsonify(orders)

# test request
@app.route('/hello', methods=['POST'])
def hello_world():
    data = request.json
    message = data['message']
    response_message = message + ", World!"
    return jsonify({'message': response_message})

# test request
@app.route('/hey', methods=['GET'])
def hey():
    return jsonify({'message': 'Hey there!'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)
