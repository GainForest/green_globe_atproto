"use client";
import React, { useEffect, useState } from "react";
import useProjectOverlayStore from "../../store";
import useCommunityMembersStore from "./store";
import { BadgeDollarSign, CircleAlert, UserCircle2, Plus, Edit2, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Loading from "./loading";
import ErrorMessage from "../../ErrorMessage";
import MemberForm from "./MemberForm";
import { CommunityMember } from "./store/types";
import { useAtproto } from "@/app/_components/Providers/AtprotoProvider";
import { createCommunityMemberRecord, updateCommunityMemberRecord, deleteCommunityMemberRecord } from "./atproto-utils";
const Members = () => {
  const projectId = useProjectOverlayStore((state) => state.projectId);
  const { data, dataStatus, fetchData } = useCommunityMembersStore();
  const { agent } = useAtproto();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CommunityMember | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData(agent);
  }, [projectId, fetchData, agent]);

  if (dataStatus === "loading") return <Loading />;
  if (dataStatus === "error") return <ErrorMessage />;

  const { members } = data;

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
      console.log('[Members] handleSaveMember called with:', {
        projectId,
        isDidProject: projectId?.startsWith('did:plc:'),
        hasAgent: !!agent,
        editingMember: !!editingMember,
        memberData
      });

      // For DID-based projects, use ATproto directly
      if (projectId?.startsWith('did:plc:')) {
        console.log('[Members] Handling DID project with ATproto');
        if (!agent) {
          throw new Error('ATproto agent not available');
        }

        if (editingMember) {
          console.log('[Members] Updating existing member:', editingMember.id);
          // Update existing member
          await updateCommunityMemberRecord(agent, projectId, editingMember.id, memberData);
        } else {
          console.log('[Members] Creating new member');
          // Create new member
          await createCommunityMemberRecord(agent, projectId, memberData);
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

      // Refresh the members list
      await fetchData(agent);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving member:', error);
      setErrorMessage(`Failed to ${editingMember ? 'update' : 'create'} member. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this community member?')) {
      return;
    }

    try {
      // For DID-based projects, use ATproto directly
      if (projectId?.startsWith('did:plc:')) {
        if (!agent) {
          throw new Error('ATproto agent not available');
        }

        await deleteCommunityMemberRecord(agent, projectId, memberId);
      } else {
        // For traditional database projects, use the API
        const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete member');
        }
      }

      // Refresh the members list
      await fetchData(agent);
    } catch (error) {
      console.error('Error deleting member:', error);
      setErrorMessage('Failed to delete member. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Member button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Community Members</h3>
        <Button onClick={handleAddMember} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Member
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
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Note: For decentralized projects, community members are stored in each participant&apos;s personal repository.
              You can add yourself or others, but currently only records from your account are visible.
            </p>
          )}
          <Button onClick={handleAddMember} variant="outline">
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
