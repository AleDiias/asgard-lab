# Rules do projeto Asgard CRM

As regras do Cursor são carregadas a partir dos diretórios **backend** e **frontend** desta pasta.

- **backend**: aponta para `backend/.cursor/rules/backend/` — regras de arquitetura, API, banco, auth, etc.
- **frontend**: aponta para `frontend/.cursor/rules/frontend/` — regras de componentes, estado, roteamento, etc.

O Cursor descobre automaticamente todos os `.mdc` em `.cursor/rules/` (incluindo subpastas). Os globs em cada rule garantem que:
- regras em `backend/` se apliquem ao editar arquivos em `backend/**`
- regras em `frontend/` se apliquem ao editar arquivos em `frontend/**`

**Importante**: Abra o workspace pela **raiz do repositório** (asgard_crm) para que ambas as pastas de rules sejam consideradas.
