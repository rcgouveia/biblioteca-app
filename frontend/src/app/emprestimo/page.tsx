'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import axios, { AxiosError } from 'axios';
import api from '../lib/api'; // Instância configurada do Axios
import NavBar from '../components/NavBar/NavBar';
import styles from './Emprestimos.module.css'; // Crie um arquivo CSS similar para estilos

// 1. Interfaces (assumindo campos comuns para Emprestimo, ajuste conforme o modelo Prisma)
interface Emprestimo {
  id: number;
  clienteId: number;
  livroId: number;
  dataEmprestimo: string; // DateTime como string (ISO)
  dataDevolucao?: string; // Opcional, para devolução
  status: string; // Ex: "ativo", "devolvido"
  // Adicione campos extras se houver, como createdAt, updatedAt
}

interface EmprestimoForm {
  clienteId: number;
  livroId: number;
  dataEmprestimo: string;
  dataDevolucao?: string;
  status: string;
}

// Interfaces auxiliares para dropdowns (buscar clientes e livros)
interface Cliente {
  id: number;
  nome: string; // Assumindo que Cliente tem 'nome'
}

interface Livro {
  id: number;
  titulo: string;
}

// Utilitário para checar erro Axios
function isAxiosErrorWithResponse(error: unknown): error is AxiosError & { response: { data: { message: string } } } {
  return axios.isAxiosError(error) && !!error.response && !!(error.response.data as any).message;
}

