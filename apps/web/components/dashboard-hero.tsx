"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, StyledTabsList, StyledTabsTrigger, StyledTabsContent, Tabs } from "@jn7f1qecj9mg71yhrzbfnmmpsn7sh1ep/components";
import { Badge } from "@jn7f1qecj9mg71yhrzbfnmmpsn7sh1ep/components";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jn7f1qecj9mg71yhrzbfnmmpsn7sh1ep/components";
import { Skeleton } from "@jn7f1qecj9mg71yhrzbfnmmpsn7sh1ep/components";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export function DashboardHero() {
  const summary = useQuery(api.endpoints.dashboard.summary);
  const recent = useQuery(api.endpoints.dashboard.recent);
  const taskCounts = useQuery(api.endpoints.tasks.getCounts);

  const loading = !summary || !recent || !taskCounts;
  const rows = useMemo(() => recent ?? [], [recent]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dashboard Overview</CardTitle>
              <p className="mt-1 text-sm text-neutral-foreground-secondary">
                Track your tasks and productivity
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <StyledTabsList>
              <StyledTabsTrigger value="overview">Overview</StyledTabsTrigger>
              <StyledTabsTrigger value="recent">Recent Tasks</StyledTabsTrigger>
            </StyledTabsList>
            <StyledTabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card
                  className="bg-primary text-primary-foreground"
                  style={{ background: "#6366f1" }}
                >
                  <CardHeader>
                    <CardTitle>Total Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-9 w-24" />
                    ) : (
                      <>
                        <p className="text-3xl font-semibold">{taskCounts.total}</p>
                        <p className="text-sm opacity-80">All your tasks</p>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>To Do</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-9 w-20" />
                    ) : (
                      <>
                        <p className="text-3xl font-semibold">{taskCounts.todo}</p>
                        <p className="mt-2 text-sm text-neutral-foreground-secondary">
                          Not started yet
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>In Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-9 w-20" />
                    ) : (
                      <>
                        <p className="text-3xl font-semibold">{taskCounts.in_progress}</p>
                        <p className="mt-2 text-sm text-neutral-foreground-secondary">
                          Currently working on
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-9 w-20" />
                    ) : (
                      <>
                        <p className="text-3xl font-semibold text-green-600">{taskCounts.completed}</p>
                        <p className="mt-2 text-sm text-neutral-foreground-secondary">
                          Finished tasks
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </StyledTabsContent>
            <StyledTabsContent value="recent">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Status</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Skeleton className="h-7 w-full" />
                      </TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-sm text-neutral-foreground-secondary">
                        No tasks yet. Create your first task below!
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow key={row._id}>
                        <TableCell>
                          {getStatusIcon(row.status)}
                        </TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell className="text-sm text-neutral-foreground-secondary">
                          {row.updatedAt ? new Date(row.updatedAt).toLocaleString() : "--"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </StyledTabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
