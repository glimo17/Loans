import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import { createResourceItem, getResourceItems, updateResourceItem } from './api';

const limitedResourceKeys = ['loans', 'payments'];

const resourceConfigs = [
  {
    key: 'statuses',
    idField: 'statusId',
    label: 'Estados',
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'description', label: 'Descripcion', type: 'text', required: false }
    ]
  },
  {
    key: 'roles',
    idField: 'roleId',
    label: 'Roles',
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'description', label: 'Descripcion', type: 'text', required: false }
    ]
  },
  {
    key: 'users',
    idField: 'userId',
    label: 'Usuarios',
    fields: [
      { name: 'roleId', label: 'ID Rol', type: 'number', required: true },
      { name: 'firstName', label: 'Nombre', type: 'text', required: true },
      { name: 'lastName', label: 'Apellido', type: 'text', required: true },
      { name: 'username', label: 'Usuario', type: 'text', required: true },
      { name: 'email', label: 'Correo', type: 'email', required: true },
      { name: 'passwordHash', label: 'Contrasena', type: 'text', required: true },
      { name: 'isActive', label: 'Activo (1/0)', type: 'number', required: false }
    ]
  },
  {
    key: 'loan-products',
    idField: 'productId',
    label: 'Productos',
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'description', label: 'Descripcion', type: 'text', required: false },
      { name: 'interestRate', label: 'Tasa Interes', type: 'number', required: true },
      { name: 'maxAmount', label: 'Monto Maximo', type: 'number', required: true },
      { name: 'minAmount', label: 'Monto Minimo', type: 'number', required: true },
      { name: 'termMonths', label: 'Plazo Meses', type: 'number', required: true }
    ]
  },
  {
    key: 'loans',
    idField: 'loanId',
    label: 'Prestamos',
    fields: [
      { name: 'userId', label: 'ID Usuario', type: 'number', required: true },
      { name: 'productId', label: 'ID Producto', type: 'number', required: true },
      { name: 'statusId', label: 'ID Estado', type: 'number', required: true },
      { name: 'amount', label: 'Monto', type: 'number', required: true },
      { name: 'interestRate', label: 'Tasa Interes', type: 'number', required: true },
      { name: 'termMonths', label: 'Plazo Meses', type: 'number', required: true },
      { name: 'startDate', label: 'Fecha Inicio', type: 'date', required: false },
      { name: 'endDate', label: 'Fecha Fin', type: 'date', required: false }
    ]
  },
  {
    key: 'payments',
    idField: 'paymentId',
    label: 'Pagos',
    fields: [
      { name: 'loanId', label: 'ID Prestamo', type: 'number', required: true },
      { name: 'paymentDate', label: 'Fecha Pago', type: 'date', required: true },
      { name: 'amount', label: 'Monto', type: 'number', required: true },
      { name: 'principalAmount', label: 'Capital', type: 'number', required: false },
      { name: 'interestAmount', label: 'Interes', type: 'number', required: false }
    ]
  },
  {
    key: 'loan-history',
    idField: 'historyId',
    label: 'Historial',
    fields: [
      { name: 'loanId', label: 'ID Prestamo', type: 'number', required: true },
      { name: 'statusId', label: 'ID Estado', type: 'number', required: true },
      { name: 'notes', label: 'Notas', type: 'text', required: false }
    ]
  }
];

const buildInitialForm = (resource) => resource.fields.reduce((acc, field) => {
  acc[field.name] = '';
  return acc;
}, {});

