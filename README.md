# Lumina

MVP web de gestão escolar com perfis de **coordenação**, **professor** e **aluno**.

## Funcionalidades implementadas

- Autenticação com senha forte e sessão com expiração.
- Bloqueio temporário após múltiplas tentativas inválidas.
- Coordenação:
  - criação de logins de usuários;
  - ativação/desativação de contas;
  - gestão de convites de alunos;
  - auditoria de ações.
- Professor:
  - publicação de vídeos didáticos;
  - criação de provas/atividades;
  - acompanhamento de envios e notas.
- Aluno:
  - cadastro por convite;
  - visualização e marcação de vídeos assistidos;
  - realização de provas;
  - consulta de notas.

## Como executar

Como é uma aplicação estática, abra o arquivo abaixo no navegador:

- `/home/runner/work/lumina/lumina/index.html`

Ou sirva a pasta com qualquer servidor estático local.

## Acesso inicial

- Coordenação:
  - E-mail: `coord@lumina.local`
  - Senha: `Coord#1234`
- Professor demo:
  - E-mail: `prof@lumina.local`
  - Senha: `Prof#1234`

## Observações de segurança

- Senhas são derivadas com PBKDF2 + SHA-256 no navegador.
- Este MVP usa `localStorage/sessionStorage` para simulação local.
- Para produção, use backend com banco de dados seguro, gestão de segredo, criptografia em repouso e autenticação multifator.
