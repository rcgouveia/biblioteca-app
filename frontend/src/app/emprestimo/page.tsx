'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import axios, { AxiosError } from 'axios';
import api from '../lib/api';
import NavBar from '../components/NavBar/NavBar';

interface Emprestimo {
  id: number;
  clienteId: number;
  clienteNome?: string;
  clienteCpf?: string;
  livrosId: number; // plural
  livroTitulo?: string;
  bibliotecarioId?: number;
  codEmprestimo?: number;
  dataEmprestimo: string;
  dataDevolucao?: string;
  status: string;
}

interface EmprestimoForm {
  clienteId: number;
  clienteCpf: string;
  livrosId: number;
  bibliotecarioId: number;
  codEmprestimo?: number;
  dataEmprestimo: string;
  dataDevolucao?: string;
  status: string;
}

interface Cliente {
  id: number;
  nome: string;
  cpf: string;
}

interface Livro {
  id: number;
  titulo: string;
}

function isAxiosErrorWithResponse(error: unknown): error is AxiosError & { response: { data: { message: string } } } {
  return axios.isAxiosError(error) && !!error.response && !!(error.response.data as any).message;
}

const Emprestimos: React.FC = () => {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [formData, setFormData] = useState<EmprestimoForm>({
    clienteId: 0,
    clienteCpf: '',
    livrosId: 0,
    bibliotecarioId: 3,
    codEmprestimo: undefined,
    dataEmprestimo: new Date().toISOString().split('T')[0],
    dataDevolucao: '',
    status: 'ativo',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [cpfFiltro, setCpfFiltro] = useState<string>('');

  useEffect(() => {
    fetchClientes();
    fetchLivros();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await api.get('/clientes/listar');
      if (Array.isArray(response.data)) setClientes(response.data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const fetchLivros = async () => {
    try {
      const response = await api.get('/livro/listar');
      if (Array.isArray(response.data)) setLivros(response.data);
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
    }
  };

  const fetchEmprestimosPorCpf = async () => {
    if (!cpfFiltro) {
      setMessage('Digite um CPF para buscar.');
      return;
    }
    try {
      setLoading(true);
      setMessage('');
      const response = await api.get(`/emprestimo/listar/${cpfFiltro}`);
      if (Array.isArray(response.data)) {
        setEmprestimos(response.data);
        if (response.data.length === 0) setMessage('Nenhum empréstimo encontrado para este CPF.');
      } else {
        setEmprestimos([]);
        setMessage('Dados inválidos do backend.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Erro ao buscar empréstimos por CPF.');
      setEmprestimos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clienteId = parseInt(e.target.value) || 0;
    const clienteSelecionado = clientes.find(c => c.id === clienteId);
    setFormData(prev => ({
      ...prev,
      clienteId,
      clienteCpf: clienteSelecionado ? clienteSelecionado.cpf : ''
    }));
  };

  const handleLivroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, livrosId: parseInt(e.target.value) || 0 }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!editingId && !formData.codEmprestimo) {
        formData.codEmprestimo = Math.floor(100 + Math.random() * 900);
      }

      if (editingId) {
        await api.put(`/emprestimo/atualizar/${editingId}`, formData);
        setMessage('Empréstimo atualizado com sucesso!');
      } else {
        await api.post('/emprestimo/criar', formData);
        setMessage('Empréstimo criado com sucesso!');
      }

      setFormData({
        clienteId: 0,
        clienteCpf: '',
        livrosId: 0,
        bibliotecarioId: 3,
        codEmprestimo: undefined,
        dataEmprestimo: new Date().toISOString().split('T')[0],
        dataDevolucao: '',
        status: 'ativo',
      });
      setEditingId(null);
      setCpfFiltro('');
      setEmprestimos([]);
    } catch (error) {
      let errorMessage = 'Erro ao salvar empréstimo.';
      if (isAxiosErrorWithResponse(error)) errorMessage = error.response.data.message;
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja realmente deletar este empréstimo?')) return;
    try {
      await api.delete(`/emprestimo/deletar/${id}`);
      setEmprestimos(prev => prev.filter(e => e.id !== id));
      setMessage('Empréstimo deletado com sucesso!');
    } catch (error) {
      let errorMessage = 'Erro ao deletar empréstimo.';
      if (isAxiosErrorWithResponse(error)) errorMessage = error.response.data.message;
      setMessage(errorMessage);
    }
  };

  const handleEdit = (emprestimo: Emprestimo) => {
    setFormData({
      clienteId: emprestimo.clienteId,
      clienteCpf: emprestimo.clienteCpf || '',
      livrosId: emprestimo.livrosId,
      bibliotecarioId: emprestimo.bibliotecarioId || 3,
      codEmprestimo: emprestimo.codEmprestimo,
      dataEmprestimo: emprestimo.dataEmprestimo.split('T')[0],
      dataDevolucao: emprestimo.dataDevolucao ? emprestimo.dataDevolucao.split('T')[0] : '',
      status: emprestimo.status
    });
    setEditingId(emprestimo.id);
  };

  const handleCancelEdit = () => {
    setFormData({
      clienteId: 0,
      clienteCpf: '',
      livrosId: 0,
      bibliotecarioId: 3,
      codEmprestimo: undefined,
      dataEmprestimo: new Date().toISOString().split('T')[0],
      dataDevolucao: '',
      status: 'ativo'
    });
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <NavBar />
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Gerenciamento de Empréstimos</h2>

        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded shadow-md mb-6 space-y-4">
          <h3 className="text-xl font-semibold">{editingId ? 'Editar Empréstimo' : 'Criar Novo Empréstimo'}</h3>

          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="flex-1">
              <label className="block mb-1 font-medium">Cliente:</label>
              <select className="w-full border rounded p-2" value={formData.clienteId} onChange={handleClienteChange} required>
                <option value={0}>Selecione um cliente</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>

            <div className="flex-1">
              <label className="block mb-1 font-medium">Livro:</label>
              <select className="w-full border rounded p-2" value={formData.livrosId} onChange={handleLivroChange} required>
                <option value={0}>Selecione um livro</option>
                {livros.map(l => <option key={l.id} value={l.id}>{l.titulo}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="flex-1">
              <label className="block mb-1 font-medium">Data de Empréstimo:</label>
              <input type="date" className="w-full border rounded p-2" name="dataEmprestimo" value={formData.dataEmprestimo} onChange={handleChange} required />
            </div>

            <div className="flex-1">
              <label className="block mb-1 font-medium">Data de Devolução:</label>
              <input type="date" className="w-full border rounded p-2" name="dataDevolucao" value={formData.dataDevolucao} onChange={handleChange} />
            </div>

            <div className="flex-1">
              <label className="block mb-1 font-medium">Status:</label>
              <select className="w-full border rounded p-2" name="status" value={formData.status} onChange={handleChange} required>
                <option value="ativo">Ativo</option>
                <option value="devolvido">Devolvido</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-2 mt-4">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancelar</button>
            )}
          </div>
        </form>

        <div className="mb-6 flex items-center space-x-2">
          <input type="text" placeholder="Filtrar por CPF" className="border rounded p-2 flex-1" value={cpfFiltro} onChange={e => setCpfFiltro(e.target.value)} />
          <button onClick={fetchEmprestimosPorCpf} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Buscar</button>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Lista de Empréstimos</h3>
          {emprestimos.length === 0 ? (
            <p className="text-gray-500">Nenhum empréstimo encontrado.</p>
          ) : (
            <ul className="space-y-2">
              {emprestimos.map(e => (
                <li key={e.id} className="border p-4 rounded shadow-sm flex justify-between items-start">
                  <div>
                    <p><strong>Cliente:</strong> {e.clienteNome} | <strong>CPF:</strong> {e.clienteCpf}</p>
                    <p><strong>Livro:</strong> {e.livroTitulo}</p>
                    <p><strong>Empréstimo:</strong> {new Date(e.dataEmprestimo).toLocaleDateString()} | <strong>Devolução:</strong> {e.dataDevolucao ? new Date(e.dataDevolucao).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Status:</strong> {e.status}</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <button onClick={() => handleEdit(e)} className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500">Editar</button>
                    <button onClick={() => handleDelete(e.id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Deletar</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {message && (
          <p className={`mt-4 font-medium ${message.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
        )}
      </div>
    </div>
  );
};

export default Emprestimos;
