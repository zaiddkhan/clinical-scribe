export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-heading text-3xl font-bold">Welcome, Dr. Adams</h1>
      <p className="text-muted-foreground">
        Here's an overview of your clinical documentation activity
      </p>
    </div>
  );
}