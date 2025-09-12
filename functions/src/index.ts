
import * as admin from "firebase-admin";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

admin.initializeApp();

/**
 * Verifies that the user making the request is an administrator.
 * @param {any} auth The authentication context from the callable function.
 */
async function verifyAdmin(auth: any) {
  if (!auth) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }
  // The admin claim is on the token, which is automatically verified here.
  if (auth.token.admin !== true) {
    logger.error("Non-admin user attempted to call an admin function.", {uid: auth.uid});
    throw new HttpsError(
      "permission-denied",
      "You must be an administrator to perform this action.",
    );
  }
}

/**
 * Creates a new investor user with a permanent password set by the admin.
 * This is the standard, recommended function type for web app calls.
 */
export const createInvestorUser = onCall(async (request) => {
  // 1. Verify that the caller is an admin (this also handles auth checking)
  await verifyAdmin(request.auth);

  const {name, email, initialDeposit, password} = request.data;

  // 2. Validate the incoming data
  if (!name || !email || !password || initialDeposit == null) {
    throw new HttpsError("invalid-argument", "Missing required fields.");
  }
  if (password.length < 8) {
    throw new HttpsError("invalid-argument", "Password must be at least 8 characters long.");
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

    logger.info("Successfully created new user:", {uid: userRecord.uid});
    return {success: true, message: `Successfully created user for ${email}.`};

  } catch (error: any) {
    logger.error("Error creating new investor user:", error);
    if (error.code === "auth/email-already-exists") {
      throw new HttpsError("already-exists", "This email address is already in use.");
    }
    throw new HttpsError("internal", "An unexpected error occurred.");
  }
});
