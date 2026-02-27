import { db } from "@/lib/db";
import { WeeklyPlanGrid } from "@/components/WeeklyPlanGrid";

const DAYS = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
const MEALS = ["Colazione", "Pranzo", "Cena"];

export default async function WeeklyPlanPage() {
  const [plans, recipes] = await Promise.all([
    db.weeklyPlan.findMany({
      include: { 
        recipe: {
          select: { id: true, name: true }
        } 
      },
    }),
    db.recipe.findMany({ 
      select: { id: true, name: true },
      orderBy: { name: "asc" } 
    }),
  ]);

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex justify-between items-center px-4 md:px-0">
        <div>
          <h1 className="text-4xl font-black italic">Piano Settimanale</h1>
          <p className="opacity-50">Trascina i piatti per spostarli tra i giorni</p>
        </div>
      </div>

      <WeeklyPlanGrid 
        initialPlans={plans} 
        recipes={recipes} 
        days={DAYS} 
        meals={MEALS} 
      />
    </div>
  );
}
