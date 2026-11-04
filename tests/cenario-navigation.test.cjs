const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'js/cenario-home.js'), 'utf8');
const navigation = source.slice(source.indexOf("$('open-search').addEventListener"), source.indexOf("window.addEventListener('popstate'"));

// Exercise the production handlers with a minimal DOM double. Browser layout
// and real focus/scroll behavior still need the separate visual smoke test.
function setup({ reducedMotion = false } = {}) {
  const document = { activeElement: null, handlers: {}, addEventListener(type, handler) { this.handlers[type] = handler; } };
  class Element {
    constructor(id, attrs = {}) { this.id = id; this.attrs = attrs; this.dataset = {}; this.hidden = false; this.handlers = {}; this.children = []; this.value = ''; }
    addEventListener(type, handler) { this.handlers[type] = handler; }
    setAttribute(key, value) { this.attrs[key] = value; }
    getAttribute(key) { return this.attrs[key] ?? null; }
    contains(element) { return this === element || this.children.includes(element); }
    focus(options) { document.activeElement = this; this.focusOptions = options; }
    scrollIntoView(options) { this.scrollOptions = options; }
    click(overrides = {}) {
      const event = { button: 0, prevented: false, preventDefault() { this.prevented = true; }, ...overrides };
      this.handlers.click(event); return event;
    }
  }
  const elements = Object.fromEntries(['open-search', 'nome', 'estado', 'estilo', 'busca', 'djs', 'catalog-grid', 'sobre', 'encomende', 'mobile-nav', 'menu-btn', 'results', 'clear-filters', 'result-count', 'empty-clear'].map(id => [id, new Element(id)]));
  elements['mobile-nav'].hidden = true;
  const specs = [['style', '#busca', 'estilo'], ['state', '#busca', 'estado'], ['skip', '#busca', 'nome'], ['catalog', '#djs'], ['about', '#sobre'], ['commission', '#encomende']];
  const links = Object.fromEntries(specs.map(([key, href, focus]) => {
    const link = new Element(key, { href }); if (focus) link.dataset.focus = focus; return [key, link];
  }));
  elements['mobile-nav'].children = Object.values(links);
  document.querySelectorAll = () => Object.values(links);
  const location = { pathname: '/cenario-dj/', search: '?nome=Flavinnho', hash: '' };
  const history = { entries: [], pushState(_state, _title, url) { this.entries.push(url); location.hash = new URL(url, 'https://example.com').hash; } };
  const media = {};
  const matchMedia = query => media[query] ||= { matches: query.includes('reduced-motion') ? reducedMotion : true, addEventListener(type, handler) { this[type] = handler; } };
  const scope = { document, location, history, matchMedia, $: id => elements[id], name: elements.nome, form: elements.busca, render() { elements.busca.renderCount = (elements.busca.renderCount || 0) + 1; } };
  vm.runInNewContext(navigation, scope);
  vm.runInNewContext(source.slice(source.indexOf("form.addEventListener('submit'"), source.indexOf("$('clear-filters').addEventListener")), scope);
  return { document, elements, links, location, history, media };
}

test('Atalhos de estilo e estado mantêm o foco após navegar', () => {
  const ui = setup();
  for (const [key, target] of [['style', 'estilo'], ['state', 'estado']]) {
    ui.elements['menu-btn'].click();
    assert.ok(ui.links[key].click().prevented);
    assert.equal(ui.document.activeElement.id, target);
    assert.equal(ui.elements['mobile-nav'].hidden, true);
    assert.equal(ui.elements['menu-btn'].attrs['aria-expanded'], 'false');
    assert.equal(ui.elements.busca.scrollOptions.block, 'start');
  }
  assert.deepEqual(ui.history.entries, ['/cenario-dj/?nome=Flavinnho#busca']);
});

test('Pular para busca leva ao nome sem apagar os filtros', () => {
  const ui = setup(); ui.elements.nome.value = 'Flavinnho';
  ui.links.skip.click();
  assert.equal(ui.document.activeElement.id, 'nome');
  assert.equal(ui.elements.nome.value, 'Flavinnho');
  assert.equal(ui.location.search, '?nome=Flavinnho');
});

