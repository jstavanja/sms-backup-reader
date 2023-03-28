import { Convo } from "@/components/Convo";
import { FileDropzone } from "@/components/FileDropzone";
import {
  AppShell,
  Header,
  Container,
  Button,
  Stack,
  useMantineTheme,
  Accordion,
  Table,
} from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import { useForm, UseFormReturnType } from "@mantine/form";
import { modals } from "@mantine/modals";
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
          return reject(new Error("File not an SMS file"));

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
          return reject(new Error("File not a contact file"));

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
      return setSmsError((err as Error).message);
    }
    setSmsError(null);
    setSmsFileParsed(smsFileParsed);
  }, [smsForm.values.file]);

  const processContactFile = useCallback(async () => {
    if (!contactForm.values.file) return;

    let contactFileParsed: ContactFile;
    try {
      contactFileParsed = await readContactFile(contactForm.values.file);
    } catch (err) {
      console.log("encountered contact error");

      return setContactError((err as Error).message);
    }

    setContactError(null);
    setContactFileParsed(contactFileParsed);
  }, [contactForm.values.file]);

  useEffect(() => {
    processContactFile();
  }, [processContactFile]);

  useEffect(() => {
    processSmsFile();
  }, [processSmsFile]);

  if (!smsForm.values.file || !contactForm.values.file)
    return <div>No files found.</div>;

  if (smsError) {
    return (
      <div>Reading the SMS file was not successful. Reason: {smsError}</div>
    );
  }

  if (contactError) {
    return (
      <div>
        Reading the Contact file was not successful. Reason: {contactError}
      </div>
    );
  }

  if (!smsFileParsed) return <div>Parsing SMS file.</div>;
  if (!contactFileParsed) return <div>Parsing Contact File.</div>;

  return (
    <Table>
      <thead>
        <tr>
          <th>Person</th>
          <th>Number of messages</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(formatSmsData(smsFileParsed, contactFileParsed)).map(
          ([person, convo]) => {
            const openModal = () =>
              modals.openConfirmModal({
                title: `Conversation with ${person}`,
                children: <Convo convo={convo.reverse()} convoWith={person} />,
                labels: { confirm: "Confirm", cancel: "Cancel" },
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
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <AppShell
          padding="md"
          header={
            <Header height={60} p="xs">
              SMS Backup & Restore Reader
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
            <h1>Upload backup files</h1>

            <Stack>
              <FileDropzone
                label="SMS"
                form={smsForm}
                onDrop={setSMSFileIntoValues}
                theme={theme}
              />

              <FileDropzone
                label="Contacts"
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
                Print contents
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
