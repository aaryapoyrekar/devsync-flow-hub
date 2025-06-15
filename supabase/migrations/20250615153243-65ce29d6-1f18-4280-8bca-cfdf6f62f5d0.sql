
-- STEP 1: Create an enum type for Kanban status
CREATE TYPE public.kanban_status AS ENUM ('todo', 'inprogress', 'done');

-- STEP 2: Create the tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status kanban_status NOT NULL DEFAULT 'todo',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- STEP 3: (Recommended) Create a projects table if not present
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- STEP 4: Add RLS to tasks so users can manage their tasks (update for your needs)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Allow owners to select, insert, update, and delete tasks
CREATE POLICY "Task owners can read" ON public.tasks
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Task owners can insert" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Task owners can update" ON public.tasks
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Task owners can delete" ON public.tasks
  FOR DELETE USING (auth.uid() = owner_id);

-- STEP 5: Allow all project members to read (optional; modify for team access)
-- This version allows any task belonging to a project owned by the user
-- Remove if not needed or adjust for your team access model:
-- CREATE POLICY "Project owners can read tasks" ON public.tasks
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM public.projects
--       WHERE projects.id = tasks.project_id AND projects.owner_id = auth.uid()
--     )
--   );

-- STEP 6: Enable real-time support
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
-- (Supabase auto-subscribes to changes if using .on for this table)

-- STEP 7: Add to publication for realtime
-- (This is typically already in place in recent Supabase projects, but run to ensure)
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
