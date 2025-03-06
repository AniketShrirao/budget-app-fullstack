import { Lending } from '../types/common';
import { Transaction } from '../types/transaction';

import Dexie, { Table } from 'dexie';

export class BudgetDB extends Dexie {
  transactions!: Table<Transaction>;
  lendings!: Table<Lending>;

  constructor() {
    super('BudgetDB');
    this.version(1).stores({
      transactions: 'id, user_email, date, type',
      lendings: 'id, user_email, date, borrower'
    });
  }
}

export const db = new BudgetDB();