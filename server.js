require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const contractABI = require("./contractABI.json").abi; // Load contract ABI
const pdf = require("html-pdf");
const mongoose = require("mongoose");
const PersonalLoan = require("./model/user.model");

const { v4: uuidv4 } = require("uuid");

const fs = require("fs");
const path = require("path");

const sendSignupSuccessEmail = require("./util/mailer");

const FormData = require("form-data");
const axios = require("axios");
const {
  generateHomeLoanAgreementHTML,
  generatePersonalLoanAgreementHTML,
} = require("./loanTemplate");

mongoose
  .connect(
    "mongodb+srv://kussagrapathak:jqYSLd2p5tQiMvRU@cluster0.ijhms.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Connect to Alchemy & Ethereum
const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS3,
  contractABI,
  wallet
);

const INFURA_API_KEY = process.env.INFURA_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RECEIVER_ADDRESS = process.env.RECEIVER_ADDRESS;

const provider2 = new ethers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${INFURA_API_KEY}`
);

const url = process.env.digilocker_init;

const headers = {
  accept: "application/json",
  "content-type": "application/json",
  client_id: process.env.c_id,
  client_secret: process.env.c_sec,
};

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

app.post("/sendEmail", async (req, res) => {
  try {
    const { email, link, name } = req.body;

    console.log(email);
    console.log(link);
    console.log(name);

    if (!email || !link || !name) {
      return res.status(400).json({ error: "Missing required loan details" });
    }

    await sendSignupSuccessEmail(email, link, name);

    res.json({
      status: "2001",
      message: "email sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "500", error: error.message });
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
// app.post("/checkApi", async (req, res) => {
//   try {
//     const {
//       firstName,
//       middleName,
//       lastName,
//       dob,
//       pan,
//       gender,
//       pincode,
//       loanType,
//       loanAmount,
//       loanTenure,
//       roi,
//       emiAmount,
//       consentFlag,
//     } = req.body;

//     console.log(req.body);

//     // Validate required fields
//     if (
//       !firstName ||
//       !lastName ||
//       !dob ||
//       !pan ||
//       !gender ||
//       !pincode ||
//       !loanType ||
//       !loanAmount ||
//       !loanTenure ||
//       !roi ||
//       !emiAmount ||
//       consentFlag === undefined
//     ) {
//       return res.status(400).json({ error: "Missing required loan details" });
//     }

//     const transactionId = `${Date.now()}-${uuidv4()}`;

//     console.log("Generated Transaction ID:", transactionId);
//     console.log("Sending data to smart contract...");

//     // Store loan details in the smart contract
//     const tx = await contract.setLoanDetails([
//       firstName + " " + middleName + " " + lastName,
//       dob,
//       pan,
//       gender,
//       pincode,
//       loanType,
//       loanAmount,
//       loanTenure,
//       roi,
//       emiAmount,
//       transactionId,
//       "", // HTML content will be generated on-chain
//     ]);

//     await tx.wait();

//     console.log(tx.hash);

//     res.json({
//       status: "2001",
//       message: "Loan details saved successfully",
//       transactionHash: tx.hash,
//       transactionId: transactionId,
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ status: "500", error: error.message });
//   }
// });

app.post("/checkApi", async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      dob,
      pan,
      gender,
      pincode,
      loanType,
      loanAmount,
      loanTenure,
      roi,
      emiAmount,
      consentFlag,
      decentroTxnId,
    } = req.body;

    console.log(req.body);

    // Validate required fields
    if (
      [
        firstName,
        lastName,
        dob,
        pan,
        gender,
        pincode,
        loanType,
        loanAmount,
        loanTenure,
        roi,
        emiAmount,
      ].includes(undefined) ||
      consentFlag == null
    ) {
      return res.status(400).json({ error: "Missing required loan details" });
    }

    const transactionId = `${Date.now()}-${uuidv4()}`;
    console.log("Generated Transaction ID:", transactionId);

    console.log("Sending data to smart contract...");
    const cibilScore = Math.floor(Math.random() * (900 - 700 + 1)) + 700;

    try {
      console.log("API call to external service...");
      const data = {
        consent: true,
        clear_cookies: false,
        purpose: "development purpose of smart contract",
        reference_id: uuidv4().toUpperCase(),
        redirect_url: process.env.digi_return,
      };

      const response = await axios.post(url, data, { headers });
      console.log("Response:", response.data);

      const personalLoan = new PersonalLoan({
        firstName,
        middleName,
        lastName,
        dob,
        pan,
        gender,
        pincode,
        loanType,
        loanAmount,
        loanTenure,
        roi,
        emiAmount,
        consentFlag,
        transactionId,
        decentroTxnId: response.data.decentroTxnId,
        cibil: cibilScore,
      });

      try {
        await personalLoan.save();
        console.log("Loan details saved to MongoDB");

        res.status(200).json({
          status: "2001",
          message: "Loan details saved successfully",
          transactionId,
          url: response.data.data.authorizationUrl,
          decentroTxnId: response.data.decentroTxnId,
          data: personalLoan,
        });
      } catch (dbError) {
        console.error("MongoDB Save Error:", dbError);
        return res.status(500).json({ error: "Failed to save loan details" });
      }
    } catch (error) {
      console.error(
        "External API Error:",
        error.response ? error.response.data : error.message
      );
      return res.status(error.response?.status || 500).json({
        error: error.response ? error.response.data : "External API Error",
      });
    }
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ status: "500", error: "Internal Server Error" });
  }
});

app.get("/getLoanHTML/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params; // Expect transactionId instead of userAddress

    console.log(`Fetching loan details for transaction: ${transactionId}`);
    const loanHTML = await contract.getLoanHTML(transactionId);

    if (!loanHTML) {
      return res.status(404).json({ error: "Loan details not found" });
    }

    const pdfPath = await convertHtmlToPdf(loanHTML, transactionId + ".html");

    const pdfBuffer = fs.readFileSync(pdfPath);

    const fileHash = await uploadToPinata(pdfBuffer, transactionId + ".pdf");

    // res.send(loanHTML);

    res.json({
      status: "2001",
      message: "File fetched successfully",
      file: loanHTML,
      fileHash: fileHash,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
    const fileHash = await uploadToPinata(
      pdfBuffer,
      fileName.replace(".html", ".pdf")
    );

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

app.get("/digilocker-session", async (req, res) => {
  try {
    console.log("api call");
    const data = {
      consent: true,
      clear_cookies: false,
      purpose: "development purpose of smart contract",
      reference_id: Math.random().toString(36).substring(2, 15).toUpperCase(),
      redirect_url: process.env.digi_return,
    };

    const response = await axios.post(url, data, { headers });
    console.log("Response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    res.status(error.response?.status || 500).json({
      error: error.response ? error.response.data : "Internal Server Error",
    });
  }
});

app.post("/digilocker-data/:sessionid", async (req, res) => {
  const session_id = req.params.sessionid;
  try {
    const DigiDataData = {
      consent: true,
      generate_xml: false,
      generate_pdf: false,
      purpose: "development purpose of smart contract",
      reference_id: Math.random().toString(36).substring(2, 12).toUpperCase(),
    };

    console.log("api call");

    console.log(session_id);

    const response = await axios.post(
      `https://in.staging.decentro.tech/v2/kyc/sso/digilocker/${session_id}/eaadhaar`,
      DigiDataData,
      { headers }
    );
    console.log("Response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    res.status(error.response?.status || 500).json({
      error: error.response ? error.response.data : "Internal Server Error",
    });
  }
});