const Emprestimos: React.FC = () => {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]); // Para dropdown de clientes
  const [livros, setLivros] = useState<Livro[]>([]); // Para dropdown de livros
  const [formData, setFormData] = useState<EmprestimoForm>({
    clienteId: 0,
    livroId: 0,
    dataEmprestimo: new Date().toISOString().split('T')[0], // Data atual no formato YYYY-MM-DD
    dataDevolucao: '',
    status: 'ativo',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // 2. Buscar empréstimos, clientes e livros
  const fetchEmprestimos = async () => {
    try {
      const response = await api.get('/emprestimos/listar'); // Assumindo endpoint GET /emprestimos
      console.log('Empréstimos recebidos:', response.data);
      if (Array.isArray(response.data)) {
        setEmprestimos(response.data);
      } else {
        setEmprestimos([]);
        setMessage('Erro: Dados dos empréstimos não são válidos.');
      }
    } catch (error) {
      console.error('Erro ao buscar empréstimos:', error);
      setMessage('Erro ao carregar empréstimos.');
      setEmprestimos([]);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await api.get('/clientes/listar'); // Assumindo endpoint GET /clientes
      if (Array.isArray(response.data)) {
        setClientes(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const fetchLivros = async () => {
    try {
      const response = await api.get('/livros/listar'); // Assumindo endpoint GET /livros
      if (Array.isArray(response.data)) {
        setLivros(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
    }
  };

  useEffect(() => {
    fetchEmprestimos();
    fetchClientes();
    fetchLivros();
  }, []);

  // 3. Manipular mudanças no formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'clienteId' || name === 'livroId' ? parseInt(value) || 0 : value,
    }));
  };

  // 4. Submeter formulário (criar ou atualizar)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (editingId) {
        await api.put(`/emprestimos/atualizar/${editingId}`, formData); // PUT /emprestimos/:id
        setMessage('Empréstimo atualizado com sucesso!');
      } else {
        await api.post('/emprestimos/criar', formData); // POST /emprestimos
        setMessage('Empréstimo criado com sucesso!');
      }

      setFormData({ clienteId: 0, livroId: 0, dataEmprestimo: new Date().toISOString().split('T')[0], dataDevolucao: '', status: 'ativo' });
      setEditingId(null);
      fetchEmprestimos();
    } catch (error) {
      let errorMessage = 'Erro ao salvar empréstimo.';
      if (isAxiosErrorWithResponse(error)) {
        errorMessage = error.response.data.message;
      }
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 5. Deletar empréstimo
  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar este empréstimo?')) return;

    try {
      await api.delete(`/emprestimos/deletar/${id}`); // DELETE /emprestimos/:id
      setMessage('Empréstimo deletado com sucesso!');
      fetchEmprestimos();
    } catch (error) {
      let errorMessage = 'Erro ao deletar empréstimo.';
      if (isAxiosErrorWithResponse(error)) {
        errorMessage = error.response.data.message;
      }
      setMessage(errorMessage);
    }
  };

  // 6. Iniciar edição
  const handleEdit = (emprestimo: Emprestimo) => {
    setFormData({
      clienteId: emprestimo.clienteId,
      livroId: emprestimo.livroId,
      dataEmprestimo: emprestimo.dataEmprestimo.split('T')[0], // Formato YYYY-MM-DD
      dataDevolucao: emprestimo.dataDevolucao ? emprestimo.dataDevolucao.split('T')[0] : '',
      status: emprestimo.status,
    });
    setEditingId(emprestimo.id);
  };

  // 7. Cancelar edição
  const handleCancelEdit = () => {
    setFormData({ clienteId: 0, livroId: 0, dataEmprestimo: new Date().toISOString().split('T')[0], dataDevolucao: '', status: 'ativo' });
    setEditingId(null);
  };

  return (
    <div className='bg-black'>
      <NavBar />
      <div className={styles.container}>
        <h2>Gerenciamento de Empréstimos</h2>

        {/* Formulário para Criar/Editar */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <h3>{editingId ? 'Editar Empréstimo' : 'Criar Novo Empréstimo'}</h3>

          <label htmlFor="clienteId">Cliente:</label>
          <select
            id="clienteId"
            name="clienteId"
            value={formData.clienteId}
            onChange={handleChange}
            required
          >
            <option value={0}>Selecione um cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>

          <label htmlFor="livroId">Livro:</label>
          <select
            id="livroId"
            name="livroId"
            value={formData.livroId}
            onChange={handleChange}
            required
          >
            <option value={0}>Selecione um livro</option>
            {livros.map((livro) => (
              <option key={livro.id} value={livro.id}>
                {livro.titulo}
              </option>
            ))}
          </select>

          <label htmlFor="dataEmprestimo">Data de Empréstimo:</label>
          <input
            id="dataEmprestimo"
            type="date"
            name="dataEmprestimo"
            value={formData.dataEmprestimo}
            onChange={handleChange}
            required
          />

          <label htmlFor="dataDevolucao">Data de Devolução (opcional):</label>
          <input
            id="dataDevolucao"
            type="date"
            name="dataDevolucao"
            value={formData.dataDevolucao}
            onChange={handleChange}
          />

          <label htmlFor="status">Status:</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="ativo">Ativo</option>
            <option value="devolvido">Devolvido</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit} className={styles.cancelBtn}>
              Cancelar
            </button>
          )}
        </form>

        {/* Lista de Empréstimos */}
        <div className={styles.list}>
          <h3>Lista de Empréstimos</h3>
          {!Array.isArray(emprestimos) || emprestimos.length === 0 ? (
            <p>{!Array.isArray(emprestimos) ? 'Erro: Dados inválidos.' : 'Nenhum empréstimo encontrado.'}</p>
          ) : (
            <ul>
              {emprestimos.map((emprestimo) => (
                <li key={emprestimo.id} className={styles.item}>
                  <div>
                    Cliente ID: {emprestimo.clienteId} | Livro ID: {emprestimo.livroId}<br />
                    Empréstimo: {new Date(emprestimo.dataEmprestimo).toLocaleDateString()} | 
                    Devolução: {emprestimo.dataDevolucao ? new Date(emprestimo.dataDevolucao).toLocaleDateString() : 'N/A'}<br />
                    Status: {emprestimo.status}
                  </div>
                  <div className={styles.actions}>
                    <button onClick={() => handleEdit(emprestimo)}>Editar</button>
                    <button onClick={() => handleDelete(emprestimo.id)} className={styles.deleteBtn}>
                      Deletar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mensagem de Feedback */}
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

export default Emprestimos;