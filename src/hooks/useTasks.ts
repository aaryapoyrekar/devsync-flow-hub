
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type NewTask = Omit<Task, "id" | "created_at"> & Partial<Pick<Task, "id" | "created_at">>;
type UpdateTaskInput = { id: string; fields: Partial<Task> };

export function useTasks(projectId: string | null, userId?: string) {
  const queryClient = useQueryClient();

  // Fetch all tasks for a project
  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
  });

  // Real-time sync
  useEffect(() => {
    if (!projectId) return;
    const channel = supabase
      .channel(`tasks_project_${projectId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `project_id=eq.${projectId}` },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  // Create a task
  const createTask = useMutation({
    mutationFn: async (input: NewTask) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert([{ ...input }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks", projectId] }),
  });

  // Update a task
  const updateTask = useMutation({
    mutationFn: async ({ id, fields }: UpdateTaskInput) => {
      const { data, error } = await supabase
        .from("tasks")
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks", projectId] }),
  });

  // Delete a task
  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks", projectId] }),
  });

  return {
    tasks,
    isLoading,
    error,
    createTask: createTask.mutateAsync,
    updateTask: updateTask.mutateAsync,
    deleteTask: deleteTask.mutateAsync,
  };
}
