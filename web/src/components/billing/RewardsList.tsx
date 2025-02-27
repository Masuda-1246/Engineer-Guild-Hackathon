import React from 'react';
import { TrendingUp } from 'lucide-react';

interface Reward {
  rule_title: string;
  group_name: string;
  count: number;
  amount: number;
}

interface RewardsListProps {
  rewards: Reward[];
}

export function RewardsList({ rewards }: RewardsListProps) {
  if (rewards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        今月の報酬はありません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rewards.map((reward, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-green-50 p-4 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium">{reward.rule_title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">
                  {reward.group_name}
                </span>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                  {reward.count}回の報告
                </span>
              </div>
            </div>
          </div>
          <span className="text-lg font-semibold text-green-600">
            ¥{reward.amount.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}