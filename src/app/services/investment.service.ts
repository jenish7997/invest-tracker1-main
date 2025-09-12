
import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, addDoc, query, where, getDocs, Timestamp, orderBy, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Transaction } from '../models'; // Import the Transaction model

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {

  constructor(private firestore: Firestore) { }

  listInvestors(): Observable<any[]> {
    const investorsCollection = collection(this.firestore, 'investors');
    return collectionData(investorsCollection, { idField: 'id' });
  }

  getInvestors(): Observable<any[]> {
    return this.listInvestors();
  }

  addInvestor(name: string, email: string, initialDeposit: number): Promise<any> {
    const investorsCollection = collection(this.firestore, 'investors');
    return addDoc(investorsCollection, {
      name,
      email,
      initialInvestment: initialDeposit,
      balance: initialDeposit
    });
  }

  addTransaction(transactionData: any): Promise<any> {
    const transactionsCollection = collection(this.firestore, 'transactions');
    return addDoc(transactionsCollection, transactionData);
  }

  async computeBalances(investorId: string, investorName: string, startMonthKey?: string, endMonthKey?: string): Promise<any[]> {
    const investorDoc = doc(this.firestore, 'investors', investorId);
    const investorSnapshot = await getDoc(investorDoc);
    const investorData = investorSnapshot.data();
    const initialInvestment = investorData ? investorData['initialInvestment'] : 0;

    const transactionsCollection = collection(this.firestore, 'transactions');
    
    let constraints = [
      where('investorId', '==', investorId),
      orderBy('date')
    ];

    const q = query(collection(this.firestore, 'transactions'), ...constraints);
    
    const querySnapshot = await getDocs(q);
    
    const allTransactions = querySnapshot.docs.map(doc => {
      const data = doc.data() as Transaction;
      return {
        ...data,
        date: (data.date as unknown as Timestamp).toDate()
      };
    });

    const startDate = startMonthKey ? new Date(startMonthKey + '-01') : null;
    const endDate = endMonthKey ? new Date(endMonthKey + '-28') : null;

    const filteredTransactions = allTransactions.filter(t => {
      const transactionDate = t.date;
      if (startDate && transactionDate < startDate) return false;
      if (endDate && transactionDate > endDate) return false;
      return true;
    });

    let balance = initialInvestment;
    const runningBalances = filteredTransactions.map(t => {
      if (t.type === 'deposit') {
        balance += t.amount;
      } else if (t.type === 'withdraw') {
        balance -= t.amount;
      } else if (t.type === 'interest') {
        balance += t.amount;
      }
      return {
        ...t,
        balance: balance,
        date: t.date.toLocaleDateString()
      };
    });
    
    return runningBalances;
  }

  listRates(): Observable<any[]> {
    const ratesCollection = collection(this.firestore, 'rates');
    return collectionData(ratesCollection, { idField: 'id' });
  }

  setMonthlyRate(rate: any): Promise<void> {
    const ratesDoc = doc(this.firestore, 'rates', 'monthly');
    return setDoc(ratesDoc, rate, { merge: true });
  }

  listTransactionsByInvestor(investorId: string): Observable<any[]> {
    const transactionsCollection = collection(this.firestore, 'transactions');
    const q = query(transactionsCollection, where('investorId', '==', investorId));
    return collectionData(q, { idField: 'id' });
  }
}
