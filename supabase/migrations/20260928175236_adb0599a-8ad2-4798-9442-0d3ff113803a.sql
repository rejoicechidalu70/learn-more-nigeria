CREATE TYPE public.app_role AS ENUM ('admin','teacher','student','skill_learner');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text,
  user_type text NOT NULL DEFAULT 'secondary',
  streak_count int NOT NULL DEFAULT 0,
  last_active_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t text := coalesce(NEW.raw_user_meta_data->>'user_type','secondary');
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type)
  VALUES (NEW.id, coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)), t);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id,
    CASE WHEN t = 'teacher' THEN 'teacher'::public.app_role
         WHEN t = 'skill' THEN 'skill_learner'::public.app_role
         ELSE 'student'::public.app_role END);
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.cbt_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  exam text NOT NULL, subject text NOT NULL, year int, mode text NOT NULL,
  score int NOT NULL, total int NOT NULL,
  topic_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  wrong_ids text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.cbt_attempts TO authenticated;
GRANT ALL ON public.cbt_attempts TO service_role;
ALTER TABLE public.cbt_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own attempts" ON public.cbt_attempts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  question_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_id)
);
GRANT SELECT, INSERT, DELETE ON public.bookmarks TO authenticated;
GRANT ALL ON public.bookmarks TO service_role;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bookmarks" ON public.bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.class_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  class_id text NOT NULL,
  status text NOT NULL DEFAULT 'watched',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, class_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_attendance TO authenticated;
GRANT ALL ON public.class_attendance TO service_role;
ALTER TABLE public.class_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own attendance" ON public.class_attendance FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  skill_id text NOT NULL, lesson_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
GRANT SELECT, INSERT, DELETE ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own progress" ON public.lesson_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  skill_id text NOT NULL, skill_name text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, skill_id)
);
GRANT SELECT, INSERT ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own certs" ON public.certificates FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id uuid NOT NULL DEFAULT auth.uid(),
  level text NOT NULL, subject text NOT NULL, course text NOT NULL, topic text NOT NULL,
  title text NOT NULL, file_path text NOT NULL, file_type text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT ALL ON public.notes TO service_role;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approved notes visible" ON public.notes FOR SELECT TO authenticated USING (status = 'approved' OR uploader_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "teachers upload" ON public.notes FOR INSERT TO authenticated WITH CHECK (uploader_id = auth.uid() AND (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "admin moderates" ON public.notes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "owner or admin delete" ON public.notes FOR DELETE TO authenticated USING (uploader_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "notes read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'notes');
CREATE POLICY "notes upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'notes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "notes delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'notes' AND (storage.foldername(name))[1] = auth.uid()::text);