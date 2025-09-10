
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

  const user = await admin.auth().getUser(auth.uid);
  if (user.customClaims?.["admin"] !== true) {
    logger.error("Non-admin user attempted to call an admin function.", {uid: auth.uid});
    throw new HttpsError(
      "permission-denied",
      "You must be an administrator to perform this action.",
    );
  }
}

/**
 * Creates a new investor user with a permanent password set by the admin.
 * Callable only by an administrator.
 */
export const createInvestorUser = onCall(async (request) => {
  await verifyAdmin(request.auth);

  const {name, email, initialDeposit, password} = request.data;

  if (typeof name !== "string" || typeof email !== "string" ||
      typeof initialDeposit !== "number" || typeof password !== "string") {
    throw new HttpsError(
      "invalid-argument",
      "Function requires 'name', 'email', 'initialDeposit', and 'password'.",
    );
  }

  if (password.length < 8) {
    throw new HttpsError(
      "invalid-argument",
      "Password must be at least 8 characters long.",
    );
  }

  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      emailVerified: true,
      password: password, // Use the password provided by the admin
      displayName: name,
      disabled: false,
    });

    logger.info("Successfully created new user:", {uid: userRecord.uid});

    const investorData = {
      name: name,
      email: email,
      initialInvestment: initialDeposit,
      balance: initialDeposit,
      uid: userRecord.uid,
    };
    await admin.firestore().collection("investors").doc(userRecord.uid)
      .set(investorData);

    logger.info("Created investor document for:", {uid: userRecord.uid});

    return {success: true, message: `Successfully created user for ${email}.`};
  } catch (error) {
    logger.error("Error creating new investor user:", error);
    if (error.code === "auth/email-already-exists") {
      throw new HttpsError("already-exists", "This email is already in use.");
    }
    throw new HttpsError(
      "internal",
      "An unexpected error occurred while creating the new investor.",
    );
  }
});
