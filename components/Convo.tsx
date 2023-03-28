import { SmsOutput } from "@/lib/utils";
import { Badge, Card, Group, Stack, Text } from "@mantine/core";
import { useEffect, useRef } from "react";

interface ConvoProps {
  convo: SmsOutput[];
  convoWith: string;
}

const dateOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
} as const;

const DateTimeDisplay = ({ date }: { date: Date }) => {
  return (
    <Stack spacing={"xs"}>
      <Badge color="pink" variant="light">
        {date.toLocaleString("sl-SI", dateOptions)}
      </Badge>
      <Badge color="white" variant="light">
        {date.toLocaleTimeString("sl-SI")}
      </Badge>
    </Stack>
  );
};

export const Convo = ({ convo, convoWith }: ConvoProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convo]);

  return (
    <div>
      {convo.map((message) => {
        if (message.from === "other") {
          return (
            <Card
              mb={"md"}
              key={message.date.toString()}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
            >
              <Group position="apart" mt="md" mb="xs">
                <Text weight={500}>{convoWith}</Text>
                <DateTimeDisplay date={message.date} />
              </Group>
              <hr />
              <Text size="sm" color="dimmed">
                {message.text}
              </Text>
            </Card>
          );
        }

        return (
          <Card
            mb={"md"}
            key={message.date.toString()}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            bg="violet"
          >
            <Group position="apart" mt="md" mb="xs">
              <Text color="white" weight={500}>
                Me
              </Text>
              <DateTimeDisplay date={message.date} />
            </Group>
            <hr />
            <Text size="sm" color="white">
              {message.text}
            </Text>
          </Card>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
