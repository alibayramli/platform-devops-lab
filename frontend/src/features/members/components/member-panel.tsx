import { useState } from "react";
import type { FormEvent } from "react";
import { Mail, UserPlus } from "lucide-react";

import { memberRoles, type Member, type MemberRole } from "../../../shared/types/api";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button";
import { Card } from "../../../shared/ui/card";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Select } from "../../../shared/ui/select";

type MemberPanelProps = {
  members: Member[];
  isLoadingMembers: boolean;
  onCreateMember: (input: { fullName: string; email: string; role: MemberRole }) => Promise<void>;
  isCreatingMember: boolean;
};

export function MemberPanel({
  members,
  isLoadingMembers,
  onCreateMember,
  isCreatingMember
}: MemberPanelProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("member");

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

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="section-title">Members</h2>
          <p className="section-subtitle">Manage your active team roster.</p>
        </div>
        <Badge variant="neutral">
          {isLoadingMembers ? "Refreshing..." : `${members.length} total`}
        </Badge>
      </div>

      <form
        className="field-grid"
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

        <div className="relative">
          <Label>Email</Label>
          <Mail
            size={16}
            className="pointer-events-none absolute left-3 top-[37px] text-theme-muted"
          />
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="sam@example.com"
            maxLength={120}
            className="pl-9"
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

        <Button type="submit" variant="primary" disabled={isCreatingMember}>
          <UserPlus size={16} />
          {isCreatingMember ? "Adding..." : "Add Member"}
        </Button>
      </form>

      {isLoadingMembers && members.length === 0 ? (
        <div className="surface p-4 text-sm text-theme-muted">Loading members...</div>
      ) : (
        <ul className="space-y-2.5">
          {members.map((member) => (
            <li
              key={member.id}
              className="surface flex items-center justify-between gap-3 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--badge-deep-bg)] text-xs font-bold uppercase text-[var(--badge-deep-text)]">
                  {member.fullName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-theme-primary">
                    {member.fullName}
                  </p>
                  <p className="truncate text-xs text-theme-muted">{member.email}</p>
                </div>
              </div>
              <Badge variant={member.role === "lead" ? "sunrise" : "neutral"}>{member.role}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
