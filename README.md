##Evm Ripper - Ethereum Transaction Tracer

Evm Ripper is a Next.js application that traces Ethereum transactions for a given address using the Etherscan API and visualizes them as an interactive force-directed graph. The graph displays nodes (Ethereum addresses) and edges (transactions), with each edge showing the transaction time and ETH value.

##Features

Ethereum Transaction Tracing:
Fetch transactions for a specified Ethereum address using the Etherscan API.

Interactive Graph Visualization:
Visualize transaction data with react-force-graph-2d, complete with node and edge interactions.
Click on a node to copy the address to your clipboard and open its details on Etherscan.

Detailed Edge Labels:
Each edge displays the transaction's time and ETH value.

CSV Export:
Easily export the transaction data as a CSV file for further analysis.


##How to Use

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
