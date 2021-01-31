import { Layout } from 'antd';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import About from "./pages/About";
import Main from "./pages/Main";
import MainHeader from "./components/MainHeader";
import RequireAuth from "./components/RequireAuth";
import { Provider } from 'react-redux';
import store from "./redux/store";
import api from "./api";
import LoginCallback from "./pages/LoginCallback";
import LogoutCallback from "./pages/LogoutCallback";
import Album from "./pages/Album";

api.initialise(store);

const { Header, Content, Footer } = Layout;

export default () => {
  return (
    <Provider store={store}>
      <Layout id="mainLayout">
        <Header id="mainHeader">
          <MainHeader />
        </Header>
        <Content id="mainPageContent">
          <Router>
            <Switch>
              <Route exact path="/about">
                <About/>
              </Route>
              <Route exact path="/callback">
                <LoginCallback/>
              </Route>
              <Route exact path="/logout">
                <LogoutCallback/>
              </Route>
              <RequireAuth path="/">
                <Switch>
                  <Route exact path="/">
                    <Main/>
                  </Route>
                  <Route exact path="/album/:albumId">
                    <Album/>
                  </Route>
                </Switch>
              </RequireAuth>
            </Switch>
          </Router>
        </Content>
        <Footer style={{ textAlign: 'center' }}>PhotoAlbum ©2021</Footer>
      </Layout>
    </Provider>
  );
}
