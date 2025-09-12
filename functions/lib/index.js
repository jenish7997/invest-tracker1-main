"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvestorUser = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
admin.initializeApp();
/**
 * Verifies that the user making the request is an administrator.
 * @param {any} auth The authentication context from the callable function.
 */
async function verifyAdmin(auth) {
    if (!auth) {
        throw new https_1.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // The admin claim is on the token, which is automatically verified here.
    if (auth.token.admin !== true) {
        logger.error("Non-admin user attempted to call an admin function.", { uid: auth.uid });
        throw new https_1.HttpsError("permission-denied", "You must be an administrator to perform this action.");
    }
}
/**
 * Creates a new investor user with a permanent password set by the admin.
 * This is the standard, recommended function type for web app calls.
 */
exports.createInvestorUser = (0, https_1.onCall)(async (request) => {
    // 1. Verify that the caller is an admin (this also handles auth checking)
    await verifyAdmin(request.auth);
    const { name, email, initialDeposit, password } = request.data;
    // 2. Validate the incoming data
    if (!name || !email || !password || initialDeposit == null) {
        throw new https_1.HttpsError("invalid-argument", "Missing required fields.");
    }
    if (password.length < 8) {
        throw new https_1.HttpsError("invalid-argument", "Password must be at least 8 characters long.");
    }
    try {
        // 3. Create the user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: name,
        });
        // 4. Create the investor document in Firestore
        await admin.firestore().collection("investors").doc(userRecord.uid).set({
            name,
            email,
            initialInvestment: initialDeposit,
            balance: initialDeposit,
            uid: userRecord.uid,
        });
        logger.info("Successfully created new user:", { uid: userRecord.uid });
        return { success: true, message: `Successfully created user for ${email}.` };
    }
    catch (error) {
        logger.error("Error creating new investor user:", error);
        if (error.code === "auth/email-already-exists") {
            throw new https_1.HttpsError("already-exists", "This email address is already in use.");
        }
        throw new https_1.HttpsError("internal", "An unexpected error occurred.");
    }
});
//# sourceMappingURL=index.js.map