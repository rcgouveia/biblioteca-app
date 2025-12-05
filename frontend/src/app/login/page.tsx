'use client';

import React, { useState, FormEvent } from 'react';
import axios, { AxiosError } from 'axios'; // Importa AxiosError para tipagem segura
import api from '../lib/api'; // Assumindo que sua instância configurada do Axios está aqui
import NavBar from '../components/NavBar/NavBar';
import styles from './Login.module.css'; // Assumindo que você criará um arquivo CSS similar para Login

// 1. Interface reflete os nomes usados no estado e inputs (padrão em inglês)
interface FormData {
  email: string;
  password: string;
}

// Utilitário para checar se o erro do Axios contém a resposta do servidor
function isAxiosErrorWithResponse(error: unknown): error is AxiosError & { response: { data: { message: string } } } {
  return axios.isAxiosError(error) && !!error.response && !!(error.response.data as any).message;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // 2. Tipagem Correta: React.ChangeEvent<HTMLInputElement>
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. Tipagem Correta: FormEvent<HTMLFormElement>
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // 🛠️ Mapeamento Crítico: Transforma as chaves do frontend para o que o backend espera.
    // O backend espera 'email' e 'senha' para login (baseado no padrão do registro).
    const dadosParaEnvio = {
      email: formData.email,
      senha: formData.password, // Mapeia 'password' para 'senha'
    };

    try {
      // Envia os dados mapeados para o endpoint de login (assumindo '/clientes/login' baseado no backend)
      const response = await api.post('/clientes/login', dadosParaEnvio);

      // Assumindo que o backend retorna um token ou dados de sucesso
      // Você pode armazenar o token no localStorage ou context para autenticação
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setMessage('Login realizado com sucesso! Redirecionando...');
        // Aqui você pode redirecionar para uma página protegida, ex: window.location.href = '/dashboard';
      } else {
        setMessage('Login realizado com sucesso!');
      }
      
      // Limpa o formulário após o sucesso
      setFormData({ email: '', password: '' }); 

    } catch (error) {
      let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';

      // 4. Tratamento de Erro Seguro e Tipado
      if (isAxiosErrorWithResponse(error)) {
        // Se for um erro Axios e tiver a mensagem do servidor
        errorMessage = error.response.data.message; 
      }
      
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-black'>
      <NavBar />
      <div className={styles.card}>
        <h2>Login de Cliente</h2>
        <form onSubmit={handleSubmit}>

          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="exemplo@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Senha:</label>
          <input
            id="password"
            type="password"
            name="password" // O nome do input é 'password' (corresponde a formData.password)
            placeholder="********"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* 5. Feedback Visual Melhorado (Exemplo) */}
        {message && (
          <p 
            className={styles.message} 
            style={{ color: message.includes('sucesso') ? 'green' : 'red' }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
