import React from 'react';

interface RuleViolation {
  rule: string;
  count: number;
}

interface RuleCardProps {
  groupName: string;
  totalViolations: number;
  violations: RuleViolation[];
  tags: string[];
}

export function RuleCard({ groupName, totalViolations, violations, tags }: RuleCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{groupName}</h3>
        <span className="text-sm text-gray-500">今月の違反: {totalViolations}件</span>
      </div>
      
      {/* タグ一覧 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-medium"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="space-y-2">
        {violations.map((violation, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-primary-50 rounded"
          >
            <span>{violation.rule}</span>
            <span className="text-primary-600">{violation.count}件</span>
          </div>
        ))}
      </div>
    </div>
  );
}