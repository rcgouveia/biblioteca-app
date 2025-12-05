'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import axios, { AxiosError } from 'axios';
import api from '../lib/api'; // Instância configurada do Axios
import NavBar from '../components/NavBar/NavBar';
import styles from './Livros.module.css'; // Crie um arquivo CSS similar para estilos

// 1. Interface para o Livro (atualizada conforme o modelo Prisma)
interface Livro {
  id: number;
  titulo: string;
  descricao: string;
  genero: string;
  status: boolean; // true = disponível, false = indisponível (assumindo)
  quantidade: number;
  createdAt: string; // DateTime como string (ISO)
  updatedAt: string; // DateTime como string (ISO)
}

// Interface para o formulário (usada para criar/editar) - sem id, createdAt, updatedAt
interface LivroForm {
  titulo: string;
  descricao: string;
  genero: string;
  status: boolean;
  quantidade: number;
}

// Utilitário para checar erro Axios
function isAxiosErrorWithResponse(error: unknown): error is AxiosError & { response: { data: { message: string } } } {
  return axios.isAxiosError(error) && !!error.response && !!(error.response.data as any).message;
}

const Livros: React.FC = () => {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [formData, setFormData] = useState<LivroForm>({
    titulo: '',
    descricao: '',
    genero: '',
    status: true, // Padrão: disponível
    quantidade: 1, // Padrão: 1 exemplar
  });
  const [editingId, setEditingId] = useState<number | null>(null); // ID do livro sendo editado
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // 2. Buscar todos os livros (GET /livros) - COM VERIFICAÇÕES PARA EVITAR ERROS
  const fetchLivros = async () => {
    try {
      const response = await api.get('/livros');
      console.log('Dados recebidos do backend:', response.data); // LOG PARA DEPURAR: Veja no console do navegador o que o backend retorna

      // Verificação: Só define livros se response.data for um array
      if (Array.isArray(response.data)) {
        setLivros(response.data);
      } else if (response.data && Array.isArray(response.data.livros)) {
        // Se o backend retornar { livros: [...] }, ajuste aqui
        setLivros(response.data.livros);
      } else {
        console.warn('Resposta do backend não é um array válido:', response.data);
        setLivros([]); // Define como array vazio para evitar erros
        setMessage('Erro: Dados dos livros não são válidos.');
      }
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      setMessage('Erro ao carregar livros.');
      setLivros([]); // Garante que livros seja array vazio em caso de erro
    }
  };

  // Carregar livros ao montar o componente
  useEffect(() => {
    fetchLivros();
  }, []);

  // 3. Manipular mudanças no formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement; // Type assertion para acessar 'checked'
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'quantidade' ? parseInt(value) || 0 : value),
    }));
  };

  // 4. Submeter formulário (criar ou atualizar)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (editingId) {
        // Atualizar (PUT /livros/:id)
        await api.put(`/livros/atualizar/${editingId}`, formData);
        setMessage('Livro atualizado com sucesso!');
      } else {
        // Criar (POST /livros)
        await api.post('/livros/criar', formData);
        setMessage('Livro criado com sucesso!');
      }

      // Limpar formulário e recarregar lista
      setFormData({ titulo: '', descricao: '', genero: '', status: true, quantidade: 1 });
      setEditingId(null);
      fetchLivros();
    } catch (error) {
      let errorMessage = 'Erro ao salvar livro.';
      if (isAxiosErrorWithResponse(error)) {
        errorMessage = error.response.data.message;
      }
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 5. Deletar livro (DELETE /livros/:id)
  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar este livro?')) return;

    try {
      await api.delete(`/livros/deletar/${id}`);
      setMessage('Livro deletado com sucesso!');
      fetchLivros(); // Recarregar lista
    } catch (error) {
      let errorMessage = 'Erro ao deletar livro.';
      if (isAxiosErrorWithResponse(error)) {
        errorMessage = error.response.data.message;
      }
      setMessage(errorMessage);
    }
  };

  // 6. Iniciar edição (preencher formulário com dados do livro)
  const handleEdit = (livro: Livro) => {
    setFormData({
      titulo: livro.titulo,
      descricao: livro.descricao,
      genero: livro.genero,
      status: livro.status,
      quantidade: livro.quantidade,
    });
    setEditingId(livro.id);
  };

  // 7. Cancelar edição
  const handleCancelEdit = () => {
    setFormData({ titulo: '', descricao: '', genero: '', status: true, quantidade: 1 });
    setEditingId(null);
  };

  return (
    <div className='bg-black'>
      <NavBar />
      <div className={styles.container}>
        <h2>Gerenciamento de Livros</h2>

        {/* Formulário para Criar/Editar */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <h3>{editingId ? 'Editar Livro' : 'Criar Novo Livro'}</h3>

          <label htmlFor="titulo">Título:</label>
          <input
            id="titulo"
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
          />

          <label htmlFor="descricao">Descrição:</label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            required
            rows={3} // Para uma área de texto maior
          />

          <label htmlFor="genero">Gênero:</label>
          <input
            id="genero"
            type="text"
            name="genero"
            value={formData.genero}
            onChange={handleChange}
            required
          />

          <label htmlFor="status">Disponível:</label>
          <input
            id="status"
            type="checkbox"
            name="status"
            checked={formData.status}
            onChange={handleChange}
          />

          <label htmlFor="quantidade">Quantidade:</label>
          <input
            id="quantidade"
            type="number"
            name="quantidade"
            value={formData.quantidade}
            onChange={handleChange}
            min="0"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit} className={styles.cancelBtn}>
              Cancelar
            </button>
          )}
        </form>

        {/* Lista de Livros - COM VERIFICAÇÃO PARA EVITAR .map() EM NÃO-ARRAYS */}
        <div className={styles.list}>
          <h3>Lista de Livros</h3>
          {!Array.isArray(livros) || livros.length === 0 ? (
            <p>{!Array.isArray(livros) ? 'Erro: Dados inválidos.' : 'Nenhum livro encontrado.'}</p>
          ) : (
            <ul>
              {livros.map((livro) => (
                <li key={livro.id} className={styles.item}>
                  <div>
                    <strong>{livro.titulo}</strong> - {livro.descricao} ({livro.genero})<br />
                    Status: {livro.status ? 'Disponível' : 'Indisponível'} | Quantidade: {livro.quantidade}<br />
                    Criado em: {new Date(livro.createdAt).toLocaleDateString()} | Atualizado em: {new Date(livro.updatedAt).toLocaleDateString()}
                  </div>
                  <div className={styles.actions}>
                    <button onClick={() => handleEdit(livro)}>Editar</button>
                    <button onClick={() => handleDelete(livro.id)} className={styles.deleteBtn}>
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

export default Livros;