const formatLabel = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [activeResourceKey, setActiveResourceKey] = useState(resourceConfigs[0].key);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [editingId, setEditingId] = useState(null);

  const accessibleResources = useMemo(() => {
    if (!authUser) {
      return [];
    }

    if (authUser.isAdmin) {
      return resourceConfigs;
    }

    return resourceConfigs.filter((resource) => limitedResourceKeys.includes(resource.key));
  }, [authUser]);

  const activeResource = useMemo(
    () => {
      if (!authUser) {
        return resourceConfigs[0];
      }

      return accessibleResources.find((resource) => resource.key === activeResourceKey)
        || accessibleResources[0]
        || resourceConfigs[0];
    },
    [accessibleResources, activeResourceKey, authUser]
  );
  const [formState, setFormState] = useState(buildInitialForm(activeResource));

  useEffect(() => {
    const savedUser = sessionStorage.getItem('loans_web_user');
    if (!savedUser) {
      return;
    }

    try {
      setAuthUser(JSON.parse(savedUser));
    } catch (error) {
      sessionStorage.removeItem('loans_web_user');
    }
  }, []);

  useEffect(() => {
    if (!authUser || !accessibleResources.length) {
      return;
    }

    const isCurrentResourceAllowed = accessibleResources.some((resource) => resource.key === activeResourceKey);
    if (!isCurrentResourceAllowed) {
      setActiveResourceKey(accessibleResources[0].key);
    }
  }, [accessibleResources, activeResourceKey, authUser]);

  const loadRecords = useCallback(async () => {
    if (!authUser || !activeResource) {
      return;
    }

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
  }, [activeResource, authUser]);

  useEffect(() => {
    if (!authUser) {
      return;
    }

    setFormState(buildInitialForm(activeResource));
    loadRecords();
  }, [activeResource, authUser, loadRecords]);

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      setAuthLoading(true);
      setAuthError('');

      const [users, roles] = await Promise.all([
        getResourceItems('users'),
        getResourceItems('roles')
      ]);

      const matchedUser = users.find((user) => {
        const isActive = user.isActive === undefined || Number(user.isActive) === 1;
        return isActive
          && String(user.username).toLowerCase() === loginForm.username.toLowerCase()
          && String(user.passwordHash) === loginForm.password;
      });

      if (!matchedUser) {
        setAuthError('Credenciales invalidas.');
        return;
      }

      const role = roles.find((item) => Number(item.roleId) === Number(matchedUser.roleId));
      const roleName = role?.name || 'Customer';
      const isAdmin = roleName.toLowerCase() === 'admin';

      const sessionUser = {
        userId: matchedUser.userId,
        firstName: matchedUser.firstName,
        lastName: matchedUser.lastName,
        email: matchedUser.email,
        roleId: matchedUser.roleId,
        roleName,
        isAdmin
      };

      sessionStorage.setItem('loans_web_user', JSON.stringify(sessionUser));
      setAuthUser(sessionUser);
      setActiveResourceKey(isAdmin ? 'statuses' : 'loans');
      setLoginForm({ username: '', password: '' });
    } catch (requestError) {
      setAuthError(requestError.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('loans_web_user');
    setAuthUser(null);
    setRecords([]);
    setError('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const normalizeFieldValue = (field, value) => {
    if (value === undefined || value === null) {
      return '';
    }

    if (field.type === 'date') {
      const dateValue = String(value);
      return dateValue.length >= 10 ? dateValue.slice(0, 10) : dateValue;
    }

    return String(value);
  };

  const openCreateDialog = () => {
    setDialogMode('create');
    setEditingId(null);
    setFormState(buildInitialForm(activeResource));
    setDialogOpen(true);
  };

  const openEditDialog = (record) => {
    const nextForm = activeResource.fields.reduce((acc, field) => {
      acc[field.name] = normalizeFieldValue(field, record[field.name]);
      return acc;
    }, {});

    setDialogMode('edit');
    setEditingId(record[activeResource.idField]);
    setFormState(nextForm);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormState(buildInitialForm(activeResource));
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

  const handleSubmitDialog = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      if (dialogMode === 'edit' && editingId !== null) {
        await updateResourceItem(activeResource.key, editingId, buildPayload());
      } else {
        await createResourceItem(activeResource.key, buildPayload());
      }

      closeDialog();
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
        {!authUser ? (
          <>
            <header className="top-bar">
              <p className="brand">Loans Web</p>
              <h1>Iniciar sesion</h1>
              <p className="hint">Accede para gestionar prestamos</p>
            </header>

            {authError ? <p className="error-banner">{authError}</p> : null}

            <section className="phone-content">
              <form className="card form-card" onSubmit={handleLogin}>
                <h2>Acceso</h2>
                <label>
                  Usuario
                  <input
                    type="text"
                    name="username"
                    value={loginForm.username}
                    onChange={handleLoginChange}
                    required
                  />
                </label>
                <label>
                  Contrasena
                  <input
                    type="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    required
                  />
                </label>
                <button type="submit" disabled={authLoading}>
                  {authLoading ? 'Validando...' : 'Entrar'}
                </button>
              </form>
            </section>
          </>
        ) : (
          <>
            <header className="top-bar">
              <p className="brand">Loans Web</p>
              <h1>{activeResource.label}</h1>
              <p className="hint">{authUser.firstName} {authUser.lastName} ({authUser.roleName})</p>
              {!authUser.isAdmin ? <p className="role-note">Acceso limitado a Prestamos y Pagos</p> : null}
              <button type="button" className="logout-btn" onClick={handleLogout}>Cerrar sesion</button>
            </header>

            {error ? <p className="error-banner">{error}</p> : null}

            <nav className="resource-tabs">
              {accessibleResources.map((resource) => (
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
              <section className="card list-card">
                <div className="list-header">
                  <h2>Lista de {activeResource.label}</h2>
                  <button type="button" onClick={openCreateDialog}>Nuevo</button>
                </div>

                {loading ? <p className="status-message">Cargando...</p> : null}
                {!loading && !records.length ? <p className="status-message">No se encontraron registros.</p> : null}
                <div className="record-list">
                  {records.map((record, index) => (
                    <article className="record-item" key={`${activeResource.key}-${index}`}>
                      {Object.entries(record).map(([key, value]) => (
                        <p key={key}>
                          <span>{formatLabel(key)}:</span> {String(value)}
                        </p>
                      ))}
                      <div className="record-actions">
                        <button type="button" onClick={() => openEditDialog(record)}>Editar</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </section>

            {dialogOpen ? (
              <div className="dialog-overlay" role="presentation" onClick={closeDialog}>
                <div className="dialog-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                  <div className="dialog-head">
                    <h3>{dialogMode === 'edit' ? `Editar ${activeResource.label}` : `Crear ${activeResource.label}`}</h3>
                    <button type="button" className="close-btn" onClick={closeDialog}>X</button>
                  </div>

                  <form className="form-card" onSubmit={handleSubmitDialog}>
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
                    <button type="submit" disabled={saving}>
                      {saving ? 'Guardando...' : dialogMode === 'edit' ? 'Guardar cambios' : `Agregar ${activeResource.label}`}
                    </button>
                  </form>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}

export default App;
