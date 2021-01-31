import { Route, useLocation } from "react-router-dom";
import { shallowEqual, useSelector } from 'react-redux';
import { Redirect } from "react-router";
import _ from 'lodash';

export default ({ path, children }) => {
  const location = useLocation();
  const auth = useSelector(state => state.auth, shallowEqual);
  if (_.isNil(auth.token)) {
    return (
      <Redirect
        to={{
          pathname: "/about",
          state: { from: location.pathname }
        }}
      />
    );
  }
  return <Route path={path} render={() => children} />;
};