test('Sobre, catálogo e Para DJs levam foco às seções corretas', () => {
  const ui = setup();
  for (const [key, target] of [['about', 'sobre'], ['catalog', 'djs'], ['commission', 'encomende']]) {
    ui.links[key].click();
    assert.equal(ui.document.activeElement.id, target);
    assert.equal(ui.location.hash, '#' + target);
    assert.equal(ui.elements[target].scrollOptions.block, 'start');
  }
});

test('Repetir a mesma âncora refaz o foco sem duplicar histórico', () => {
  const ui = setup(); ui.links.commission.click(); ui.elements.nome.focus(); ui.links.commission.click();
  assert.equal(ui.document.activeElement.id, 'encomende');
  assert.equal(ui.history.entries.length, 1);
});

test('Atalhos preservam cliques modificados e botão secundário', () => {
  for (const override of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) {
    const ui = setup(); assert.equal(ui.links.style.click(override).prevented, false);
    assert.equal(ui.history.entries.length, 0); assert.equal(ui.document.activeElement, null);
  }
});

test('Escape devolve o foco ao botão ao fechar o menu', () => {
  const ui = setup(); ui.elements['menu-btn'].click(); ui.links.about.focus();
  ui.document.handlers.keydown({ key: 'Escape' });
  assert.equal(ui.document.activeElement.id, 'menu-btn');
  assert.equal(ui.elements['mobile-nav'].hidden, true);
  assert.equal(ui.elements['menu-btn'].attrs['aria-expanded'], 'false');
  assert.equal(ui.elements['menu-btn'].attrs['aria-label'], 'Abrir menu');
});

test('Escape não rouba foco fora do menu ou quando já fechado', () => {
  const ui = setup(); ui.elements.nome.focus();
  ui.document.handlers.keydown({ key: 'Escape' }); assert.equal(ui.document.activeElement.id, 'nome');
  ui.elements['menu-btn'].click(); ui.elements.nome.focus();
  ui.document.handlers.keydown({ key: 'Escape' }); assert.equal(ui.document.activeElement.id, 'nome');
  assert.equal(ui.elements['mobile-nav'].hidden, true);
});

test('Lupa fecha o menu e foca o nome sem alterar seu valor', () => {
  const ui = setup(); ui.elements.nome.value = 'Flavinnho'; ui.elements['menu-btn'].click();
  ui.elements['open-search'].click();
  assert.equal(ui.document.activeElement.id, 'nome'); assert.equal(ui.elements.nome.value, 'Flavinnho');
  assert.equal(ui.elements['mobile-nav'].hidden, true); assert.equal(ui.elements.nome.scrollOptions.block, 'center');
});

test('Menu abre e fecha repetidamente mantendo nome e estado acessíveis', () => {
  const ui = setup();
  for (let i = 0; i < 3; i++) {
    ui.elements['menu-btn'].click(); assert.equal(ui.elements['mobile-nav'].hidden, false);
    assert.equal(ui.elements['menu-btn'].attrs['aria-label'], 'Fechar menu');
    assert.equal(ui.elements['menu-btn'].attrs['aria-expanded'], 'true');
    ui.elements['menu-btn'].click(); assert.equal(ui.elements['mobile-nav'].hidden, true);
    assert.equal(ui.elements['menu-btn'].attrs['aria-label'], 'Abrir menu');
  }
});

test('Preferência de movimento reduzido vale para atalhos e lupa', () => {
  for (const reducedMotion of [false, true]) {
    const ui = setup({ reducedMotion }); ui.links.style.click(); ui.elements['open-search'].click();
    const expected = reducedMotion ? 'auto' : 'smooth';
    assert.equal(ui.elements.busca.scrollOptions.behavior, expected);
    assert.equal(ui.elements.nome.scrollOptions.behavior, expected);
  }
});

test('Sair da largura mobile fecha o menu aberto', () => {
  const ui = setup(); ui.elements['menu-btn'].click();
  ui.media['(max-width: 600px)'].change({ matches: false });
  assert.equal(ui.elements['mobile-nav'].hidden, true);
  assert.equal(ui.elements['menu-btn'].attrs['aria-expanded'], 'false');
});

