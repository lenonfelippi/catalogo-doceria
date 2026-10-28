// Lógica do catálogo: listagem, filtros, carrinho e envio pelo WhatsApp.

const moeda = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const $ = (id) => document.getElementById(id);

let categoriaAtual = "Todos";
let carrinho = carregarCarrinho(); // { idProduto: quantidade }

// ---------- Dados da loja ----------
function preencherLoja() {
  document.title = `${LOJA.nome} | Catálogo`;
  $("loja-nome").textContent = LOJA.nome;
  $("loja-slogan").textContent = LOJA.slogan;
  $("loja-endereco").textContent = LOJA.endereco;
  $("loja-horario").textContent = LOJA.horario;
  $("taxa").textContent = moeda(LOJA.taxaEntrega);
}

// ---------- Catálogo ----------
function montarCategorias() {
  const categorias = ["Todos", ...new Set(PRODUTOS.map((p) => p.categoria))];
  $("categorias").innerHTML = categorias
    .map((c) => `<button data-cat="${c}" class="${c === categoriaAtual ? "ativa" : ""}">${c}</button>`)
    .join("");
}

function imagemProduto(p) {
  return p.imagem ? `<img src="${p.imagem}" alt="${p.nome}">` : p.emoji;
}

function listarProdutos() {
  const termo = $("busca").value.trim().toLowerCase();
  const filtrados = PRODUTOS.filter(
    (p) =>
      (categoriaAtual === "Todos" || p.categoria === categoriaAtual) &&
      (p.nome.toLowerCase().includes(termo) || p.descricao.toLowerCase().includes(termo))
  );

  $("produtos").innerHTML = filtrados
    .map(
      (p) => `
      <article class="produto">
        <div class="produto-img">${imagemProduto(p)}</div>
        <div class="produto-corpo">
          <span class="produto-cat">${p.categoria}</span>
          <h3>${p.nome}</h3>
          <p class="produto-desc">${p.descricao}</p>
          <div class="produto-rodape">
            <span class="preco">${moeda(p.preco)}</span>
            <button class="btn-add" data-id="${p.id}">+ Adicionar</button>
          </div>
        </div>
      </article>`
    )
    .join("");

  $("sem-resultado").hidden = filtrados.length > 0;
}

// ---------- Carrinho ----------
function carregarCarrinho() {
  try {
    return JSON.parse(localStorage.getItem("carrinho")) || {};
  } catch {
    return {};
  }
}

function salvarCarrinho() {
  try {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
  } catch {
    // navegador sem armazenamento: o carrinho só dura enquanto a página estiver aberta
  }
}

function alterarQuantidade(id, delta) {
  carrinho[id] = (carrinho[id] || 0) + delta;
  if (carrinho[id] <= 0) delete carrinho[id];
  salvarCarrinho();
  atualizarCarrinho();
}

function itensDoCarrinho() {
  return Object.entries(carrinho).map(([id, qtd]) => ({
    produto: PRODUTOS.find((p) => p.id === Number(id)),
    qtd,
  })).filter((i) => i.produto);
}

function tipoEntrega() {
  return document.querySelector('input[name="entrega"]:checked').value;
}

function calcularTotal() {
  const subtotal = itensDoCarrinho().reduce((s, i) => s + i.produto.preco * i.qtd, 0);
  const taxa = tipoEntrega() === "entrega" && subtotal > 0 ? LOJA.taxaEntrega : 0;
  return { subtotal, taxa, total: subtotal + taxa };
}

