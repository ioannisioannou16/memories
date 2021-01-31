import { Spin } from "antd";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../redux/auth";
import { useHistory } from "react-router";

export default () => {
  const dispatch = useDispatch();
  const history = useHistory();
  useEffect(() => {
    dispatch(logout());
    history.push("/");
  }, [])
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}><Spin /></div>
  );
}
