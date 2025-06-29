# MCP - Model Context Protocol TypeScript SDK

Uma biblioteca que encapsula todo o comportamento do Model Context Protocol SDK em TypeScript, fornecendo uma interface simplificada e robusta para integração com o protocolo MCP.

## Pré-requisitos

- Node.js 18.0 ou superior
- NPM (Node Package Manager)
- TypeScript 5.8.3 ou superior

## Instalação

Para instalar a biblioteca, execute:

```bash
npm install @codeplaydata/mcp
```

## Detalhes Técnicos
Essa lib é uma wraper da SDK do Typescript para o Model Context Protocol, com ela é possível, criar um servidor
com pela Factory adicionando tools, resources e prompts. Também é possível adicionar tools que tenham acesso ao 
servidor para modificar o seu estado. No geral, não existe necessidade de trabalhar com o protocolo diretamente.

No arquivo `main.ts` existe um modo de uso, nela é possível notar que caso utilize `express` é possível extender
o tipo da *Resquest* e *Response* do Controller.

Por enquanto, a implementação do transporte é a recomendada pela última **release** o `StreamableHttpTransport`.
A autenticação ficar por conta do servidor Http de escolha do usuário.

*Por enquanto, o servidor não implementa o COMPLETION*.

Scripts disponíveis:
- `npm run build` - Compila o projeto TypeScript
- `npm run dev` - Executa o projeto em modo de desenvolvimento
- `npm run inspect` - Executa o inspetor MCP
- `npm run publish` - Publica o pacote no NPM

## Dependências 
A biblioteca utiliza uma única dependências:

- **@modelcontextprotocol/sdk**: ^1.12.1 - SDK base do Model Context Protocol


## Licença

```
The MCP TypeScript wrapper.
Copyright (C) 2025 Pedro Paulo Teixeira dos Santos

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
```
