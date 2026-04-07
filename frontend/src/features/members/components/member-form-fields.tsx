import { memberRoles, type MemberRole } from "../../../shared/types/api";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Select } from "../../../shared/ui/select";

type MemberFormFieldsProps = {
  name: string;
  email: string;
  role: MemberRole;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onRoleChange: (value: MemberRole) => void;
  showLabels?: boolean;
  namePlaceholder?: string;
  emailPlaceholder?: string;
};

export function MemberFormFields({
  name,
  email,
  role,
  onNameChange,
  onEmailChange,
  onRoleChange,
  showLabels = true,
  namePlaceholder = "Sam Rivers",
  emailPlaceholder = "sam@example.com"
}: MemberFormFieldsProps) {
  return (
    <>
      <div>
        {showLabels ? <Label>Name</Label> : null}
        <Input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={namePlaceholder}
          maxLength={80}
        />
      </div>

      <div>
        {showLabels ? <Label>Email</Label> : null}
        <Input
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder={emailPlaceholder}
          maxLength={120}
        />
      </div>

      <div>
        {showLabels ? <Label>Role</Label> : null}
        <Select value={role} onChange={(event) => onRoleChange(event.target.value as MemberRole)}>
          {memberRoles.map((roleValue) => (
            <option key={roleValue} value={roleValue}>
              {roleValue}
            </option>
          ))}
        </Select>
      </div>
    </>
  );
}
