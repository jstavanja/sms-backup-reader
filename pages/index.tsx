import { Convo } from "@/components/Convo";
import { FileDropzone } from "@/components/FileDropzone";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  AppShell,
  Header,
  Container,
  Button,
  Stack,
  useMantineTheme,
  Accordion,
  Table,
  Group,
  Flex,
} from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import { useForm, UseFormReturnType } from "@mantine/form";
import { modals } from "@mantine/modals";
import { GetStaticProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { ContactFile, formatSmsData, SmsFile } from "../lib/utils";

interface BackupFilesForm {
  file?: File;
}

const readSmsFile = (rawFile: File): Promise<SmsFile> => {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.readAsText(rawFile, "UTF-8");
    reader.onload = function (evt) {
      try {
        const parsed = JSON.parse(evt.target?.result as string);

        if (!("listSms" in parsed))
          return reject(new Error("File not an SMS file")); // TODO, make this handled with i18n in the UI

        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
  });
};

const readContactFile = (rawFile: File): Promise<ContactFile> => {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.readAsText(rawFile, "UTF-8");
    reader.onload = function (evt) {
      try {
        const parsed = JSON.parse(evt.target?.result as string);

        console.log({ parsed });
        console.log("listCallLogs" in parsed);

        if (!("listContacts" in parsed))
          return reject(new Error("File not a contact file")); // TODO, make this handled with i18n in the UI

        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
  });
};

interface RenderedResultProps {
  smsForm: UseFormReturnType<BackupFilesForm>;
  contactForm: UseFormReturnType<BackupFilesForm>;
}

const RenderedResult = ({ smsForm, contactForm }: RenderedResultProps) => {
  const { t } = useTranslation();
  const [smsFileParsed, setSmsFileParsed] = useState<SmsFile>();
  const [smsError, setSmsError] = useState<string | null>();
  const [contactError, setContactError] = useState<string | null>();
  const [contactFileParsed, setContactFileParsed] = useState<ContactFile>();

  const processSmsFile = useCallback(async () => {
    if (!smsForm.values.file) return;

    let smsFileParsed: SmsFile;
    try {
      smsFileParsed = await readSmsFile(smsForm.values.file);
    } catch (err) {
      return setSmsError(
        t(
          "Error reading the SMS file. Check whether you're providing the right file."
        )
      );
    }
    setSmsError(null);
    setSmsFileParsed(smsFileParsed);
  }, [smsForm.values.file, t]);

  const processContactFile = useCallback(async () => {
    if (!contactForm.values.file) return;

    let contactFileParsed: ContactFile;
    try {
      contactFileParsed = await readContactFile(contactForm.values.file);
    } catch (err) {
      return setContactError(
        t(
          "Error reading the contact file. Check whether you're providing the right file."
        )
      );
    }

    setContactError(null);
    setContactFileParsed(contactFileParsed);
  }, [contactForm.values.file, t]);

  useEffect(() => {
    processContactFile();
  }, [processContactFile]);

  useEffect(() => {
    processSmsFile();
  }, [processSmsFile]);

  if (!smsForm.values.file || !contactForm.values.file)
    return <div>{t("No files found")}</div>;

  if (smsError) {
    return <div>{smsError}</div>;
  }

  if (contactError) {
    return <div>{contactError}</div>;
  }

  if (!smsFileParsed) return <div>{t("Parsing SMS file")}</div>;
  if (!contactFileParsed) return <div>{t("Parsing Contact File")}</div>;

  return (
    <Table>
      <thead>
        <tr>
          <th>{t("Person")}</th>
          <th>{t("Number of messages")}</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(formatSmsData(smsFileParsed, contactFileParsed)).map(
          ([person, convo]) => {
            const openModal = () =>
              modals.open({
                title: t("conversation_title", { person }),
                children: <Convo convo={convo} convoWith={person} />,
                size: "lg",
              });

            return (
              <tr key={person}>
                <td>
                  <Button onClick={openModal}>{person}</Button>
                </td>
                <td>{convo.length}</td>
              </tr>
            );
          }
        )}
      </tbody>
    </Table>
  );
};

export default function Home() {
  const { t } = useTranslation();
  const smsForm = useForm<BackupFilesForm>();
  const contactForm = useForm<BackupFilesForm>();
  const [shouldRenderResult, setShouldRenderResult] = useState(false);

  const setSMSFileIntoValues = async (files: FileWithPath[]) => {
    if (files.length === 0) return;
    smsForm.setFieldValue("file", files[0]);
  };

  const setContactFileIntoValues = async (files: FileWithPath[]) => {
    if (files.length === 0) return;
    contactForm.setFieldValue("file", files[0]);
  };

  const theme = useMantineTheme();

  const renderParsed = () => {
    setShouldRenderResult(false);
    setShouldRenderResult(true);
  };

  return (
    <>
      <Head>
        <title>{t("app_name")}</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <AppShell
          padding="md"
          header={
            <Header height={60} p="xs">
              <Flex justify={"space-between"}>
                <span>{t("app_name")}</span>
                <LanguageSwitcher />
              </Flex>
            </Header>
          }
          styles={(theme) => ({
            main: {
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[8]
                  : theme.colors.gray[0],
            },
          })}
        >
          <Container>
            <h1>{t("Upload backup files")}</h1>

            <Stack>
              <FileDropzone
                label={t("Drag or click to upload the SMS file")}
                form={smsForm}
                onDrop={setSMSFileIntoValues}
                theme={theme}
              />

              <FileDropzone
                label={t("Drag or click to upload the contacts file")}
                form={contactForm}
                onDrop={setContactFileIntoValues}
                theme={theme}
              />

              <Button
                type="submit"
                onClick={() => {
                  renderParsed();
                }}
              >
                {t("Print contents")}
              </Button>
            </Stack>

            {shouldRenderResult && (
              <RenderedResult smsForm={smsForm} contactForm={contactForm} />
            )}
          </Container>
        </AppShell>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});
