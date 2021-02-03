import { Button, Card, Col, Row, Typography } from "antd";
import config from "../config";

const { Title } = Typography;

export default () => {
  return (
    <Row>
      <Col md={{ span: 12, offset: 6 }}>
        <Card style={{ textAlign: 'center', backgroundColor: 'transparent' }}>
          <Title>The home for your memories</Title>
          <Button type="primary" size="large"><a href={config.loginUrl}>Go to your memories</a></Button>
        </Card>
      </Col>
    </Row>
  );
}
