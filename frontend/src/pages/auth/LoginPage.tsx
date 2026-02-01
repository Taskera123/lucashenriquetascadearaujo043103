import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { AuthFacade } from '../../facades/AuthFacade';

export default function LoginPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputStyle = { width: '100%', height: '2.75rem' };

  async function onLogin() {
    setError(null);
    if (!username.trim() || !password) {
      setError('Informe usuário e senha.');
      return;
    }

    setLoading(true);
    try {
      await AuthFacade.login({ username: username.trim(), password });
      nav('/admin/artistas');
    } catch (e: any) {
      setError(e?.message ?? 'Falha no login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16 }}>
      <Card title="Login" style={{ width: 'min(520px, 96vw)' }}>
        {error ? <Message severity="error" text={error} /> : null}

        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          <label style={{ fontSize: 12, opacity: 0.75, display: 'grid', gap: 6 }}>
            <span>Usuário</span>
            <InputText className="w-full" style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>

          <label style={{ fontSize: 12, opacity: 0.75, display: 'grid', gap: 6 }}>
            <span>Senha</span>

            <div style={{ position: 'relative' }}>
              <InputText
                className="w-full"
                style={{ ...inputStyle, paddingRight: '2.5rem' }}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />

              <Button
                type="button"
                icon={showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'}
                onClick={() => setShowPassword((v) => !v)}
                className="p-button-text p-button-rounded"
                style={{
                  position: 'absolute',
                  right: 4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '2rem',
                  width: '2rem',
                }}
              />
            </div>
          </label>
         
          <Button label={loading ? 'Entrando...' : 'Entrar'} icon="pi pi-sign-in" onClick={onLogin} disabled={loading} style={{ width: '100%' }} />
        </div>
      </Card>
    </div>
  );
}
