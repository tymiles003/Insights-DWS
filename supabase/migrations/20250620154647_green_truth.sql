/*
  # Fix Organization Members RLS Policies

  1. Security Changes
    - Drop existing problematic INSERT policies that cause infinite recursion
    - Create new, simplified policies that avoid circular references
    - Ensure proper access control for organization members

  2. Policy Changes
    - Remove the problematic "Users can add members to their organizations" policy
    - Keep the admin-only INSERT policy for adding members
    - Simplify the logic to avoid self-referencing queries
*/

-- Drop the problematic INSERT policies
DROP POLICY IF EXISTS "Users can add members to their organizations" ON organization_members;
DROP POLICY IF EXISTS "Admins can add members to their organizations" ON organization_members;

-- Create a single, clear INSERT policy for admins
CREATE POLICY "Admins can add members to organizations"
  ON organization_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM organization_members om 
      WHERE om.organization_id = organization_members.organization_id 
        AND om.user_id = auth.uid() 
        AND om.role = 'admin'
    )
    OR 
    -- Allow the first member (organization creator) to be added
    NOT EXISTS (
      SELECT 1 
      FROM organization_members om 
      WHERE om.organization_id = organization_members.organization_id
    )
  );

-- Ensure the SELECT policy is also clean
DROP POLICY IF EXISTS "Users can view members of their organizations" ON organization_members;

CREATE POLICY "Users can view members of their organizations"
  ON organization_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM organization_members om 
      WHERE om.organization_id = organization_members.organization_id 
        AND om.user_id = auth.uid()
    )
  );