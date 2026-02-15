'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useLanguage } from '@/lib/LanguageContext';
import { localText } from '@/lib/translations';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { sellerHasAccess } from '@/lib/sellerAccess';
import FounderOfferGate from '@/components/dashboard/FounderOfferGate';

export default function CategoriesPage() {
  const { language } = useLanguage();

  const seller = useQuery(api.sellers.getCurrentSellerProfile);
  const categories = useQuery(api.categories.getCategories);
  const createCategory = useMutation(api.categories.createCategory);
  const updateCategory = useMutation(api.categories.updateCategory);
  const deleteCategory = useMutation(api.categories.deleteCategory);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<'categories'> | null>(null);
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !nameAr.trim()) {
      alert(localText(language, { ar: 'يرجى ملء جميع الحقول', en: 'Please fill all fields', fr: 'Veuillez remplir tous les champs' }));
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateCategory({ categoryId: editingId, name, nameAr });
      } else {
        await createCategory({ name, nameAr });
      }
      resetForm();
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: NonNullable<typeof categories>[0]) => {
    setEditingId(category._id);
    setName(category.name);
    setNameAr(category.nameAr);
    setShowForm(true);
  };

  const handleDelete = async (categoryId: Id<'categories'>) => {
    if (!confirm(localText(language, { ar: 'هل أنت متأكد من حذف هذه الفئة؟', en: 'Are you sure you want to delete this category?', fr: 'Êtes-vous sûr de vouloir supprimer cette catégorie ?' }))) {
      return;
    }
    await deleteCategory({ categoryId });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setNameAr('');
  };

  if (seller && !sellerHasAccess(seller)) {
    return <FounderOfferGate />;
  }

  if (!categories) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-slate-900"
            style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
          >
            {localText(language, { ar: 'فئات المنتجات', en: 'Product Categories', fr: 'Catégories de produits' })}
          </h1>
          <p className="text-slate-500 mt-1">
            {localText(language, { ar: 'تنظيم منتجاتك في فئات لتسهيل التصفح', en: 'Organize your products into categories for easier browsing', fr: 'Organisez vos produits en catégories pour faciliter la navigation' })}
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            {localText(language, { ar: '+ إضافة فئة', en: '+ Add Category', fr: '+ Ajouter une catégorie' })}
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {editingId
              ? localText(language, { ar: 'تعديل الفئة', en: 'Edit Category', fr: 'Modifier la catégorie' })
              : localText(language, { ar: 'إضافة فئة جديدة', en: 'Add New Category', fr: 'Ajouter une nouvelle catégorie' })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {localText(language, { ar: 'الاسم بالإنجليزية', en: 'English Name', fr: 'Nom en anglais' })}
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Electronics"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {localText(language, { ar: 'الاسم بالعربية', en: 'Arabic Name', fr: 'Nom en arabe' })}
              </label>
              <Input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="إلكترونيات"
                dir="rtl"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleSubmit} disabled={saving}>
              {saving
                ? localText(language, { ar: 'جاري الحفظ...', en: 'Saving...', fr: 'Enregistrement...' })
                : editingId
                ? localText(language, { ar: 'تحديث', en: 'Update', fr: 'Mettre à jour' })
                : localText(language, { ar: 'إضافة', en: 'Add', fr: 'Ajouter' })}
            </Button>
            <Button variant="secondary" onClick={resetForm}>
              {localText(language, { ar: 'إلغاء', en: 'Cancel', fr: 'Annuler' })}
            </Button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {localText(language, { ar: 'لا توجد فئات. أضف فئتك الأولى.', en: 'No categories. Add your first category.', fr: 'Aucune catégorie. Ajoutez votre première catégorie.' })}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {categories.map((category, index) => (
              <div
                key={category._id}
                className="p-4 flex items-center justify-between hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-medium text-slate-900">{category.name}</div>
                    <div className="text-sm text-slate-500">{category.nameAr}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="px-3 py-1.5 text-sm text-[#0054A6] hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {localText(language, { ar: 'تعديل', en: 'Edit', fr: 'Modifier' })}
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {localText(language, { ar: 'حذف', en: 'Delete', fr: 'Supprimer' })}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
