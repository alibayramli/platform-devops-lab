import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";

type TeamFormFieldsProps = {
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  nameLabel: string;
  descriptionLabel?: string;
  namePlaceholder: string;
  descriptionPlaceholder: string;
};

export function TeamFormFields({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  nameLabel,
  descriptionLabel = "Description",
  namePlaceholder,
  descriptionPlaceholder
}: TeamFormFieldsProps) {
  return (
    <>
      <div>
        <Label>{nameLabel}</Label>
        <Input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={namePlaceholder}
          maxLength={80}
        />
      </div>

      <div>
        <Label>{descriptionLabel}</Label>
        <Input
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder={descriptionPlaceholder}
          maxLength={240}
        />
      </div>
    </>
  );
}
