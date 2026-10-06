import { useEffect, useState } from 'react';
import * as categoriesApi from '../../api/categories.api.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Icon from '../../components/ui/Icon.jsx';

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    categoriesApi.list()
      .then(setCategories)
      .catch((apiError) => setError(apiError.response?.data?.message || 'No se pudieron cargar las categorías.'));
  }, []);

  return (
    <section className="surface-card page-card">
      <PageHeader eyebrow="Configuración" title="Categorías de reportes" description="Tipos de problemas urbanos disponibles para la ciudadanía." />
      {error && <p className="form-error table-message">{error}</p>}
      <div className="category-grid">
        {categories.map((category) => (
          <article className="category-card" key={category.id} style={{ '--category-color': category.color }}>
            <span><Icon name="categories" /></span>
            <div><h2>{category.name}</h2><p>{category.reportCount} reportes registrados</p></div>
            <span className={`status-badge ${category.active ? 'status-success' : 'status-danger'}`}>{category.active ? 'Activa' : 'Inactiva'}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
