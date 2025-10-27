import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { useAuthStore, type SignupData } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.background};
  padding: ${props => props.theme.spacing[4]};
`;

const AuthCard = styled.div`
  width: 100%;
  max-width: 450px;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  padding: ${props => props.theme.spacing[8]};
  border: 1px solid ${props => props.theme.colors.border};
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const LogoText = styled.h1`
  font-size: ${props => props.theme.fontSizes['3xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
  margin: 0 0 ${props => props.theme.spacing[2]} 0;
`;

const LogoSubtext = styled.p`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const TabContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[6]};
  padding: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.base};
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border: none;
  background: ${props => (props.$active ? props.theme.colors.surface : 'transparent')};
  color: ${props => (props.$active ? props.theme.colors.text : props.theme.colors.textSecondary)};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  box-shadow: ${props => (props.$active ? props.theme.shadows.sm : 'none')};

  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const Label = styled.label`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: ${props => props.theme.spacing[3]};
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  pointer-events: none;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[3]}
    ${props => props.theme.spacing[3]} ${props => props.theme.spacing[10]};
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textTertiary};
  }
`;

const ErrorMessage = styled.span`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.error};
  margin-top: -${props => props.theme.spacing[2]};
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: white;
  background: ${props => props.theme.colors.primary};
  border: none;
  border-radius: ${props => props.theme.borderRadius.base};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  margin-top: ${props => props.theme.spacing[2]};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  text-align: center;
  margin: ${props => props.theme.spacing[4]} 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
  position: relative;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 40%;
    height: 1px;
    background: ${props => props.theme.colors.border};
  }

  &::before {
    left: 0;
  }

  &::after {
    right: 0;
  }
`;

const HelperText = styled.p`
  text-align: center;
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  margin: ${props => props.theme.spacing[4]} 0 0 0;
`;

type AuthMode = 'login' | 'signup';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, isLoading } = useAuthStore();
  const { addToast } = useToastStore();

  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [debugInfo, setDebugInfo] = useState<string>('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'signup') {
      if (!formData.username) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }

      if (!formData.displayName) {
        newErrors.displayName = 'Display name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDebugInfo('Form submitted!');
    console.log('Form submitted', { mode, formData });

    if (!validateForm()) {
      setDebugInfo(`Validation failed: ${JSON.stringify(errors)}`);
      console.log('Form validation failed', errors);
      return;
    }

    setDebugInfo('Validation passed, calling API...');
    console.log('Form validation passed, attempting authentication...');

    try {
      if (mode === 'login') {
        console.log('Calling login...', formData.email);
        setDebugInfo(`Logging in as ${formData.email}...`);
        await login(formData.email, formData.password);
        console.log('Login successful');
        setDebugInfo('Login successful!');
        addToast('success', 'Welcome back!');
      } else {
        const signupData: SignupData = {
          email: formData.email,
          password: formData.password,
          username: formData.username,
          displayName: formData.displayName,
        };
        console.log('Calling signup...', signupData);
        setDebugInfo('Signing up...');
        await signup(signupData);
        console.log('Signup successful');
        setDebugInfo('Signup successful!');
        addToast('success', 'Account created successfully!');
      }
      navigate('/');
    } catch (error) {
      console.error('Authentication error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Authentication failed';
      setDebugInfo(`ERROR: ${errorMsg}`);
      addToast('error', errorMsg);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
  };

  return (
    <PageContainer>
      <AuthCard>
        <Logo>
          <LogoText>Maifead</LogoText>
          <LogoSubtext>Your personalized feed aggregator</LogoSubtext>
        </Logo>

        <TabContainer>
          <Tab $active={mode === 'login'} onClick={() => switchMode('login')}>
            Sign In
          </Tab>
          <Tab $active={mode === 'signup'} onClick={() => switchMode('signup')}>
            Sign Up
          </Tab>
        </TabContainer>

        <Form onSubmit={handleSubmit}>
          {debugInfo && (
            <div style={{ padding: '12px', background: '#ff6b6b', color: 'white', borderRadius: '4px', marginBottom: '16px', fontSize: '14px', wordBreak: 'break-word' }}>
              DEBUG: {debugInfo}
            </div>
          )}
          {mode === 'signup' && (
            <>
              <FormGroup>
                <Label htmlFor="displayName">Display Name</Label>
                <InputWrapper>
                  <InputIcon>
                    <User />
                  </InputIcon>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.displayName}
                    onChange={e => handleInputChange('displayName', e.target.value)}
                    disabled={isLoading}
                  />
                </InputWrapper>
                {errors.displayName && <ErrorMessage>{errors.displayName}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="username">Username</Label>
                <InputWrapper>
                  <InputIcon>
                    <UserPlus />
                  </InputIcon>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={e => handleInputChange('username', e.target.value)}
                    disabled={isLoading}
                  />
                </InputWrapper>
                {errors.username && <ErrorMessage>{errors.username}</ErrorMessage>}
              </FormGroup>
            </>
          )}

          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <InputWrapper>
              <InputIcon>
                <Mail />
              </InputIcon>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                disabled={isLoading}
              />
            </InputWrapper>
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <InputWrapper>
              <InputIcon>
                <Lock />
              </InputIcon>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                disabled={isLoading}
              />
            </InputWrapper>
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </FormGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </SubmitButton>
        </Form>

        <HelperText>
          {mode === 'login'
            ? 'Demo: Create an account to try Maifead'
            : 'Your data is stored locally for this demo'}
        </HelperText>
      </AuthCard>
    </PageContainer>
  );
};
