'use client';

import React, { useEffect, useState } from "react";
import api from "../lib/api";
import NavBar from "../components/NavBar/NavBar";

interface Reserva {
  codReserva: number;
  clienteCpf: string;
  livrosId: number;
  clienteId: number;
  bibliotecarioId: number;
}

export default function ReservaCRUD() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [searchId, setSearchId] = useState<number | "">("");
  const [reservaEdit, setReservaEdit] = useState<Reserva | null>(null);
  const [message, setMessage] = useState("");

  // ============================
  // 1) LISTAR TODAS AS RESERVAS
  // ============================
  const getReservas = async () => {
    try {
      const res = await api.get("/reserva/Listar");
      setReservas(res.data);
    } catch {
      setMessage("Erro ao carregar reservas");
    }
  };

  useEffect(() => {
    getReservas();
  }, []);

  // ============================
  // 2) LISTAR POR ID
  // ============================
  const buscarPorId = async () => {
    if (searchId === "") return;
    try {
      const res = await api.get(`/reserva/Listar/${searchId}`);
      setReservaEdit(res.data);
      setMessage("");
    } catch {
      setMessage("Reserva não encontrada!");
      setReservaEdit(null);
    }
  };

  // ============================
  // 3) ATUALIZAR RESERVA
  // ============================
  const atualizarReserva = async () => {
    if (!reservaEdit) return;
    try {
      await api.put(`/reserva/atualizar/${reservaEdit.codReserva}`, reservaEdit);
      setMessage("Reserva atualizada!");
      getReservas();
      setReservaEdit(null);
    } catch {
      setMessage("Erro ao atualizar reserva.");
    }
  };

  // ============================
  // 4) DELETAR RESERVA
  // ============================
  const deletarReserva = async (cod: number) => {
    try {
      await api.delete(`/reserva/deletar/${cod}`);
      setMessage("Reserva deletada!");
      getReservas();
    } catch {
      setMessage("Erro ao deletar.");
    }
  };

  return (
    <div className="bg-white min-h-screen text-gray-900">
      <NavBar />

      <div className="pt-16 px-6 max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">Reservas</h1>

        {/* Buscar reserva por ID */}
        <div className="flex gap-3 mb-6">
          <input
            type="number"
            className="border p-3 rounded-md w-40"
            placeholder="Buscar por ID"
            value={searchId}
            onChange={(e) => setSearchId(Number(e.target.value))}
          />
          <button
            onClick={buscarPorId}
            className="bg-blue-600 text-white px-4 rounded-lg"
          >
            Buscar
          </button>
        </div>

        {message && (
          <p className="text-center text-red-600 font-semibold mb-4">{message}</p>
        )}

        {/* Tabela de Reservas */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="p-3">Cod</th>
              <th className="p-3">CPF</th>
              <th className="p-3">Livro</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Bibliotecário</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>

          <tbody>
            {reservas.map((r) => (
              <tr key={r.codReserva} className="border-b">
                <td className="p-3">{r.codReserva}</td>
                <td className="p-3">{r.clienteCpf}</td>
                <td className="p-3">{r.livrosId}</td>
                <td className="p-3">{r.clienteId}</td>
                <td className="p-3">{r.bibliotecarioId}</td>
                <td className="p-3 flex gap-2 justify-center">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => setReservaEdit(r)}
                  >
                    Editar
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => deletarReserva(r.codReserva)}
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* EDITAR RESERVA */}
        {reservaEdit && (
          <div className="mt-8 border p-6 rounded-xl bg-gray-100">
            <h2 className="text-xl font-bold mb-4">Editar Reserva</h2>

            <div className="grid grid-cols-2 gap-4">

              <input
                type="text"
                className="p-3 border rounded"
                value={reservaEdit.clienteCpf}
                onChange={(e) =>
                  setReservaEdit({ ...reservaEdit, clienteCpf: e.target.value })
                }
              />

              <input
                type="number"
                className="p-3 border rounded"
                value={reservaEdit.livrosId}
                onChange={(e) =>
                  setReservaEdit({ ...reservaEdit, livrosId: Number(e.target.value) })
                }
              />

              <input
                type="number"
                className="p-3 border rounded"
                value={reservaEdit.clienteId}
                onChange={(e) =>
                  setReservaEdit({ ...reservaEdit, clienteId: Number(e.target.value) })
                }
              />

              <input
                type="number"
                className="p-3 border rounded"
                value={reservaEdit.bibliotecarioId}
                onChange={(e) =>
                  setReservaEdit({ ...reservaEdit, bibliotecarioId: Number(e.target.value) })
                }
              />
            </div>

            <button
              className="mt-5 bg-green-600 text-white px-4 py-2 rounded"
              onClick={atualizarReserva}
            >
              Salvar Alterações
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
