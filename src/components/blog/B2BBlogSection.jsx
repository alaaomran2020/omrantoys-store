import React, { useState } from 'react';
import { BookOpen, Clock, Eye, CheckCircle, BarChart3, Truck, Package, Lightbulb, FileText, Tag, Calendar, User, TrendingUp } from 'lucide-react';
import { b2bArticles, blogCategories } from '../../data/b2bBlog';

export default function B2BBlogSection() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const filtered = selectedCategory === 'all' ? b2bArticles : b2bArticles.filter(a => a.category === selectedCategory);

  const categoryIcons = {
    pricing: BarChart3,
    logistics: Truck,
    inventory: Package,
    guides: Lightbulb,
    regulations: FileText,
  };

  if (selectedArticle) {
    const Icon = categoryIcons[selectedArticle.category] || FileText;
    return (
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={() => setSelectedArticle(null)} className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-xl cursor-pointer">
          ← العودة للمقالات
        </button>

        <article className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="relative h-64 overflow-hidden">
            <img src={selectedArticle.featured_image} alt={selectedArticle.title_ar} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
            <div className="absolute bottom-0 right-0 left-0 p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  {blogCategories.find(c => c.id === selectedArticle.category)?.name}
                </span>
                {selectedArticle.is_verified && (
                  <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    موثق ببيانات
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black leading-tight">{selectedArticle.title_ar}</h1>
              <div className="flex items-center gap-4 mt-3 text-xs text-white/80">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {selectedArticle.published_at}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedArticle.reading_time_minutes} دقائق</span>
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {selectedArticle.views_count} قراءة</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6 text-xs">
              <User className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-700">{selectedArticle.author_name}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">مصادر البيانات: {selectedArticle.data_sources.join('، ')}</span>
            </div>

            <div className="prose prose-slate max-w-none prose-sm leading-relaxed">
              <div className="whitespace-pre-line text-sm text-slate-700 leading-8">
                {selectedArticle.content_ar}
              </div>
            </div>

            <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-xs text-slate-900">التزام المصداقية التجارية</h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    هذا المقال يعتمد على بيانات فعلية من عمليات عمران التجارية ومصادر موثقة. لا يحتوي على عبارات ترويجية مبالغ فيها. الأرقام المذكورة هي متوسطات وقد تختلف حسب المحافظة والموسم. للاستفسار عن بيانات محددة تواصل معنا.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {selectedArticle.keywords.map(k => (
                <span key={k} className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {k}
                </span>
              ))}
            </div>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section id="b2b-blog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-slate-50/50">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-black mb-4">
          <BookOpen className="w-4 h-4" />
          قسم التجار - محتوى موثق ببيانات
        </div>
        <h2 className="text-3xl font-black text-slate-900">دليل التاجر: بيانات وأرقام بدون مبالغة</h2>
        <p className="text-sm text-slate-500 mt-3 leading-relaxed">
          مقالات عملية مبنية على بيانات فعلية من السوق المصري: تسعير، لوجستيات، دوران مخزون. 
          <strong className="text-slate-700"> بدون عبارات ترويجية</strong> - فقط أرقام ومصادر واضحة لمساعدتك في اتخاذ قرار تجاري.
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> بيانات موثقة</span>
          <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3 text-blue-500" /> أرقام فعلية</span>
          <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-amber-500" /> مصادر واضحة</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-6">
        {blogCategories.map(cat => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${isActive ? 'bg-slate-900 text-white shadow' : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'}`}
            >
              {cat.name}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>{cat.count}</span>
            </button>
          );
        })}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(article => {
          const Icon = categoryIcons[article.category] || FileText;
          return (
            <article key={article.id} onClick={() => setSelectedArticle(article)} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 overflow-hidden cursor-pointer group flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img src={article.featured_image} alt={article.title_ar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className="bg-white/90 backdrop-blur text-slate-800 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                    <Icon className="w-3 h-3" />
                    {blogCategories.find(c => c.id === article.category)?.name}
                  </span>
                  {article.is_verified && (
                    <span className="bg-emerald-500 text-white px-2 py-1 rounded-full text-[10px] font-bold">موثق</span>
                  )}
                </div>
                <div className="absolute bottom-3 right-3 left-3">
                  <h3 className="font-black text-white text-sm leading-snug line-clamp-2 group-hover:text-amber-200 transition-colors">{article.title_ar}</h3>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">{article.excerpt_ar}</p>
                
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.reading_time_minutes} د</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {article.views_count}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {article.published_at}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {article.keywords.slice(0, 2).map(k => (
                        <span key={k} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{k}</span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-toy-red group-hover:underline">اقرأ المزيد ←</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span>مصدر: {article.data_sources[0]}</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
          <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-600">لا توجد مقالات في هذا التصنيف</p>
        </div>
      )}
    </section>
  );
}
