const mongoose = require('mongoose');

const personalLoanSchema = new mongoose.Schema({
    consentFlag: {
        type: Boolean,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    emiAmount: {
        type: Number,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    middleName: {
        type: String
    },
    lastName: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    loanAmount: {
        type: Number,
        required: true
    },
    loanTenure: {
        type: Number,
        required: true
    },
    loanType: {
        type: String,
        required: true
    },
    pan: {
        type: String,
        required: true,
        match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    },
    pincode: {
        type: String,
        required: true,
        match: /^[0-9]{6}$/
    },
    roi: {
        type: Number,
        required: true
    },
    transactionId: {
        type: String
    },
    cibil: {
        type: Number
    },
    decentroTxnId: {
        type: String
    },
    aadharDetails: {
        type: mongoose.Schema.Types.Mixed, // Generalized JSON format
        default: {} // Default value to prevent errors if field is missing
    }
}, {
    timestamps: true
});

const PersonalLoan = mongoose.model('PersonalLoan', personalLoanSchema);

module.exports = PersonalLoan;
