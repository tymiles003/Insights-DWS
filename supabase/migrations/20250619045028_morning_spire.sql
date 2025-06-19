-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create organization_members table
CREATE TABLE IF NOT EXISTS public.organization_members (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('admin', 'member')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (organization_id, user_id)
);

-- Add organization_id to notebooks table
ALTER TABLE public.notebooks
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Create updated_at trigger for organizations
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for organization_members
CREATE TRIGGER update_organization_members_updated_at
    BEFORE UPDATE ON public.organization_members
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on organizations table
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on organization_members table
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is an admin of an organization
CREATE OR REPLACE FUNCTION public.is_organization_admin(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.organization_members 
        WHERE organization_id = org_id 
        AND user_id = auth.uid()
        AND role = 'admin'
    );
$$;

-- Create function to check if user is a member of an organization
CREATE OR REPLACE FUNCTION public.is_organization_member(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.organization_members 
        WHERE organization_id = org_id 
        AND user_id = auth.uid()
    );
$$;

-- Create policies for organizations table
CREATE POLICY "Users can view organizations they belong to" ON public.organizations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create organizations" ON public.organizations
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can update their organizations" ON public.organizations
    FOR UPDATE
    USING (public.is_organization_admin(id));

CREATE POLICY "Admins can delete their organizations" ON public.organizations
    FOR DELETE
    USING (public.is_organization_admin(id));

-- Create policies for organization_members table
CREATE POLICY "Users can view members of their organizations" ON public.organization_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members AS om
            WHERE om.organization_id = organization_id
            AND om.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can add members to their organizations" ON public.organization_members
    FOR INSERT
    WITH CHECK (public.is_organization_admin(organization_id));

CREATE POLICY "Admins can update members in their organizations" ON public.organization_members
    FOR UPDATE
    USING (public.is_organization_admin(organization_id));

CREATE POLICY "Admins can remove members from their organizations" ON public.organization_members
    FOR DELETE
    USING (public.is_organization_admin(organization_id));

-- Update notebooks policies to include organization access
DROP POLICY IF EXISTS "Users can view their own or organization notebooks" ON public.notebooks;
CREATE POLICY "Users can view their own or organization notebooks" ON public.notebooks
    FOR SELECT
    USING (
        auth.uid() = user_id 
        OR 
        (
            organization_id IS NOT NULL AND
            public.is_organization_member(organization_id)
        )
    );

DROP POLICY IF EXISTS "Users can create their own or organization notebooks" ON public.notebooks;
CREATE POLICY "Users can create their own or organization notebooks" ON public.notebooks
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        OR 
        (
            organization_id IS NOT NULL AND
            public.is_organization_member(organization_id)
        )
    );

DROP POLICY IF EXISTS "Users can update their own or organization notebooks" ON public.notebooks;
CREATE POLICY "Users can update their own or organization notebooks" ON public.notebooks
    FOR UPDATE
    USING (
        auth.uid() = user_id 
        OR 
        (
            organization_id IS NOT NULL AND
            public.is_organization_member(organization_id)
        )
    );

DROP POLICY IF EXISTS "Users can delete their own or organization notebooks" ON public.notebooks;
CREATE POLICY "Users can delete their own or organization notebooks" ON public.notebooks
    FOR DELETE
    USING (
        auth.uid() = user_id 
        OR 
        (
            organization_id IS NOT NULL AND
            public.is_organization_admin(organization_id)
        )
    );

-- Create view for user's organizations
CREATE OR REPLACE VIEW user_organizations AS
SELECT 
    o.id,
    o.name,
    o.created_at,
    o.updated_at,
    om.role,
    (SELECT COUNT(*) FROM organization_members WHERE organization_id = o.id) as member_count
FROM 
    organizations o
JOIN 
    organization_members om ON o.id = om.organization_id
WHERE 
    om.user_id = auth.uid();

-- Grant access to the view
GRANT SELECT ON user_organizations TO authenticated;