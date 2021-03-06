package pl.touk.nussknacker.ui.security.basicauth

import akka.http.scaladsl.server.directives.Credentials
import org.scalatest.{FunSpec, Matchers}
import pl.touk.nussknacker.ui.security.api.AuthenticationConfiguration.{ConfigRule, ConfigUser}
import pl.touk.nussknacker.ui.security.api.AuthenticationMethod.AuthenticationMethod
import pl.touk.nussknacker.ui.security.api.{AuthenticationMethod, DefaultAuthenticationConfiguration}


class BasicHttpAuthenticatorDataSpec extends FunSpec with Matchers {
  class DummyConfiguration(usersList: List[ConfigUser], rulesList: List[ConfigRule], method: AuthenticationMethod = AuthenticationMethod.BasicAuth, usersFile: String = "")
    extends DefaultAuthenticationConfiguration(method: AuthenticationMethod, usersFile: String) {
    override lazy val users: List[ConfigUser] = usersList
    override lazy val rules: List[ConfigRule] = rulesList
  }

  it("should authenticate using plain password") {
    val authenticator = new BasicHttpAuthenticator(new DummyConfiguration(List(ConfigUser("foo", Some("password"), None, List.empty)), List.empty), List.empty)
    authenticator.authenticate(new SampleProvidedCredentials("foo","password")) shouldBe 'defined
    authenticator.authenticate(new SampleProvidedCredentials("foo","password2")) shouldBe 'empty
  }

  it("should authenticate using bcrypt password") {
    val authenticator = new BasicHttpAuthenticator(new DummyConfiguration(List(ConfigUser("foo", None,
      // result of python -c 'import bcrypt; print(bcrypt.hashpw("password".encode("utf8"), bcrypt.gensalt(rounds=12, prefix="2a")))'
      Some("$2a$12$oA3U7DXkT5eFkyB8GbtKzuVqxUCU0zDmcueBYV218zO/JFQ9/bzY6"),
      List.empty)), List.empty), List.empty)
    authenticator.authenticate(new SampleProvidedCredentials("foo","password")) shouldBe 'defined
    authenticator.authenticate(new SampleProvidedCredentials("foo","password2")) shouldBe 'empty
  }

  class SampleProvidedCredentials(identifier: String, receivedSecret: String) extends Credentials.Provided(identifier) {
    def verify(secret: String, hasher: String ⇒ String): Boolean = secret == hasher(receivedSecret)
  }
}