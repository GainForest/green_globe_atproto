"use client";
import React, { useEffect, useState } from "react";
import useProjectOverlayStore from "../../store";
import { BadgeDollarSign, CircleAlert, UserCircle2, Plus, Edit2, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorMessage from "../../ErrorMessage";
import MemberForm from "./MemberForm";
import { CommunityMember } from "./store/types";
import { useAtproto } from "@/app/_components/Providers/AtprotoProvider";
import { useStackedDialog } from "@/components/ui/StackedDialog/context";
import { createCommunityMemberRecord, updateCommunityMemberRecord, deleteCommunityMemberRecord } from "./atproto-utils";
const Members = () => {
  const projectId = useProjectOverlayStore((state) => state.projectId);
  const { agent, isAuthenticated, userProfile, restoreSession } = useAtproto();
  const { openDialog } = useStackedDialog();

  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CommunityMember | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch community members similar to profile page - simple and direct
  const fetchMembers = async () => {
    if (!projectId || !agent) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[Members] Fetching community records for project:', projectId);

      // Get all community records from user's repository (similar to profile)
      const response = await agent.api.com.atproto.repo.listRecords({
        repo: agent.accountDid,
        collection: 'app.gainforest.community',
      });

      console.log('[Members] Found', response.data.records.length, 'community records');

      // Filter records for this project
      const decodedProjectId = decodeURIComponent(projectId);
      const projectMembers: CommunityMember[] = response.data.records
        .filter(record => {
          const value = record.value as any;
          // Check if this record belongs to our project
          const recordProjectId = value.projectId;
          const matches = recordProjectId === projectId ||
                         recordProjectId === decodedProjectId ||
                         decodeURIComponent(recordProjectId || '') === decodedProjectId;

          if (value.$type === 'app.gainforest.community') {
            console.log('[Members] Record:', value.id, 'project:', recordProjectId, 'matches:', matches);
          }

          return matches;
        })
        .map(record => {
          const value = record.value as any;
          return {
            id: value.id,
            wallet_address_id: null,
            project_id: 1, // Default fallback
            first_name: value.firstName || '',
            last_name: value.lastName || '',
            title: value.title || '',
            bio: value.bio || '',
            profile_image_url: value.profileImageUrl || null,
            display_order: value.displayOrder || null,
          };
        })
        .sort((a, b) => (a.display_order || Infinity) - (b.display_order || Infinity));

      console.log('[Members] Filtered to', projectMembers.length, 'members for this project');
      setMembers(projectMembers);

    } catch (err) {
      console.error('[Members] Failed to fetch members:', err);
      setError('Failed to load community members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId, agent]);

  // Make fetchMembers available globally for debugging
  useEffect(() => {
    (window as any).refreshMembers = fetchMembers;
  }, [projectId, agent]);

  // Show loading skeleton while fetching data (similar to profile page)
  if (loading) {
    return (
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>

        {/* Member list skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-4 border rounded-lg">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>

        {/* Empty state skeleton for new members */}
        <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <Skeleton className="w-12 h-12 mx-auto mb-4 rounded-full" />
          <Skeleton className="h-4 w-48 mx-auto mb-2" />
          <Skeleton className="h-3 w-64 mx-auto mb-4" />
          <Skeleton className="h-9 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <CircleAlert size={48} className="mx-auto mb-4 opacity-50 text-destructive" />
        <p className="text-muted-foreground mb-4">
          {error}
        </p>
        <Button
          onClick={() => {
            // Retry fetching members
            fetchMembers();
          }}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const sortedMembers = members.sort((a, b) => {
    return (a.display_order ?? Infinity) - (b.display_order ?? Infinity);
  });

  const handleAddMember = () => {
    setEditingMember(null);
    setIsFormOpen(true);
    setErrorMessage(null);
  };

  const handleEditMember = (member: CommunityMember) => {
    setEditingMember(member);
    setIsFormOpen(true);
    setErrorMessage(null);
  };

  const handleSaveMember = async (memberData: Partial<CommunityMember>) => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      // URL-decode the projectId to handle URL-encoded DIDs
      const decodedProjectId = decodeURIComponent(projectId || '');

      console.log('[Members] handleSaveMember called with:', {
        projectId,
        decodedProjectId,
        isDidProject: decodedProjectId.startsWith('did:plc:'),
        hasAgent: !!agent,
        agentAccountDid: agent?.accountDid,
        editingMember: !!editingMember,
        memberData
      });

      // For DID-based projects, use ATproto directly
      if (decodedProjectId.startsWith('did:plc:')) {
        console.log('[Members] Handling DID project with ATproto');

        // Check authentication similar to profile page
        if (!agent || !isAuthenticated) {
          console.log('[Members] No agent or not authenticated, attempting session restoration...');
          try {
            await restoreSession();
            // Wait a bit for the session to be restored
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (restoreError) {
            console.error('[Members] Session restoration failed:', restoreError);
            throw new Error('You must be signed in with Bluesky to add community members. Please sign in first.');
          }
        }

        // Re-check authentication after potential restoration
        if (!agent || !agent.accountDid || !isAuthenticated) {
          throw new Error('ATproto agent not properly authenticated. Please try signing in again.');
        }

        if (!userProfile) {
          console.log('[Members] No user profile, trying to get it...');
          // Try to get the profile if it's missing
          try {
            const profile = await agent.getProfile({ actor: agent.accountDid });
            console.log('[Members] Retrieved profile:', profile.data);
          } catch (profileError) {
            console.error('[Members] Could not retrieve profile:', profileError);
            throw new Error('Could not retrieve your Bluesky profile. Please try signing in again.');
          }
        }

        console.log('[Members] Agent authenticated with DID:', agent.accountDid, 'Bluesky handle:', userProfile.handle);

        if (editingMember) {
          console.log('[Members] Updating existing member:', editingMember.id);
          // Update existing member
          await updateCommunityMemberRecord(agent, decodedProjectId, editingMember.id, memberData);
        } else {
          console.log('[Members] Creating new member');
          // Create new member
          await createCommunityMemberRecord(agent, decodedProjectId, memberData);
        }
      } else {
        // For traditional database projects, use the API
        const url = editingMember
          ? `/api/projects/${projectId}/members/${editingMember.id}`
          : `/api/projects/${projectId}/members`;

        const method = editingMember ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(memberData),
        });

        if (!response.ok) {
          throw new Error(`Failed to ${editingMember ? 'update' : 'create'} member`);
        }
      }

      // Refresh the members list (simple approach like profile page)
      fetchMembers();
    } catch (error) {
      console.error('Error saving member:', error);
      const errorMsg = error instanceof Error ? error.message : `Failed to ${editingMember ? 'update' : 'create'} member. Please try again.`;
      setErrorMessage(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    console.log('[Members] handleDeleteMember called with:', { memberId, projectId });

    if (!confirm('Are you sure you want to delete this community member?')) {
      return;
    }

    try {
      // For DID-based projects, use ATproto directly
      if (projectId?.startsWith('did:plc:')) {
        console.log('[Members] Deleting member from ATproto:', { memberId, projectId });

        if (!agent) {
          throw new Error('ATproto agent not available');
        }

        await deleteCommunityMemberRecord(agent, projectId, memberId);
        console.log('[Members] ATproto delete completed successfully');
      } else {
        // For traditional database projects, use the API
        const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete member');
        }
      }

      // Refresh the members list (simple approach like profile page)
      fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      setErrorMessage('Failed to delete member. Please try again.');
    }
  };

  return (
    <div key={`members-${loading ? 'loading' : 'loaded'}-${members?.length || 0}`} className="space-y-4">
      {/* Header with Add Member button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Community Members</h3>
                          <div className="flex gap-2">
          <Button
            onClick={() => {
              // Refresh members without reloading (similar to profile page)
              fetchMembers();
            }}
            variant="outline"
            size="sm"
          >
            🔄 Refresh
          </Button>
          <Button
            onClick={handleAddMember}
            size="sm"
            disabled={!isAuthenticated && decodeURIComponent(projectId || '').startsWith('did:plc:')}
            title={!isAuthenticated && decodeURIComponent(projectId || '').startsWith('did:plc:') ? 'Sign in with Bluesky to add members' : undefined}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>



      {/* Status indicator */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
        <span>
          Status: {loading ? 'loading' : error ? 'error' : 'success'} • Members: {members?.length || 0} • Agent: {agent ? '✅' : '❌'}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            console.log('=== Manual Status Check ===');
            console.log('Loading:', loading);
            console.log('Error:', error);
            console.log('Members count:', members?.length || 0);
            console.log('Has agent:', !!agent);
            console.log('Project ID:', projectId);
            if ((window as any).quickStatus) {
              (window as any).quickStatus();
            }
          }}
          className="text-xs h-6 px-2"
        >
          🔍 Status
        </Button>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <CircleAlert size={20} className="text-red-500 shrink-0" />
          <span className="text-red-700 dark:text-red-400 text-sm">{errorMessage}</span>
        </div>
      )}

      {sortedMembers.length === 0 ? (
        <div className="text-center py-8">
          <CircleAlert size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground mb-4">
            No community members have been added yet.
          </p>
          {projectId?.startsWith('did:plc:') && (
            <div className="mb-4 max-w-md mx-auto">
              {!isAuthenticated && (
                <div className="text-sm mb-3 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-amber-600 dark:text-amber-400 mb-2">
                    ⚠️ You need to sign in with Bluesky to add community members to decentralized projects.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDialog("onboarding")}
                    className="text-xs"
                  >
                    Sign In with Bluesky
                  </Button>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Note: For decentralized projects, community members are stored in each participant&apos;s personal repository.
                You can add yourself or others, but currently only records from your account are visible.
              </p>
            </div>
          )}
          <Button
            onClick={handleAddMember}
            variant="outline"
            disabled={!isAuthenticated && decodeURIComponent(projectId || '').startsWith('did:plc:')}
            title={!isAuthenticated && decodeURIComponent(projectId || '').startsWith('did:plc:') ? 'Sign in with Bluesky to add members' : undefined}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Member
          </Button>
        </div>
      ) : (
        <>
          <p className="bg-foreground/10 text-muted-foreground rounded-lg p-4 flex items-center gap-4">
            <BadgeDollarSign size={32} className="shrink-0 opacity-50" />
            <span>
              <b className="text-foreground">
                {sortedMembers.length} member
                {sortedMembers.length === 1 ? "" : "s"}
              </b>{" "}
              from the local communities{" "}
              {sortedMembers.length === 1 ? "is" : "are"} registered to receive
              financial benefits from this project.
            </span>
          </p>
          {projectId?.startsWith('did:plc:') && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Note: Showing community members from your personal repository only.
            </p>
          )}
          <div className="flex flex-col gap-2">
            {sortedMembers.map((member) => (
              <div
                className="flex flex-col divide-y bg-neutral-50 dark:bg-neutral-950 border border-border rounded-xl"
                key={member.id}
              >
                <div className="p-4 flex items-center gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={member.profile_image_url || ""} />
                    <AvatarFallback>
                      <UserCircle2 className="w-10 h-10 opacity-20" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1">
                    <p className="font-medium">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.title}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditMember(member)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMember(member.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {member.bio && member.bio.trim() !== "" && (
                  <div className="p-4 text-sm text-muted-foreground">
                    {member.bio}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Member Form Dialog */}
      <MemberForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        member={editingMember}
        onSave={handleSaveMember}
        isLoading={isSaving}
      />
    </div>
  );
};

export default Members;
