import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Define the expected structure of the data passed to the function
interface SetAdminClaimData {
  email: string;
}

/**
 * Sets a custom claim on a user's account to make them an admin.
 *
 * This is a callable function that can be invoked from the client-side
 * application. It requires the user to be authenticated.
 *
 * @param {SetAdminClaimData} data - The data passed to the function,
 * containing the email of the user to make an admin.
 * @param {functions.https.CallableContext} context - The context of the
 * function call, containing authentication information.
 * @returns {Promise<{message: string}>} A promise that resolves with a success
 * message.
 * @throws {functions.https.HttpsError} Throws an error if the user is not
 * authenticated or if an internal error occurs.
 */
export const setAdminClaim = functions.https.onCall(
  async (data: SetAdminClaimData, context: functions.https.CallableContext) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const {email} = data;
    try {
      const user = await admin.auth().getUserByEmail(email);
      await admin.auth().setCustomUserClaims(user.uid, {admin: true});
      return {message: `Success! ${email} has been made an admin.`};
    } catch (error) {
      functions.logger.error("Error setting admin claim:", error);
      throw new functions.https.HttpsError(
        "internal",
        "An error occurred while setting the admin claim."
      );
    }
  }
);
