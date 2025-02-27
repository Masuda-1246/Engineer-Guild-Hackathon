import React, { useState, useEffect } from 'react';
import { FileText, ArrowRight, Calendar, Download } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { BillingInvoicePage } from './BillingInvoicePage';

interface BillingHistory {
  year: number;
  month: number;
  count: number;
  amount: number;
}

interface BillingHistoryPageProps {
  onBack: () => void;
}

export function BillingHistoryPage({ onBack }: BillingHistoryPageProps) {
  const [history, setHistory] = useState<BillingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<{year: number, month: number} | null>(null);

  useEffect(() => {
    fetchBillingHistory();
  }, []);

  async function fetchBillingHistory() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ユーザーが見つかりません');

      // ユーザーの登録日を取得
      // profiles テーブルには created_at カラムがないため、updated_at を使用
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('updated_at')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // ユーザーの登録日がない場合は、デフォルトとして6ヶ月前を設定
      let userCreatedAt = profile?.updated_at;
      if (!userCreatedAt) {
        userCreatedAt = subMonths(new Date(), 6).toISOString();
      }

      // 登録日から現在までの月ごとの違反数を取得
      const startDate = parseISO(userCreatedAt);
      const endDate = new Date();
      
      // 月ごとのデータを集計
      const monthlyData: BillingHistory[] = [];
      let currentDate = startOfMonth(startDate);
      
      while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        
        const monthStart = startOfMonth(currentDate).toISOString();
        const monthEnd = endOfMonth(currentDate).toISOString();
        
        // その月の違反数と金額を取得
        const { data: confessions, error: confessionsError } = await supabase
          .from('confessions')
          .select(`
            id,
            rules (
              fine_amount
            )
          `)
          .eq('user_id', user.id)
          .gte('created_at', monthStart)
          .lte('created_at', monthEnd);
          
        if (confessionsError) throw confessionsError;
        
        // 違反があった月のみ追加
        if (confessions && confessions.length > 0) {
          const totalAmount = confessions.reduce((sum, confession) => {
            return sum + (confession.rules?.fine_amount || 0);
          }, 0);
          
          monthlyData.push({
            year,
            month,
            count: confessions.length,
            amount: totalAmount
          });
        }
        
        // 次の月へ
        currentDate = new Date(year, month, 1);
      }
      
      // 新しい月順にソート
      monthlyData.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
      
      setHistory(monthlyData);
    } catch (err) {
      console.error('Error fetching billing history:', err);
      setError('請求履歴の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  const handleViewInvoice = (year: number, month: number) => {
    setSelectedInvoice({ year, month });
  };

  if (selectedInvoice) {
    return (
      <BillingInvoicePage 
        year={selectedInvoice.year} 
        month={selectedInvoice.month} 
        onBack={() => setSelectedInvoice(null)} 
      />
    );
  }

  if (loading) {
    return (
      <div className="py-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 戻る
          </button>
          <h2 className="text-xl font-bold">請求履歴</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 戻る
          </button>
          <h2 className="text-xl font-bold">請求履歴</h2>
        </div>
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800"
        >
          ← 戻る
        </button>
        <h2 className="text-xl font-bold">請求履歴</h2>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            過去の請求履歴はありません
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map(({ year, month, count, amount }) => (
            <div
              key={`${year}-${month}`}
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-lg font-medium">
                    {format(new Date(year, month - 1), 'yyyy年M月', { locale: ja })}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:gap-4 mt-1">
                    <p className="text-gray-600">
                      違反回数: <span className="text-red-600 font-semibold">{count}回</span>
                    </p>
                    <p className="text-gray-600">
                      合計金額: <span className="text-red-600 font-semibold">¥{amount.toLocaleString()}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewInvoice(year, month)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Download className="w-5 h-5" />
                    <span className="hidden sm:inline">PDF</span>
                  </button>
                  <button
                    onClick={() => handleViewInvoice(year, month)}
                    className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary-50 rounded-lg"
                  >
                    <span>詳細</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}