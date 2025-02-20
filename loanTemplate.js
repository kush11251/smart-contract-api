function generateHomeLoanAgreementHTML(fileData) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home Loan Contract</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            padding: 20px;
            border: 2px solid #004aad;
            background-color: #f9f9f9;
            color: #333;
        }
        .header {
            display: flex;
            align-items: center;
            background-color: #004aad;
            color: white;
            padding: 15px;
            border-radius: 5px;
        }
        .header img {
            height: 50px;
            margin-right: 20px;
        }
        .header h1 {
            flex-grow: 1;
            text-align: center;
            margin: 0;
        }
        h2 {
            text-align: center;
            margin-top: 20px;
            color: #004aad;
        }
        .contract-details {
            margin-top: 20px;
            line-height: 1.6;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            border-left: 5px solid #f7931e;
        }
        .signature {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
        }
        .signature div {
            text-align: center;
            background: #f7931e;
            padding: 1px;
            border-radius: 5px;
            color: white;
            width: 40%;
        }
        .signature p {
            margin-top: 10px;
            font-weight: bold;
        }
        .date {
            text-align: right;
            margin-top: 20px;
            font-weight: bold;
            color: #004aad;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://cms-assets.bajajfinserv.in/is/image/bajajfinance/bfl-logo-mobile-view-v4?scl=1&fmt=png-alpha" alt="Company Logo">
        <h1>Home Loan Agreement</h1>
    </div>
    
    <h2>Home Loan Agreement</h2>
    <p>This Home Loan Agreement ("Agreement") is made and entered into as of the date signed below by and between:</p>
    
    <p><strong>Borrower:</strong></p>
    <div class="contract-details">
        <p><strong>Loan Amount:</strong> ₹${fileData.loanAmount}</p>
        <p><strong>Interest Rate:</strong> 8.1% per annum</p>
        <p><strong>Loan Tenure:</strong> ${fileData.loanTenure} years</p>
        <p>The Borrower agrees to repay the loan amount along with interest in equal monthly installments as per the agreed repayment schedule.</p>
    </div>
    
    <p>The Borrower acknowledges the terms and conditions of this Agreement and agrees to abide by them throughout the loan tenure.</p>
    
    <div class="signature">
        <div>
            <p><u>Bajaj Finserv</u></p>
            <p>(Authorized Lender Signature)</p>
        </div>
        <div>
            <p><u>${fileData.firstName} ${fileData.middleName} ${fileData.lastName}</u></p>
            <p>(Borrower)</p>
        </div>
    </div>
    
    <p class="date"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
</body>
</html>
`;
}

function generatePersonalLoanAgreementHTML(fileData) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Personal Loan Contract</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            padding: 20px;
            border: 2px solid #004aad;
            background-color: #f9f9f9;
            color: #333;
        }
        .header {
            display: flex;
            align-items: center;
            background-color: #004aad;
            color: white;
            padding: 15px;
            border-radius: 5px;
        }
        .header img {
            height: 50px;
            margin-right: 20px;
        }
        .header h1 {
            flex-grow: 1;
            text-align: center;
            margin: 0;
        }
        h2 {
            text-align: center;
            margin-top: 20px;
            color: #004aad;
        }
        .contract-details {
            margin-top: 20px;
            line-height: 1.6;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            border-left: 5px solid #f7931e;
        }
        .signature {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
        }
        .signature div {
            text-align: center;
            background: #f7931e;
            padding: 1px;
            border-radius: 5px;
            color: white;
            width: 40%;
        }
        .signature p {
            margin-top: 10px;
            font-weight: bold;
        }
        .date {
            text-align: right;
            margin-top: 20px;
            font-weight: bold;
            color: #004aad;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://cms-assets.bajajfinserv.in/is/image/bajajfinance/bfl-logo-mobile-view-v4?scl=1&fmt=png-alpha" alt="Company Logo">
        <h1>Personal Loan Agreement</h1>
    </div>
    
    <h2>Personal Loan Agreement</h2>
    <p>This Personal Loan Agreement ("Agreement") is made and entered into as of the date signed below by and between:</p>
    
    <p><strong>Borrower:</strong></p>
    <div class="contract-details">
        <p><strong>Loan Amount:</strong> ₹${fileData.loanAmount}</p>
        <p><strong>Interest Rate:</strong> 9.1% per annum</p>
        <p><strong>Loan Tenure:</strong> ${fileData.loanTenure} years</p>
        <p>The Borrower agrees to repay the loan amount along with interest in equal monthly installments as per the agreed repayment schedule.</p>
    </div>
    
    <p>The Borrower acknowledges the terms and conditions of this Agreement and agrees to abide by them throughout the loan tenure.</p>
    
    <div class="signature">
        <div>
            <p><u>Bajaj Finserv</u></p>
            <p>(Authorized Lender Signature)</p>
        </div>
        <div>
            <p><u>${fileData.firstName} ${fileData.middleName} ${fileData.lastName}</u></p>
            <p>(Borrower)</p>
        </div>
    </div>
    
    <p class="date"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
</body>
</html>
`;
}

module.exports = {generateHomeLoanAgreementHTML, generatePersonalLoanAgreementHTML}