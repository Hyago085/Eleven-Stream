let cardcontainer = document.querySelector(".card-container");
let campoBusca = document.querySelector("#busca");
let todosOsTitulos = [];
let dadosCarregados = null; // Variável para armazenar os dados carregados

async function carregarDados() {
    // Se os dados já foram carregados, não faz nada.
    if (dadosCarregados) return dadosCarregados;

    try {
        const resposta = await fetch("data.json");
        dadosCarregados = await resposta.json();
        // Transforma o objeto de dados aninhado em um array plano de filmes e séries
        todosOsTitulos = Object.keys(dadosCarregados).flatMap(servico => {
            const servicoData = dadosCarregados[servico];
            const filmes = servicoData.movies.map(movie => ({ ...movie, type: 'Filme', service: servico }));
            const series = servicoData.series.map(serie => ({ ...serie, type: 'Série', service: servico }));
            return [...filmes, ...series];
        });
        return dadosCarregados;
    } catch (error) {
        console.error("Erro ao carregar os dados:", error);
    }
}

function iniciarBusca() {
    const termoBusca = campoBusca.value.toLowerCase();
    if (termoBusca.trim() === "") {
        cardcontainer.innerHTML = ""; // Limpa a tela se a busca for vazia
        return;
    }
    const dadosFiltrados = todosOsTitulos.filter(titulo =>
        titulo.title.toLowerCase().includes(termoBusca) ||
        titulo.genre.toLowerCase().includes(termoBusca)
    );
    renderizarCards(dadosFiltrados);
}

function renderizarCards(dados) {
    cardcontainer.innerHTML = ""; // Limpa os cards existentes
    for (let dado of dados) {
        let article = document.createElement("article");
        article.classList.add("card");
        article.innerHTML = `
        <h2>${dado.title}</h2>
                <p><strong>Serviço:</strong> ${dado.service}</p>
                <p><strong>Tipo:</strong> ${dado.type}</p>
                <p>${dado.rating}</p>
                <p>${dado.genre}</p>
                <a href="${dado.url}" target="_blank">Saiba mais</a>
        `;
        cardcontainer.appendChild(article);
    }
}

document.addEventListener("DOMContentLoaded", carregarDados);

// --- LÓGICA DA PÁGINA DE BUSCA ---
// Verifica se os elementos da busca existem antes de adicionar os eventos.
if (campoBusca && cardcontainer) {
    campoBusca.addEventListener('input', iniciarBusca);
}

// --- LÓGICA DAS PÁGINAS DE STREAMING ---
document.addEventListener('DOMContentLoaded', () => {
    const mainElement = document.querySelector('.streaming-page-main');
    
    // Se o elemento principal de streaming não existir, encerra a execução desta parte do código.
    // Isso garante que este bloco só rode nas páginas de streaming.
    if (!mainElement) {
        return;
    }

    const service = mainElement.dataset.streamingService;
    if (!service) {
        console.error('Atributo data-streaming-service não definido.');
        return;
    }

    const moviesList = document.getElementById('movies-list');
    const seriesList = document.getElementById('series-list');
    if (!moviesList || !seriesList) {
        console.error('Listas de filmes ou séries não encontradas.');
        return;
    }

    // Usamos uma função assíncrona para garantir que os dados já foram carregados
    const carregarListasStreaming = async () => {
        // Garante que os dados foram carregados antes de continuar.
        const data = await carregarDados();
        if (!data) return; // Se houver erro no carregamento, para a execução.

        const serviceData = data[service];
        if (serviceData) {
            populateList(moviesList, serviceData.movies);
            populateList(seriesList, serviceData.series);
        } else {
            console.error(`Dados para o serviço "${service}" não encontrados.`);
        }
    };
    
    carregarListasStreaming();
});

function populateList(listElement, items) {
    if (!items || items.length === 0) {
        listElement.innerHTML = '<li>Nenhum item encontrado.</li>';
        return;
    }

    listElement.innerHTML = items.map(item => `
        <li>
            <a href="${item.url}" target="_blank">
                <span class="title">${item.title}</span>
                <span class="details">${item.rating} | ${item.genre}</span>
            </a>
        </li>
    `).join('');
}