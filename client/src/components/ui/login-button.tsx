import { Button } from "./button";

export function LoginButton() {
  const handleLogin = () => {
    const loginButton = document.createElement('div');
    loginButton.innerHTML = '<div class="auth-button-container"><script src="https://auth.util.repl.co/script.js"></script></div>';
    document.body.appendChild(loginButton);
  };

  return (
    <Button onClick={handleLogin} variant="outline">
      Login with Replit
    </Button>
  );
}