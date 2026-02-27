"use client";

import { useState, useOptimistic, useTransition } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Trash2, Plus, Utensils, CheckCircle, GripVertical } from "lucide-react";
import { removeFromWeeklyPlan, markAsCooked, moveWeeklyPlanItem, addToWeeklyPlan } from "@/app/actions/weekly-plan";

interface Plan {
  id: string;
  day: string;
  mealType: string;
  recipe: {
    id: string;
    name: string;
  };
}

interface Props {
  initialPlans: Plan[];
  recipes: { id: string; name: string }[];
  days: string[];
  meals: string[];
}

export function WeeklyPlanGrid({ initialPlans, recipes, days, meals }: Props) {
  const [isPending, startTransition] = useTransition();
  
  // State for the plans, initially from server
  const [plans, setPlans] = useState(initialPlans);

  // Sync state with props when server revalidates
  if (initialPlans !== plans && !isPending) {
    setPlans(initialPlans);
  }

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Extract day and meal from droppableId (format: "Day-Meal")
    const [destDay, destMeal] = destination.droppableId.split("|");
    
    // Optimistic update
    const updatedPlans = plans.map(p => 
      p.id === draggableId ? { ...p, day: destDay, mealType: destMeal } : p
    );
    setPlans(updatedPlans);

    // Server update
    startTransition(async () => {
      await moveWeeklyPlanItem(draggableId, destDay, destMeal);
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="overflow-x-auto shadow-2xl rounded-[2rem] border border-base-300 bg-base-100">
        <table className="table w-full table-fixed">
          <thead>
            <tr className="bg-base-200/50">
              <th className="w-32 py-6 text-center font-black uppercase tracking-widest text-xs opacity-50">Giorno</th>
              {meals.map((meal) => (
                <th key={meal} className="text-center py-6 font-black uppercase tracking-widest text-xs opacity-50 border-l border-base-300">
                  {meal}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day} className="border-t border-base-300">
                <td className="bg-base-200/20 font-black text-center text-primary text-lg italic">
                  {day}
                </td>
                {meals.map((meal) => {
                  const droppableId = `${day}|${meal}`;
                  const currentPlans = plans.filter((p) => p.day === day && p.mealType === meal);
                  
                  return (
                    <td key={meal} className="p-3 align-top border-l border-base-300">
                      <Droppable droppableId={droppableId}>
                        {(provided, snapshot) => (
                          <div 
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`flex flex-col gap-2 min-h-[100px] rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                          >
                            {currentPlans.map((plan, index) => (
                              <Draggable key={plan.id} draggableId={plan.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`group relative bg-base-100 p-3 rounded-xl border border-base-300 transition-all ${snapshot.isDragging ? 'shadow-2xl z-50 border-primary scale-105' : 'hover:border-secondary/40 shadow-sm'}`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex gap-2 items-start flex-1">
                                        <div {...provided.dragHandleProps} className="mt-0.5 opacity-20 group-hover:opacity-100 cursor-grab active:cursor-grabbing">
                                          <GripVertical size={14} />
                                        </div>
                                        <span className="text-xs font-bold leading-tight line-clamp-2">{plan.recipe.name}</span>
                                      </div>
                                      
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <form action={() => startTransition(() => markAsCooked(plan.id))}>
                                          <button title="Cucinato" className="btn btn-ghost btn-xs text-success p-0 h-auto min-h-0">
                                            <CheckCircle size={14} />
                                          </button>
                                        </form>
                                        <form action={() => startTransition(() => removeFromWeeklyPlan(plan.id))}>
                                          <button title="Rimuovi" className="btn btn-ghost btn-xs text-error p-0 h-auto min-h-0">
                                            <Trash2 size={12} />
                                          </button>
                                        </form>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}

                            {/* Tasto Aggiungi */}
                            <label 
                              htmlFor={`modal-${day}-${meal}`} 
                              className="btn btn-ghost btn-xs border-dashed border-2 border-base-300 rounded-xl h-10 w-full flex gap-1 hover:border-primary hover:text-primary transition-all opacity-50 hover:opacity-100 mt-auto"
                            >
                              <Plus size={14} /> <span className="text-[10px] font-bold uppercase">Aggiungi</span>
                            </label>
                          </div>
                        )}
                      </Droppable>

                      {/* Modal (Unique per slot) */}
                      <input type="checkbox" id={`modal-${day}-${meal}`} className="modal-toggle" />
                      <div className="modal" role="dialog">
                        <div className="modal-box rounded-[2rem]">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="bg-primary/10 p-3 rounded-2xl text-primary"><Utensils size={24}/></div>
                            <h3 className="font-black text-xl italic uppercase">Aggiungi a {day} ({meal})</h3>
                          </div>
                          
                          <form action={async (formData) => {
                            await addToWeeklyPlan(formData);
                            const modal = document.getElementById(`modal-${day}-${meal}`) as HTMLInputElement;
                            if (modal) modal.checked = false;
                          }} className="flex flex-col gap-4">
                            <input type="hidden" name="day" value={day} />
                            <input type="hidden" name="mealType" value={meal} />
                            <div className="form-control">
                              <label className="label">
                                <span className="label-text font-bold opacity-50">SELEZIONA UNA RICETTA</span>
                              </label>
                              <select name="recipeId" className="select select-bordered w-full rounded-xl" required defaultValue="">
                                <option value="" disabled>Scegli dalla tua collezione...</option>
                                {recipes.map((r) => (
                                  <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="modal-action">
                              <label htmlFor={`modal-${day}-${meal}`} className="btn btn-ghost">Chiudi</label>
                              <button type="submit" className="btn btn-primary px-8 shadow-lg shadow-primary/20">Aggiungi Piatto</button>
                            </div>
                          </form>
                        </div>
                        <label className="modal-backdrop" htmlFor={`modal-${day}-${meal}`}>Close</label>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DragDropContext>
  );
}
