import { createContext, useState, useContext, useMemo } from 'react';

const FinanceContext = createContext();

const INITIAL_INCOMES = [
  { id: 1, name: 'Fő kliens (Kovács Kft.)', amount: 1500000, frequency: 'Havi' },
  { id: 2, name: 'Webáruház bevételek', amount: 800000, frequency: 'Havi' },
  { id: 3, name: 'Őszi fellendülés', amount: 280000, frequency: 'Egyszeri', month: 'Szeptember' },
  { id: 4, name: 'Karácsonyi szezon kezdete', amount: 130000, frequency: 'Egyszeri', month: 'November' }
];

const INITIAL_EXPENSES = [
  { id: 1, name: 'Irodabérlet', amount: 350000, frequency: 'Havi' },
  { id: 2, name: 'Alkalmazotti bérek', amount: 1130000, frequency: 'Havi' },
  { id: 3, name: 'Marketing & Szoftverek', amount: 200000, frequency: 'Havi' },
  { id: 4, name: 'Szezonális kiesés (júl-aug)', amount: 370000, frequency: 'Egyszeri', month: 'Július' },
  { id: 5, name: 'Szabadságok miatti visszaesés', amount: 470000, frequency: 'Egyszeri', month: 'Augusztus' },
  { id: 6, name: 'Éves iparűzési adó befizetés', amount: 1100000, frequency: 'Egyszeri', month: 'Október' },
  { id: 7, name: 'Eszközbeszerzés / Szoftver', amount: 70000, frequency: 'Egyszeri', month: 'Október' }
];

export function FinanceProvider({ children }) {
  const [incomes, setIncomes] = useState(INITIAL_INCOMES);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);

  // Éves becsült bevétel kiszámolása a bevételek alapján
  const annualRevenue = useMemo(() => {
    let total = 0;
    incomes.forEach(inc => {
      if (inc.frequency === 'Havi') total += inc.amount * 12;
      else total += inc.amount;
    });
    return total;
  }, [incomes]);

  return (
    <FinanceContext.Provider value={{ incomes, setIncomes, expenses, setExpenses, annualRevenue }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  return useContext(FinanceContext);
}
