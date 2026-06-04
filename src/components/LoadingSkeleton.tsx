export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-12 w-full py-4 animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-4 md:px-0">
        <div className="space-y-3">
          <div className="h-12 w-48 bg-base-300 rounded-2xl" />
          <div className="h-6 w-36 bg-base-300 rounded-xl" />
        </div>
        <div className="flex gap-6">
          <div className="h-16 w-24 bg-base-300 rounded-2xl" />
          <div className="h-16 w-24 bg-base-300 rounded-2xl" />
        </div>
      </div>
      <div className="h-16 max-w-2xl mx-auto w-full bg-base-300 rounded-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-base-300 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

export function PantrySkeleton() {
  return (
    <div className="w-full flex flex-col gap-6 py-2 animate-pulse">
      <div className="h-20 bg-base-300 rounded-3xl" />
      <div className="h-24 bg-base-300 rounded-3xl" />
      <div className="h-96 bg-base-300 rounded-3xl" />
    </div>
  );
}

export function RecipesSkeleton() {
  return (
    <div className="flex flex-col gap-10 w-full animate-pulse">
      <div className="h-12 w-64 bg-base-300 rounded-2xl" />
      <div className="h-28 bg-base-300 rounded-3xl" />
      <div className="h-14 bg-base-300 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="h-52 bg-base-300 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

export function WeeklyPlanSkeleton() {
  return (
    <div className="flex flex-col gap-8 w-full animate-pulse">
      <div className="h-10 w-72 bg-base-300 rounded-2xl" />
      <div className="h-[600px] bg-base-300 rounded-[2rem]" />
    </div>
  );
}

export function ShoppingListSkeleton() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto animate-pulse">
      <div className="h-10 w-64 bg-base-300 rounded-2xl" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-20 bg-base-300 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function InspirationSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full py-2 animate-pulse">
      <div className="h-20 bg-base-300 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="h-44 bg-base-300 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
