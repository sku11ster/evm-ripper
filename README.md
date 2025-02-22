Evm Ripper - Ethereum Transaction Tracer
Evm Ripper is a Next.js application that traces Ethereum transactions for a given address using the Etherscan API and visualizes them as an interactive force-directed graph. The graph displays nodes (Ethereum addresses) and edges (transactions), with each edge showing the transaction time and ETH value.

Features

Ethereum Transaction Tracing:
Fetch transactions for a specified Ethereum address using the Etherscan API.

Interactive Graph Visualization:
Visualize transaction data with react-force-graph-2d, complete with node and edge interactions.
Click on a node to copy the address to your clipboard and open its details on Etherscan.

Detailed Edge Labels:
Each edge displays the transaction's time and ETH value.

CSV Export:
Easily export the transaction data as a CSV file for further analysis.

Prerequisites
Node.js (v12 or later)
npm or yarn
Installation
Clone the repository:

bash
Copy
Edit
git clone https://github.com/yourusername/evm-ripper.git
cd evm-ripper
Install dependencies:

bash
Copy
Edit
npm install
# or
yarn install
Configuration
Create a .env.local file in the root directory and add your Etherscan API key:

env
Copy
Edit
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_api_key_here
Running the App
Start the development server:

bash
Copy
Edit
npm run dev
# or
yarn dev
Open your browser and navigate to http://localhost:3000 to see the application in action.

How to Use
Enter an Ethereum Address:
Type an Ethereum address (starting with 0x) in the provided input field.

Set Days Limit:
Specify the number of days to limit the transactions fetched from the blockchain.

Start Tracing:
Click the Start Tracing button to fetch transactions and build the graph.


Technologies Used
Next.js: React framework for server-side rendering and static site generation.
React: JavaScript library for building user interfaces.
react-force-graph-2d: Library for creating interactive, force-directed graphs.
D3-force: Used for graph layout calculations.
Etherscan API: To fetch Ethereum transaction data.
