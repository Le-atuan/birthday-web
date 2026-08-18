import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

type DaysLeft = 7 | 1 | 0;

type BirthdayReminderEmailProps = {
  name: string;
  daysLeft: DaysLeft;
};

const COPY: Record<
  DaysLeft,
  { preview: string; heading: string; body: string }
> = {
  7: {
    preview: "Còn 7 ngày nữa là đến sinh nhật của bạn",
    heading: "Còn 7 ngày nữa",
    body: "Một tấm thiệp đang được chuẩn bị cho ngày đặc biệt của bạn. Hẹn gặp lại sau 7 ngày nữa!",
  },
  1: {
    preview: "Ngày mai là sinh nhật của bạn rồi",
    heading: "Còn 1 ngày nữa",
    body: "Chỉ còn một giấc ngủ nữa thôi — tấm thiệp của bạn đã sẵn sàng lên đường.",
  },
  0: {
    preview: "Chúc mừng sinh nhật!",
    heading: "Hôm nay là ngày của bạn",
    body: "Chúc mừng sinh nhật! Hãy mở tấm thiệp đang chờ bạn.",
  },
};

export function BirthdayReminderEmail({
  name,
  daysLeft,
}: BirthdayReminderEmailProps) {
  const copy = COPY[daysLeft];

  return (
    <Html>
      <Head />
      <Preview>{copy.preview}</Preview>
      <Body style={{ backgroundColor: "#0a0d14", fontFamily: "sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#131826",
            borderRadius: "24px",
            padding: "32px",
            color: "#f5f1e8",
          }}
        >
          <Heading style={{ color: "#ffd173", fontSize: "24px" }}>
            {copy.heading}, {name}
          </Heading>
          <Text
            style={{ color: "#a6acc2", fontSize: "14px", lineHeight: "1.6" }}
          >
            {copy.body}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
