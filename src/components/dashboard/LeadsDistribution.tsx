import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LEAD_STATUS_CONFIG, LEAD_STATUS_ORDER, type LeadStatus } from "@/hooks/useLeads";

interface LeadsDistributionProps {
  data?: Record<LeadStatus, number>;
  isLoading?: boolean;
}

export function LeadsDistribution({ data, isLoading }: LeadsDistributionProps) {
  const total = data
    ? Object.values(data).reduce((sum, count) => sum + count, 0)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Distribuição de Leads</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-6 w-28 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              {LEAD_STATUS_ORDER.map((status) => {
                const config = LEAD_STATUS_CONFIG[status];
                const count = data?.[status] ?? 0;
                return (
                  <div key={status} className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${config.bgColor}`} />
                    <span className="text-sm">
                      {config.label}: <strong>{count}</strong>
                    </span>
                  </div>
                );
              })}
            </div>
            {total > 0 && (
              <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                {LEAD_STATUS_ORDER.map((status) => {
                  const count = data?.[status] ?? 0;
                  const percentage = (count / total) * 100;
                  if (percentage === 0) return null;
                  const config = LEAD_STATUS_CONFIG[status];
                  return (
                    <div
                      key={status}
                      className={config.bgColor}
                      style={{ width: `${percentage}%` }}
                      title={`${config.label}: ${count} (${percentage.toFixed(1)}%)`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
