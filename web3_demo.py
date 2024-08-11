from web3 import Web3
from web3.middleware import geth_poa_middleware
from dotenv import load_dotenv
import os
import json

load_dotenv()
INFURA_API_KEY = os.getenv("INFURA_API_KEY")
ALCHEMY_API_KEY = os.getenv("ALCHEMY_API_KEY")
MANAGER_PRIVATE_KEY = os.getenv("MANAGER_PRIVATE_KEY")
CLIENT_WALLET_ADDRESS = os.getenv("CLIENT_WALLET_ADDRESS")
# CLIENT_CONTRACT_ADDRESS_OZ = os.getenv("CLIENT_CONTRACT_ADDRESS_OZ")
CLIENT_CONTRACT_ADDRESS_OZ = '0x36da178AEC137CA7C86AE718A4daF39d19402E72'

# Load contract ABI
with open('./src/abis/Client_OZ.json') as file:
    contract_abi = json.load(file)

# Connection to the Sepolia Testnet
url = f'https://sepolia.infura.io/v3/{INFURA_API_KEY}'
alchemy_url = f"https://eth-sepolia.g.alchemy.com/v2/{ALCHEMY_API_KEY}"

# w3 = Web3(Web3.HTTPProvider(url))
w3 = Web3(Web3.HTTPProvider(alchemy_url))

# Inject the poa compatibility middleware to the innermost layer
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

# Check connection
if w3.is_connected():
    print("Connected to Sepolia Testnet")
else:
    print("Failed to connect")

# # Your account's private key (NEVER hardcode this in production code)
private_key = MANAGER_PRIVATE_KEY

# ABI and address of the contract
contract_address = Web3.to_checksum_address(CLIENT_CONTRACT_ADDRESS_OZ)

# Create the contract instance
contract = w3.eth.contract(address=contract_address, abi=contract_abi)

# Account to use for the transaction
account = w3.eth.account.from_key(MANAGER_PRIVATE_KEY)

# Data to upload
data = [{"encryptedPassword": "U2FsdGVkX18ut6RpQS380LNRkpOmVG9YoGdyVPZDJgE=", "id": "0", "password": "aaa", "salt": "34fe00bb9aaa7b4c35b5d20f517e355c", "username": "aaa", "website": "PChome"}, {"encryptedPassword": "U2FsdGVkX19AmpELV3f8aPm0vTgBa7HU9Rbo4v860kQ=", "id": "1", "salt": "c940a187950081e12c5912dcaff0cb86", "username": "bbb", "website": "PChome"}]
data_to_upload = json.dumps(data)
print(data_to_upload)
# # data_to_upload = "BBBBB Your JSON Data Here"

# # Build transaction
# transaction = contract.functions.uploadData(data_to_upload).build_transaction({
#     'chainId': 11155111,  # Chain ID for Sepolia
#     'gas': 2000000,
#     'gasPrice': w3.to_wei('50', 'gwei'),
#     # 'nonce': w3.eth.get_transaction_count(CLIENT_WALLET_ADDRESS),
#     'nonce': w3.eth.get_transaction_count(account.address),
# })

# # Sign the transaction
# signed_txn = w3.eth.account.sign_transaction(transaction, private_key=private_key)

# # Send the transaction
# txn_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)

# # Wait for transaction to be mined...
# print(f"Transaction hash: {txn_hash.hex()}")

# # Optionally, wait for the transaction receipt
# receipt = w3.eth.wait_for_transaction_receipt(txn_hash)
# print(f"Transaction receipt: {receipt}")
# # for i in receipt:
# #     print(i)