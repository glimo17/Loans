function LoanList({ loans, loading }) {
  if (loading) {
    return <p className="status-message">Loading loans...</p>;
  }

  if (!loans.length) {
    return <p className="status-message">No loans found. Add one to get started.</p>;
  }

  return (
    <div className="loan-list-card">
      <h2>Loan Portfolio</h2>
      <div className="loan-table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Borrower</th>
              <th>Amount</th>
              <th>Interest</th>
              <th>Term</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.id}</td>
                <td>{loan.borrowerName}</td>
                <td>${Number(loan.amount).toLocaleString()}</td>
                <td>{Number(loan.interestRate)}%</td>
                <td>{loan.termMonths} months</td>
                <td>{new Date(loan.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LoanList;