function atualizarCarrinho() {
  const itens = itensDoCarrinho();
  $("contador").textContent = itens.reduce((s, i) => s + i.qtd, 0);

  $("itens").innerHTML = itens
    .map(
      ({ produto: p, qtd }) => `
      <li class="item">
        <span class="item-emoji">${p.emoji}</span>
        <div class="item-info">
          <strong>${p.nome}</strong><br>
          <small>${moeda(p.preco)} cada · ${moeda(p.preco * qtd)}</small>
        </div>
        <div class="qtd">
          <button data-menos="${p.id}" aria-label="Diminuir">−</button>
          <span>${qtd}</span>
          <button data-mais="${p.id}" aria-label="Aumentar">+</button>
        </div>
      </li>`
    )
    .join("");

  const vazio = itens.length === 0;
  $("carrinho-vazio").hidden = !vazio;
  $("checkout").hidden = vazio;
  $("total").textContent = moeda(calcularTotal().total);
}

function abrirCarrinho(abrir) {
  $("carrinho").classList.toggle("aberto", abrir);
  $("carrinho").setAttribute("aria-hidden", String(!abrir));
  $("fundo").hidden = !abrir;
}

function mostrarAviso(texto) {
  const aviso = $("aviso");
  aviso.textContent = texto;
  aviso.hidden = false;
  clearTimeout(mostrarAviso.timer);
  mostrarAviso.timer = setTimeout(() => (aviso.hidden = true), 1800);
}

// ---------- Envio pelo WhatsApp ----------
function montarMensagem() {
  const { subtotal, taxa, total } = calcularTotal();
  const entrega = tipoEntrega() === "entrega";
  const linhas = [
    `*Novo pedido - ${LOJA.nome}*`,
    "",
    `*Cliente:* ${$("cliente").value.trim()}`,
    "",
    "*Itens:*",
    ...itensDoCarrinho().map(({ produto: p, qtd }) => `• ${qtd}x ${p.nome} - ${moeda(p.preco * qtd)}`),
    "",
    `Subtotal: ${moeda(subtotal)}`,
  ];
  if (entrega) linhas.push(`Taxa de entrega: ${moeda(taxa)}`);
  linhas.push(`*Total: ${moeda(total)}*`, "");
  linhas.push(`*Recebimento:* ${entrega ? "Entrega" : "Retirada na loja"}`);
  if (entrega) linhas.push(`*Endereço:* ${$("endereco").value.trim()}`);
  linhas.push(`*Pagamento:* ${$("pagamento").value}`);
  const obs = $("obs").value.trim();
  if (obs) linhas.push(`*Observações:* ${obs}`);
  return linhas.join("\n");
}

function enviarPedido(evento) {
  evento.preventDefault();
  if (tipoEntrega() === "entrega" && !$("endereco").value.trim()) {
    mostrarAviso("Informe o endereço de entrega");
    $("endereco").focus();
    return;
  }
  const url = `https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent(montarMensagem())}`;
  window.open(url, "_blank");
}

// ---------- Eventos ----------
function registrarEventos() {
  $("busca").addEventListener("input", listarProdutos);

  $("categorias").addEventListener("click", (e) => {
    if (!e.target.dataset.cat) return;
    categoriaAtual = e.target.dataset.cat;
    montarCategorias();
    listarProdutos();
  });

  $("produtos").addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    if (!id) return;
    alterarQuantidade(id, 1);
    mostrarAviso("Adicionado ao carrinho");
  });

  $("itens").addEventListener("click", (e) => {
    if (e.target.dataset.mais) alterarQuantidade(e.target.dataset.mais, 1);
    if (e.target.dataset.menos) alterarQuantidade(e.target.dataset.menos, -1);
  });

  $("abrir-carrinho").addEventListener("click", () => abrirCarrinho(true));
  $("fechar-carrinho").addEventListener("click", () => abrirCarrinho(false));
  $("fundo").addEventListener("click", () => abrirCarrinho(false));

  document.querySelectorAll('input[name="entrega"]').forEach((r) =>
    r.addEventListener("change", () => {
      $("campo-endereco").hidden = tipoEntrega() !== "entrega";
      atualizarCarrinho();
    })
  );

  $("checkout").addEventListener("submit", enviarPedido);
}

preencherLoja();
montarCategorias();
listarProdutos();
atualizarCarrinho();
registrarEventos();
