'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import axios, { AxiosError } from 'axios';
import api from '../lib/api'; // Instância configurada do Axios
import NavBar from '../components/NavBar/NavBar';
import { TextField, Button, Alert, Box, Typography, Container, List, ListItem, ListItemText, IconButton, FormControlLabel, Checkbox } from '@mui/material';
import { Book, Edit, Trash2, Plus } from 'lucide-react';

// 1. Interface para o Livro (atualizada conforme o modelo Prisma)
interface Livro {
  id: number;
  titulo: string;
  descricao: string;
  genero: string;
  status: boolean; // true = disponível, false = indisponível
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
        // Atualizar (PUT /livros/atualizar/:id) - Ajustado conforme seu código
        await api.put(`/livros/atualizar/${editingId}`, formData);
        setMessage('Livro atualizado com sucesso!');
      } else {
        // Criar (POST /livros/criar) - Ajustado conforme seu código
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

  // 5. Deletar livro (DELETE /livros/deletar/:id) - Ajustado conforme seu código
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
    <div className="bg-black min-h-screen">
      <NavBar />
      
      <div className="mt-10">
        <div className="flex justify-center text-white font-bold font-serif text-5xl">
          Gerenciamento de Livros
        </div>
        <div className="flex justify-center text-orange-300 font-bold font-serif text-5xl mb-10">
          Biblioteca
        </div>
      </div>

      <Container maxWidth="md" className="mt-10">
        {/* Formulário para Criar/Editar */}
        <Box className="bg-neutral-800 p-8 rounded-lg shadow-lg mb-10">
          <Typography variant="h5" className="text-center text-white mb-6 font-serif flex justify-center items-center gap-2">
            <Book className="text-orange-300" size={28} />
            {editingId ? 'Editar Livro' : 'Criar Novo Livro'}
          </Typography>
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextField
              fullWidth
              label="Título"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{ input: { color: 'white' }, label: { color: 'white' } }}
              className="bg-neutral-700"
            />
            <TextField
              fullWidth
              label="Descrição"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              multiline
              rows={3}
              variant="outlined"
              sx={{ input: { color: 'white' }, label: { color: 'white' } }}
              className="bg-neutral-700"
            />
            <TextField
              fullWidth
              label="Gênero"
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{ input: { color: 'white' }, label: { color: 'white' } }}
              className="bg-neutral-700"
            />
            <FormControlLabel
              control={<Checkbox checked={formData.status} onChange={handleChange} name="status" />}
              label="Disponível"
              sx={{ color: 'white' }}
            />
            <TextField
              fullWidth
              label="Quantidade"
              name="quantidade"
              type="number"
              value={formData.quantidade}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{ input: { color: 'white' }, label: { color: 'white' } }}
              className="bg-neutral-700"
            />
            <div className="flex justify-center gap-5 mt-10">
              <Button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-green-900 text-white rounded-lg font-display text-lg hover:bg-green-900/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                {loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar'}
              </Button>
              {editingId && (
                <Button
                  onClick={handleCancelEdit}
                  className="px-8 py-4 bg-orange-500 text-white rounded-lg font-display text-lg hover:bg-orange-400/70 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Box>

        {/* Lista de Livros */}
        <Box className="bg-neutral-800 p-8 rounded-lg shadow-lg mb-10">
          <Typography variant="h5" className="text-center text-white mb-6 font-serif flex justify-center items-center gap-2">
            <Book className="text-orange-300" size={28} />
            Lista de Livros
          </Typography>
          {!Array.isArray(livros) || livros.length === 0 ? (
            <Typography className="text-center text-neutral-400 text-lg">
              {!Array.isArray(livros) ? 'Erro: Dados inválidos.' : 'Nenhum livro encontrado.'}
            </Typography>
          ) : (
            <List className="space-y-4">
              {livros.map((livro) => (
                <ListItem key={livro.id} className="bg-neutral-700 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300">
                  <ListItemText
                    primary={
                      <Typography variant="h6" className="text-white font-bold">
                        {livro.titulo}
                      </Typography>
                    }
                    secondary={
                      <Typography className="text-neutral-300">
                        {livro.descricao} ({livro.genero})<br />
                        Status: {livro.status ? 'Disponível' : 'Indisponível'} | Quantidade: {livro.quantidade}<br />
                        Criado em: {new Date(livro.createdAt).toLocaleDateString()} | Atualizado em: {new Date(livro.updatedAt).toLocaleDateString()}
                      </Typography>
                    }
                  />
                  <Box className="flex gap-3">
                    <Button
                      onClick={() => handleEdit(livro)}
                      className="px-6 py-2 bg-orange-500 text-white rounded-lg font-display text-sm hover:bg-orange-400/70 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <Edit size={16} />
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDelete(livro.id)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg font-display text-sm hover:bg-red-700/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Deletar
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Mensagem de Feedback */}
        {message && (
          <Alert
            severity={message.includes('sucesso') ? 'success' : 'error'}
            className="mt-4 text-center"
          >
            {message}
          </Alert>
        )}
      </Container>
    </div>
  );
};

export default Livros;
