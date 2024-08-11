from web3 import Web3
from dotenv import load_dotenv
import os
load_dotenv()
ALCHEMY_API_KEY = os.getenv("ALCHEMY_API_KEY")
INFURA_API_KEY = os.getenv("INFURA_API_KEY")
print(f"ALCHEMY_API_KEY: {ALCHEMY_API_KEY}")
# infura sepolia testnet dns error, use goerli testnet or use Alchemy sepolia testnet
url = f'https://goerli.infura.io/v3/{INFURA_API_KEY}'
alchemy_url = f"https://eth-sepolia.g.alchemy.com/v2/{ALCHEMY_API_KEY}"

# # w3 = Web3(Web3.HTTPProvider(url))
w3 = Web3(Web3.HTTPProvider(alchemy_url))

if w3.is_connected():
    print("Connected to alchemy sepolia Testnet")
else:
    print("Failed to connect")
