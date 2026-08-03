import { useState, useMemo } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useCategory } from '../context/CategoryContext';
import { categoryApi } from '../services/api/categoryApi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CategoryModal from '../components/categories/CategoryModal';
import { EDIT_ICON, DELETE_ICON } from '../components/ui/FormField';

export default function Categories() {
  const { categories, fetchCategories, loading } = useCategory();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('EXPENSE');

  const filtered = useMemo(() => {
    return categories.filter(c => {
      if (filterType !== 'ALL' && c.type !== filterType) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [categories, search, filterType]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryApi.deleteCategory(id);
        fetchCategories();
      } catch (err) {
        alert(err.message || 'Failed to delete category');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Categories</h1>
            <p className="text-sm text-slate-400">Manage your income and expense categories.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { setModalType('EXPENSE'); setIsModalOpen(true); }} variant="primary">+ Expense Category</Button>
            <Button onClick={() => { setModalType('INCOME'); setIsModalOpen(true); }} variant="outline">+ Income Category</Button>
          </div>
        </div>

        <Card padding="md">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input flex-1"
            />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="input sm:w-48"
            >
              <option value="ALL">All Types</option>
              <option value="EXPENSE">Expenses Only</option>
              <option value="INCOME">Income Only</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            {loading && categories.length === 0 ? (
              <p className="text-center py-6 text-slate-400">Loading categories...</p>
            ) : filtered.length === 0 ? (
              <p className="text-center py-6 text-slate-400">No categories found.</p>
            ) : (
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-surface-800/50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Icon</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700/50">
                  {filtered.map(cat => (
                    <tr key={cat.id} className="hover:bg-surface-700/20">
                      <td className="px-4 py-3 text-2xl">{cat.icon}</td>
                      <td className="px-4 py-3 font-medium text-white">{cat.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${
                          cat.type === 'INCOME' ? 'bg-success-500/10 text-success-400' : 'bg-danger-500/10 text-danger-400'
                        }`}>
                          {cat.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 text-slate-500 hover:text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors"
                          title="Delete category"
                        >
                          {DELETE_ICON}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      <CategoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        type={modalType} 
      />
    </DashboardLayout>
  );
}
