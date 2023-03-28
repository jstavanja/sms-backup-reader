import { Group, MantineTheme, Text } from "@mantine/core";
import { Dropzone, DropzoneProps } from "@mantine/dropzone";
import { UseFormReturnType } from "@mantine/form";
import { IconUpload, IconX, IconFileInfo } from "@tabler/icons-react";
import { t } from "i18next";

export interface BackupFilesForm {
  file?: File;
}

interface FileDropzoneProps extends Omit<DropzoneProps, "children"> {
  label: string;
  form: UseFormReturnType<BackupFilesForm>;
  theme: MantineTheme;
}

export const FileDropzone = ({
  label,
  onDrop,
  form,
  theme,
}: FileDropzoneProps) => {
  return (
    <Dropzone
      maxSize={10 * 1024 ** 2}
      maxFiles={1}
      onDrop={onDrop}
      {...form.getInputProps("file")}
      accept={["application/json"]}
    >
      <Group
        position="center"
        spacing="xl"
        style={{ minHeight: 50, pointerEvents: "none" }}
      >
        <Dropzone.Accept>
          <IconUpload
            size={50}
            stroke={1.5}
            color={
              theme.colors[theme.primaryColor]?.[
                theme.colorScheme === "dark" ? 4 : 6
              ]
            }
          />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX
            size={50}
            stroke={1.5}
            color={theme.colors.red?.[theme.colorScheme === "dark" ? 4 : 6]}
          />
        </Dropzone.Reject>
        <Dropzone.Idle>
          {!form.errors["file"] && <IconFileInfo size={50} stroke={1.5} />}
          {form.errors["file"] && (
            <IconX
              size={50}
              stroke={1.5}
              color={theme.colors.red?.[theme.colorScheme === "dark" ? 4 : 6]}
            />
          )}
        </Dropzone.Idle>

        <div>
          <Text size="xl" inline>
            {form.values["file"] && !form.errors["file"] && (
              <span>
                {t("Using file: ")}
                {form.values["file"].name}
              </span>
            )}
            {!form.values["file"] && !form.errors["file"] && (
              <span>{label}</span>
            )}
            {form.errors["file"] && (
              <Text
                color={theme.colors.red?.[theme.colorScheme === "dark" ? 4 : 6]}
              >
                {form.errors["files"]}
              </Text>
            )}
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
};
