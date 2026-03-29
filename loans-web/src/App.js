import { useEffect, useState } from 'react';
import './App.css';
import LoanForm from './components/LoanForm';
import LoanList from './components/LoanList';
import { createLoan, getLoans } from './api';

function App() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadLoans = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getLoans();
      setLoans(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const handleCreateLoan = async (payload) => {
    try {
      setSaving(true);
      setError('');
      await createLoan(payload);
      await loadLoans();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Loans Web</p>
        <h1>Loan Management Workspace</h1>
        <p>React + REST API + SQL Server in a clean modular architecture.</p>
      </section>

      {error ? <p className="error-banner">{error}</p> : null}

      <section className="grid">
        <LoanForm onSubmit={handleCreateLoan} loading={saving} />
        <LoanList loans={loans} loading={loading} />
      </section>
    </main>
  );
}

export default App;
