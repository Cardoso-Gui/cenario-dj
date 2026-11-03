# Flavinnho DJ

Site estático em HTML, CSS e JavaScript, sem framework ou etapa de compilação.
São seis páginas independentes; o menu marca a página atual com `aria-current="page"`.

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
| `index.html` | Página inicial, apresentação e chamadas para as páginas internas |
| `sobre.html` | Biografia, conteúdo original da história e alternativa em `<details>` |
| `eventos.html` | Agenda pública; atualmente informa que novas datas serão anunciadas |
| `mixes.html` | Links para Spotify e YouTube |
| `fotos.html` | Fotos do carrossel e vídeos de aftermovies |
| `contato.html` | WhatsApp e telefone |
| `css/styles.css` | Estilos base, elementos compartilhados e responsividade |
| `css/theme.css` | Identidade visual compartilhada e ajustes das páginas internas |
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

O cabeçalho e o rodapé estão repetidos nas seis páginas para manter a estrutura
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
- **Agenda:** publique apenas datas públicas confirmadas. A versão atual não
  apresenta eventos fictícios.

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
- As fontes Inter, Barlow Condensed e Permanent Marker são carregadas do Google
  Fonts, com fontes alternativas declaradas no CSS.

## Conferir antes de publicar

Compare as seis páginas em desktop e celular, incluindo cabeçalho, rodapé,
textos, imagens e navegação. Confira também abertura/fechamento da história,
carrossel e visualizador de fotos, teclado, preferência por movimento reduzido
e reprodução dos vídeos. Inclua telas de 320, 375, 390, 650, 651, 768 e 1440 pixels,
celular na horizontal e zoom de 200%. Confira se os botões continuam legíveis,
sem corte, e se todos os destinos do menu permanecem acessíveis.

Os testes estáticos usam apenas a biblioteca padrão do Python:

```sh
python3 -m unittest discover -s tests -v
```

Eles verificam a prioridade do botão de contratação, metadados da Home, caminhos
locais, destinos das âncoras, página ativa no menu, ordem dos estilos e links que
abrem em outra aba. Não substituem a revisão visual em navegador nem verificam
o funcionamento de serviços externos.

## Compartilhamento da Home

`index.html` define URL canônica, Open Graph e Twitter Card com a URL oficial do
GitHub Pages. A prévia usa a foto original `assets/flavinnho-live.jpg`, sem modificar
o arquivo. As dimensões declaradas são 1152 × 1536 pixels. O Twitter Card usa
`summary` para evitar o recorte panorâmico de uma foto vertical.

Após uma publicação autorizada, confira o link no WhatsApp e nas redes desejadas.
Os aplicativos controlam o recorte e podem manter a prévia antiga em cache;
a presença dos metadados não garante uma atualização imediata da prévia.

## Publicação

O GitHub Pages publica a raiz da branch `main`:
https://cardoso-gui.github.io/flavinnho-site/

O arquivo `.nojekyll` mantém a publicação dos arquivos estáticos sem processamento
pelo Jekyll. Após publicar, confira a execução de deploy e o site resultante.
