import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Clock, Download, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { BillingHeader } from './BillingHeader';
import { BillingCharts } from './BillingCharts';
import { ViolationList } from './ViolationList';
import { BillingHistoryPage } from './BillingHistoryPage';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { RewardsList } from './RewardsList';
import { BalanceSummary } from './BalanceSummary';

// Register Japanese font
Font.register({
  family: 'Noto Sans JP',
  src: 'https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75s.ttf'
});

// PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Noto Sans JP'
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  headerText: {
    fontSize: 12
  },
  customerInfo: {
    marginBottom: 20
  },
  customerName: {
    fontSize: 14,
    marginBottom: 5
  },
  totalAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: 1,
    borderBottom: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 10,
    marginBottom: 20
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  totalValue: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: 'bold'
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 30,
    alignItems: 'center'
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    fontWeight: 'bold',
    fontSize: 10
  },
  tableCell: {
    padding: 5,
    fontSize: 9
  },
  groupCell: {
    width: '25%',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb'
  },
  violationCell: {
    width: '45%',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb'
  },
  countCell: {
    width: '10%',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    textAlign: 'center'
  },
  amountCell: {
    width: '20%',
    textAlign: 'right'
  },
  footer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4
  },
  footerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5
  },
  footerText: {
    fontSize: 10
  },
  emptyRow: {
    textAlign: 'center',
    padding: 20,
    color: '#6b7280'
  },
  tableSummary: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 30,
    alignItems: 'center',
    backgroundColor: '#f9fafb'
  }
});

interface Violation {
  rule_title: string;
  group_name: string;
  count: number;
  amount: number;
}

interface Reward {
  rule_title: string;
  group_name: string;
  count: number;
  amount: number;
}

interface DailyData {
  date: string;
  amount: number;
  totalAmount: number;
}

