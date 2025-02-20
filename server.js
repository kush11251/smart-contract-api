require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const contractABI = require("./contractABI.json").abi; // Load contract ABI
const pdf = require("html-pdf");

const fs = require('fs');
const path = require('path');

const FormData = require("form-data");
const axios = require("axios");
const {
  generateHomeLoanAgreementHTML,
  generatePersonalLoanAgreementHTML,
} = require("./loanTemplate");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Connect to Alchemy & Ethereum
const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  wallet
);

const INFURA_API_KEY = process.env.INFURA_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RECEIVER_ADDRESS = process.env.RECEIVER_ADDRESS;

const provider2 = new ethers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${INFURA_API_KEY}`
);

/**
 * ✅ Fetch Contract Data
 */
app.get("/", (req, res) => {
  res.status(200).json({ message: "App Running" });
});

app.get("/contract-data", async (req, res) => {
  try {
    const totalFiles = await contract.getAllFiles(); // Example function from contract
    res.json({ totalFiles: totalFiles.toString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch contract data" });
  }
});

async function uploadToPinata(fileContent, fileName) {
  const url = process.env.PINATA_URL;
  const formData = new FormData();

  // Convert text content into a Buffer and append it as a file
  const fileBuffer = Buffer.from(fileContent, "utf-8");

  // Append as a Blob-like object with a proper filename & MIME type
  formData.append("file", fileBuffer, {
    filename: fileName,
    contentType: "text/plain",
  });

  try {
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(), // Include multipart headers
        pinata_api_key: process.env.PINATA_PRIVATE_KEY, // Ensure these are set
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
      },
    });

    console.log("Upload successful:", response.data);
    return response.data.IpfsHash;
  } catch (error) {
    console.error(
      "Error uploading to Pinata:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function convertHtmlToPdf(html, fileName) {
  return new Promise((resolve, reject) => {
    const pdfPath = path.join(
      __dirname,
      "uploads",
      fileName.replace(".html", ".pdf")
    );

    pdf.create(html, { format: "A4" }).toFile(pdfPath, (err, res) => {
      if (err) reject(err);
      else resolve(res.filename);
    });
  });
}

/**
 * ✅ Upload File Metadata to Blockchain
 */
app.post("/uploadFile", async (req, res) => {
  try {
    const {
      fileName,
      fileType,
      fileSize,
      fileDescription,
      fileData,
      loanType,
      txHash,
    } = req.body;

    console.log(req.body);

    if (
      !fileName ||
      !fileType ||
      !fileSize ||
      !fileDescription ||
      !fileData ||
      !loanType ||
      !txHash
    ) {
      return res.status(400).json({ error: "Missing file details" });
    }

    console.log({ message: "Transaction successful", txHash: txHash });

    var html = "";

    switch (loanType) {
      case "HL":
        html = generateHomeLoanAgreementHTML(fileData);
        break;
      case "PL":
        html = generatePersonalLoanAgreementHTML(fileData);
        break;
    }

    const pdfPath = await convertHtmlToPdf(html, fileName);

    // Read the PDF file
    const pdfBuffer = fs.readFileSync(pdfPath);

    // Upload PDF to IPFS
    const fileHash = await uploadToPinata(pdfBuffer, fileName.replace('.html', '.pdf'));

    // Store in smart contract
    const tx = await contract.uploadFile(
      fileHash,
      fileName,
      fileType,
      fileSize,
      fileDescription
    );
    await tx.wait();

    fs.unlinkSync(pdfPath);

    res.json({
      message: "File uploaded successfully",
      fileHash,
      transactionHash: tx.hash,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ✅ Fetch File Details
 */
app.get("/file/:hash", async (req, res) => {
  try {
    const file = await contract.getFile(req.params.hash);
    if (!file[0]) return res.status(404).json({ error: "File not found" });

    res.json({
      fileHash: file[0],
      fileName: file[1],
      fileType: file[2],
      uploader: file[3],
      timestamp: file[4].toString(),
      fileSize: file[5].toString(),
      fileDescription: file[6],
      fileURL: `https://gateway.pinata.cloud/ipfs/${file[0]}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch file" });
  }
});

/**
 * ✅ API Running
 */
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
