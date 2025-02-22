"use client";
import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { forceCollide } from "d3-force";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export default function EthTracer() {
  const [address, setAddress] = useState("");
  const [apiKey] = useState(process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || "");
  const [maxDepth, setMaxDepth] = useState(3);
  const [useAutoDepth, setUseAutoDepth] = useState(false);
  const [daysLimit, setDaysLimit] = useState();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const fgRef = useRef(null);

  const isValidEthAddress = (addr) =>
    /^(0x)?[0-9a-fA-F]{40}$/.test(addr);

  const fetchTransactions = async (address, depth = 0, visited = new Set()) => {
    if (depth > maxDepth && !useAutoDepth) return [];
    if (visited.has(address.toLowerCase())) return [];
    visited.add(address.toLowerCase());
    const response = await fetch(
      `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`
    );
    const data = await response.json();
    if (data.status !== "1") return [];
    const currentTime = Date.now() / 1000;
    const cutoff = currentTime - daysLimit * 86400;
    const outgoing = data.result.filter(
      (tx) =>
        tx.from.toLowerCase() === address.toLowerCase() &&
        tx.isError === "0" &&
        parseInt(tx.timeStamp) >= cutoff
    );
    const results = [];
    for (const tx of outgoing) {
      const ethValue = (parseInt(tx.value) / 1e18).toFixed(4);
      const timeStr = new Date(parseInt(tx.timeStamp) * 1000).toLocaleString();
      results.push({
        from: tx.from,
        to: tx.to,
        value: ethValue,
        hash: tx.hash,
        time: timeStr, // Added time property for display
      });
      if (useAutoDepth || depth < maxDepth) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const childTxs = await fetchTransactions(tx.to, depth + 1, visited);
        results.push(...childTxs);
      }
    }
    return results;
  };

  const handleTrace = async () => {
    if (!isValidEthAddress(address)) {
      alert("Please enter a valid Ethereum address");
      return;
    }
    if (!apiKey) {
      alert("API key not available");
      return;
    }
    setLoading(true);
    try {
      const transactions = await fetchTransactions(address);
      const nodes = new Map();
      const links = [];
      transactions.forEach((tx) => {
        if (!nodes.has(tx.from)) {
          nodes.set(tx.from, {
            id: tx.from,
            label: `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`,
            sent: 0,
            received: 0,
          });
        }
        if (!nodes.has(tx.to)) {
          nodes.set(tx.to, {
            id: tx.to,
            label: `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`,
            sent: 0,
            received: 0,
          });
        }
        nodes.get(tx.from).sent += parseFloat(tx.value);
        nodes.get(tx.to).received += parseFloat(tx.value);
        links.push({
          source: tx.from,
          target: tx.to,
          value: tx.value,
          hash: tx.hash,
          time: tx.time, // Include time in link data for the edge label
        });
      });
      
      // Group links by source-target so that multiple transactions between the same nodes get their own offsets
      const linkGroups = {};
      links.forEach(link => {
        const key = `${link.source}->${link.target}`;
        if (!linkGroups[key]) linkGroups[key] = [];
        linkGroups[key].push(link);
      });
      Object.values(linkGroups).forEach(group => {
        group.forEach((link, i) => {
          link.multilineIndex = i;
          link.multilineCount = group.length;
        });
      });
      
      setGraphData({ nodes: Array.from(nodes.values()), links });
      setTimeout(() => {
        if (fgRef.current && fgRef.current.zoomToFit) {
          fgRef.current.zoomToFit(400, 20);
        }
      }, 100);
    } catch (error) {
      console.error("Tracing error:", error);
      alert("Error tracing transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!graphData.nodes.length && !graphData.links.length) {
      alert("No data to export.");
      return;
    }
    const header =
      "Address,Short Address,Total Sent (ETH),Total Received (ETH),Transaction Hashes";
    const rows = graphData.nodes.map((n) => {
      const hashes = graphData.links
        .filter((l) => l.source === n.id || l.target === n.id)
        .map((l) => l.hash)
        .join(";");
      return `${n.id},${n.label},${n.sent},${n.received},"${hashes}"`;
    });
    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eth-tracer-data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white w-full flex flex-col">
      <Head>
        <title>ETH Transfer Tracer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Ethereum transaction tracer by sku11ster" />
      </Head>
      <main className="container mx-auto px-4 py-6 max-w-4xl flex-grow overflow-auto">
        <h1 className="text-4xl font-extrabold text-center mb-8">Evm Ripper</h1>
        <div className="bg-gray-900 p-4 md:p-6 rounded-3xl shadow-lg">
          <div className="flex flex-col md:flex-row gap-3 md:gap-6">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ethereum address (0x...)"
              className="flex-1 bg-gray-800 text-white p-3 md:p-4 rounded-3xl"
            />
            <input
              type="number"
              value={daysLimit}
              onChange={(e) => setDaysLimit(Number(e.target.value))}
              placeholder="Days Limit"
              className="flex-1 bg-gray-800 text-white p-3 md:p-4 rounded-3xl"
            />
            <button
              onClick={handleTrace}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold p-3 md:p-4 rounded-3xl shadow-lg"
            >
              {loading ? "Tracing..." : "Start Tracing"}
            </button>
            <button
              onClick={handleExportCSV}
              disabled={loading || (!graphData.nodes.length && !graphData.links.length)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold p-3 md:p-4 rounded-3xl shadow-lg"
            >
              Export CSV
            </button>
          </div>
        </div>
        <div
          className="bg-gray-900 p-4 rounded-3xl shadow-lg mt-6 w-full overflow-hidden"
          style={{ height: "clamp(400px, 60vh, 800px)" }}
        >
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
            </div>
          ) : (
            <ForceGraph2D
              ref={(el) => { fgRef.current = el; }}
              graphData={graphData}
              nodeLabel={(node) =>
                `${node.label}\nSent: ${node.sent} ETH\nReceived: ${node.received} ETH`
              }
              nodeAutoColorBy={() => "blue"}
              linkDirectionalArrowLength={4}
              linkCurvature={0.2}
              linkColor={() => "rgba(255,255,255,0.4)"}
              linkWidth={1}
              warmupTicks={100}
              cooldownTime={1500}
              pauseAnimation={true}
              d3Force={(force) => {
                force.force("charge").strength(-150);
                force.force("collide", forceCollide(10));
              }}
              // Draw edge labels with a perpendicular offset based on the multiline index
              linkCanvasObject={(link, ctx, globalScale) => {
                const text = `${link.time} - ${link.value} ETH`;
                const start = link.source;
                const end = link.target;
                // Compute the midpoint of the link
                const midX = start.x + (end.x - start.x) / 2;
                const midY = start.y + (end.y - start.y) / 2;
                // Compute perpendicular offset vector
                const dx = end.x - start.x;
                const dy = end.y - start.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                const baseOffset = 10; // base offset in pixels
                let offsetMultiplier = 0;
                if (link.multilineCount && link.multilineCount > 1) {
                  offsetMultiplier = link.multilineIndex - (link.multilineCount - 1) / 2;
                }
                const offset = baseOffset * offsetMultiplier;
                let offsetX = 0, offsetY = 0;
                if (len !== 0) {
                  offsetX = (-dy / len) * offset;
                  offsetY = (dx / len) * offset;
                }
                const labelX = midX + offsetX;
                const labelY = midY + offsetY;
                ctx.save();
                ctx.fillStyle = "rgba(255,255,255,0.8)";
                ctx.font = `${Math.max(2, 4 / globalScale)}px Sans-Serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(text, labelX, labelY);
                ctx.restore();
              }}
              linkCanvasObjectMode={() => "after"}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const size = Math.max(3, 6 / globalScale);
                ctx.fillStyle = "#3B82F6";
                ctx.beginPath();
                ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = "white";
                ctx.font = `${Math.max(3, 5 / globalScale)}px Arial`;
                ctx.textAlign = "center";
                ctx.fillText(node.label, node.x, node.y + size + 8);
              }}
              onNodeClick={(node) => {
                navigator.clipboard.writeText(node.id).then(() => {
                  alert(`Copied address: ${node.id}`);
                });
                window.open(`https://etherscan.io/address/${node.id}`, "_blank");
              }}
              onLinkClick={(link) => {
                window.open(`https://etherscan.io/tx/${link.hash}`, "_blank");
              }}
            />
          )}
        </div>
      </main>
      <footer className="bg-gray-900 text-gray-500 text-xs sm:text-sm py-4 pb-2 w-full text-center">
        Made by{" "}
        <a
          href="https://x.com/0xsku11ster"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300"
        >
          sku11ster
        </a>
      </footer>
    </div>
  );
}
