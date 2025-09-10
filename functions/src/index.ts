
import * as admin from "firebase-admin";
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

admin.initializeApp();

/**
 * Creates a new investor user with a permanent password set by the admin.
 * This is a standard HTTPS endpoint with manual CORS handling for robustness.
 */
export const createInvestorUser = onRequest(
  {cors: true}, // Use a simple CORS configuration
  async (request, response) => {
    // Manually handle preflight OPTIONS request for safety
    if (request.method === "OPTIONS") {
      response.set("Access-Control-Allow-Origin", "*");
      response.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
      response.status(204).send("");
      return;
    }

    // Verify the user's token from the Authorization header
    const idToken = request.headers.authorization?.split("Bearer ")[1];
    if (!idToken) {
      logger.error("Authorization token not found.");
      response.status(401).send({error: "Unauthorized"});
      return;
    }

    try {
      // 1. Verify the token and check for admin custom claim
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (decodedToken.admin !== true) {
        logger.error("Non-admin user attempted to call createInvestorUser.", {uid: decodedToken.uid});
        response.status(403).send({error: "Permission denied. Must be an administrator."});
        return;
      }

      const {name, email, initialDeposit, password} = request.body.data;

      // 2. Create the user in Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: name,
      });

      // 3. Create the investor document in Firestore
      await admin.firestore().collection("investors").doc(userRecord.uid).set({
        name,
        email,
        initialInvestment: initialDeposit,
        balance: initialDeposit,
        uid: userRecord.uid,
      });

      logger.info("Successfully created new user:", {uid: userRecord.uid});
      response.status(200).json({data: {success: true, message: `Successfully created user for ${email}.`}});
    } catch (error) {
      logger.error("Error creating new investor user:", error);
      response.status(500).send({error: "An internal error occurred."});
    }
  }
);
