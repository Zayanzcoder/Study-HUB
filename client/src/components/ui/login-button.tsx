
import { Button } from "./button";

export function LoginButton() {
  const handleLogin = () => {
    window.location.href = '/auth/google';
  };

  return (
    <Button onClick={handleLogin} variant="outline">
      Login with Google
    </Button>
  );
}