// API Endpoint
// app.get("/cibil-score", (req, res) => {
//     const cibilScore =  Math.floor(Math.random() * (900 - 700 + 1)) + 700;
//     res.json({ cibilScore });
// });

app.post("/cibil-score/:transectionId", async (req, res) => {
  try {
    const { transactionId } = req.params.transectionId;

    if (!transactionId) {
      return res.status(400).json({ error: "Transaction ID is required" });
    }

    const cibilScore = Math.floor(Math.random() * (900 - 700 + 1)) + 700;

    // Update CIBIL score in MongoDB
    const updatedLoan = await PersonalLoan.findOneAndUpdate(
      { transactionId },
      { cibilScore },
      { new: true }
    );

    if (!updatedLoan) {
      return res.status(404).json({ error: "Loan record not found" });
    }

    res.json({
      cibilScore,
      message: "CIBIL score updated successfully",
      data: updatedLoan,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "500", error: error.message });
  }
});

app.get("/get-data/:tra_id", async (req, res) => {
  try {
    const { tra_id } = req.params;

    if (!tra_id) {
      return res.status(400).send("<h3>Transaction ID is required</h3>");
    }

    console.log(`Fetching data for Transaction ID: ${tra_id}`);

    const loanDetails = await PersonalLoan.findOne({ transactionId: tra_id });

    if (!loanDetails) {
      return res
        .status(404)
        .send("<h3>No loan data found for this Transaction ID</h3>");
    }

    // Loan calculation
    const loanAmount = loanDetails.loanAmount;
    const roi = loanDetails.roi;
    const tenure = loanDetails.loanTenure;
    const monthlyInterestRate = roi / 12 / 100;
    const totalMonths = tenure * 12;
    const emi =
      (loanAmount *
        monthlyInterestRate *
        Math.pow(1 + monthlyInterestRate, totalMonths)) /
      (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);

    let remainingBalance = loanAmount;
    let tableRows = "";

    for (let i = 1; i <= totalMonths; i++) {
      let interest = remainingBalance * monthlyInterestRate;
      let principal = emi - interest;
      remainingBalance = Math.max(0, remainingBalance - principal);

      tableRows += `<tr>
              <td>${i}</td>
              <td>₹${emi.toFixed(2)}</td>
              <td>₹${principal.toFixed(2)}</td>
              <td>₹${interest.toFixed(2)}</td>
              <td>₹${remainingBalance.toFixed(2)}</td>
          </tr>`;
    }

    const leadHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Loan Details</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f4f6f8;
              margin: 0;
              padding: 0;
            }
            .header {
              background: #002953;
              padding: 15px 20px;
              text-align: left;
              display: flex;
              align-items: center;
            }
            .header img {
              height: 50px;
            }
            .container {
              margin: 20px auto;
              background: #fff;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            h2 {
              text-align: center;
              color: #333;
              margin-bottom: 20px;
            }
            .section {
              margin-bottom: 30px;
            }
            .section p {
              font-size: 16px;
              margin: 6px 0;
            }
            .section p strong {
              color: #555;
              min-width: 150px;
              display: inline-block;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            table thead {
              background: #007BFF;
              color: white;
            }
            table th, table td {
              padding: 10px;
              border: 1px solid #ddd;
              text-align: center;
              font-size: 14px;
            }
            table tr:nth-child(even) {
              background: #f9f9f9;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="https://cms-assets.bajajfinserv.in/is/image/bajajfinance/bajaj-logo-sep-15?scl=1&fmt=png-alpha" alt="Bajaj Finserv Logo">
          </div>
        
          <div class="container">
            <h2>${loanDetails.loanType}</h2>
            <div class="section">
              <p><strong>Name:</strong> ${loanDetails.firstName} ${
      loanDetails.middleName
    } ${loanDetails.lastName}</p>
              <p><strong>Date of Birth:</strong> ${loanDetails.dob}</p>
              <p><strong>Gender:</strong> ${loanDetails.gender}</p>
              <p><strong>PAN:</strong> ${loanDetails.pan}</p>
              <p><strong>Pincode:</strong> ${loanDetails.pincode}</p>
              <p><strong>Loan Amount:</strong> ₹${loanDetails.loanAmount.toLocaleString()}</p>
              <p><strong>Loan Tenure:</strong> ${
                loanDetails.loanTenure
              } years</p>
              <p><strong>Rate of Interest:</strong> ${loanDetails.roi}%</p>
              <p><strong>EMI Amount:</strong> ₹${loanDetails.emiAmount.toLocaleString()}</p>
            </div>
        
            <h2>Loan Repayment Schedule</h2>
            <div class="section">
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>EMI</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Remaining Balance</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRows}
                </tbody>
              </table>
            </div>
          </div>
        </body>
        </html>
        `;

    // Convert HTML to PDF
    const pdfPath = await convertHtmlToPdf(leadHTML, `${tra_id}.html`);
    const pdfBuffer = fs.readFileSync(pdfPath);

    // Upload to Pinata
    const fileHash = await uploadToPinata(pdfBuffer, `${tra_id}.pdf`);

    // Send HTML response with generated table
    res.json({
      status: "2001",
      message: "File fetched successfully",
      file: leadHTML,
      fileHash: fileHash,
    });
  } catch (error) {
    console.error("Error fetching loan details:", error);
    res.status(500).send("<h3>Internal Server Error</h3>");
  }
});
app.post("/add-aadhar/:transactionId/:sessionId", async (req, res) => {
  try {
    const { transactionId, sessionId } = req.params; // Ensure correct extraction

    const DigiDataData = {
      consent: true,
      generate_xml: false,
      generate_pdf: false,
      purpose: "development purpose of smart contract",
      reference_id: require("crypto")
        .randomBytes(6)
        .toString("hex")
        .toUpperCase(), // Better uniqueness
    };

    console.log("API call initiated...");
    console.log("Session ID:", sessionId);

    const response = await axios.post(
      `https://in.staging.decentro.tech/v2/kyc/sso/digilocker/${sessionId}/eaadhaar`,
      DigiDataData,
      { headers }
    );

    console.log("Response:", response.data);

    if (!response.data || !response.data.data) {
      return res
        .status(400)
        .json({ error: "Invalid response from Aadhaar service" });
    }

    const aadharDetails = response.data.data; // Extract relevant data

    // Update loan record with Aadhar details
    const updatedLoan = await PersonalLoan.findOneAndUpdate(
      { transactionId: transactionId },
      { $set: { aadharDetails } }, // Store Aadhar details properly
      { new: true, runValidators: true }
    );

    if (!updatedLoan) {
      return res
        .status(404)
        .json({ error: "No loan record found for this Transaction ID" });
    }

    res.status(200).json({
      status: "2001",
      message: "Aadhar details added successfully",
      data: updatedLoan,
    });
  } catch (error) {
    console.error("Error adding Aadhar details:", error);
    res.status(error.response?.status || 500).json({
      error: error.response ? error.response.data : "Internal Server Error",
    });
  }
});
/**
 * ✅ API Running
 */

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
