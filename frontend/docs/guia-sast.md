# Guia SAST e SCA

A aba **SAST** concentra uploads do Semgrep (código) e scanners de composição (SCA). Veja como utilizá-la:

## Upload de relatórios Semgrep

1. Gere um CSV com os resultados do Semgrep (perfil AppSec sugerido).
2. Salve o arquivo em `sast-reports/` ou use o botão de upload na interface.
3. O container `sast-parser` detectará o arquivo e chamará `POST /api/import/sast`.
4. Cada linha gera uma Vulnerabilidade com Findings associados e um registro em `ImportLog`.

## Upload de relatórios SCA

1. Gere um CSV com dependências vulneráveis (Semgrep Supply Chain ou outra ferramenta compatível).
2. Faça upload pela aba **SCA** ou coloque o arquivo em `sast-reports/` com sufixo `-sca.csv`.
3. O parser envia para `POST /api/import/sca`, criando registros de `DependencyFinding`.

## Visualização e filtros

- Utilize filtros por severidade, aplicação e data para priorizar correções.
- Marque achados como falso-positivo diretamente na listagem.
- Compare tendências através dos gráficos de severidade e ecossistema.

## Integração com aplicações

Durante o upload você pode associar achados a uma aplicação existente. Caso nenhuma seja fornecida, os itens ficam na fila de triagem para atribuição manual.

## Alertas e auditoria

- Eventos de importação são registrados no `AuditLog` e exibidos na página **Admin → Logs**.
- Integrações com Telegram/Slack podem ser habilitadas em **Integrações** para alertas automáticos.
