import { useState } from "react";
import type { FormEvent } from "react";
import { Pencil, Trash2, UserPlus } from "lucide-react";

import { memberRoles, type Member, type MemberRole } from "../../../shared/types/api";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button";
import { Card } from "../../../shared/ui/card";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Select } from "../../../shared/ui/select";

type MemberPanelProps = {
  activeTeamName?: string | null;
  members: Member[];
  isLoadingMembers: boolean;
  onCreateMember: (input: { fullName: string; email: string; role: MemberRole }) => Promise<void>;
  onUpdateMember: (
    memberId: number,
    input: { fullName?: string; email?: string; role?: MemberRole }
  ) => Promise<void>;
  onDeleteMember: (memberId: number) => Promise<void>;
  isCreatingMember: boolean;
  isUpdatingMember: boolean;
  isDeletingMember: boolean;
};

function resolveInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

export function MemberPanel({
  activeTeamName,
  members,
  isLoadingMembers,
  onCreateMember,
  onUpdateMember,
  onDeleteMember,
  isCreatingMember,
  isUpdatingMember,
  isDeletingMember
}: MemberPanelProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("member");
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<MemberRole>("member");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      return;
    }

    await onCreateMember({
      fullName: cleanName,
      email: cleanEmail,
      role
    });

    setFullName("");
    setEmail("");
    setRole("member");
  }

  function startEditing(member: Member) {
    setEditingMemberId(member.id);
    setEditFullName(member.fullName);
    setEditEmail(member.email);
    setEditRole(member.role);
  }

  function stopEditing() {
    setEditingMemberId(null);
    setEditFullName("");
    setEditEmail("");
    setEditRole("member");
  }

  async function handleUpdate(memberId: number) {
    const cleanName = editFullName.trim();
    const cleanEmail = editEmail.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      return;
    }

    await onUpdateMember(memberId, {
      fullName: cleanName,
      email: cleanEmail,
      role: editRole
    });

    stopEditing();
  }

  async function handleDelete(member: Member) {
    const confirmed = window.confirm(`Delete ${member.fullName}?`);

    if (!confirmed) {
      return;
    }

    await onDeleteMember(member.id);

    if (editingMemberId === member.id) {
      stopEditing();
    }
  }

  return (
    <Card className="stack-panel member-panel-card space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="section-title">Members</h2>
          <p className="section-subtitle">
            {activeTeamName
              ? `Manage the roster and ownership roles for ${activeTeamName}.`
              : "Select a workspace to manage its member roster."}
          </p>
        </div>
        <Badge variant="neutral">
          {isLoadingMembers ? "Refreshing..." : `${members.length} total`}
        </Badge>
      </div>

      <form
        className="field-grid member-panel-form"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <div>
          <Label>Name</Label>
          <Input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Sam Rivers"
            maxLength={80}
          />
        </div>

        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="sam@example.com"
            maxLength={120}
          />
        </div>

        <div>
          <Label>Role</Label>
          <Select value={role} onChange={(event) => setRole(event.target.value as MemberRole)}>
            {memberRoles.map((roleValue) => (
              <option key={roleValue} value={roleValue}>
                {roleValue}
              </option>
            ))}
          </Select>
        </div>

        <Button type="submit" variant="primary" size="lg" disabled={isCreatingMember}>
          <UserPlus size={16} />
          {isCreatingMember ? "Adding..." : "Add Member"}
        </Button>
      </form>

      {isLoadingMembers && members.length === 0 ? (
        <div className="surface empty-state">Loading members...</div>
      ) : (
        <div className="member-list-scroll">
          <ul className="member-list">
            {members.map((member) => {
              const isEditing = editingMemberId === member.id;

              return (
                <li
                  key={member.id}
                  className={`member-item surface ${isEditing ? "member-item-editor" : ""}`}
                >
                  {isEditing ? (
                    <>
                      <div className="member-editor-grid">
                        <Input
                          value={editFullName}
                          onChange={(event) => setEditFullName(event.target.value)}
                          placeholder="Full name"
                          maxLength={80}
                        />
                        <Input
                          type="email"
                          value={editEmail}
                          onChange={(event) => setEditEmail(event.target.value)}
                          placeholder="Email"
                          maxLength={120}
                        />
                        <Select
                          value={editRole}
                          onChange={(event) => setEditRole(event.target.value as MemberRole)}
                        >
                          {memberRoles.map((roleValue) => (
                            <option key={roleValue} value={roleValue}>
                              {roleValue}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="member-row-actions">
                        <Button
                          type="button"
                          size="sm"
                          variant="primary"
                          disabled={isUpdatingMember}
                          onClick={() => {
                            void handleUpdate(member.id);
                          }}
                        >
                          {isUpdatingMember ? "Saving..." : "Save"}
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={stopEditing}>
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isDeletingMember}
                          onClick={() => {
                            void handleDelete(member);
                          }}
                        >
                          {isDeletingMember ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="member-item-main">
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className="avatar"
                            style={{ height: "2.25rem", width: "2.25rem", fontSize: ".72rem" }}
                          >
                            {resolveInitials(member.fullName)}
                          </span>
                          <div className="min-w-0">
                            <p className="row-title">{member.fullName}</p>
                            <p className="row-subtitle">{member.email}</p>
                          </div>
                        </div>
                        <Badge variant={member.role === "lead" ? "sunrise" : "neutral"}>
                          {member.role}
                        </Badge>
                      </div>
                      <div className="member-row-actions">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(member)}
                        >
                          <Pencil size={14} />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isDeletingMember}
                          onClick={() => {
                            void handleDelete(member);
                          }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
}
