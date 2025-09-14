
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
 */
export const createInvestorUser = onCall(async (request) => {
  await verifyAdmin(request.auth);

  const {name, email, password} = request.data;

  if (!name || !email || !password) {
    throw new HttpsError("invalid-argument", "Missing required fields.");
  }
  if (password.length < 8) {
    throw new HttpsError("invalid-argument", "Password must be at least 8 characters long.");
  }

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    await admin.firestore().collection("investors").doc(userRecord.uid).set({
      name,
      email,
      balance: 0,
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

/**
 * Applies monthly interest to all investors based on their current balance.
 */
export const applyMonthlyInterest = onCall(async (request) => {
  await verifyAdmin(request.auth);

  const { monthKey, rate } = request.data; // e.g., monthKey: '2024-07', rate: 0.05 (for 5%)

  if (!monthKey || rate == null) {
    throw new HttpsError("invalid-argument", "Missing 'monthKey' or 'rate'.");
  }

  const year = parseInt(monthKey.split('-')[0], 10);
  const month = parseInt(monthKey.split('-')[1], 10) - 1; // JS months are 0-indexed
  const interestDate = new Date(year, month, new Date(year, month + 1, 0).getDate()); // Last day of the month

  const investorsRef = admin.firestore().collection("investors");
  const transactionsRef = admin.firestore().collection("transactions");
  const ratesRef = admin.firestore().collection("rates");

  try {
    // Save the rate for historical tracking
    await ratesRef.doc(monthKey).set({ monthKey, rate });

    const investorsSnapshot = await investorsRef.get();
    if (investorsSnapshot.empty) {
      return { success: true, message: "No investors found to apply interest to." };
    }

    const batch = admin.firestore().batch();
    let processedCount = 0;

    for (const doc of investorsSnapshot.docs) {
      const investor = doc.data();
      const currentBalance = investor.balance || 0;

      if (currentBalance > 0) {
        const interestAmount = currentBalance * rate;
        const newBalance = currentBalance + interestAmount;

        // Create an interest transaction
        const transactionDocRef = transactionsRef.doc();
        batch.set(transactionDocRef, {
          investorId: doc.id,
          investorName: investor.name,
          date: admin.firestore.Timestamp.fromDate(interestDate),
          type: 'interest',
          amount: interestAmount,
        });

        // Update the investor's balance
        const investorDocRef = investorsRef.doc(doc.id);
        batch.update(investorDocRef, { balance: newBalance });

        processedCount++;
      }
    }

    await batch.commit();

    return { success: true, message: `Successfully applied interest to ${processedCount} investors for ${monthKey}.` };

  } catch (error) {
    logger.error("Error applying monthly interest:", error);
    throw new HttpsError("internal", "An unexpected error occurred while applying interest.");
  }
});