// PDF Document Component
const InvoicePDF = ({ violations, totalAmount, userName, year, month }: { 
  violations: Violation[], 
  totalAmount: number, 
  userName: string,
  year: number,
  month: number
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>請求書 / Invoice</Text>
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerText}>請求番号 / Invoice No.: {year}{month.toString().padStart(2, '0')}-001</Text>
          <Text style={styles.headerText}>請求日 / Date: {format(new Date(), 'yyyy/MM/dd', { locale: ja })}</Text>
          <Text style={styles.headerText}>支払期限 / Due Date: {format(endOfMonth(new Date(year, month - 1)), 'yyyy/MM/dd', { locale: ja })}</Text>
        </View>
        <View>
          <Text style={styles.headerText}>請求先 / To:</Text>
          <Text style={styles.headerText}>{userName} 様</Text>
        </View>
      </View>
      
      <Text style={styles.headerText}>請求期間 / Period: {year}年{month}月</Text>
      
      <View style={styles.totalAmount}>
        <Text style={styles.totalLabel}>合計金額 / Total:</Text>
        <Text style={styles.totalValue}>¥{totalAmount.toLocaleString()}</Text>
      </View>
      
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.groupCell]}>グループ / Group</Text>
          <Text style={[styles.tableCell, styles.violationCell]}>違反内容 / Violation</Text>
          <Text style={[styles.tableCell, styles.countCell]}>回数 / Count</Text>
          <Text style={[styles.tableCell, styles.amountCell]}>金額 / Amount</Text>
        </View>
        
        {violations.length > 0 ? (
          violations.map((violation, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.groupCell]}>{violation.group_name}</Text>
              <Text style={[styles.tableCell, styles.violationCell]}>{violation.rule_title}</Text>
              <Text style={[styles.tableCell, styles.countCell]}>{violation.count}</Text>
              <Text style={[styles.tableCell, styles.amountCell]}>¥{violation.amount.toLocaleString()}</Text>
            </View>
          ))
        ) : (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '100%', textAlign: 'center' }]}>
              この月の違反はありません / No violations this month
            </Text>
          </View>
        )}
        
        <View style={styles.tableSummary}>
          <Text style={[styles.tableCell, { width: '80%', textAlign: 'right', fontWeight: 'bold' }]}>
            合計 / Total
          </Text>
          <Text style={[styles.tableCell, styles.amountCell, { fontWeight: 'bold' }]}>
            ¥{totalAmount.toLocaleString()}
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>お支払い方法 / Payment Method</Text>
        <Text style={styles.footerText}>グループ管理者の指示に従って、指定された方法でお支払いください。</Text>
        <Text style={styles.footerText}>Please follow the instructions from your group administrator for payment.</Text>
      </View>
      
      <Text style={{ fontSize: 10, position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center' }}>
        私がやりました - 違反管理システム / Violation Management System
      </Text>
    </Page>
  </Document>
);

type BillingTab = '罰金' | '報酬' | '収支';

export function BillingPage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPenaltyAmount, setTotalPenaltyAmount] = useState(0);
  const [totalRewardAmount, setTotalRewardAmount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState<BillingTab>('罰金');

  useEffect(() => {
    fetchBillingData();
  }, []);

  async function fetchBillingData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ユーザーが見つかりません');

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setUserName(profile?.name || user.email || '');

      const startDate = startOfMonth(new Date());
      const endDate = endOfMonth(new Date());

      // Fetch penalties (confessions made by the user)
      const { data: confessions, error: confessionsError } = await supabase
        .from('confessions')
        .select(`
          rule_id,
          rules (
            title,
            fine_amount
          ),
          posts (
            groups (
              name
            )
          ),
          created_at
        `)
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (confessionsError) throw confessionsError;

      // Fetch rewards (confessions made on user's posts)
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('confessions')
        .select(`
          rule_id,
          rules (
            title,
            fine_amount
          ),
          posts (
            groups (
              name
            ),
            user_id
          ),
          created_at
        `)
        .eq('posts.user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (rewardsError) throw rewardsError;

      // Process penalties
      const violationsMap = new Map<string, Violation>();
      const allConfessions: { date: Date; amount: number }[] = [];

      confessions?.forEach(confession => {
        if (!confession.rules || !confession.posts?.groups) return;

        const key = `${confession.rule_id}-${confession.posts.groups.name}`;
        const existing = violationsMap.get(key);

        if (existing) {
          existing.count += 1;
          existing.amount += confession.rules.fine_amount;
        } else {
          violationsMap.set(key, {
            rule_title: confession.rules.title,
            group_name: confession.posts.groups.name,
            count: 1,
            amount: confession.rules.fine_amount
          });
        }

        allConfessions.push({
          date: new Date(confession.created_at),
          amount: confession.rules.fine_amount
        });
      });

      // Process rewards
      const rewardsMap = new Map<string, Reward>();
      
      rewardsData?.forEach(reward => {
        if (!reward.rules || !reward.posts?.groups) return;

        const key = `${reward.rule_id}-${reward.posts.groups.name}`;
        const existing = rewardsMap.get(key);

        if (existing) {
          existing.count += 1;
          existing.amount += reward.rules.fine_amount;
        } else {
          rewardsMap.set(key, {
            rule_title: reward.rules.title,
            group_name: reward.posts.groups.name,
            count: 1,
            amount: reward.rules.fine_amount
          });
        }
      });

      const violationsList = Array.from(violationsMap.values());
      const rewardsList = Array.from(rewardsMap.values());
      
      const totalFineAmount = violationsList.reduce((sum, v) => sum + v.amount, 0);
      const totalRewardAmount = rewardsList.reduce((sum, r) => sum + r.amount, 0);

      const days = eachDayOfInterval({ start: startDate, end: endDate });
      const dailyDataPoints = days.map(day => {
        const dayAmount = allConfessions
          .filter(confession => isSameDay(confession.date, day))
          .reduce((sum, confession) => sum + confession.amount, 0);

        return {
          date: format(day, 'M/d'),
          amount: dayAmount
        };
      });

      let runningTotal = 0;
      const dailyDataWithTotal = dailyDataPoints.map(day => ({
        ...day,
        totalAmount: (runningTotal += day.amount)
      }));

      setViolations(violationsList);
      setRewards(rewardsList);
      setDailyData(dailyDataWithTotal);
      setTotalPenaltyAmount(totalFineAmount);
      setTotalRewardAmount(totalRewardAmount);
    } catch (err) {
      console.error('Error fetching billing data:', err);
      setError('請求データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  const generateCurrentMonthPDF = async () => {
    try {
      setGenerating(true);
      
      // Current date information
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      // Generate PDF blob
      const blob = await pdf(
        <InvoicePDF 
          violations={violations} 
          totalAmount={totalPenaltyAmount} 
          userName={userName}
          year={year}
          month={month}
        />
      ).toBlob();
      
      // Save the PDF
      saveAs(blob, `請求書_${year}年${month}月.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('PDFの生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  if (showHistory) {
    return <BillingHistoryPage onBack={() => setShowHistory(false)} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg mt-4">
        {error}
      </div>
    );
  }

  return (
    <div className="py-4">
      <h2 className="text-xl font-bold mb-6">請求</h2>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('罰金')}
            className={`px-4 py-2 -mb-px flex items-center gap-2 ${
              activeTab === '罰金'
                ? 'border-b-2 border-primary text-primary font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>罰金</span>
          </button>
          <button
            onClick={() => setActiveTab('報酬')}
            className={`px-4 py-2 -mb-px flex items-center gap-2 ${
              activeTab === '報酬'
                ? 'border-b-2 border-primary text-primary font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>報酬</span>
          </button>
          <button
            onClick={() => setActiveTab('収支')}
            className={`px-4 py-2 -mb-px flex items-center gap-2 ${
              activeTab === '収支'
                ? 'border-b-2 border-primary text-primary font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>収支</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === '罰金' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <BillingHeader totalAmount={totalPenaltyAmount} />
              <button
                onClick={generateCurrentMonthPDF}
                disabled={generating}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
            <BillingCharts dailyData={dailyData} violations={violations} />
            <ViolationList violations={violations} />
          </>
        )}

        {activeTab === '報酬' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">今月の報酬額</h3>
                <span className="text-2xl font-bold text-green-600 ml-4">
                  ¥{totalRewardAmount.toLocaleString()}
                </span>
              </div>
            </div>
            <RewardsList rewards={rewards} />
          </>
        )}

        {activeTab === '収支' && (
          <BalanceSummary 
            penalties={totalPenaltyAmount} 
            rewards={totalRewardAmount} 
          />
        )}

        <div className="mt-8 pt-6 border-t">
          <button
            onClick={() => setShowHistory(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Clock className="w-5 h-5" />
            <span>過去の請求履歴を見る</span>
          </button>
        </div>
      </div>
    </div>
  );
}