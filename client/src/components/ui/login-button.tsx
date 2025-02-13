
import { Button } from "./button";

export function LoginButton() {
  const handleLogin = () => {
    window.addEventListener('message', (e) => {
      if (e.data.type === 'userAuthed') {
        window.location.reload();
      }
    });
    
    const authWindow = window.open(
      'https://replit.com/auth_with_repl_site?domain=' + window.location.host,
      '_blank',
      'width=500,height=600'
    );
  };

  return (
    <Button onClick={handleLogin} variant="outline">
      Sign in with Replit
    </Button>
  );
}
