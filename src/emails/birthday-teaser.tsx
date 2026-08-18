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

export function BirthdayTeaserEmail({
  name,
  inviteUrl,
}: {
  name: string;
  inviteUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Một lá thư đặc biệt đang trên đường đến với bạn</Preview>
      <Body style={bodyStyle}>
        <Container style={cardStyle}>
          <Text style={eyebrowStyle}>A little surprise is coming</Text>
          <Heading style={headingStyle}>Còn 2 ngày nữa, {name} ✦</Heading>
          <Text style={textStyle}>
            Một lá thư nhỏ đang vượt qua những đám mây để đến với bạn. Bạn có
            thể ghé xem hành trình ngay bây giờ, nhưng món quà sẽ chỉ mở vào
            đúng ngày đặc biệt.
          </Text>
          <Button href={inviteUrl} style={buttonStyle}>
            Xem lá thư đang chờ
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
