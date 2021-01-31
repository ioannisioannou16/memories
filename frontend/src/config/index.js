import dev from "./dev"
import prod from "./prod"

const conf = process.env.ENV === "production" ? prod : dev;

export default {
  ...conf,
  loginUrl: `${conf.cognito.domain}/login?client_id=${conf.cognito.client_id}&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=${conf.cognito.redirect_uri}`,
  logoutUrl: `${conf.cognito.domain}/logout?client_id=${conf.cognito.client_id}&logout_uri=${conf.cognito.logout_uri}`
}
