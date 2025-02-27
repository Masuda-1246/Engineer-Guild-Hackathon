import React from 'react';
import { TrendingDown, TrendingUp, DollarSign } from 'lucide-react';

interface BalanceSummaryProps {
  penalties: number;
  rewards: number;
}

export function BalanceSummary({ penalties, rewards }: BalanceSummaryProps) {
  const balance = rewards - penalties;
  const isPositive = balance >= 0;

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">今月の収支サマリー</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <span className="font-medium">罰金支払い</span>
            </div>
            <span className="text-lg font-semibold text-red-600">
              -¥{penalties.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-medium">報酬獲得</span>
            </div>
            <span className="text-lg font-semibold text-green-600">
              +¥{rewards.toLocaleString()}
            </span>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between p-3 rounded-lg" 
              style={{ 
                backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                  }}
                >
                  <DollarSign className="w-5 h-5" 
                    style={{ 
                      color: isPositive ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)'
                    }}
                  />
                </div>
                <span className="font-medium">収支合計</span>
              </div>
              <span className="text-xl font-bold" 
                style={{ 
                  color: isPositive ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)'
                }}
              >
                {isPositive ? '+' : ''}¥{balance.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">収支について</h4>
        <p className="text-sm text-gray-600">
          収支がプラスの場合、報酬が罰金を上回っています。マイナスの場合は、罰金の方が多いことを示しています。
          グループ管理者に連絡して、報酬の受け取り方法を確認してください。
        </p>
      </div>
    </div>
  );
}