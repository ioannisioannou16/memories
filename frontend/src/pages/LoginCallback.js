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
    const params = new URLSearchParams(location.hash.split("#")[1]);
    dispatch(login(params.get("id_token")));
    history.push('/');
  }, [location])
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}><Spin /></div>
  );
}