test('Markup oferece Para DJs nas duas navegações e destinos focáveis', () => {
  assert.equal([...html.matchAll(/href="#encomende">Para DJs<\/a>/g)].length, 2);
  for (const id of ['djs', 'sobre', 'encomende']) assert.match(html, new RegExp('<section[^>]+id="' + id + '"[^>]+tabindex="-1"'));
  const css = fs.readFileSync(path.join(root, 'css/visual-refinement.css'), 'utf8');
  assert.match(css, /\.icon-btn, \.menu-btn\s*\{[^}]*min-width:\s*44px;[^}]*min-height:\s*44px;[^}]*flex-shrink:\s*0/);
});

test('Título e contagem antecedem os filtros, que antecedem os cards', () => {
  const ids = ['destaque', 'djs', 'more-title', 'result-count', 'busca', 'catalog-grid'];
  for (let i = 1; i < ids.length; i++) assert.ok(html.indexOf('id="' + ids[i - 1] + '"') < html.indexOf('id="' + ids[i] + '"'));
  for (const id of ids) assert.equal([...html.matchAll(new RegExp('id="' + id + '"', 'g'))].length, 1);
  assert.match(html, /id="result-count" role="status" aria-live="polite"/);
  assert.match(html, /id="catalog-grid" role="region" aria-label="Resultados da busca" tabindex="-1"/);
});

test('Buscar DJs e Enter focam os resultados abaixo dos filtros', () => {
  for (const reducedMotion of [false, true]) {
    const ui = setup({ reducedMotion }); let prevented = false;
    ui.elements.busca.handlers.submit({ preventDefault() { prevented = true; } });
    assert.ok(prevented); assert.equal(ui.elements.busca.renderCount, 1);
    assert.equal(ui.document.activeElement.id, 'catalog-grid');
    assert.equal(ui.elements['catalog-grid'].scrollOptions.block, 'start');
    assert.equal(ui.elements['catalog-grid'].scrollOptions.behavior, reducedMotion ? 'auto' : 'smooth');
    assert.equal(ui.elements.djs.scrollOptions, undefined);
  }
});

test('Contagem acima dos filtros continua dinâmica e acessível', () => {
  const ui = setup(); require('../js/cenario-data.js');
  const catalog = require('../js/cenario-catalog.js'); let filters = {};
  const scope = { data: global.CenarioData, catalog, filters: () => filters, results: ui.elements.results, $: id => ui.elements[id], card: artist => artist.id, icon: () => '', reset() {} };
  vm.runInNewContext(source.slice(source.indexOf('function render('), source.indexOf('function reset(')), scope);
  scope.render(false); assert.equal(ui.elements['result-count'].textContent, '1 DJ no catálogo');
  filters = { state: 'RJ' }; scope.render(false);
  assert.equal(ui.elements['result-count'].textContent, '0 perfis encontrados');
  assert.equal(ui.elements['clear-filters'].hidden, false);
  assert.match(ui.elements['catalog-grid'].innerHTML, /A busca continua/);
  filters = { state: 'SP' }; scope.render(false);
  assert.equal(ui.elements['result-count'].textContent, '1 perfil encontrado');
  assert.equal(ui.elements['catalog-grid'].innerHTML, 'flavinnho');
  filters = {}; scope.render(false); assert.equal(ui.elements['result-count'].textContent, '1 DJ no catálogo');
  assert.equal(ui.elements['clear-filters'].hidden, true);
});

test('Limpar resultado vazio mantém um destino de foco após recriar cards', () => {
  const ui = setup(); const actions = [];
  ui.elements['catalog-grid'].children = [ui.elements['empty-clear']]; ui.elements['empty-clear'].focus();
  const scope = { document: ui.document, $: id => ui.elements[id], form: { reset() { actions.push('reset'); } }, updateRegions() { actions.push('regions'); }, render() { actions.push('render'); ui.document.activeElement = null; } };
  vm.runInNewContext(source.slice(source.indexOf('function reset('), source.indexOf('function restore(')), scope);
  scope.reset(); assert.deepEqual(actions, ['reset', 'regions', 'render']);
  assert.equal(ui.document.activeElement.id, 'catalog-grid');
});
