import { SmsOutput } from "@/lib/utils";
import { Badge, Card, Group, Text } from "@mantine/core";

interface ConvoProps {
  convo: SmsOutput[];
  convoWith: string;
}

export const Convo = ({ convo, convoWith }: ConvoProps) => {
  return (
    <div>
      {convo.reverse().map((message) => {
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
                <Badge color="pink" variant="light">
                  {message.date.toLocaleString()}
                </Badge>
              </Group>

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
              <Badge color="blue" variant="light">
                {message.date.toLocaleString()}
              </Badge>
            </Group>

            <Text size="sm" color="white">
              {message.text}
            </Text>
          </Card>
        );
      })}
    </div>
  );
};
