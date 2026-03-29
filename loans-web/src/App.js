import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import { createResourceItem, getResourceItems } from './api';

const resourceConfigs = [
  {
    key: 'statuses',
    label: 'Statuses',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'text', required: false }
    ]
  },
  {
    key: 'roles',
    label: 'Roles',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'text', required: false }
    ]
  },
  {
    key: 'users',
    label: 'Users',
    fields: [
      { name: 'roleId', label: 'Role ID', type: 'number', required: true },
      { name: 'firstName', label: 'First Name', type: 'text', required: true },
      { name: 'lastName', label: 'Last Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'passwordHash', label: 'Password', type: 'text', required: true },
      { name: 'isActive', label: 'Active (1/0)', type: 'number', required: false }
    ]
  },
  {
    key: 'loan-products',
    label: 'Products',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'text', required: false },
      { name: 'interestRate', label: 'Interest Rate', type: 'number', required: true },
      { name: 'maxAmount', label: 'Max Amount', type: 'number', required: true },
      { name: 'minAmount', label: 'Min Amount', type: 'number', required: true },
      { name: 'termMonths', label: 'Term Months', type: 'number', required: true }
    ]
  },
  {
    key: 'loans',
    label: 'Loans',
    fields: [
      { name: 'userId', label: 'User ID', type: 'number', required: true },
      { name: 'productId', label: 'Product ID', type: 'number', required: true },
      { name: 'statusId', label: 'Status ID', type: 'number', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'interestRate', label: 'Interest Rate', type: 'number', required: true },
      { name: 'termMonths', label: 'Term Months', type: 'number', required: true },
      { name: 'startDate', label: 'Start Date', type: 'date', required: false },
      { name: 'endDate', label: 'End Date', type: 'date', required: false }
    ]
  },
  {
    key: 'payments',
    label: 'Payments',
    fields: [
      { name: 'loanId', label: 'Loan ID', type: 'number', required: true },
      { name: 'paymentDate', label: 'Payment Date', type: 'date', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'principalAmount', label: 'Principal', type: 'number', required: false },
      { name: 'interestAmount', label: 'Interest', type: 'number', required: false }
    ]
  },
  {
    key: 'loan-history',
    label: 'History',
    fields: [
      { name: 'loanId', label: 'Loan ID', type: 'number', required: true },
      { name: 'statusId', label: 'Status ID', type: 'number', required: true },
      { name: 'notes', label: 'Notes', type: 'text', required: false }
    ]
  }
];

const buildInitialForm = (resource) => resource.fields.reduce((acc, field) => {
  acc[field.name] = '';
  return acc;
}, {});

const formatLabel = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

function App() {
  const [activeResourceKey, setActiveResourceKey] = useState(resourceConfigs[0].key);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const activeResource = useMemo(
    () => resourceConfigs.find((resource) => resource.key === activeResourceKey),
    [activeResourceKey]
  );
  const [formState, setFormState] = useState(buildInitialForm(activeResource));

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getResourceItems(activeResource.key);
      setRecords(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [activeResource.key]);

  useEffect(() => {
    setFormState(buildInitialForm(activeResource));
    loadRecords();
  }, [activeResource, loadRecords]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const buildPayload = () => {
    const payload = {};

    activeResource.fields.forEach((field) => {
      const value = formState[field.name];
      if (value === '') {
        return;
      }

      if (field.type === 'number') {
        payload[field.name] = Number(value);
        return;
      }

      payload[field.name] = value;
    });

    return payload;
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      await createResourceItem(activeResource.key, buildPayload());
      setFormState(buildInitialForm(activeResource));
      await loadRecords();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mobile-stage">
      <section className="phone-frame">
        <header className="top-bar">
          <p className="brand">Loans Web</p>
          <h1>{activeResource.label}</h1>
          <p className="hint">Cellphone interface for your API resources</p>
        </header>

        {error ? <p className="error-banner">{error}</p> : null}

        <nav className="resource-tabs">
          {resourceConfigs.map((resource) => (
            <button
              key={resource.key}
              type="button"
              className={resource.key === activeResource.key ? 'tab active' : 'tab'}
              onClick={() => setActiveResourceKey(resource.key)}
            >
              {resource.label}
            </button>
          ))}
        </nav>

        <section className="phone-content">
          <form className="card form-card" onSubmit={handleCreate}>
            <h2>Create {activeResource.label}</h2>
            {activeResource.fields.map((field) => (
              <label key={field.name}>
                {field.label}
                <input
                  type={field.type}
                  name={field.name}
                  value={formState[field.name]}
                  onChange={handleChange}
                  required={field.required}
                />
              </label>
            ))}
            <button type="submit" disabled={saving}>{saving ? 'Saving...' : `Add ${activeResource.label}`}</button>
          </form>

          <section className="card list-card">
            <h2>{activeResource.label} List</h2>
            {loading ? <p className="status-message">Loading...</p> : null}
            {!loading && !records.length ? <p className="status-message">No records found.</p> : null}
            <div className="record-list">
              {records.map((record, index) => (
                <article className="record-item" key={`${activeResource.key}-${index}`}>
                  {Object.entries(record).map(([key, value]) => (
                    <p key={key}>
                      <span>{formatLabel(key)}:</span> {String(value)}
                    </p>
                  ))}
                </article>
              ))}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}

export default App;
