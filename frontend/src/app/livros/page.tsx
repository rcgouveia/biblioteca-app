'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import axios, { AxiosError } from 'axios';
import api from '../lib/api';
import NavBar from '../components/NavBar/NavBar';
import { Book, Edit, Trash2, Plus } from 'lucide-react';

interface Livro {
  id: number;
  titulo: string;
  descricao: string;
  genero: string;
  status: boolean;
  quantidade: number;
  createdAt: string;
  updatedAt: string;
}

interface LivroForm {
  titulo: string;
  descricao: string;
  genero: string;
  status: boolean;
  quantidade: number;
}

function isAxiosErrorWithResponse(error: unknown): error is AxiosError & { response: { data: { message: string } } } {
  return axios.isAxiosError(error) && !!error.response && !!(error.response.data as any).message;
}

const Livros: React.FC = () => {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [formData, setFormData] = useState<LivroForm>({
    titulo: '',
    descricao: '',
    genero: '',
    status: true,
    quantidade: 1,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [filtroTitulo, setFiltroTitulo] = useState<string>('');

  const fetchLivros = async () => {
    try {
      const response = await api.get('/livro/listar');
      if (Array.isArray(response.data)) setLivros(response.data);
      else setLivros([]);
    } catch {
      setMessage('Erro ao carregar livros.');
      setLivros([]);
    }
  };

  useEffect(() => {
    fetchLivros();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'quantidade' ? parseInt(value) || 0 : value)
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (editingId) await api.put(`/livro/atualizar/${editingId}`, formData);
      else await api.post('/livro/criar', formData);

      setMessage(editingId ? 'Livro atualizado com sucesso!' : 'Livro criado com sucesso!');
      setFormData({ titulo: '', descricao: '', genero: '', status: true, quantidade: 1 });
      setEditingId(null);
      fetchLivros();
    } catch (error) {
      let errorMessage = 'Erro ao salvar livro.';
      if (isAxiosErrorWithResponse(error)) errorMessage = error.response.data.message;
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar este livro?')) return;
    try {
      await api.delete(`/livro/deletar/${id}`);
      setMessage('Livro deletado com sucesso!');
      fetchLivros();
    } catch (error) {
      let errorMessage = 'Erro ao deletar livro.';
      if (isAxiosErrorWithResponse(error)) errorMessage = error.response.data.message;
      setMessage(errorMessage);
    }
  };

  const handleEdit = (livro: Livro) => {
    setFormData({
      titulo: livro.titulo,
      descricao: livro.descricao,
      genero: livro.genero,
      status: livro.status,
      quantidade: livro.quantidade
    });
    setEditingId(livro.id);
  };

  const handleCancelEdit = () => {
    setFormData({ titulo: '', descricao: '', genero: '', status: true, quantidade: 1 });
    setEditingId(null);
  };

  return (
    <div className="bg-white min-h-screen">
      <NavBar />
      <div className="mt-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Gerenciamento de Livros</h1>
        <h2 className="text-2xl text-orange-500 font-semibold mb-8">Biblioteca</h2>
      </div>

      <div className="max-w-3xl mx-auto mb-10 p-6 bg-gray-50 rounded shadow">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Book className="text-orange-500" />
          {editingId ? 'Editar Livro' : 'Criar Novo Livro'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Título</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Descrição</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Gênero</label>
            <input
              type="text"
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleChange}
              />
              Disponível
            </label>
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-1">Quantidade</label>
              <input
                type="number"
                name="quantidade"
                value={formData.quantidade}
                onChange={handleChange}
                required
                min={1}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition"
            >
              <Plus size={18} />
              {loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="max-w-3xl mx-auto p-6 bg-gray-50 rounded shadow">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Book className="text-orange-500" />
          Lista de Livros
        </h3>
        {livros.length === 0 ? (
          <p className="text-gray-500 text-center">Nenhum livro encontrado.</p>
        ) : (
          <ul className="space-y-4">
            {livros.map((livro) => (
              <li key={livro.id} className="flex justify-between items-center bg-white border border-gray-300 rounded p-4 shadow hover:shadow-md transition">
                <div>
                  <p className="text-gray-800 font-semibold">{livro.titulo}</p>
                  <p className="text-gray-600">{livro.descricao} ({livro.genero})</p>
                  <p className="text-gray-600">
                    Status: {livro.status ? 'Disponível' : 'Indisponível'} | Quantidade: {livro.quantidade}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Criado: {new Date(livro.createdAt).toLocaleDateString()} | Atualizado: {new Date(livro.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(livro)}
                    className="flex items-center gap-1 px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-400 transition"
                  >
                    <Edit size={14} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(livro.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 transition"
                  >
                    <Trash2 size={14} /> Deletar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {message && (
          <p className={`mt-4 text-center font-medium ${message.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Livros;
