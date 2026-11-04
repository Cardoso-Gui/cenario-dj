# Flavinnho DJ

Site estático em HTML, CSS e JavaScript, sem framework ou etapa de compilação.
O site individual tem cinco páginas independentes; o menu marca a página atual com `aria-current="page"`.

## Executar localmente

Na raiz do projeto, inicie um servidor estático, por exemplo:

```sh
python3 -m http.server 8000
```

Abra `http://localhost:8000`. Também é possível abrir `index.html` diretamente,
mas o servidor local é preferível para conferir navegação e carregamento de recursos.

## Onde editar

| Arquivo ou pasta | Responsabilidade |
| --- | --- |
| `index.html` | Home do Cenário DJ e catálogo de artistas |
| `flavinnho.html` | Página inicial do Flavinnho, apresentação e chamadas para as páginas internas |
| `sobre.html` | Biografia, conteúdo original da história e alternativa em `<details>` |
| `mixes.html` | Links para Spotify e YouTube |
| `fotos.html` | Fotos do carrossel e vídeos de aftermovies |
| `contato.html` | WhatsApp e telefone |
| `css/styles.css` | Estilos base, elementos compartilhados e responsividade |
| `css/theme.css` | Identidade visual compartilhada e ajustes das páginas internas |
| `css/surfaces.css` | Fundos roxos discretos das páginas, cabeçalho e rodapé |
| `css/readability.css` | Tamanhos de leitura no desktop, carregados após os estilos específicos |
| `css/home.css` | Estilos exclusivos da página inicial |
| `css/gallery.css` | Carrossel, visualizador de fotos e aftermovies |
| `css/story-modal.css` | Botão e diálogo da história |
| `css/contact.css` | Bloco de ligação telefônica da página de contato |
| `js/site.js` | Atualização do ano no rodapé |
| `js/photo-gallery.js` | Carrossel, reprodução automática, arraste e visualizador de fotos |
| `js/story-modal.js` | Aprimora a história expansível com um diálogo, quando suportado |
| `js/video-gallery.js` | Pausa os outros vídeos quando um aftermovie começa a tocar |
| `assets/` | Logo, ícone e imagens das páginas |
| `assets/galeria/` | Imagens originais e versões utilizadas pela galeria |
| `assets/videos/` | Vídeos MP4 e imagens de capa |

Os arquivos de estilo são carregados nesta ordem: base (`styles.css`), tema
(`theme.css`) e estilo específico da página. Essa ordem faz parte da cascata;
não a altere sem comparar o resultado visual. `--accent` representa a cor de
destaque usada nos elementos visuais do site.

O cabeçalho e o rodapé estão repetidos nas cinco páginas do Flavinnho para manter a estrutura
estática simples. Ao atualizar menus, logo ou redes sociais, confira todas as
páginas. Preserve `aria-current="page"` somente no link da página correspondente.

## Atualizar fotos e vídeos

- **Foto:** adicione a imagem em `assets/galeria/` e um cartão `.photo-card` em
  `fotos.html`, mantendo o padrão existente. Confira `href`, `src`, dimensões,
  texto alternativo, rótulo acessível e posição de enquadramento. Atualize também
  o total inicial exibido em `.gallery-counter`; o JavaScript recalcula esse total.
- **Vídeo:** adicione o MP4 e a capa em `assets/videos/` e um `.aftermovie-card`
  em `fotos.html`. Ajuste título, `poster`, `<source>`, link de abertura e rótulos.
  A classe `.aftermovie-video--landscape` identifica o formato horizontal no celular.

## Conteúdo e origem dos recursos

- A logo oficial em `assets/flavinnho-logo.svg` foi extraída dos traçados vetoriais
  do PDF `LOGO-FLAVINNHO.pdf` fornecido pelo usuário. Tem fundo transparente e
  preenchimento branco.
- A página de contato já contém WhatsApp e telefone; os links oficiais de
  Instagram, YouTube e Spotify estão no rodapé e nas chamadas correspondentes.
- As imagens da Home (`home-dj.jpg`, `home-retrato.jpg` e `home-publico.jpg`) são
  reconstruções feitas com ImageGen a partir do mockup fornecido, não fotografias
  documentais do artista. As versões da galeria com sufixo `-ia` também devem ser
  distinguidas dos arquivos originais ao escolher imagens.
- `assets/sobre-atmosfera.jpg` foi gerado a partir da referência visual violeta,
  preservando composição, iluminação e fumaça e retirando a interface e os textos.
- `assets/stage/header-lights.webp` e `assets/stage/footer-controller.webp` são
  ilustrações decorativas geradas a partir do conceito aprovado de iluminação
  e controladora. Somam aproximadamente 119 KB. Não representam equipamentos
  confirmados do artista. `css/stage-effects.css` aplica as faixas somente às
  cinco páginas do Flavinnho; os textos e links continuam em HTML, separados das
  imagens, e as luzes não piscam nem se movem.
- As fontes Inter, Barlow Condensed e Permanent Marker são carregadas do Google
  Fonts, com fontes alternativas declaradas no CSS.

## Conferir antes de publicar

Compare as cinco páginas do Flavinnho em desktop e celular, incluindo cabeçalho, rodapé,
textos, imagens e navegação. Confira também abertura/fechamento da história,
carrossel e visualizador de fotos, teclado, preferência por movimento reduzido
e reprodução dos vídeos. Execute também `node --test tests/*.test.cjs` para conferir
as regressões do catálogo e da navegação.

## Publicação

O GitHub Pages publica a raiz da branch `main`:
https://cardoso-gui.github.io/cenario-dj/

O arquivo `.nojekyll` mantém a publicação dos arquivos estáticos sem processamento
pelo Jekyll. Após publicar, confira a execução de deploy e o site resultante.


## Home Cenário DJ

A home `index.html` usa a identidade verde do Cenário, com o Flavinnho fixo em destaque e uma grade filtrável por estado, região metropolitana e estilo. As páginas individuais do Flavinnho e seus recursos continuam independentes.

- `css/cenario-home.css`: layout responsivo da home.
- `js/cenario-data.js`: artistas reais e base de regiões metropolitanas IBGE 2025, corrigida em 29/07/2026.
- `js/cenario-catalog.js`: lógica pura dos filtros e destaque.
- `js/cenario-home.js`: interface, busca por nome, opções dependentes e menu móvel.
- `assets/cenario-mark.svg`: marca pin/disco do Cenário DJ.
- `tests/cenario-catalog.test.cjs`: testes, executáveis com `node --test tests/cenario-catalog.test.cjs`.

A versão pública contém apenas artistas reais. Os perfis fictícios da prévia não fazem parte deste catálogo. A foto do Flavinnho usa `assets/galeria/na-controladora.webp`; o fundo usa o recurso ilustrativo já existente `assets/home-publico.jpg`.

A seção `#encomende`, após o Sobre, recebe pedidos de site ou press kit pelo WhatsApp do Gui. Ela abre uma mensagem genérica, que só é enviada pelo visitante. O canal comercial do Cenário é separado do contato de contratação do Flavinnho.

A home inclui Open Graph e Twitter Card com URL canônica pública. A arte aprovada fica em `assets/cenario-social.png` (1734 × 907), sem alterações na composição. Aplicativos de mensagens podem manter a miniatura anterior em cache.

