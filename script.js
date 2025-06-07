const carrosselWrapper = document.querySelector(".carrossel-wrapper");
const carrosselContainer = document.querySelector(".carrossel-container");
const botaoAnterior = document.querySelector(".carrossel-anterior");
const botaoProximo = document.querySelector(".carrossel-proximo");
const paginacaoContainer = document.querySelector(".carrossel-paginacao");
const indicadoresContainer = document.querySelector(".carrossel-indicadores");

let produtoLargura = 250; // largura padrão no desktop
let posicaoAtual = 0;
const totalIndicadores = 5;

// Atualiza largura do produto para mobile
function atualizarProdutoLargura() {
  if (window.innerWidth <= 768) {
    const produto = carrosselWrapper.querySelector(".produto");
    if (produto) produtoLargura = produto.offsetWidth;
  } else {
    produtoLargura = 250;
  }
}

// Atualiza carrossel para desktop
function atualizarCarrossel() {
  if (window.innerWidth > 768) {
    const maxPosicao =
      carrosselWrapper.scrollWidth - carrosselWrapper.clientWidth;
    posicaoAtual = Math.min(Math.max(posicaoAtual, 0), maxPosicao);
    carrosselWrapper.style.transform = `translateX(${-posicaoAtual}px)`;
  } else {
    carrosselWrapper.style.transform = "none";
    posicaoAtual = 0;
  }
}

// Centraliza o produto atual no mobile
function centralizarProduto() {
  if (window.innerWidth <= 768) {
    const scrollEsquerda = carrosselWrapper.scrollLeft;
    const index = Math.round(scrollEsquerda / (produtoLargura + 10));
    const novoScroll =
      index * (produtoLargura + 10) -
      (carrosselContainer.offsetWidth - produtoLargura) / 2;

    carrosselWrapper.scrollTo({
      left: novoScroll,
      behavior: "smooth",
    });
  }
}

// Botões de navegação (desktop)
botaoAnterior.addEventListener("click", () => {
  atualizarProdutoLargura();
  posicaoAtual -= produtoLargura + 20;
  atualizarCarrossel();
});

botaoProximo.addEventListener("click", () => {
  atualizarProdutoLargura();
  posicaoAtual += produtoLargura + 20;
  atualizarCarrossel();
});

// Paginação dinâmica para mobile
function atualizarPaginacao() {
  if (window.innerWidth > 768) {
    paginacaoContainer.innerHTML = "";
    return;
  }

  const produtos = carrosselWrapper.querySelectorAll(".produto");
  const produtosVisiveis = Math.floor(
    carrosselContainer.offsetWidth / produtoLargura
  );
  const totalPaginas = Math.ceil(produtos.length / (produtosVisiveis || 1));

  paginacaoContainer.innerHTML = "";

  for (let i = 0; i < totalPaginas; i++) {
    const bolinha = document.createElement("span");
    bolinha.classList.add("bolinha");
    if (i === 0) bolinha.classList.add("ativa");
    paginacaoContainer.appendChild(bolinha);
  }
}

// Atualiza bolinhas da paginação no scroll
function atualizarBolinhasPorScroll() {
  if (window.innerWidth > 768) return;

  const scrollEsquerda = carrosselWrapper.scrollLeft;
  const paginaAtual = Math.round(scrollEsquerda / (produtoLargura + 10));
  const bolinhas = paginacaoContainer.querySelectorAll(".bolinha");

  bolinhas.forEach((bolinha, index) => {
    bolinha.classList.toggle("ativa", index === paginaAtual);
  });
}

// Cria os 5 indicadores de página fixos
function criarIndicadores() {
  indicadoresContainer.innerHTML = "";
  for (let i = 0; i < totalIndicadores; i++) {
    const dot = document.createElement("div");
    dot.classList.add("indicador");
    if (i === 0) dot.classList.add("ativo");
    indicadoresContainer.appendChild(dot);
  }
}

// Atualiza indicadores de página fixos (mobile)
function atualizarIndicadoresMobile() {
  if (window.innerWidth > 768) return;

  const scrollLeft = carrosselWrapper.scrollLeft;
  const index =
    Math.round(scrollLeft / (produtoLargura + 10)) % totalIndicadores;

  indicadoresContainer.querySelectorAll(".indicador").forEach((dot, i) => {
    dot.classList.toggle("ativo", i === index);
  });
}

// Scroll com debounce para centralizar
let scrollTimer;
carrosselWrapper.addEventListener("scroll", () => {
  atualizarBolinhasPorScroll();
  atualizarIndicadoresMobile();

  if (window.innerWidth <= 768) {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      centralizarProduto();
    }, 100);
  }
});

// Redimensionamento
window.addEventListener("resize", () => {
  atualizarProdutoLargura();
  atualizarCarrossel();
  atualizarPaginacao();
  criarIndicadores();
});

// Inicialização
window.addEventListener("load", () => {
  atualizarProdutoLargura();
  atualizarCarrossel();
  atualizarPaginacao();
  criarIndicadores();
});

/* ---------- CARRINHO LÓGICA ---------- */
const carrinho = []; // array de itens
let totalCarrinho = 0; // soma dos valores

// referência ao ícone flutuante já existente
const iconeCarrinho = document.querySelector(".carrinho");

// cria / anexa o contador só se ainda não existir
let contadorEl = iconeCarrinho.querySelector(".carrinho-contador");
if (!contadorEl) {
  contadorEl = document.createElement("span");
  contadorEl.id = "contador-carrinho";
  contadorEl.className = "carrinho-contador";
  contadorEl.style.display = "none";
  contadorEl.textContent = "0";
  iconeCarrinho.appendChild(contadorEl);
}

// Função auxiliar - converte "R$ 129,90" → 129.90
function parsePreco(precoStr) {
  return parseFloat(
    precoStr
      .replace(/[^\d,.-]/g, "") // remove 'R$' e espaços
      .replace(".", "") // remove separador milhar
      .replace(",", ".")
  ); // vírgula → ponto
}

// Adiciona listeners a TODOS os botões dentro de .produto
function prepararBotoesCompra() {
  document.querySelectorAll(".produto button").forEach((botao) => {
    botao.addEventListener("click", () => {
      const produtoEl = botao.closest(".produto");

      const nome = produtoEl.querySelector("h3")?.innerText.trim() || "Item";
      const precoTxt = produtoEl.querySelector("span")?.innerText || "R$ 0,00";
      const preco = parsePreco(precoTxt);

      carrinho.push({ nome, preco });
      totalCarrinho += preco;

      // Atualiza UI
      contadorEl.textContent = carrinho.length;
      contadorEl.style.display = carrinho.length ? "block" : "none";

      console.log(`Adicionado: ${nome} – R$ ${preco.toFixed(2)}`);
      console.log(`Total atual: R$ ${totalCarrinho.toFixed(2)}`);
    });
  });
}

// Aciona quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", prepararBotoesCompra);

const carrinhoFlutuante = document.getElementById("carrinhoFlutuante");
const carrinhoDetalhes = document.getElementById("carrinhoDetalhes");
const fecharCarrinho = document.getElementById("fecharCarrinho");

carrinhoFlutuante.addEventListener("click", () => {
  carrinhoDetalhes.classList.toggle("ativo");
});

fecharCarrinho.addEventListener("click", () => {
  carrinhoDetalhes.classList.remove("ativo");
});
