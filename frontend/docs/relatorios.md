# Relatórios OWASP/MSTG

O módulo de relatórios transforma achados em entregáveis profissionais com base nos templates OWASP e MSTG.

## Templates disponíveis

- **OWASP Top 10**: Sumário executivo, matriz de risco e plano de ação.
- **MSTG Mobile**: Checklist técnico por plataforma e recomendações de remediação.
- **Custom AppSec**: Estrutura flexível para relatórios internos.

Todos os templates podem ser editados em **Relatórios → Templates** e clonados para projetos específicos.

## Geração de relatórios

1. Acesse a aba **Relatórios** ou **Editor de Relatórios (Word)**.
2. Escolha um template, personalize se necessário e selecione as vulnerabilidades que deseja incluir.
3. Exporte em PDF, DOCX ou HTML.

## Automação

- Agende exportações periódicas utilizando o `AuditLog` para registrar cada ação.
- Utilize o editor de planilhas para compilar métricas adicionais antes de anexar aos relatórios.
- Exporte dados brutos em CSV para integração com GRC ou SIEM.

## Boas práticas

- Utilize tags dinâmicas nos templates para preencher dados de aplicação automaticamente.
- Revise campos de severidade e SLA após novas importações SAST/SCA.
- Registre revisões de pares diretamente no `AuditLog` para rastreabilidade completa.
