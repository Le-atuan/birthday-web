import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

export function BirthdayDayEmail({
  name,
  inviteUrl,
}: {
  name: string;
  inviteUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Tấm thiệp sinh nhật của bạn đã sẵn sàng</Preview>
      <Body style={bodyStyle}>
        <Container style={cardStyle}>
          <Text style={eyebrowStyle}>Your special delivery has arrived</Text>
          <Heading style={headingStyle}>Chúc mừng sinh nhật, {name}! ✦</Heading>
          <Text style={textStyle}>
            Ngày đặc biệt đã bắt đầu và lá thư dành riêng cho bạn đã đến đích.
            Hãy mở tấm thiệp để nhận lời chúc đang chờ bên trong nhé.
          </Text>
          <Button href={inviteUrl} style={buttonStyle}>
            Mở thiệp sinh nhật
          </Button>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  backgroundColor: "#eaf7ff",
  fontFamily: "Arial, sans-serif",
  padding: "24px 12px",
};
const cardStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #cdeaff",
  borderRadius: "24px",
  padding: "36px 28px",
  color: "#12304a",
};
const eyebrowStyle = {
  color: "#4e9acb",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.16em",
  textTransform: "uppercase" as const,
};
const headingStyle = { color: "#12304a", fontSize: "28px", lineHeight: "1.25" };
const textStyle = { color: "#45677f", fontSize: "15px", lineHeight: "1.75" };
const buttonStyle = {
  backgroundColor: "#2388c7",
  borderRadius: "999px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "700",
  marginTop: "12px",
  padding: "13px 22px",
  textDecoration: "none",
};
