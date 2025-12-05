'use client';

import React, { useState, FormEvent } from 'react';
import axios, { AxiosError } from 'axios'; // Importa AxiosError para tipagem segura
import api from '../lib/api'; // Assumindo que sua instância configurada do Axios está aqui
import NavBar from '../components/NavBar/NavBar';
import styles from './Register.module.css';

// 1. Interface reflete os nomes usados no estado e inputs (padrão em inglês)
interface FormData {
  name: string;
  email: string;
  cpf: string;
  password: string;
}

// Utilitário para checar se o erro do Axios contém a resposta do servidor
function isAxiosErrorWithResponse(error: unknown): error is AxiosError & { response: { data: { message: string } } } {
  return axios.isAxiosError(error) && !!error.response && !!(error.response.data as any).message;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    cpf: '',
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
    // O backend espera 'nome' e 'senha', não 'name' e 'password'.
    const dadosParaEnvio = {
      nome: formData.name,      // Mapeia 'name' para 'nome'
      email: formData.email,
      cpf: formData.cpf,
      senha: formData.password,   // Mapeia 'password' para 'senha'
    };

    try {
      // Envia os dados mapeados para o endpoint
      await api.post('/clientes/criar', dadosParaEnvio);

      setMessage('Cadastro realizado com sucesso! Faça login.');
      
      // Limpa o formulário após o sucesso
      setFormData({ name: '', email: '', cpf: '', password: '' }); 

    } catch (error) {
      let errorMessage = 'Erro ao cadastrar. Verifique a rede.';

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
        <h2>Cadastro de Cliente</h2>
        <form onSubmit={handleSubmit}>

          <label htmlFor="name">Nome:</label>
          <input
            id="name"
            type="text"
            name="name" // O nome do input é 'name' (corresponde a formData.name)
            placeholder="Seu nome completo"
            value={formData.name}
            onChange={handleChange}
            required
          />

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

          <label htmlFor="cpf">CPF:</label>
          <input
            id="cpf"
            type="text"
            name="cpf"
            placeholder="000.000.000-00"
            value={formData.cpf}
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
            {loading ? 'Cadastrando...' : 'Cadastrar'}
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

export default Register;