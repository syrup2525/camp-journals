import { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname || '/';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await login(username, password);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <form className="space-y-5 rounded-lg bg-white p-6 shadow-sm ring-1 ring-[#ded6c6]" onSubmit={handleSubmit}>
        <div>
          <h2 className="text-3xl font-black text-[#213127]">로그인</h2>
        </div>

        {errorMessage ? <div className="rounded-lg bg-[#f6ddd8] p-4 text-sm font-semibold text-[#93372b]">{errorMessage}</div> : null}

        <label className="grid gap-2 text-sm font-bold text-[#354238]">
          아이디
          <input
            autoComplete="username"
            className="focus-ring min-h-11 rounded-md border border-[#cfc7b6] bg-white px-3 text-[#213127]"
            onChange={(event) => setUsername(event.target.value)}
            required
            type="text"
            value={username}
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#354238]">
          비밀번호
          <input
            autoComplete="current-password"
            className="focus-ring min-h-11 rounded-md border border-[#cfc7b6] bg-white px-3 text-[#213127]"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? '로그인 중' : '로그인'}
        </Button>
      </form>
    </div>
  );
}

