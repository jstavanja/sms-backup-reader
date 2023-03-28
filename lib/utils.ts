const normalizeNumber = (num: string) => {
  if (num.startsWith("+")) {
    return num.replace("+", "00");
  }

  if (num.startsWith("00")) {
    return num;
  }

  return `00${num.substring(1)}`;
};

export interface ContactFile {
  listContacts: Contact[];
}

interface Contact {
  name: string;
  numbers: ContactNumber[];
}

interface ContactNumber {
  number: string;
}

const resolveAddressToContactName = (
  address: string | null,
  contactFile: ContactFile
) => {
  if (!address) return "N/A";

  if (address.length === 0) return "N/A";

  const contact = contactFile.listContacts.find((contact) => {
    return contact.numbers.some(
      (number) => normalizeNumber(number.number) === normalizeNumber(address)
    );
  });

  if (!contact) return "N/a";

  return contact.name;
};

type Sender = "self" | "other";

type SmsInput = {
  type: number;
  adress: string;
  body: string;
  time: number;
};

export type SmsOutput = {
  from: Sender;
  text: string;
  date: Date;
};

export interface SmsFile {
  listSms: SmsInput[];
}

export const formatSmsData = (smsFile: SmsFile, contactFile: ContactFile) => {
  const result: Record<string, SmsOutput[]> = {};

  smsFile.listSms.forEach((sms) => {
    const sender = sms.type === 2 ? "self" : "other";

    const convoWith = resolveAddressToContactName(sms.adress, contactFile);

    if (!(convoWith in result)) {
      result[convoWith] = [];
    }

    result[convoWith].unshift({
      from: sender,
      text: sms.body,
      date: new Date(sms.time),
    });
  });

  return result;
};
