import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const CAMPUS_IMAGE = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=85';

const api = axios.create({ baseURL: API_URL });

const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('campus_token', token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem('campus_token');
  }
};

setAuthToken(localStorage.getItem('campus_token'));

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('campus_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const AuthContextValue = React.createContext(null);

const AuthContext = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(localStorage.getItem('campus_token'));

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setAuthToken(authToken);
    localStorage.setItem('campus_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem('campus_user');
  };

  useEffect(() => {
    if (token) setAuthToken(token);
  }, [token]);

  const value = useMemo(() => ({ user, token, login, logout }), [user, token]);

  return <AuthContextValue.Provider value={value}>{children}</AuthContextValue.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContextValue);
  if (!context) throw new Error('Auth context missing');
  return context;
};

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg site-navbar">
      <div className="container py-2">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span className="brand-mark"><i className="bi bi-heart-pulse-fill" /></span>
          <span>CampusCare</span>
        </Link>
        <div className="d-flex gap-3 align-items-center ms-auto">
          {!user ? (
            <>
              <Link className="nav-link nav-login" to="/login">Sign in</Link>
              <Link className="btn btn-primary nav-register" to="/register">Get started <i className="bi bi-arrow-up-right ms-1" /></Link>
            </>
          ) : (
            <>
              <Link className="nav-link nav-login" to="/dashboard">Dashboard</Link>
              <button className="btn btn-outline-primary" onClick={handleLogout}>Sign out</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const LandingPage = () => (
  <main className="landing-page">
    <section className="container hero-section">
      <div className="row align-items-center g-5">
        <div className="col-lg-6 hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> CAMPUS SUPPORT, MADE SIMPLE</div>
          <h1>Your campus.<br />Cared for <span>together.</span></h1>
          <p className="hero-description">A better way to report campus issues, follow every update, and get back to what matters.</p>
          <div className="d-flex flex-wrap gap-3 mt-4">
            <Link className="btn btn-primary btn-lg hero-cta" to="/register">Create your account <i className="bi bi-arrow-right ms-2" /></Link>
            <Link className="btn btn-outline-primary btn-lg hero-secondary" to="/login">Sign in</Link>
          </div>
          <div className="hero-trust"><i className="bi bi-check-circle-fill" /> Built for students and campus teams</div>
        </div>
        <div className="col-lg-6">
          <div className="hero-image-wrap">
            <img className="hero-image" src={CAMPUS_IMAGE} alt="A welcoming university campus" fetchpriority="high" />
            <div className="hero-image-shade" />
            <div className="image-caption">
              <span className="caption-icon"><i className="bi bi-buildings-fill" /></span>
              <div><strong>A better campus starts here</strong><small>One place for every service request</small></div>
            </div>
            <div className="floating-status">
              <span className="status-icon"><i className="bi bi-check2" /></span>
              <div><strong>Issue resolved</strong><small>Library study hall · Just now</small></div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section className="container feature-strip">
      <div className="feature-item"><span><i className="bi bi-send-check" /></span><div><strong>Report in seconds</strong><small>Tell us what needs attention</small></div></div>
      <div className="feature-item"><span><i className="bi bi-graph-up-arrow" /></span><div><strong>Follow every update</strong><small>Know what is happening next</small></div></div>
      <div className="feature-item"><span><i className="bi bi-people" /></span><div><strong>Better, together</strong><small>Connect with the right campus team</small></div></div>
    </section>
  </main>
);

const AuthPageLayout = ({ eyebrow, title, description, children }) => (
  <main className="auth-page container">
    <section className="auth-layout">
      <div className="auth-form-panel">
        <div className="auth-heading">
          <span className="auth-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {children}
      </div>
      <aside className="auth-image-panel">
        <img src={CAMPUS_IMAGE} alt="Students enjoying a bright campus day" />
        <div className="auth-image-shade" />
        <div className="auth-image-content">
          <span className="auth-image-icon"><i className="bi bi-stars" /></span>
          <h2>Small fixes.<br />Stronger community.</h2>
          <p>Every report helps make campus life a little better for everyone.</p>
          <div className="auth-image-proof"><span className="proof-avatars"><i className="bi bi-person-fill" /><i className="bi bi-person-fill" /><i className="bi bi-person-fill" /></span><span>Made for your campus community</span></div>
        </div>
      </aside>
    </section>
  </main>
);

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/login', form);
      const { user, token } = response.data.data;
      login(user, token);
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || (error.request ? 'Could not connect to the server. Please try again.' : 'Login failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageLayout eyebrow="WELCOME BACK" title="Sign in to CampusCare" description="Pick up where you left off. Your campus community is here to help.">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label" htmlFor="login-email">Email address</label>
          <input id="login-email" type="email" className="form-control" placeholder="you@campus.edu" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="mb-4">
          <label className="form-label" htmlFor="login-password">Password</label>
          <input id="login-password" type="password" className="form-control" placeholder="Enter your password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button className="btn btn-primary w-100 auth-submit" disabled={isSubmitting}>
          {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</> : <>Sign in <i className="bi bi-arrow-right ms-2" /></>}
        </button>
        <p className="auth-switch">New to CampusCare? <Link to="/register">Create an account</Link></p>
      </form>
    </AuthPageLayout>
  );
};

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/register', form);
      const { user, token } = response.data.data;
      login(user, token);
      toast.success('Registration successful');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || (error.request ? 'Could not connect to the server. Please try again.' : 'Registration failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageLayout eyebrow="GET STARTED" title="Join your campus community" description="Create an account to report issues and stay in the loop. It only takes a moment.">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label" htmlFor="register-name">Full name</label>
          <input id="register-name" className="form-control" placeholder="Your name" autoComplete="name" required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="register-email">Email address</label>
          <input id="register-email" type="email" className="form-control" placeholder="you@campus.edu" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="row g-3">
          <div className="col-md-7">
            <label className="form-label" htmlFor="register-password">Password</label>
            <input id="register-password" type="password" className="form-control" placeholder="At least 6 characters" autoComplete="new-password" minLength={6} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="col-md-5">
            <label className="form-label" htmlFor="register-role">I am a</label>
            <select id="register-role" className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary w-100 auth-submit mt-4" disabled={isSubmitting}>
          {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2" />Creating account...</> : <>Create account <i className="bi bi-arrow-right ms-2" /></>}
        </button>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </AuthPageLayout>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metrics, list] = await Promise.all([
          user?.role === 'admin' ? api.get('/analytics/dashboard') : Promise.resolve(null),
          api.get('/complaints'),
        ]);
        const complaintList = list.data.data || [];
        setComplaints(complaintList);

        if (metrics) {
          setStats(metrics.data.data || {});
        } else {
          const completedStatuses = ['Resolved', 'Closed', 'Rejected'];
          setStats({
            totalComplaints: complaintList.length,
            pendingComplaints: complaintList.filter((item) => !completedStatuses.includes(item.status)).length,
            resolved: complaintList.filter((item) => item.status === 'Resolved').length,
            critical: complaintList.filter((item) => item.priority === 'Critical').length,
          });
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [user?.role]);

  const cards = [
    { title: 'Total complaints', value: stats.totalComplaints || 0 },
    { title: 'Pending', value: stats.pendingComplaints || 0 },
    { title: 'Resolved', value: stats.resolved || 0 },
    { title: 'Critical', value: stats.critical || 0 },
  ];

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <p className="text-muted mb-1">Welcome back</p>
          <h2>{user?.name}</h2>
        </div>
        <Link className="btn btn-primary" to="/complaints/new">New complaint</Link>
      </div>

      <div className="row g-3 mb-4">
        {cards.map((card) => (
          <div key={card.title} className="col-md-3">
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-body">
                <small className="text-muted">{card.title}</small>
                <h3 className="mt-2 mb-0">{card.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body">
          <h5 className="mb-3">Recent complaints</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {complaints.slice(0, 5).map((item) => (
                  <tr key={item._id}>
                    <td>{item.ticketNumber}</td>
                    <td>{item.title}</td>
                    <td><span className="badge bg-info">{item.status}</span></td>
                    <td><span className="badge bg-warning text-dark">{item.priority}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const ComplaintsPage = () => {
  const pageSize = 10;
  const [complaints, setComplaints] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const result = await api.get('/complaints', {
          params: {
            page,
            limit: pageSize,
            ...(filters.search ? { search: filters.search } : {}),
            ...(filters.status ? { status: filters.status } : {}),
            ...(filters.priority ? { priority: filters.priority } : {}),
          },
          signal: controller.signal,
        });
        setComplaints(result.data.data || []);
        setPagination(result.data.pagination || { page, pages: 1, total: 0 });
      } catch (error) {
        if (!axios.isCancel(error)) {
          toast.error(error.response?.data?.message || 'Unable to load complaints');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchComplaints();
    return () => controller.abort();
  }, [filters, page]);

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({ search: '', status: '', priority: '' });
    setPage(1);
  };

  const firstResult = pagination.total ? (page - 1) * pageSize + 1 : 0;
  const lastResult = Math.min(page * pageSize, pagination.total);

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <p className="text-muted mb-1">CAMPUS SUPPORT</p>
          <h2 className="mb-1">Your complaints</h2>
          <p className="text-muted mb-0">Search, filter, and follow every service request.</p>
        </div>
        <Link className="btn btn-primary" to="/complaints/new">Add complaint</Link>
      </div>
      <section className="card shadow-sm border-0 rounded-4 mb-4" aria-label="Complaint filters">
        <div className="card-body">
          <form
            className="row g-3 align-items-end"
            onSubmit={(event) => {
              event.preventDefault();
              updateFilter('search', searchInput.trim());
            }}
          >
            <div className="col-lg-5">
              <label className="form-label" htmlFor="complaint-search">Search complaints</label>
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-search" aria-hidden="true" /></span>
                <input
                  id="complaint-search"
                  className="form-control"
                  placeholder="Ticket number, title, or location"
                  maxLength={100}
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
                <button className="btn btn-outline-primary" type="submit">Search</button>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <label className="form-label" htmlFor="complaint-status">Status</label>
              <select id="complaint-status" className="form-select" value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
                <option value="">All statuses</option>
                {['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Awaiting Complainant Response', 'Resolved', 'Reopened', 'Closed', 'Rejected'].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="col-sm-6 col-lg-2">
              <label className="form-label" htmlFor="complaint-priority">Priority</label>
              <select id="complaint-priority" className="form-select" value={filters.priority} onChange={(event) => updateFilter('priority', event.target.value)}>
                <option value="">All priorities</option>
                {['Low', 'Medium', 'High', 'Critical'].map((priority) => <option key={priority} value={priority}>{priority}</option>)}
              </select>
            </div>
            <div className="col-lg-2">
              <button className="btn btn-light border w-100" type="button" onClick={clearFilters}>
                <i className="bi bi-x-circle me-1" aria-hidden="true" /> Clear filters
              </button>
            </div>
          </form>
        </div>
      </section>
      <section className="card shadow-sm border-0 rounded-4" aria-label="Complaint results">
        <div className="card-body pb-0">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">All requests</h5>
            <small className="text-muted">{pagination.total} {pagination.total === 1 ? 'request' : 'requests'}</small>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Location</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="py-5 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" role="status" />Loading complaints...</td></tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-5 text-center">
                    <i className="bi bi-inbox display-6 text-muted" aria-hidden="true" />
                    <p className="mt-2 mb-1 fw-semibold">No complaints found</p>
                    <p className="text-muted mb-3">{filters.search || filters.status || filters.priority ? 'Try changing or clearing your filters.' : 'Your campus requests will appear here.'}</p>
                    {filters.search || filters.status || filters.priority ? (
                      <button className="btn btn-sm btn-outline-primary" type="button" onClick={clearFilters}>Clear filters</button>
                    ) : null}
                  </td>
                </tr>
              ) : complaints.map((item) => (
                <tr key={item._id}>
                  <td className="text-nowrap fw-semibold">{item.ticketNumber}</td>
                  <td><span className="fw-semibold">{item.title}</span></td>
                  <td><span className={`status-pill status-${item.status.toLowerCase().replace(/[^a-z]+/g, '-')}`}>{item.status}</span></td>
                  <td><span className={`priority-pill priority-${item.priority.toLowerCase()}`}>{item.priority}</span></td>
                  <td>{item.location}</td>
                  <td><Link className="btn btn-sm btn-outline-primary" to={`/complaints/${item._id}`}>Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 p-3 border-top">
          <small className="text-muted">Showing {firstResult}–{lastResult} of {pagination.total}</small>
          <nav aria-label="Complaint pages">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${page <= 1 || loading ? 'disabled' : ''}`}>
                <button className="page-link" type="button" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>
                  <i className="bi bi-chevron-left" aria-hidden="true" />
                </button>
              </li>
              <li className="page-item disabled"><span className="page-link">Page {page} of {Math.max(pagination.pages, 1)}</span></li>
              <li className={`page-item ${page >= pagination.pages || loading ? 'disabled' : ''}`}>
                <button className="page-link" type="button" aria-label="Next page" disabled={page >= pagination.pages || loading} onClick={() => setPage((current) => current + 1)}>
                  <i className="bi bi-chevron-right" aria-hidden="true" />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </section>
    </div>
  );
};

const NewComplaintPage = () => {
  const [form, setForm] = useState({ title: '', description: '', category: '', location: '', priority: 'Medium' });
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryRetry, setCategoryRetry] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const fetchCategories = async () => {
      setCategoryLoading(true);
      setCategoryError(false);
      try {
        const result = await api.get('/complaints/categories', { signal: controller.signal });
        const availableCategories = result.data.data || [];
        setCategories(availableCategories);
        setForm((current) => ({
          ...current,
          category: availableCategories.some((item) => item._id === current.category)
            ? current.category
            : availableCategories[0]?._id || '',
        }));
      } catch (error) {
        if (!axios.isCancel(error)) {
          setCategoryError(true);
          toast.error(error.response?.data?.message || 'Unable to load complaint categories');
        }
      } finally {
        if (!controller.signal.aborted) setCategoryLoading(false);
      }
    };
    fetchCategories();
    return () => controller.abort();
  }, [categoryRetry]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || categoryLoading || categoryError) {
      toast.error('Please select an available category before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/complaints', form);
      toast.success('Complaint submitted');
      navigate('/complaints');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 rounded-4 mx-auto" style={{ maxWidth: 700 }}>
        <div className="card-body">
          <h3 className="mb-4">Submit Complaint</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="complaint-title">Title</label>
              <input id="complaint-title" className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={150} />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="complaint-description">Description</label>
              <textarea id="complaint-description" className="form-control" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required maxLength={5000} />
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="complaint-category">Category</label>
                <select id="complaint-category" className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} disabled={categoryLoading || categoryError || categories.length === 0} required>
                  <option value="">{categoryLoading ? 'Loading categories...' : categoryError ? 'Categories unavailable' : categories.length ? 'Select a category' : 'No categories available'}</option>
                  {categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
                </select>
                {categoryError ? (
                  <button className="btn btn-link btn-sm px-0" type="button" onClick={() => setCategoryRetry((current) => current + 1)}>
                    <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />Retry loading categories
                  </button>
                ) : !categoryLoading && categories.length === 0 ? (
                  <small className="text-muted">Please contact an administrator to add complaint categories.</small>
                ) : null}
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="complaint-priority">Priority</label>
                <select id="complaint-priority" className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="form-label" htmlFor="complaint-location">Location</label>
              <input id="complaint-location" className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required maxLength={200} />
            </div>
            <button className="btn btn-primary mt-4" disabled={isSubmitting || categoryLoading || categoryError || !form.category}>
              {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2" />Submitting...</> : 'Submit complaint'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchComplaint = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const result = await api.get(`/complaints/${id}`, { signal: controller.signal });
        setComplaint(result.data.data);
      } catch (error) {
        if (!axios.isCancel(error)) {
          setLoadError(true);
          toast.error(error.response?.data?.message || 'Unable to load this complaint');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchComplaint();
    return () => controller.abort();
  }, [id]);

  const submitComment = async (event) => {
    event.preventDefault();
    const message = comment.trim();
    if (!message) return;

    setSubmitting(true);
    try {
      const result = await api.post(`/complaints/${id}/comments`, { message });
      setComplaint((current) => ({
        ...current,
        comments: [...(current.comments || []), { ...result.data.data, author: user }],
      }));
      setComment('');
      toast.success('Reply added');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to add your reply');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container py-5 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" role="status" />Loading complaint...</div>;
  if (loadError || !complaint) {
    return <div className="container py-5 text-center"><p className="text-muted">This complaint could not be loaded.</p><Link className="btn btn-outline-primary" to="/complaints">Back to complaints</Link></div>;
  }

  return (
    <div className="container py-4">
      <Link className="detail-back-link d-inline-flex align-items-center mb-3" to="/complaints"><i className="bi bi-arrow-left me-2" />Back to complaints</Link>
      <div className="row g-4">
        <div className="col-lg-7">
          <section className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                <div>
                  <p className="text-muted mb-1">{complaint.ticketNumber}</p>
                  <h2 className="h3 mb-0">{complaint.title}</h2>
                </div>
                <span className={`status-pill status-${complaint.status.toLowerCase().replace(/[^a-z]+/g, '-')}`}>{complaint.status}</span>
              </div>
              <p className="complaint-description">{complaint.description}</p>
              <div className="row g-3 complaint-meta">
                <div className="col-sm-6"><small>Priority</small><span className={`priority-pill priority-${complaint.priority.toLowerCase()}`}>{complaint.priority}</span></div>
                <div className="col-sm-6"><small>Location</small><strong>{complaint.location}</strong></div>
                <div className="col-sm-6"><small>Category</small><strong>{complaint.category?.name || 'Not specified'}</strong></div>
                <div className="col-sm-6"><small>Department</small><strong>{complaint.department?.name || 'Not assigned'}</strong></div>
                <div className="col-sm-6"><small>Assigned to</small><strong>{complaint.assignee?.name || 'Not assigned'}</strong></div>
                <div className="col-sm-6"><small>Last updated</small><strong>{complaint.updatedAt ? new Date(complaint.updatedAt).toLocaleString() : 'Not available'}</strong></div>
              </div>
            </div>
          </section>
        </div>
        <div className="col-lg-5">
          <section className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-body p-4">
              <h3 className="h5 mb-3">Updates &amp; activity</h3>
              {complaint.histories?.length ? (
                <ol className="activity-list">
                  {[...complaint.histories].reverse().map((entry) => (
                    <li key={entry._id}>
                      <span className="activity-dot" />
                      <div>
                        <strong>{entry.action === 'StatusChanged' ? `Status changed to ${entry.newValue}` : entry.action}</strong>
                        <p>{entry.notes || (entry.previousValue && entry.newValue ? `${entry.previousValue} → ${entry.newValue}` : 'Request activity recorded')}</p>
                        <small>{entry.actor?.name || 'Campus team'} · {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ''}</small>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : <p className="text-muted mb-0">No activity updates yet.</p>}
            </div>
          </section>
        </div>
        <div className="col-12">
          <section className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4">
              <h3 className="h5 mb-1">Conversation</h3>
              <p className="text-muted small mb-4">Share an update or answer a question about this request.</p>
              <div className="comment-list mb-4">
                {complaint.comments?.length ? complaint.comments.map((entry) => (
                  <article className="comment-item" key={entry._id}>
                    <div className="comment-avatar" aria-hidden="true">{(entry.author?.name || 'U').charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <strong>{entry.author?.name || 'Campus community member'}</strong>
                        <small className="text-muted">{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ''}</small>
                      </div>
                      <p className="mb-0 mt-1">{entry.message}</p>
                    </div>
                  </article>
                )) : <p className="text-muted mb-0">No replies yet. Add the first update below.</p>}
              </div>
              <form onSubmit={submitComment}>
                <label className="form-label" htmlFor="complaint-reply">Add a reply</label>
                <textarea
                  id="complaint-reply"
                  className="form-control"
                  rows={3}
                  maxLength={2000}
                  placeholder="Write an update..."
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  required
                />
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <small className="text-muted">{comment.length}/2000</small>
                  <button className="btn btn-primary" type="submit" disabled={submitting || !comment.trim()}>
                    {submitting ? <><span className="spinner-border spinner-border-sm me-2" />Sending...</> : <>Send reply <i className="bi bi-send ms-1" /></>}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const AdminPage = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      const result = await api.get('/admin/dashboard');
      setStats(result.data.data || {});
    };
    fetchStats();
  }, []);

  return (
    <div className="container py-4">
      <h2>Admin dashboard</h2>
      <div className="row g-3 mt-3">
        <div className="col-md-3"><div className="card p-3"><h5>{stats.totalComplaints || 0}</h5>Total Complaints</div></div>
        <div className="col-md-3"><div className="card p-3"><h5>{stats.openComplaints || 0}</h5>Open</div></div>
        <div className="col-md-3"><div className="card p-3"><h5>{stats.resolvedComplaints || 0}</h5>Resolved</div></div>
        <div className="col-md-3"><div className="card p-3"><h5>{stats.criticalComplaints || 0}</h5>Critical</div></div>
      </div>
    </div>
  );
};

const AppShell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user && location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/') {
      navigate('/login');
    }
  }, [user, location.pathname]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/complaints" element={<ProtectedRoute><ComplaintsPage /></ProtectedRoute>} />
        <Route path="/complaints/new" element={<ProtectedRoute><NewComplaintPage /></ProtectedRoute>} />
        <Route path="/complaints/:id" element={<ProtectedRoute><ComplaintDetailPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <AuthContext>
      <AppShell />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthContext>
  );
}
