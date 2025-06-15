import React, { useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

// Demo: just using first project for now
const HARDCODED_PROJECT_ID = "demo-project-uuid"; // Replace with actual if project management implemented

const KANBAN_STATUS = [
  { id: "todo", title: "To Do" },
  { id: "inprogress", title: "In Progress" },
  { id: "done", title: "Done" },
];

const getAvatarInitials = (name: string) =>
  name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

const KanbanBoard: React.FC = () => {
  const { user } = useAuthUser();
  // Use demo project ID for now; in real app, pass this as a prop or read from context
  const { tasks, isLoading, error, createTask, updateTask, deleteTask } = useTasks(HARDCODED_PROJECT_ID, user?.id ?? undefined);

  // Split tasks per status
  const columns = useMemo(() => {
    const mapping: Record<string, typeof tasks> = {
      todo: [],
      inprogress: [],
      done: [],
    };
    (tasks || []).forEach((task) => {
      if (mapping[task.status]) mapping[task.status].push(task);
    });
    return mapping;
  }, [tasks]);

  // Handle drag between columns
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;
    const movedTask = columns[sourceStatus][source.index];
    if (!movedTask) return;

    try {
      await updateTask({ id: movedTask.id, fields: { status: destStatus as any } });
      toast({ title: "Task moved!", description: `${movedTask.title} is now in "${destStatus.replace(/^\w/, c => c.toUpperCase())}"` });
    } catch (err: any) {
      toast({ title: "Failed to move", description: err?.message || String(err), variant: "destructive" });
    }
  };

  // Handle quick-create for demo only
  const handleCreateTask = async () => {
    if (!user) return toast({ title: "Sign in required" });
    const title = prompt("Enter task title:");
    if (!title) return;
    try {
      await createTask({ project_id: HARDCODED_PROJECT_ID, title, status: "todo", owner_id: user.id, description: "" });
      toast({ title: "Task created!" });
    } catch (err: any) {
      toast({ title: "Error creating task", description: err?.message || String(err), variant: "destructive" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">Kanban Board</h1>
        <Button onClick={handleCreateTask} size="sm">+ New Task</Button>
      </div>
      <div className="overflow-auto">
        {isLoading && <div className="text-muted-foreground text-center py-10">Loading...</div>}
        {error && <div className="text-red-600 text-center py-4">{(error as Error)?.message}</div>}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-8">
            {KANBAN_STATUS.map((col) => (
              <Droppable droppableId={col.id} key={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-card border rounded-lg shadow-inner p-4 min-h-[320px] flex flex-col
                    ${snapshot.isDraggingOver ? "bg-accent/60" : ""} transition`}
                  >
                    <div className="font-bold text-lg mb-3 flex items-center gap-2">
                      {col.title}
                      <span className="bg-muted text-xs rounded px-2 py-1 ml-2">{columns[col.id].length}</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-4">
                      {columns[col.id].map((task, idx) => (
                        <Draggable draggableId={task.id} index={idx} key={task.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`rounded-md bg-background border p-3 shadow
                                flex items-center gap-3 group transition-all
                                ${snapshot.isDragging ? "ring-2 ring-primary/60 scale-105" : ""}
                              `}
                              style={{ ...provided.draggableProps.style }}
                            >
                              <Avatar className="h-8 w-8 bg-muted">
                                <AvatarFallback>
                                  {task.owner_id ? getAvatarInitials(task.owner_id) : "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="font-medium text-[16px] truncate">
                                  {task.title}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {task.description}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={async () => {
                                  if (window.confirm("Delete task?")) {
                                    await deleteTask(task.id);
                                    toast({ title: "Task deleted!" });
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100"
                              >
                                🗑️
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default KanbanBoard;
