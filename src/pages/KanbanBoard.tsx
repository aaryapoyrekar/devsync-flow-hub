
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type User = {
  id: string;
  name: string;
};

type Task = {
  id: string;
  title: string;
  description: string;
  owner: User;
};

type Column = {
  id: string;
  title: string;
  taskIds: string[];
};

const users: Record<string, User> = {
  alice: { id: "alice", name: "Alice Taylor" },
  bob: { id: "bob", name: "Bob Chen" },
  eve: { id: "eve", name: "Eve Singh" },
};

const initialTasks: Record<string, Task> = {
  "task-1": {
    id: "task-1",
    title: "Design login page",
    description: "Finalize UI for login",
    owner: users.alice,
  },
  "task-2": {
    id: "task-2",
    title: "Set up Supabase",
    description: "Initialize database, user auth",
    owner: users.bob,
  },
  "task-3": {
    id: "task-3",
    title: "Write onboarding docs",
    description: "Draft docs for onboarding",
    owner: users.eve,
  },
  "task-4": {
    id: "task-4",
    title: "Implement drag and drop",
    description: "Add Kanban DnD (this ticket!)",
    owner: users.bob,
  },
};

// Columns: To Do, In Progress, Done
const initialColumns: Record<string, Column> = {
  todo: {
    id: "todo",
    title: "To Do",
    taskIds: ["task-1", "task-2"],
  },
  inprogress: {
    id: "inprogress",
    title: "In Progress",
    taskIds: ["task-4"],
  },
  done: {
    id: "done",
    title: "Done",
    taskIds: ["task-3"],
  },
};

const getAvatarInitials = (name: string) =>
  name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState(initialColumns);
  const [tasks, setTasks] = useState(initialTasks);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    // dropped outside list
    if (!destination) return;
    // no movement
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startCol = columns[source.droppableId];
    const finishCol = columns[destination.droppableId];

    // Moving within same column
    if (startCol === finishCol) {
      const newTaskIds = Array.from(startCol.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newCol = { ...startCol, taskIds: newTaskIds };
      setColumns({ ...columns, [newCol.id]: newCol });
      return;
    }

    // Moving between columns
    const startTaskIds = Array.from(startCol.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStartCol = { ...startCol, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finishCol.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinishCol = { ...finishCol, taskIds: finishTaskIds };

    setColumns({
      ...columns,
      [newStartCol.id]: newStartCol,
      [newFinishCol.id]: newFinishCol,
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6">Kanban Board</h1>
      <div className="overflow-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-8">
            {Object.values(columns).map((col) => (
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
                      <span className="bg-muted text-xs rounded px-2 py-1 ml-2">{col.taskIds.length}</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-4">
                      {col.taskIds.map((taskId, idx) => {
                        const task = tasks[taskId];
                        return (
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
                                    {getAvatarInitials(task.owner.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="font-medium text-[16px]">
                                    {task.title}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {task.description}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
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

