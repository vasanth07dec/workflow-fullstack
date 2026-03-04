import { Button, Flex, Result } from "antd";
import { useNavigate } from "react-router-dom";

/**
 * Component - NotFound
 * the component config in route file. this will match all random urls except configured routes
 * 
 * @returns NotFound component
 */
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Flex justify="center" align="center" className="h-screen">
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Button type="primary" onClick={() => navigate("/")}>
          Back Home
        </Button>
      }
    />
    </Flex>
  );
};

export default NotFound;