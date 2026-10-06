import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import * as reportsApi from '../api/reports.api.js';

const ReportsContext = createContext(null);

export function ReportsProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadedFor, setLoadedFor] = useState('');
  const scopeKey = user ? `${user.id}:${user.role}` : '';

  useEffect(() => {
    let active = true;

    async function loadReports() {
      if (!isAuthenticated) {
        setReports([]);
        setLoadedFor('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const data = await reportsApi.list();
        if (active) setReports(data);
      } catch (apiError) {
        if (active) setError(apiError.response?.data?.message || 'No se pudieron cargar los reportes.');
      } finally {
        if (active) {
          setLoadedFor(scopeKey);
          setLoading(false);
        }
      }
    }

    loadReports();
    return () => { active = false; };
  }, [isAuthenticated, scopeKey]);

  async function refreshReports() {
    setLoading(true);
    setError('');
    try {
      const data = await reportsApi.list();
      setReports(data);
      return data;
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'No se pudieron cargar los reportes.');
      throw apiError;
    } finally {
      setLoading(false);
    }
  }

  async function createReport(payload) {
    const report = await reportsApi.create(payload);
    setReports((current) => [report, ...current]);
    return report;
  }

  async function assignReport(id, technicianId) {
    const report = await reportsApi.assign(id, Number(technicianId));
    setReports((current) => current.map((item) => item.id === report.id ? report : item));
    return report;
  }

  async function updateReportStatus(id, changes) {
    const report = await reportsApi.updateStatus(id, changes);
    setReports((current) => current.map((item) => item.id === report.id ? report : item));
    return report;
  }

  const value = useMemo(() => ({
    reports,
    loading: loading || (isAuthenticated && loadedFor !== scopeKey),
    error,
    refreshReports,
    createReport,
    assignReport,
    updateReportStatus,
    getReport: (id) => reports.find((report) => report.id === id)
  }), [reports, loading, error, isAuthenticated, loadedFor, scopeKey]);

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (!context) throw new Error('useReports debe usarse dentro de ReportsProvider.');
  return context;
}
