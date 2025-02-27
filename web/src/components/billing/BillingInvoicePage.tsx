import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Download, FileText, DollarSign } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ja } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

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
  dateCell: {
    width: '20%',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb'
  },
  groupCell: {
    width: '20%',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb'
  },
  violationCell: {
    width: '40%',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb'
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

interface InvoiceViolation {
  id: string;
  rule_title: string;
  fine_amount: number;
  created_at: string;
  group_name: string;
}

interface BillingInvoicePageProps {
  year: number;
  month: number;
  onBack: () => void;
}

// PDF Document Component
const InvoicePDF = ({ violations, totalAmount, userName, year, month }: { 
  violations: InvoiceViolation[], 
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
          <Text style={[styles.tableCell, styles.dateCell]}>日付 / Date</Text>
          <Text style={[styles.tableCell, styles.groupCell]}>グループ / Group</Text>
          <Text style={[styles.tableCell, styles.violationCell]}>違反内容 / Violation</Text>
          <Text style={[styles.tableCell, styles.amountCell]}>金額 / Amount</Text>
        </View>
        
        {violations.length > 0 ? (
          violations.map((violation, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.dateCell]}>
                {format(parseISO(violation.created_at), 'yyyy/MM/dd', { locale: ja })}
              </Text>
              <Text style={[styles.tableCell, styles.groupCell]}>{violation.group_name}</Text>
              <Text style={[styles.tableCell, styles.violationCell]}>{violation.rule_title}</Text>
              <Text style={[styles.tableCell, styles.amountCell]}>¥{violation.fine_amount.toLocaleString()}</Text>
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

export function BillingInvoicePage({ year, month, onBack }: BillingInvoicePageProps) {
  const [violations, setViolations] = useState<InvoiceViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [userName, setUserName] = useState('');
  const [generating, setGenerating] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInvoiceData();
  }, [year, month]);

  async function fetchInvoiceData() {
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

      const monthStart = startOfMonth(new Date(year, month - 1)).toISOString();
      const monthEnd = endOfMonth(new Date(year, month - 1)).toISOString();

      const { data: confessions, error: confessionsError } = await supabase
        .from('confessions')
        .select(`
          id,
          created_at,
          rules (
            title,
            fine_amount
          ),
          posts (
            groups (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd)
        .order('created_at', { ascending: false });

      if (confessionsError) throw confessionsError;

      const formattedViolations: InvoiceViolation[] = confessions
        .filter(confession => confession.rules && confession.posts?.groups)
        .map(confession => ({
          id: confession.id,
          rule_title: confession.rules.title,
          fine_amount: confession.rules.fine_amount,
          created_at: confession.created_at,
          group_name: confession.posts.groups.name
        }));

      const total = formattedViolations.reduce((sum, v) => sum + v.fine_amount, 0);

      setViolations(formattedViolations);
      setTotalAmount(total);
    } catch (err) {
      console.error('Error fetching invoice data:', err);
      setError('請求データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'yyyy/MM/dd', { locale: ja });
  };

  const generatePDF = async () => {
    try {
      setGenerating(true);
      
      // Generate PDF blob
      const blob = await pdf(
        <InvoicePDF 
          violations={violations} 
          totalAmount={totalAmount} 
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

  if (loading) {
    return (
      <div className="py-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">請求書</h2>
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
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">請求書</h2>
        </div>
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">請求書</h2>
        </div>
        <button
          onClick={generatePDF}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          <span>{generating ? 'PDFを生成中...' : 'PDFをダウンロード'}</span>
        </button>
      </div>

      <div ref={invoiceRef} className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-xl font-bold mb-1">請求書</h3>
            <p className="text-gray-600">
              {format(new Date(year, month - 1), 'yyyy年M月', { locale: ja })}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-2">
              <FileText className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600">請求番号: {year}{month.toString().padStart(2, '0')}-001</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <DollarSign className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600">支払期限: {format(endOfMonth(new Date(year, month - 1)), 'yyyy/MM/dd', { locale: ja })}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-b py-4 mb-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">合計金額</h4>
            <span className="text-2xl font-bold text-red-600">¥{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="font-semibold mb-4">明細</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日付
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    グループ
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    違反内容
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金額
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {violations.map((violation) => (
                  <tr key={violation.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(violation.created_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {violation.group_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {violation.rule_title}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                      ¥{violation.fine_amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {violations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      この月の違反はありません
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-medium">
                    合計
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">
                    ¥{totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">お支払い方法</h4>
          <p className="text-gray-600 text-sm">
            グループ管理者の指示に従って、指定された方法でお支払いください。
          </p>
        </div>
      </div>
    </div>
  );
}