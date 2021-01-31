import { Spin } from "antd";
import { useHistory, useLocation } from "react-router";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "../redux/auth";

export default () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const history = useHistory();
  useEffect(() => {
    const params = new URLSearchParams(location.hash);
    dispatch(login(params.get("access_token")));
    history.push('/');
  }, [])
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}><Spin /></div>
  );
}
