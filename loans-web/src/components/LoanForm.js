import { useState } from 'react';

const initialForm = {
  borrowerName: '',
  amount: '',
  interestRate: '',
  termMonths: ''
};

function LoanForm({ onSubmit, loading }) {
  const [form, setForm] = useState(initialForm);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSubmit({
      borrowerName: form.borrowerName,
      amount: Number(form.amount),
      interestRate: Number(form.interestRate),
      termMonths: Number(form.termMonths)
    });

    setForm(initialForm);
  };

  return (
    <form className="loan-form" onSubmit={handleSubmit}>
      <h2>Create Loan</h2>
      <label>
        Borrower Name
        <input
          type="text"
          name="borrowerName"
          value={form.borrowerName}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Amount
        <input
          type="number"
          name="amount"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Interest Rate (%)
        <input
          type="number"
          name="interestRate"
          min="0"
          step="0.01"
          value={form.interestRate}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Term (Months)
        <input
          type="number"
          name="termMonths"
          min="1"
          step="1"
          value={form.termMonths}
          onChange={handleChange}
          required
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Add Loan'}
      </button>
    </form>
  );
}

export default LoanForm;
