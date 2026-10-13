import Database from "better-sqlite3";
import path from "node:path";

const g = globalThis as unknown as { _db?: Database.Database };

function init() {
  const db = new Database(path.join(process.cwd(), "atx.db"));
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      razao_social TEXT NOT NULL,
      nome_fantasia TEXT,
      cnpj TEXT NOT NULL UNIQUE,
      regime TEXT NOT NULL DEFAULT 'simples',   -- simples | presumido | real
      atividade TEXT NOT NULL DEFAULT 'comercio', -- comercio | servico | industria
      email TEXT, telefone TEXT,
      honorario REAL DEFAULT 0,
      vencimento_dia INTEGER DEFAULT 10,
      servicos TEXT DEFAULT 'fiscal,contabil',   -- fiscal,contabil,dp
      observacoes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS notas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      chave TEXT NOT NULL UNIQUE,
      numero TEXT, serie TEXT, emissao TEXT,
      direcao TEXT NOT NULL,        -- entrada | saida
      emitente_cnpj TEXT, emitente_nome TEXT,
      dest_cnpj TEXT, dest_nome TEXT,
      v_nf REAL, v_icms REAL, v_pis REAL, v_cofins REAL, v_ipi REAL, v_st REAL
    );
    CREATE TABLE IF NOT EXISTS nota_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nota_id INTEGER NOT NULL REFERENCES notas(id) ON DELETE CASCADE,
      descricao TEXT, ncm TEXT, cfop TEXT,
      v_prod REAL, v_icms REAL, v_pis REAL, v_cofins REAL, v_ipi REAL
    );
    CREATE TABLE IF NOT EXISTS contas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      codigo TEXT NOT NULL, nome TEXT NOT NULL,
      natureza TEXT NOT NULL,            -- D | C (saldo normal)
      analitica INTEGER NOT NULL DEFAULT 1,
      UNIQUE(client_id, codigo)
    );
    CREATE TABLE IF NOT EXISTS lancamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      data TEXT NOT NULL, historico TEXT NOT NULL,
      nota_id INTEGER UNIQUE REFERENCES notas(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS lancamento_linhas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lancamento_id INTEGER NOT NULL REFERENCES lancamentos(id) ON DELETE CASCADE,
      conta_id INTEGER NOT NULL REFERENCES contas(id),
      debito REAL NOT NULL DEFAULT 0, credito REAL NOT NULL DEFAULT 0
    );
  `);
  try { db.exec("ALTER TABLE lancamentos ADD COLUMN nota_id INTEGER"); } catch { /* coluna já existe */ }
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS ux_lanc_nota ON lancamentos(nota_id)");
  db.pragma("foreign_keys = ON");
  return db;
}

export const db = g._db ?? (g._db = init());
